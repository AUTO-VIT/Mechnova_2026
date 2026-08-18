import React, { useEffect } from 'react';
import { Lock, Check, X } from 'lucide-react';

export function OptionGrid({
  options = [],
  selectedOption = null,
  onSelectOption,
  disabled = false,
  isReadOnly = false,
  submittedOption = null,
  isCorrect = null
}) {
  const letters = ['A', 'B', 'C', 'D'];

  // Keyboard Shortcuts (1-4 or A-D)
  useEffect(() => {
    if (disabled || isReadOnly) return;

    const handleKeyDown = (e) => {
      const key = e.key.toUpperCase();
      let selectedIndex = -1;
      if (['1', '2', '3', '4'].includes(key)) {
        selectedIndex = parseInt(key, 10) - 1;
      } else if (['A', 'B', 'C', 'D'].includes(key)) {
        selectedIndex = letters.indexOf(key);
      }

      if (selectedIndex >= 0 && selectedIndex < options.length) {
        onSelectOption(selectedIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, isReadOnly, options, onSelectOption]);

  return (
    <div className="relative space-y-3">
      {/* Visual Overlay when in READ_ONLY phase */}
      {isReadOnly && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center border border-red-500/40 bg-zinc-950/90 backdrop-blur-xs p-6 bg-hazard-stripes">
          <Lock className="h-8 w-8 text-red-500 animate-pulse mb-2" />
          <div className="font-mono text-sm font-bold uppercase tracking-wider text-red-400">
            OPTIONS SEALED FOR 10-SECOND READ PHASE
          </div>
          <div className="font-mono text-xs text-zinc-400 mt-1">
            Carefully analyze the prompt. Option selection will unlock automatically.
          </div>
        </div>
      )}

      {/* Option Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((optText, idx) => {
          const isSelected = selectedOption === idx;
          const letter = letters[idx];

          let optionStyle = 'border-zinc-800 bg-zinc-900/60 text-zinc-200 hover:border-white/40 hover:bg-zinc-800';

          if (isSelected) {
            optionStyle = 'border-red-500 bg-red-950/50 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]';
          }

          if (submittedOption === idx) {
            if (isCorrect === true) {
              optionStyle = 'border-emerald-500 bg-emerald-950/60 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]';
            } else if (isCorrect === false) {
              optionStyle = 'border-red-600 bg-red-950/80 text-white';
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={disabled || isReadOnly}
              onClick={() => onSelectOption(idx)}
              className={`flex items-start gap-4 border p-4 text-left font-mono transition-all duration-160 active:scale-[0.97] disabled:cursor-not-allowed ${optionStyle}`}
            >
              {/* Monospaced Key Letter Badge */}
              <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center border font-bold text-xs ${
                isSelected
                  ? 'border-red-400 bg-red-600 text-white'
                  : 'border-zinc-700 bg-black text-zinc-400'
              }`}>
                {letter}
              </div>

              {/* Option Text */}
              <div className="flex-1 pt-1 text-xs leading-relaxed font-semibold">
                {optText}
              </div>

              {/* Result Icon indicator */}
              {submittedOption === idx && (
                <div className="flex-shrink-0">
                  {isCorrect ? (
                    <Check className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <X className="h-5 w-5 text-red-500" />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
