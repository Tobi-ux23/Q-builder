import React, { useState } from "react";
import { ReportCard } from "../../types";
import { Plus, Trash2, Image, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  reportCard: ReportCard;
  onChange: (rc: ReportCard) => void;
}

const REMARK_PRESETS = [
  {
    label: "Default (Good)",
    sports: "Shows high energy, active participation, and great sportsmanship.",
    discipline: "Courteous, reliable, and self-disciplined.",
    overall: "Excellent attitude, consistent effort, and good potential."
  },
  {
    label: "Needs Improvement",
    sports: "Participates but needs to show more teamwork and focus.",
    discipline: "Needs to focus more in class and avoid distractions.",
    overall: "Has potential but requires more consistent effort and attention."
  },
  {
    label: "Outstanding",
    sports: "Exceptional athletic ability, high energy, and great team leadership.",
    discipline: "An exemplary student who follows all rules diligently.",
    overall: "Outstanding performance across all areas. Keep up the excellent work!"
  },
  {
    label: "Quiet but Diligent",
    sports: "Participates quietly; could be more involved in team activities.",
    discipline: "Well-behaved, attentive, and respectful to teachers and peers.",
    overall: "A quiet but diligent student making steady and consistent progress."
  }
];

export function ReportCardForm({ reportCard, onChange }: Props) {
  const [isSchoolDetailsOpen, setIsSchoolDetailsOpen] = useState(true);

  const handleChange = (field: keyof ReportCard, value: any) => {
    onChange({ ...reportCard, [field]: value });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange("schoolLogo", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    const { schoolLogo, ...rest } = reportCard;
    onChange(rest as ReportCard);
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

  const handleAssessmentFieldChange = (assessmentIndex: number, field: keyof import("../../types").AssessmentRecord, value: string) => {
    const newAssessments = [...reportCard.assessments];
    newAssessments[assessmentIndex] = {
      ...newAssessments[assessmentIndex],
      [field]: value,
    };
    handleChange("assessments", newAssessments);
  };
  
  const addAssessment = () => {
    handleChange("assessments", [
      ...reportCard.assessments,
      { assessmentName: `Assessment ${reportCard.assessments.length + 1}`, maxMarks: "100", attendance: "", subjectMarks: {} },
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
      assessments: newAssessments
    });
  };
  
  const addSubject = () => {
    let newName = "New Subject";
    let counter = 1;
    while (reportCard.subjects.includes(newName)) {
      newName = `New Subject ${counter}`;
      counter++;
    }
    const newSubjects = [...reportCard.subjects, newName];
    onChange({ ...reportCard, subjects: newSubjects });
  };
  
  const removeSubject = (index: number) => {
    const newSubjects = [...reportCard.subjects];
    newSubjects.splice(index, 1);
    handleChange("subjects", newSubjects);
  };

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
      total: count > 0 ? total.toString() : "--",
      percentage: count > 0 ? percentage.toFixed(1) + "%" : "--",
    };
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-lg shadow-sm">
        <div 
          className="flex justify-between items-center cursor-pointer mb-4 border-b border-slate-100 dark:border-slate-700/50 pb-2"
          onClick={() => setIsSchoolDetailsOpen(!isSchoolDetailsOpen)}
        >
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            School Details
          </h3>
          {isSchoolDetailsOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </div>
        {isSchoolDetailsOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">School Logo</label>
            <div className="flex items-center gap-4">
              {reportCard.schoolLogo ? (
                <div className="relative group">
                  <img src={reportCard.schoolLogo} alt="School Logo" className="h-16 w-16 object-contain bg-white border border-slate-200 dark:border-slate-700 rounded p-1" />
                  <button 
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    title="Remove logo"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex-1 max-w-sm">
                  <label className="flex items-center justify-center w-full h-12 px-4 transition bg-white dark:bg-slate-900/50 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-md appearance-none cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 focus:outline-none">
                    <span className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                      <Image className="w-4 h-4" />
                      <span className="font-medium text-xs">Upload PNG/JPG</span>
                    </span>
                    <input type="file" name="file_upload" className="hidden" accept="image/png, image/jpeg, image/jpg" onChange={handleLogoUpload} />
                  </label>
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">School Name</label>
            <input
              type="text"
              value={reportCard.schoolName}
              onChange={(e) => handleChange("schoolName", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 dark:text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="T.L.T. Sports Academy"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">School Subheading (Optional)</label>
            <input
              type="text"
              value={reportCard.schoolSubheading || ""}
              onChange={(e) => handleChange("schoolSubheading", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 dark:text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="ꯇꯤ.ꯑꯦꯜ.ꯇꯤ. ꯁ꯭ꯄꯣꯔꯠꯁ ꯑꯦꯀꯥꯗꯦꯃꯤ"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">School Address</label>
            <input
              type="text"
              value={reportCard.schoolAddress}
              onChange={(e) => handleChange("schoolAddress", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 dark:text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Tharoijam, Imphal"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Academic Year</label>
            <input
              type="text"
              value={reportCard.academicYear}
              onChange={(e) => handleChange("academicYear", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 dark:text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="2026-27"
            />
          </div>
        </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-lg shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-700/50 pb-2">
          Student Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Student's Name</label>
            <input
              type="text"
              value={reportCard.studentName}
              onChange={(e) => handleChange("studentName", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 dark:text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Class</label>
            <input
              type="text"
              value={reportCard.className}
              onChange={(e) => handleChange("className", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 dark:text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Section</label>
            <input
              type="text"
              value={reportCard.section}
              onChange={(e) => handleChange("section", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 dark:text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Roll No</label>
            <input
              type="text"
              value={reportCard.rollNo}
              onChange={(e) => handleChange("rollNo", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 dark:text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-700/50 pb-2">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Marks Data
          </h3>
        </div>
        
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-600 mb-2">Configure Subjects</label>
          <div className="flex flex-wrap gap-3 items-start">
            {reportCard.subjects.map((sub, idx) => (
              <div key={idx} className="flex flex-col gap-1.5 bg-slate-100 dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700 shadow-sm">
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
          <table className="w-full border-collapse border border-slate-200 dark:border-slate-700 text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="border border-slate-200 dark:border-slate-700 p-2 text-left font-semibold text-slate-700 dark:text-slate-300 min-w-[120px]">
                  Assessment
                </th>
                <th className="border border-slate-200 dark:border-slate-700 p-2 text-center font-semibold text-slate-700 dark:text-slate-300 w-[80px]">
                  Max Marks
                </th>
                {reportCard.subjects.map((subject, idx) => (
                  <th key={idx} className="border border-slate-200 dark:border-slate-700 p-2 text-center font-semibold text-slate-700 dark:text-slate-300 min-w-[100px]">
                    {subject}
                  </th>
                ))}
                <th className="border border-slate-200 dark:border-slate-700 p-2 text-center font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 min-w-[80px]">
                  TOTAL
                </th>
                <th className="border border-slate-200 dark:border-slate-700 p-2 text-center font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 min-w-[100px]">
                  PERCENTAGE
                </th>
                <th className="border border-slate-200 dark:border-slate-700 p-2 text-center font-bold text-slate-700 dark:text-slate-300 min-w-[100px]">
                  ATTENDANCE
                </th>
                <th className="border border-slate-200 dark:border-slate-700 p-2 text-center font-semibold text-slate-700 dark:text-slate-300 min-w-[50px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {reportCard.assessments.map((assessment, aIdx) => {
                const metrics = getRowMetrics(assessment, reportCard.subjects);
                return (
                <tr key={aIdx}>
                  <td className="border border-slate-200 dark:border-slate-700 p-2">
                    <input
                      type="text"
                      value={assessment.assessmentName}
                      onChange={(e) => handleAssessmentFieldChange(aIdx, "assessmentName", e.target.value)}
                      className="w-full bg-transparent focus:outline-none font-medium"
                      placeholder="e.g. FA-I"
                    />
                  </td>
                  <td className="border border-slate-200 dark:border-slate-700 p-2">
                    <input
                      type="text"
                      value={assessment.maxMarks || "100"}
                      onChange={(e) => handleAssessmentFieldChange(aIdx, "maxMarks", e.target.value)}
                      className="w-full bg-transparent text-center focus:outline-none"
                      placeholder="100"
                    />
                  </td>
                  {reportCard.subjects.map((subject, sIdx) => (
                    <td key={sIdx} className="border border-slate-200 dark:border-slate-700 p-2">
                      <input
                        type="text"
                        value={assessment.subjectMarks[subject] || ""}
                        onChange={(e) => handleAssessmentMarkChange(aIdx, subject, e.target.value)}
                        className="w-full bg-transparent text-center focus:outline-none"
                        placeholder="--"
                      />
                    </td>
                  ))}
                  <td className="border border-slate-200 dark:border-slate-700 p-2 text-center bg-slate-50 dark:bg-slate-700/50 font-bold text-slate-600 dark:text-slate-300">
                    {metrics.total}
                  </td>
                  <td className="border border-slate-200 dark:border-slate-700 p-2 text-center bg-slate-50 dark:bg-slate-700/50 font-bold text-slate-600 dark:text-slate-300">
                    {metrics.percentage}
                  </td>
                  <td className="border border-slate-200 dark:border-slate-700 p-2">
                    <input
                      type="text"
                      value={assessment.attendance || ""}
                      onChange={(e) => handleAssessmentFieldChange(aIdx, "attendance", e.target.value)}
                      className="w-full bg-transparent text-center focus:outline-none"
                      placeholder="e.g. 190/200"
                    />
                  </td>
                  <td className="border border-slate-200 dark:border-slate-700 p-2 text-center">
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
            className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 px-3 py-1.5 rounded text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Assessment Row</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-700/50 pb-2">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Remarks
          </h3>
          <select 
            className="text-xs border border-slate-200 dark:border-slate-700 rounded px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 dark:border-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            defaultValue=""
            onChange={(e) => {
              if (!e.target.value) return;
              const preset = REMARK_PRESETS[parseInt(e.target.value)];
              onChange({
                ...reportCard,
                sportsRemark: preset.sports,
                disciplineRemark: preset.discipline,
                overallRemark: preset.overall
              });
              e.target.value = ""; // reset after applying
            }}
          >
            <option value="" disabled>Quick Templates...</option>
            {REMARK_PRESETS.map((preset, idx) => (
              <option key={idx} value={idx}>{preset.label}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Sports Remark</label>
            <input
              type="text"
              value={reportCard.sportsRemark}
              onChange={(e) => handleChange("sportsRemark", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 dark:text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Overall</label>
            <input
              type="text"
              value={reportCard.overallRemark}
              onChange={(e) => handleChange("overallRemark", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 dark:text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-lg shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-700/50 pb-2">
          Layout Density
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">Table Cell Padding</label>
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
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">Table Line Height</label>
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
