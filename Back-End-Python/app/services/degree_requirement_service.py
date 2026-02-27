"""Mirrors Back-End/src/services/degreeRequirementService.js"""

from sqlalchemy import text
from sqlalchemy.orm import Session


def _map_requirement(r) -> dict:
    return {
        "requirement_id": int(r["requirement_id"]),
        "major_id": int(r["major_id"]) if r["major_id"] is not None else None,
        "major_name": r["major_name"] or None,
        "course_id": int(r["course_id"]) if r["course_id"] is not None else None,
        "course_code": r["course_code"] or None,
        "course_name": r["course_name"] or None,
        "requirement_type": r["requirement_type"],
        "is_required": r["is_required"],
        "credits": float(r["credits"]) if r["credits"] is not None else None,
    }


_BASE_SQL = """
SELECT dr.requirement_id, dr.major_id, dr.course_id, dr.requirement_type,
       dr.is_required, dr.credits, m.major_name, c.course_code, c.course_name
FROM degree_requirements dr
LEFT JOIN majors m ON m.major_id = dr.major_id
LEFT JOIN courses c ON c.course_id = dr.course_id
"""


def list_requirements(
    db: Session,
    major_id: int | None = None,
    course_id: int | None = None,
    requirement_type: str | None = None,
) -> list:
    where = []
    params: dict = {}

    if major_id:
        where.append("dr.major_id = :major_id")
        params["major_id"] = int(major_id)
    if course_id:
        where.append("dr.course_id = :course_id")
        params["course_id"] = int(course_id)
    if requirement_type:
        where.append("LOWER(dr.requirement_type) = :requirement_type")
        params["requirement_type"] = str(requirement_type).lower()

    where_sql = ("WHERE " + " AND ".join(where)) if where else ""
    rows = db.execute(
        text(f"{_BASE_SQL} {where_sql} ORDER BY dr.requirement_id DESC"), params
    ).mappings().all()
    return [_map_requirement(r) for r in rows]


def get_requirement_by_id(db: Session, requirement_id: int) -> dict | None:
    row = db.execute(
        text(f"{_BASE_SQL} WHERE dr.requirement_id = :rid"),
        {"rid": int(requirement_id)},
    ).mappings().first()
    return _map_requirement(row) if row else None


def create_requirement(db: Session, payload: dict) -> dict:
    db.execute(
        text(
            "INSERT INTO degree_requirements(major_id, course_id, requirement_type, is_required, credits) "
            "VALUES (:mid, :cid, :rtype, :req, :credits)"
        ),
        {
            "mid": int(payload["major_id"]) if payload.get("major_id") else None,
            "cid": int(payload["course_id"]) if payload.get("course_id") else None,
            "rtype": payload.get("requirement_type"),
            "req": bool(payload.get("is_required", True)),
            "credits": float(payload["credits"]) if payload.get("credits") is not None else None,
        },
    )
    row = db.execute(
        text("SELECT requirement_id FROM degree_requirements ORDER BY requirement_id DESC LIMIT 1")
    ).mappings().first()
    db.commit()
    return get_requirement_by_id(db, int(row["requirement_id"]))


def update_requirement(db: Session, requirement_id: int, payload: dict) -> dict | None:
    db.execute(
        text(
            "UPDATE degree_requirements SET major_id=:mid, course_id=:cid, "
            "requirement_type=:rtype, is_required=:req, credits=:credits "
            "WHERE requirement_id=:rid"
        ),
        {
            "mid": int(payload["major_id"]) if payload.get("major_id") else None,
            "cid": int(payload["course_id"]) if payload.get("course_id") else None,
            "rtype": payload.get("requirement_type"),
            "req": bool(payload.get("is_required", True)),
            "credits": float(payload["credits"]) if payload.get("credits") is not None else None,
            "rid": int(requirement_id),
        },
    )
    db.commit()
    return get_requirement_by_id(db, requirement_id)


def delete_requirement(db: Session, requirement_id: int) -> bool:
    result = db.execute(
        text("DELETE FROM degree_requirements WHERE requirement_id=:rid RETURNING requirement_id"),
        {"rid": int(requirement_id)},
    ).mappings().first()
    db.commit()
    return result is not None
