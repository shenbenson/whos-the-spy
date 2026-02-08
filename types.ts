export enum PlayerRole {
  CIVILIAN = 'Civilian',
  UNDERCOVER = 'Undercover',
}

export interface Player {
  id: number;
  role: PlayerRole;
  word: string;
  isAlive: boolean;
  isRevealed: boolean; // For end game or when eliminated
}

export type GamePhase = 'setup' | 'loading' | 'reveal' | 'discussion' | 'gameover';
export type Language = 'en' | 'zh';

export interface GameSettings {
  totalPlayers: number;
  undercoverCount: number;
  topic?: string;
  language: Language;
}

export interface WordPair {
  civilianWord: string;
  undercoverWord: string;
}
