import nodemailer, { type Transporter } from 'nodemailer'
import { site } from '@/content/site'
import type { EmailContent } from './emails'

export function isMailConfigured(): boolean {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD)
}

/** Where team notifications go. Defaults to the public contact address. */
export function teamInbox(): string {
  return process.env.MAIL_TO?.trim() || site.contact.email.trim()
}

let transporter: Transporter | undefined

/**
 * Created lazily, so importing this module with no credentials is harmless
 * and the site still builds and renders.
 */
function getTransporter(): Transporter {
  if (!isMailConfigured()) throw new Error('GMAIL_USER / GMAIL_APP_PASSWORD are not configured')
  transporter ??= nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  })
  return transporter
}

export async function sendMail(
  to: string,
  content: EmailContent,
  replyTo?: string,
): Promise<void> {
  await getTransporter().sendMail({
    // Gmail rewrites any other From address to the authenticated account.
    from: { name: site.name, address: process.env.GMAIL_USER! },
    to,
    replyTo,
    subject: content.subject,
    text: content.text,
    html: content.html,
  })
}
