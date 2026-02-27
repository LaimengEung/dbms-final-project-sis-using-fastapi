# Utility helpers that mirror Back-End/src/utils/mappers.js


def to_db_role(role: str) -> str:
    """API role ('teacher') → DB role ('faculty')."""
    normalized = str(role or "student").lower()
    return "faculty" if normalized == "teacher" else normalized


def to_api_role(role: str) -> str:
    """DB role ('faculty') → API role ('teacher')."""
    normalized = str(role or "").lower()
    return "teacher" if normalized == "faculty" else normalized


_CLASSIFICATION_MAP = {
    "1": "freshman",
    "2": "sophomore",
    "3": "junior",
    "4": "senior",
    "freshman": "freshman",
    "sophomore": "sophomore",
    "junior": "junior",
    "senior": "senior",
}

_API_CLASSIFICATION_MAP = {
    "freshman": 1,
    "sophomore": 2,
    "junior": 3,
    "senior": 4,
}

_VALID_STANDINGS = {"good", "probation", "suspended", "dismissed"}


def to_db_classification(value) -> str:
    return _CLASSIFICATION_MAP.get(str(value).lower(), "freshman")


def to_api_classification(value) -> int:
    return _API_CLASSIFICATION_MAP.get(str(value or "").lower(), 1)


def normalize_standing(value: str) -> str:
    normalized = str(value or "good").lower()
    return normalized if normalized in _VALID_STANDINGS else "good"


def normalize_role(role: str) -> str:
    """Normalise 'faculty' → 'teacher' for RBAC comparison."""
    value = str(role or "").lower()
    return "teacher" if value == "faculty" else value
