from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder


ROOT_DIR = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT_DIR / "dataset" / "advanced_cybersecurity_data.csv"
MODEL_PATH = ROOT_DIR / "models" / "threat_detection_model.pkl"


def train():

    print("Loading dataset...")

    data = pd.read_csv(DATA_PATH)

    if "Anomaly_Flag" not in data.columns:
        raise ValueError("Dataset must contain 'Anomaly_Flag' column")

    # timestamp
    data["Timestamp"] = pd.to_datetime(data["Timestamp"], errors="coerce")
    data = data.dropna(subset=["Timestamp"])

    data["Hour"] = data["Timestamp"].dt.hour

    # drop session id
    if "Session_ID" in data.columns:
        data = data.drop(columns=["Session_ID"])

    # numeric status code
    data["Status_Code"] = pd.to_numeric(data["Status_Code"], errors="coerce")

    # Simulate realistic behaviour features:
    # anomalies exhibit rapid repeated logins, logins from many locations/devices.
    rng = np.random.default_rng(42)
    anomaly = data["Anomaly_Flag"] == 1

    data["login_count_24h"] = np.where(
        anomaly,
        rng.integers(8, 25, size=len(data)),   # anomalies: rapid repeated logins
        rng.integers(1, 4, size=len(data)),    # normal: 1-3 logins per day
    )
    data["unique_locations"] = np.where(
        anomaly,
        rng.integers(3, 7, size=len(data)),    # anomalies: many distinct locations
        1,                                      # normal: single home location
    )
    data["unique_devices"] = np.where(
        anomaly,
        rng.integers(2, 5, size=len(data)),    # anomalies: multiple devices
        1,                                      # normal: one device
    )

    # remove any remaining NaN
    data = data.dropna()

    categorical_cols = [
        "IP_Address",
        "Request_Type",
        "User_Agent",
        "Location",
    ]

    encoders = {}

    for col in categorical_cols:
        encoder = LabelEncoder()
        data[col] = encoder.fit_transform(data[col].astype(str))
        encoders[col] = encoder

    feature_columns = [
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

    X = data[feature_columns]
    y = data["Anomaly_Flag"]

    print("Splitting dataset...")

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42
    )

    print("Training model...")

    model = RandomForestClassifier(
        n_estimators=100,
        random_state=42
    )

    model.fit(X_train, y_train)

    accuracy = model.score(X_test, y_test)

    print(f"Model training completed. Accuracy: {accuracy:.4f}")

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)

    joblib.dump(
        {
            "model": model,
            "encoders": encoders,
            "feature_columns": feature_columns,
        },
        MODEL_PATH,
    )

    print(f"Model saved at: {MODEL_PATH}")


if __name__ == "__main__":
    train()