import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Loader } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const Route = createFileRoute("/verify-email/$token")({
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { token } = Route.useParams();
  const navigate = Route.useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-email/${token}`);
      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setMessage(data.message || "Email verified successfully!");
        setTimeout(() => {
          navigate({ to: "/account" });
        }, 2500);
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to verify email");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Verification failed. Please try again.");
    }
  };

  return (
    <section className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="text-center">
          {status === "loading" && (
            <>
              <Loader className="h-12 w-12 text-gold-deep mx-auto mb-6 animate-spin" />
              <p className="font-display text-2xl mb-2">Verifying Your Email</p>
              <p className="text-muted-foreground">One moment please...</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle2 className="h-12 w-12 text-gold-deep mx-auto mb-6" />
              <p className="font-display text-2xl mb-2">Email Verified!</p>
              <p className="text-muted-foreground mb-4">{message}</p>
              <p className="text-sm text-muted-foreground">Redirecting to login...</p>
            </>
          )}

          {status === "error" && (
            <>
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-6" />
              <p className="font-display text-2xl mb-2">Verification Failed</p>
              <p className="text-muted-foreground mb-6">{message}</p>
              <button
                onClick={verifyEmail}
                className="inline-flex bg-onyx text-cream px-8 py-3 text-xs tracking-[0.25em] uppercase font-semibold hover:bg-gold hover:text-onyx transition-colors"
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
