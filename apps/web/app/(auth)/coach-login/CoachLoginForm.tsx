"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";

export default function CoachLoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "true") {
      setErrorMsg("Une erreur est survenue lors de la connexion.");
    } else if (error) {
      setErrorMsg(decodeURIComponent(error));
    }
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    const supabase = createClient();
    
    // Set a cookie to remember the role across the OAuth redirect
    document.cookie = "intended_role=coach; path=/; max-age=3600";

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="p-8 sm:p-12 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-orange-100 opacity-50 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 rounded-full bg-brand-100 opacity-50 blur-3xl"></div>
          
          <div className="relative text-center mb-10">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Espace Coach</h1>
            <p className="text-slate-500 mt-2 font-medium">Connectez-vous pour guider vos candidats</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm font-medium">{errorMsg}</div>
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full relative group overflow-hidden bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-700 font-bold text-lg py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-4 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Continuer avec Google</span>
              </>
            )}
          </button>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400 font-medium">
              En vous connectant, vous acceptez nos conditions d'utilisation concernant la plateforme coaching BNJ Skills Maker.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
