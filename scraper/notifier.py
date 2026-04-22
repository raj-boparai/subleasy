import os
from twilio.rest import Client

def get_twilio_client():
    return Client(os.environ['TWILIO_ACCOUNT_SID'], os.environ['TWILIO_AUTH_TOKEN'])

def build_message(listing: dict) -> str:
    market = 'Berkeley' if listing['market'] == 'berkeley' else 'Seattle'
    extras = []
    if listing.get('furnished'):
        extras.append('furnished')
    if listing.get('utilities_included'):
        extras.append('utils incl.')

    lines = [
        f"🏠 Subleasy match in {market}!",
        listing['title'],
        f"${listing['price']}/mo",
    ]
    if listing.get('available_start') and listing.get('available_end'):
        lines.append(f"{listing['available_start']} – {listing['available_end']}")
    if extras:
        lines.append(f"✓ {', '.join(extras)}")
    lines.append(f"→ {listing['url']}")
    lines.append("")
    lines.append("Reply STOP to unsubscribe.")
    return '\n'.join(lines)

def send_alert(phone: str, listing: dict) -> bool:
    try:
        client = get_twilio_client()
        message = build_message(listing)
        client.messages.create(
            body=message,
            from_=os.environ['TWILIO_PHONE_NUMBER'],
            to=phone
        )
        print(f"[Notifier] SMS sent to {phone[-4:]}**** for listing {listing['id']}")
        return True
    except Exception as e:
        print(f"[Notifier] SMS failed to {phone}: {e}")
        return False
