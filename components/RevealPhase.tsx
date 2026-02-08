import React, { useState } from 'react';
import { Player } from '../types';
import { Translation } from '../i18n';
import { Eye, EyeOff } from 'lucide-react';

interface RevealPhaseProps {
  players: Player[];
  onFinishReveal: () => void;
  t: Translation;
}

const RevealPhase: React.FC<RevealPhaseProps> = ({ players, onFinishReveal, t }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  const currentPlayer = players[currentIndex];

  const handleNext = () => {
    setIsRevealed(false);
    if (currentIndex < players.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onFinishReveal();
    }
  };

  const handleReveal = () => {
    setIsRevealed(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-md mx-auto p-6">
      
      {/* Progress Bar */}
      <div className="w-full bg-slate-800 h-2 rounded-full mb-8 overflow-hidden">
        <div 
          className="bg-blue-500 h-full transition-all duration-300 ease-out"
          style={{ width: `${((currentIndex) / players.length) * 100}%` }}
        ></div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">{t.reveal.player} {currentIndex + 1}</h2>
        <p className="text-slate-400">
            {isRevealed 
                ? t.reveal.memorize
                : `${t.reveal.instruction} ${currentIndex + 1}`
            }
        </p>
      </div>

      {/* Card */}
      <div 
        className={`
            relative w-full aspect-[4/5] max-h-96 bg-gradient-to-br from-slate-800 to-slate-900 
            rounded-3xl border border-slate-700 shadow-2xl flex flex-col items-center justify-center p-8
            transition-all duration-500 transform
            ${isRevealed ? 'scale-100 rotate-0' : 'scale-95'}
        `}
      >
        {!isRevealed ? (
          <button 
            onClick={handleReveal}
            className="flex flex-col items-center gap-4 group"
          >
            <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
              <Eye className="w-10 h-10 text-slate-300 group-hover:text-white" />
            </div>
            <span className="text-lg font-medium text-blue-400 group-hover:text-blue-300 uppercase tracking-wider">
              {t.reveal.tap}
            </span>
          </button>
        ) : (
          <div className="flex flex-col items-center gap-6 animate-fade-in">
             <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <UserAvatar id={currentPlayer.id} />
             </div>
             <div className="text-center">
                <p className="text-sm text-slate-400 mb-2 uppercase tracking-widest">{t.reveal.secretWord}</p>
                <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300 break-all">
                    {currentPlayer.word}
                </h3>
             </div>
             <p className="text-slate-500 text-xs text-center max-w-[200px]">
                {t.reveal.description}
             </p>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="mt-8 w-full">
        {isRevealed ? (
             <button
             onClick={handleNext}
             className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-xl transition-colors"
           >
             <EyeOff className="w-5 h-5" />
             {currentIndex === players.length - 1 ? t.reveal.start : t.reveal.hide}
           </button>
        ) : (
            <div className="h-14"></div> // Spacer to prevent layout jumping
        )}
      </div>
    </div>
  );
};

// Simple visual avatar generator
const UserAvatar = ({ id }: { id: number }) => (
    <span className="font-bold text-xl text-green-400">#{id}</span>
);

export default RevealPhase;
