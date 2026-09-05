import type { Metadata } from 'next'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { Field } from '@/components/ui/Field'

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function AdminLoginPage(props: PageProps<'/admin/login'>) {
  const { error } = await props.searchParams

  return (
    <Section>
      <Container className="max-w-md">
        <p className="eyebrow">Admin</p>
        <h1 className="mt-6 text-3xl font-extrabold">Sign in</h1>

        {error && (
          <p role="alert" className="mt-6 text-sm text-blood-bright">
            That password was not correct.
          </p>
        )}

        <form method="POST" action="/api/admin/login" className="mt-10">
          <Field label="Password" name="password" type="password" required />
          <button
            type="submit"
            className="mt-8 w-full bg-gold-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-ink-900"
          >
            Sign in
          </button>
        </form>
      </Container>
    </Section>
  )
}
