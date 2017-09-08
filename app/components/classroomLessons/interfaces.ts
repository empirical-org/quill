import * as CLIntF from '../../interfaces/classroomLessons'

export interface ClassroomLessonSession {
  students: Students;
  presence: Presence;
  current_slide: string;
  modes: Modes;
  submissions: Submissions;
  selected_submissions: SelectedSubmissions;
  selected_submission_order: Array<string>;
  timestamps: Timestamps;
  flaggedStudents: FlaggedStudents;
  public: Boolean | null;
  models: Models;
  prompts: Prompts;
  followUpActivityName: string | null;
}

export interface ClassroomLessonSessions {
 [sessionUID:string]: ClassroomLessonSession
}

export interface Students {
 [key:string]: string
}

export interface TeacherAndClassroomName {
  teacher: string,
  classroom: string
}

export interface Presence {
 [key:string]: boolean
}

export interface Modes {
 [key:string]: string
}

export interface Submissions {
 [key:string]: QuestionSubmissionsList
}

export interface QuestionSubmissionsList {
  [key:string]: QuestionSubmission
}

export interface QuestionSubmission {
  timestamp: string;
  data: any
}

export interface SelectedSubmissions {
  [key:string]: SelectedSubmissionsForQuestion
}

export interface SelectedSubmissionsForQuestion {
  [key:string]: boolean
}

export interface Timestamps {
  [key:string]: string
}

export interface FlaggedStudents {
  [key:string]: boolean
}

export interface Models {
  [key: string]: string
}

export interface Prompts {
  [key: string]: string
}

export interface ClassroomLessons {
  [key: string]: ClassroomLesson
}

export interface ClassroomLesson {
  lesson: number;
  title: string;
  questions: Questions
}

export interface Questions {
  [key: string]: Question
}

export interface Question {
  type: string;
  data: CLIntF.QuestionData;
}
