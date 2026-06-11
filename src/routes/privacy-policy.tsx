import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy-policy")({
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <>
      <section className="bg-onyx text-cream py-16 md:py-24">
        <div className="container-luxe text-center max-w-3xl mx-auto">
          <p className="text-eyebrow text-gold">Legal</p>
          <h1 className="font-serif-luxe text-4xl sm:text-5xl md:text-6xl mt-4">Privacy Policy</h1>
          <p className="mt-5 text-cream/75">How we protect your personal information.</p>
        </div>
      </section>

      <section className="container-luxe py-16 md:py-24 max-w-3xl mx-auto prose prose-neutral">
        <div className="space-y-10 text-muted-foreground leading-relaxed">

          <div>
            <p className="text-xs text-muted-foreground tracking-[0.25em] uppercase mb-6">Last updated: June 2025</p>
            <p>
              At Sparks & Splendour, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and make purchases from us.
            </p>
          </div>

          <PolicySection title="1. Information We Collect">
            <p>
              We may collect information about you in a variety of ways. The information we may collect on the Site includes:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Personal Data:</strong> Name, email address, phone number, shipping address, billing address, payment information</li>
              <li><strong>Account Information:</strong> Login credentials, preferences, saved items, order history</li>
              <li><strong>Device Information:</strong> IP address, browser type, operating system, browsing behavior</li>
              <li><strong>Cookies and Tracking:</strong> Usage data collected through cookies and similar technologies</li>
            </ul>
          </PolicySection>

          <PolicySection title="2. How We Use Your Information">
            <p>
              We use the information we collect in the following ways:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Process and fulfill your orders</li>
              <li>Send transactional emails and order updates</li>
              <li>Provide customer support and respond to inquiries</li>
              <li>Improve our website and services</li>
              <li>Personalize your shopping experience</li>
              <li>Send promotional emails (with your consent)</li>
              <li>Detect and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </PolicySection>

          <PolicySection title="3. Sharing Your Information">
            <p>
              We do not sell, trade, or rent your personal information to third parties. However, we may share your information with:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Service Providers:</strong> Payment processors, shipping partners, email providers</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our legal rights</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or asset sale</li>
            </ul>
          </PolicySection>

          <PolicySection title="4. Data Security">
            <p>
              We implement comprehensive security measures to protect your personal information, including:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>SSL encryption for data transmission</li>
              <li>Secure payment processing</li>
              <li>Limited access to personal data</li>
              <li>Regular security audits</li>
            </ul>
            <p className="mt-3">
              However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </PolicySection>

          <PolicySection title="5. Cookies and Tracking">
            <p>
              Our website uses cookies to enhance your browsing experience. Cookies help us:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Remember your preferences</li>
              <li>Track website analytics</li>
              <li>Personalize content</li>
              <li>Enable certain features</li>
            </ul>
            <p className="mt-3">
              You can control cookies through your browser settings. Disabling cookies may affect website functionality.
            </p>
          </PolicySection>

          <PolicySection title="6. Your Rights">
            <p>
              You have the right to:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className="mt-3">
              To exercise these rights, please contact us at support@sparksandsplendour.com
            </p>
          </PolicySection>

          <PolicySection title="7. Children's Privacy">
            <p>
              Our website is not intended for children under 18. We do not knowingly collect personal information from children. If we discover we have collected information from a child, we will delete it immediately.
            </p>
          </PolicySection>

          <PolicySection title="8. Third-Party Links">
            <p>
              Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. Please review their privacy policies before providing any information.
            </p>
          </PolicySection>

          <PolicySection title="9. Policy Updates">
            <p>
              We may update this Privacy Policy periodically. We will notify you of significant changes by updating the "Last Updated" date at the top of this page. Your continued use of our website constitutes acceptance of the updated policy.
            </p>
          </PolicySection>

          <PolicySection title="10. Contact Us">
            <p>
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <ul className="space-y-2 mt-3">
              <li><strong>Email:</strong> support@sparksandsplendour.com</li>
              <li><strong>Address:</strong> Block 1, House 1, Spring Garden Estate, Orchid Road,
                Lekki, Lagos State, Nigeria</li>
              <li><strong>Phone:</strong> +234 813 703 7919</li>
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
