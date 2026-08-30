import React from "react";
import { Question, SubQuestion } from "../types";
import { Plus, Trash2, ArrowUp, ArrowDown, ClipboardSignature, Layers, ListPlus } from "lucide-react";

interface QuestionsBuilderProps {
  questions: Question[];
  onChange: (updatedQuestions: Question[]) => void;
  targetMarks: string;
}

// Simple marks parsing to show estimated score sums
export function parseMarksValue(marksStr: string): number {
  if (!marksStr) return 0;
  
  // If there is an '=' sign, take the part after it (e.g., "2 × 2 = 4" -> "4")
  if (marksStr.includes("=")) {
    const parts = marksStr.split("=");
    const lastPart = parts[parts.length - 1].trim();
    const parsed = parseFloat(lastPart);
    if (!isNaN(parsed)) return parsed;
  }
  
  // Try to find if there are multiple parts multiplied (e.g., "2 × 2" or "2 * 2")
  const cleanStr = marksStr.replace(/×/g, "*").replace(/x/g, "*");
  if (cleanStr.includes("*")) {
    try {
      const parts = cleanStr.split("*").map((p) => parseFloat(p.trim()));
      if (parts.every((p) => !isNaN(p))) {
        return parts.reduce((acc, val) => acc * val, 1);
      }
    } catch (e) {
      // ignore parsing errors
    }
  }

  // If it is a direct number (e.g., "3", "1", "0.5")
  const directNum = parseFloat(marksStr.trim());
  if (!isNaN(directNum)) return directNum;

  // Try to extract any number from the string
  const match = marksStr.match(/(\d+(\.\d+)?)/);
  if (match) {
    return parseFloat(match[1]);
  }

  return 0;
}

interface AutoExpandingTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const AutoExpandingTextarea: React.FC<AutoExpandingTextareaProps> = ({
  value,
  onChange,
  placeholder,
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  React.useEffect(() => {
    adjustHeight();
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900/50 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none overflow-y-auto min-h-[58px] max-h-[124px]"
      style={{ height: "auto" }}
    />
  );
};

export const QuestionsBuilder: React.FC<QuestionsBuilderProps> = ({
  questions,
  onChange,
  targetMarks,
}) => {
  // Update a single question field
  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    const updated = questions.map((q) => {
      if (q.id === id) {
        return { ...q, [field]: value };
      }
      return q;
    });
    // Re-adjust numbers
    const sequenced = updated.map((q, idx) => ({ ...q, number: idx + 1 }));
    onChange(sequenced);
  };

  // Add a new blank question
  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      number: questions.length + 1,
      text: "",
      marks: "1",
      subQuestions: [],
    };
    onChange([...questions, newQuestion]);
  };

  // Delete a question
  const deleteQuestion = (id: string) => {
    const filtered = questions.filter((q) => q.id !== id);
    // Re-sequence numbers
    const sequenced = filtered.map((q, idx) => ({ ...q, number: idx + 1 }));
    onChange(sequenced);
  };

  // Reorder questions
  const moveQuestion = (idx: number, direction: "up" | "down") => {
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === questions.length - 1) return;

    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    const updated = [...questions];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;

    // Re-sequence
    const sequenced = updated.map((q, sIdx) => ({ ...q, number: sIdx + 1 }));
    onChange(sequenced);
  };

  // Subquestions
  const addSubQuestion = (qId: string) => {
    const updated = questions.map((q) => {
      if (q.id === qId) {
        const nextLetter = String.fromCharCode(97 + q.subQuestions.length); // a, b, c, ...
        const newSub: SubQuestion = {
          id: `sq-${Date.now()}-${q.subQuestions.length}`,
          label: nextLetter,
          text: "",
        };
        return { ...q, subQuestions: [...q.subQuestions, newSub] };
      }
      return q;
    });
    onChange(updated);
  };

  const updateSubQuestion = (qId: string, sqId: string, text: string) => {
    const updated = questions.map((q) => {
      if (q.id === qId) {
        const updatedSubs = q.subQuestions.map((sq) => {
          if (sq.id === sqId) {
            return { ...sq, text };
          }
          return sq;
        });
        return { ...q, subQuestions: updatedSubs };
      }
      return q;
    });
    onChange(updated);
  };

  const updateSubLabel = (qId: string, sqId: string, label: string) => {
    const updated = questions.map((q) => {
      if (q.id === qId) {
        const updatedSubs = q.subQuestions.map((sq) => {
          if (sq.id === sqId) {
            return { ...sq, label };
          }
          return sq;
        });
        return { ...q, subQuestions: updatedSubs };
      }
      return q;
    });
    onChange(updated);
  };

  const deleteSubQuestion = (qId: string, sqId: string) => {
    const updated = questions.map((q) => {
      if (q.id === qId) {
        const filteredSubs = q.subQuestions.filter((sq) => sq.id !== sqId);
        // Re-label alphabet labels
        const reLabeled = filteredSubs.map((sq, sIdx) => ({
          ...sq,
          label: String.fromCharCode(97 + sIdx),
        }));
        return { ...q, subQuestions: reLabeled };
      }
      return q;
    });
    onChange(updated);
  };

  // Calculate accumulated marks
  const totalCalculatedMarks = questions.reduce(
    (acc, q) => acc + parseMarksValue(q.marks),
    0
  );
  const parsedTargetMarks = parseFloat(targetMarks) || 0;
  const isMarksBalanced = totalCalculatedMarks === parsedTargetMarks;

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-lg shadow-sm p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <ClipboardSignature className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200">Questions List</h2>
        </div>
        
        {/* Marks validation badge */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 uppercase font-bold tracking-wider text-[10px]">Marks Balance:</span>
          <span
            className={`px-2.5 py-1 rounded font-bold ${
              isMarksBalanced
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                : "bg-amber-50 text-amber-700 border border-amber-100"
            }`}
          >
            {totalCalculatedMarks} / {targetMarks || "0"} Marks
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-900/50">
            <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500 font-medium">No questions added yet.</p>
            <button
              onClick={addQuestion}
              className="mt-3 text-[10px] bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded font-bold uppercase tracking-wider transition-colors"
            >
              Add First Question
            </button>
          </div>
        ) : (
          questions.map((q, index) => (
            <div
              key={q.id}
              className="group border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600 rounded-lg p-4 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded">
                  Q. {q.number < 10 ? `0${q.number}` : q.number}
                </span>
                
                <div className="flex items-center space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                  {/* Move Up */}
                  <button
                    onClick={() => moveQuestion(index, "up")}
                    disabled={index === 0}
                    title="Move Up"
                    className={`p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent`}
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  {/* Move Down */}
                  <button
                    onClick={() => moveQuestion(index, "down")}
                    disabled={index === questions.length - 1}
                    title="Move Down"
                    className={`p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent`}
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  {/* Delete */}
                  <button
                    onClick={() => deleteQuestion(q.id)}
                    title="Delete Question"
                    className="p-1.5 rounded hover:bg-rose-50 text-rose-600 ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* Question Text */}
                <div className="sm:col-span-9">
                  <AutoExpandingTextarea
                    value={q.text}
                    onChange={(val) => updateQuestion(q.id, "text", val)}
                    placeholder="Enter question prompt..."
                  />
                </div>
                {/* Marks Point Value */}
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    value={q.marks}
                    onChange={(e) => updateQuestion(q.id, "marks", e.target.value)}
                    placeholder="Marks (e.g., 3)"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900/50 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <p className="text-[10px] text-slate-400 font-medium mt-1">
                    Format: '1', '3', or '2 × 2 = 4'
                  </p>
                </div>
              </div>

              {/* Subquestions Section */}
              <div className="pl-4 border-l-2 border-slate-200 dark:border-slate-700 space-y-2 mt-2">
                {q.subQuestions.map((sq) => (
                  <div key={sq.id} className="flex items-start space-x-2 bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700">
                    <input
                      type="text"
                      value={sq.label}
                      onChange={(e) => updateSubLabel(q.id, sq.id, e.target.value)}
                      placeholder="label"
                      className="w-10 text-center px-1 py-1 border border-slate-200 dark:border-slate-700 rounded text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-400 mt-1.5">.</span>
                    <input
                      type="text"
                      value={sq.text}
                      onChange={(e) => updateSubQuestion(q.id, sq.id, e.target.value)}
                      placeholder="e.g., 426345879"
                      className="flex-1 px-2 py-1 border border-slate-200 dark:border-slate-700 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => deleteSubQuestion(q.id, sq.id)}
                      className="p-1 hover:bg-rose-50 text-rose-500 rounded"
                      title="Remove Sub-question"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                <button
                  onClick={() => addSubQuestion(q.id)}
                  className="flex items-center space-x-1.5 text-[10px] font-bold tracking-wider uppercase text-blue-600 hover:text-blue-800 bg-blue-50/50 hover:bg-blue-50 px-2.5 py-1 rounded transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Sub-question Part</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <button
        onClick={addQuestion}
        className="w-full flex items-center justify-center space-x-2 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-400 text-blue-600 hover:text-blue-800 py-3 rounded font-semibold text-sm transition-all bg-slate-50/50 dark:bg-slate-900/50 hover:bg-blue-50/20 cursor-pointer"
      >
        <ListPlus className="w-4 h-4" />
        <span>Add Question Item</span>
      </button>
    </div>
  );
};
