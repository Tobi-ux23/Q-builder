import { ReportCard } from "../../types";

interface Props {
  reportCard: ReportCard;
}

export function ReportCardPrintPreview({ reportCard }: Props) {
  const getRowMetrics = (subjectMarks: Record<string, string>, subjects: string[]) => {
    let total = 0;
    let totalMax = 0;
    let count = 0;
    subjects.forEach((sub) => {
      const val = parseFloat(subjectMarks[sub]);
      if (!isNaN(val)) {
        total += val;
        const maxVal = parseFloat(reportCard.subjectFullMarks?.[sub] || "100") || 100;
        totalMax += maxVal;
        count += 1;
      }
    });
    const percentage = totalMax > 0 ? (total / totalMax) * 100 : 0;
    return {
      total: count > 0 ? total.toString() : "",
      percentage: count > 0 ? percentage.toFixed(1) + "%" : "",
    };
  };

  return (
    <>
      <style type="text/css">
        {`
          @media print {
            @page { size: A4 landscape; margin: 15mm; }
            body { -webkit-print-color-adjust: exact; }
          }
        `}
      </style>
      <div className="report-card-print-target bg-white mx-auto shadow-sm print:shadow-none mb-8 relative border border-slate-200 print:border-none" style={{ width: "297mm", minHeight: "210mm", padding: "15mm" }}>
      <div className="text-center font-serif text-black space-y-2 mb-10">
        <h1 className="text-2xl font-bold uppercase tracking-wide">
          {reportCard.schoolName || "XYZ SCHOOL"}
        </h1>
        <p className="text-sm">
          {reportCard.schoolAddress || "abc place, Imphal"}
        </p>
        
        <h2 className="text-xl font-bold uppercase mt-6 mb-2 underline underline-offset-4">
          REPORT CARD
        </h2>
        <p className="text-sm font-bold">
          Progress Report - Academic Year {reportCard.academicYear || "2023–24"}
        </p>
      </div>

      <div className="font-serif text-sm space-y-4 mb-4">
        <div className="flex gap-2">
          <span className="font-bold">Student's Name:</span>
          <span className="flex-1 font-semibold">{reportCard.studentName}</span>
        </div>
        
        <div className="flex justify-between">
          <div className="flex gap-2">
            <span className="font-bold">Class:</span>
            <span className="font-semibold">{reportCard.className}</span>
          </div>
          <div className="flex gap-2">
            <span className="font-bold">Section:</span>
            <span className="font-semibold">{reportCard.section}</span>
          </div>
          <div className="flex gap-2">
            <span className="font-bold">Roll No:</span>
            <span className="font-semibold">{reportCard.rollNo}</span>
          </div>
        </div>
      </div>

      <p className="font-serif text-sm mb-2">
        The following are the marks obtained by the above student in the:
      </p>

      <table className="w-full border-collapse border border-black text-center font-serif text-sm mb-8">
        <thead>
          <tr>
            <th className="border border-black p-2 font-bold align-middle w-24">
              Assessment
            </th>
            {reportCard.subjects.map((sub, idx) => (
              <th key={idx} className="border border-black p-2 font-bold align-middle break-words max-w-[80px]">
                {sub}
              </th>
            ))}
            <th className="border border-black p-2 font-bold align-middle break-words max-w-[80px]">
              TOTAL
            </th>
            <th className="border border-black p-2 font-bold align-middle break-words max-w-[80px]">
              PERCENTAGE
            </th>
          </tr>
        </thead>
        <tbody>
          {reportCard.assessments.map((a, idx) => {
            const metrics = getRowMetrics(a.subjectMarks, reportCard.subjects);
            return (
            <tr key={idx}>
              <td className="border border-black p-3 font-bold">
                {a.assessmentName}
              </td>
              {reportCard.subjects.map((sub, sIdx) => (
                <td key={sIdx} className="border border-black p-3">
                  {a.subjectMarks[sub] || ""}
                </td>
              ))}
              <td className="border border-black p-3 font-bold">
                {metrics.total}
              </td>
              <td className="border border-black p-3 font-bold">
                {metrics.percentage}
              </td>
            </tr>
          )})}
          {/* Add empty rows to match layout if needed, but dynamic is better */}
        </tbody>
      </table>

      <div className="font-serif text-sm space-y-6">
        <div className="font-bold mb-2">Remarks in :</div>
        <div className="flex items-end gap-2">
          <span className="font-bold whitespace-nowrap">Sports:</span>
          <span className="flex-1 border-b border-black pb-0.5 min-w-[200px]">{reportCard.sportsRemark}</span>
          <span className="font-bold whitespace-nowrap ml-4">Discipline:</span>
          <span className="flex-1 border-b border-black pb-0.5 min-w-[200px]">{reportCard.disciplineRemark}</span>
        </div>
        
        <div className="flex items-end gap-2">
          <span className="font-bold whitespace-nowrap">Overall Remarks:</span>
          <span className="flex-1 border-b border-black pb-0.5">{reportCard.overallRemark}</span>
        </div>
      </div>

      <div className="mt-24 flex justify-between font-serif text-sm font-bold">
        <div>Parent's Signature</div>
        <div>Class Teacher's Signature</div>
      </div>

    </div>
    </>
  );
}
