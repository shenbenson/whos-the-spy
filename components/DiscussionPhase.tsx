import React, { useState } from 'react';
import { Player, PlayerRole } from '../types';
import { Translation } from '../i18n';
import { Skull, Check, User } from 'lucide-react';

interface DiscussionPhaseProps {
  players: Player[];
  onEliminate: (playerId: number) => void;
  civilianWord: string;
  t: Translation;
}

const DiscussionPhase: React.FC<DiscussionPhaseProps> = ({ players, onEliminate, t }) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);

  const handleVoteClick = (id: number) => {
    if (selectedPlayerId === id) {
      setSelectedPlayerId(null);
    } else {
      setSelectedPlayerId(id);
    }
  };

  const confirmElimination = () => {
    if (selectedPlayerId !== null) {
      onEliminate(selectedPlayerId);
      setSelectedPlayerId(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full p-4 pb-20">
      
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0f172a]/95 backdrop-blur-sm py-4 mb-4 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="text-blue-400" />
            {t.discussion.title}
        </h2>
        <p className="text-slate-400 text-sm">
          {t.discussion.desc}
        </p>
      </div>

      {/* Grid of Players */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {players.map((player) => {
            const isSelected = selectedPlayerId === player.id;
            const isDead = !player.isAlive;

            return (
                <div 
                    key={player.id}
                    onClick={() => !isDead && handleVoteClick(player.id)}
                    className={`
                        relative p-4 rounded-xl border-2 transition-all duration-200
                        ${isDead 
                            ? 'bg-slate-900/50 border-slate-800 opacity-60 cursor-not-allowed' 
                            : 'cursor-pointer hover:bg-slate-800'
                        }
                        ${isSelected && !isDead
                            ? 'border-red-500 bg-red-500/10' 
                            : !isDead ? 'border-slate-700' : 'border-transparent'
                        }
                    `}
                >
                    <div className="flex flex-col items-center gap-2">
                        <div className={`
                            w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                            ${isDead ? 'bg-slate-800 text-slate-500' : 'bg-blue-600 text-white'}
                        `}>
                            {isDead ? <Skull className="w-6 h-6" /> : player.id}
                        </div>
                        <span className={`font-medium ${isDead ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                             {t.reveal.player} {player.id}
                        </span>
                        
                        {/* Status Badge */}
                        {isDead && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${player.role === PlayerRole.UNDERCOVER ? 'bg-purple-900 text-purple-300' : 'bg-slate-700 text-slate-400'}`}>
                                {player.role === PlayerRole.UNDERCOVER ? t.discussion.spy : t.discussion.civilian}
                            </span>
                        )}
                    </div>

                    {/* Selection Indicator */}
                    {isSelected && !isDead && (
                        <div className="absolute top-2 right-2">
                            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                            </div>
                        </div>
                    )}
                </div>
            );
        })}
      </div>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0f172a] border-t border-slate-800">
        <div className="max-w-2xl mx-auto">
             <button
                disabled={selectedPlayerId === null}
                onClick={confirmElimination}
                className={`
                    w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all
                    ${selectedPlayerId === null 
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                        : 'bg-red-600 hover:bg-red-500 text-white transform active:scale-95'
                    }
                `}
             >
                <Skull className="w-6 h-6" />
                {selectedPlayerId === null ? t.discussion.select : `${t.discussion.eliminate} ${selectedPlayerId}`}
             </button>
        </div>
      </div>

    </div>
  );
};

export default DiscussionPhase;
