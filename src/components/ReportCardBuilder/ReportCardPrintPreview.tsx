import { ReportCard } from "../../types";

interface Props {
  reportCard: ReportCard;
}

export function ReportCardPrintPreview({ reportCard }: Props) {
  const getRowMetrics = (assessment: import("../../types").AssessmentRecord, subjects: string[]) => {
    let total = 0;
    let count = 0;
    subjects.forEach((sub) => {
      const val = parseFloat(assessment.subjectMarks[sub]);
      if (!isNaN(val)) {
        total += val;
        count += 1;
      }
    });
    const maxVal = parseFloat(assessment.maxMarks || "100") || 100;
    const totalMax = count * maxVal;
    const percentage = totalMax > 0 ? (total / totalMax) * 100 : 0;
    return {
      total: count > 0 ? `${total}/${totalMax}` : "",
      percentage: count > 0 ? percentage.toFixed(1) + "%" : "",
    };
  };

  const tableCellStyle = {
    padding: `${reportCard.tablePadding ?? 12}px`,
    lineHeight: reportCard.tableLineHeight ?? 1.5
  };
  
  const tableHeaderStyle = {
    padding: `${Math.max(2, (reportCard.tablePadding ?? 12) - 4)}px`,
    lineHeight: reportCard.tableLineHeight ?? 1.5
  };

  return (
    <>
      <style type="text/css">
        {`
          @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700;900&display=swap');
          
          .font-merriweather {
            font-family: 'Merriweather', serif;
          }

          @media print {
            @page { size: A4 landscape; margin: 15mm; }
            body { -webkit-print-color-adjust: exact; }
          }
        `}
      </style>
      <div className="report-card-print-target bg-white text-black mx-auto shadow-sm print:shadow-none mb-8 relative border border-slate-200 print:border-none overflow-hidden" style={{ width: "297mm", height: "210mm", padding: "15mm" }}>
        
        {/* Decorative Classic Border */}
        <div className="absolute inset-[10mm] border-[3px] border-slate-800 pointer-events-none rounded-md opacity-90 z-0"></div>
        <div className="absolute inset-[11.5mm] border border-slate-800 pointer-events-none rounded-[4px] opacity-90 z-0"></div>

        <div className="text-center font-serif text-black mb-10 relative z-10 flex flex-col items-center">
        <div className="flex items-center justify-center mb-2 w-full relative">
          {reportCard.schoolLogo && (
            <div className="absolute left-10 md:left-24 top-1/2 -translate-y-1/2">
              <img src={reportCard.schoolLogo} alt="Logo" className="w-24 h-24 object-contain shrink-0" />
            </div>
          )}
          <div className="space-y-1 text-center">
            <h1 className="text-3xl font-bold uppercase tracking-[0.15em] text-[#100E80]">
              {reportCard.schoolName || "T.L.T. Sports Academy"}
            </h1>
            {reportCard.schoolSubheading && (
              <h2 className="text-lg font-semibold text-slate-800">
                {reportCard.schoolSubheading}
              </h2>
            )}
            <p className="text-base">
              {reportCard.schoolAddress || "Tharoijam, Imphal"}
            </p>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold uppercase mt-6 mb-2 underline underline-offset-4">
          REPORT CARD
        </h2>
        <p className="text-base font-bold">
          Progress Report - Academic Year <span className="font-merriweather font-medium tracking-wide text-slate-800">{reportCard.academicYear || "2026-27"}</span>
        </p>
      </div>

      <div className="font-serif text-base mb-3 grid grid-cols-2 gap-4 items-baseline">
        <div className="flex gap-2 items-baseline">
          <span className="font-bold whitespace-nowrap">Student's Name:</span>
          <span className="font-merriweather font-medium text-slate-900 text-[17px] border-b border-transparent pb-px whitespace-nowrap">{reportCard.studentName}</span>
        </div>
        
        <div className="flex gap-8 items-baseline">
          <div className="flex gap-2 items-baseline">
            <span className="font-bold">Class:</span>
            <span className="font-merriweather font-medium text-slate-900 text-[17px] border-b border-transparent pb-px px-1 whitespace-nowrap">{reportCard.className}</span>
          </div>
          <div className="flex gap-2 items-baseline">
            <span className="font-bold">Section:</span>
            <span className="font-merriweather font-medium text-slate-900 text-[17px] border-b border-transparent pb-px px-1 whitespace-nowrap">{reportCard.section}</span>
          </div>
          <div className="flex gap-2 items-baseline">
            <span className="font-bold whitespace-nowrap">Roll No:</span>
            <span className="font-merriweather font-medium text-slate-900 text-[17px] border-b border-transparent pb-px px-1 whitespace-nowrap">{reportCard.rollNo}</span>
          </div>
        </div>
      </div>

      <p className="font-serif text-base mb-2">
        The following are the marks obtained by the above student in the:
      </p>

      <table className="w-full border-collapse border border-black text-center font-serif text-sm mb-8">
        <thead>
          <tr>
            <th className="border border-black font-bold align-middle w-24" style={tableHeaderStyle}>
              Assessment
            </th>
            {reportCard.subjects.map((sub, idx) => (
              <th key={idx} className="border border-black font-bold align-middle break-words max-w-[80px]" style={tableHeaderStyle}>
                {sub}
              </th>
            ))}
            <th className="border border-black font-bold align-middle break-words max-w-[80px]" style={tableHeaderStyle}>
              TOTAL
            </th>
            <th className="border border-black font-bold align-middle break-words max-w-[80px]" style={tableHeaderStyle}>
              PERCENTAGE
            </th>
            <th className="border border-black font-bold align-middle break-words max-w-[80px]" style={tableHeaderStyle}>
              RANK
            </th>
            <th className="border border-black font-bold align-middle break-words max-w-[80px]" style={tableHeaderStyle}>
              ATTENDANCE
            </th>
          </tr>
        </thead>
        <tbody>
          {reportCard.assessments.map((a, idx) => {
            const metrics = getRowMetrics(a, reportCard.subjects);
            return (
            <tr key={idx}>
              <td className="border border-black font-bold" style={tableCellStyle}>
                {a.assessmentName}
              </td>
              {reportCard.subjects.map((sub, sIdx) => {
                const maxVal = parseFloat(a.maxMarks || "100") || 100;
                const val = a.subjectMarks[sub];
                const displayVal = val ? `${val}/${maxVal}` : "";
                
                return (
                <td key={sIdx} className="border border-black font-merriweather font-medium text-slate-800 text-[15px]" style={tableCellStyle}>
                  {displayVal}
                </td>
              )})}
              <td className="border border-black font-merriweather font-bold text-slate-900 text-[15px]" style={tableCellStyle}>
                {metrics.total}
              </td>
              <td className="border border-black font-merriweather font-bold text-slate-900 text-[15px]" style={tableCellStyle}>
                {metrics.percentage}
              </td>
              <td className="border border-black font-merriweather font-bold text-slate-900 text-[15px]" style={tableCellStyle}>
                {a.rank || ""}
              </td>
              <td className="border border-black font-merriweather font-bold text-slate-900 text-[15px]" style={tableCellStyle}>
                {a.attendance || ""}
              </td>
            </tr>
          )})}
          {/* Add empty rows to match layout if needed, but dynamic is better */}
        </tbody>
      </table>

      <div className="font-serif text-base flex flex-col gap-2 mt-8">
        <div className="flex items-baseline gap-2">
          <span className="font-bold whitespace-nowrap w-[160px] text-right">Remarks in Sports :</span>
          <span className="flex-1 border-b border-black pb-0.5 font-merriweather font-medium text-slate-800 text-[15px] px-2">{reportCard.sportsRemark}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-bold whitespace-nowrap w-[160px] text-right">Overall remarks :</span>
          <span className="flex-1 border-b border-black pb-0.5 font-merriweather font-medium text-slate-800 text-[15px] px-2">{reportCard.overallRemark}</span>
        </div>
      </div>

      <div className="absolute bottom-[20mm] left-[15mm] right-[15mm] flex justify-between font-serif text-base font-bold px-8">
        <div>Parent's signature</div>
        <div>Class teacher's signature</div>
        <div>Signature of the Principal</div>
      </div>

    </div>
    </>
  );
}
