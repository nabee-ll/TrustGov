from pathlib import Path
from typing import Any

import joblib


ROOT_DIR = Path(__file__).resolve().parents[1]
MODEL_PATH = ROOT_DIR / "models" / "threat_detection_model.pkl"

bundle = joblib.load(MODEL_PATH) if MODEL_PATH.exists() else None
encoders: dict[str, Any] = bundle["encoders"] if bundle else {}


def _encode_value(column: str, value: str) -> int:
    encoder = encoders.get(column)

    if encoder is None:
        return 0

    value = str(value)

    if value in encoder.classes_:
        return int(encoder.transform([value])[0])

    # unseen values fallback
    return 0


def build_features(
    ip: str,
    request_type: str,
    status_code: int,
    user_agent: str,
    location: str,
    hour: int,
    login_count_24h: int,
    unique_locations: int,
    unique_devices: int,
) -> list[int]:

    return [
        _encode_value("IP_Address", ip),
        _encode_value("Request_Type", request_type),
        int(status_code),
        _encode_value("User_Agent", user_agent),
        _encode_value("Location", location),
        int(hour),
        int(login_count_24h),
        int(unique_locations),
        int(unique_devices),
    ]