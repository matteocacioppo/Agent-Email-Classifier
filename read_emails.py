from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
import base64
import email
from bs4 import BeautifulSoup


SCOPES = [
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/calendar'
]

def get_service():
    creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    return build('gmail', 'v1', credentials=creds)

def get_unread_emails(service, max_results=100):
    messages = []
    response = service.users().messages().list(userId='me', q='is:unread', maxResults=100).execute()

    if 'messages' in response:
        messages.extend(response['messages'])

    while 'nextPageToken' in response and len(messages) < max_results:
        page_token = response['nextPageToken']
        response = service.users().messages().list(userId='me', q='is:unread', maxResults=100, pageToken=page_token).execute()
        if 'messages' in response:
            messages.extend(response['messages'])

    return messages[:max_results]


def read_email_content(service, msg_id):
    msg = service.users().messages().get(userId='me', id=msg_id, format='full').execute()
    headers = msg['payload']['headers']

    sender = ''
    subject = ''

    for h in headers:
        if h['name'] == 'From':
            sender = h['value']
        elif h['name'] == 'Subject':
            subject = h['value']

    payload = msg['payload']
    body = ""

    if 'parts' in payload:
        for part in payload['parts']:
            mime_type = part.get('mimeType')
            data = part['body'].get('data')
            if data:
                decoded = base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')

                if mime_type == 'text/plain':
                    body = decoded
                    break
                elif mime_type == 'text/html' and not body:
                    soup = BeautifulSoup(decoded, 'html.parser')
                    body = soup.get_text()
    else:
        data = payload['body'].get('data')
        if data:
            decoded = base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
            body = decoded

    if not body:
        body = "(content not found)"

    return sender, subject, body.strip()


if __name__ == '__main__':
    service = get_service()
    messages = get_unread_emails(service)
