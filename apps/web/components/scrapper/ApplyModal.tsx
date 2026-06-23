import React, { useState, useEffect, useRef } from 'react';
import { X, UploadCloud, Copy, ExternalLink, CheckCircle, BrainCircuit, Mail, AlertCircle, Download, User, Phone, AtSign, FileText, ClipboardList, ArrowLeft, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// ─── Types ──────────────────────────────────────────────────────────────────

interface CandidateInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  industry: string;
  cvPdfUrl: string | null;
  atsOptimizedSummary: string | null;
  atsOptimizedHtml: string | null;
}

// ─── Clipboard copy helper ──────────────────────────────────────────────────

function CopyField({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  const [copied, setCopied] = useState(false);

  if (!value) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-4 py-3 group hover:border-brand-primary/30 transition-colors">
      <div className="text-slate-400 shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-slate-800 truncate">{value}</p>
      </div>
      <button
        onClick={handleCopy}
        className="shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all bg-slate-50 hover:bg-brand-100 text-slate-500 hover:text-brand-primary"
      >
        {copied ? (
          <><CheckCircle className="w-3.5 h-3.5 text-green-600" /><span className="text-green-600">Copié</span></>
        ) : (
          <><Copy className="w-3.5 h-3.5" />Copier</>
        )}
      </button>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export const ApplyModal = ({ job, onClose, onApplied }: { job: any; onClose: () => void; onApplied: () => void }) => {
  const [step, setStep] = useState<'loading' | 'upload' | 'analyzing' | 'ready' | 'assist'>('loading');
  const [parsedCv, setParsedCv] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [candidateInfo, setCandidateInfo] = useState<CandidateInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);

  const hasEmails = job.emails && job.emails.length > 0;

  // ── Fetch candidate profile + CV data for assist panel ──────────────────
  const fetchCandidateInfo = async () => {
    setLoadingInfo(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone, bio, industry')
        .eq('id', user.id)
        .single();

      // Fetch CV PDF
      const { data: cvs } = await supabase
        .from('cvs')
        .select('pdf_url')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      // Fetch ATS-optimized CV for this specific job (if exists)
      let atsOptimizedSummary: string | null = null;
      let atsOptimizedHtml: string | null = null;
      const jobTitle = job.title || '';
      const jobCompany = job.companyName || '';

      if (jobTitle) {
        const { data: atsVersions } = await supabase
          .from('job_cv_versions')
          .select('match_summary, optimized_html, status')
          .eq('user_id', user.id)
          .eq('job_title', jobTitle)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(1);

        if (atsVersions && atsVersions.length > 0) {
          atsOptimizedSummary = atsVersions[0].match_summary;
          atsOptimizedHtml = atsVersions[0].optimized_html;
        }
      }

      setCandidateInfo({
        firstName: profile?.first_name || '',
        lastName: profile?.last_name || '',
        email: user.email || '',
        phone: profile?.phone || '',
        bio: profile?.bio || '',
        industry: profile?.industry || '',
        cvPdfUrl: cvs?.[0]?.pdf_url || null,
        atsOptimizedSummary,
        atsOptimizedHtml,
      });
    } catch (err) {
      console.error('Erreur fetch candidate info:', err);
    } finally {
      setLoadingInfo(false);
    }
  };

  // ── Email send ────────────────────────────────────────────────────────────
  const handleSendEmail = async () => {
    if (!hasEmails) return;
    setIsSendingEmail(true);
    setEmailError('');

    try {
      const companyEmail = job.emails[0];
      const res = await fetch('/api/candiboost/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyEmail,
          jobTitle: getJobTitle(),
          coverLetter: generateMotivation(),
          isGeneric: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'envoi de l'email.");

      setEmailSent(true);
      onApplied();
      const jobKey = job.id || job.jobKey || job.url;
      if (jobKey) localStorage.setItem(`applied_${jobKey}`, 'true');
    } catch (err: any) {
      setEmailError(err.message || 'Erreur inattendue');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const savedCv = localStorage.getItem('user_cv_parsed');
    if (savedCv) {
      try {
        setParsedCv(JSON.parse(savedCv));
        setStep('ready');
      } catch {
        setStep('upload');
      }
    } else {
      setStep('upload');
    }

    // Pre-fetch candidate info for the assist panel
    fetchCandidateInfo();

    return () => { document.body.style.overflow = 'unset'; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── CV upload ─────────────────────────────────────────────────────────────
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setStep('analyzing');
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('https://cv-encryptor.onrender.com/api/extract-cv-upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error("Erreur lors de l'analyse du CV");
      const data = await res.json();

      setParsedCv(data);
      localStorage.setItem('user_cv_parsed', JSON.stringify(data));
      setStep('ready');
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'analyse du CV via l'IA. Veuillez réessayer avec un PDF valide.");
      setStep('upload');
    }
  };

  const getJobTitle = () => job.title || 'ce poste';
  const getJobCompany = () => job.companyName || 'votre entreprise';

  const generateMotivation = () => {
    const title = getJobTitle();
    const company = getJobCompany();

    let skill = "mes domaines d'expertise";
    if (parsedCv?.skills && Array.isArray(parsedCv.skills) && parsedCv.skills.length > 0) {
      skill = parsedCv.skills[0];
    } else if (parsedCv?.competences && Array.isArray(parsedCv.competences) && parsedCv.competences.length > 0) {
      skill = typeof parsedCv.competences[0] === 'string' ? parsedCv.competences[0] : (parsedCv.competences[0].name || skill);
    } else if (parsedCv?.domain) {
      skill = parsedCv.domain;
    }

    return `Bonjour,\n\nJe souhaite postuler au poste de ${title} chez ${company}.\nMon profil correspond aux compétences recherchées, notamment en ${skill}.\n\nJe reste disponible pour échanger.\n\nCordialement.`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMotivation());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Apply → show assist panel FIRST, then user decides when to go ────────
  const handleApply = () => {
    // Show the assist panel — do NOT open the external URL yet
    setStep('assist');
  };

  // ── Actually open the external platform (called from assist panel) ──────
  const handleGoToPlatform = () => {
    const jobKey = job.id || job.jobKey || job.url;
    if (jobKey) localStorage.setItem(`applied_${jobKey}`, 'true');
    onApplied();

    const urlToOpen = job.applyUrl || job.url || job.jobUrl;
    if (urlToOpen) {
      window.open(urlToOpen, '_blank');
    }
  };

  if (step === 'loading') return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fade-in" onClick={onClose} />

      <div className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className={`px-8 py-6 relative flex flex-col ${step === 'assist' ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500' : 'bg-gradient-to-r from-brand-dark via-brand-primary to-brand-light'}`}>
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="pr-10">
            <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full mb-3 tracking-wider uppercase border border-white/20">
              {step === 'assist' ? '📋 Copie rapide' : 'Candidature Intelligente'}
            </span>
            <h2 className="text-2xl font-extrabold text-white mb-1 leading-tight line-clamp-2">
              {step === 'assist' ? getJobTitle() : getJobTitle()}
            </h2>
            <p className="text-white/80 font-medium text-sm">
              {step === 'assist' ? `Copiez vos infos avant d'aller sur ${job.source || 'la plateforme'}` : `Chez ${getJobCompany()}`}
            </p>
          </div>
        </div>

        {/* ── Body ────────────────────────────────────────────────────── */}
        <div className="p-8 overflow-y-auto bg-brand-bg">

          {/* ── Upload step ─────────────────────────────────────────── */}
          {step === 'upload' && (
            <div className="text-center">
              <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-primary">
                <UploadCloud className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Configurez votre profil</h3>
              <p className="text-sm text-slate-500 mb-8 max-w-sm mx-auto">
                Uploadez votre CV (PDF). Notre IA l'analysera une seule fois pour générer automatiquement vos futurs messages de candidature.
              </p>

              <form onSubmit={handleUpload}>
                <div
                  className="border-2 border-dashed border-brand-light/30 bg-white hover:bg-brand-100/30 transition-colors p-6 rounded-2xl mb-6 cursor-pointer flex flex-col items-center justify-center"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <UploadCloud className="w-8 h-8 text-brand-light mb-2" />
                  <p className="text-sm font-semibold text-brand-primary">
                    {file ? file.name : 'Cliquez pour sélectionner un CV'}
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={!file}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-brand-primary hover:bg-brand-dark text-white font-bold rounded-xl shadow-lg disabled:opacity-50 transition-all"
                >
                  Analyser mon profil
                </button>
              </form>
            </div>
          )}

          {/* ── Analyzing step ──────────────────────────────────────── */}
          {step === 'analyzing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <BrainCircuit className="w-16 h-16 text-brand-primary animate-pulse mb-6" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">Analyse du CV en cours...</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                Notre IA extrait vos compétences et votre expérience pour préparer la candidature parfaite.
              </p>
            </div>
          )}

          {/* ── Ready step (original) ───────────────────────────────── */}
          {step === 'ready' && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6 bg-green-50 text-green-700 p-4 rounded-xl border border-green-200">
                <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Votre candidature est prête !</h4>
                  <p className="text-xs opacity-90">CV analysé et message pré-écrit.</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-slate-700">Message généré :</label>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:text-brand-dark transition-colors bg-brand-100 px-3 py-1.5 rounded-lg"
                  >
                    {copied ? (
                      <span className="text-green-600 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Copié !</span>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> Copier le message</>
                    )}
                  </button>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap shadow-sm">
                  {generateMotivation()}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleApply}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-white border-2 border-brand-primary text-brand-primary font-extrabold text-base rounded-xl hover:bg-brand-50 transition-all duration-300"
                >
                  <ExternalLink className="w-5 h-5" />
                  Candidater sur la plateforme
                </button>

                <div className="relative group">
                  <button
                    onClick={handleSendEmail}
                    disabled={!hasEmails || isSendingEmail || emailSent}
                    className={`w-full flex items-center justify-center gap-2 py-4 font-extrabold text-base rounded-xl transition-all duration-300 shadow-xl shadow-brand-primary/20 ${
                      emailSent
                        ? 'bg-green-50 text-green-700 border-2 border-green-200 cursor-default shadow-none'
                        : hasEmails
                          ? 'bg-gradient-to-r from-brand-primary to-brand-dark hover:from-brand-light hover:to-brand-primary text-white hover:scale-[1.02]'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    {emailSent ? (
                      <><CheckCircle className="w-5 h-5" /> Candidature envoyée !</>
                    ) : isSendingEmail ? (
                      <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Envoi en cours...</>
                    ) : (
                      <><Mail className="w-5 h-5" /> Envoyer ma candidature par email</>
                    )}
                  </button>

                  {!hasEmails && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      Aucun email de contact disponible
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45" />
                    </div>
                  )}
                </div>

                {emailError && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">{emailError}</p>
                  </div>
                )}
              </div>
              <p className="text-center text-xs text-slate-400 mt-4 font-medium">
                N'oubliez pas de coller le message sur la plateforme de destination !
              </p>
            </div>
          )}

          {/* ── Assist panel (after redirect) ───────────────────────── */}
          {step === 'assist' && (
            <div className="animate-fade-in">
              {/* Info banner */}
              <div className="flex items-center gap-3 mb-6 bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-200">
                <ClipboardList className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Préparez votre candidature</h4>
                  <p className="text-xs opacity-90">Copiez vos infos ci-dessous, puis cliquez sur le bouton pour aller sur la plateforme.</p>
                </div>
              </div>

              {loadingInfo ? (
                <div className="py-8 flex flex-col items-center text-center">
                  <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-sm text-slate-500">Chargement de vos informations...</p>
                </div>
              ) : candidateInfo ? (
                <div className="space-y-3">
                  {/* ── Identity fields ──────────────────────────────── */}
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-2">Identité</p>

                  <CopyField
                    label="Nom complet"
                    value={[candidateInfo.firstName, candidateInfo.lastName].filter(Boolean).join(' ')}
                    icon={<User className="w-4 h-4" />}
                  />
                  <CopyField
                    label="Prénom"
                    value={candidateInfo.firstName}
                    icon={<User className="w-4 h-4" />}
                  />
                  <CopyField
                    label="Nom"
                    value={candidateInfo.lastName}
                    icon={<User className="w-4 h-4" />}
                  />
                  <CopyField
                    label="Email"
                    value={candidateInfo.email}
                    icon={<AtSign className="w-4 h-4" />}
                  />
                  {candidateInfo.phone && (
                    <CopyField
                      label="Téléphone"
                      value={candidateInfo.phone}
                      icon={<Phone className="w-4 h-4" />}
                    />
                  )}

                  {/* ── CV & ATS ─────────────────────────────────────── */}
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-5">CV & Profil</p>

                  {candidateInfo.industry && (
                    <CopyField
                      label="Secteur"
                      value={candidateInfo.industry}
                      icon={<ClipboardList className="w-4 h-4" />}
                    />
                  )}

                  {/* Message de motivation — copie rapide */}
                  {parsedCv && (
                    <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Message de motivation</p>
                        <button
                          onClick={handleCopy}
                          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-brand-100 text-slate-500 hover:text-brand-primary transition-all"
                        >
                          {copied ? (
                            <><CheckCircle className="w-3.5 h-3.5 text-green-600" /><span className="text-green-600">Copié</span></>
                          ) : (
                            <><Copy className="w-3.5 h-3.5" />Copier</>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 whitespace-pre-wrap line-clamp-4">{generateMotivation()}</p>
                    </div>
                  )}

                  {/* ATS optimized summary */}
                  {candidateInfo.atsOptimizedSummary && (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 px-4 py-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">CV optimisé ATS pour cette offre</p>
                      </div>
                      <p className="text-xs text-amber-800 leading-relaxed">{candidateInfo.atsOptimizedSummary}</p>
                    </div>
                  )}

                  {/* CV Download button */}
                  {candidateInfo.cvPdfUrl && (
                    <a
                      href={candidateInfo.cvPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-3 bg-white border-2 border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      Télécharger mon CV (PDF)
                    </a>
                  )}

                  {/* Main CTA — go to platform */}
                  <button
                    onClick={handleGoToPlatform}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base rounded-xl transition-all shadow-lg shadow-emerald-600/20 hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Aller sur la plateforme →
                  </button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-slate-500">Impossible de charger vos informations.</p>
                  <button
                    onClick={fetchCandidateInfo}
                    className="mt-3 text-sm font-bold text-brand-primary hover:text-brand-dark"
                  >
                    Réessayer
                  </button>
                </div>
              )}

              {/* Back to ready step */}
              <button
                onClick={() => setStep('ready')}
                className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors mx-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Retour au message
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
