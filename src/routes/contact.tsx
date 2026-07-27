import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Phone, Clock, Send } from "lucide-react";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <>
      <section className="bg-onyx text-cream py-20 md:py-28">
        <div className="container-luxe text-center max-w-3xl mx-auto">
          <p className="text-eyebrow text-gold">Atelier</p>
          <h1 className="font-serif-luxe text-4xl sm:text-5xl md:text-7xl mt-4">Begin a Conversation</h1>
          <p className="mt-5 text-cream/75">For bespoke commissions, press enquiries or simply to share an idea — our office welcomes every dialogue.</p>
        </div>
      </section>

      <section className="container-luxe py-16 md:py-24 grid lg:grid-cols-2 gap-12 lg:gap-20">
        <form
          onSubmit={(e) => { e.preventDefault(); setSent(true); }}
          className="space-y-5"
        >
          <p className="text-eyebrow">Write to Us</p>
          <h2 className="font-display text-3xl md:text-4xl leading-tight">Tell us about your vision.</h2>

          <div className="grid sm:grid-cols-2 gap-4 mt-6">
            <Field label="First Name" name="first" />
            <Field label="Last Name" name="last" />
          </div>
          <Field label="Email Address" name="email" type="email" />
          <Field label="Phone (optional)" name="phone" type="tel" required={false} />
          <div>
            <label className="text-eyebrow block mb-2">Reason for enquiry</label>
            <select className="w-full border border-border bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-gold">
              <option>Bespoke commission</option>
              <option>Atelier appointment</option>
              <option>Press / Editorial</option>
              <option>Wholesale enquiry</option>
              <option>General question</option>
            </select>
          </div>
          <div>
            <label className="text-eyebrow block mb-2">Message</label>
            <textarea rows={5} required className="w-full border border-border bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-gold resize-none" />
          </div>
          <button type="submit" className="inline-flex items-center gap-3 bg-onyx text-cream px-8 py-4 text-xs tracking-[0.3em] uppercase font-semibold hover:bg-gold hover:text-onyx transition-colors">
            {sent ? "Message Sent ✦" : <>Send Enquiry <Send className="h-4 w-4" /></>}
          </button>
          {sent && <p className="text-sm text-gold-deep">Thank you — our office will respond within 24 hours.</p>}
        </form>

        <div className="space-y-6">
          <div className="aspect-[4/3] overflow-hidden bg-muted">
            <iframe
              title="Office location"
              className="w-full h-full"
              src="https://www.openstreetmap.org/export/embed.html?bbox=3.468%2C6.428%2C3.510%2C6.460&layer=mapnik&marker=6.444%2C3.489"
              loading="lazy"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Info I={MapPin} t="Office" l={["2b Baale Street, Lafiaji Off Buena Estate", "Orchid Road, Lekki, Lagos, Nigeria"]} />
            <Info I={Clock} t="Hours" l={["Mon — Sat: 10am — 7pm", "Sundays by appointment"]} />
            <Info I={Phone} t="Telephone" l={["+234 905 357 2403"]} />
            <Info I={Mail} t="Email" l={["support@sparksandsplendour.com"]} />
          </div>

          <a
            href="https://wa.me/2348137037919?text=Hello%20Sparks%20%26%20Splendour%2C%20I'd%20like%20to%20enquire%20about%20a%20bespoke%20commission."
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-[#25D366] text-white py-4 text-xs tracking-[0.3em] uppercase font-semibold hover:opacity-90 transition-opacity"
          >
            Chat on WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}

function Field({ label, name, type = "text", required = true }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label htmlFor={name} className="text-eyebrow block mb-2">{label}</label>
      <input id={name} name={name} type={type} required={required} className="w-full border border-border bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-gold" />
    </div>
  );
}

function Info({ I, t, l }: { I: React.ComponentType<{ className?: string }>; t: string; l: string[] }) {
  return (
    <div className="border border-border p-5">
      <I className="h-5 w-5 text-gold" />
      <p className="text-eyebrow mt-3">{t}</p>
      {l.map((x, i) => <p key={i} className="text-sm mt-1">{x}</p>)}
    </div>
  );
}
