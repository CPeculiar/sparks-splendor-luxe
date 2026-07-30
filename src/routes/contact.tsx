import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Mail, MapPin, Phone, Clock, Send, X, CheckCircle2, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

const EMAILJS_SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID  as string;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string;
const EMAILJS_PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  as string;
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER as string;

type FormErrors = Record<string, string>;

function validate(form: HTMLFormElement): FormErrors {
  const errs: FormErrors = {};
  const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement)?.value.trim() ?? "";

  const firstName = get("first_name");
  const lastName  = get("last_name");
  const email     = get("reply_to");
  const phone     = get("phone");
  const message   = get("message");

  if (!firstName) errs.first_name = "First name is required.";
  else if (!/^[A-Za-z\s'-]{2,}$/.test(firstName)) errs.first_name = "Enter a valid first name (letters only).";

  if (!lastName) errs.last_name = "Last name is required.";
  else if (!/^[A-Za-z\s'-]{2,}$/.test(lastName)) errs.last_name = "Enter a valid last name (letters only).";

  if (!email) errs.reply_to = "Email address is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errs.reply_to = "Enter a valid email address.";

  if (!phone) errs.phone = "Phone number is required.";
  else if (!/^[+]?[\d\s()\-]{7,20}$/.test(phone)) errs.phone = "Enter a valid phone number.";

  if (!message) errs.message = "Message is required.";
  else if (message.length < 10) errs.message = "Message must be at least 10 characters.";

  return errs;
}

function ContactPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    const errs = validate(formRef.current);
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setSending(true);
    setSubmitError(null);

    try {
      const emailjs = await import("@emailjs/browser");
      await emailjs.sendForm(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        formRef.current,
        EMAILJS_PUBLIC_KEY,
      );
      formRef.current.reset();
      setShowSuccess(true);
    } catch (err) {
      console.error("EmailJS error:", err);
      setSubmitError("Failed to send your message. Please try again or contact us directly on WhatsApp.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {showSuccess && <SuccessModal onClose={() => setShowSuccess(false)} />}

      <section className="bg-onyx text-cream py-20 md:py-28">
        <div className="container-luxe text-center max-w-3xl mx-auto">
          <p className="text-eyebrow text-gold">Atelier</p>
          <h1 className="font-serif-luxe text-4xl sm:text-5xl md:text-7xl mt-4">Begin a Conversation</h1>
          <p className="mt-5 text-cream/75">For bespoke commissions, press enquiries or simply to share an idea — our office welcomes every dialogue.</p>
        </div>
      </section>

      <section className="container-luxe py-16 md:py-24 grid lg:grid-cols-2 gap-12 lg:gap-20">
        <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">
          <p className="text-eyebrow">Write to Us</p>
          <h2 className="font-display text-3xl md:text-4xl leading-tight">Let's Create Something Exceptional.</h2>

          <div className="grid sm:grid-cols-2 gap-4 mt-6">
            <Field label="First Name" name="first_name" error={fieldErrors.first_name} />
            <Field label="Last Name"  name="last_name"  error={fieldErrors.last_name} />
          </div>
          <Field label="Email Address" name="reply_to" type="email" error={fieldErrors.reply_to} />
          <Field label="Phone Number" name="phone" type="tel" error={fieldErrors.phone} />

          {/* Hidden fields so EmailJS knows where to send */}
          <input type="hidden" name="to_email" value="sparksandsplendour@gmail.com" />
          <input type="hidden" name="cc_email" value="Ifeanyichukwuelekwachi@gmail.com" />
          <input type="hidden" name="time" value={new Date().toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" })} />

          <div>
            <label className="text-eyebrow block mb-2">Reason for enquiry</label>
            <select name="enquiry_type" className="w-full border border-border bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-gold">
              <option>Bespoke commission</option>
              <option>Atelier appointment</option>
              <option>Press / Editorial</option>
              <option>Wholesale enquiry</option>
              <option>General question</option>
            </select>
          </div>
          <div>
            <label className="text-eyebrow block mb-2">Message</label>
            <textarea
              name="message"
              rows={5}
              className={`w-full border bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-gold resize-none ${
                fieldErrors.message ? "border-destructive" : "border-border"
              }`}
            />
            {fieldErrors.message && <p className="text-xs text-destructive mt-1">{fieldErrors.message}</p>}
          </div>

          {submitError && <p className="text-sm text-destructive bg-destructive/10 p-3">{submitError}</p>}

          <button
            type="submit"
            disabled={sending}
            className="inline-flex items-center gap-3 bg-onyx text-cream px-8 py-4 text-xs tracking-[0.3em] uppercase font-semibold hover:bg-gold hover:text-onyx transition-colors disabled:opacity-60"
          >
            {sending ? "Sending…" : <><Send className="h-4 w-4" /> Send Enquiry</>}
          </button>
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
            <Info I={MapPin} t="Office"    l={["2b Baale Street, Lafiaji Off Buena Estate", "Orchid Road, Lekki, Lagos, Nigeria"]} />
          <Info I={Clock}  t="Hours"     l={["Mon — Sat: 10am — 7pm", "Sundays by appointment"]} />
            <Info I={Phone}  t="Telephone" l={[{ text: "+234 905 357 2403", href: "tel:+2349053572403" }]} />
            <Info I={Mail}   t="Email"     l={[{ text: "sparksandsplendour@gmail.com", href: "mailto:sparksandsplendour@gmail.com" }]} />
          </div>

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello Sparks & Splendour, I'd like to enquire about a bespoke commission.")}`}
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

function SuccessModal({ onClose }: { onClose: () => void }) {
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello Sparks & Splendour! I just submitted an enquiry via your website and would like to follow up.")}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-background border border-border w-full max-w-md p-8 space-y-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground" aria-label="Close">
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-gold/15 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-gold-deep" />
          </div>
          <p className="text-eyebrow mt-5 text-gold">Submitted Successfully</p>
          <h2 className="font-display text-2xl mt-2">Message Received!</h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Thank you for reaching out. Our team will respond within 24 hours. You can also chat with us directly on WhatsApp for a faster response.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] text-white py-3.5 text-xs tracking-[0.25em] uppercase font-semibold hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
          </a>
          <button
            onClick={onClose}
            className="w-full border border-border py-3.5 text-xs tracking-[0.25em] uppercase font-semibold hover:bg-secondary transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, name, type = "text", error }: { label: string; name: string; type?: string; error?: string }) {
  return (
    <div>
      <label htmlFor={name} className="text-eyebrow block mb-2">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        className={`w-full border bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-gold ${
          error ? "border-destructive" : "border-border"
        }`}
      />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

function Info({ I, t, l }: { I: React.ComponentType<{ className?: string }>; t: string; l: (string | { text: string; href: string })[] }) {
  return (
    <div className="border border-border p-5">
      <I className="h-5 w-5 text-gold" />
      <p className="text-eyebrow mt-3">{t}</p>
      {l.map((x, i) =>
        typeof x === "string" ? (
          <p key={i} className="text-sm mt-1">{x}</p>
        ) : (
          <a key={i} href={x.href} className="text-sm mt-1 block hover:text-gold transition-colors">{x.text}</a>
        )
      )}
    </div>
  );
}
