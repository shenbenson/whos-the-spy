import React from 'react';
import { Player, PlayerRole, WordPair } from '../types';
import { Translation } from '../i18n';
import { Trophy, RefreshCw, Home } from 'lucide-react';

interface GameOverProps {
  winner: PlayerRole;
  players: Player[];
  words: WordPair;
  onRestart: () => void;
  onHome: () => void;
  t: Translation;
}

const GameOver: React.FC<GameOverProps> = ({ winner, players, words, onRestart, onHome, t }) => {
  const isCivilianWin = winner === PlayerRole.CIVILIAN;

  return (
    <div className="flex flex-col items-center min-h-[80vh] w-full max-w-lg mx-auto p-6 animate-fade-in">
      
      <div className="mb-8 text-center">
        <div className="inline-flex p-4 rounded-full bg-slate-800 mb-4 shadow-xl border border-slate-700">
            <Trophy className={`w-12 h-12 ${isCivilianWin ? 'text-green-400' : 'text-purple-400'}`} />
        </div>
        <h1 className="text-4xl font-black text-white mb-2">
          {isCivilianWin ? t.gameover.civiliansWin : t.gameover.undercoverWins}
        </h1>
        <p className="text-slate-400">
          {t.gameover.summary.replace('{status}', isCivilianWin ? t.gameover.identified : t.gameover.successful)}
        </p>
      </div>

      {/* Word Reveal Card */}
      <div className="w-full bg-slate-800/60 rounded-2xl p-6 mb-8 border border-slate-700">
        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-4 text-center">{t.gameover.wordsWere}</h3>
        <div className="flex items-center justify-between gap-4">
            <div className="flex-1 text-center p-3 rounded-xl bg-slate-700/50">
                <span className="block text-xs text-slate-400 mb-1">{t.gameover.civilian}</span>
                <span className="text-xl font-bold text-green-400">{words.civilianWord}</span>
            </div>
            <div className="flex-1 text-center p-3 rounded-xl bg-slate-700/50">
                <span className="block text-xs text-slate-400 mb-1">{t.gameover.undercover}</span>
                <span className="text-xl font-bold text-purple-400">{words.undercoverWord}</span>
            </div>
        </div>
      </div>

      {/* Player Recap */}
      <div className="w-full space-y-3 mb-8">
        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">{t.gameover.identities}</h3>
        <div className="max-h-60 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {players.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                    <span className="font-semibold text-slate-200">{t.reveal.player} {p.id}</span>
                    <span className={`text-sm px-2 py-1 rounded ${
                        p.role === PlayerRole.UNDERCOVER 
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                        : 'text-slate-400'
                    }`}>
                        {p.role === PlayerRole.UNDERCOVER ? t.gameover.undercover : t.gameover.civilian}
                    </span>
                </div>
            ))}
        </div>
      </div>

      {/* Actions */}
      <div className="w-full grid grid-cols-2 gap-4">
        <button 
            onClick={onHome}
            className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 transition"
        >
            <Home className="w-5 h-5" />
            {t.gameover.home}
        </button>
        <button 
            onClick={onRestart}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition shadow-lg shadow-blue-900/20"
        >
            <RefreshCw className="w-5 h-5" />
            {t.gameover.playAgain}
        </button>
      </div>

    </div>
  );
};

export default GameOver;
