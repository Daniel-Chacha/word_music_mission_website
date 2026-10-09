import { NextResponse } from 'next/server'
import { site } from '@/content/site'
import { contactEmail, isValidEmail } from '@/lib/emails'
import { isMailConfigured, sendMail, teamInbox } from '@/lib/mail'

const MAX_FIELDS = 12
const MAX_LABEL = 60
const MAX_VALUE = 5000

export async function POST(request: Request) {
  const fallback = `Please email us at ${site.contact.email.trim()} instead.`

  if (!isMailConfigured()) {
    return NextResponse.json(
      { error: `This form is not available right now. ${fallback}` },
      { status: 503 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { preamble, fields, website } = (body ?? {}) as {
    preamble?: unknown
    fields?: unknown
    website?: unknown
  }

  // Honeypot: a hidden field people never see but form-filling bots do.
  // Pretend it worked so the bot has nothing to learn from.
  if (typeof website === 'string' && website !== '') {
    return NextResponse.json({ ok: true })
  }

  if (
    typeof preamble !== 'string' ||
    preamble.trim() === '' ||
    preamble.length > MAX_LABEL ||
    typeof fields !== 'object' ||
    fields === null
  ) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const entries = Object.entries(fields as Record<string, unknown>)
    .slice(0, MAX_FIELDS)
    .filter((entry): entry is [string, string] => typeof entry[1] === 'string')
    .map(([label, value]) => [label.slice(0, MAX_LABEL), value.slice(0, MAX_VALUE)])
  const clean = Object.fromEntries(entries) as Record<string, string>

  if (Object.values(clean).every((value) => value.trim() === '')) {
    return NextResponse.json({ error: 'Please fill in the form.' }, { status: 400 })
  }

  // Replying to the email answers the sender directly, when they gave an address.
  const replyTo = Object.values(clean).find((value) => isValidEmail(value.trim()))?.trim()

  try {
    await sendMail(teamInbox(), contactEmail(preamble.trim(), clean), replyTo)
  } catch (cause) {
    console.error('Contact email failed', cause)
    return NextResponse.json(
      { error: `We could not send your message. Please try again. ${fallback}` },
      { status: 502 },
    )
  }

  return NextResponse.json({ ok: true })
}
