import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo-mark.png";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export function Footer () {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setErrMsg("");
    try {
      const res = await fetch(`${API_BASE}/api/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim() || undefined }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to subscribe");
      }
      setStatus("success");
      setEmail("");
      setName("");
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : "Failed to subscribe");
      setStatus("error");
    }
  }
  return (
    <footer className="bg-onyx text-cream mt-24">
      {/* Newsletter */}
      <div className="border-b border-cream/10">
        <div className="container-luxe py-14 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-eyebrow text-gold">Membership</p>
            <h3 className="font-display text-3xl md:text-4xl mt-3 leading-tight">
              The Sparks Society
            </h3>
            <p className="mt-3 text-cream/70 max-w-md text-sm leading-relaxed">
              Receive private invitations, clothing previews and editorial dispatches from the House.
            </p>
          </div>
          {status === "success" ? (
            <p className="text-gold text-sm font-medium">✓ You're on the list. Welcome to the Society.</p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name (optional)"
                className="bg-transparent border border-cream/20 px-4 py-3 text-sm placeholder:text-cream/40 outline-none focus:border-gold transition-colors"
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-1 bg-transparent border border-cream/20 px-4 py-3 text-sm placeholder:text-cream/40 outline-none focus:border-gold transition-colors min-w-0"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="bg-gold text-onyx px-6 py-3 text-xs tracking-[0.25em] uppercase font-semibold hover:bg-gold-soft transition-colors whitespace-nowrap shrink-0 disabled:opacity-60"
                >
                  {status === "loading" ? "…" : "Subscribe"}
                </button>
              </div>
              {status === "error" && <p className="text-xs text-destructive">{errMsg}</p>}
            </form>
          )}
        </div>
      </div>

      {/* Main links */}
      <div className="container-luxe py-14 grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-10">
        <div className="col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <img src={logo} alt="Sparks & Splendour" className="h-12 w-auto rounded-sm" />
            <div className="leading-none">
              <div className="font-display text-xl tracking-[0.2em]">SPARKS</div>
              <div className="text-[9px] tracking-[0.5em] text-gold">& SPLENDOUR</div>
            </div>
          </div>
          <p className="text-sm text-cream/60 max-w-sm leading-relaxed">
            A bespoke fashion house dedicated to craftsmanship, heritage and the quiet authority of luxury menswear & couture.
          </p>
          <div className="flex gap-3 mt-6">
            {[Instagram, Facebook].map((I, i) => (
              <a key={i} href="#" className="w-10 h-10 border border-cream/20 hover:border-gold hover:text-gold transition-colors flex items-center justify-center rounded-sm">
                <I className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-eyebrow text-gold mb-4">Shop</h4>
          <ul className="space-y-2.5 text-sm text-cream/70">
            <li><Link to="/shop" search={{ category: "suits" }} className="hover:text-gold">Suits</Link></li>
            <li><Link to="/shop" search={{ category: "natives" }} className="hover:text-gold">Natives</Link></li>
            <li><Link to="/shop" search={{ category: "casuals" }} className="hover:text-gold">Casuals</Link></li>
            <li><Link to="/shop" search={{ category: "ladies" }} className="hover:text-gold">Ladies</Link></li>
            <li><Link to="/shop" search={{ category: "shirts" }} className="hover:text-gold">Shirts</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-eyebrow text-gold mb-4">House</h4>
          <ul className="space-y-2.5 text-sm text-cream/70">
            <li><Link to="/about" className="hover:text-gold">Our Story</Link></li>
            <li><Link to="/about" className="hover:text-gold">Atelier</Link></li>
            <li><Link to="/contact" className="hover:text-gold">Bespoke Appointment</Link></li>
            <li><Link to="/contact" className="hover:text-gold">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-eyebrow text-gold mb-4">Legal</h4>
          <ul className="space-y-2.5 text-sm text-cream/70">
            <li><Link to="/shipping-policy" className="hover:text-gold">Shipping Policy</Link></li>
            <li><Link to="/returns-policy" className="hover:text-gold">Returns & Refunds</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-gold">Privacy Policy</Link></li>
            <li><Link to="/terms-conditions" className="hover:text-gold">Terms & Conditions</Link></li>
          </ul>
        </div>

        <div className="col-span-2 md:col-span-1">
          <h4 className="text-eyebrow text-gold mb-4">Atelier</h4>
          <ul className="space-y-3 text-sm text-cream/70">
            <li className="flex gap-2 items-start"><MapPin className="h-4 w-4 text-gold shrink-0 mt-0.5" /> 2b Baale Street, Lafiaji Off Buena Estate Orchid Road,
              Lekki, Lagos State, Nigeria</li>
            <li className="flex gap-2 items-start"><Phone className="h-4 w-4 text-gold shrink-0 mt-0.5" />
              <a href={`tel:+${import.meta.env.VITE_WHATSAPP_NUMBER}`} className="hover:text-gold transition-colors">+234 905 357 2403</a>
            </li>
            <li className="flex gap-2 items-start"><Mail className="h-4 w-4 text-gold shrink-0 mt-0.5" />
              <a href="mailto:support@sparksandsplendour.com" className="hover:text-gold transition-colors">support@sparksandsplendour.com</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="container-luxe py-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-cream/50 text-center">
          <p>© {new Date().getFullYear()} Sparks & Splendour. All rights reserved.</p>
          <p className="tracking-[0.25em] uppercase">Crafted with intention</p>
        </div>
      </div>
    </footer>
  );
}
