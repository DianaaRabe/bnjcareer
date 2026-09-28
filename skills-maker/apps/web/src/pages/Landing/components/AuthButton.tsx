import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'

type AuthButtonProps = {
  className?: string
  variant?: 'primary' | 'outline' | 'white'
  label?: string
  to?: string
}

const VARIANTS: Record<NonNullable<AuthButtonProps['variant']>, string> = {
  primary: 'bg-brand-accent text-brand-dark hover:bg-brand-accent/90 shadow-brand-accent/20',
  outline:
    'border-2 border-brand-primary text-brand-primary hover:bg-brand-primary/5 shadow-brand-primary/10',
  white: 'bg-white text-brand-primary hover:bg-slate-50 shadow-white/20',
}

export function AuthButton({
  className = '',
  variant = 'primary',
  label,
  to = ROUTES.login,
}: AuthButtonProps) {
  return (
    <Link
      to={to}
      className={`group relative flex items-center justify-center gap-3 overflow-hidden rounded-2xl px-8 py-4 font-extrabold shadow-xl transition-all duration-300 hover:-translate-y-1 active:scale-95 ${VARIANTS[variant]} ${className}`}
    >
      <span>{label || 'Commencer'}</span>
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    </Link>
  )
}
