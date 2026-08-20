import React, { useEffect } from 'react';
import { Check, Lock, X } from 'lucide-react';

export function OptionGrid({ options = [], selectedOption = null, onSelectOption, disabled = false, isReadOnly = false, submittedOption = null, isCorrect = null }) {
  const letters = ['A', 'B', 'C', 'D'];

  useEffect(() => {
    if (disabled || isReadOnly) return undefined;
    const handleKeyDown = (event) => {
      const key = event.key.toUpperCase();
      let selectedIndex = -1;
      if (['1', '2', '3', '4'].includes(key)) selectedIndex = Number.parseInt(key, 10) - 1;
      else if (letters.includes(key)) selectedIndex = letters.indexOf(key);
      if (selectedIndex >= 0 && selectedIndex < options.length) onSelectOption(selectedIndex);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, isReadOnly, options, onSelectOption]);

  if (isReadOnly) {
    return (
      <div className="mn-empty min-h-64">
        <div className="max-w-sm"><Lock className="mn-empty-icon p-3" /><h3 className="text-xl font-semibold">Read the question</h3><p className="mt-2 text-sm leading-6 text-[var(--mn-muted)]">Answer choices appear automatically when the ten-second reading period ends.</p></div>
      </div>
    );
  }

  return (
    <div className="mn-option-grid">
      {options.map((optionText, index) => {
        const selected = selectedOption === index;
        const submitted = submittedOption === index;
        const resultClass = submitted ? (isCorrect ? 'is-correct' : 'is-incorrect') : '';
        return (
          <button key={index} type="button" disabled={disabled} onClick={() => onSelectOption(index)} className={`mn-option ${selected ? 'is-selected' : ''} ${resultClass}`} aria-pressed={selected}>
            <span className="mn-option-key">{letters[index]}</span>
            <span className="pt-1 text-sm font-medium leading-6">{optionText}</span>
            {submitted && (isCorrect ? <Check className="mt-2 h-4 w-4 text-[var(--mn-green)]" /> : <X className="mt-2 h-4 w-4 text-[var(--mn-orange)]" />)}
          </button>
        );
      })}
    </div>
  );
}
