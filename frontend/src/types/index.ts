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

export interface OptimizedMatch {
  type: MatchType;
  players: Player[];
  allowedPlayers: Omit<Player, "id" | "name">[];
  hasConflict: boolean;
  conflictReason?: string;
  court: number;
  startTime: number;
}

export interface Rotation {
  matches: OptimizedMatch[];
  startTimes: Date[];
} 
