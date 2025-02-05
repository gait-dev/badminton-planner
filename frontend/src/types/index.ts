export interface Player {
    id: string;
    name: string;
    gender: 'M' | 'F';
}

export interface Team {
    id: string;
    name: string;
    players: Player[];
}

export type MatchType = 'SH1' | 'SH2' | 'SD1' | 'SD2' | 'DH' | 'DD' | 'MX1' | 'MX2';

export interface Match {
    type: MatchType;
    players: Player[];
}

export interface Rotation {
    matches: Match[];
    startTimes: Date[];
}
