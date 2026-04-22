import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function sendSMS(to: string, message: string) {
  return client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
  })
}

export function buildAlertMessage(listing: {
  title: string
  price: number
  market: string
  available_start: string
  available_end: string
  furnished: boolean
  utilities_included: boolean
  url: string
}) {
  const market = listing.market === 'berkeley' ? 'Berkeley' : 'Seattle'
  const extras = [
    listing.furnished ? 'furnished' : null,
    listing.utilities_included ? 'utilities incl.' : null,
  ].filter(Boolean).join(', ')

  return [
    `🏠 Subleasy match in ${market}!`,
    `${listing.title}`,
    `$${listing.price}/mo · ${listing.available_start} – ${listing.available_end}`,
    extras ? `✓ ${extras}` : null,
    `→ ${listing.url}`,
    ``,
    `Reply STOP to unsubscribe.`,
  ].filter(s => s !== null).join('\n')
}
