'use client'

import { useRef, useState, KeyboardEvent } from 'react'
import { X } from 'lucide-react'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
  label?: string
  hint?: string
  disabled?: boolean
}

export function TagInput({
  tags,
  onChange,
  placeholder = 'Tapez et appuyez sur Entrée',
  maxTags,
  label,
  hint,
  disabled = false,
}: TagInputProps) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const addTag = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return
    if (maxTags && tags.length >= maxTags) return
    if (tags.includes(trimmed)) return
    onChange([...tags, trimmed])
    setInput('')
  }

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  const isMaxReached = maxTags !== undefined && tags.length >= maxTags

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-semibold text-slate-700">
          {label}
          {maxTags && (
            <span className="ml-2 text-xs font-normal text-slate-400">
              ({tags.length}/{maxTags})
            </span>
          )}
        </label>
      )}

      {/* Tag container */}
      <div
        className={`min-h-[44px] flex flex-wrap gap-2 p-2.5 rounded-xl border transition-all duration-200 cursor-text ${
          disabled
            ? 'bg-slate-50 border-slate-100'
            : 'bg-white border-slate-200 hover:border-brand-primary/50 focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/10'
        }`}
        onClick={() => !disabled && inputRef.current?.focus()}
      >
        {tags.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-3 py-1 bg-brand-100 text-brand-primary text-sm font-medium rounded-full animate-fade-in"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeTag(i) }}
                className="hover:text-brand-dark transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}

        {!isMaxReached && !disabled && (
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => addTag(input)}
            placeholder={tags.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[120px] outline-none text-sm text-slate-700 placeholder-slate-300 bg-transparent"
          />
        )}

        {isMaxReached && !disabled && (
          <span className="text-xs text-slate-400 italic self-center ml-1">
            Maximum atteint
          </span>
        )}
      </div>

      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  )
}
