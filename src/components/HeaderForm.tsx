import React from "react";
import { QuestionPaper } from "../types";
import { School, Award, Calendar, BookOpen, Clock, FileText, CalendarCheck } from "lucide-react";

interface HeaderFormProps {
  paper: QuestionPaper;
  onChange: (updatedPaper: QuestionPaper) => void;
}

export const HeaderForm: React.FC<HeaderFormProps> = ({ paper, onChange }) => {
  const handleChange = (field: keyof QuestionPaper, value: string) => {
    onChange({
      ...paper,
      [field]: value,
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 space-y-6">
      <div className="flex items-center space-x-2 pb-4 border-b border-slate-200">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white"></div>
        </div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800">Header Configuration</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* School Name */}
        <div className="md:col-span-2">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            School / Institution Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <School className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              id="school-name-input"
              value={paper.schoolName}
              onChange={(e) => handleChange("schoolName", e.target.value)}
              placeholder="e.g., ABC SCHOOL"
              className="block w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Assessment Type */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Assessment / Exam Type
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Award className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              id="exam-type-input"
              value={paper.assessmentType}
              onChange={(e) => handleChange("assessmentType", e.target.value)}
              placeholder="e.g., Mid-Term Examination"
              className="block w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Academic Year */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Academic Year
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              id="academic-year-input"
              value={paper.academicYear}
              onChange={(e) => handleChange("academicYear", e.target.value)}
              placeholder="e.g., 2026 - 2027"
              className="block w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Class/Grade */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Class / Grade
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <BookOpen className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              id="class-grade-input"
              value={paper.classGrade}
              onChange={(e) => handleChange("classGrade", e.target.value)}
              placeholder="e.g., Class - VIII (Eight)"
              className="block w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Subject Name */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Subject Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <BookOpen className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              id="subject-name-input"
              value={paper.subjectName}
              onChange={(e) => handleChange("subjectName", e.target.value)}
              placeholder="e.g., General Science"
              className="block w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Total Marks */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Total Marks (F.M.)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Award className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              id="total-marks-input"
              value={paper.fullMarks}
              onChange={(e) => handleChange("fullMarks", e.target.value)}
              placeholder="e.g., 50"
              className="block w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Time Allotted */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Time Allotted
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Clock className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              id="time-allotted-input"
              value={paper.timeAllotted}
              onChange={(e) => handleChange("timeAllotted", e.target.value)}
              placeholder="e.g., 2 Hours"
              className="block w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Exam Date (Optional) */}
        <div className="md:col-span-2">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Exam Date (Optional)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CalendarCheck className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              id="exam-date-input"
              value={paper.examDate}
              onChange={(e) => handleChange("examDate", e.target.value)}
              placeholder="e.g., Monday, July 13, 2026"
              className="block w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* General Instructions */}
        <div className="md:col-span-2">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            General Instructions Text
          </label>
          <textarea
            id="general-instructions-input"
            value={paper.instructions}
            onChange={(e) => handleChange("instructions", e.target.value)}
            placeholder="e.g., All questions are compulsory. Write your answers clearly."
            rows={2}
            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-y"
          />
        </div>
      </div>
    </div>
  );
};
