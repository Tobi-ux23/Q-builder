import { useState, useEffect, FormEvent, MouseEvent } from "react";
import { QuestionPaper, Question } from "./types";
import { SAMPLE_MATH_PAPER } from "./sampleData";
import { HeaderForm } from "./components/HeaderForm";
import { QuestionsBuilder } from "./components/QuestionsBuilder";
import { GoogleDocExport } from "./components/GoogleDocExport";
import { PrintPreview } from "./components/PrintPreview";
import { ReportCardApp } from "./components/ReportCardApp";
import { 
  Eye, 
  Edit3, 
  FileText, 
  Printer, 
  GraduationCap,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  EyeOff,
  Save,
  Settings,
  Clock,
  Check,
  Menu,
  X,
  Moon,
  Sun
} from "lucide-react";

const EMPTY_PAPER: QuestionPaper = {
  schoolName: "",
  assessmentType: "",
  academicYear: "",
  classGrade: "",
  subjectName: "",
  examDate: "",
  fullMarks: "",
  timeAllotted: "",
  instructions: "",
  questions: [],
};

const generateId = () => "paper-" + Math.random().toString(36).substring(2, 11) + "-" + Date.now().toString(36);

function formatRelativeTime(timestamp?: number): string {
  if (!timestamp) return "Never";
  const diff = Date.now() - timestamp;
  if (diff < 60000) return "Just now";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function App() {
  // 1. AUTHENTICATION STATE
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem("question-paper-builder-auth") === "true";
  });
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showLockConfirm, setShowLockConfirm] = useState(false);
  const [currentApp, setCurrentApp] = useState<"question-paper" | "report-card">("question-paper");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Password in localStorage (default is 'admin457*')
  const [masterPassword, setMasterPassword] = useState(() => {
    return localStorage.getItem("question-paper-builder-password") || "admin457*";
  });
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState("");
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  // 2. SAVED PAPERS / HISTORY STATE
  const [history, setHistory] = useState<QuestionPaper[]>(() => {
    const saved = localStorage.getItem("question-paper-builder-history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error("Error reading saved paper history from localStorage", e);
      }
    }

    // Try migrating old paper from localStorage if available
    const oldSaved = localStorage.getItem("question-paper-builder-data");
    let oldPaper: QuestionPaper | null = null;
    if (oldSaved) {
      try {
        oldPaper = JSON.parse(oldSaved);
      } catch (e) {
        console.error(e);
      }
    }

    const fallbackPaper = oldPaper || SAMPLE_MATH_PAPER;
    const initialPaper = {
      ...fallbackPaper,
      id: fallbackPaper.id || "paper-default-sample",
      updatedAt: fallbackPaper.updatedAt || Date.now(),
    };
    const initialHistory = [initialPaper];
    localStorage.setItem("question-paper-builder-history", JSON.stringify(initialHistory));
    return initialHistory;
  });

  const [activeId, setActiveId] = useState<string>(() => {
    const savedActiveId = localStorage.getItem("question-paper-builder-active-id");
    if (savedActiveId && history.some((p) => p.id === savedActiveId)) {
      return savedActiveId;
    }
    return history[0]?.id || "paper-default-sample";
  });

  // Deletion helper state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Active derived paper
  const paper = history.find((p) => p.id === activeId) || history[0] || {
    ...EMPTY_PAPER,
    id: "paper-empty-fallback",
    updatedAt: Date.now(),
  };

  const [activeTab, setActiveTab] = useState<"print" | "gdoc">("print");
  const [activePage, setActivePage] = useState<"edit" | "preview">("edit");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("app-dark-mode") === "true";
  });
  
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  useEffect(() => {
    if (lockoutRemaining > 0) {
      const timer = setInterval(() => {
        setLockoutRemaining(prev => {
          if (prev <= 1) {
            setFailedAttempts(0);
            setPasswordError("");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockoutRemaining]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("app-dark-mode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("app-dark-mode", "false");
    }
  }, [isDarkMode]);

  // Sync active ID to localStorage
  useEffect(() => {
    localStorage.setItem("question-paper-builder-active-id", activeId);
  }, [activeId]);

  // Auth logins/logout handlers
  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (lockoutRemaining > 0) return;

    const correctPassword = localStorage.getItem("question-paper-builder-password") || "admin457*";
    if (passwordInput === correctPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem("question-paper-builder-auth", "true");
      setPasswordInput("");
      setPasswordError("");
      setFailedAttempts(0);
    } else {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      if (newAttempts >= 5) {
        setLockoutRemaining(30);
        setPasswordError("Too many failed attempts. Try again in 30 seconds.");
      } else {
        setPasswordError("Incorrect master password. Please try again.");
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("question-paper-builder-auth");
  };

  const handlePasswordChange = (e: FormEvent) => {
    e.preventDefault();
    if (!newPasswordInput.trim()) {
      setPasswordSuccessMessage("");
      return;
    }
    localStorage.setItem("question-paper-builder-password", newPasswordInput.trim());
    setMasterPassword(newPasswordInput.trim());
    setNewPasswordInput("");
    setPasswordSuccessMessage("Password changed successfully!");
    setTimeout(() => setPasswordSuccessMessage(""), 3000);
  };

  // Draft updates handlers
  const handlePaperChange = (updatedPaper: QuestionPaper) => {
    setHistory((prevHistory) => {
      const next = prevHistory.map((p) => 
        p.id === updatedPaper.id 
          ? { ...updatedPaper, updatedAt: Date.now() } 
          : p
      );
      localStorage.setItem("question-paper-builder-history", JSON.stringify(next));
      return next;
    });
  };

  const handleQuestionsChange = (updatedQuestions: Question[]) => {
    setHistory((prevHistory) => {
      const next = prevHistory.map((p) => 
        p.id === activeId 
          ? { ...p, questions: updatedQuestions, updatedAt: Date.now() } 
          : p
      );
      localStorage.setItem("question-paper-builder-history", JSON.stringify(next));
      return next;
    });
  };

  // Create new blank paper
  const handleCreateNewPaper = () => {
    const newId = generateId();
    const newPaper: QuestionPaper = {
      id: newId,
      updatedAt: Date.now(),
      schoolName: "",
      assessmentType: "",
      academicYear: "",
      classGrade: "",
      subjectName: "",
      examDate: "",
      fullMarks: "",
      timeAllotted: "",
      instructions: "",
      questions: [],
    };
    const nextHistory = [newPaper, ...history];
    setHistory(nextHistory);
    setActiveId(newId);
    localStorage.setItem("question-paper-builder-history", JSON.stringify(nextHistory));
  };

  // Duplicate an existing paper
  const handleDuplicatePaper = (targetId: string, event: MouseEvent) => {
    event.stopPropagation();
    const paperToDuplicate = history.find((p) => p.id === targetId);
    if (!paperToDuplicate) return;
    const newId = generateId();
    const duplicated: QuestionPaper = {
      ...paperToDuplicate,
      id: newId,
      subjectName: paperToDuplicate.subjectName ? `${paperToDuplicate.subjectName} (Copy)` : "Copy Draft",
      updatedAt: Date.now(),
      questions: JSON.parse(JSON.stringify(paperToDuplicate.questions)),
    };
    const nextHistory = [duplicated, ...history];
    setHistory(nextHistory);
    setActiveId(newId);
    localStorage.setItem("question-paper-builder-history", JSON.stringify(nextHistory));
  };

  // Delete draft paper
  const confirmDeletePaper = (targetId: string) => {
    if (history.length <= 1) {
      alert("You must keep at least one paper in your history.");
      setDeletingId(null);
      return;
    }
    const nextHistory = history.filter((p) => p.id !== targetId);
    setHistory(nextHistory);
    if (activeId === targetId) {
      setActiveId(nextHistory[0].id || "");
    }
    localStorage.setItem("question-paper-builder-history", JSON.stringify(nextHistory));
    setDeletingId(null);
  };

  // 3. RENDER PORTAL LOCK IF NOT AUTHENTICATED
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 selection:bg-blue-900 selection:text-white">
        <div className="w-full max-w-md bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-8 overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600"></div>
          
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/30 mb-4 animate-pulse">
              <Lock className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Teacher Security Portal
            </h1>
            <p className="text-sm text-slate-400 mt-1.5">
              Securely lock and manage exam paper drafts.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">
                Master Security Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError("");
                  }}
                  placeholder="Enter access password..."
                  className="w-full pl-4 pr-11 py-3 bg-slate-950/80 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && (
                <p className="text-red-400 text-xs mt-2 font-semibold flex items-center space-x-1">
                  <span>⚠️</span>
                  <span>{passwordError}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={lockoutRemaining > 0}
              className={`w-full py-3 font-bold rounded-lg text-sm tracking-wide transition-all shadow-lg flex items-center justify-center space-x-2 ${
                lockoutRemaining > 0 
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white hover:shadow-blue-500/10 cursor-pointer"
              }`}
            >
              <Unlock className="w-4 h-4" />
              <span>{lockoutRemaining > 0 ? `Locked (${lockoutRemaining}s)` : "Unlock Access Portal"}</span>
            </button>
          </form>
        </div>
        <p className="text-center text-slate-600 text-xs mt-6 font-medium">
          Question Paper Builder • Client-Side Security Vault
        </p>
      </div>
    );
  }

  // 4. MAIN WORKSPACE VIEW
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 selection:bg-blue-100 selection:text-blue-900 pb-12 transition-colors duration-200">
      {/* App Header Bar */}
      <header className="no-print sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-4 transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3 self-start sm:self-auto">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-white dark:bg-slate-800 rounded-md transition-all cursor-pointer shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 mr-2"
              title="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="bg-blue-600 text-white p-2 rounded flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {currentApp === "question-paper" ? "Question Paper Builder" : "Report Card Generator"}
                </h1>
                <span className="inline-flex items-center space-x-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800" title="This application runs 100% on your device. Your changes are automatically saved locally and remain accessible without internet connection.">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Offline Ready</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                {currentApp === "question-paper" ? "Formal Exam Layouts & Google Docs Tabbed Export" : "Student Progress Reports & Printable Layouts"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 self-stretch sm:self-auto ml-0 sm:ml-4">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-md border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActivePage("edit")}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activePage === "edit"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-slate-200/60 dark:border-slate-600"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{currentApp === "question-paper" ? "1. Edit Questions" : "1. Edit Card"}</span>
              </button>
              <button
                onClick={() => setActivePage("preview")}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activePage === "preview"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-slate-200/60 dark:border-slate-600"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{currentApp === "question-paper" ? "2. Preview & Export" : "2. Preview & Print"}</span>
              </button>
            </div>
            
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-white dark:bg-slate-800 rounded-md transition-all cursor-pointer shadow-sm"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Slide Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="no-print fixed inset-0 z-50 flex justify-start">
          <div 
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="relative w-72 h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-left duration-300 border-r border-slate-200 dark:border-slate-800">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <span className="font-bold text-slate-800 dark:text-slate-200 tracking-wide">Menu</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-md cursor-pointer transition-colors shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Apps</p>
                <button
                  onClick={() => {
                    setCurrentApp("question-paper");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 rounded-md text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    currentApp === "question-paper"
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm border border-blue-200 dark:border-blue-800"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent"
                  }`}
                >
                  Question Papers
                </button>
                <button
                  onClick={() => {
                    setCurrentApp("report-card");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 rounded-md text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    currentApp === "report-card"
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm border border-blue-200 dark:border-blue-800"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent"
                  }`}
                >
                  Report Cards
                </button>
              </div>

              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-1">Security</p>
                <button
                  onClick={() => {
                    setShowLockConfirm(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-white dark:bg-slate-800 rounded-md text-sm font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                  title="Lock active session with password"
                >
                  <Lock className="w-4 h-4 text-slate-500" />
                  <span>Lock Portal</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Layout */}
      {currentApp === "question-paper" ? (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Page Content area */}
        <div className="space-y-6">
          
          {/* PAGE 1: EDITOR FORM & QUESTION BUILDER WITH DRAFTS HISTORY */}
          {activePage === "edit" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Drafts History Sidebar Panel (Span 4) */}
              <div className="no-print lg:col-span-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden sticky lg:top-24">
                {/* Panel Header */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Drafts &amp; History ({history.length})
                    </h2>
                  </div>
                  <button
                    onClick={handleCreateNewPaper}
                    className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm shadow-blue-500/10"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Paper</span>
                  </button>
                </div>

                {/* Drafts List */}
                <div className="p-3 space-y-2 max-h-[320px] lg:max-h-[460px] overflow-y-auto">
                  {history.map((p) => {
                    const isActive = p.id === activeId;
                    const paperTitle = p.subjectName.trim() || "Untitled Subject";
                    const paperMeta = [
                      p.classGrade.trim() || "Draft Grade",
                      p.assessmentType.trim() || "Draft Exam"
                    ].filter(Boolean).join(" • ");
                    const formattedTime = formatRelativeTime(p.updatedAt);

                    return (
                      <div
                        key={p.id}
                        onClick={() => setActiveId(p.id || "")}
                        className={`group relative p-3 rounded border text-left transition-all cursor-pointer ${
                          isActive
                            ? "bg-blue-50/60 dark:bg-blue-900/20 border-blue-400 dark:border-blue-500 shadow-sm"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/50"
                        }`}
                      >
                        <div className="pr-16">
                          <div className={`font-semibold text-sm truncate ${isActive ? "text-blue-900 dark:text-blue-400 font-bold" : "text-slate-800 dark:text-slate-200"}`}>
                            {paperTitle}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {paperMeta}
                          </div>
                          {p.fullMarks && (
                            <span className="inline-flex items-center text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold px-1.5 py-0.5 rounded mt-1.5 border border-slate-200/50 dark:border-slate-600">
                              F.M. {p.fullMarks}
                            </span>
                          )}
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 flex items-center space-x-1 font-medium">
                            <Clock className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                            <span>{formattedTime}</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center space-x-1 bg-white dark:bg-slate-800 group-hover:opacity-100 opacity-80 sm:opacity-0 group-hover:pointer-events-auto sm:pointer-events-none transition-all p-1 rounded border border-slate-100/50 dark:border-slate-700 shadow-sm">
                          <button
                            onClick={(e) => handleDuplicatePaper(p.id || "", e)}
                            title="Duplicate paper draft"
                            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          
                          {deletingId === p.id ? (
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmDeletePaper(p.id || "");
                                }}
                                className="px-2 py-1 bg-red-600 dark:bg-red-700 text-white text-[9px] font-bold uppercase tracking-wider rounded hover:bg-red-700 dark:hover:bg-red-600 cursor-pointer"
                              >
                                Delete
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingId(null);
                                }}
                                className="px-1.5 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[9px] font-bold uppercase tracking-wider rounded hover:bg-slate-300 dark:hover:bg-slate-600 cursor-pointer"
                              >
                                X
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingId(p.id || null);
                              }}
                              title="Delete draft paper"
                              className="p-1.5 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Collapsible Security Panel */}
                <div className="border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50 p-4">
                  <button
                    onClick={() => setShowSettingsPanel(!showSettingsPanel)}
                    className="w-full flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center space-x-1.5">
                      <Settings className="w-3.5 h-3.5" />
                      <span>Security Settings</span>
                    </span>
                    {showSettingsPanel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showSettingsPanel && (
                    <form onSubmit={handlePasswordChange} className="mt-3.5 space-y-3.5 pt-3.5 border-t border-slate-200/50 dark:border-slate-700 animate-fadeIn">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          Current Master Password
                        </label>
                        <div className="text-xs font-mono bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2.5 py-1.5 text-slate-600 dark:text-slate-300 flex justify-between items-center select-all">
                          <span>{masterPassword}</span>
                          <span className="text-[9px] uppercase font-bold text-slate-400">Master</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          Set New Password
                        </label>
                        <input
                          type="text"
                          value={newPasswordInput}
                          onChange={(e) => setNewPasswordInput(e.target.value)}
                          placeholder="Type new password..."
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:text-white"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={!newPasswordInput.trim()}
                        className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer flex items-center justify-center space-x-1"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Change Password</span>
                      </button>

                      {passwordSuccessMessage && (
                        <p className="text-emerald-600 text-[11px] font-semibold text-center mt-1 flex items-center justify-center space-x-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>{passwordSuccessMessage}</span>
                        </p>
                      )}
                    </form>
                  )}
                </div>
              </div>

              {/* Editing Form column (Span 8) */}
              <div className="lg:col-span-8 space-y-6">
                {/* Part A: Paper Header metadata form */}
                <HeaderForm paper={paper} onChange={handlePaperChange} />

                {/* Part B: Individual questions manager */}
                <QuestionsBuilder 
                  questions={paper.questions} 
                  onChange={handleQuestionsChange} 
                  targetMarks={paper.fullMarks}
                />
              </div>

            </div>
          )}

          {/* PAGE 2: PREVIEWS & OUTPUT GENERATOR */}
          {activePage === "preview" && (
            <div className="space-y-6">
              {/* Output Mode Tab Bar */}
              <div className="no-print bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm max-w-4xl mx-auto">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1.5">
                  Output Viewer Tab
                </span>

                <div className="flex bg-slate-100 dark:bg-slate-900 rounded p-1 border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
                  <button
                    onClick={() => setActiveTab("print")}
                    id="tab-print-preview"
                    className={`flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      activeTab === "print"
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-950 dark:hover:text-slate-200"
                    }`}
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Preview</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("gdoc")}
                    id="tab-gdoc-text"
                    className={`flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      activeTab === "gdoc"
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-950 dark:hover:text-slate-200"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Google Doc Text</span>
                  </button>
                </div>
              </div>

              {/* Render Selected View Tab */}
              <div className="transition-all duration-200">
                {activeTab === "print" ? (
                  <PrintPreview paper={paper} />
                ) : (
                  <GoogleDocExport paper={paper} />
                )}
              </div>
            </div>
          )}

        </div>
        </main>
      ) : (
        <ReportCardApp activePage={activePage} setActivePage={setActivePage} />
      )}

      {/* Lock Portal Confirmation Modal */}
      {showLockConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-sm w-full overflow-hidden p-6 relative">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Lock Security Portal?
              </h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Are you sure you want to lock the portal? You will need the master password to unlock and resume editing.
              </p>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowLockConfirm(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLockConfirm(false);
                  handleLogout();
                }}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm shadow-red-500/10"
              >
                Lock Portal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
