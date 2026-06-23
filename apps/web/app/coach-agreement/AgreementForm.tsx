"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2, PenLine } from "lucide-react";

interface Props {
  contractVersion: string;
  defaultName: string;
  userEmail: string;
}

export function CoachAgreementForm({ contractVersion, defaultName, userEmail }: Props) {
  const router = useRouter();
  const [name, setName] = useState(defaultName);
  const [accepted, setAccepted] = useState(false);
  const [confirmIdentity, setConfirmIdentity] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = name.trim().length >= 3 && accepted && confirmIdentity && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/coach/agreement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractVersion,
          signedName: name.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Une erreur est survenue. Réessayez.");
      }

      // Success: route to coach dashboard
      router.replace("/coach");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erreur réseau");
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gradient-to-br from-brand-primary/15 to-brand-accent/5 border border-brand-accent/20 rounded-3xl p-8 md:p-10 space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-accent/20 flex items-center justify-center text-brand-accent">
          <PenLine className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-extrabold text-white">Acceptation et signature</h2>
      </div>

      {/* Identity confirmation */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={confirmIdentity}
          onChange={(e) => setConfirmIdentity(e.target.checked)}
          disabled={submitting}
          className="mt-1 w-4 h-4 accent-brand-accent cursor-pointer"
        />
        <span className="text-sm text-white/80 group-hover:text-white transition-colors">
          Je certifie sur l'honneur que les informations fournies lors de mon inscription (identité,
          parcours professionnel, certifications, domaines d'expertise) sont exactes et véridiques.
        </span>
      </label>

      {/* Terms acceptance */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          disabled={submitting}
          className="mt-1 w-4 h-4 accent-brand-accent cursor-pointer"
        />
        <span className="text-sm text-white/80 group-hover:text-white transition-colors">
          J'ai lu et j'accepte sans réserve les{" "}
          <strong className="text-brand-accent">9 articles de la convention</strong> ci-dessus, et
          notamment la <strong className="text-brand-accent">répartition des revenus (25% / 75%)</strong>{" "}
          détaillée aux articles 3 et 4.
        </span>
      </label>

      {/* Signature line */}
      <div className="space-y-2">
        <label htmlFor="signedName" className="block text-xs font-black text-white/60 uppercase tracking-widest">
          Signature électronique — saisissez votre nom complet
        </label>
        <input
          id="signedName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={submitting}
          placeholder="Prénom Nom"
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 font-medium focus:border-brand-accent focus:bg-white/15 outline-none transition-all"
          required
        />
        <p className="text-[11px] text-white/40">
          En signant, vous reconnaissez que cette signature électronique a la même valeur juridique qu'une
          signature manuscrite (article 1367 du Code civil).
        </p>
      </div>

      {/* Audit trail info */}
      <div className="bg-white/5 rounded-xl p-4 text-xs text-white/50 space-y-1">
        <p>📋 Pour des raisons légales et d'audit, nous enregistrons :</p>
        <ul className="pl-4 space-y-0.5">
          <li>• Votre identifiant : {userEmail || "(non disponible)"}</li>
          <li>• La date et l'heure d'acceptation</li>
          <li>• Votre adresse IP et votre navigateur</li>
          <li>• La version du contrat : {contractVersion}</li>
        </ul>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-brand-accent text-brand-dark rounded-2xl font-extrabold text-base shadow-xl shadow-brand-accent/20 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {submitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Enregistrement…
          </>
        ) : (
          <>
            <CheckCircle2 className="w-5 h-5" />
            Signer et accéder à mon espace coach
          </>
        )}
      </button>
    </form>
  );
}
