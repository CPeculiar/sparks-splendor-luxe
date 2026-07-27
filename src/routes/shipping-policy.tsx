import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/shipping-policy")({
  component: ShippingPolicyPage,
});

function ShippingPolicyPage() {
  return (
    <>
      <section className="bg-onyx text-cream py-16 md:py-24">
        <div className="container-luxe text-center max-w-3xl mx-auto">
          <p className="text-eyebrow text-gold">Legal</p>
          <h1 className="font-serif-luxe text-4xl sm:text-5xl md:text-6xl mt-4">Shipping Policy</h1>
          <p className="mt-5 text-cream/75">How we deliver your bespoke pieces, wherever you are.</p>
        </div>
      </section>

      <section className="container-luxe py-16 md:py-24 max-w-3xl mx-auto prose prose-neutral">
        <div className="space-y-10 text-muted-foreground leading-relaxed">

          <div>
            <p className="text-xs text-muted-foreground tracking-[0.25em] uppercase mb-6">Last updated: June 2025</p>
            <p>
              Sparks & Splendour is a Lagos-based bespoke fashion house. We deliver our pieces
              to clients across Nigeria and internationally. This policy outlines our shipping
              methods, timelines, and associated terms.
            </p>
          </div>

          <PolicySection title="1. Order Processing">
            <p>
              All orders are processed within <strong>2–5 business days</strong> of payment
              confirmation. For bespoke and made-to-measure commissions, production timelines
              are communicated separately at the point of order.
            </p>
            <p className="mt-3">
              Orders placed on weekends or Nigerian public holidays are processed on the next
              available business day. You will receive an email confirmation with tracking
              details once your order has been dispatched.
            </p>
          </PolicySection>

          <PolicySection title="2. Domestic Shipping (Nigeria)">
            <table className="w-full text-sm border-collapse mt-3">
              <thead>
                <tr className="border-b border-border text-xs tracking-[0.2em] uppercase text-foreground">
                  <th className="text-left py-3 pr-4">Service</th>
                  <th className="text-left py-3 pr-4">Estimated Delivery</th>
                  <th className="text-left py-3">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <tr><td className="py-3 pr-4">Lagos (Same City)</td><td className="py-3 pr-4">1–3 business days</td><td className="py-3">₦3,000 – ₦5,000</td></tr>
                <tr><td className="py-3 pr-4">Other Nigerian States</td><td className="py-3 pr-4">3–7 business days</td><td className="py-3">₦5,000 – ₦10,000</td></tr>
                <tr><td className="py-3 pr-4">Free Shipping</td><td className="py-3 pr-4">3–7 business days</td><td className="py-3">On orders above ₦2,000,000</td></tr>
              </tbody>
            </table>
            <p className="mt-4">
              Clients in Lagos may also opt for a complimentary in-premium collection at
              2b Baale Street, Lafiaji Off Buena Estate Orchid Road, Lekki, Lagos State, Nigeria, during business hours
              (Monday – Saturday, 10am – 7pm).
            </p>
          </PolicySection>

          <PolicySection title="3. International Shipping">
            <p>
              We ship worldwide. International orders are shipped via DHL Express or
              FedEx International Priority.
            </p>
            <table className="w-full text-sm border-collapse mt-3">
              <thead>
                <tr className="border-b border-border text-xs tracking-[0.2em] uppercase text-foreground">
                  <th className="text-left py-3 pr-4">Region</th>
                  <th className="text-left py-3 pr-4">Estimated Delivery</th>
                  <th className="text-left py-3">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <tr><td className="py-3 pr-4">West Africa</td><td className="py-3 pr-4">3–5 business days</td><td className="py-3">From $30 USD</td></tr>
                <tr><td className="py-3 pr-4">Europe & UK</td><td className="py-3 pr-4">5–10 business days</td><td className="py-3">From $60 USD</td></tr>
                <tr><td className="py-3 pr-4">North America</td><td className="py-3 pr-4">5–10 business days</td><td className="py-3">From $70 USD</td></tr>
                <tr><td className="py-3 pr-4">Rest of World</td><td className="py-3 pr-4">7–14 business days</td><td className="py-3">From $80 USD</td></tr>
              </tbody>
            </table>
            <p className="mt-4">
              International orders above ₦500,000 (or equivalent) qualify for complimentary
              shipping. Exact shipping costs are calculated at checkout.
            </p>
          </PolicySection>

          <PolicySection title="4. Import Duties & Taxes">
            <p>
              International customers are responsible for any import duties, customs fees,
              or taxes levied by their country's customs authority. Sparks & Splendour has no
              control over these charges and cannot predict their amount. We recommend
              contacting your local customs office before placing an international order.
            </p>
          </PolicySection>

          <PolicySection title="5. Order Tracking">
            <p>
              Once your order is dispatched, you will receive a tracking number via email.
              You can use this number to track your shipment directly on the carrier's website.
              If you do not receive tracking information within 5 business days of your order
              confirmation, please contact us at{" "}
              <a href="mailto:support@sparksandsplendour.com" className="text-gold-deep underline">
                support@sparksandsplendour.com
              </a>.
            </p>
          </PolicySection>

          <PolicySection title="6. Damaged or Lost Shipments">
            <p>
              If your order arrives damaged, please photograph the packaging and item(s)
              immediately and contact us within <strong>48 hours</strong> of delivery. We will
              work with the courier to resolve the matter promptly, including replacement or
              refund as appropriate.
            </p>
            <p className="mt-3">
              For lost shipments, please allow the full estimated delivery window to pass before
              contacting us. We will open an investigation with the carrier on your behalf.
            </p>
          </PolicySection>

          <PolicySection title="7. Bespoke & Made-to-Measure Orders">
            <p>
              Bespoke commissions are handcrafted in our Lagos atelier and typically require
              <strong> 4–8 weeks</strong> for production, depending on the complexity of the
              piece. Production timelines are confirmed at the time of your consultation.
              Bespoke pieces are shipped using our express courier service once complete.
            </p>
          </PolicySection>

          <PolicySection title="8. Contact Us">
            <p>
              For any shipping-related queries, please reach us via:
            </p>
            <ul className="mt-3 space-y-1 list-none pl-0">
              <li>Email: <a href="mailto:support@sparksandsplendour.com" className="text-gold-deep underline">support@sparksandsplendour.com</a></li>
              <li>Phone: <a href="tel:+2348137037919" className="text-gold-deep underline">+234 905 357 2403</a></li>
              <li>WhatsApp: <a href="https://wa.me/2348137037919" className="text-gold-deep underline" target="_blank" rel="noopener noreferrer">+234 905 357 2403</a></li>
              <li>Address: 2b Baale Street, Lafiaji Off Buena Estate Orchid Road, Lekki, Lagos State, Nigeria, Nigeria</li>
            </ul>
          </PolicySection>

        </div>
      </section>
    </>
  );
}

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-2xl text-foreground mb-3">{title}</h2>
      <div className="text-muted-foreground leading-relaxed">{children}</div>
    </div>
  );
}
