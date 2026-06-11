export function WhatsAppFab() {
  const phone = "2348137037919";
  const msg = encodeURIComponent("Hello Sparks & Splendour, I'd like to enquire about a bespoke piece.");
  return (
    <a
      href={`https://wa.me/${phone}?text=${msg}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-30 group"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366]/40 animate-ping" />
      <span className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-luxe hover:scale-110 transition-transform duration-300">
        <svg viewBox="0 0 32 32" className="w-7 h-7 fill-current" aria-hidden="true">
          <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.094c-.4-.18-.8-.36-1.2-.55-1.6-.751-3.05-1.92-4.18-3.36a16.7 16.7 0 0 1-1.16-1.65c-.25-.4-.43-.85-.43-1.31 0-.45.21-.78.39-1.1.18-.32.69-.78.92-1.06.16-.2.21-.4.21-.6 0-.4-.94-2.36-1.06-2.61-.31-.65-.52-.7-.84-.71h-.79c-.27 0-.7.1-1.05.5-.36.4-1.36 1.32-1.36 3.21 0 1.89 1.39 3.72 1.59 3.97.2.25 2.74 4.18 6.6 5.8 3.86 1.62 4.55 1.42 5.36 1.34.81-.08 2.79-1.14 3.18-2.24.39-1.1.39-2.04.27-2.24-.12-.2-.42-.32-.88-.49-.46-.17-2.74-1.36-3.16-1.51l-.31-.07ZM16.05 6.5c-5.27 0-9.55 4.28-9.55 9.55 0 1.85.55 3.66 1.59 5.21l-1.04 3.79 3.88-1.02a9.45 9.45 0 0 0 5.12 1.51c5.27 0 9.55-4.28 9.55-9.55s-4.28-9.49-9.55-9.49Z"/>
        </svg>
      </span>
    </a>
  );
}
