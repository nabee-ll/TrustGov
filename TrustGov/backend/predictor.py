import joblib
import numpy as np
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[1]
MODEL_PATH = ROOT_DIR / "models" / "threat_detection_model.pkl"

# load trained model bundle
data = joblib.load(MODEL_PATH)

model = data["model"]
encoders = data["encoders"]
feature_columns = data.get("feature_columns", [])

# Probability threshold — lower than the default 0.5 to be more sensitive
# to anomalies given the dataset's ~5 % anomaly rate.
ANOMALY_THRESHOLD = 0.30

# Locations that should always be treated as anomalous regardless of ML score.
HIGH_RISK_LOCATIONS = {"north korea", "northkorea"}

DEFAULT_FEATURE_COLUMNS = [
    "IP_Address",
    "Request_Type",
    "Status_Code",
    "User_Agent",
    "Location",
    "Hour",
    "login_count_24h",
    "unique_locations",
    "unique_devices",
]


def encode_value(encoder, value):
    """Safely encode categorical value."""

    value = str(value)

    if value not in encoder.classes_:
        # fallback to first known class instead of modifying encoder
        return encoder.transform([encoder.classes_[0]])[0]

    return encoder.transform([value])[0]


def predict_login(
    ip,
    request_type,
    status_code,
    user_agent,
    location,
    hour,
    login_count_24h,
    unique_locations,
    unique_devices,
):
    # --- Rule-based fast-path checks ---
    if location.lower().replace(" ", "") in HIGH_RISK_LOCATIONS:
        return {"prediction": 1, "risk_score": 100.0}

    # Heavy behavioural anomaly signals
    if login_count_24h >= 10 or unique_locations >= 4 or unique_devices >= 4:
        # Still run the model so the risk_score is meaningful, but guarantee flag
        forced_anomaly = True
    else:
        forced_anomaly = False

    # --- ML prediction ---
    ip_enc = encode_value(encoders["IP_Address"], ip)
    req_enc = encode_value(encoders["Request_Type"], request_type)
    agent_enc = encode_value(encoders["User_Agent"], user_agent)
    loc_enc = encode_value(encoders["Location"], location)

    encoded_by_column = {
        "IP_Address": ip_enc,
        "Request_Type": req_enc,
        "Status_Code": int(status_code),
        "User_Agent": agent_enc,
        "Location": loc_enc,
        "Hour": int(hour),
        "login_count_24h": int(login_count_24h),
        "unique_locations": int(unique_locations),
        "unique_devices": int(unique_devices),
    }

    # Use the saved training schema whenever available.
    columns = feature_columns or DEFAULT_FEATURE_COLUMNS
    features = [encoded_by_column.get(col, 0) for col in columns]

    # Final safety net for legacy bundles with mismatched metadata.
    expected_n_features = getattr(model, "n_features_in_", None)
    if isinstance(expected_n_features, int) and len(features) != expected_n_features:
        features = features[:expected_n_features] + [0] * max(0, expected_n_features - len(features))

    probability = model.predict_proba([features])[0][1]

    # Apply lower sensitivity threshold instead of the default 0.5
    prediction = 1 if (forced_anomaly or probability >= ANOMALY_THRESHOLD) else 0

    return {
        "prediction": int(prediction),
        "risk_score": round(probability * 100, 2),
    }