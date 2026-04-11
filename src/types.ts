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

export interface AnalysisResult {
  title: string;
  body: string;
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
