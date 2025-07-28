from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import timedelta
import dateparser
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from read_emails import read_email_content, get_unread_emails, get_service
from classifier import classifica_email
from fastapi.responses import JSONResponse
from fastapi import status

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EmailData(BaseModel):
    sender: str
    body: str
    category: str

@app.get("/emails")
def get_emails():
    print("Call to /emails received")
    service = get_service()
    print("Service obtained")

    messages = get_unread_emails(service, max_results=3)
    print(f"Email found: {len(messages)}")

    results = []

    for msg in messages:
        sender, subject, body = read_email_content(service, msg['id'])
        category = classifica_email(body)
        results.append({
            "sender": sender,
            "subject": subject,
            "category": category
        })


    print("All emails processed")
    return results

class CalendarData(BaseModel):
    subject: str
    body: str
    sender: str

@app.post("/add-to-calendar")
def add_to_calendar(data: CalendarData):
    print(f"Request to add event: Subject={data.subject}, Sender={data.sender}")

    date = dateparser.parse(data.body, settings={'PREFER_DATES_FROM': 'future'})
    if not date:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error": "Date and time not found in the body of the email."}
    )

    creds = Credentials.from_authorized_user_file("token.json", ["https://www.googleapis.com/auth/calendar"])
    service = build("calendar", "v3", credentials=creds)

    event = {
        "summary": data.subject,
        "description": data.body,
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
    return {
        "status": "ok",
        "eventLink": created_event.get("htmlLink"),
        "date": date.isoformat()
    }