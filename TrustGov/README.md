# TrustGov AI Security

AI-assisted login anomaly detection service with a FastAPI backend.

## Project Structure

- `dataset/advanced_cybersecurity_data.csv`: training data
- `training/train_model.py`: model training script
- `models/threat_detection_model.pkl`: trained model bundle
- `backend/main.py`: API entrypoint
- `backend/predictor.py`: model loading + prediction
- `backend/feature_builder.py`: request-to-feature conversion
- `backend/utils.py`: user-agent and IP location helpers

## Setup

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Train model:

```bash
python training/train_model.py
```

3. Run backend:

```bash
uvicorn backend.main:app --reload
```

Server URL: `http://127.0.0.1:8000`

## Test API

POST `/login`

Request body:

```json
{
  "user_id": "user_123"
}
```

Example curl:

```bash
curl -X POST "http://127.0.0.1:8000/login" \
  -H "Content-Type: application/json" \
  -d "{\"user_id\":\"user_123\"}"
```
