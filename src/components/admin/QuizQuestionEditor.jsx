import React, { useState, useEffect } from 'react';
import { subscribeToQuizQuestions, saveQuizQuestion, deleteQuizQuestion } from '../../services/firestoreService';
import { ControlPanel } from '../common/ControlPanel';
import { StatusBadge } from '../common/StatusBadge';
import { Plus, Edit2, Trash2, CheckCircle, HelpCircle } from 'lucide-react';

export function QuizQuestionEditor({ quizId = 'default-quiz' }) {
  const [questions, setQuestions] = useState([]);
  const [editingQ, setEditingQ] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [opt0, setOpt0] = useState('');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [opt3, setOpt3] = useState('');
  const [answerKey, setAnswerKey] = useState(0);
  const [category, setCategory] = useState('Robotics & Kinematics');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = subscribeToQuizQuestions(quizId, (qs) => {
      setQuestions(qs || []);
    });
    return () => unsub();
  }, [quizId]);

  const handleOpenNew = () => {
    setEditingQ({ id: `q_${Date.now()}` });
    setPrompt('');
    setOpt0('');
    setOpt1('');
    setOpt2('');
    setOpt3('');
    setAnswerKey(0);
    setCategory('Robotics & Kinematics');
  };

  const handleOpenEdit = (q) => {
    setEditingQ(q);
    setPrompt(q.prompt || '');
    const options = q.options || ['', '', '', ''];
    setOpt0(options[0] || '');
    setOpt1(options[1] || '');
    setOpt2(options[2] || '');
    setOpt3(options[3] || '');
    setAnswerKey(typeof q.answerKey === 'number' ? q.answerKey : 0);
    setCategory(q.category || 'Robotics & Kinematics');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || !opt0.trim() || !opt1.trim() || !opt2.trim() || !opt3.trim()) {
      alert("Prompt and all 4 options are required.");
      return;
    }

    setLoading(true);
    try {
      const qId = editingQ.id || `q_${Date.now()}`;
      await saveQuizQuestion(quizId, qId, {
        order: editingQ.order || questions.length + 1,
        prompt: prompt.trim(),
        options: [opt0.trim(), opt1.trim(), opt2.trim(), opt3.trim()],
        answerKey: parseInt(answerKey, 10),
        category: category.trim()
      });
      setEditingQ(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (qId) => {
    if (!window.confirm("Delete this question from bank?")) return;
    await deleteQuizQuestion(quizId, qId);
  };

  return (
    <ControlPanel
      title="QUIZ QUESTION BANK MANAGER"
      subtitle={`Quiz ID: ${quizId}`}
      action={
        <button
          type="button"
          onClick={handleOpenNew}
          className="flex items-center gap-1 bg-red-600 px-3 py-1.5 font-mono text-xs font-bold text-white hover:bg-red-500 active:scale-[0.97]"
        >
          <Plus className="h-4 w-4" />
          <span>ADD QUESTION</span>
        </button>
      }
    >
      <div className="space-y-4 pt-2">
        {questions.length === 0 ? (
          <div className="p-6 text-center font-mono text-xs text-zinc-500">
            No questions configured in bank. Click Add Question to create initial items.
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div key={q.id} className="border border-zinc-800 bg-zinc-900/60 p-4 font-mono space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-red-400">
                    Q0{idx + 1} &bull; [{q.category || 'General'}]
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(q)}
                      className="text-zinc-400 hover:text-white"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="text-zinc-500 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="text-sm font-bold text-white">{q.prompt}</div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {(q.options || []).map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className={`p-2 border ${
                        q.answerKey === oIdx
                          ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 font-bold'
                          : 'border-zinc-800 bg-black text-zinc-400'
                      }`}
                    >
                      [{['A', 'B', 'C', 'D'][oIdx]}] {opt} {q.answerKey === oIdx ? '(ANSWER KEY)' : ''}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Question Modal */}
      {editingQ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-2xl border border-red-600 bg-zinc-950 p-6 space-y-5 font-mono">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-red-400">
                {editingQ.id ? "EDIT QUESTION ITEM" : "CREATE NEW QUESTION"}
              </h3>
              <button onClick={() => setEditingQ(null)} className="text-zinc-500 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-300 mb-1">CATEGORY / DOMAIN</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-zinc-700 bg-black px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-300 mb-1">QUESTION PROMPT *</label>
                <textarea
                  rows="3"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full border border-zinc-700 bg-black p-3 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">OPTION [ A ] *</label>
                  <input
                    type="text"
                    value={opt0}
                    onChange={(e) => setOpt0(e.target.value)}
                    className="w-full border border-zinc-700 bg-black px-3 py-1.5 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">OPTION [ B ] *</label>
                  <input
                    type="text"
                    value={opt1}
                    onChange={(e) => setOpt1(e.target.value)}
                    className="w-full border border-zinc-700 bg-black px-3 py-1.5 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">OPTION [ C ] *</label>
                  <input
                    type="text"
                    value={opt2}
                    onChange={(e) => setOpt2(e.target.value)}
                    className="w-full border border-zinc-700 bg-black px-3 py-1.5 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">OPTION [ D ] *</label>
                  <input
                    type="text"
                    value={opt3}
                    onChange={(e) => setOpt3(e.target.value)}
                    className="w-full border border-zinc-700 bg-black px-3 py-1.5 text-xs text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-400 mb-1">SPECIFY CORRECT ANSWER KEY *</label>
                <select
                  value={answerKey}
                  onChange={(e) => setAnswerKey(parseInt(e.target.value, 10))}
                  className="w-full border border-emerald-500/50 bg-black px-3 py-2 text-xs text-emerald-300 font-bold"
                >
                  <option value={0}>OPTION [ A ] - {opt0 || "First Option"}</option>
                  <option value={1}>OPTION [ B ] - {opt1 || "Second Option"}</option>
                  <option value={2}>OPTION [ C ] - {opt2 || "Third Option"}</option>
                  <option value={3}>OPTION [ D ] - {opt3 || "Fourth Option"}</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-zinc-800 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingQ(null)}
                  className="border border-zinc-700 px-4 py-2 text-xs text-zinc-400 hover:bg-zinc-900"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-500"
                >
                  SAVE QUESTION ITEM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ControlPanel>
  );
}
