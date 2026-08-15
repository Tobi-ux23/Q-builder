import { QuestionPaper } from "./types";

/**
 * Generates plain text specifically formatted with tab indents to copy-paste into Google Docs.
 * It matches the exact visual structure, tabs, and alignment requested by the user.
 */
export function generateGoogleDocText(paper: QuestionPaper): string {
  const parts: string[] = [];

  // Center Header Header (We'll output standard text, Google Docs respects standard alignment)
  if (paper.schoolName) parts.push(paper.schoolName.toUpperCase());
  
  const examLineParts: string[] = [];
  if (paper.assessmentType) examLineParts.push(paper.assessmentType);
  if (paper.academicYear) examLineParts.push(`(${paper.academicYear})`);
  if (examLineParts.length > 0) parts.push(examLineParts.join(" "));
  
  if (paper.classGrade) parts.push(paper.classGrade);
  
  // Two blank lines before subject info
  parts.push("");
  parts.push("");

  if (paper.subjectName) parts.push(`Subject: ${paper.subjectName}`);
  if (paper.instructions) parts.push(paper.instructions);
  if (paper.fullMarks) parts.push(`F.M. = ${paper.fullMarks}`);
  if (paper.timeAllotted) parts.push(`Time: ${paper.timeAllotted}`);
  if (paper.examDate) parts.push(`Date: ${paper.examDate}`);

  // Two blank lines before questions
  parts.push("");
  parts.push("");

  paper.questions.forEach((q, idx) => {
    const qNum = q.number || (idx + 1);
    parts.push(`${qNum}.`);
    
    // Add question text with leading tab
    const qTextLines = q.text.split("\n");
    qTextLines.forEach((line) => {
      parts.push(`\t${line}`);
    });
    
    // Add marks with leading tab enclosed in square brackets
    if (q.marks) {
      const formattedMarks = q.marks.trim();
      const withBrackets = (formattedMarks.startsWith("[") && formattedMarks.endsWith("]")) ? formattedMarks : `[${formattedMarks}]`;
      parts.push(`\t${withBrackets}`);
    }
    
    // Add subquestions if any
    if (q.subQuestions && q.subQuestions.length > 0) {
      parts.push("\t"); // blank indented line
      q.subQuestions.forEach((sq) => {
        const subLabel = sq.label ? `(${sq.label}). ` : "";
        // Indent sub-questions
        parts.push(`\t${subLabel}${sq.text}`);
      });
      parts.push("\t"); // blank indented line
    } else {
      // Small spacing after each question
      parts.push("");
    }
  });

  return parts.join("\n");
}

/**
 * Creates and downloads a file in the browser.
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates an HTML document structured as a Word/Google Doc (.doc) which opens 
 * with centered headings, proper tab stops, and page formatting.
 */
export function generateWordHTML(paper: QuestionPaper): string {
  const school = paper.schoolName ? paper.schoolName.toUpperCase() : "INSTITUTION NAME";
  const exam = paper.assessmentType || "Assessment / Exam";
  const year = paper.academicYear ? `(${paper.academicYear})` : "";
  const grade = paper.classGrade || "Class / Grade";
  const subject = paper.subjectName || "Subject";
  const instructions = paper.instructions || "All questions are compulsory.";
  const marks = paper.fullMarks || "30";
  const time = paper.timeAllotted || "60 minutes";
  const date = paper.examDate ? `Date: ${paper.examDate}` : "";

  let questionsHTML = "";
  paper.questions.forEach((q, idx) => {
    const qNum = q.number || (idx + 1);
    
    let subQuestionsHTML = "";
    if (q.subQuestions && q.subQuestions.length > 0) {
      subQuestionsHTML = `<div style="margin-top: 6pt; margin-bottom: 6pt;">`;
      q.subQuestions.forEach((sq) => {
        const subLabel = sq.label ? `(${sq.label}). ` : "";
        subQuestionsHTML += `<p style="margin: 0 0 4pt 36pt; font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.3;">${subLabel}${sq.text}</p>`;
      });
      subQuestionsHTML += `</div>`;
    }

    const m = (q.marks || "").trim();
    const formattedMarks = m ? ((m.startsWith("[") && m.endsWith("]")) ? m : `[${m}]`) : "";

    questionsHTML += `
      <div style="margin-bottom: 16pt; page-break-inside: avoid;">
        <table border="0" cellpadding="0" cellspacing="0" style="width: 100%; font-family: 'Times New Roman', Times, serif; font-size: 11pt;">
          <tr>
            <td style="width: 24pt; vertical-align: top; font-weight: bold;">${qNum}.</td>
            <td style="vertical-align: top; padding-left: 6pt; text-align: justify; line-height: 1.3;">
              ${q.text.replace(/\n/g, "<br/>")}
            </td>
            <td style="width: 80pt; vertical-align: bottom; text-align: right; font-weight: bold; padding-left: 10pt; white-space: nowrap; font-family: 'Times New Roman', Times, serif;">
              ${formattedMarks}
            </td>
          </tr>
        </table>
        ${subQuestionsHTML}
      </div>
    `;
  });

  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>${subject} Exam Paper</title>
      <style>
        @page Section1 {
          size: 8.5in 11in;
          margin: 1.0in 1.0in 1.0in 1.0in;
        }
        div.Section1 {
          page: Section1;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 11pt;
          line-height: 1.2;
          color: #000000;
        }
        p {
          margin: 0 0 6pt 0;
        }
        .header-center {
          text-align: center;
          margin-bottom: 18pt;
          font-family: 'Times New Roman', Times, serif;
        }
        .school-name {
          font-family: 'Times New Roman', Times, serif;
          font-size: 16pt;
          font-weight: bold;
          margin-bottom: 4pt;
        }
        .exam-title {
          font-family: 'Times New Roman', Times, serif;
          font-size: 13pt;
          font-weight: bold;
          margin-bottom: 4pt;
        }
        .class-grade {
          font-family: 'Times New Roman', Times, serif;
          font-size: 12pt;
          font-weight: bold;
          margin-bottom: 12pt;
        }
        .meta-table {
          width: 100%;
          margin-bottom: 18pt;
          border-bottom: 1.5pt solid #000000;
          padding-bottom: 6pt;
          font-family: 'Times New Roman', Times, serif;
        }
        .meta-left {
          font-family: 'Times New Roman', Times, serif;
          font-size: 11pt;
          text-align: left;
          vertical-align: top;
        }
        .meta-right {
          font-family: 'Times New Roman', Times, serif;
          font-size: 11pt;
          text-align: right;
          vertical-align: top;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="Section1">
        <div class="header-center">
          <div class="school-name">${school}</div>
          <div class="exam-title">${exam} ${year}</div>
          <div class="class-grade">${grade}</div>
        </div>
        
        <table class="meta-table" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td class="meta-left" style="width: 60%;">
              <p style="font-weight: bold; margin-bottom: 4pt;">Subject: ${subject}</p>
              <p style="font-style: italic; margin-bottom: 0;">${instructions}</p>
              ${date ? `<p style="margin-top: 4pt; margin-bottom: 0;">${date}</p>` : ""}
            </td>
            <td class="meta-right" style="width: 40%;">
              <p style="margin-bottom: 4pt;">F.M. = ${marks}</p>
              <p style="margin-bottom: 0;">Time: ${time}</p>
            </td>
          </tr>
        </table>
        
        <div style="margin-top: 12pt;">
          ${questionsHTML}
        </div>
      </div>
    </body>
    </html>
  `;
}

