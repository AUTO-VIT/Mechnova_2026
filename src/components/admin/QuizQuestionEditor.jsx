import React, { useEffect, useState } from 'react';
import { Check, Edit2, Plus, Trash2, X } from 'lucide-react';
import { deleteQuizQuestion, ensureQuizQuestionOrder, saveQuizQuestion, subscribeToQuizQuestions } from '../../services/firestoreService';
import { ControlPanel } from '../common/ControlPanel';
import { ModalLayer } from '../common/ModalLayer';
import { StatusBadge } from '../common/StatusBadge';

const optionLetters = ['A', 'B', 'C', 'D'];

export function QuizQuestionEditor({ quizId = 'default-quiz' }) {
  const [questions, setQuestions] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [answerKey, setAnswerKey] = useState(0);
  const [category, setCategory] = useState('Robotics & Kinematics');
  const [loading, setLoading] = useState(false);

  useEffect(() => subscribeToQuizQuestions(quizId, (nextQuestions) => {
    const normalized = nextQuestions || [];
    setQuestions(normalized);
    ensureQuizQuestionOrder(quizId, normalized).catch((error) => console.warn('Quiz order sync notice:', error.message));
  }), [quizId]);

  const openNew = () => {
    setEditingQuestion({ id: `q_${Date.now()}`, isNew: true });
    setPrompt('');
    setOptions(['', '', '', '']);
    setAnswerKey(0);
    setCategory('Robotics & Kinematics');
  };

  const openEdit = (question) => {
    setEditingQuestion(question);
    setPrompt(question.prompt || '');
    setOptions(optionLetters.map((_, index) => question.options?.[index] || ''));
    setAnswerKey(typeof question.answerKey === 'number' ? question.answerKey : (typeof question.correctOption === 'number' ? question.correctOption : 0));
    setCategory(question.category || 'Robotics & Kinematics');
  };

  const updateOption = (index, value) => setOptions((current) => current.map((option, optionIndex) => optionIndex === index ? value : option));

  const handleSave = async (event) => {
    event.preventDefault();
    if (!prompt.trim() || options.some((option) => !option.trim())) {
      window.alert('The question and all four answer choices are required.');
      return;
    }
    setLoading(true);
    try {
      const questionId = editingQuestion.id || `q_${Date.now()}`;
      const correctOption = Number.parseInt(answerKey, 10);
      await saveQuizQuestion(quizId, questionId, {
        order: editingQuestion.order || questions.length + 1,
        prompt: prompt.trim(),
        options: options.map((option) => option.trim()),
        answerKey: correctOption,
        correctOption,
        category: category.trim()
      });
      setEditingQuestion(null);
    } catch (error) {
      console.error('Save question error:', error);
      window.alert(`Failed to save question: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm('Delete this question?')) return;
    await deleteQuizQuestion(quizId, questionId);
  };

  return (
    <ControlPanel title="Quiz question bank" subtitle={`Quiz ID: ${quizId}`} badge={<StatusBadge status={`${questions.length} questions`} variant="zinc" />} action={<button type="button" onClick={openNew} className="mn-button mn-button-primary min-h-10"><Plus className="h-4 w-4" />Add question</button>}>
      {questions.length === 0 ? (
        <div className="mn-empty min-h-60"><div><h3 className="text-lg font-semibold">No questions yet</h3><p className="mt-2 text-sm text-[var(--mn-muted)]">Add the first question to prepare the quiz.</p></div></div>
      ) : (
        <div className="mn-rank-list">
          {questions.map((question, index) => (
            <article key={question.id} className="border-b border-[var(--mn-line)] py-6">
              <div className="flex items-start justify-between gap-5"><div><span className="mn-label text-[var(--mn-violet)]">Question {String(index + 1).padStart(2, '0')} · {question.category || 'General'}</span><h3 className="mt-3 max-w-4xl text-base font-semibold leading-6">{question.prompt}</h3></div><div className="flex shrink-0 gap-2"><button type="button" onClick={() => openEdit(question)} className="mn-icon-button" aria-label={`Edit question ${index + 1}`}><Edit2 className="h-4 w-4" /></button><button type="button" onClick={() => handleDelete(question.id)} className="mn-icon-button hover:border-[var(--mn-orange)] hover:text-[var(--mn-orange)]" aria-label={`Delete question ${index + 1}`}><Trash2 className="h-4 w-4" /></button></div></div>
              <div className="mt-5 grid gap-2 md:grid-cols-2">
                {(question.options || []).map((option, optionIndex) => {
                  const isAnswer = (question.answerKey ?? question.correctOption) === optionIndex;
                  return <div key={optionIndex} className={`flex items-start gap-3 border p-3 text-xs leading-5 ${isAnswer ? 'border-[rgba(116,211,168,.45)] bg-[rgba(116,211,168,.06)] text-white' : 'border-[var(--mn-line)] text-[var(--mn-muted)]'}`}><span className="font-mono text-[10px] text-[var(--mn-violet)]">{optionLetters[optionIndex]}</span><span className="flex-1">{option}</span>{isAnswer && <Check className="h-4 w-4 text-[var(--mn-green)]" />}</div>;
                })}
              </div>
            </article>
          ))}
        </div>
      )}

      {editingQuestion && (
        <ModalLayer labelledBy="quiz-question-editor-title" onClose={loading ? undefined : () => setEditingQuestion(null)}>
          <div className="mn-panel mn-modal-surface w-full max-w-3xl border-t-[3px] border-t-[var(--mn-violet)]">
            <div className="flex items-start justify-between border-b border-[var(--mn-line)] pb-5"><div><span className="mn-label">Question editor</span><h3 id="quiz-question-editor-title" className="mt-2 font-['Syne'] text-2xl font-semibold">{editingQuestion.isNew ? 'Add a question' : 'Edit question'}</h3></div><button type="button" onClick={() => setEditingQuestion(null)} disabled={loading} aria-label="Close question editor" className="mn-icon-button"><X className="h-4 w-4" /></button></div>
            <form onSubmit={handleSave} className="mt-6 space-y-5">
              <label className="mn-field"><span className="mn-label">Category</span><input type="text" value={category} onChange={(event) => setCategory(event.target.value)} className="mn-input" /></label>
              <label className="mn-field"><span className="mn-label">Question *</span><textarea rows="3" value={prompt} onChange={(event) => setPrompt(event.target.value)} className="mn-textarea" required /></label>
              <div className="grid gap-4 md:grid-cols-2">{options.map((option, index) => <label key={optionLetters[index]} className="mn-field"><span className="mn-label">Option {optionLetters[index]} *</span><input type="text" value={option} onChange={(event) => updateOption(index, event.target.value)} className="mn-input" required /></label>)}</div>
              <label className="mn-field"><span className="mn-label">Correct answer</span><select value={answerKey} onChange={(event) => setAnswerKey(Number.parseInt(event.target.value, 10))} className="mn-select">{options.map((option, index) => <option key={optionLetters[index]} value={index}>Option {optionLetters[index]} — {option || `Choice ${index + 1}`}</option>)}</select></label>
              <div className="flex justify-end gap-3 border-t border-[var(--mn-line)] pt-5"><button type="button" onClick={() => setEditingQuestion(null)} className="mn-button mn-button-secondary">Cancel</button><button type="submit" disabled={loading} className="mn-button mn-button-primary">Save question</button></div>
            </form>
          </div>
        </ModalLayer>
      )}
    </ControlPanel>
  );
}
