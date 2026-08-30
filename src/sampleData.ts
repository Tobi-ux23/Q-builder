import { QuestionPaper, ReportCard } from "./types";

export const SAMPLE_MATH_PAPER: QuestionPaper = {
  schoolName: "",
  assessmentType: "",
  academicYear: "",
  classGrade: "",
  subjectName: "",
  examDate: "",
  fullMarks: "",
  timeAllotted: "",
  instructions: "",
  questions: [
    {
      id: "q1",
      number: 1,
      text: "Define [Concept/Term A] and briefly explain its primary purpose or significance.",
      marks: "2",
      subQuestions: []
    },
    {
      id: "q2",
      number: 2,
      text: "A system experiences a change from [State 1] to [State 2]. Calculate the resulting change and express your answer in standard units.",
      marks: "3",
      subQuestions: []
    },
    {
      id: "q3",
      number: 3,
      text: "Classify the following items or substances into their respective categories based on the standard classification criteria:",
      marks: "3",
      subQuestions: [
        { id: "q3-a", label: "a", text: "Item/Substance X (Category 1)" },
        { id: "q3-b", label: "b", text: "Item/Substance Y (Category 2)" },
        { id: "q3-c", label: "c", text: "Item/Substance Z (Category 3)" }
      ]
    },
    {
      id: "q4",
      number: 4,
      text: "Explain the fundamental differences between [Concept A] and [Concept B]. Provide at least one distinct example of each to support your comparison.",
      marks: "5",
      subQuestions: []
    },
    {
      id: "q5",
      number: 5,
      text: "Briefly describe the specific role or function of each of the following components within the larger system:",
      marks: "4",
      subQuestions: [
        { id: "q5-a", label: "a", text: "Component X (Primary mechanism/function)" },
        { id: "q5-b", label: "b", text: "Component Y (Secondary mechanism/function)" }
      ]
    },
    {
      id: "q6",
      number: 6,
      text: "State the fundamental law or principle of [Topic Name] and provide a practical real-world scenario where this principle is active or observed.",
      marks: "5",
      subQuestions: []
    },
    {
      id: "q7",
      number: 7,
      text: "Answer the following questions regarding the cyclic process of [Cycle/System Name]:",
      marks: "4",
      subQuestions: [
        { id: "q7-a", label: "a", text: "What primary phase change or transition happens during the first stage of the cycle?" },
        { id: "q7-b", label: "b", text: "What is the secondary phase change or outcome called when the system reaches its final stage?" }
      ]
    }
  ]
};

export const SAMPLE_REPORT_CARD: ReportCard = {
  schoolName: "T.L.T. Sports Academy",
  schoolSubheading: "ꯇꯤ.ꯑꯦꯜ.ꯇꯤ. ꯁ꯭ꯄꯣꯔꯠꯁ ꯑꯦꯀꯥꯗꯦꯃꯤ",
  schoolAddress: "Tharoijam, Imphal",
  academicYear: "2026-27",
  studentName: "",
  className: "",
  section: "",
  rollNo: "",
  subjects: ["Science", "Mathematics", "English", "Hindi", "Social Science", "Information Technology"],
  subjectFullMarks: {
    "Science": "100",
    "Mathematics": "100",
    "English": "100",
    "Hindi": "100",
    "Social Science": "100",
    "Information Technology": "100"
  },
  assessments: [
    { assessmentName: "FA-I", subjectMarks: {} },
    { assessmentName: "FA-II", subjectMarks: {} },
    { assessmentName: "SA-I", subjectMarks: {} }
  ],
  sportsRemark: "Shows high energy, active participation, and great sportsmanship.",
  disciplineRemark: "Courteous, reliable, and self-disciplined.",
  overallRemark: "Excellent attitude, consistent effort, and good potential."
};
