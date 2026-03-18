from collections import defaultdict
from datetime import datetime, timedelta

from fastapi import FastAPI, Request
from pydantic import BaseModel

try:
    from .predictor import predict_login
    from .utils import get_location, parse_user_agent
except ImportError:
    from predictor import predict_login
    from utils import get_location, parse_user_agent


app = FastAPI(title="TrustGov AI Security")

# In-memory user behaviour log: user_id -> list of (timestamp, ip, location, browser)
_user_log: dict[str, list[tuple]] = defaultdict(list)


def _get_behaviour(user_id: str, ip: str, location: str, browser: str):
    """Return (login_count_24h, unique_locations, unique_devices) for the user."""
    now = datetime.now()
    cutoff = now - timedelta(hours=24)

    # Evict entries older than 24 h
    _user_log[user_id] = [e for e in _user_log[user_id] if e[0] >= cutoff]

    recent = _user_log[user_id]
    login_count_24h = len(recent) + 1                                    # +1 for this attempt
    unique_locations = len({e[2] for e in recent} | {location})
    unique_devices   = len({e[3] for e in recent} | {browser})

    # Record this attempt
    _user_log[user_id].append((now, ip, location, browser))

    return login_count_24h, unique_locations, unique_devices


class LoginPayload(BaseModel):
    user_id: str


@app.post("/login")
async def login(payload: LoginPayload, request: Request):

    user_id = payload.user_id

    # Get IP
    ip = request.client.host if request.client else "127.0.0.1"

    # Get user-agent safely
    user_agent_string = request.headers.get("user-agent", "Unknown")

    browser, device = parse_user_agent(user_agent_string)

    # Get location safely
    try:
        location = get_location(ip)
    except Exception:
        location = "Unknown"

    hour = datetime.now().hour

    # Real behaviour features derived from in-memory per-user log
    login_count_24h, unique_locations, unique_devices = _get_behaviour(
        user_id, ip, location, browser
    )

    result = predict_login(
        ip=ip,
        request_type="POST",    # "POST" matches training vocabulary
        status_code=200,
        user_agent=browser,
        location=location,
        hour=hour,
        login_count_24h=login_count_24h,
        unique_locations=unique_locations,
        unique_devices=unique_devices,
    )

    status = "ANOMALY" if result["prediction"] == 1 else "SAFE"
    action = "MFA_REQUIRED" if result["prediction"] == 1 else "ALLOW_LOGIN"

    return {
        "user_id": user_id,
        "status": status,
        "risk_score": result["risk_score"],
        "action": action,
    }