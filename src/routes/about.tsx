import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <section className="relative h-[60vh] min-h-[420px] overflow-hidden">
        <img src="/gallery-compressed/prom_suits/Prom_classic_Ric_Hassani_black_velvet_3.jpg" alt="Sparks & Splendour atelier" className="absolute inset-0 w-full h-full object-cover object-top" />
        <div className="absolute inset-0 bg-onyx/55" />
        <div className="relative z-10 h-full container-luxe flex flex-col items-center justify-center text-center text-cream">
          <p className="text-eyebrow text-gold">The House</p>
          <h1 className="font-serif-luxe text-4xl sm:text-5xl md:text-7xl mt-4">Where Heritage Meets Vision</h1>
          <p className="mt-5 text-cream/80 max-w-2xl">A bespoke fashion house tailoring identity, one piece at a time.</p>
        </div>
      </section>

      <section className="container-luxe py-20 md:py-28 grid lg:grid-cols-12 gap-10 lg:gap-16">
        <div className="lg:col-span-5">
          <p className="text-eyebrow">Manifesto</p>
          <h2 className="font-display text-4xl md:text-5xl mt-3 leading-tight">A philosophy of quiet luxury.</h2>
        </div>
        <div className="lg:col-span-7 space-y-5 text-muted-foreground leading-relaxed">
          <p style={{ textAlign: 'justify' }}>
            Sparks and Splendour is a bespoke fashion house born in the bustling city of Lagos, Nigeria. 
            Since its inception in 2019, we have proudly crafted exceptional garments for over 10,000 men and women across six continents.
          </p>
          <p style={{ textAlign: 'justify' }}>
            Built on the timeless values of craftsmanship, resilience, hard work, and an unwavering pursuit of excellence, 
            every piece we create reflects our commitment to quality over convenience.
           Each commission begins with a conversation—not a pattern. We understand the person before we measure the cloth. 
           From impeccably tailored suits to regal traditional attire and royal aso-ebi, every garment passes through meticulous stages of 
           craftsmanship and hours of detailed finishing before it earns the Sparks and Splendour seal.
          </p>
          <p>
            We do not chase trends. We create timeless wardrobes that outlive seasons—pieces designed to be worn with 
            confidence today and remembered for generations, just as true heirlooms should.
          </p>
        </div>
      </section>

      <section className="bg-onyx text-cream py-24">
        <div className="container-luxe grid md:grid-cols-2 gap-16 items-center">
          <img src="/gallery-compressed/wedding_suits/WeddingSuits_double_breasted_ivory_suit_2.jpg" alt="" className="w-full aspect-[4/5] object-cover object-top" />
          <div>
            <p className="text-eyebrow text-gold">Mission & Vision</p>
            <h2 className="font-display text-4xl md:text-5xl mt-3 leading-tight">Couture as cultural inheritance.</h2>
            <div className="mt-8 space-y-6 text-cream/75">
              <div>
                <h3 className="font-display text-xl text-gold">Our Mission</h3>
                <p className="mt-2 leading-relaxed">To deliver unparalleled excelence in bespoke and urban fashion, providing each customer 
                  with personalized, high-quality garments that reflect their unique style and preferences.</p>
              </div>
              <div>
                <h3 className="font-display text-xl text-gold">Our Vision</h3>
                <p className="mt-2 leading-relaxed">To deliver confidence in every stitch, tailoring not just clothes, but personal stories of style and self-expression.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-luxe py-20 md:py-28">
        <div className="text-center mb-14">
          <p className="text-eyebrow">Atelier</p>
          <h2 className="font-display text-4xl md:text-5xl mt-3">Meet the Makers</h2>
          <span className="gold-divider mt-5" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { n: "Oriaku Elekwachi", r: "Creative Director", img: "/gallery-compressed/Ladies/Ladies_suit_Brown_2.jpg" },
            { n: "Chinaza Eze", r: "Master Tailor", img: "/gallery-compressed/natives/Native_NAA-002.jpg" },
            { n: "Winner Elekwachi", r: "Head of Couture", img: "/gallery-compressed/Ladies/ladies_suit_pink_1.jpg" },
            { n: "Peculiar Chukwudi", r: "Atelier Director", img: "/gallery-compressed/agbada/Agbada_AAA-001.jpg" },
          ].map((m, i) => (
            <figure key={i} className="group">
              <div className="overflow-hidden aspect-[4/5] bg-muted">
                <img src={m.img} alt={m.n} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <figcaption className="pt-4 text-center">
                <p className="font-display text-xl">{m.n}</p>
                <p className="text-xs text-gold-deep tracking-[0.25em] uppercase mt-1">{m.r}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="bg-secondary/40 py-20">
        <div className="container-luxe text-center max-w-2xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl">Begin your bespoke journey.</h2>
          <p className="mt-4 text-muted-foreground">Reserve a private appointment in our Lagos office — or virtually from anywhere in the world.</p>
          <Link to="/contact" className="inline-flex mt-8 bg-onyx text-cream px-8 py-4 text-xs tracking-[0.3em] uppercase font-semibold hover:bg-gold hover:text-onyx transition-colors">
            Book a Consultation
          </Link>
        </div>
      </section>
    </>
  );
}
