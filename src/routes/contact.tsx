import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Mail, MapPin, Phone, Clock, Send, X, CheckCircle2, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

const EMAILJS_SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID  as string;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string;
const EMAILJS_PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  as string;
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER as string;

type FormErrors = Record<string, string>;

const COUNTRY_CODES = [
  { code: "+93",  label: "Afghanistan" },
  { code: "+355", label: "Albania" },
  { code: "+213", label: "Algeria" },
  { code: "+244", label: "Angola" },
  { code: "+54",  label: "Argentina" },
  { code: "+61",  label: "Australia" },
  { code: "+43",  label: "Austria" },
  { code: "+994", label: "Azerbaijan" },
  { code: "+973", label: "Bahrain" },
  { code: "+32",  label: "Belgium" },
  { code: "+229", label: "Benin" },
  { code: "+975", label: "Bhutan" },
  { code: "+267", label: "Botswana" },
  { code: "+55",  label: "Brazil" },
  { code: "+359", label: "Bulgaria" },
  { code: "+226", label: "Burkina Faso" },
  { code: "+257", label: "Burundi" },
  { code: "+1",   label: "Canada" },
  { code: "+238", label: "Cape Verde" },
  { code: "+236", label: "Central African Republic" },
  { code: "+235", label: "Chad" },
  { code: "+56",  label: "Chile" },
  { code: "+86",  label: "China" },
  { code: "+57",  label: "Colombia" },
  { code: "+269", label: "Comoros" },
  { code: "+242", label: "Congo (Republic)" },
  { code: "+243", label: "Congo (DR)" },
  { code: "+385", label: "Croatia" },
  { code: "+357", label: "Cyprus" },
  { code: "+420", label: "Czech Republic" },
  { code: "+225", label: "Côte d'Ivoire" },
  { code: "+45",  label: "Denmark" },
  { code: "+253", label: "Djibouti" },
  { code: "+20",  label: "Egypt" },
  { code: "+240", label: "Equatorial Guinea" },
  { code: "+372", label: "Estonia" },
  { code: "+268", label: "Eswatini" },
  { code: "+251", label: "Ethiopia" },
  { code: "+358", label: "Finland" },
  { code: "+33",  label: "France" },
  { code: "+241", label: "Gabon" },
  { code: "+220", label: "Gambia" },
  { code: "+995", label: "Georgia" },
  { code: "+49",  label: "Germany" },
  { code: "+233", label: "Ghana" },
  { code: "+30",  label: "Greece" },
  { code: "+224", label: "Guinea" },
  { code: "+245", label: "Guinea-Bissau" },
  { code: "+36",  label: "Hungary" },
  { code: "+354", label: "Iceland" },
  { code: "+91",  label: "India" },
  { code: "+62",  label: "Indonesia" },
  { code: "+98",  label: "Iran" },
  { code: "+353", label: "Ireland" },
  { code: "+972", label: "Israel" },
  { code: "+39",  label: "Italy" },
  { code: "+81",  label: "Japan" },
  { code: "+962", label: "Jordan" },
  { code: "+254", label: "Kenya" },
  { code: "+996", label: "Kyrgyzstan" },
  { code: "+371", label: "Latvia" },
  { code: "+266", label: "Lesotho" },
  { code: "+231", label: "Liberia" },
  { code: "+218", label: "Libya" },
  { code: "+370", label: "Lithuania" },
  { code: "+352", label: "Luxembourg" },
  { code: "+261", label: "Madagascar" },
  { code: "+265", label: "Malawi" },
  { code: "+60",  label: "Malaysia" },
  { code: "+223", label: "Mali" },
  { code: "+356", label: "Malta" },
  { code: "+230", label: "Mauritius" },
  { code: "+52",  label: "Mexico" },
  { code: "+373", label: "Moldova" },
  { code: "+976", label: "Mongolia" },
  { code: "+212", label: "Morocco" },
  { code: "+258", label: "Mozambique" },
  { code: "+95",  label: "Myanmar" },
  { code: "+264", label: "Namibia" },
  { code: "+977", label: "Nepal" },
  { code: "+31",  label: "Netherlands" },
  { code: "+64",  label: "New Zealand" },
  { code: "+227", label: "Niger" },
  { code: "+234", label: "Nigeria" },
  { code: "+47",  label: "Norway" },
  { code: "+92",  label: "Pakistan" },
  { code: "+51",  label: "Peru" },
  { code: "+63",  label: "Philippines" },
  { code: "+48",  label: "Poland" },
  { code: "+351", label: "Portugal" },
  { code: "+974", label: "Qatar" },
  { code: "+40",  label: "Romania" },
  { code: "+7",   label: "Russia" },
  { code: "+250", label: "Rwanda" },
  { code: "+239", label: "São Tomé and Príncipe" },
  { code: "+966", label: "Saudi Arabia" },
  { code: "+221", label: "Senegal" },
  { code: "+381", label: "Serbia" },
  { code: "+248", label: "Seychelles" },
  { code: "+232", label: "Sierra Leone" },
  { code: "+65",  label: "Singapore" },
  { code: "+421", label: "Slovakia" },
  { code: "+386", label: "Slovenia" },
  { code: "+252", label: "Somalia" },
  { code: "+27",  label: "South Africa" },
  { code: "+82",  label: "South Korea" },
  { code: "+34",  label: "Spain" },
  { code: "+94",  label: "Sri Lanka" },
  { code: "+249", label: "Sudan" },
  { code: "+46",  label: "Sweden" },
  { code: "+41",  label: "Switzerland" },
  { code: "+992", label: "Tajikistan" },
  { code: "+255", label: "Tanzania" },
  { code: "+66",  label: "Thailand" },
  { code: "+228", label: "Togo" },
  { code: "+216", label: "Tunisia" },
  { code: "+90",  label: "Turkey" },
  { code: "+993", label: "Turkmenistan" },
  { code: "+256", label: "Uganda" },
  { code: "+380", label: "Ukraine" },
  { code: "+971", label: "United Arab Emirates" },
  { code: "+44",  label: "United Kingdom" },
  { code: "+1",   label: "United States" },
  { code: "+598", label: "Uruguay" },
  { code: "+998", label: "Uzbekistan" },
  { code: "+84",  label: "Vietnam" },
  { code: "+967", label: "Yemen" },
  { code: "+260", label: "Zambia" },
  { code: "+263", label: "Zimbabwe" },
];

function validate(form: HTMLFormElement, countryCode: string): FormErrors {
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

  if (!countryCode) errs.country_code = "Please select a country code.";
  if (!phone) errs.phone = "Phone number is required.";
  else if (!/^[\d\s()\-]{4,15}$/.test(phone)) errs.phone = "Enter a valid phone number.";

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
  const [countryCode, setCountryCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    const errs = validate(formRef.current, countryCode);
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
      setCountryCode("");
      setPhoneNumber("");
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
          <div>
            <label className="text-eyebrow block mb-2">Phone Number</label>
            <div className={`flex border ${fieldErrors.country_code || fieldErrors.phone ? "border-destructive" : "border-border"} focus-within:border-gold`}>
              <CountryCodePicker value={countryCode} onChange={setCountryCode} />
              <input
                name="phone"
                type="tel"
                placeholder="Enter phone number"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                className="flex-1 min-w-0 bg-transparent px-4 py-3 text-sm focus:outline-none"
              />
            </div>
            {fieldErrors.country_code && <p className="text-xs text-destructive mt-1">{fieldErrors.country_code}</p>}
            {fieldErrors.phone && <p className="text-xs text-destructive mt-1">{fieldErrors.phone}</p>}
          </div>

          <input type="hidden" name="phone_full" value={`${countryCode} ${phoneNumber}`.trim()} />
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
            <Info I={MapPin} t="Office"    l={["Sparks and Splendour Baale Street, Lafiaji", "Orchid road Lekki, Lagos State"]} />
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

function CountryCodePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = COUNTRY_CODES.find(c => c.code === value) ?? null;

  const scrollToIndex = (idx: number) => {
    const el = listRef.current?.children[idx] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(true); }
      return;
    }
    if (e.key === "Escape") { setOpen(false); return; }
    if (e.key === "Enter") {
      e.preventDefault();
      onChange(COUNTRY_CODES[highlighted].code);
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.min(highlighted + 1, COUNTRY_CODES.length - 1);
      setHighlighted(next); scrollToIndex(next); return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = Math.max(highlighted - 1, 0);
      setHighlighted(prev); scrollToIndex(prev); return;
    }
    // letter jump
    if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
      const letter = e.key.toLowerCase();
      const idx = COUNTRY_CODES.findIndex(c => c.label.toLowerCase().startsWith(letter));
      if (idx !== -1) { setHighlighted(idx); scrollToIndex(idx); }
    }
  };

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        onKeyDown={handleKeyDown}
        className="flex items-center gap-1 border-r border-border bg-transparent px-3 py-3 text-sm focus:outline-none w-20 sm:w-24 justify-between"
      >
        <span className="truncate">{selected ? selected.code : "Code"}</span>
        <span className="text-xs opacity-50">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <ul
          ref={listRef}
          className="absolute left-0 top-full z-50 w-56 max-h-60 overflow-y-auto bg-background border border-border shadow-lg"
          onKeyDown={handleKeyDown}
        >
          {COUNTRY_CODES.map((c, i) => (
            <li
              key={i}
              onMouseEnter={() => setHighlighted(i)}
              onMouseDown={() => { onChange(c.code); setOpen(false); }}
              className={`px-4 py-2 text-sm cursor-pointer flex justify-between gap-2 ${
                i === highlighted ? "bg-gold/20" : "hover:bg-secondary"
              }`}
            >
              <span>{c.label}</span>
              <span className="text-muted-foreground shrink-0">{c.code}</span>
            </li>
          ))}
        </ul>
      )}
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
