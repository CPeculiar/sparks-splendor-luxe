import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms-conditions")({
  component: TermsConditionsPage,
});

function TermsConditionsPage() {
  return (
    <>
      <section className="bg-onyx text-cream py-16 md:py-24">
        <div className="container-luxe text-center max-w-3xl mx-auto">
          <p className="text-eyebrow text-gold">Legal</p>
          <h1 className="font-serif-luxe text-4xl sm:text-5xl md:text-6xl mt-4">Terms and Conditions</h1>
          <p className="mt-5 text-cream/75">The terms that govern your use of our website and services.</p>
        </div>
      </section>

      <section className="container-luxe py-16 md:py-24 max-w-3xl mx-auto prose prose-neutral">
        <div className="space-y-10 text-muted-foreground leading-relaxed">

          <div>
            <p className="text-xs text-muted-foreground tracking-[0.25em] uppercase mb-6">Last updated: June 2025</p>
            <p>
              Welcome to Sparks & Splendour. These Terms and Conditions govern your access to and use of our website and services. By accessing or purchasing from our website, you agree to be bound by these terms.
            </p>
          </div>

          <PolicySection title="1. Use License">
            <p>
              We grant you a limited, non-exclusive, non-transferable license to access and use our website for personal, non-commercial purposes. You agree not to:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Modify or copy the content</li>
              <li>Use the content for commercial purposes</li>
              <li>Attempt to decompile or reverse engineer any software</li>
              <li>Remove any copyright or proprietary notations</li>
              <li>Transfer the website or materials to another person or entity</li>
              <li>Engage in any illegal activities</li>
            </ul>
          </PolicySection>

          <PolicySection title="2. Intellectual Property Rights">
            <p>
              All content on our website, including text, graphics, logos, images, and software, is the property of Sparks & Splendour or our content suppliers and is protected by copyright and other intellectual property laws. You may not reproduce, distribute, or transmit any content without our prior written consent.
            </p>
          </PolicySection>

          <PolicySection title="3. Product Information and Availability">
            <p>
              We strive to provide accurate product descriptions and pricing. However, we do not warrant that:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Product descriptions are completely accurate</li>
              <li>Product images exactly match the actual item</li>
              <li>Colors are displayed exactly as they appear in person</li>
              <li>Products are always in stock</li>
            </ul>
            <p className="mt-3">
              We reserve the right to limit quantities, cancel orders, and correct errors in pricing or descriptions.
            </p>
          </PolicySection>

          <PolicySection title="4. Pricing and Availability">
            <p>
              All prices are subject to change without notice. We reserve the right to discontinue products and change prices at any time. Prices do not include applicable taxes, which will be calculated and displayed at checkout.
            </p>
            <p className="mt-3">
              While we strive to maintain accurate inventory information, we do not guarantee product availability. If a product becomes unavailable after purchase, we will notify you and offer alternatives or a refund.
            </p>
          </PolicySection>

          <PolicySection title="5. Order Acceptance and Cancellation">
            <p>
              We reserve the right to refuse or cancel any order for any reason, including:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Suspected fraud</li>
              <li>Pricing errors</li>
              <li>Availability issues</li>
              <li>Violation of these terms</li>
            </ul>
            <p className="mt-3">
              Orders placed for made-to-measure or bespoke items are subject to our bespoke commissions policy. Cancellations of bespoke orders may incur fees.
            </p>
          </PolicySection>

          <PolicySection title="6. Payment">
            <p>
              By providing payment information, you authorize us to process your payment through our secure payment gateway. You are responsible for:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Maintaining the confidentiality of your payment information</li>
              <li>Ensuring the accuracy of billing information</li>
              <li>Paying all charges incurred</li>
            </ul>
            <p className="mt-3">
              We accept various payment methods including credit cards, debit cards, and other digital payment options. We do not store payment information on our servers.
            </p>
          </PolicySection>

          <PolicySection title="7. Shipping and Delivery">
            <p>
              Shipping timelines and costs are outlined in our Shipping Policy. We are not responsible for delays caused by shipping carriers or customs issues. Risk of loss passes to you upon delivery to the carrier. For international orders, you are responsible for any customs duties or taxes.
            </p>
          </PolicySection>

          <PolicySection title="8. Returns and Refunds">
            <p>
              Our Returns & Refund Policy governs all returns and refunds. All returns must comply with the conditions outlined in that policy.
            </p>
          </PolicySection>

          <PolicySection title="9. Warranties and Disclaimers">
            <p>
              Our products are provided "as is" unless otherwise specified. We provide a quality guarantee on all items:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>All items are crafted with the highest standards</li>
              <li>We offer a 1-year warranty against manufacturing defects</li>
              <li>Normal wear and tear is not covered</li>
              <li>Damage from improper care is not covered</li>
            </ul>
            <p className="mt-3">
              WE DISCLAIM ALL OTHER WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
            </p>
          </PolicySection>

          <PolicySection title="10. Limitation of Liability">
            <p>
              IN NO EVENT SHALL SPARKS & SPLENDOUR BE LIABLE FOR:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Indirect, incidental, special, or consequential damages</li>
              <li>Lost profits or data</li>
              <li>Damages arising from your use of the website</li>
            </ul>
            <p className="mt-3">
              Our total liability shall not exceed the amount you paid for the product.
            </p>
          </PolicySection>

          <PolicySection title="11. User Content and Conduct">
            <p>
              You are responsible for any content you submit to our website. By submitting content, you grant us a non-exclusive, royalty-free license to use, display, and distribute the content. You agree not to:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Post illegal or harmful content</li>
              <li>Harass, abuse, or threaten other users</li>
              <li>Post spam or unsolicited advertising</li>
              <li>Infringe on intellectual property rights</li>
              <li>Post false or misleading information</li>
            </ul>
          </PolicySection>

          <PolicySection title="12. Account Registration">
            <p>
              If you create an account on our website, you agree to:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Provide accurate and complete information</li>
              <li>Maintain confidentiality of your password</li>
              <li>Accept responsibility for activities under your account</li>
              <li>Notify us of unauthorized access</li>
            </ul>
            <p className="mt-3">
              We reserve the right to suspend or terminate accounts that violate these terms.
            </p>
          </PolicySection>

          <PolicySection title="13. Indemnification">
            <p>
              You agree to indemnify and hold harmless Sparks & Splendour from any claims, damages, or losses arising from:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Your violation of these terms</li>
              <li>Your use of the website</li>
              <li>Content you submit</li>
              <li>Infringement of intellectual property rights</li>
            </ul>
          </PolicySection>

          <PolicySection title="14. Third-Party Links">
            <p>
              Our website may contain links to third-party websites. We are not responsible for the content, accuracy, or practices of external websites. Your use of third-party websites is at your own risk and subject to their terms and conditions.
            </p>
          </PolicySection>

          <PolicySection title="15. Governing Law">
            <p>
              These Terms and Conditions are governed by and construed in accordance with the laws of Nigeria, without regard to its conflict of law principles. You agree to submit to the exclusive jurisdiction of the courts in Lagos, Nigeria.
            </p>
          </PolicySection>

          <PolicySection title="16. Amendments">
            <p>
              We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting to the website. Your continued use of the website constitutes acceptance of the modified terms.
            </p>
          </PolicySection>

          <PolicySection title="17. Severability">
            <p>
              If any provision of these Terms and Conditions is deemed invalid or unenforceable, the remaining provisions shall continue in full force and effect.
            </p>
          </PolicySection>

          <PolicySection title="18. Contact Us">
            <p>
              If you have questions about these Terms and Conditions, please contact us:
            </p>
            <ul className="space-y-2 mt-3">
              <li><strong>Email:</strong> support@sparksandsplendour.com</li>
              <li><strong>Address:</strong> 2b Baale Street, Lafiaji Off Buena Estate Orchid Road, Lekki, Lagos State, Nigeria</li>
              <li><strong>Phone:</strong> +234 905 357 2403</li>
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
      <h2 className="font-semibold text-base text-foreground tracking-wide mb-4">{title}</h2>
      <div className="space-y-3 text-sm">{children}</div>
    </div>
  );
}
