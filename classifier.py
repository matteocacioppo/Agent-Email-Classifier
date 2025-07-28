import google.generativeai as genai

genai.configure(api_key="")

model = genai.GenerativeModel("gemini-2.5-pro")

MAX_LEN = 1000

def classifica_email(body):
    body = body[:MAX_LEN]
    prompt = f"""Put the email in one of these categories: general, appointment, job offer.
    Always reply with one of these words: general, appointment, job offer.

    Email:
    {body}
    """
    response = model.generate_content(prompt)
    return response.text.strip().lower()
