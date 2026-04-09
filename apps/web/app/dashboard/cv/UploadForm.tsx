"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { UploadCloud, File as FileIcon, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UploadForm({ userId, existingCV }: { userId: string, existingCV: any }) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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
    } else {
      setMessage({ text: "CV uploadé avec succès !", type: "success" });
      setFile(null);
      router.refresh();
    }
    
    setIsLoading(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
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
          <a
            href={existingCV.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-brand-primary hover:text-brand-dark px-4 py-2 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
          >
            Voir le CV
          </a>
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
