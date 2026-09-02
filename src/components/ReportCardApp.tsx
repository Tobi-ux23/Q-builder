import { useState, useEffect, MouseEvent } from "react";
import { ReportCard } from "../types";
import { SAMPLE_REPORT_CARD } from "../sampleData";
import { ReportCardForm } from "./ReportCardBuilder/ReportCardForm";
import { ReportCardPrintPreview } from "./ReportCardBuilder/ReportCardPrintPreview";
import { 
  Eye, 
  Edit3, 
  Printer,
  Plus,
  Trash2,
  Copy,
  Clock,
  Download,
  Loader2,
} from "lucide-react";

const EMPTY_REPORT_CARD: ReportCard = {
  schoolName: "T.L.T. Sports Academy",
  schoolSubheading: "ꯇꯤ.ꯑꯦꯜ.ꯇꯤ. ꯁ꯭ꯄꯣꯔꯠꯁ ꯑꯦꯀꯥꯗꯦꯃꯤ",
  schoolAddress: "Tharoijam, Imphal",
  academicYear: "2026-27",
  studentName: "",
  className: "",
  section: "",
  rollNo: "",
  subjects: ["Subject 1", "Subject 2"],
  assessments: [{ assessmentName: "Term 1", maxMarks: "100", attendance: "", rank: "", subjectMarks: {} }],
  sportsRemark: "Shows high energy, active participation, and great sportsmanship.",
  disciplineRemark: "Courteous, reliable, and self-disciplined.",
  overallRemark: "Excellent attitude, consistent effort, and good potential."
};

const generateId = () => "report-" + Math.random().toString(36).substring(2, 11) + "-" + Date.now().toString(36);

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

interface ReportCardAppProps {
  activePage: "edit" | "preview";
  setActivePage: (page: "edit" | "preview") => void;
}

export function ReportCardApp({ activePage, setActivePage }: ReportCardAppProps) {
  const [history, setHistory] = useState<ReportCard[]>(() => {
    const saved = localStorage.getItem("report-card-builder-history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error("Error reading saved report card history from localStorage", e);
      }
    }

    const initialCard = {
      ...SAMPLE_REPORT_CARD,
      id: "report-default-sample",
      updatedAt: Date.now(),
    };
    const initialHistory = [initialCard];
    localStorage.setItem("report-card-builder-history", JSON.stringify(initialHistory));
    return initialHistory;
  });

  const [activeId, setActiveId] = useState<string>(() => {
    const savedActiveId = localStorage.getItem("report-card-builder-active-id");
    if (savedActiveId && history.some((p) => p.id === savedActiveId)) {
      return savedActiveId;
    }
    return history[0]?.id || "report-default-sample";
  });

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const reportCard = history.find((p) => p.id === activeId) || history[0] || {
    ...EMPTY_REPORT_CARD,
    id: "report-empty-fallback",
    updatedAt: Date.now(),
  };

  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    localStorage.setItem("report-card-builder-active-id", activeId);
  }, [activeId]);

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    try {
      const element = document.querySelector(".report-card-print-target") as HTMLElement;
      if (!element) {
        setIsExporting(false);
        alert("Preview element not found");
        return;
      }

      // Lazy load to prevent build issues and keep main bundle small
      const { jsPDF } = await import("jspdf");
      const htmlToImage = await import("html-to-image");

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });

      const originalShadow = element.style.boxShadow;
      const originalBorder = element.style.border;
      const originalTransform = element.style.transform;
      
      element.style.boxShadow = "none";
      element.style.border = "none";
      element.style.transform = "none"; // Ensure no scaling affects the canvas capture

      const imgData = await htmlToImage.toJpeg(element, {
        quality: 0.98,
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        width: element.scrollWidth,
        height: Math.max(element.scrollHeight, element.offsetHeight),
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
          margin: "0",
        }
      });

      element.style.boxShadow = originalShadow;
      element.style.border = originalBorder;
      element.style.transform = originalTransform;
      
      // Calculate aspect ratio to fit the image correctly without distortion
      const pdfWidth = pdf.internal.pageSize.getWidth(); // A4 Landscape width
      const pdfHeight = pdf.internal.pageSize.getHeight(); // A4 Landscape height
      
      const imgProps = pdf.getImageProperties(imgData);
      const imgRatio = imgProps.width / imgProps.height;
      const pdfRatio = pdfWidth / pdfHeight;
      
      let renderWidth = pdfWidth;
      let renderHeight = pdfWidth / imgRatio;
      
      if (imgRatio < pdfRatio) {
         renderHeight = pdfHeight;
         renderWidth = pdfHeight * imgRatio;
      }
      
      const x = (pdfWidth - renderWidth) / 2;
      const y = (pdfHeight - renderHeight) / 2;

      pdf.addImage(imgData, "JPEG", x, y, renderWidth, renderHeight);
      
      const filename = `Report_Card_${(reportCard.studentName || "Student").replace(/\s+/g, '_')}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleReportCardChange = (updatedCard: ReportCard) => {
    setHistory((prevHistory) => {
      const next = prevHistory.map((p) => 
        p.id === updatedCard.id 
          ? { ...updatedCard, updatedAt: Date.now() } 
          : p
      );
      localStorage.setItem("report-card-builder-history", JSON.stringify(next));
      return next;
    });
  };

  const handleCreateNew = () => {
    const newId = generateId();
    const newCard: ReportCard = {
      ...EMPTY_REPORT_CARD,
      id: newId,
      updatedAt: Date.now(),
    };
    const nextHistory = [newCard, ...history];
    setHistory(nextHistory);
    setActiveId(newId);
    localStorage.setItem("report-card-builder-history", JSON.stringify(nextHistory));
  };

  const handleDuplicate = (targetId: string, event: MouseEvent) => {
    event.stopPropagation();
    const targetCard = history.find((p) => p.id === targetId);
    if (!targetCard) return;
    const newId = generateId();
    const duplicated: ReportCard = {
      ...targetCard,
      id: newId,
      studentName: targetCard.studentName ? `${targetCard.studentName} (Copy)` : "Copy Draft",
      updatedAt: Date.now(),
      assessments: JSON.parse(JSON.stringify(targetCard.assessments)),
      subjects: [...targetCard.subjects]
    };
    const nextHistory = [duplicated, ...history];
    setHistory(nextHistory);
    setActiveId(newId);
    localStorage.setItem("report-card-builder-history", JSON.stringify(nextHistory));
  };

  const confirmDelete = (targetId: string) => {
    if (history.length <= 1) {
      alert("You must keep at least one report card in your history.");
      setDeletingId(null);
      return;
    }
    const nextHistory = history.filter((p) => p.id !== targetId);
    setHistory(nextHistory);
    if (activeId === targetId) {
      setActiveId(nextHistory[0].id || "");
    }
    localStorage.setItem("report-card-builder-history", JSON.stringify(nextHistory));
    setDeletingId(null);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      
      <div className="space-y-6">
        
        {activePage === "edit" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Drafts History Sidebar Panel (Span 4) */}
            <div className="no-print lg:col-span-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden sticky lg:top-24">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Drafts &amp; History ({history.length})
                  </h2>
                </div>
                <button
                  onClick={handleCreateNew}
                  className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm shadow-blue-500/10"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Card</span>
                </button>
              </div>

              <div className="p-3 space-y-2 max-h-[320px] lg:max-h-[500px] overflow-y-auto">
                {history.map((p) => {
                  const isActive = p.id === activeId;
                  const title = p.studentName.trim() || "Untitled Student";
                  const meta = [
                    p.className.trim() || "Class",
                    p.section.trim() || "Sec",
                    p.rollNo?.trim() ? `Roll ${p.rollNo.trim()}` : ""
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
                          {title}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {meta}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 flex items-center space-x-1 font-medium">
                          <Clock className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                          <span>{formattedTime}</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center space-x-1 bg-white dark:bg-slate-800 group-hover:opacity-100 opacity-80 sm:opacity-0 group-hover:pointer-events-auto sm:pointer-events-none transition-all p-1 rounded border border-slate-100/50 dark:border-slate-700 shadow-sm">
                        <button
                          onClick={(e) => handleDuplicate(p.id || "", e)}
                          title="Duplicate draft"
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        
                        {deletingId === p.id ? (
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                confirmDelete(p.id || "");
                              }}
                              className="px-2 py-1 bg-red-600 dark:bg-red-700 text-white text-[9px] font-bold uppercase tracking-wider rounded hover:bg-red-700 dark:hover:bg-red-600 cursor-pointer"
                            >
                              Del
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
                            title="Delete draft"
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
            </div>

            <div className="lg:col-span-9 space-y-6">
              <ReportCardForm reportCard={reportCard} onChange={handleReportCardChange} />
            </div>
          </div>
        )}

        {activePage === "preview" && (
          <div className="space-y-6">
            <div className="no-print bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-2.5 flex items-center justify-between gap-3 shadow-sm max-w-4xl mx-auto">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1.5">
                Output Viewer
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center justify-center space-x-1.5 px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={handleDownloadPDF}
                  disabled={isExporting}
                  className="flex items-center justify-center space-x-1.5 px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer bg-blue-600 text-white hover:bg-blue-700 shadow-sm disabled:opacity-70"
                >
                  {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  <span>{isExporting ? "Exporting..." : "Download PDF"}</span>
                </button>
              </div>
            </div>
            <ReportCardPrintPreview reportCard={reportCard} />
          </div>
        )}

      </div>
    </main>
  );
}
