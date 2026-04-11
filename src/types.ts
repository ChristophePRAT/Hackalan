export type GoalType = 'sleep' | 'stress' | 'detox' | 'nutrition' | 'tobacco' | 'breathing' | null;
export type FormatType = 'meditation' | 'article' | 'video' | null;
export type DurationType = '5' | '10' | '20' | null;

export interface AppData {
  profileId: string | null;
  goal: GoalType;
  custom: string;
  format: FormatType;
  duration: DurationType;
}

export interface Scores {
  medical: number;
  brand: number;
  personalization: number;
}

export interface ExplanationSection {
  title: string;
  paragraph: string;
}

export interface Objective {
  title: string;
  description: string;
  category: string;
  xp?: number;
}

export interface AnalysisResult {
  // New structured format
  explanation?: ExplanationSection[];
  objectives?: Objective[];
  voiceScript?: string;
  // Legacy flat format (kept for compatibility)
  title?: string;
  body?: string;
  category?: string;
  scores: Scores;
  xp?: number;
}

export interface StepProps {
  data: AppData;
  next: (patch?: Partial<AppData>) => void;
  back: () => void;
  result: AnalysisResult | null;
  setResult: (res: AnalysisResult | null) => void;
  restart: () => void;
}
