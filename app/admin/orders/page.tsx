import type { Metadata } from 'next'
import { listOrders, isCommerceEnabled } from '@/lib/orders'
import { formatKes } from '@/lib/format'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'

export const metadata: Metadata = { robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

export default async function AdminOrdersPage() {
  if (!isCommerceEnabled()) {
    return (
      <Section>
        <Container>
          <h1 className="text-3xl font-extrabold">Orders</h1>
          <p className="mt-6 text-bone-dim">
            Commerce is not configured. Add the Paystack and Firebase environment
            variables to enable online orders.
          </p>
        </Container>
      </Section>
    )
  }

  const orders = await listOrders()

  return (
    <Section>
      <Container>
        <p className="eyebrow">Admin</p>
        <h1 className="mt-6 text-3xl font-extrabold">
          Orders <span className="text-bone-dim">({orders.length})</span>
        </h1>

        {orders.length === 0 ? (
          <p className="mt-10 text-bone-dim">No orders yet.</p>
        ) : (
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-gold-700/40">
                  <th scope="col" className="eyebrow py-3">Reference</th>
                  <th scope="col" className="eyebrow py-3">Status</th>
                  <th scope="col" className="eyebrow py-3">Customer</th>
                  <th scope="col" className="eyebrow py-3">Items</th>
                  <th scope="col" className="eyebrow py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.reference} className="border-b border-ink-600">
                    <td className="py-4 font-mono text-gold-300">{order.reference}</td>
                    <td className="py-4">
                      <span
                        className={
                          order.status === 'paid' ? 'text-gold-300' : 'text-bone-dim'
                        }
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4">
                      {order.customer.name}
                      <br />
                      <span className="text-bone-dim">{order.customer.phone}</span>
                      <br />
                      <span className="text-bone-dim">{order.customer.location}</span>
                    </td>
                    <td className="py-4 text-bone-dim">
                      {order.lines.map((line) => (
                        <div key={`${line.slug}-${line.variantId}`}>
                          {line.name} · {line.variantLabel} × {line.quantity}
                        </div>
                      ))}
                    </td>
                    <td className="py-4 text-right font-mono">
                      {formatKes(order.totalCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Container>
    </Section>
  )
}
