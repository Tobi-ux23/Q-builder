import { ReportCard } from "../../types";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  reportCard: ReportCard;
  onChange: (rc: ReportCard) => void;
}

export function ReportCardForm({ reportCard, onChange }: Props) {
  const handleChange = (field: keyof ReportCard, value: any) => {
    onChange({ ...reportCard, [field]: value });
  };

  const handleAssessmentMarkChange = (assessmentIndex: number, subjectName: string, value: string) => {
    const newAssessments = [...reportCard.assessments];
    newAssessments[assessmentIndex] = {
      ...newAssessments[assessmentIndex],
      subjectMarks: {
        ...newAssessments[assessmentIndex].subjectMarks,
        [subjectName]: value,
      },
    };
    handleChange("assessments", newAssessments);
  };

  const handleAssessmentNameChange = (assessmentIndex: number, value: string) => {
    const newAssessments = [...reportCard.assessments];
    newAssessments[assessmentIndex] = {
      ...newAssessments[assessmentIndex],
      assessmentName: value,
    };
    handleChange("assessments", newAssessments);
  };
  
  const addAssessment = () => {
    handleChange("assessments", [
      ...reportCard.assessments,
      { assessmentName: `Assessment ${reportCard.assessments.length + 1}`, subjectMarks: {} },
    ]);
  };
  
  const removeAssessment = (index: number) => {
    const newAssessments = [...reportCard.assessments];
    newAssessments.splice(index, 1);
    handleChange("assessments", newAssessments);
  };
  
  const handleSubjectChange = (index: number, value: string) => {
    const oldSubject = reportCard.subjects[index];
    const newSubjects = [...reportCard.subjects];
    newSubjects[index] = value;

    const newFullMarks = { ...(reportCard.subjectFullMarks || {}) };
    if (oldSubject !== value) {
      newFullMarks[value] = newFullMarks[oldSubject] || "100";
      delete newFullMarks[oldSubject];
    }

    const newAssessments = reportCard.assessments.map(a => {
      const newMarks = { ...a.subjectMarks };
      if (oldSubject !== value && newMarks[oldSubject] !== undefined) {
        newMarks[value] = newMarks[oldSubject];
        delete newMarks[oldSubject];
      }
      return { ...a, subjectMarks: newMarks };
    });

    onChange({
      ...reportCard,
      subjects: newSubjects,
      subjectFullMarks: newFullMarks,
      assessments: newAssessments
    });
  };
  
  const handleSubjectFullMarkChange = (subjectName: string, maxMark: string) => {
    const newFullMarks = { ...(reportCard.subjectFullMarks || {}) };
    newFullMarks[subjectName] = maxMark;
    handleChange("subjectFullMarks", newFullMarks);
  };
  
  const addSubject = () => {
    let newName = "New Subject";
    let counter = 1;
    while (reportCard.subjects.includes(newName)) {
      newName = `New Subject ${counter}`;
      counter++;
    }
    const newSubjects = [...reportCard.subjects, newName];
    const newFullMarks = { ...(reportCard.subjectFullMarks || {}), [newName]: "100" };
    onChange({ ...reportCard, subjects: newSubjects, subjectFullMarks: newFullMarks });
  };
  
  const removeSubject = (index: number) => {
    const newSubjects = [...reportCard.subjects];
    newSubjects.splice(index, 1);
    handleChange("subjects", newSubjects);
  };

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
      total: count > 0 ? total.toString() : "--",
      percentage: count > 0 ? percentage.toFixed(1) + "%" : "--",
    };
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
          Header Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">School Name</label>
            <input
              type="text"
              value={reportCard.schoolName}
              onChange={(e) => handleChange("schoolName", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="T.L.T. Sports Academy"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">School Subheading (Optional)</label>
            <input
              type="text"
              value={reportCard.schoolSubheading || ""}
              onChange={(e) => handleChange("schoolSubheading", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="ꯇꯤ.ꯑꯦꯜ.ꯇꯤ. ꯁ꯭ꯄꯣꯔꯠꯁ ꯑꯦꯀꯥꯗꯦꯃꯤ"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">School Address</label>
            <input
              type="text"
              value={reportCard.schoolAddress}
              onChange={(e) => handleChange("schoolAddress", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Tharoijam, Imphal"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Academic Year</label>
            <input
              type="text"
              value={reportCard.academicYear}
              onChange={(e) => handleChange("academicYear", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="2026-27"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
          Student Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Student's Name</label>
            <input
              type="text"
              value={reportCard.studentName}
              onChange={(e) => handleChange("studentName", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Class</label>
            <input
              type="text"
              value={reportCard.className}
              onChange={(e) => handleChange("className", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Section</label>
            <input
              type="text"
              value={reportCard.section}
              onChange={(e) => handleChange("section", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Roll No</label>
            <input
              type="text"
              value={reportCard.rollNo}
              onChange={(e) => handleChange("rollNo", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Marks Data
          </h3>
        </div>
        
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-600 mb-2">Configure Subjects &amp; Full Marks</label>
          <div className="flex flex-wrap gap-3 items-start">
            {reportCard.subjects.map((sub, idx) => (
              <div key={idx} className="flex flex-col gap-1.5 bg-slate-100 p-2 rounded border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-1">
                  <input
                    type="text"
                    value={sub}
                    onChange={(e) => handleSubjectChange(idx, e.target.value)}
                    className="bg-transparent text-sm w-28 font-semibold focus:outline-none"
                  />
                  <button
                    onClick={() => removeSubject(idx)}
                    className="p-1 text-slate-400 hover:text-red-500 rounded-full"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center space-x-2 border-t border-slate-200/60 pt-1.5">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Max:</span>
                  <input
                    type="text"
                    value={reportCard.subjectFullMarks?.[sub] ?? "100"}
                    onChange={(e) => handleSubjectFullMarkChange(sub, e.target.value)}
                    className="w-16 bg-white border border-slate-300 text-xs px-1.5 py-0.5 rounded focus:outline-none focus:border-blue-400"
                    placeholder="100"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={addSubject}
              className="flex items-center space-x-1 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 mt-1 rounded border border-blue-200 text-xs font-medium"
            >
              <Plus className="w-3 h-3" />
              <span>Add Subject</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="border border-slate-200 p-2 text-left font-semibold text-slate-700 min-w-[120px]">
                  Assessment
                </th>
                {reportCard.subjects.map((subject, idx) => (
                  <th key={idx} className="border border-slate-200 p-2 text-center font-semibold text-slate-700 min-w-[100px]">
                    {subject}
                  </th>
                ))}
                <th className="border border-slate-200 p-2 text-center font-bold text-slate-700 bg-slate-100 min-w-[80px]">
                  TOTAL
                </th>
                <th className="border border-slate-200 p-2 text-center font-bold text-slate-700 bg-slate-100 min-w-[100px]">
                  PERCENTAGE
                </th>
                <th className="border border-slate-200 p-2 text-center font-semibold text-slate-700 min-w-[50px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {reportCard.assessments.map((assessment, aIdx) => {
                const metrics = getRowMetrics(assessment.subjectMarks, reportCard.subjects);
                return (
                <tr key={aIdx}>
                  <td className="border border-slate-200 p-2">
                    <input
                      type="text"
                      value={assessment.assessmentName}
                      onChange={(e) => handleAssessmentNameChange(aIdx, e.target.value)}
                      className="w-full bg-transparent focus:outline-none font-medium"
                      placeholder="e.g. FA-I"
                    />
                  </td>
                  {reportCard.subjects.map((subject, sIdx) => (
                    <td key={sIdx} className="border border-slate-200 p-2">
                      <input
                        type="text"
                        value={assessment.subjectMarks[subject] || ""}
                        onChange={(e) => handleAssessmentMarkChange(aIdx, subject, e.target.value)}
                        className="w-full bg-transparent text-center focus:outline-none"
                        placeholder="--"
                      />
                    </td>
                  ))}
                  <td className="border border-slate-200 p-2 text-center bg-slate-50 font-bold text-slate-600">
                    {metrics.total}
                  </td>
                  <td className="border border-slate-200 p-2 text-center bg-slate-50 font-bold text-slate-600">
                    {metrics.percentage}
                  </td>
                  <td className="border border-slate-200 p-2 text-center">
                    <button
                      onClick={() => removeAssessment(aIdx)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded"
                    >
                      <Trash2 className="w-4 h-4 mx-auto" />
                    </button>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
        <div className="mt-3">
          <button
            onClick={addAssessment}
            className="flex items-center space-x-1 bg-slate-100 text-slate-700 hover:bg-slate-200 px-3 py-1.5 rounded text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Assessment Row</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
          Remarks
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Sports Remark</label>
            <input
              type="text"
              value={reportCard.sportsRemark}
              onChange={(e) => handleChange("sportsRemark", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Discipline Remark</label>
            <input
              type="text"
              value={reportCard.disciplineRemark}
              onChange={(e) => handleChange("disciplineRemark", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Overall Remarks</label>
            <input
              type="text"
              value={reportCard.overallRemark}
              onChange={(e) => handleChange("overallRemark", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
          Layout Density
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-600">Table Cell Padding</label>
              <span className="text-xs font-bold text-blue-600">{reportCard.tablePadding ?? 12}px</span>
            </div>
            <input
              type="range"
              min="2"
              max="24"
              step="1"
              value={reportCard.tablePadding ?? 12}
              onChange={(e) => handleChange("tablePadding", parseInt(e.target.value))}
              className="w-full accent-blue-600"
            />
            <p className="text-[10px] text-slate-500 mt-1">Adjust the inner spacing of the subjects table cells.</p>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-600">Table Line Height</label>
              <span className="text-xs font-bold text-blue-600">{reportCard.tableLineHeight ?? 1.5}</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="3.0"
              step="0.1"
              value={reportCard.tableLineHeight ?? 1.5}
              onChange={(e) => handleChange("tableLineHeight", parseFloat(e.target.value))}
              className="w-full accent-blue-600"
            />
            <p className="text-[10px] text-slate-500 mt-1">Adjust the vertical height of text inside the table.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
