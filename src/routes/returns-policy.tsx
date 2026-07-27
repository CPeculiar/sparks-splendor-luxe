import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/returns-policy")({
  component: ReturnsPolicyPage,
});

function ReturnsPolicyPage() {
  return (
    <>
      <section className="bg-onyx text-cream py-16 md:py-24">
        <div className="container-luxe text-center max-w-3xl mx-auto">
          <p className="text-eyebrow text-gold">Legal</p>
          <h1 className="font-serif-luxe text-4xl sm:text-5xl md:text-6xl mt-4">Returns & Refund Policy</h1>
          <p className="mt-5 text-cream/75">Our commitment to your satisfaction, clearly stated.</p>
        </div>
      </section>

      <section className="container-luxe py-16 md:py-24 max-w-3xl mx-auto">
        <div className="space-y-10 text-muted-foreground leading-relaxed">

          <div>
            <p className="text-xs text-muted-foreground tracking-[0.25em] uppercase mb-6">Last updated: June 2025</p>
            <p>
              At Sparks & Splendour, every piece is crafted with the highest standards of
              quality and artisanship. We want you to be completely satisfied with your
              purchase. This policy outlines the conditions under which returns, exchanges,
              and refunds are accepted.
            </p>
          </div>

          <PolicySection title="1. Return Eligibility">
            <p>We accept returns on <strong>ready-to-wear items</strong> under the following conditions:</p>
            <ul className="mt-3 space-y-2 pl-4 list-disc">
              <li>The return request is made within <strong>14 days</strong> of the delivery date.</li>
              <li>The item is unworn, unwashed, and in its original condition with all tags attached.</li>
              <li>The item is returned in its original packaging.</li>
              <li>Proof of purchase (order confirmation email or receipt) is provided.</li>
            </ul>
            <p className="mt-4">
              Items that show signs of wear, alteration, damage, or missing tags will not be
              accepted for return.
            </p>
          </PolicySection>

          <PolicySection title="2. Non-Returnable Items">
            <p>The following items are <strong>non-returnable and non-refundable</strong>:</p>
            <ul className="mt-3 space-y-2 pl-4 list-disc">
              <li>Bespoke and made-to-measure commissions (custom-made to your specifications).</li>
              <li>Items purchased on sale or with a promotional discount.</li>
              <li>Items that have been altered, embroidered, or personalised after purchase.</li>
              <li>Accessories (pocket squares, ties, cufflinks) for hygiene reasons.</li>
            </ul>
          </PolicySection>

          <PolicySection title="3. How to Initiate a Return">
            <p>To begin a return, please follow these steps:</p>
            <ol className="mt-3 space-y-3 pl-4 list-decimal">
              <li>
                Contact us within 14 days of delivery at{" "}
                <a href="mailto:support@sparksandsplendour.com" className="text-gold-deep underline">
                  support@sparksandsplendour.com
                </a>{" "}
                or via WhatsApp at{" "}
                <a href="https://wa.me/2349053572403" className="text-gold-deep underline" target="_blank" rel="noopener noreferrer">
                  +234 905 357 2403
                </a>.
              </li>
              <li>Provide your order number, item(s) to be returned, and reason for return.</li>
              <li>Our team will review your request and respond within <strong>2 business days</strong> with a Return Authorisation Number (RAN) and return instructions.</li>
              <li>Package the item securely in its original packaging and include the RAN inside the parcel.</li>
              <li>Ship the item to our Office: <strong>2b Baale Street, Lafiaji Off Buena Estate Orchid Road,
                  Lekki, Lagos State, Nigeria</strong>.</li>
            </ol>
            <p className="mt-4 text-sm italic">
              Please do not send items back without first obtaining a Return Authorisation Number.
              Unauthorised returns will not be processed.
            </p>
          </PolicySection>

          <PolicySection title="4. Return Shipping Costs">
            <p>
              Customers are responsible for return shipping costs unless the item received
              was defective, damaged, or incorrect (i.e., the wrong item was sent).
            </p>
            <p className="mt-3">
              We strongly recommend using a tracked shipping service, as we cannot be held
              responsible for items lost in transit on the return journey. The cost of the
              original outbound shipping is non-refundable.
            </p>
          </PolicySection>

          <PolicySection title="5. Exchanges">
            <p>
              We are happy to exchange eligible items for a different size or colour,
              subject to availability. To request an exchange, follow the same process as
              a return (Section 3) and indicate the item you would like in its place.
            </p>
            <p className="mt-3">
              If the replacement item is of a higher value, you will be invoiced for the
              difference. If it is of a lower value, we will issue a store credit for
              the remaining amount.
            </p>
          </PolicySection>

          <PolicySection title="6. Refunds">
            <p>
              Once your returned item is received and inspected, we will notify you by email
              within <strong>3 business days</strong>. If your return is approved:
            </p>
            <ul className="mt-3 space-y-2 pl-4 list-disc">
              <li>Refunds are processed to the <strong>original payment method</strong> within 5–10 business days.</li>
              <li>For bank transfers and card payments processed via Paystack, please allow up to 10 business days for the refund to reflect, depending on your bank.</li>
              <li>Original shipping fees are not refunded.</li>
            </ul>
            <p className="mt-4">
              If 10 business days have passed and you have not received your refund, please
              first check with your bank, then contact us if the issue persists.
            </p>
          </PolicySection>

          <PolicySection title="7. Defective or Incorrect Items">
            <p>
              If you receive an item that is defective, damaged in transit, or different
              from what you ordered, please contact us within <strong>48 hours</strong> of
              delivery with:
            </p>
            <ul className="mt-3 space-y-2 pl-4 list-disc">
              <li>Clear photographs of the defect or incorrect item.</li>
              <li>Your order number.</li>
            </ul>
            <p className="mt-3">
              We will arrange for a replacement at no additional cost to you, or issue a
              full refund including original shipping costs, at your preference.
            </p>
          </PolicySection>

          <PolicySection title="8. Bespoke Commissions">
            <p>
              All bespoke and made-to-measure garments are crafted to your exact
              measurements and specifications, and are therefore <strong>non-refundable</strong>.
            </p>
            <p className="mt-3">
              However, if your bespoke piece does not meet the agreed specifications or has
              a craft defect, we will carry out complimentary alterations or remake the piece.
              This is part of our commitment to bespoke excellence. Please notify us within
              <strong> 7 days</strong> of receipt if you have concerns about your commission.
            </p>
          </PolicySection>

          <PolicySection title="9. Contact Us">
            <p>For all returns, exchange, and refund enquiries, please contact us:</p>
            <ul className="mt-3 space-y-1 list-none pl-0">
              <li>Email: <a href="mailto:support@sparksandsplendour.com" className="text-gold-deep underline">support@sparksandsplendour.com</a></li>
              <li>Phone: <a href="tel:+2348137037919" className="text-gold-deep underline">+234 905 357 2403</a></li>
              <li>WhatsApp: <a href="https://wa.me/2348137037919" className="text-gold-deep underline" target="_blank" rel="noopener noreferrer">+234 905 357 2403</a></li>
              <li>Address: 2b Baale Street, Lafiaji Off Buena Estate Orchid Road,
                  Lekki, Lagos State, Nigeria</li>
              <li>Hours: Monday – Saturday, 10am – 7pm (WAT)</li>
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
