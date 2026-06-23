"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useTenant } from "@/lib/tenant/context";
import {
  AlertCircle,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
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

function CommunityResetCard({
  isLoading,
  errorMsg,
  successMsg,
  onSubmit,
}: {
  isLoading: boolean;
  errorMsg: string | null;
  successMsg: string | null;
  onSubmit: (password: string) => void;
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (password !== confirmPassword) {
      setLocalError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 6) {
      setLocalError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    onSubmit(password);
  };

  const displayError = localError || errorMsg;

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: NAVY }}>
      <div className="w-full max-w-sm space-y-6">
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
            Nouveau mot de passe
          </h1>
          <p className="text-sm font-light" style={{ color: "rgba(255,255,255,0.5)" }}>
            Choisissez un nouveau mot de passe pour votre compte.
          </p>
        </div>

        <div className="h-px" style={{ background: `linear-gradient(90deg, ${GOLD}40, transparent)` }} />

        {displayError && (
          <div className="p-4 rounded-2xl flex items-start gap-3 text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}>
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{displayError}</span>
          </div>
        )}

        {successMsg ? (
          <>
            <div className="p-4 rounded-2xl flex items-start gap-3 text-sm" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#86efac" }}>
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
            <Link
              href="/login"
              className="block w-full text-center px-6 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 hover:opacity-90"
              style={{ background: GOLD, color: NAVY }}
            >
              Se connecter
            </Link>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
              <input
                type={showPwd ? "text" : "password"}
                placeholder="Nouveau mot de passe (min. 6 caractères)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-11 pr-11 py-3.5 rounded-xl text-sm font-medium text-white placeholder:text-white/30 outline-none transition-all focus:ring-2 focus:ring-yellow-600/40 focus:border-yellow-600/60"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                tabIndex={-1}
              >
                {showPwd ? <EyeOff className="w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} /> : <Eye className="w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
              <input
                type={showPwd ? "text" : "password"}
                placeholder="Confirmer le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
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
                "Réinitialiser le mot de passe"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Standard variant (FR / Africa) ─────────────────────────────────────────

function StandardResetCard({
  isLoading,
  errorMsg,
  successMsg,
  onSubmit,
}: {
  isLoading: boolean;
  errorMsg: string | null;
  successMsg: string | null;
  onSubmit: (password: string) => void;
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (password !== confirmPassword) {
      setLocalError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 6) {
      setLocalError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    onSubmit(password);
  };

  const displayError = localError || errorMsg;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-brand-100 opacity-50 blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 rounded-full bg-blue-100 opacity-50 blur-3xl" />

          <div className="relative text-center mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Nouveau mot de passe
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              Choisissez un nouveau mot de passe pour votre compte
            </p>
          </div>

          {displayError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm font-medium">{displayError}</div>
            </div>
          )}

          {successMsg ? (
            <>
              <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-start gap-3 text-green-600">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-sm font-medium">{successMsg}</div>
              </div>
              <Link
                href="/login"
                className="block w-full text-center bg-brand-primary hover:bg-brand-dark text-white font-bold text-sm py-3.5 px-6 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
              >
                Se connecter
              </Link>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="Nouveau mot de passe (min. 6 caractères)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-11 pr-11 py-3.5 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-200 outline-none transition-all focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="Confirmer le mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
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
                  "Réinitialiser le mot de passe"
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Retour à la{" "}
              <Link href="/login" className="font-bold text-brand-primary hover:text-brand-dark">
                connexion
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const router = useRouter();
  const tenant = useTenant();

  const handleSubmit = async (password: string) => {
    setIsLoading(true);
    setErrorMsg(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      const msg =
        error.message === "New password should be different from the old password."
          ? "Le nouveau mot de passe doit être différent de l'ancien."
          : error.message === "Auth session missing!"
            ? "Session expirée. Veuillez refaire une demande de réinitialisation."
            : error.message;
      setErrorMsg(msg);
      setIsLoading(false);
      return;
    }

    setSuccessMsg("Mot de passe mis à jour avec succès ! Vous pouvez maintenant vous connecter.");
    setIsLoading(false);
  };

  const props = { isLoading, errorMsg, successMsg, onSubmit: handleSubmit };

  if (tenant.id === "community") return <CommunityResetCard {...props} />;
  return <StandardResetCard {...props} />;
}
