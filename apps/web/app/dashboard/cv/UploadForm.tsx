"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { UploadCloud, File as FileIcon, CheckCircle2, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function UploadForm({ userId, existingCV }: { userId: string, existingCV: any }) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showOptimized, setShowOptimized] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsLoading(true);
    setMessage({ text: "", type: "" });
    const supabase = createClient();

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `cvs/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('bnj-career')
      .upload(filePath, file);

    if (uploadError) {
      setMessage({ text: "Erreur d'upload : " + uploadError.message, type: "error" });
      setIsLoading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('bnj-career')
      .getPublicUrl(filePath);

    const { error: dbError } = await supabase
      .from("cvs")
      .insert({
        user_id: userId,
        pdf_url: publicUrl,
        template: "default"
      });

    if (dbError) {
      setMessage({ text: "Erreur BD : " + dbError.message, type: "error" });
      setIsLoading(false);
      return;
    }

    // 2. Lancer l'analyse du CV via l'API pour récupérer le JSON
    setMessage({ text: "Fichier uploadé ! Analyse de votre profil en cours (patientez...)", type: "success" });
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("https://cv-encryptor.onrender.com/api/extract-cv-upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const jsonResponse = await res.json();
        // Optionnel : L'API renvoie { data: {...} }, on stocke le contenu
        const extractedData = jsonResponse.data || jsonResponse;
        
        // Stockage dans le localStorage pour l'utiliser partout
        localStorage.setItem("user_cv_parsed", JSON.stringify(extractedData));
        
        setMessage({ text: "CV uploadé et analysé avec succès !", type: "success" });
      } else {
        console.error("Erreur d'analyse API", await res.text());
        setMessage({ text: "CV sauvegardé, mais l'analyse IA a échoué. Veuillez réessayer l'analyse plus tard.", type: "error" });
      }
    } catch (apiError) {
      console.error("Exception lors de l'appel à l'API:", apiError);
      setMessage({ text: "CV sauvegardé, mais la connexion à l'IA d'analyse a échoué.", type: "error" });
    }

    setFile(null);
    router.refresh();
    setIsLoading(false);
  };

  return (
    <div className="space-y-6 w-full">
      {existingCV && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900">CV Actuel</p>
              <p className="text-xs text-slate-500 text-ellipsis overflow-hidden max-w-[200px] sm:max-w-xs block whitespace-nowrap">
                {existingCV.pdf_url}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsOptimizing(true);
                setShowOptimized(false);
                setTimeout(() => {
                  setIsOptimizing(false);
                  setShowOptimized(true);
                }, 3000);
              }}
              disabled={isOptimizing || showOptimized}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-primary to-brand-dark text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg disabled:opacity-60 transition-all"
            >
              {isOptimizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isOptimizing ? "Optimisation IA en cours..." : "Optimiser mon CV"}
            </button>
            <a
              href={existingCV.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-brand-primary hover:text-brand-dark px-4 py-2 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
            >
              Voir le CV
            </a>
          </div>
        </div>
      )}

      {/* Avant / Après View */}
      {showOptimized && (
        <div className="bg-gradient-to-br from-brand-dark to-brand-primary rounded-3xl p-8 shadow-xl animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-[100px] pointer-events-none"></div>
          
          <h2 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-2">
            <Sparkles className="text-brand-accent w-6 h-6" /> Le résultat magique
          </h2>

          <div className="flex flex-col lg:flex-row gap-6 items-stretch">
            {/* AVANT */}
            <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex flex-col items-center justify-center text-center">
              <span className="px-3 py-1 bg-white/20 text-white font-bold text-xs rounded-full mb-4">AVANT</span>
              <FileIcon className="w-16 h-16 text-white/50 mb-3" />
              <p className="text-white text-sm font-medium mb-4 line-clamp-2 max-w-[200px]">{existingCV.pdf_url.split('/').pop()}</p>
              <a href={existingCV.pdf_url} target="_blank" className="text-xs font-bold text-brand-accent hover:text-white transition-colors">🔍 Prévisualiser le PDF</a>
            </div>

            <div className="flex justify-center items-center lg:items-center">
              <div className="bg-brand-accent/20 p-2 rounded-full hidden lg:block">
                <ArrowRight className="text-brand-accent w-6 h-6" />
              </div>
            </div>

            {/* APRES */}
            <div className="flex-[1.5] bg-white rounded-2xl p-5 shadow-2xl relative group overflow-hidden">
               <span className="absolute top-4 left-4 z-10 px-3 py-1 bg-gradient-to-r from-brand-accent to-brand-primary text-white font-bold text-xs rounded-full shadow-md">
                 APRÈS (Brouillon IA)
               </span>
               <div className="relative w-full aspect-[1/1.4] rounded-lg overflow-hidden border border-slate-100 mt-8 bg-slate-50">
                 {/* Simulated image generated by Pollinations AI */}
                 <img
                   src={`https://image.pollinations.ai/prompt/Modern%20minimalist%20sleek%20resume%20CV%20design%20document%20layout%20purple%20accent%20colors%20high%20quality?width=800&height=1100&nologo=true&seed=${existingCV.id}`}
                   alt="CV Optimisé"
                   className="object-cover w-full h-full"
                 />
                 <div className="absolute inset-0 bg-brand-dark/0 group-hover:bg-brand-dark/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button className="px-4 py-2 bg-white text-brand-dark font-bold text-sm rounded-lg shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all">
                      Télécharger (Bientôt)
                    </button>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 shadow-sm flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors">
        <input 
          type="file"
          accept=".pdf"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        
        {file ? (
          <div className="flex flex-col items-center">
            <FileIcon className="w-12 h-12 text-blue-500 mb-3" />
            <p className="font-semibold text-slate-800">{file.name}</p>
            <p className="text-xs text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setFile(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={handleUpload}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-lg hover:bg-brand-dark transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : null}
                Uploader
              </button>
            </div>
          </div>
        ) : (
          <div 
            className="flex flex-col items-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center text-brand-primary mb-4">
              <UploadCloud className="w-8 h-8" />
            </div>
            <p className="text-base font-bold text-slate-900">Cliquez pour ajouter un fichier PDF</p>
            <p className="text-sm text-slate-500 mt-2">ou glissez-déposez le fichier ici</p>
            <p className="text-xs text-slate-400 mt-4 text-center max-w-[280px]">
              Formats acceptés : PDF. Taille max : 5 MB.
            </p>
          </div>
        )}
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
