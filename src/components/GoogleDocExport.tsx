import React, { useState } from "react";
import { QuestionPaper } from "../types";
import { generateGoogleDocText, generateWordHTML, downloadFile } from "../utils";
import { Copy, Check, Download, FileCode, FileText } from "lucide-react";

interface GoogleDocExportProps {
  paper: QuestionPaper;
}

export const GoogleDocExport: React.FC<GoogleDocExportProps> = ({ paper }) => {
  const [copied, setCopied] = useState(false);
  const formattedText = generateGoogleDocText(paper);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleDownloadTxt = () => {
    const filename = `${paper.subjectName || "Subject"}_Exam_Paper_${paper.academicYear || "2026"}.txt`
      .toLowerCase()
      .replace(/\s+/g, "_");
    downloadFile(formattedText, filename, "text/plain;charset=utf-8");
  };

  const handleDownloadDoc = () => {
    const filename = `${paper.subjectName || "Subject"}_Exam_Paper_${paper.academicYear || "2026"}.doc`
      .toLowerCase()
      .replace(/\s+/g, "_");
    const htmlContent = generateWordHTML(paper);
    downloadFile(htmlContent, filename, "application/msword;charset=utf-8");
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200">Google Doc Format</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1.5">
            Copy or download this text. It preserves perfect tabs (\t) for copy-pasting directly into Google Docs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded shadow-sm transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy to Clipboard</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Editor Preview */}
      <div className="relative">
        <textarea
          readOnly
          value={formattedText}
          className="w-full h-96 p-4 font-mono text-xs bg-slate-900 text-slate-100 rounded focus:outline-none overflow-y-auto leading-relaxed border border-slate-800"
        />
        <div className="absolute top-2 right-2 bg-slate-800/80 text-slate-400 text-[10px] px-2 py-1 rounded font-mono pointer-events-none select-none">
          TXT / TABS FORMAT
        </div>
      </div>

      {/* Download Action Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button
          onClick={handleDownloadTxt}
          className="flex items-center justify-center space-x-2 border border-slate-200 hover:border-blue-200 hover:bg-blue-50/20 text-slate-700 hover:text-blue-700 p-3 rounded text-sm font-semibold transition-all cursor-pointer"
        >
          <FileCode className="w-4 h-4" />
          <span>Download Tabbed Text (.txt)</span>
        </button>

        <button
          onClick={handleDownloadDoc}
          className="flex items-center justify-center space-x-2 border border-slate-200 hover:border-blue-200 hover:bg-blue-50/20 text-slate-700 hover:text-blue-700 p-3 rounded text-sm font-semibold transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download Word File (.doc)</span>
        </button>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded p-4 text-xs text-slate-600 leading-relaxed">
        <strong className="text-slate-800 dark:text-slate-200 font-bold uppercase tracking-wider text-[10px] block mb-1">💡 Google Docs Compatibility:</strong>
        Standard text is fully supported with tabs. If you download the <strong>Word File (.doc)</strong>, you can upload it or drag-and-drop directly into Google Drive or open in Google Docs. It will preserve centered headers and precise margins automatically!
      </div>
    </div>
  );
};
