import React from "react";
import { QuestionPaper, Question } from "../types";
import { Printer, Download, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface PrintPreviewProps {
  paper: QuestionPaper;
}

// Helper to parse and convert oklch(...) and oklab(...) colors to standard rgb/rgba.
// This is required because html2canvas's internal color parser does not support these modern CSS color spaces
// and throws: "Attempting to parse an unsupported color function"
function replaceOklchAndOklabWithRgb(str: string): string {
  if (!str) return str;
  let result = str;

  // 1. Replace oklch(...)
  if (result.includes("oklch")) {
    result = result.replace(/oklch\(([^)]+)\)/g, (match, inner) => {
      try {
        const parts = inner
          .replace(/,/g, " ")
          .replace(/\//g, " ")
          .split(/\s+/)
          .map((p) => p.trim())
          .filter(Boolean);

        if (parts.length < 3) return match;

        const lStr = parts[0];
        const l = lStr.endsWith("%") ? parseFloat(lStr) / 100 : parseFloat(lStr);

        const cStr = parts[1];
        const c = cStr.endsWith("%") ? parseFloat(cStr) / 100 : parseFloat(cStr);

        const hStr = parts[2];
        const h = parseFloat(hStr);

        let a = 1;
        if (parts.length >= 4) {
          const aStr = parts[3];
          a = aStr.endsWith("%") ? parseFloat(aStr) / 100 : parseFloat(aStr);
        }

        // Convert OKLCH to OKLAB
        const hRad = (h * Math.PI) / 180;
        const a_lab = c * Math.cos(hRad);
        const b_lab = c * Math.sin(hRad);

        // Convert OKLAB to LMS
        const l_lms = l + 0.3963377774 * a_lab + 0.2158037573 * b_lab;
        const m_lms = l - 0.1055613458 * a_lab - 0.0638541728 * b_lab;
        const s_lms = l - 0.0894841775 * a_lab - 1.2914855480 * b_lab;

        // Cube LMS
        const l_lms3 = l_lms * l_lms * l_lms;
        const m_lms3 = m_lms * m_lms * m_lms;
        const s_lms3 = s_lms * s_lms * s_lms;

        // Convert LMS to linear RGB
        const r_linear = 4.0767416621 * l_lms3 - 3.3077115913 * m_lms3 + 0.2309699292 * s_lms3;
        const g_linear = -1.2684380046 * l_lms3 + 2.6097574011 * m_lms3 - 0.3413193965 * s_lms3;
        const b_linear = -0.0041960863 * l_lms3 - 0.7034186147 * m_lms3 + 1.7076147010 * s_lms3;

        // Standard sRGB gamma compression transfer function
        const transfer = (val: number) => {
          return val <= 0.0031308 ? 12.92 * val : 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
        };

        const r = Math.round(Math.max(0, Math.min(1, transfer(r_linear))) * 255);
        const g = Math.round(Math.max(0, Math.min(1, transfer(g_linear))) * 255);
        const b = Math.round(Math.max(0, Math.min(1, transfer(b_linear))) * 255);

        if (a === 1) {
          return `rgb(${r}, ${g}, ${b})`;
        } else {
          return `rgba(${r}, ${g}, ${b}, ${a})`;
        }
      } catch (e) {
        console.warn("Failed to parse oklch color:", match, e);
        return "rgb(0, 0, 0)";
      }
    });
  }

  // 2. Replace oklab(...)
  if (result.includes("oklab")) {
    result = result.replace(/oklab\(([^)]+)\)/g, (match, inner) => {
      try {
        const parts = inner
          .replace(/,/g, " ")
          .replace(/\//g, " ")
          .split(/\s+/)
          .map((p) => p.trim())
          .filter(Boolean);

        if (parts.length < 3) return match;

        const lStr = parts[0];
        const l = lStr.endsWith("%") ? parseFloat(lStr) / 100 : parseFloat(lStr);

        const aStr = parts[1];
        const a_lab = aStr.endsWith("%") ? parseFloat(aStr) / 100 : parseFloat(aStr);

        const bStr = parts[2];
        const b_lab = bStr.endsWith("%") ? parseFloat(bStr) / 100 : parseFloat(bStr);

        let alpha = 1;
        if (parts.length >= 4) {
          const alphaStr = parts[3];
          alpha = alphaStr.endsWith("%") ? parseFloat(alphaStr) / 100 : parseFloat(alphaStr);
        }

        // Convert OKLAB to LMS
        const l_lms = l + 0.3963377774 * a_lab + 0.2158037573 * b_lab;
        const m_lms = l - 0.1055613458 * a_lab - 0.0638541728 * b_lab;
        const s_lms = l - 0.0894841775 * a_lab - 1.2914855480 * b_lab;

        // Cube LMS
        const l_lms3 = l_lms * l_lms * l_lms;
        const m_lms3 = m_lms * m_lms * m_lms;
        const s_lms3 = s_lms * s_lms * s_lms;

        // Convert LMS to linear RGB
        const r_linear = 4.0767416621 * l_lms3 - 3.3077115913 * m_lms3 + 0.2309699292 * s_lms3;
        const g_linear = -1.2684380046 * l_lms3 + 2.6097574011 * m_lms3 - 0.3413193965 * s_lms3;
        const b_linear = -0.0041960863 * l_lms3 - 0.7034186147 * m_lms3 + 1.7076147010 * s_lms3;

        // Standard sRGB gamma compression transfer function
        const transfer = (val: number) => {
          return val <= 0.0031308 ? 12.92 * val : 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
        };

        const r = Math.round(Math.max(0, Math.min(1, transfer(r_linear))) * 255);
        const g = Math.round(Math.max(0, Math.min(1, transfer(g_linear))) * 255);
        const b = Math.round(Math.max(0, Math.min(1, transfer(b_linear))) * 255);

        if (alpha === 1) {
          return `rgb(${r}, ${g}, ${b})`;
        } else {
          return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
      } catch (e) {
        console.warn("Failed to parse oklab color:", match, e);
        return "rgb(0, 0, 0)";
      }
    });
  }

  return result;
}

export const PrintPreview: React.FC<PrintPreviewProps> = ({ paper }) => {
  const [isExporting, setIsExporting] = React.useState(false);
  const [paginatedPages, setPaginatedPages] = React.useState<Question[][]>([paper.questions]);
  const measureRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const runLayout = () => {
      const container = measureRef.current;
      if (!container) return;

      // 1. Get header height
      const headerEl = container.querySelector(".measure-header");
      const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 150;

      // 2. Get height of each question element
      const questionEls = container.querySelectorAll(".measure-question");
      const questionHeights: { id: string; height: number }[] = [];
      questionEls.forEach((el) => {
        const id = el.getAttribute("data-id");
        if (id) {
          questionHeights.push({
            id,
            height: el.getBoundingClientRect().height,
          });
        }
      });

      // A4 page height is 297mm. At 96 DPI, 297mm = 1123px.
      // Top and bottom padding are 20mm each, meaning 40mm total (approx 151px).
      // Standard printable content height is 1123 - 151 = 972px.
      const PAGE_HEIGHT = 1123;
      const PADDING_Y = 151; // 20mm top + 20mm bottom in pixels
      const PRINTABLE_HEIGHT = PAGE_HEIGHT - PADDING_Y;

      // First page contains the main school header and subject info,
      // so it has less printable space for questions.
      const firstPageLimit = PRINTABLE_HEIGHT - headerHeight - 15;
      const subsequentPageLimit = PRINTABLE_HEIGHT - 15;

      const pages: Question[][] = [];
      let currentPage: Question[] = [];
      let currentHeight = 0;
      let isFirstPage = true;

      paper.questions.forEach((q) => {
        const heightInfo = questionHeights.find((qh) => qh.id === q.id);
        const qHeight = heightInfo ? heightInfo.height : 80; // default/fallback height
        
        const limit = isFirstPage ? firstPageLimit : subsequentPageLimit;

        if (currentHeight + qHeight > limit && currentPage.length > 0) {
          // Push current page
          pages.push(currentPage);
          // Start next page
          currentPage = [q];
          currentHeight = qHeight;
          isFirstPage = false;
        } else {
          currentPage.push(q);
          currentHeight += qHeight;
        }
      });

      if (currentPage.length > 0) {
        pages.push(currentPage);
      }

      if (pages.length === 0) {
        pages.push([]);
      }

      setPaginatedPages(pages);
    };

    // Run layout measuring after browser has updated layout
    const animId = requestAnimationFrame(runLayout);
    return () => cancelAnimationFrame(animId);
  }, [paper, paper.questions]);

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    try {
      const pageElements = document.querySelectorAll(".exam-sheet-page");
      if (pageElements.length === 0) return;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      for (let i = 0; i < pageElements.length; i++) {
        const element = pageElements[i] as HTMLElement;

        // Hide shadow and borders for PDF export
        const originalShadow = element.style.boxShadow;
        const originalBorder = element.style.border;
        const originalBorderRadius = element.style.borderRadius;
        
        element.style.boxShadow = "none";
        element.style.border = "none";
        element.style.borderRadius = "0";

        const canvas = await html2canvas(element, {
          scale: 2.5,
          useCORS: true,
          logging: false,
          onclone: (clonedDoc) => {
            // Replace any CSS custom property or styling with oklch / oklab colors
            const styleTags = clonedDoc.getElementsByTagName("style");
            for (let s = 0; s < styleTags.length; s++) {
              const styleTag = styleTags[s];
              if (styleTag.innerHTML) {
                styleTag.innerHTML = replaceOklchAndOklabWithRgb(styleTag.innerHTML);
              }
            }

            const clonedPages = clonedDoc.querySelectorAll(".exam-sheet-page");
            const clonedPage = clonedPages[i] as HTMLElement;
            if (!clonedPage) return;

            const processElement = (original: HTMLElement, cloned: HTMLElement) => {
              const props = [
                "color",
                "background-color",
                "border-color",
                "border-top-color",
                "border-bottom-color",
                "border-left-color",
                "border-right-color",
                "box-shadow",
                "text-decoration-color",
                "outline-color",
                "fill",
                "stroke"
              ];
              
              try {
                const computed = window.getComputedStyle(original);
                props.forEach(prop => {
                  const val = computed.getPropertyValue(prop);
                  if (val && (val.includes("oklch") || val.includes("oklab"))) {
                    const cleanedVal = replaceOklchAndOklabWithRgb(val);
                    cloned.style.setProperty(prop, cleanedVal, "important");
                  }
                });
              } catch (e) {
                // Ignore
              }

              const originalChildren = Array.from(original.children) as HTMLElement[];
              const clonedChildren = Array.from(cloned.children) as HTMLElement[];
              for (let c = 0; c < originalChildren.length; c++) {
                if (originalChildren[c] && clonedChildren[c]) {
                  processElement(originalChildren[c], clonedChildren[c]);
                }
              }
            };

            processElement(element, clonedPage);
          }
        });

        // Restore styles
        element.style.boxShadow = originalShadow;
        element.style.border = originalBorder;
        element.style.borderRadius = originalBorderRadius;

        const imgData = canvas.toDataURL("image/jpeg", 0.98);

        if (i > 0) {
          pdf.addPage();
        }

        // Standard A4 width is 210mm, height is 297mm
        pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);
      }

      const fileName = `${paper.subjectName || "Subject"}_Exam_Paper.pdf`
        .replace(/[^a-zA-Z0-9]/g, "_")
        .replace(/_+/g, "_");
      
      pdf.save(fileName);
    } catch (error) {
      console.error("Failed to generate high-fidelity PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action panel */}
      <div className="no-print bg-white dark:bg-slate-800 dark:border-slate-700 border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <Printer className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Export &amp; Print</span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Save as PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hidden Measuring Container */}
      <div 
        ref={measureRef}
        className="absolute top-0 left-0 -z-50 invisible pointer-events-none"
        style={{ width: "210mm" }}
      >
        <div className="p-[20mm] bg-white text-black font-serif" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
          {/* Header section inside .measure-header */}
          <div className="measure-header text-center pb-4 border-b-2 border-black mb-4">
            <h1 className="text-2xl font-bold tracking-wide uppercase">
              {paper.schoolName || "SCHOOL / INSTITUTION NAME"}
            </h1>
            <p className="text-base font-bold">
              {paper.assessmentType || "Assessment Type"} {paper.academicYear ? `(${paper.academicYear})` : ""}
            </p>
            <p className="text-sm font-semibold">
              {paper.classGrade || "Class / Grade Details"}
            </p>
            <div className="pt-2 flex justify-between items-end text-sm text-left">
              <div className="space-y-1">
                <p className="font-bold">Subject: {paper.subjectName || "Subject Name"}</p>
                <p className="italic text-xs font-medium max-w-[500px]">{paper.instructions || "General instructions"}</p>
                {paper.examDate && (
                  <p className="text-xs text-gray-700 mt-1">Date: {paper.examDate}</p>
                )}
              </div>
              <div className="text-right font-bold space-y-0.5 text-sm whitespace-nowrap">
                <p>F.M. = {paper.fullMarks || "0"}</p>
                <p>Time: {paper.timeAllotted || "0 mins"}</p>
              </div>
            </div>
          </div>

          {/* Questions list */}
          <div className="space-y-4 text-[14px]">
            {paper.questions.map((q, idx) => (
              <div 
                key={q.id} 
                className="measure-question space-y-2 py-1" 
                data-id={q.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="font-bold min-w-[24px]">{q.number || (idx + 1)}.</span>
                    <span className="whitespace-pre-line text-justify leading-relaxed">
                      {q.text || "Empty question prompt..."}
                    </span>
                  </div>
                  {q.marks && (
                    <span className="font-bold text-right pl-4 whitespace-nowrap">
                      {(() => {
                        const m = q.marks.trim();
                        return (m.startsWith("[") && m.endsWith("]")) ? m : `[${m}]`;
                      })()}
                    </span>
                  )}
                </div>

                {q.subQuestions && q.subQuestions.length > 0 && (
                  <div className="pl-8 space-y-1.5">
                    {q.subQuestions.map((sq) => {
                      const labelStr = sq.label ? `(${sq.label}). ` : "";
                      return (
                        <div key={sq.id} className="flex items-start gap-2">
                          <span className="font-medium min-w-[20px]">{labelStr}</span>
                          <span className="text-justify leading-relaxed">{sq.text || "Empty sub-question..."}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visual A4 paper sheets container */}
      <div className="flex flex-col items-center gap-6 bg-slate-100 dark:bg-slate-700 p-4 md:p-6 rounded-lg border border-slate-200 overflow-x-auto">
        {paginatedPages.map((questions, pageIdx) => {
          const isFirst = pageIdx === 0;
          return (
            <div
              key={pageIdx}
              className="exam-sheet-page w-[210mm] h-[297mm] bg-white text-black p-[20mm] shadow-lg rounded border border-slate-200 flex flex-col justify-between font-serif relative shrink-0"
              style={{ fontFamily: "'Times New Roman', Times, serif" }}
            >
              {/* Content area */}
              <div className="flex-1 flex flex-col">
                {isFirst && (
                  <>
                    {/* Header section */}
                    <div className="text-center space-y-1 mb-4">
                      <h1 className="text-2xl font-bold tracking-wide uppercase">
                        {paper.schoolName || "SCHOOL / INSTITUTION NAME"}
                      </h1>
                      <p className="text-base font-bold">
                        {paper.assessmentType || "Assessment Type"} {paper.academicYear ? `(${paper.academicYear})` : ""}
                      </p>
                      <p className="text-sm font-semibold">
                        {paper.classGrade || "Class / Grade Details"}
                      </p>
                    </div>

                    {/* Subject and Paper Metadata */}
                    <div className="border-b-2 border-black pb-4 pt-2 mb-4">
                      <div className="flex justify-between items-end gap-2 text-sm">
                        <div className="space-y-1">
                          <p className="font-bold">Subject: {paper.subjectName || "Subject Name"}</p>
                          <p className="italic text-xs font-medium max-w-[500px]">{paper.instructions || "General instructions"}</p>
                          {paper.examDate && (
                            <p className="text-xs text-gray-700 mt-1">Date: {paper.examDate}</p>
                          )}
                        </div>
                        <div className="text-right font-bold space-y-0.5 text-sm whitespace-nowrap">
                          <p>F.M. = {paper.fullMarks || "0"}</p>
                          <p>Time: {paper.timeAllotted || "0 mins"}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Subsequent pages smaller header */}
                {!isFirst && (
                  <div className="border-b border-black/20 pb-2 mb-4 flex justify-between text-xs text-gray-500 font-sans">
                    <span>{paper.subjectName || "Subject"} Exam Paper</span>
                    <span>Page {pageIdx + 1} of {paginatedPages.length}</span>
                  </div>
                )}

                {/* Questions list */}
                <div className="space-y-4 text-[14px]">
                  {questions.length === 0 ? (
                    <p className="text-center italic text-gray-400 py-12 font-sans text-xs">
                      No questions assigned to this page.
                    </p>
                  ) : (
                    questions.map((q) => {
                      // Find global index of this question
                      const globalIdx = paper.questions.findIndex(pq => pq.id === q.id);
                      const qNum = q.number || (globalIdx + 1);
                      return (
                        <div key={q.id} className="space-y-2">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              <span className="font-bold min-w-[24px]">{qNum}.</span>
                              <span className="whitespace-pre-line text-justify leading-relaxed">
                                {q.text || "Empty question prompt..."}
                              </span>
                            </div>
                            {q.marks && (
                              <span className="font-bold text-right pl-4 whitespace-nowrap">
                                {(() => {
                                  const m = q.marks.trim();
                                  return (m.startsWith("[") && m.endsWith("]")) ? m : `[${m}]`;
                                })()}
                              </span>
                            )}
                          </div>

                          {/* Subquestions nested */}
                          {q.subQuestions && q.subQuestions.length > 0 && (
                            <div className="pl-8 space-y-1.5">
                              {q.subQuestions.map((sq) => {
                                const labelStr = sq.label ? `(${sq.label}). ` : "";
                                return (
                                  <div key={sq.id} className="flex items-start gap-2">
                                    <span className="font-medium min-w-[20px]">{labelStr}</span>
                                    <span className="text-justify leading-relaxed">{sq.text || "Empty sub-question..."}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Page Footer */}
              <div>
                <div className="border-t border-black/40 pt-2 flex justify-between text-[11px] text-black">
                  <span>{paper.subjectName || "Subject"} Exam Paper</span>
                  <span>Page {pageIdx + 1} of {paginatedPages.length}</span>
                </div>

                {/* Page footer (optional decorative element) */}
                <div className="no-print mt-4 border-t border-dashed border-slate-200 pt-2 text-center text-[10px] text-slate-400 font-sans">
                  Question paper generated via Question Paper Builder
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
