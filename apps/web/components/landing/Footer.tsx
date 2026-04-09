"use client";

export function Footer() {
  return (
    <footer className="bg-slate-900 py-12 text-white/50 text-sm">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
             <img 
               src="https://cdn.prod.website-files.com/68f74eda1b97775fa6dd76a2/691752fe9142ffa21169191b_Logo_white.png" 
               alt="BNJ Career" 
               className="h-8 opacity-80"
             />
             <p className="max-w-xs text-center md:text-left">
               BNJ Career - L'évolution de votre projet professionnel par l'intelligence collective et artificielle.
             </p>
          </div>
          
          <div className="flex gap-8 font-bold text-white/70">
            <a href="#" className="hover:text-brand-accent transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-brand-accent transition-colors">Contact</a>
            <a href="#" className="hover:text-brand-accent transition-colors">Mentions légales</a>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/5 text-center text-xs">
          © {new Date().getFullYear()} BNJ Career. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
