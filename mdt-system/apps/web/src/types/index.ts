export interface Task {
  id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED' | 'OVERDUE' | 'CANCELLED';
  scheduledTime: string;
  patientName: string;
  patientGender: string;
  patientAge: number;
  chiefComplaint: string;
  experts: TaskExpert[];
  createdAt: string;
}

export interface TaskExpert {
  id: string;
  expert: {
    realName: string;
    department: string;
  };
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export interface CreateTaskParams {
  patientName: string;
  patientGender: string;
  patientAge: number;
  chiefComplaint: string;
  scheduledTime: string;
  presentIllness: string;
  treatmentPlan: string;
  goal: string;
  pastHistory?: string;
  familyHistory?: string;
  personalHistory?: string;
}

export interface ExpertOpinion {
  id: string;
  expertProfileId: string;
  expert: {
    department: string;
    titles: string;
    user: {
      realName: string;
    };
  };
  asrText?: string;
  aiStructured?: string;
  finalText?: string;
  isAiAdopted: boolean;
  isSubmitted: boolean;
  createdAt: string;
}

export interface PreDoc {
  id: string;
  presentIllness: string;
  pastHistory?: string;
  familyHistory?: string;
  extraInfo?: string;
}

export interface Dialog {
  id: string;
  role: 'DOCTOR' | 'PATIENT';
  content: string;
  startTime: number;
}

export interface PostDoc {
  id: string;
  aiContent?: string;
  finalContent?: string;
  isSubmitted: boolean;
}

export interface Report {
  id: string;
  treatmentPlan: string;
  goal: string;
  finalSummary: string;
  finalEducation: string;
  isSigned: boolean;
}

export interface TaskLog {
  id: string;
  action: string;
  details: string;
  createdAt: string;
}
