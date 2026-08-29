export interface SubQuestion {
  id: string;
  label: string; // e.g., "a", "b", "c"
  text: string;
}

export interface Question {
  id: string;
  number: number;
  text: string;
  marks: string; // e.g., "1", "3", "2 × 2 = 4"
  subQuestions: SubQuestion[];
}

export interface QuestionPaper {
  id?: string; // unique identifier for history
  updatedAt?: number; // timestamp of last edit
  schoolName: string;
  assessmentType: string;
  academicYear: string;
  classGrade: string;
  subjectName: string;
  examDate: string;
  fullMarks: string; // e.g., "30"
  timeAllotted: string; // e.g., "60 minutes"
  instructions: string; // e.g., "All questions are compulsory."
  questions: Question[];
}

export interface AssessmentRecord {
  assessmentName: string;
  subjectMarks: Record<string, string>; // key: subject name, value: mark
}

export interface ReportCard {
  id?: string;
  updatedAt?: number;
  schoolName: string;
  schoolSubheading?: string;
  schoolAddress: string;
  academicYear: string;
  studentName: string;
  className: string;
  section: string;
  rollNo: string;
  subjects: string[];
  subjectFullMarks?: Record<string, string>;
  assessments: AssessmentRecord[];
  sportsRemark: string;
  disciplineRemark: string;
  overallRemark: string;
}

