import React, { useState } from 'react';
import { GamePhase, GameSettings, Player, PlayerRole, WordPair, Language } from './types';
import { generateGameWords } from './services/geminiService';
import { translations } from './i18n';
import SetupScreen from './components/SetupScreen';
import RevealPhase from './components/RevealPhase';
import DiscussionPhase from './components/DiscussionPhase';
import GameOver from './components/GameOver';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [players, setPlayers] = useState<Player[]>([]);
  const [words, setWords] = useState<WordPair | null>(null);
  const [winner, setWinner] = useState<PlayerRole | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  // Track used words to prevent repetition in the same session
  const [usedWords, setUsedWords] = useState<string[]>([]);

  const t = translations[language];

  // -- Game Logic Actions --

  const startGame = async (settings: GameSettings) => {
    setPhase('loading');
    setLanguage(settings.language); // Ensure app language matches start settings
    
    // 1. Get words (pass history to exclude)
    const generatedWords = await generateGameWords(settings.topic, settings.language, usedWords);
    setWords(generatedWords);
    
    // Add new words to history
    setUsedWords(prev => [...prev, generatedWords.civilianWord, generatedWords.undercoverWord]);

    // 2. Create players array
    const newPlayers: Player[] = Array.from({ length: settings.totalPlayers }, (_, i) => ({
      id: i + 1,
      role: PlayerRole.CIVILIAN, // default
      word: generatedWords.civilianWord,
      isAlive: true,
      isRevealed: false,
    }));

    // 3. Assign Undercovers randomly
    let assigned = 0;
    while (assigned < settings.undercoverCount) {
      const randomIndex = Math.floor(Math.random() * settings.totalPlayers);
      if (newPlayers[randomIndex].role !== PlayerRole.UNDERCOVER) {
        newPlayers[randomIndex].role = PlayerRole.UNDERCOVER;
        newPlayers[randomIndex].word = generatedWords.undercoverWord;
        assigned++;
      }
    }

    setPlayers(newPlayers);
    setPhase('reveal');
  };

  const handleEliminate = (playerId: number) => {
    const updatedPlayers = players.map(p => 
      p.id === playerId ? { ...p, isAlive: false, isRevealed: true } : p
    );
    setPlayers(updatedPlayers);
    checkWinCondition(updatedPlayers);
  };

  const checkWinCondition = (currentPlayers: Player[]) => {
    const aliveUndercovers = currentPlayers.filter(p => p.role === PlayerRole.UNDERCOVER && p.isAlive).length;
    const aliveCivilians = currentPlayers.filter(p => p.role === PlayerRole.CIVILIAN && p.isAlive).length;

    // Condition 1: All undercovers eliminated -> Civilians win
    if (aliveUndercovers === 0) {
      setWinner(PlayerRole.CIVILIAN);
      setPhase('gameover');
      return;
    }

    // Condition 2: Undercovers equal or outnumber civilians (or only 2 players left in standard variants)
    if (aliveUndercovers >= aliveCivilians) {
      setWinner(PlayerRole.UNDERCOVER);
      setPhase('gameover');
      return;
    }
  };

  const restartGame = () => {
    setPhase('setup');
    setWinner(null);
    setPlayers([]);
    setWords(null);
  };

  // -- Render --

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans selection:bg-blue-500/30">
      
      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-6">
        
        {phase === 'loading' && (
          <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="text-slate-400 font-medium animate-pulse">{t.loading}</p>
          </div>
        )}

        {phase === 'setup' && (
          <SetupScreen 
            onStartGame={startGame} 
            language={language}
            setLanguage={setLanguage}
            t={t}
          />
        )}

        {phase === 'reveal' && (
          <RevealPhase 
            players={players} 
            onFinishReveal={() => setPhase('discussion')} 
            t={t}
          />
        )}

        {phase === 'discussion' && words && (
          <DiscussionPhase 
            players={players} 
            civilianWord={words.civilianWord}
            onEliminate={handleEliminate}
            t={t}
          />
        )}

        {phase === 'gameover' && winner && words && (
          <GameOver 
            winner={winner}
            players={players}
            words={words}
            onRestart={restartGame}
            onHome={() => setPhase('setup')}
            t={t}
          />
        )}

      </main>

      {/* Footer / Copyright */}
      {phase === 'setup' && (
        <footer className="fixed bottom-4 w-full text-center text-slate-600 text-xs pointer-events-none">
          Created with ❤️ by <a href="https://github.com/shenbenson" target="_blank" rel="noopener noreferrer">Benson</a>
        </footer>
      )}
    </div>
  );
};

export default App;
