from user_agents import parse
import requests


def parse_user_agent(user_agent_string: str | None) -> tuple[str, str]:
    if not user_agent_string:
        return "unknown", "unknown"

    ua = parse(user_agent_string)
    browser = ua.browser.family or "unknown"
    device = ua.device.family or "unknown"
    return browser, device


def get_location(ip: str) -> str:
    try:
        response = requests.get(f"https://ipapi.co/{ip}/json/", timeout=3)
        response.raise_for_status()
        data = response.json()
        return data.get("city", "unknown") or "unknown"
    except Exception:
        return "unknown"
