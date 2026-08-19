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
        <div className="py-12 px-6 rounded-2xl border border-[#855AB4]/30 bg-[#221545]/40 text-center space-y-3">
          <div className="h-10 w-10 rounded-full border border-[#855AB4]/40 bg-[#68388D]/30 flex items-center justify-center mx-auto text-[#B26FCB]">
            <Lock className="h-4 w-4" />
          </div>
          <h3 className="font-sans text-lg font-bold text-white">
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

            let cardStyle = 'border-[#855AB4]/25 bg-[#221545]/50 text-zinc-300 hover:border-[#B26FCB]/50 hover:bg-[#221545]/80';

            if (isSelected) {
              cardStyle = 'border-[#B26FCB] bg-[#68388D]/40 text-white shadow-[0_0_25px_rgba(178,111,203,0.3)]';
            }

            if (submittedOption === idx) {
              if (isCorrect === true) {
                cardStyle = 'border-emerald-500 bg-emerald-500/15 text-white';
              } else if (isCorrect === false) {
                cardStyle = 'border-orange-600 bg-orange-600/20 text-white';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={disabled || isReadOnly}
                onClick={() => onSelectOption(idx)}
                className={`flex items-start gap-4 border rounded-2xl p-6 text-left font-sans transition-all duration-150 active:scale-98 disabled:cursor-not-allowed ${cardStyle}`}
              >
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold ${
                    isSelected
                      ? 'bg-[#68388D] text-white shadow-[0_0_12px_rgba(178,111,203,0.8)] border border-[#B26FCB]/50'
                      : 'bg-white/10 text-zinc-400'
                  }`}
                >
                  {letter}
                </div>

                <div className="flex-1 pt-1 text-sm font-medium leading-relaxed">
                  {optText}
                </div>

                {submittedOption === idx && (
                  <div className="flex-shrink-0 pt-1">
                    {isCorrect ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <X className="h-4 w-4 text-[#B26FCB]" />
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
