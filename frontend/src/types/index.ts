export type MatchType = "SH1" | "SH2" | "SD1" | "SD2" | "DH" | "DD" | "MX1" | "MX2";

export interface Player {
  id: string;
  name: string;
  isFemale: boolean;
  teamId: string;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
}

export interface Match {
  type: MatchType;
  players: Player[];
}

export interface OptimizedMatch {
  type: MatchType;
  players: Player[];
  hasConflict: boolean;
  conflictReason?: string;
  court: number;
  startTime: number;
}

export interface Rotation {
  matches: Match[];
  startTimes: Date[];
}
