export type GoalType =
    | "sleep"
    | "stress"
    | "detox"
    | "nutrition"
    | "tobacco"
    | "breathing"
    | null;
export type FormatType = "meditation" | "article" | "video" | null;
export type DurationType = "5" | "10" | "20" | null;

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

export interface Objective {
    title: string;
    description: string;
    category: string;
}

export interface Section {
    explanation: {
        title: string;
        paragraph: string;
    };
    objectives: Objective[];
}

export interface AnalysisResult {
    sections: Section[];
    category?: string;
    xp?: number;
    scores?: Scores;
}

export interface StepProps {
    data: AppData;
    next: (patch?: Partial<AppData>) => void;
    back: () => void;
    result: AnalysisResult | null;
    setResult: (res: AnalysisResult | null) => void;
    restart: () => void;
}
