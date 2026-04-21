"use client";

import React, { useState, useEffect } from 'react';
import { ApplyModal } from './ApplyModal';
import { Search, MapPin, Briefcase, DollarSign, Building, Sparkles, CheckCircle, Clock, History } from 'lucide-react';
import { createClient } from "@/lib/supabase/client";

const COUNTRIES = [
        { code: 'za', label: 'Afrique du Sud' },
        { code: 'de', label: 'Allemagne' },
        { code: 'sa', label: 'Arabie Saoudite' },
        { code: 'ar', label: 'Argentine' },
        { code: 'au', label: 'Australie' },
        { code: 'at', label: 'Autriche' },
        { code: 'bh', label: 'Bahreïn' },
        { code: 'be', label: 'Belgique' },
        { code: 'br', label: 'Brésil' },
        { code: 'ca', label: 'Canada' },
        { code: 'cl', label: 'Chili' },
        { code: 'cn', label: 'Chine' },
        { code: 'co', label: 'Colombie' },
        { code: 'kr', label: 'Corée du Sud' },
        { code: 'cr', label: 'Costa Rica' },
        { code: 'dk', label: 'Danemark' },
        { code: 'eg', label: 'Égypte' },
        { code: 'ae', label: 'Émirats Arabes Unis' },
        { code: 'ec', label: 'Équateur' },
        { code: 'es', label: 'Espagne' },
        { code: 'us', label: 'États-Unis' },
        { code: 'fi', label: 'Finlande' },
        { code: 'fr', label: 'France' },
        { code: 'gr', label: 'Grèce' },
        { code: 'hk', label: 'Hong Kong' },
        { code: 'hu', label: 'Hongrie' },
        { code: 'in', label: 'Inde' },
        { code: 'id', label: 'Indonésie' },
        { code: 'ie', label: 'Irlande' },
        { code: 'il', label: 'Israël' },
        { code: 'it', label: 'Italie' },
        { code: 'jp', label: 'Japon' },
        { code: 'kw', label: 'Koweït' },
        { code: 'lu', label: 'Luxembourg' },
        { code: 'my', label: 'Malaisie' },
        { code: 'ma', label: 'Maroc' },
        { code: 'mx', label: 'Mexique' },
        { code: 'ng', label: 'Nigeria' },
        { code: 'no', label: 'Norvège' },
        { code: 'nz', label: 'Nouvelle-Zélande' },
        { code: 'om', label: 'Oman' },
        { code: 'pk', label: 'Pakistan' },
        { code: 'pa', label: 'Panama' },
        { code: 'nl', label: 'Pays-Bas' },
        { code: 'pe', label: 'Pérou' },
        { code: 'ph', label: 'Philippines' },
        { code: 'pl', label: 'Pologne' },
        { code: 'pt', label: 'Portugal' },
        { code: 'qa', label: 'Qatar' },
        { code: 'ro', label: 'Roumanie' },
        { code: 'uk', label: 'Royaume-Uni' },
        { code: 'sg', label: 'Singapour' },
        { code: 'se', label: 'Suède' },
        { code: 'ch', label: 'Suisse' },
        { code: 'tw', label: 'Taïwan' },
        { code: 'cz', label: 'Tchéquie' },
        { code: 'th', label: 'Thaïlande' },
        { code: 'tr', label: 'Turquie' },
        { code: 'ua', label: 'Ukraine' },
        { code: 'uy', label: 'Uruguay' },
        { code: 've', label: 'Venezuela' },
        { code: 'vn', label: 'Vietnam' }
    ];

export const IndeedScrapper = ({ userId }: { userId?: string }) => {
    const [query, setQuery] = useState('Analyst');
    const [location, setLocation] = useState('Paris');
    const [country, setCountry] = useState('fr');
    const [loading, setLoading] = useState(false);
    const [jobs, setJobs] = useState<any[]>([]);
    const [selectedJob, setSelectedJob] = useState<any>(null);
    const [error, setError] = useState('');
    const [appliedJobs, setAppliedJobs] = useState<Record<string, boolean>>({});
    const [history, setHistory] = useState<any[]>([]);


    const syncAppliedJobs = () => {
        const applied: Record<string, boolean> = {};
        jobs.forEach((job: any) => {
            const key = job.id || job.jobKey || job.url;
            if (key && localStorage.getItem(`applied_${key}`)) {
                applied[key] = true;
            }
        });
        setAppliedJobs(applied);
    };

    // Synchronisation des candidatures
    useEffect(() => {
        syncAppliedJobs();
    }, [jobs]);

    // Chargement de l'historique au montage
    useEffect(() => {
        const fetchHistory = async () => {
            if (!userId) return;
            const supabase = createClient();
            const { data } = await supabase
                .from('job_searches')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(10);
            
            if (data) setHistory(data);
        };
        fetchHistory();
    }, [userId]);

    const handleSearch = async (e?: React.FormEvent, forceRefresh = false, searchQ = query, searchL = location, searchC = country) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError('');
        setJobs([]);
        
        // Formattage basique pour comparaison
        const qRaw = searchQ.trim().toLowerCase();
        const lRaw = searchL.trim().toLowerCase();
        const cRaw = searchC.trim().toLowerCase();

        // 1. Vérification dans l'historique local (cache)
        if (!forceRefresh) {
            // NOTE: Si 'country' n'existe pas encore en DB on compare juste query et location, 
            // mais l'idéal est de l'ajouter en DB plus tard.
            const cached = history.find(h => 
                h.query.toLowerCase() === qRaw && 
                h.location.toLowerCase() === lRaw &&
                (h.country ? h.country.toLowerCase() === cRaw : true)
            );
            
            if (cached && cached.results) {
                setJobs(cached.results);
                setQuery(searchQ);
                setLocation(searchL);
                setCountry(searchC);
                setLoading(false);
                return;
            }
        }

        // 2. Appel à Apify si non trouvé ou si on force un rafraîchissement
        try {
            const res = await fetch('/api/scrapper', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: searchQ, location: searchL, country: searchC })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            
            const newJobs = data.items || [];
            setJobs(newJobs);

            // 3. Sauvegarde dans Supabase
            if (userId && newJobs.length > 0) {
                const supabase = createClient();
                // Assure-toi d'ajouter la colonne 'country' à ta table 'job_searches' dans Supabase !
                const { data: inserted } = await supabase.from('job_searches').insert({
                    user_id: userId,
                    query: searchQ,
                    location: searchL,
                    country: searchC,
                    results: newJobs
                }).select().single();
                
                if (inserted) {
                    setHistory(prev => [inserted, ...prev.filter(h => h.query.toLowerCase() !== qRaw || h.location.toLowerCase() !== lRaw)].slice(0, 10));
                }
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-brand-primary" />
                    Chasseur d'Opportunités
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                    Découvrez les meilleures offres d'emploi sur Indeed et postulez en un clic grâce à notre IA
                </p>
            </div>

            {/* Search form */}
            <form onSubmit={handleSearch} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Briefcase className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all"
                        placeholder="Titre du poste (ex: Développeur React)"
                    />
                </div>
                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all"
                        placeholder="Emplacement (ex: Paris, Remote)"
                    />
                </div>
                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <select
                        value={country}
                        onChange={e => setCountry(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all appearance-none"
                    >
                        {COUNTRIES.map(c => (
                            <option key={c.code} value={c.code}>{c.label} ({c.code.toUpperCase()})</option>
                        ))}
                    </select>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex justify-center items-center py-3 px-8 rounded-xl text-white bg-gradient-to-r from-brand-primary to-brand-dark hover:from-brand-light hover:to-brand-primary font-bold shadow-lg shadow-brand-primary/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Scanner...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <Search className="w-5 h-5" />
                            Rechercher
                        </span>
                    )}
                </button>
            </form>

            {/* Historique des recherches */}
            {history.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
                        <History className="w-3.5 h-3.5" /> Récent :
                    </span>
                    {history.map((h, i) => (
                        <button
                            key={h.id || i}
                            onClick={() => handleSearch(undefined, false, h.query, h.location, h.country || 'fr')}
                            className="text-xs font-medium bg-slate-100 hover:bg-brand-50 text-slate-600 hover:text-brand-primary px-3 py-1.5 rounded-full border border-slate-200 transition-colors flex items-center gap-1.5"
                        >
                            <span className="uppercase text-[9px] px-1 bg-slate-200 rounded text-slate-500">{h.country || 'FR'}</span>
                            <span>{h.query} - {h.location}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 rounded-r-xl flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                    <span className="font-medium text-sm">Erreur: {error}</span>
                </div>
            )}

            {/* Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {jobs.map((job, i) => (
                    <div
                        key={i}
                        className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 animate-slide-up"
                        style={{ animationDelay: `${(i % 10) * 80}ms` }}
                    >
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-brand-100 text-brand-primary rounded-xl flex items-center justify-center font-bold text-xl shadow-sm border border-brand-light/20 uppercase">
                                    {(job.company || 'E').charAt(0)}
                                </div>
                                {job.salary && (
                                    <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 font-semibold text-xs px-2.5 py-1 rounded-full border border-green-100">
                                        <DollarSign className="w-3 h-3" />
                                        {typeof job.salary === 'object' ? (job.salary.salaryText || 'Non spécifié') : job.salary}
                                    </span>
                                )}
                            </div>

                            <h3 className="text-base font-bold text-slate-900 mb-3 leading-tight group-hover:text-brand-primary transition-colors">
                                {job.positionName || job.title || 'Poste non spécifié'}
                            </h3>

                            <div className="space-y-2 text-xs text-slate-500 font-medium">
                                <p className="flex items-center gap-2">
                                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span className="truncate">{typeof job.company === 'object' ? (job.company.name || 'Entreprise anonyme') : (job.company || 'Entreprise anonyme')}</span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span className="truncate">{typeof job.location === 'object' ? (job.location.city || job.location.formattedAddressShort || 'Localisation complexe') : (job.location || 'Localisation non renseignée')}</span>
                                </p>
                            </div>
                        </div>

                        {appliedJobs[job.id || job.jobKey || job.url] ? (
                            <button disabled className="mt-6 w-full bg-green-50 text-green-700 font-bold py-3 rounded-xl border border-green-200 flex items-center justify-center gap-2 text-sm cursor-not-allowed">
                                <CheckCircle className="w-4 h-4" />
                                Déjà postulé
                            </button>
                        ) : (
                            <button
                                onClick={() => setSelectedJob(job)}
                                className="mt-6 w-full bg-slate-50 hover:bg-brand-primary text-slate-700 hover:text-white font-bold py-3 rounded-xl border border-slate-200 hover:border-transparent transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-sm hover:shadow-md hover:shadow-brand-primary/20"
                            >
                                Candidater Maintenant
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        )}
                    </div>
                ))}

                {jobs.length === 0 && !loading && !error && (
                    <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-100 text-brand-primary rounded-2xl mb-5 relative">
                            <div className="absolute inset-0 bg-brand-light rounded-2xl animate-ping opacity-10"></div>
                            <Search className="w-9 h-9 relative z-10" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 mb-2">Prêt à trouver votre prochain job ?</h3>
                        <p className="text-slate-400 max-w-md mx-auto">Saisissez un titre de poste et une localisation pour explorer les opportunités du marché.</p>
                    </div>
                )}

                {loading && (
                    <div className="col-span-full py-20 text-center">
                        <div className="inline-flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-brand-light border-t-brand-primary rounded-full animate-spin" />
                            <p className="text-slate-500 font-medium">Scan en cours sur Indeed...</p>
                        </div>
                    </div>
                )}
            </div>

            {selectedJob && (
                <ApplyModal
                    job={selectedJob}
                    onClose={() => setSelectedJob(null)}
                    onApplied={() => {
                        const key = selectedJob.id || selectedJob.jobKey || selectedJob.url;
                        if (key) setAppliedJobs(prev => ({ ...prev, [key]: true }));
                    }}
                />
            )}
        </div>
    );
};
