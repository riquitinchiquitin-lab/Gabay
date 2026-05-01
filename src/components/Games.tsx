import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gamepad2, Brain, MessageSquare, RotateCcw, Send, Sparkles, X, Trophy, Map as MapIcon, Plane, MapPin, GraduationCap, BookOpen, Volume2, Loader2, ChevronRight, ChevronLeft, Plus, Wand2, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from 'axios';
import { PhilippineSun } from '../App';
import { localAi } from '../services/localAi';

// Safe AI initialization for Games component
const getAiInstance = () => {
  try {
    const key = process.env.GEMINI_API_KEY || '';
    if (!key) return null;
    return new GoogleGenerativeAI(key);
  } catch (e) {
    return null;
  }
};

const ai = getAiInstance();

interface Word {
  id: string;
  tagalog: string;
  english: string;
  category: string;
}

interface GamesProps {
  words: Word[];
  playAudio: (text: string, id: string) => Promise<void>;
  playingId: string | null;
  logWordResult: (wordId: string, correct: boolean) => Promise<void>;
  onSaveWord: (wordData: { tagalog: string, english: string, category: string }) => Promise<void>;
  onSetView: (view: any) => void;
  isOnline: boolean;
  useLocalAi: boolean;
  localAiAvailable: boolean;
}

export const Games: React.FC<GamesProps> = ({ 
  words, 
  playAudio, 
  playingId, 
  logWordResult, 
  onSaveWord, 
  onSetView,
  isOnline,
  useLocalAi,
  localAiAvailable
}) => {
  const [activeGame, setActiveGame] = useState<'none' | 'matching' | 'quiz' | 'roleplay' | 'expedition'>('none');
  const [gameLimit, setGameLimit] = useState<number>(10);

  const startWithLimit = (game: 'matching' | 'quiz', limit: number) => {
    setGameLimit(limit);
    setActiveGame(game);
  };

  if (activeGame === 'none') {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        <header className="mb-8 md:mb-12">
          <h1 className="text-2xl md:text-4xl font-black text-app-text mb-2 md:mb-4 border-l-4 md:border-l-8 border-ph-blue pl-4 md:pl-6 leading-tight">Learning Games</h1>
          <p className="text-app-muted text-sm md:text-lg font-medium max-w-2xl leading-relaxed">
            Put your vocabulary to the test with interactive challenges. Practice through memory matching or real-life situational roleplay.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {/* Quiz Game Card */}
          <div className="group relative bg-app-card border border-app-border rounded-xl md:rounded-[3rem] p-5 md:p-10 overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 p-6 md:p-12 opacity-5">
              <GraduationCap size={80} className="md:size-[160px]" />
            </div>
            <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-500 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 shadow-lg shadow-emerald-500/20">
              <BookOpen className="text-white md:size-[32px]" size={24} />
            </div>
            <h2 className="text-xl md:text-2xl font-black text-app-text mb-2 md:mb-4">Tagalog Quick Quiz</h2>
            <p className="text-sm md:text-base text-app-muted font-medium mb-6 md:mb-8 leading-relaxed">
              The classic multiple choice challenge. Test your recall with a set number of words.
            </p>
            
            <div className="space-y-4">
              <p className="text-[10px] font-black text-app-muted uppercase tracking-widest text-center">Select Vocabulary Size</p>
              <div className="grid grid-cols-2 gap-2">
                {[5, 10, 15, 20].map(n => (
                  <button 
                    key={n}
                    onClick={() => startWithLimit('quiz', n)}
                    className="py-3 bg-app-bg border border-app-border rounded-xl text-xs font-black hover:bg-emerald-500 hover:text-white transition-all hover:scale-105 active:scale-95 shadow-sm"
                  >
                    {n} Words
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Matching Game Card */}
          <div className="group relative bg-app-card border border-app-border rounded-xl md:rounded-[3rem] p-5 md:p-10 overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 p-6 md:p-12 opacity-5">
              <Gamepad2 size={80} className="md:size-[160px]" />
            </div>
            <div className="w-12 h-12 md:w-16 md:h-16 bg-ph-blue rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 shadow-lg shadow-ph-blue/20">
              <Brain className="text-white md:size-[32px]" size={24} />
            </div>
            <h2 className="text-xl md:text-2xl font-black text-app-text mb-2 md:mb-4">Pilipinas Matching</h2>
            <p className="text-sm md:text-base text-app-muted font-medium mb-6 md:mb-8 leading-relaxed">
              Classical memory match game using your vocabulary. Match pairs as fast as you can.
            </p>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-app-muted uppercase tracking-widest text-center">Select Number of Pairs</p>
              <div className="grid grid-cols-2 gap-2">
                {[4, 8, 12, 16].map(n => (
                  <button 
                    key={n}
                    onClick={() => startWithLimit('matching', n)}
                    className="py-3 bg-app-bg border border-app-border rounded-xl text-xs font-black hover:bg-ph-blue hover:text-white transition-all hover:scale-105 active:scale-95 shadow-sm"
                  >
                    {n} Cards
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Roleplay Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="group relative bg-app-card border border-app-border rounded-xl md:rounded-[3rem] p-5 md:p-10 overflow-hidden cursor-pointer shadow-xl"
            onClick={() => setActiveGame('roleplay')}
          >
            <div className="absolute top-0 right-0 p-6 md:p-12 opacity-0 md:opacity-5 group-hover:opacity-10 transition-opacity">
              <MessageSquare size={80} className="md:size-[160px]" />
            </div>
            <div className="w-12 h-12 md:w-16 md:h-16 bg-ph-red rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 shadow-lg shadow-ph-red/20">
              <Sparkles className="text-white md:size-[32px]" size={24} />
            </div>
            <h2 className="text-xl md:text-2xl font-black text-app-text mb-2 md:mb-4">Sari-Sari Store AI</h2>
            <p className="text-sm md:text-base text-app-muted font-medium mb-6 md:mb-8 leading-relaxed">
              Practice situational Tagalog with a digital Tindera. Master bargaining and daily transactions in a virtual shop.
            </p>
            <div className="flex items-center text-ph-red font-black uppercase tracking-widest text-[10px] md:text-sm group-hover:gap-4 gap-2 transition-all">
              Start Roleplay <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </div>
          </motion.div>

          {/* Expedition Map Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="group relative bg-app-card border border-app-border rounded-[3rem] p-10 overflow-hidden cursor-pointer shadow-xl md:col-span-2"
            onClick={() => setActiveGame('expedition')}
          >
            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
              <MapIcon size={160} />
            </div>
            <div className="w-16 h-16 bg-ph-yellow rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-ph-yellow/20">
              <Plane className="text-ph-blue" size={32} />
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-xl">
                <h2 className="text-2xl font-black text-app-text mb-4">Biyaheng Pinoy: Expedition</h2>
                <p className="text-app-muted font-medium mb-4 leading-relaxed">
                  Travel across the archipelago! Each island offers unique regional themes and cultural challenges. Collect souvenirs and unlock new destinations.
                </p>
              </div>
              <div className="flex items-center text-ph-blue font-black uppercase tracking-widest text-sm group-hover:gap-4 gap-2 transition-all shrink-0">
                Start Journey <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-6 border-b border-app-border flex justify-between items-center bg-app-card/50">
        <button 
          onClick={() => setActiveGame('none')}
          className="flex items-center gap-2 text-app-muted hover:text-app-text font-black uppercase tracking-widest text-xs transition-all"
        >
          <X size={16} /> Back to Games
        </button>
        <div className="flex items-center gap-2 px-4 py-2 bg-ph-blue/10 rounded-full">
          <Trophy className="text-ph-blue" size={16} />
          <span className="text-ph-blue font-black text-xs uppercase tracking-widest">
            {activeGame === 'matching' ? 'Pilipinas Matching' : activeGame === 'quiz' ? 'Quick Quiz' : activeGame === 'roleplay' ? 'Sari-Sari AI' : 'Biyaheng Pinoy'}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {activeGame === 'matching' ? (
          <MatchingGame words={words} logWordResult={logWordResult} onSetView={onSetView} limit={gameLimit} />
        ) : activeGame === 'quiz' ? (
          <QuizGame words={words} playAudio={playAudio} playingId={playingId} logWordResult={logWordResult} onSetView={onSetView} limit={gameLimit} />
        ) : activeGame === 'roleplay' ? (
          <RoleplayGame 
            words={words} 
            onSaveWord={onSaveWord} 
            isOnline={isOnline} 
            useLocalAi={useLocalAi} 
            localAiAvailable={localAiAvailable} 
          />
        ) : (
          <ExpeditionGame 
            userWords={words} 
            logWordResult={logWordResult} 
            onSaveWord={onSaveWord} 
            limit={gameLimit} 
            playAudio={playAudio} 
            playingId={playingId}
            isOnline={isOnline}
            useLocalAi={useLocalAi}
            localAiAvailable={localAiAvailable}
          />
        )}
      </div>
    </div>
  );
};

const QuizGame: React.FC<{ 
  words: Word[], 
  playAudio: (text: string, id: string) => Promise<void>, 
  playingId: string | null,
  logWordResult: (wordId: string, correct: boolean) => Promise<void>,
  onSetView: (view: any) => void,
  limit: number
}> = ({ words, playAudio, playingId, logWordResult, onSetView, limit }) => {
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    generateQuestion();
  }, [words]);

  const generateQuestion = () => {
    if (words.length < 4) return;
    
    if (questionCount >= limit) {
      setIsFinished(true);
      return;
    }
    
    // Smart Learning: Pick from the top priority words (sorted by App.tsx)
    // Favor the first 40% of the list or at least top 8
    const priorityLimit = Math.max(8, Math.floor(words.length * 0.4));
    const target = words[Math.floor(Math.random() * Math.min(words.length, priorityLimit))];
    
    // Generate 3 random distractors from the entire pool
    const distractors = words
      .filter(w => w.id !== target.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(w => w.english);
    
    // Shuffle options
    const allOptions = [target.english, ...distractors].sort(() => 0.5 - Math.random());
    
    setCurrentWord(target);
    setOptions(allOptions);
    setFeedback(null);
    setSelectedOption(null);
  };

  const handleOptionClick = (option: string) => {
    if (selectedOption || !currentWord) return;
    
    setSelectedOption(option);
    const isCorrect = option === currentWord.english;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    
    // Log word result for smart learning
    logWordResult(currentWord.id, isCorrect);
    
    if (isCorrect) setScore(prev => prev + 1);
    setQuestionCount(prev => prev + 1);

    setTimeout(() => {
      generateQuestion();
    }, 1500);
  };

  if (words.length < 4) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-10 text-center">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-6">
          <BookOpen className="text-emerald-500" size={40} />
        </div>
        <h3 className="text-2xl font-black text-app-text mb-4">Insufficient Vocabulary</h3>
        <p className="text-app-muted max-w-sm mb-8">
          You need at least 4 words in your Vocabulary Bank to generate a quiz. 
        </p>
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => onSetView('explorer')}
            className="flex items-center gap-3 px-8 py-4 bg-emerald-500 text-white rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
          >
            <Sparkles size={18} /> Use Word Explorer
          </button>
          <p className="text-xs text-app-muted font-bold">Or earn words in the Expedition Game!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-10">
      <div className="flex justify-between items-center mb-10">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-app-muted">Vocabulary Quiz</p>
          <h2 className="text-3xl font-black text-app-text">Quick Quiz</h2>
        </div>
        <div className="flex gap-4">
          <div className="bg-app-card border border-app-border px-6 py-3 rounded-2xl">
            <span className="text-[10px] font-black uppercase tracking-widest text-app-muted block">Score</span>
            <span className="text-xl font-black text-app-text">{score} / {questionCount}</span>
          </div>
          <button 
            onClick={() => { setScore(0); setQuestionCount(0); generateQuestion(); }}
            className="p-4 bg-app-card border border-app-border hover:border-emerald-500/30 rounded-2xl text-app-muted hover:text-emerald-500 transition-all"
          >
            <RotateCcw size={24} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isFinished ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-app-card border-2 border-emerald-500 rounded-[3rem] p-16 text-center shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-emerald-500/5" />
            <Trophy className="text-emerald-500 mx-auto mb-8" size={80} />
            <h3 className="text-4xl font-black text-app-text mb-4">Quiz Complete!</h3>
            <p className="text-xl text-app-muted font-bold mb-10">You got {score} out of {limit} correct.</p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => { setScore(0); setQuestionCount(0); setIsFinished(false); generateQuestion(); }}
                className="px-10 py-5 bg-emerald-500 text-white rounded-full font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                Play Again
              </button>
              <button 
                onClick={() => onSetView('games')}
                className="px-10 py-5 bg-app-bg text-app-text border-2 border-app-border rounded-full font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
              >
                Exit Game
              </button>
            </div>
          </motion.div>
        ) : currentWord && (
          <motion.div 
            key={currentWord.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            <div className="bg-app-card border-2 border-app-border rounded-[3rem] p-16 text-center shadow-xl relative group/card">
              <span className="text-xs font-black text-ph-blue uppercase tracking-[0.3em] mb-4 block">What is the English for:</span>
              <div className="flex items-center justify-center gap-6">
                <h3 className="text-5xl font-black text-red-600 dark:text-yellow-400">{currentWord.tagalog}</h3>
                <button 
                  onClick={() => playAudio(currentWord.tagalog, `quiz-${currentWord.id}`)}
                  disabled={playingId !== null}
                  className={`p-4 rounded-full transition-all ${playingId === `quiz-${currentWord.id}` ? 'bg-ph-blue text-white' : 'bg-ph-blue/5 text-ph-blue hover:bg-ph-blue hover:text-white'}`}
                >
                  {playingId === `quiz-${currentWord.id}` ? <Loader2 size={24} className="animate-spin" /> : <Volume2 size={24} />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {options.map((opt, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: selectedOption ? 1 : 1.02 }}
                  whileTap={{ scale: selectedOption ? 1 : 0.98 }}
                  onClick={() => handleOptionClick(opt)}
                  className={`p-8 rounded-3xl font-black text-lg transition-all border-4 text-left relative overflow-hidden ${
                    selectedOption === opt
                      ? feedback === 'correct'
                        ? 'bg-emerald-500 border-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                        : 'bg-ph-red border-ph-red/80 text-white shadow-lg shadow-ph-red/30'
                      : selectedOption && opt === currentWord.english
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600'
                        : 'bg-app-card border-app-border hover:border-ph-blue/30 text-app-text'
                  }`}
                >
                  <div className="relative z-10 flex items-center justify-between">
                    <span>{opt}</span>
                    {selectedOption === opt && (
                      feedback === 'correct' ? <Trophy size={24} /> : <X size={24} />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MatchingGame: React.FC<{ 
  words: Word[], 
  logWordResult: (wordId: string, correct: boolean) => Promise<void>,
  onSetView: (view: any) => void,
  limit: number
}> = ({ words, logWordResult, onSetView, limit }) => {
  const [cards, setCards] = useState<{ id: string, content: string, type: 'tagalog' | 'english', matched: boolean, flipped: boolean }[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);

  useEffect(() => {
    initGame();
  }, [words, limit]);

  const initGame = () => {
    if (words.length < 4) return;
    
    // Smart Learning: Favor words that need more practice
    const priorityLimit = Math.max(12, Math.floor(words.length * 0.5));
    const pool = words.slice(0, Math.min(words.length, priorityLimit));
    const selected = [...pool].sort(() => 0.5 - Math.random()).slice(0, limit);

    const gameCards = [
      ...selected.map((w, idx) => ({ id: w.id, content: w.tagalog, type: 'tagalog' as const, matched: false, flipped: false, key: `t-${idx}` })),
      ...selected.map((w, idx) => ({ id: w.id, content: w.english, type: 'english' as const, matched: false, flipped: false, key: `e-${idx}` }))
    ].sort(() => 0.5 - Math.random());
    
    setCards(gameCards.map((c, i) => ({ ...c, gameId: i } as any)));
    setFlippedIds([]);
    setMoves(0);
    setIsWon(false);
  };

  const handleCardClick = (gameId: number) => {
    if (flippedIds.length === 2 || cards[gameId].matched || cards[gameId].flipped) return;

    const updatedCards = cards.map((card, idx) => 
      idx === gameId ? { ...card, flipped: true } : card
    );
    setCards(updatedCards);

    const newFlipped = [...flippedIds, gameId];
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      const [idx1, idx2] = newFlipped;
      
      if (cards[idx1].id === cards[idx2].id) {
        // Match!
        logWordResult(cards[idx1].id, true);
        setTimeout(() => {
          setCards(prev => prev.map((card, idx) => 
            idx === idx1 || idx === idx2 ? { ...card, matched: true } : card
          ));
          setFlippedIds([]);
          
          setCards(current => {
            if (current.every(c => c.matched)) {
              setIsWon(true);
            }
            return current;
          });
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map((card, idx) => 
            idx === idx1 || idx === idx2 ? { ...card, flipped: false } : card
          ));
          setFlippedIds([]);
        }, 1000);
      }
    }
  };

  if (words.length < 4) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-10 text-center">
        <div className="w-20 h-20 bg-ph-blue/10 rounded-3xl flex items-center justify-center mb-6">
          < Brain className="text-ph-blue" size={40} />
        </div>
        <h3 className="text-2xl font-black text-app-text mb-4">Insufficient Vocabulary</h3>
        <p className="text-app-muted max-w-sm mb-8">
          You need at least 4 words in your Vocabulary Bank to play memory match.
        </p>
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => onSetView('explorer')}
            className="flex items-center gap-3 px-8 py-4 bg-ph-blue text-white rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
          >
            <Sparkles size={18} /> Discover New Words
          </button>
          <p className="text-xs text-app-muted font-bold">Or explore the archipelago in the Expedition Game!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-10">
      <div className="flex justify-between items-center mb-10">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-app-muted">Recall Game</p>
          <h2 className="text-3xl font-black text-app-text">Memory Match</h2>
        </div>
        <div className="flex gap-4">
          <div className="bg-app-card border border-app-border px-6 py-3 rounded-2xl">
            <span className="text-[10px] font-black uppercase tracking-widest text-app-muted block">Moves</span>
            <span className="text-xl font-black text-app-text">{moves}</span>
          </div>
          <button 
            onClick={initGame}
            className="p-4 bg-app-card border border-app-border hover:border-ph-blue/30 rounded-2xl text-app-muted hover:text-ph-blue transition-all"
          >
            <RotateCcw size={24} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-6">
        {cards.map((card: any) => (
          <div 
            key={card.gameId}
            onClick={() => handleCardClick(card.gameId)}
            className="aspect-square relative cursor-pointer"
          >
            <motion.div 
              animate={{ rotateY: card.flipped || card.matched ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-full h-full preserve-3d"
            >
              {/* Front (Hidden) */}
              <div className="absolute inset-0 backface-hidden bg-app-card border-2 border-app-border rounded-3xl flex items-center justify-center group overflow-hidden">
                <div className="absolute inset-0 bg-ph-blue/5 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full" />
                <div className="relative text-ph-blue opacity-50 group-hover:opacity-100 transition-opacity">
                  <Gamepad2 size={32} />
                </div>
              </div>
              
              {/* Back (Visible Content) */}
              <div 
                className={`absolute inset-0 backface-hidden rotate-y-180 rounded-3xl flex items-center justify-center p-4 text-center border-2 transition-colors ${card.matched ? 'bg-ph-blue/20 border-ph-blue' : 'bg-app-card border-app-border'}`}
              >
                <p className={`text-sm font-black break-words ${card.matched ? 'text-ph-blue' : (card.type === 'tagalog' ? 'text-red-600 dark:text-yellow-400' : 'text-app-text')}`}>
                  {card.content}
                </p>
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isWon && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-12 bg-app-card border-2 border-ph-blue rounded-[3rem] p-12 text-center shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-ph-blue/5" />
            <Trophy className="text-ph-blue mx-auto mb-6" size={64} />
            <h3 className="text-3xl font-black text-app-text mb-4">Mahusay! (Excellent!)</h3>
            <p className="text-lg font-bold text-app-muted mb-10">You matched {limit} sets in {moves} moves.</p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={initGame}
                className="px-10 py-5 bg-ph-blue text-white rounded-full font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                Play Again
              </button>
              <button 
                onClick={() => onSetView('games')}
                className="px-10 py-5 bg-app-bg text-app-text border-2 border-app-border rounded-full font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
              >
                Exit Game
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const RoleplayGame: React.FC<{ 
  words: Word[], 
  onSaveWord: (wordData: { tagalog: string, english: string, category: string }) => Promise<void>,
  isOnline: boolean,
  useLocalAi: boolean,
  localAiAvailable: boolean
}> = ({ words, onSaveWord, isOnline, useLocalAi, localAiAvailable }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedWords, setExtractedWords] = useState<{ tagalog: string, english: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    setMessages([
      { role: 'model', text: "Mabuhay! Welcome to my Sari-Sari store. What would you like to buy today? (Practice bargaining with me!)" }
    ]);
  }, []);

  const generateWithAi = async (prompt: string, options: any = {}): Promise<any> => {
    if (useLocalAi && localAiAvailable && !options.useTools) {
      console.log("Using Local AI in Games...");
      const text = await localAi.prompt(prompt);
      return { text: () => text, textValue: text };
    }

    if (!ai) throw new Error("Cloud AI not initialized");
    
    const config: any = {};
    if (options.mimeType) config.responseMimeType = options.mimeType;

    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const contents: any[] = [];
    if (options.history) {
       options.history.forEach((m: any) => {
         contents.push({ role: m.role, parts: [{ text: m.text }] });
       });
    }
    contents.push({ role: 'user', parts: [{ text: prompt }] });
    
    const result = await model.generateContent({
      contents,
      generationConfig: config,
      systemInstruction: options.systemInstruction
    });
    
    return { 
      text: () => result.response.text(),
      textValue: result.response.text()
    };
  };

  const handleExtractWords = async () => {
    if (messages.length < 2) return;
    setIsExtracting(true);
    try {
      const history = messages.map(m => `${m.role}: ${m.text}`).join("\n");
      const prompt = `Based on this conversation, extract up to 5 useful Tagalog words or phrases that were either used or would be helpful in this context. 
        Exclude words already in this list: ${words.map(w => w.tagalog).join(", ")}.
        Format as JSON array: [{"tagalog": "...", "english": "..."}]`;
        
      const response = await generateWithAi(prompt, { 
        systemInstruction: `Chat History:\n${history}`,
        mimeType: "application/json"
      });
      
      const results = JSON.parse(response.textValue || "[]");
      setExtractedWords(results);
    } catch (err) {
      console.error("Extraction error:", err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!isOnline && !useLocalAi) {
      setMessages(prev => [...prev, { role: 'model', text: "I need an internet connection or Local AI to chat with you! (Switch to Airport Mode in settings)" }]);
      return;
    }

    const userMessage = { role: 'user' as const, text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const vocabularyContext = words.map(w => `${w.tagalog} (${w.english})`).join(", ");
      const systemInstruction = `You are a friendly but firm store owner (Tindera) in a Filipino Sari-Sari store. 
          Your goal is to practice Tagalog with the user.
          Current Vocabulary Context of the user: [${vocabularyContext}].
          Rule: Respond in Tagalog primarily, but provide an English translation in parentheses for complex phrases.
          Be vibrant, use words like 'Sige na', 'Kuya/Ate', 'Heto pa'.
          If the user tries to bargain, act like you are thinking about it. 
          Encourage them to use Tagalog words from their vocabulary list where appropriate.
          Keep responses concise (1-2 sentences).`;

      const response = await generateWithAi(input, { 
        history: messages,
        systemInstruction
      });

      setMessages(prev => [...prev, { role: 'model', text: response.textValue || "Sensya na, I didn't get that." }]);
    } catch (err) {
      console.error("AI Error:", err);
      setMessages(prev => [...prev, { role: 'model', text: "(Offline) Pasensya na, the tindera is busy! Try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-app-bg/30 overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6">
          {messages.map((m, idx) => (
            <motion.div 
              initial={{ opacity: 0, x: m.role === 'user' ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              key={idx} 
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] p-6 rounded-[2rem] shadow-sm font-medium ${m.role === 'user' ? 'bg-ph-blue text-white rounded-tr-none' : 'bg-app-card text-app-text border border-app-border rounded-tl-none'}`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-app-card border border-app-border p-4 rounded-full flex gap-2">
                <div className="w-2 h-2 bg-ph-blue rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-ph-blue rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-ph-blue rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 md:p-10 bg-app-card border-t border-app-border">
          <form onSubmit={handleSend} className="relative max-w-4xl mx-auto">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message in Tagalog..."
              className="w-full pl-6 pr-16 py-5 bg-app-bg border border-app-border rounded-full focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-ph-blue/5 focus:border-ph-blue transition-all font-bold placeholder:text-app-muted/50"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-3 top-2.5 p-3.5 bg-ph-blue text-white rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg shadow-ph-blue/20 disabled:opacity-30"
            >
              <Send size={20} />
            </button>
          </form>
          <div className="flex items-center justify-center gap-4 mt-4">
             <p className="text-[10px] text-app-muted font-black uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={12} className="text-ph-yellow" /> AI Roleplay Experience
            </p>
            <button 
              onClick={handleExtractWords}
              disabled={messages.length < 2 || isExtracting}
              className="text-[10px] text-ph-blue hover:text-ph-blue/80 font-black uppercase tracking-widest flex items-center gap-2 disabled:opacity-30 transition-all"
            >
              <Wand2 size={12} /> {isExtracting ? 'Extracting...' : 'Extract New Words'}
            </button>
          </div>
        </div>
      </div>

      {extractedWords.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full md:w-80 bg-app-card border-l border-app-border p-8 overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-app-text">Neural Catch</h3>
            <button onClick={() => setExtractedWords([])} className="text-app-muted hover:text-app-text">
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4">
            {extractedWords.map((w, idx) => (
              <div key={idx} className="p-4 bg-app-bg border border-app-border rounded-2xl group relative overflow-hidden">
                <p className="text-red-600 dark:text-yellow-400 font-black">{w.tagalog}</p>
                <p className="text-xs text-app-muted font-bold">{w.english}</p>
                <button 
                  onClick={() => onSaveWord({ ...w, category: 'Daily' })}
                  className="absolute right-3 top-3 p-1.5 bg-ph-blue text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 active:scale-95"
                >
                  <Plus size={10} />
                </button>
              </div>
            ))}
          </div>
          <p className="mt-8 text-[10px] text-app-muted font-bold leading-relaxed italic">
            These words were identified by AI as useful highlights from your conversation. Save them to practice later!
          </p>
        </motion.div>
      )}
    </div>
  );
};

const LOCATIONS = [
  { 
    id: 'manila', 
    name: 'Manila', 
    theme: 'History, Food & Business', 
    description: 'Intramuros, Binondo Food Crawl, Divisoria & Makati.',
    colorGradient: 'from-ph-blue to-blue-600',
    iconColor: 'bg-ph-blue',
    pos: { x: 41, y: 34 },
    labelPos: 'left' as const,
    trivia: 'Manila (Maynila) is the historic "Pearl of the Orient Seas" and a bustling megacity of diverse districts.',
    regionalWords: [
      { tagalog: 'Kasaysayan', english: 'History' },
      { tagalog: 'Pagkain', english: 'Food' },
      { tagalog: 'Negosyo', english: 'Business' },
      { tagalog: 'Tindahan', english: 'Store' },
      { tagalog: 'Simbahan', english: 'Church' }
    ]
  },
  { 
    id: 'baguio', 
    name: 'Baguio City', 
    theme: 'Scenery & Pines', 
    description: 'The Summer Capital of the Philippines. Focused on the pines and highland life.',
    colorGradient: 'from-green-600 to-emerald-700',
    iconColor: 'bg-green-600',
    pos: { x: 43, y: 22 },
    labelPos: 'right' as const,
    trivia: 'Baguio is known for its cool climate, pine trees, and the beautiful Panagbenga Festival.',
    regionalWords: [
      { tagalog: 'Malamig', english: 'Cold' },
      { tagalog: 'Pino', english: 'Pine Tree' },
      { tagalog: 'Bundok', english: 'Mountain' },
      { tagalog: 'Sariwa', english: 'Fresh' }
    ]
  },
  { 
    id: 'vigan', 
    name: 'Vigan City', 
    theme: 'Vigan Heritage', 
    description: 'Spanish colonial architecture and traditions at Calle Crisologo.',
    colorGradient: 'from-ph-red to-red-600',
    iconColor: 'bg-ph-red',
    pos: { x: 41, y: 11 },
    labelPos: 'right' as const,
    trivia: 'A UNESCO World Heritage site known for its well-preserved Spanish colonial architecture.',
    regionalWords: [
      { tagalog: 'Kalsada', english: 'Street/Road' },
      { tagalog: 'Antigo', english: 'Antique/Ancient' },
      { tagalog: 'Ninuno', english: 'Ancestor' },
      { tagalog: 'Pamana', english: 'Heritage' }
    ]
  },
  { 
    id: 'tagaytay', 
    name: 'Tagaytay Ridge', 
    theme: 'Ridge View', 
    description: 'Famous for the Taal Volcano view and its cool breeze.',
    colorGradient: 'from-blue-400 to-indigo-500',
    iconColor: 'bg-blue-400',
    pos: { x: 48, y: 44 },
    labelPos: 'right' as const,
    trivia: 'Enjoy the view of Taal Lake and Volcano, the world\'s smallest active volcano.',
    regionalWords: [
      { tagalog: 'Tanawin', english: 'Scenery' },
      { tagalog: 'Bulkang', english: 'Volcano' },
      { tagalog: 'Lawa', english: 'Lake' },
      { tagalog: 'Sariwa', english: 'Fresh' }
    ]
  },
  { 
    id: 'legazpi', 
    name: 'Legazpi', 
    theme: 'Mayon Volcano', 
    description: 'Home of the perfectly coned Mayon Volcano.',
    colorGradient: 'from-orange-500 to-red-600',
    iconColor: 'bg-orange-500',
    pos: { x: 60, y: 52 },
    labelPos: 'right' as const,
    trivia: 'Mayon Volcano is famous globally for its "perfect cone" shape.',
    regionalWords: [
      { tagalog: 'Bulkang', english: 'Volcano' },
      { tagalog: 'Sikat', english: 'Famous' },
      { tagalog: 'Maganda', english: 'Beautiful' },
      { tagalog: 'Tanawin', english: 'Scenery' }
    ]
  },
  { 
    id: 'cebu', 
    name: 'Cebu City', 
    theme: 'Street Food & Islands', 
    description: 'Famous for Lechon and beautiful island hopping destinations.',
    colorGradient: 'from-amber-400 to-orange-500',
    iconColor: 'bg-amber-400',
    pos: { x: 62, y: 70 },
    labelPos: 'top' as const,
    trivia: 'Cebu is the "Queen City of the South" and the oldest city in the Philippines.',
    regionalWords: [
      { tagalog: 'Litson', english: 'Roasted Pig (Lechon)' },
      { tagalog: 'Dagat', english: 'Sea' },
      { tagalog: 'Bangka', english: 'Boat' },
      { tagalog: 'Isla', english: 'Island' }
    ]
  },
  { 
    id: 'bohol', 
    name: 'Bohol', 
    theme: 'Chocolate Hills', 
    description: 'Famous hills and the tiny Tarsiers.',
    colorGradient: 'from-amber-800 to-amber-900',
    iconColor: 'bg-amber-800',
    pos: { x: 68, y: 75 },
    labelPos: 'bottom' as const,
    trivia: 'The Chocolate Hills turn brown during the dry season, looking like chocolate kisses.',
    regionalWords: [
      { tagalog: 'Burol', english: 'Hill' },
      { tagalog: 'Maliit', english: 'Small' },
      { tagalog: 'Tsokolate', english: 'Chocolate' },
      { tagalog: 'Paraiso', english: 'Paradise' }
    ]
  },
  { 
    id: 'iloilo', 
    name: 'Iloilo City', 
    theme: 'Iloilo Heritage', 
    description: 'Spanish-era churches, mansions, and historic landscapes.',
    colorGradient: 'from-purple-500 to-indigo-600',
    iconColor: 'bg-purple-500',
    pos: { x: 44, y: 64 },
    labelPos: 'left' as const,
    trivia: 'Known as the "City of Love" for its gentle people and heritage architecture.',
    regionalWords: [
      { tagalog: 'Simbahan', english: 'Church' },
      { tagalog: 'Mansyon', english: 'Mansion' },
      { tagalog: 'Ilog', english: 'River' },
      { tagalog: 'Luma', english: 'Old' }
    ]
  },
  { 
    id: 'bacolod', 
    name: 'Bacolod City', 
    theme: 'Chicken Inasal', 
    description: 'World-famous regional cuisine and the City of Smiles.',
    colorGradient: 'from-yellow-400 to-orange-400',
    iconColor: 'bg-yellow-400',
    pos: { x: 54, y: 69 },
    labelPos: 'right' as const,
    trivia: 'Bacolod is home to the MassKara Festival and the tasty Chicken Inasal.',
    regionalWords: [
      { tagalog: 'Manok', english: 'Chicken' },
      { tagalog: 'Inasal', english: 'Grilled' },
      { tagalog: 'Ngiti', english: 'Smile' },
      { tagalog: 'Pistahan', english: 'Festival' }
    ]
  },
  { 
    id: 'siargao', 
    name: 'Siargao', 
    theme: 'Nature & Islands', 
    description: 'Surfing capital. Practice words about nature and adventure.',
    colorGradient: 'from-emerald-500 to-teal-600',
    iconColor: 'bg-emerald-500',
    pos: { x: 86, y: 72 },
    labelPos: 'left' as const,
    trivia: 'Famous for the Cloud 9 surf break, Siargao is a haven for nature lovers.',
    regionalWords: [
      { tagalog: 'Dagat', english: 'Sea' },
      { tagalog: 'Alon', english: 'Wave' },
      { tagalog: 'Isla', english: 'Island' },
      { tagalog: 'Araw', english: 'Sun' }
    ]
  },
  { 
    id: 'cdo', 
    name: 'Cagayan de Oro', 
    theme: 'River Rafting', 
    description: 'The white-water rafting and adventure capital.',
    colorGradient: 'from-blue-600 to-blue-800',
    iconColor: 'bg-blue-600',
    pos: { x: 70, y: 82 },
    labelPos: 'left' as const,
    trivia: 'CDO is known as the "City of Golden Friendship" and for its river rapids.',
    regionalWords: [
      { tagalog: 'Ilog', english: 'River' },
      { tagalog: 'Agos', english: 'Flow/Current' },
      { tagalog: 'Pakikipagsapalaran', english: 'Adventure' },
      { tagalog: 'Matapang', english: 'Brave' }
    ]
  },
  { 
    id: 'zamboanga', 
    name: 'Zamboanga City', 
    theme: 'Zamboanga Vintas', 
    description: 'Traditional colorful sailboats and historic structures.',
    colorGradient: 'from-pink-500 to-red-500',
    iconColor: 'bg-pink-500',
    pos: { x: 45, y: 90 },
    labelPos: 'bottom' as const,
    trivia: 'Zamboanga is the "City of Flowers" and a melting pot of cultures.',
    regionalWords: [
      { tagalog: 'Vinta', english: 'Traditional Boat' },
      { tagalog: 'Makulay', english: 'Colorful' },
      { tagalog: 'Bulaklak', english: 'Flower' },
      { tagalog: 'Kastila', english: 'Spanish (Legacy)' }
    ]
  },
  { 
    id: 'davao', 
    name: 'Davao City', 
    theme: 'Durian Experience', 
    description: 'The King of Fruits and the Philippine Eagle.',
    colorGradient: 'from-ph-yellow to-amber-500',
    iconColor: 'bg-ph-yellow',
    pos: { x: 86, y: 86 },
    labelPos: 'right' as const,
    trivia: 'Home to the majestic Philippine Eagle and the pungent but delicious Durian fruit.',
    regionalWords: [
      { tagalog: 'Bundok', english: 'Mountain' },
      { tagalog: 'Prutas', english: 'Fruit' },
      { tagalog: 'Agila', english: 'Eagle' },
      { tagalog: 'Sagana', english: 'Abundant' }
    ]
  },
  { 
    id: 'palawan', 
    name: 'Palawan', 
    theme: 'The Last Frontier', 
    description: 'Pristine beaches. Tropical paradise vocabulary.',
    colorGradient: 'from-cyan-500 to-blue-500',
    iconColor: 'bg-cyan-500',
    pos: { x: 18, y: 72 },
    labelPos: 'left' as const,
    trivia: 'Consistently voted one of the world\'s best islands, home to the Underground River.',
    regionalWords: [
      { tagalog: 'Paraiso', english: 'Paradise' },
      { tagalog: 'Baybayin', english: 'Coast/Shore' },
      { tagalog: 'Bangka', english: 'Boat' },
      { tagalog: 'Kalikasan', english: 'Nature' }
    ]
  }
];

const ExpeditionGame: React.FC<{ 
  userWords: Word[], 
  logWordResult: (wordId: string, correct: boolean) => Promise<void>,
  onSaveWord: (wordData: { tagalog: string, english: string, category: string }) => Promise<void>,
  limit: number,
  playAudio: (text: string, id: string) => Promise<void>,
  playingId: string | null,
  isOnline: boolean,
  useLocalAi: boolean,
  localAiAvailable: boolean
}> = ({ userWords, logWordResult, onSaveWord, limit, playAudio, playingId, isOnline, useLocalAi, localAiAvailable }) => {
  const [selectedLocation, setSelectedLocation] = useState<typeof LOCATIONS[0] | null>(null);
  const [guideMessage, setGuideMessage] = useState<string>("");
  const [isTalking, setIsTalking] = useState(false);
  const [challengeStatus, setChallengeStatus] = useState<'exploring' | 'learning' | 'quiz' | 'won'>('exploring');
  const [quizQueue, setQuizQueue] = useState<{ english: string, tagalog: string, options: string[], id?: string }[]>([]);
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [learningIdx, setLearningIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [sessionScore, setSessionScore] = useState(0);
  const [souvenirs, setSouvenirs] = useState<string[]>([]);
  const [mapScale, setMapScale] = useState(1);
  const [localLimit, setLocalLimit] = useState(limit);

  // Sync localLimit when limit prop changes
  useEffect(() => {
    setLocalLimit(limit);
  }, [limit]);
  const containerRef = useRef<HTMLDivElement>(null);
  const challengeAreaRef = useRef<HTMLDivElement>(null);

  // Initialize scale for mobile to see more land
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) {
        setMapScale(0.65);
      }
    }
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setMapScale(prev => Math.min(Math.max(prev + delta, 0.4), 5));
  };

  const startRegionalChallenge = async (loc: typeof LOCATIONS[0]) => {
    setSelectedLocation(loc);
    setChallengeStatus('exploring');
    setIsTalking(true);
    setGuideMessage("Heto na, loading our local guide...");
    setFeedback(null);
    setSelectedOption(null);

    // Auto-scroll on mobile to show the challenge details
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        challengeAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
    
    const generateWithAi = async (prompt: string, options: any = {}): Promise<any> => {
      if (useLocalAi && localAiAvailable && !options.useTools) {
        console.log("Using Local AI in Expedition...");
        const text = await localAi.prompt(prompt);
        return { text: () => text, textValue: text };
      }

      if (!ai) throw new Error("Cloud AI not initialized");
      
      const config: any = {};
      if (options.mimeType) config.responseMimeType = options.mimeType;

      const model = ai.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: config,
        systemInstruction: options.systemInstruction
      });
      
      return { 
        text: () => result.response.text(),
        textValue: result.response.text()
      };
    };
    
    try {
      const prompt = `I have arrived in ${loc.name}. Greet me and ask a themed question!`;
      const systemInstruction = `You are a local tour guide in ${loc.name}, Philippines. 
          Theme: ${loc.theme}.
          Objective: Welcome the traveler and challenge them with one quick question about their vocabulary in the context of this location.
          Current user words: ${userWords.map(w => w.tagalog).join(", ")}.
          Keep it very short (max 2 sentences). Use Tagalog mostly with English in (parentheses).`;

      const response = await generateWithAi(prompt, { systemInstruction });
      setGuideMessage(response.textValue || `Mabuhay! Welcome to ${loc.name}.`);
    } catch (err) {
      setGuideMessage(`Mabuhay! Welcome to ${loc.name}. Ready to explore the ${loc.theme}?`);
    } finally {
      setIsTalking(false);
    }
  };

  const handleAcceptChallenge = () => {
    // Collect possible quiz words: either regional words or user words
    const regionalWords = selectedLocation?.regionalWords || [];
    
    // To ensure we reach the requested limit, collect words from ALL locations as fallback
    const allRegionalWords = LOCATIONS.flatMap(l => l.regionalWords);
    
    // Deduplicate words by tagalog text
    const wordMap = new Map<string, { tagalog: string, english: string, id?: string }>();
    
    // Priority 1: Current location words
    regionalWords.forEach(w => wordMap.set(w.tagalog.toLowerCase(), { ...w }));
    
    // Priority 2: User's saved words
    userWords.forEach(w => wordMap.set(w.tagalog.toLowerCase(), { ...w }));
    
    // Priority 3: Fallback from other regions if needed
    if (wordMap.size < localLimit) {
      allRegionalWords.forEach(w => {
        if (wordMap.size < localLimit && !wordMap.has(w.tagalog.toLowerCase())) {
          wordMap.set(w.tagalog.toLowerCase(), { ...w });
        }
      });
    }

    const allPossible = Array.from(wordMap.values());

    if (allPossible.length < 3) {
      setGuideMessage("I need more words to challenge you! (Try adding more words or visiting other cities)");
      return;
    }

    const queue: { english: string, tagalog: string, options: string[], id?: string }[] = [];
    const targetCount = Math.max(3, localLimit);
    const count = Math.min(targetCount, allPossible.length);
    
    // Shuffle and pick
    const shuffled = [...allPossible].sort(() => 0.5 - Math.random());
    const targets = shuffled.slice(0, count);
    
    for (const target of targets) {
      // Generate distractors from the full pool
      const others = allRegionalWords
        .filter(w => w.tagalog.toLowerCase() !== target.tagalog.toLowerCase())
        .sort(() => 0.5 - Math.random())
        .slice(0, 2);
      
      const options = [target.tagalog, ...others.map(o => o.tagalog)].sort(() => 0.5 - Math.random());
      
      queue.push({
        english: target.english,
        tagalog: target.tagalog,
        options,
        id: target.id
      });
    }

    setQuizQueue(queue);
    setLearningIdx(0);
    setCurrentQuizIdx(0);
    setSessionScore(0);
    setChallengeStatus('learning');
  };

  const handleOptionClick = async (opt: string) => {
    if (selectedOption || !quizQueue[currentQuizIdx]) return;
    
    const currentQuiz = quizQueue[currentQuizIdx];
    setSelectedOption(opt);
    const isCorrect = opt === currentQuiz.tagalog;
    
    if (isCorrect) {
      setFeedback('correct');
      setSessionScore(prev => prev + 1);
      
      // AUTO-SAVE LOGIC:
      // If it was a regional word (no id in our quizQueue item), save it!
      // Check if it's already in the user's word library (just in case)
      const isAlreadyInLibrary = userWords.some(w => w.tagalog.toLowerCase() === currentQuiz.tagalog.toLowerCase());
      
      if (!currentQuiz.id && !isAlreadyInLibrary) {
        await onSaveWord({
          tagalog: currentQuiz.tagalog,
          english: currentQuiz.english,
          category: selectedLocation?.name || 'Regional'
        });
      } else if (currentQuiz.id) {
        // Log result for existing word
        logWordResult(currentQuiz.id, true);
      }
    } else {
      setFeedback('wrong');
      if (currentQuiz.id) {
        logWordResult(currentQuiz.id, false);
      }
    }

    setTimeout(() => {
      if (currentQuizIdx + 1 < quizQueue.length) {
        setCurrentQuizIdx(prev => prev + 1);
        setSelectedOption(null);
        setFeedback(null);
      } else {
        setChallengeStatus('won');
        if (selectedLocation && isCorrect && !souvenirs.includes(selectedLocation.id)) {
          setSouvenirs(prev => [...prev, selectedLocation.id]);
        }
      }
    }, 1500);
  };

  return (
    <div className="h-full relative flex flex-col lg:flex-row lg:overflow-hidden bg-app-bg/10">
      {/* Visual Map Area */}
      <motion.div 
        animate={{ 
          opacity: selectedLocation ? (typeof window !== 'undefined' && window.innerWidth < 1024 ? 0.3 : 1) : 1,
          scale: selectedLocation ? (typeof window !== 'undefined' && window.innerWidth < 1024 ? 0.9 : 1) : 1,
          filter: selectedLocation && typeof window !== 'undefined' && window.innerWidth < 1024 ? 'blur(4px)' : 'blur(0px)'
        }}
        className={`flex-1 relative bg-slate-100 dark:bg-slate-950 p-0 lg:p-8 flex items-center justify-center overflow-hidden lg:min-h-0`}
      >
        <div className="absolute top-4 left-4 lg:top-10 lg:left-10 z-30 pointer-events-none">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2 lg:px-6 lg:py-3 rounded-xl lg:rounded-2xl border-2 border-ph-blue/20 shadow-xl">
             <h3 className="text-sm lg:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
               <MapIcon size={16} className="text-ph-blue lg:size-6" />
               Interactive Map
             </h3>
             <p className="text-[9px] lg:text-xs font-black text-ph-blue uppercase tracking-[0.2em] mt-0.5 lg:mt-1">
               Select a destination
             </p>
          </div>
        </div>

        <div 
          ref={containerRef}
          onWheel={handleWheel}
          className="relative w-full h-full lg:max-w-2xl lg:aspect-[4/5] bg-sky-50 dark:bg-slate-900 rounded-none lg:rounded-[3rem] shadow-inner border-0 lg:border-8 border-white dark:border-slate-800 overflow-hidden isolate touch-none"
        >
          {/* Zoom Controls */}
                <div className="absolute top-4 right-4 lg:top-6 lg:right-6 z-50 flex flex-col gap-2">
            <button 
              onClick={() => setMapScale(prev => Math.min(prev + 0.5, 5))}
              className="p-2 lg:p-3 bg-white dark:bg-slate-100 text-slate-900 rounded-xl lg:rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all border-2 border-ph-blue/20"
              title="Zoom In"
            >
              <ZoomIn size={16} className="lg:size-5" strokeWidth={3} />
            </button>
            <button 
              onClick={() => setMapScale(1)}
              className="p-2 lg:p-3 bg-white dark:bg-slate-100 text-slate-900 rounded-xl lg:rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all border-2 border-ph-blue/20"
              title="Reset Zoom"
            >
              <Maximize2 size={16} className="lg:size-5" strokeWidth={3} />
            </button>
            <button 
              onClick={() => setMapScale(prev => Math.max(prev - 0.5, 0.4))}
              className="p-2 lg:p-3 bg-white dark:bg-slate-100 text-slate-900 rounded-xl lg:rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all border-2 border-ph-blue/20"
              title="Zoom Out"
            >
              <ZoomOut size={16} className="lg:size-5" strokeWidth={3} />
            </button>
          </div>

          {/* Map Layer with Transform */}
          <motion.div 
            className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing origin-center"
            drag={mapScale > 1}
            dragConstraints={containerRef}
            dragElastic={0.1}
            dragMomentum={false}
            animate={{ scale: mapScale }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Decorative Sea Details */}
            <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
            
            {/* Philippines Map SVG - Detailed Outline matching second reference */}
            <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full fill-emerald-600/30 dark:fill-emerald-400/20 stroke-emerald-700/60 dark:stroke-emerald-400/50 stroke-[0.4] drop-shadow-2xl">
              {/* Luzon main body */}
              <path d="M48,5 L54,3 L56,10 L54,20 L58,35 L52,40 L45,35 L40,25 L45,10 Z" />
              {/* Bicol Peninsula */}
              <path d="M52,40 L65,42 L70,48 L65,55 L58,52 L55,42 Z" />
              
              {/* Mindoro */}
              <path d="M40,42 L46,42 L48,52 L40,50 Z" />
              
              {/* Masbate */}
              <path d="M55,54 L62,54 L65,60 L58,62 Z" />
              
              {/* Samar */}
              <path d="M75,52 L85,52 L88,65 L78,65 Z" />
              
              {/* Leyte */}
              <path d="M76,68 L84,68 L82,78 L75,76 Z" />
              
              {/* Cebu */}
              <path d="M62,65 L68,65 L70,78 L64,78 Z" />
              
              {/* Negros */}
              <path d="M55,68 L62,68 L63,85 L56,85 Z" />
              
              {/* Panay */}
              <path d="M48,58 L58,58 L60,68 L50,68 Z" />
              
              {/* Bohol */}
              <path d="M68,78 L75,78 L73,85 L66,84 Z" />
              
              {/* Palawan - Long and thin */}
              <path d="M15,62 C18,68 30,85 30,92 L24,96 L8,80 L10,65 Z" />
              
              {/* Mindanao - Large and blocky */}
              <path d="M55,80 L85,80 L90,90 L85,98 L60,98 L50,92 L42,94 L45,84 Z" />
              
              {/* Basilan & Sulu */}
              <path d="M40,95 L44,98 L40,99 L35,96 Z" />
            </svg>

            {/* Location Pins */}
            {LOCATIONS.map((loc) => {
              const labelClasses = {
                top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
                bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
                left: 'right-full top-1/2 -translate-y-1/2 mr-2',
                right: 'left-full top-1/2 -translate-y-1/2 ml-2'
              }[(loc as any).labelPos || 'bottom'];

              return (
                <motion.button
                  key={loc.id}
                  whileHover={{ scale: 1.2, zIndex: 100 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    startRegionalChallenge(loc);
                  }}
                  className="absolute z-20 group"
                  style={{ 
                    left: `${loc.pos.x}%`, 
                    top: `${loc.pos.y}%`,
                    transform: `translate(-50%, -50%) scale(${1/Math.sqrt(mapScale)})` 
                  }}
                >
                <div className={`p-1.5 rounded-full shadow-lg ${loc.id === selectedLocation?.id ? 'ring-4 ring-emerald-400 animate-pulse' : ''} ${loc.iconColor} border-2 border-white/50 hover:scale-110 transition-transform`}>
                    <MapPin size={18 / Math.sqrt(mapScale)} className="text-white" />
                  </div>
                  <div className={`absolute ${labelClasses} px-2 py-1 bg-slate-900 shadow-2xl text-white rounded-md text-[8px] font-black whitespace-nowrap border border-white/20 z-50 group-hover:scale-110 group-hover:bg-ph-blue transition-all uppercase tracking-tighter`}>
                    {loc.name}
                  </div>
                </motion.button>
              );
            })}

            {/* Travel Route Line Effect (Simulation) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
              {LOCATIONS.map((loc, i) => i > 0 && (
                <line 
                  key={i}
                  x1={`${LOCATIONS[i-1].pos.x}%`} y1={`${LOCATIONS[i-1].pos.y}%`}
                  x2={`${loc.pos.x}%`} y2={`${loc.pos.y}%`}
                  stroke="#3b82f6" 
                  strokeWidth={3 / mapScale} 
                  strokeDasharray={`${6/mapScale},${6/mapScale}`}
                />
              ))}
            </svg>
          </motion.div>
        </div>

      </motion.div>

      {/* Narrative/Challenge Area */}
      <motion.div 
        ref={challengeAreaRef}
        initial={false}
        animate={{ 
          x: selectedLocation || (typeof window !== 'undefined' && window.innerWidth >= 1024) ? 0 : '100%',
          opacity: 1
        }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className={`fixed lg:relative inset-0 lg:inset-auto z-[60] lg:z-0 w-full lg:w-[400px] lg:h-full bg-app-card lg:border-l border-app-border flex flex-col p-6 lg:p-10 overflow-y-auto ${!selectedLocation ? 'pointer-events-none lg:pointer-events-auto' : 'pointer-events-auto'}`}
      >
        <AnimatePresence mode="wait">
          {selectedLocation ? (
            <motion.div 
              key={selectedLocation.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 lg:space-y-8"
            >
              {/* Back button for mobile */}
              <button 
                onClick={() => setSelectedLocation(null)}
                className="lg:hidden flex items-center gap-2 text-ph-blue font-black text-[10px] uppercase tracking-widest mb-4 hover:opacity-70 transition-opacity"
              >
                <ChevronLeft size={16} /> Back to Map
              </button>
              <div className={`w-12 h-12 lg:w-16 lg:h-16 rounded-2xl lg:rounded-[2rem] flex items-center justify-center text-white shadow-xl bg-gradient-to-br ${selectedLocation.colorGradient}`}>
                <GraduationCap size={24} className="lg:size-8" />
              </div>

              <div>
                <h2 className="text-3xl lg:text-4xl font-black text-app-text tracking-tighter leading-tight">{selectedLocation.name}</h2>
                <p className="text-ph-blue font-black uppercase tracking-[0.2em] text-[9px] lg:text-[10px] mt-2">{selectedLocation.theme}</p>
              </div>

              <div className="p-4 lg:p-6 bg-app-bg/50 rounded-2xl lg:rounded-3xl border border-app-border relative italic shadow-inner">
                <Sparkles size={20} className="absolute -top-3 -right-3 text-ph-yellow" />
                <p className="text-sm lg:text-base text-app-text font-medium leading-relaxed">
                  {selectedLocation.description}
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-app-muted flex items-center gap-2">
                   <MessageSquare size={12} /> Local Guide Message
                </h4>
                <div className={`p-6 rounded-[2rem] shadow-sm font-bold leading-relaxed border-2 border-transparent transition-all text-red-600 dark:text-yellow-400 ${isTalking ? 'bg-ph-blue/5 border-ph-blue/20 animate-pulse' : 'bg-app-card border-app-border'}`}>
                   {guideMessage || "Click the pin to hear from your local guide!"}
                </div>
              </div>

              <div className="space-y-4 pt-6">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-app-muted flex items-center gap-2">
                    <Trophy size={12} /> Regional Trivia
                 </h4>
                 <p className="text-xs text-app-muted font-medium bg-ph-yellow/10 p-5 rounded-2xl border border-ph-yellow/20">
                    {selectedLocation.trivia}
                 </p>
              </div>

              {/* Regional Vocabulary List */}
              <div className="space-y-4 pt-6">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-app-muted flex items-center gap-2">
                    <BookOpen size={12} /> Regional Vocabulary
                 </h4>
                 <div className="grid grid-cols-2 gap-2">
                    {(selectedLocation as any).regionalWords?.map((w: any, idx: number) => {
                      const isSaved = userWords.some(uw => uw.tagalog.toLowerCase() === w.tagalog.toLowerCase());
                      return (
                        <div key={idx} className="p-3 bg-app-bg border border-app-border rounded-xl group/word relative overflow-hidden">
                           <p className="text-red-600 dark:text-yellow-400 font-black text-sm">{w.tagalog}</p>
                           <p className="text-[10px] text-app-muted font-bold">{w.english}</p>
                           {!isSaved && (
                             <button 
                               onClick={() => onSaveWord({ tagalog: w.tagalog, english: w.english, category: 'Daily' })}
                               className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-ph-blue text-white rounded-lg shadow-lg hover:scale-110 active:scale-95"
                               title="Save to bank"
                             >
                                <Plus size={10} />
                             </button>
                           )}
                           {isSaved && (
                             <div className="absolute right-2 top-2 p-1.5 text-emerald-500">
                               <Plus size={10} className="rotate-45" />
                             </div>
                           )}
                        </div>
                      );
                    })}
                 </div>
              </div>

              {/* Difficulty Selection */}
              <div className="space-y-4 pt-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-app-muted flex items-center gap-2">
                   <Brain size={12} /> Challenge Difficulty
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {[limit, limit * 2, limit * 3].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setLocalLimit(lvl)}
                      className={`py-3 rounded-xl text-[10px] font-black transition-all border ${
                        localLimit === lvl 
                          ? 'bg-ph-blue text-white border-ph-blue shadow-lg scale-105' 
                          : 'bg-app-bg text-app-text border-app-border hover:border-ph-blue/50'
                      }`}
                    >
                      {lvl === limit ? 'Focus' : lvl === limit * 2 ? 'Marathon' : 'Expert'} ({lvl} Words)
                    </button>
                  ))}
                </div>
              </div>

              {challengeStatus === 'exploring' && (
                <button 
                  onClick={handleAcceptChallenge}
                  className="w-full py-5 bg-ph-blue text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-ph-blue/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                   Accept Challenge <ChevronRight size={18} />
                </button>
              )}

              {challengeStatus === 'learning' && quizQueue[learningIdx] && (
                <div className="space-y-6 pt-6 border-t border-app-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-app-muted uppercase tracking-widest">Lesson {learningIdx + 1} of {quizQueue.length}</span>
                    <span className="text-[10px] font-black text-ph-blue uppercase tracking-widest italic flex items-center gap-1">
                      <Sparkles size={10} /> Preparation Phase
                    </span>
                  </div>
                  
                  <motion.div 
                    key={learningIdx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-8 bg-app-card border-2 border-ph-blue/20 rounded-[2.5rem] text-center shadow-xl relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <BookOpen size={64} />
                    </div>
                    <p className="text-[10px] font-black uppercase text-app-muted tracking-[0.2em] mb-4">Study this word:</p>
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-4">
                        <h4 className="text-4xl font-black text-red-600 dark:text-yellow-400">{quizQueue[learningIdx].tagalog}</h4>
                        <button 
                          onClick={() => playAudio(quizQueue[learningIdx].tagalog, `learn-${learningIdx}`)}
                          disabled={playingId !== null}
                          className={`p-3 rounded-full transition-all ${playingId === `learn-${learningIdx}` ? 'bg-ph-blue text-white' : 'bg-ph-blue/5 text-ph-blue hover:bg-ph-blue hover:text-white'}`}
                        >
                          {playingId === `learn-${learningIdx}` ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />}
                        </button>
                      </div>
                      <div className="h-0.5 w-12 bg-ph-blue/20 mx-auto" />
                      <p className="text-xl font-bold text-app-muted italic">"{quizQueue[learningIdx].english}"</p>
                    </div>
                  </motion.div>

                  <div className="flex gap-3">
                    {learningIdx > 0 && (
                      <button 
                        onClick={() => setLearningIdx(prev => prev - 1)}
                        className="flex-1 py-4 bg-app-bg border border-app-border text-app-text rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                      >
                        <ChevronLeft size={14} /> Prev
                      </button>
                    )}
                    {learningIdx < quizQueue.length - 1 ? (
                      <button 
                        onClick={() => setLearningIdx(prev => prev + 1)}
                        className="flex-[2] py-4 bg-ph-blue text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg shadow-ph-blue/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        Next Word <ChevronRight size={14} />
                      </button>
                    ) : (
                      <button 
                        onClick={() => setChallengeStatus('quiz')}
                        className="flex-[2] py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        Start Quiz Now <Gamepad2 size={14} />
                      </button>
                    )}
                  </div>

                  <p className="text-[10px] text-app-muted font-medium text-center italic">
                    Focus on these words. They will appear in the upcoming challenge!
                  </p>
                </div>
              )}

              {challengeStatus === 'quiz' && quizQueue[currentQuizIdx] && (
                <div className="space-y-6 pt-6 border-t border-app-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-app-muted uppercase tracking-widest">Question {currentQuizIdx + 1} of {quizQueue.length}</span>
                    <span className="text-[10px] font-black text-ph-blue uppercase tracking-widest">Score: {sessionScore}</span>
                  </div>
                  <h4 className="text-xl font-black text-app-text">What is the Tagalog for "{quizQueue[currentQuizIdx].english}"?</h4>
                  <div className="grid gap-3">
                    {quizQueue[currentQuizIdx].options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleOptionClick(opt)}
                        disabled={selectedOption !== null}
                        className={`w-full p-4 rounded-2xl font-bold text-left transition-all relative overflow-hidden group ${
                          selectedOption === opt
                            ? feedback === 'correct'
                              ? 'bg-emerald-500 text-white'
                              : 'bg-ph-red text-white'
                            : selectedOption && opt === quizQueue[currentQuizIdx].tagalog
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600'
                              : 'bg-app-bg hover:bg-app-bg/80 text-app-text border border-app-border'
                        }`}
                      >
                         <div className="relative z-10 flex justify-between items-center">
                           <span className="text-red-600 dark:text-yellow-400">{opt}</span>
                            {selectedOption === opt && (
                              feedback === 'correct' ? <Trophy size={16} /> : <X size={16} />
                            )}
                         </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {challengeStatus === 'won' && (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-8 bg-emerald-500 rounded-[2rem] text-white text-center shadow-xl shadow-emerald-500/20"
                >
                  <Trophy size={48} className="mx-auto mb-4" />
                  <h4 className="text-2xl font-black mb-2">Mahusay!</h4>
                  <p className="font-medium opacity-90 mb-6">Challenge completed! You got {sessionScore} out of {quizQueue.length} correct in {selectedLocation?.name}. Words you answered correctly were auto-saved to your library!</p>
                  <button 
                    onClick={() => setChallengeStatus('exploring')}
                    className="w-full py-4 bg-white text-emerald-500 rounded-xl font-black uppercase tracking-widest text-xs"
                  >
                    Continue Exploring
                  </button>
                </motion.div>
              )}

              {/* Balikbayan Box / Souvenirs */}
              <div className="pt-8 border-t border-app-border">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-app-muted flex items-center gap-2 mb-4">
                    <Sparkles size={12} /> Balikbayan Box (Souvenirs)
                 </h4>
                 <div className="flex flex-wrap gap-2">
                    {souvenirs.length === 0 ? (
                      <p className="text-xs text-app-muted italic">No souvenirs yet. Complete challenges to collect them!</p>
                    ) : (
                      souvenirs.map(sid => {
                        const loc = LOCATIONS.find(l => l.id === sid);
                        return (
                          <div key={sid} className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm text-white ${loc?.iconColor}`}>
                            <MapPin size={16} />
                          </div>
                        );
                      })
                    )}
                 </div>
              </div>
            </motion.div>
          ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-6 border-t border-app-border">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-ph-yellow/10 rounded-2xl lg:rounded-[3rem] flex items-center justify-center">
                 <MapIcon className="text-ph-yellow" size={32} />
              </div>
              <div className="px-2 lg:px-6">
                <h3 className="text-xl lg:text-2xl font-black text-app-text tracking-tight">Ready for Departure?</h3>
                <p className="text-app-muted font-medium mt-2 text-xs lg:text-sm">Select a destination on the map to begin your regional expedition.</p>
              </div>

              {/* General Difficulty Selection */}
              <div className="w-full px-2 lg:px-6 space-y-4">
                <p className="text-[9px] lg:text-[10px] font-black text-app-muted uppercase tracking-widest">Challenge Difficulty</p>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 25].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setLocalLimit(lvl)}
                      className={`py-2 lg:py-3 rounded-lg lg:rounded-xl text-[9px] lg:text-[10px] font-black transition-all border ${
                        localLimit === lvl 
                          ? 'bg-ph-blue text-white border-ph-blue shadow-lg scale-105' 
                          : 'bg-app-bg text-app-text border-app-border hover:border-ph-blue/50'
                      }`}
                    >
                      {lvl} Words
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 lg:gap-3 w-full px-2 lg:px-6">
                 {LOCATIONS.slice(0, 6).map(l => (
                   <motion.button 
                     key={l.id} 
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     onClick={() => startRegionalChallenge(l)}
                     className="p-3 lg:p-4 bg-slate-100 dark:bg-slate-800 border-2 border-app-border rounded-xl lg:rounded-2xl text-[10px] lg:text-[12px] font-black uppercase text-slate-900 dark:text-white hover:border-ph-blue hover:bg-ph-blue/5 transition-all shadow-md flex items-center justify-center gap-2"
                   >
                      <MapPin size={12} className="text-ph-blue" />
                      {l.name}
                   </motion.button>
                 ))}
                 <div className="col-span-2 text-[9px] lg:text-[11px] text-app-muted font-black uppercase tracking-widest mt-2 text-center opacity-70">
                   Or tap any pin on the map to explore!
                 </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
