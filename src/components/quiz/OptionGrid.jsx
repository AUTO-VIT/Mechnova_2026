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
    <div className="relative space-y-4">
      {/* Read Only Sealed Notice */}
      {isReadOnly && (
        <div className="py-12 px-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] text-center space-y-3">
          <div className="h-10 w-10 rounded-full border border-white/10 bg-white/[0.04] flex items-center justify-center mx-auto text-red-400">
            <Lock className="h-4 w-4" />
          </div>
          <h3 className="font-display text-lg font-bold text-white">
            Options Sealed
          </h3>
          <p className="text-zinc-400 text-xs font-light max-w-sm mx-auto">
            10-second read period active. Review the prompt carefully. Options will unlock automatically.
          </p>
        </div>
      )}

      {/* Options Grid */}
      {!isReadOnly && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {options.map((optText, idx) => {
            const isSelected = selectedOption === idx;
            const letter = letters[idx];

            let cardStyle = 'border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/30 hover:bg-white/[0.06]';

            if (isSelected) {
              cardStyle = 'border-red-500 bg-red-500/10 text-white shadow-[0_0_20px_rgba(220,38,38,0.2)]';
            }

            if (submittedOption === idx) {
              if (isCorrect === true) {
                cardStyle = 'border-emerald-500 bg-emerald-500/10 text-white';
              } else if (isCorrect === false) {
                cardStyle = 'border-red-600 bg-red-600/20 text-white';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={disabled || isReadOnly}
                onClick={() => onSelectOption(idx)}
                className={`flex items-start gap-4 border rounded-2xl p-5 text-left font-sans transition-all duration-150 active:scale-98 disabled:cursor-not-allowed ${cardStyle}`}
              >
                <div
                  className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                    isSelected
                      ? 'bg-red-600 text-white'
                      : 'bg-white/10 text-zinc-400'
                  }`}
                >
                  {letter}
                </div>

                <div className="flex-1 pt-0.5 text-sm font-medium leading-relaxed">
                  {optText}
                </div>

                {submittedOption === idx && (
                  <div className="flex-shrink-0 pt-0.5">
                    {isCorrect ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
