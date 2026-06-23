"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTenant } from "@/lib/tenant/context";
import {
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Mail,
  Star,
} from "lucide-react";
import Link from "next/link";

const GOLD = "#D4AF37";
const NAVY = "#0F172A";
const SERIF: React.CSSProperties = {
  fontFamily: "'DM Serif Display', Georgia, serif",
  fontWeight: 400,
};

// ─── Community variant ──────────────────────────────────────────────────────

function CommunityForgotCard({
  isLoading,
  errorMsg,
  successMsg,
  onSubmit,
}: {
  isLoading: boolean;
  errorMsg: string | null;
  successMsg: string | null;
  onSubmit: (email: string) => void;
}) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: NAVY }}>
      <div className="w-full max-w-sm space-y-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la connexion
        </Link>

        <div className="space-y-3">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center border"
              style={{ background: `${GOLD}18`, borderColor: `${GOLD}40` }}
            >
              <Star className="w-5 h-5" style={{ color: GOLD }} strokeWidth={1.5} />
            </div>
            <p className="text-white font-black text-sm">BNJ Community</p>
          </div>
          <h1 className="text-3xl text-white" style={SERIF}>
            Mot de passe oublié
          </h1>
          <p className="text-sm font-light" style={{ color: "rgba(255,255,255,0.5)" }}>
            Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>
        </div>

        <div className="h-px" style={{ background: `linear-gradient(90deg, ${GOLD}40, transparent)` }} />

        {errorMsg && (
          <div className="p-4 rounded-2xl flex items-start gap-3 text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}>
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg ? (
          <div className="p-4 rounded-2xl flex items-start gap-3 text-sm" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#86efac" }}>
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
              <input
                type="email"
                placeholder="Votre adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-medium text-white placeholder:text-white/30 outline-none transition-all focus:ring-2 focus:ring-yellow-600/40 focus:border-yellow-600/60"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: GOLD, color: NAVY, boxShadow: `0 8px 30px ${GOLD}35` }}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                "Envoyer le lien"
              )}
            </button>
          </form>
        )}

        <p className="text-center text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
          Vous vous souvenez ?{" "}
          <Link href="/login" className="font-bold hover:underline" style={{ color: GOLD }}>
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}

// ─── Standard variant (FR / Africa) ─────────────────────────────────────────

function StandardForgotCard({
  isLoading,
  errorMsg,
  successMsg,
  onSubmit,
}: {
  isLoading: boolean;
  errorMsg: string | null;
  successMsg: string | null;
  onSubmit: (email: string) => void;
}) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-brand-100 opacity-50 blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 rounded-full bg-blue-100 opacity-50 blur-3xl" />

          <Link
            href="/login"
            className="relative inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la connexion
          </Link>

          <div className="relative text-center mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Mot de passe oublié
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              Entrez votre email pour recevoir un lien de réinitialisation
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm font-medium">{errorMsg}</div>
            </div>
          )}

          {successMsg ? (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-start gap-3 text-green-600">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm font-medium">{successMsg}</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="Votre adresse email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-200 outline-none transition-all focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-primary hover:bg-brand-dark text-white font-bold text-sm py-3.5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Envoyer le lien"
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Vous vous souvenez ?{" "}
              <Link href="/login" className="font-bold text-brand-primary hover:text-brand-dark">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const tenant = useTenant();

  const handleSubmit = async (email: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setErrorMsg(error.message);
      setIsLoading(false);
      return;
    }

    // Always show success even if email doesn't exist (security: no email enumeration)
    setSuccessMsg(
      "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation dans quelques instants. Pensez à vérifier vos spams."
    );
    setIsLoading(false);
  };

  const props = { isLoading, errorMsg, successMsg, onSubmit: handleSubmit };

  if (tenant.id === "community") return <CommunityForgotCard {...props} />;
  return <StandardForgotCard {...props} />;
}
