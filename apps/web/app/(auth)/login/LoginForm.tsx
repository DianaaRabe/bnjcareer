"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams, useRouter } from "next/navigation";
import { useTenant } from "@/lib/tenant/context";
import { AlertCircle, Star, ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

const GOLD = "#D4AF37";
const NAVY = "#0F172A";
const SERIF: React.CSSProperties = {
  fontFamily: "'DM Serif Display', Georgia, serif",
  fontWeight: 400,
};

// ─── Community login card ─────────────────────────────────────────────────────

function CommunityLoginCard({ isLoading, errorMsg, onGoogleLogin, onEmailLogin }: {
  isLoading: boolean;
  errorMsg: string | null;
  onGoogleLogin: () => void;
  onEmailLogin: (email: string, password: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEmailLogin(email, password);
  };

  return (
    <div
      className="min-h-screen flex items-stretch"
      style={{ background: NAVY }}
    >
      {/* Left panel — brand / visual */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-12 relative overflow-hidden"
        style={{ background: `linear-gradient(160deg, #0d1f4f 0%, ${NAVY} 100%)` }}
      >
        {/* Decorations */}
        <div
          className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${GOLD} 0%, transparent 70%)`, transform: "translate(40%, -40%)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-8 pointer-events-none"
          style={{ background: `radial-gradient(circle, #1E3A8A 0%, transparent 70%)`, transform: "translate(-40%, 40%)" }}
        />
        {/* Gold line */}
        <div className="absolute top-0 right-0 bottom-0 w-px" style={{ background: `linear-gradient(180deg, transparent, ${GOLD}30, transparent)` }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center border"
            style={{ background: `${GOLD}18`, borderColor: `${GOLD}40` }}
          >
            <Star className="w-5 h-5" style={{ color: GOLD }} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-white font-black text-sm">BNJ Community</p>
            <p className="text-[10px] tracking-widest uppercase" style={{ color: `${GOLD}70` }}>Réseau · Excellence</p>
          </div>
        </div>

        {/* Central quote */}
        <div className="relative z-10 space-y-6">
          <p
            className="text-5xl text-white leading-tight"
            style={SERIF}
          >
            "Votre réseau est votre capital."
          </p>
          <div className="w-12 h-0.5 rounded-full" style={{ background: GOLD }} />
          <p className="text-sm font-light" style={{ color: "rgba(255,255,255,0.5)" }}>
            Rejoignez une communauté de professionnels engagés dans l'excellence et la réussite collective.
          </p>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 grid grid-cols-2 gap-6">
          {[
            { v: "500+", l: "Membres actifs" },
            { v: "94%",  l: "Satisfaction" },
          ].map(s => (
            <div key={s.l}>
              <p className="text-2xl font-black text-white" style={SERIF}>{s.v}</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16">
        <div className="w-full max-w-sm space-y-8">

          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>

          {/* Header */}
          <div className="space-y-3">
            <p className="text-xs font-black tracking-widest uppercase" style={{ color: `${GOLD}80` }}>
              Espace membres
            </p>
            <h1 className="text-4xl text-white" style={SERIF}>
              Bienvenue
            </h1>
            <p className="text-sm font-light" style={{ color: "rgba(255,255,255,0.5)" }}>
              Connectez-vous pour accéder à votre espace personnalisé.
            </p>
          </div>

          {/* Gold divider */}
          <div className="h-px" style={{ background: `linear-gradient(90deg, ${GOLD}40, transparent)` }} />

          {/* Error */}
          {errorMsg && (
            <div className="p-4 rounded-2xl flex items-start gap-3 text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Email / Password form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-medium text-white placeholder:text-white/30 outline-none transition-all focus:ring-2 focus:ring-yellow-600/40 focus:border-yellow-600/60"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
              <input
                type={showPwd ? "text" : "password"}
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-11 py-3.5 rounded-xl text-sm font-medium text-white placeholder:text-white/30 outline-none transition-all focus:ring-2 focus:ring-yellow-600/40 focus:border-yellow-600/60"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                tabIndex={-1}
              >
                {showPwd
                  ? <EyeOff className="w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
                  : <Eye className="w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />}
              </button>
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
                <>
                  <Mail className="w-4 h-4" />
                  Se connecter
                </>
              )}
            </button>
          </form>

          <div className="text-right -mt-2">
            <Link href="/forgot-password" className="text-xs font-medium hover:underline" style={{ color: "rgba(255,255,255,0.4)" }}>
              Mot de passe oublié ?
            </Link>
          </div>

          {/* Separator */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
            <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.25)" }}>ou</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
          </div>

          {/* Google button */}
          <button
            onClick={onGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-4 px-6 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Se connecter avec Google
          </button>

          <p className="text-center text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Pas encore de compte ?{" "}
            <Link href="/signup" className="font-bold hover:underline" style={{ color: GOLD }}>
              Créer un compte
            </Link>
          </p>

          <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
            En vous connectant, vous acceptez nos conditions d'utilisation.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Standard login card (FR / Africa) ───────────────────────────────────────

function StandardLoginCard({ isLoading, errorMsg, onGoogleLogin, onEmailLogin }: {
  isLoading: boolean;
  errorMsg: string | null;
  onGoogleLogin: () => void;
  onEmailLogin: (email: string, password: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEmailLogin(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-brand-100 opacity-50 blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 rounded-full bg-blue-100 opacity-50 blur-3xl" />

          <div className="relative text-center mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Bienvenue</h1>
            <p className="text-slate-500 mt-2 font-medium">Connectez-vous pour accéder à BNJ Skills Maker</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm font-medium">{errorMsg}</div>
            </div>
          )}

          {/* Email / Password form */}
          <form onSubmit={handleSubmit} className="space-y-3 mb-6">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-200 outline-none transition-all focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPwd ? "text" : "password"}
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-primary hover:bg-brand-dark text-white font-bold text-sm py-3.5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Se connecter
                </>
              )}
            </button>
          </form>

          <div className="text-right -mt-3 mb-4">
            <Link href="/forgot-password" className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors">
              Mot de passe oublié ?
            </Link>
          </div>

          {/* Separator */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs font-semibold text-slate-400">ou</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Google button */}
          <button
            onClick={onGoogleLogin}
            disabled={isLoading}
            className="w-full relative group overflow-hidden bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-700 font-bold text-sm py-3.5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-4 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Se connecter avec Google</span>
          </button>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-slate-500">
              Pas encore de compte ?{" "}
              <Link href="/signup" className="font-bold text-brand-primary hover:text-brand-dark">
                Créer un compte
              </Link>
            </p>
            <p className="text-xs text-slate-400 font-medium">
              En vous connectant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const tenant = useTenant();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "true") setErrorMsg("Une erreur est survenue lors de la connexion.");
    else if (error) setErrorMsg(decodeURIComponent(error));
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    // Persist the current tenant so the callback can redirect correctly
    // (the OAuth flow loses URL query params like ?tenant=community)
    document.cookie = `intended_tenant=${tenant.id}; path=/; max-age=600; SameSite=Lax`;

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    if (error) {
      setErrorMsg(error.message);
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setErrorMsg(null);

    const supabase = createClient();
    const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      // Translate common Supabase auth errors to French
      const msg =
        error.message === "Invalid login credentials"
          ? "Email ou mot de passe incorrect."
          : error.message === "Email not confirmed"
            ? "Votre email n'est pas encore confirmé."
            : error.message;
      setErrorMsg(msg);
      setIsLoading(false);
      return;
    }

    // Check profile role to redirect correctly (coach → /coach, else → /dashboard)
    let targetPath = "/dashboard";
    if (signInData.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", signInData.user.id)
        .single();
      if (profile?.role === "coach") targetPath = "/coach";
      else if (profile?.role === "admin") targetPath = "/admin";
    }

    router.refresh();
    window.location.href = targetPath;
  };

  const props = { isLoading, errorMsg, onGoogleLogin: handleGoogleLogin, onEmailLogin: handleEmailLogin };

  if (tenant.id === "community") return <CommunityLoginCard {...props} />;
  return <StandardLoginCard {...props} />;
}
