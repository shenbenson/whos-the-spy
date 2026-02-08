import React, { useState } from 'react';
import { GameSettings, Language } from '../types';
import { Translation } from '../i18n';
import { Users, Ghost, Sparkles, Languages, Info, Cpu } from 'lucide-react';

interface SetupScreenProps {
  onStartGame: (settings: GameSettings) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translation;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStartGame, language, setLanguage, t }) => {
  const [totalPlayers, setTotalPlayers] = useState(4);
  const [undercoverCount, setUndercoverCount] = useState(1);
  const [topic, setTopic] = useState('');
  const [showInfo, setShowInfo] = useState(false);

  const handlePlayerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setTotalPlayers(val);
    if (undercoverCount >= val - 1) {
        setUndercoverCount(Math.max(1, val - 2));
    }
  };

  const handleUndercoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUndercoverCount(parseInt(e.target.value));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 max-w-md mx-auto w-full">
      <div className="mb-6 text-center">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
          {t.appTitle}
        </h1>
        <p className="text-slate-400 text-sm uppercase tracking-widest">{t.appSubtitle}</p>
      </div>

      <div className="w-full bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-xl space-y-6">
        
        {/* Language Toggle */}
        <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-slate-800">
           <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
             <Languages className="w-4 h-4 text-emerald-400" />
             {t.setup.language}
           </div>
           <div className="flex bg-slate-800 rounded-lg p-1">
              <button 
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${language === 'en' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage('zh')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${language === 'zh' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                中文
              </button>
           </div>
        </div>

        {/* Total Players Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
              <Users className="w-4 h-4 text-blue-400" />
              {t.setup.totalPlayers}
            </label>
            <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-bold">
              {totalPlayers}
            </span>
          </div>
          <input
            type="range"
            min="3"
            max="12"
            value={totalPlayers}
            onChange={handlePlayerChange}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* Undercover Count Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
              <Ghost className="w-4 h-4 text-purple-400" />
              {t.setup.undercovers}
            </label>
            <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-bold">
              {undercoverCount}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max={Math.max(1, Math.floor(totalPlayers / 3))} 
            value={undercoverCount}
            onChange={handleUndercoverChange}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>

        {/* Topic Input */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            {t.setup.topic}
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t.setup.topicPlaceholder}
            className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
          />
        </div>

        <button
          onClick={() => onStartGame({ totalPlayers, undercoverCount, topic, language })}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg transform transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500"
        >
          {t.setup.start}
        </button>

        {/* Gemini Explanation Toggle */}
        <div className="pt-2 border-t border-slate-700/50">
            <button 
                onClick={() => setShowInfo(!showInfo)}
                className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-300 mx-auto transition-colors"
            >
                <Cpu className="w-3 h-3" />
                {t.setup.howItWorks}
            </button>
            
            {showInfo && (
                <div className="mt-3 p-3 bg-slate-900/80 rounded-lg border border-slate-700 text-xs text-slate-400 leading-relaxed animate-fade-in">
                    <div className="flex gap-2 mb-1">
                        <Info className="w-4 h-4 text-blue-400 shrink-0" />
                        <span className="font-bold text-blue-400">Gemini AI</span>
                    </div>
                    {t.setup.geminiExplanation}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;
