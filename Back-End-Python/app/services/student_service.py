"""Mirrors Back-End/src/services/studentService.js"""

from passlib.context import CryptContext
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.services import auth_security_service
from app.utils.mappers import to_api_classification, to_db_classification, normalize_standing

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _map_student_row(r) -> dict:
    return {
        "student_id": int(r["student_id"]),
        "user_id": int(r["user_id"]),
        "student_number": r["student_number"],
        "first_name": r["first_name"],
        "last_name": r["last_name"],
        "email": r["email"],
        "classification": to_api_classification(r["classification"]),
        "major_name": r["major_name"] or "Undeclared",
        "gpa": float(r["gpa"] or 0),
        "academic_standing": str(r["academic_standing"] or "good").capitalize(),
        "credits_earned": int(r["credits_earned"] or 0),
        "admission_date": r["admission_date"],
        "created_at": r["created_at"],
        "updated_at": r["updated_at"],
        "user": {"first_name": r["first_name"], "last_name": r["last_name"], "email": r["email"]},
        "major": {"major_name": r["major_name"] or "Undeclared"},
    }


_BASE_SQL = """
SELECT s.student_id, s.user_id, s.student_number, s.classification,
       s.admission_date, s.credits_earned, s.gpa, s.academic_standing,
       u.first_name, u.last_name, u.email, u.created_at, u.updated_at,
       m.major_name
FROM students s
JOIN users u ON u.user_id = s.user_id
LEFT JOIN majors m ON m.major_id = s.major_id
"""


def list_students(db: Session, search: str | None = None, limit: int | None = None, student_id: int | None = None) -> list:
    where_clauses = []
    params: dict = {}

    if student_id is not None:
        where_clauses.append("s.student_id = :student_id")
        params["student_id"] = int(student_id)

    if search:
        where_clauses.append(
            "(LOWER(u.first_name || ' ' || u.last_name) LIKE :search "
            "OR LOWER(u.email) LIKE :search "
            "OR LOWER(s.student_number) LIKE :search "
            "OR LOWER(COALESCE(m.major_name,'')) LIKE :search)"
        )
        params["search"] = f"%{str(search).lower()}%"

    where_sql = ("WHERE " + " AND ".join(where_clauses)) if where_clauses else ""
    limit_sql = "LIMIT :limit" if limit else ""
    if limit:
        params["limit"] = int(limit)

    rows = db.execute(
        text(f"{_BASE_SQL} {where_sql} ORDER BY s.student_id DESC {limit_sql}"),
        params,
    ).mappings().all()

    return [_map_student_row(r) for r in rows]


def get_student_by_id(db: Session, student_id: int) -> dict | None:
    rows = db.execute(
        text(f"{_BASE_SQL} WHERE s.student_id = :sid"),
        {"sid": int(student_id)},
    ).mappings().all()

    if not rows:
        return None
    r = rows[0]
    mapped = _map_student_row(r)
    mapped["classification_label"] = r["classification"]
    return mapped


def _find_major_id(db: Session, payload: dict) -> int | None:
    if payload.get("major_id"):
        return int(payload["major_id"])
    if not payload.get("major_name"):
        return None
    row = db.execute(
        text("SELECT major_id FROM majors WHERE LOWER(major_name) = LOWER(:name) LIMIT 1"),
        {"name": str(payload["major_name"]).strip()},
    ).mappings().first()
    return int(row["major_id"]) if row else None


def create_student(db: Session, payload: dict) -> dict:
    normalized_email = str(payload.get("email", "")).strip().lower()

    existing = db.execute(
        text("SELECT user_id FROM users WHERE LOWER(email) = LOWER(:email) LIMIT 1"),
        {"email": normalized_email},
    ).mappings().first()
    if existing:
        err = ValueError("Email already exists")
        err.status_code = 409  # type: ignore[attr-defined]
        raise err

    password_hash = pwd_context.hash(str(payload.get("password", "")))

    db.execute(
        text(
            "INSERT INTO users(email, password_hash, role, first_name, last_name, is_active) "
            "VALUES (:email, :hash, 'student', :first, :last, true)"
        ),
        {
            "email": normalized_email,
            "hash": password_hash,
            "first": str(payload.get("first_name", "")).strip(),
            "last": str(payload.get("last_name", "")).strip(),
        },
    )

    user_row = db.execute(
        text("SELECT user_id, first_name, last_name, email FROM users WHERE LOWER(email) = LOWER(:email) LIMIT 1"),
        {"email": normalized_email},
    ).mappings().first()

    user_id = int(user_row["user_id"])
    major_id = _find_major_id(db, payload)

    student_number = payload.get("student_number") or f"STU{str(user_id).zfill(6)}"

    db.execute(
        text(
            "INSERT INTO students(user_id, student_number, classification, major_id, admission_date, "
            "credits_earned, gpa, academic_standing, advisor_id) "
            "VALUES (:uid, :snum, :cls, :mid, :adm, :cred, :gpa, :standing, :adv)"
        ),
        {
            "uid": user_id,
            "snum": student_number,
            "cls": to_db_classification(payload.get("classification", 1)),
            "mid": major_id,
            "adm": payload.get("admission_date"),
            "cred": int(payload.get("credits_earned", 0)),
            "gpa": float(payload.get("gpa", 0)),
            "standing": normalize_standing(payload.get("academic_standing", "good")),
            "adv": int(payload["advisor_id"]) if payload.get("advisor_id") else None,
        },
    )
    db.commit()

    auth_security_service.set_must_change_password(db, user_id, True)

    stu_row = db.execute(
        text("SELECT student_id FROM students WHERE user_id = :uid LIMIT 1"),
        {"uid": user_id},
    ).mappings().first()

    return get_student_by_id(db, int(stu_row["student_id"]))


def update_student(db: Session, student_id: int, payload: dict) -> dict | None:
    existing = get_student_by_id(db, student_id)
    if not existing:
        return None

    major_id = _find_major_id(db, payload)

    db.execute(
        text(
            "UPDATE users SET first_name = :first, last_name = :last, email = :email, updated_at = NOW() "
            "WHERE user_id = :uid"
        ),
        {
            "first": payload.get("first_name", existing["first_name"]),
            "last": payload.get("last_name", existing["last_name"]),
            "email": str(payload.get("email", existing["email"])).strip().lower(),
            "uid": existing["user_id"],
        },
    )

    db.execute(
        text(
            "UPDATE students SET student_number = :snum, classification = :cls, major_id = :mid, "
            "admission_date = :adm, credits_earned = :cred, gpa = :gpa, academic_standing = :standing "
            "WHERE student_id = :sid"
        ),
        {
            "snum": payload.get("student_number", existing["student_number"]),
            "cls": to_db_classification(payload.get("classification", existing["classification"])),
            "mid": major_id if payload.get("major_id") or payload.get("major_name") else None,
            "adm": payload.get("admission_date", existing["admission_date"]),
            "cred": int(payload.get("credits_earned", existing["credits_earned"])),
            "gpa": float(payload.get("gpa", existing["gpa"])),
            "standing": normalize_standing(payload.get("academic_standing", existing["academic_standing"])),
            "sid": int(student_id),
        },
    )
    db.commit()
    return get_student_by_id(db, student_id)


def delete_student(db: Session, student_id: int) -> bool:
    sid = int(student_id)

    row = db.execute(
        text("SELECT student_id, user_id FROM students WHERE student_id = :sid FOR UPDATE"),
        {"sid": sid},
    ).mappings().first()

    if not row:
        db.rollback()
        return False

    user_id = int(row["user_id"])

    db.execute(
        text(
            "DELETE FROM grades WHERE enrollment_id IN "
            "(SELECT enrollment_id FROM enrollments WHERE student_id = :sid)"
        ),
        {"sid": sid},
    )
    db.execute(text("DELETE FROM finance_records WHERE student_id = :sid"), {"sid": sid})
    db.execute(text("DELETE FROM pre_registered_courses WHERE student_id = :sid"), {"sid": sid})
    db.execute(text("DELETE FROM enrollments WHERE student_id = :sid"), {"sid": sid})
    db.execute(text("DELETE FROM students WHERE student_id = :sid"), {"sid": sid})
    db.execute(
        text(
            "DELETE FROM users WHERE user_id = :uid AND LOWER(role) = 'student' "
            "AND NOT EXISTS (SELECT 1 FROM students WHERE user_id = :uid) "
            "AND NOT EXISTS (SELECT 1 FROM faculty WHERE user_id = :uid)"
        ),
        {"uid": user_id},
    )
    db.commit()
    return True


def get_student_enrollments(db: Session, student_id: int) -> list:
    rows = db.execute(
        text(
            """
            SELECT e.enrollment_id, e.section_id, e.status, e.enrollment_date,
                   c.course_code, c.course_name, c.credits,
                   sem.semester_name, sem.semester_year
            FROM enrollments e
            JOIN class_sections cs ON cs.section_id = e.section_id
            JOIN courses c ON c.course_id = cs.course_id
            JOIN semesters sem ON sem.semester_id = cs.semester_id
            WHERE e.student_id = :sid
            ORDER BY e.enrollment_id DESC
            """
        ),
        {"sid": int(student_id)},
    ).mappings().all()

    return [
        {
            "enrollment_id": int(r["enrollment_id"]),
            "section_id": int(r["section_id"]),
            "status": r["status"],
            "enrollment_date": r["enrollment_date"],
            "course": {
                "course_code": r["course_code"],
                "course_name": r["course_name"],
                "credits": int(r["credits"] or 0),
            },
            "semester": {
                "semester_name": r["semester_name"],
                "semester_year": int(r["semester_year"]),
            },
        }
        for r in rows
    ]
