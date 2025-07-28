from flask import Flask, request, jsonify
import dateparser
from datetime import timedelta
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

app = Flask(__name__)

@app.route("/add-to-calendar", methods=["POST"])
def create_event():
    data = request.json
    subject = data.get("subject")
    body = data.get("body")

    date = dateparser.parse(body, settings={'PREFER_DATES_FROM': 'future'})
    if not date:
        return jsonify({"error": "Date not found"}), 400

    creds = Credentials.from_authorized_user_file("token.json", ["https://www.googleapis.com/auth/calendar"])

    service = build("calendar", "v3", credentials=creds)

    event = {
        "summary": subject,
        "description": body,
        "start": {
            "dateTime": date.isoformat(),
            "timeZone": "Europe/Rome",
        },
        "end": {
            "dateTime": (date + timedelta(hours=1)).isoformat(),
            "timeZone": "Europe/Rome",
        },
    }

    created_event = service.events().insert(calendarId="primary", body=event).execute()

    return jsonify({
    "status": "ok",
    "eventLink": created_event.get("htmlLink"),
    "date": date.isoformat()
})

