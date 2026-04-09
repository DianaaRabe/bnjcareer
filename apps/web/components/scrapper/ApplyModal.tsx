import React, { useState, useEffect, useRef } from 'react';
import { X, UploadCloud, Copy, ExternalLink, CheckCircle, BrainCircuit } from 'lucide-react';

export const ApplyModal = ({ job, onClose, onApplied }: { job: any, onClose: () => void, onApplied: () => void }) => {
    const [step, setStep] = useState<'loading' | 'upload' | 'analyzing' | 'ready'>('loading');
    const [parsedCv, setParsedCv] = useState<any>(null);
    const [file, setFile] = useState<File | null>(null);
    const [copied, setCopied] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        
        // Vérification de l'existence d'un CV analysé dans le LocalStorage
        const savedCv = localStorage.getItem('user_cv_parsed');
        if (savedCv) {
            try {
                setParsedCv(JSON.parse(savedCv));
                setStep('ready');
            } catch (e) {
                setStep('upload');
            }
        } else {
            setStep('upload');
        }

        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;
        
        setStep('analyzing');
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const res = await fetch('https://cv-encryptor.onrender.com/api/extract-cv-upload', {
                method: 'POST',
                body: formData
            });
            
            if (!res.ok) throw new Error('Erreur lors de l\'analyse du CV');
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

    const getJobTitle = () => job.positionName || job.title || 'ce poste';
    const getJobCompany = () => typeof job.company === 'object' ? job.company?.name || 'votre entreprise' : (job.company || 'votre entreprise');

    const generateMotivation = () => {
        const title = getJobTitle();
        const company = getJobCompany();
        
        // Extraction intelligente des compétences du CV analysé
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

    const handleApply = () => {
        // Enregistrer l'action pour griser le bouton plus tard
        const jobKey = job.id || job.jobKey || job.url;
        if (jobKey) localStorage.setItem(`applied_${jobKey}`, "true");
        
        onApplied(); // Met à jour l'UI parente
        
        // Redirection
        const urlToOpen = job.applyUrl || job.url || job.jobUrl;
        if (urlToOpen) {
            window.open(urlToOpen, "_blank");
        } else {
            alert("Aucun lien de candidature direct trouvé pour ce poste. Visitez Indeed.");
        }
        onClose();
    };

    if (step === 'loading') return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fade-in" onClick={onClose}></div>
            
            <div className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-gradient-to-r from-brand-dark via-brand-primary to-brand-light px-8 py-6 relative flex flex-col">
                    <button 
                        onClick={onClose}
                        className="absolute top-5 right-5 text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="pr-10">
                        <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full mb-3 tracking-wider uppercase border border-white/20">
                            Candidature Intelligente
                        </span>
                        <h2 className="text-2xl font-extrabold text-white mb-1 leading-tight line-clamp-2">
                            {getJobTitle()}
                        </h2>
                        <p className="text-white/80 font-medium text-sm">Chez {getJobCompany()}</p>
                    </div>
                </div>

                {/* Body */}
                <div className="p-8 overflow-y-auto bg-brand-bg">
                    
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
                                        {file ? file.name : "Cliquez pour sélectionner un CV"}
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

                    {step === 'analyzing' && (
                        <div className="py-12 flex flex-col items-center justify-center text-center">
                            <BrainCircuit className="w-16 h-16 text-brand-primary animate-pulse mb-6" />
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Analyse du CV en cours...</h3>
                            <p className="text-sm text-slate-500 max-w-xs mx-auto">
                                Notre IA extrait vos compétences et votre expérience pour préparer la candidature parfaite.
                            </p>
                        </div>
                    )}

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
                                        {copied ? <span className="text-green-600 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5"/> Copié !</span> : <><Copy className="w-3.5 h-3.5" /> Copier le message</>}
                                    </button>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap shadow-sm">
                                    {generateMotivation()}
                                </div>
                            </div>
                            
                            <button 
                                onClick={handleApply}
                                className="w-full flex items-center justify-center gap-2 py-4.5 bg-gradient-to-r from-brand-primary to-brand-dark hover:from-brand-light hover:to-brand-primary text-white font-extrabold text-lg rounded-xl shadow-xl shadow-brand-primary/30 transition-all duration-300 hover:scale-[1.02]"
                            >
                                <ExternalLink className="w-5 h-5" />
                                Candidater sur la plateforme
                            </button>
                            <p className="text-center text-xs text-slate-400 mt-4 font-medium">
                                N'oubliez pas de coller le message sur la plateforme de destination !
                            </p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
