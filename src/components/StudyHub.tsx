import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, GraduationCap, RotateCcw, Volume2, Loader2, ChevronRight, ChevronLeft, Sparkles, Brain, CheckCircle2, XCircle } from 'lucide-react';

interface Word {
  id: string;
  tagalog: string;
  english: string;
  category: string;
  exampleSentence?: string;
}

interface StudyHubProps {
  words: Word[];
  playAudio: (text: string, id: string) => Promise<void>;
  playingId: string | null;
  logWordResult: (wordId: string, correct: boolean) => Promise<void>;
}

export const StudyHub: React.FC<StudyHubProps> = ({ words, playAudio, playingId, logWordResult }) => {
  const [mode, setMode] = useState<'menu' | 'glossary' | 'flashcards'>('menu');
  const [selectedMode, setSelectedMode] = useState<'glossary' | 'flashcards'>('glossary');

  if (!Array.isArray(words) || words.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-10 text-center">
        <div className="w-24 h-24 bg-ph-blue/10 rounded-[3rem] flex items-center justify-center mb-8">
          <BookOpen className="text-ph-blue" size={48} />
        </div>
        <h2 className="text-3xl font-black text-app-text mb-4">Study Hub is Empty</h2>
        <p className="text-app-muted max-w-sm text-lg">
          You need to add some words to your bank before you can start studying them!
        </p>
      </div>
    );
  }

  if (mode === 'menu') {
    return (
      <div className="h-full w-full overflow-y-auto custom-scrollbar flex flex-col p-3 md:p-6 bg-app-bg animate-fade-in">
        <div className="max-w-none px-4 md:px-10 lg:px-16 w-full flex-1 flex flex-col justify-center gap-4">
          {/* Extremely Compact Header */}
          <header className="mb-2 text-center md:text-left shrink-0">
            <h1 className="text-xl md:text-3xl font-black text-app-text flex items-center justify-center md:justify-start gap-2 border-l-4 border-ph-blue pl-3 leading-tight select-none">
              Study Hub
            </h1>
            <p className="text-app-muted text-xs md:text-sm font-semibold tracking-wide hidden sm:block mt-1 animate-pulse">
              Deepen your Tagalog knowledge. Explore word usage in detail or test your memory with active recall.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 lg:gap-8 items-stretch flex-1">
            {/* Step 1: Active 2x1 Selection Grid */}
            <div className="md:col-span-7 flex flex-col gap-3 md:gap-4 flex-1">
              <div className="flex items-center gap-2 shrink-0 select-none">
                <span className="w-4 h-4 md:w-6 md:h-6 flex items-center justify-center rounded-full bg-ph-blue text-white text-[9px] md:text-xs font-black">1</span>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-app-muted">Select Study Mode</span>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4 flex-1">
                {/* 1. Context Glossary */}
                <button
                  type="button"
                  onClick={() => setSelectedMode('glossary')}
                  className={`text-left relative bg-app-card border rounded-xl p-3 sm:p-4 md:p-4 lg:p-6 xl:p-8 transition-all duration-200 flex flex-col justify-between h-24 sm:h-28 md:h-36 lg:h-48 xl:h-60 cursor-pointer select-none ${
                    selectedMode === 'glossary'
                      ? 'border-emerald-500 ring-4 ring-emerald-500/10 shadow-md bg-emerald-500/5 dark:bg-emerald-500/10'
                      : 'border-app-border hover:border-emerald-500/30'
                  }`}
                >
                  <div className={`w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 rounded-lg md:rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                    selectedMode === 'glossary' ? 'bg-emerald-500 text-white shadow-md' : 'bg-emerald-500/10 text-emerald-500'
                  }`}>
                    <BookOpen className="size-4 md:size-6 lg:size-8" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm md:text-sm lg:text-lg xl:text-xl font-black text-app-text whitespace-normal break-words flex flex-wrap items-center gap-1 sm:gap-1.5 leading-tight">
                      Context Glossary
                      {selectedMode === 'glossary' && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />}
                    </h3>
                    <p className="text-[9px] sm:text-xs text-app-muted line-clamp-1 font-semibold mt-0.5">
                      Explore Word Usage
                    </p>
                  </div>
                </button>

                {/* 2. Active Review */}
                <button
                  type="button"
                  onClick={() => setSelectedMode('flashcards')}
                  className={`text-left relative bg-app-card border rounded-xl p-3 sm:p-4 md:p-4 lg:p-6 xl:p-8 transition-all duration-200 flex flex-col justify-between h-24 sm:h-28 md:h-36 lg:h-48 xl:h-60 cursor-pointer select-none ${
                    selectedMode === 'flashcards'
                      ? 'border-ph-blue ring-4 ring-ph-blue/10 shadow-md bg-ph-blue/5 dark:bg-ph-blue/10'
                      : 'border-app-border hover:border-ph-blue/30'
                  }`}
                >
                  <div className={`w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 rounded-lg md:rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                    selectedMode === 'flashcards' ? 'bg-ph-blue text-white shadow-md' : 'bg-ph-blue/10 text-ph-blue'
                  }`}>
                    <GraduationCap className="size-4 md:size-6 lg:size-8" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm md:text-sm lg:text-lg xl:text-xl font-black text-app-text whitespace-normal break-words flex flex-wrap items-center gap-1 sm:gap-1.5 leading-tight">
                      Active Review
                      {selectedMode === 'flashcards' && <span className="w-2 h-2 rounded-full bg-ph-blue animate-pulse inline-block" />}
                    </h3>
                    <p className="text-[9px] sm:text-xs text-app-muted line-clamp-1 font-semibold mt-0.5">
                      Recall with Flashcards
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Step 2: Unified Panel */}
            <div className="md:col-span-5 flex flex-col bg-app-card border border-app-border rounded-xl p-3 sm:p-4 md:p-4 lg:p-5 xl:p-6 shadow-sm justify-between gap-4 flex-1">
              <div className="space-y-4 md:space-y-6 flex-1 flex flex-col justify-center">
                <div className="flex items-center justify-between border-b border-app-border/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 md:w-6 md:h-6 flex items-center justify-center rounded-full bg-ph-blue text-white text-[9px] md:text-xs font-black">2</span>
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-app-muted">Session Config</span>
                  </div>
                  <span className="text-[10px] md:text-xs font-black text-ph-blue bg-ph-blue/10 px-3 py-1 rounded-full">
                    {words.length} {words.length === 1 ? 'Word' : 'Words'}
                  </span>
                </div>

                {/* Session dynamic scope progress */}
                <div className="bg-app-bg/50 rounded-lg p-3 md:p-5 lg:p-6 space-y-1 text-[10px] md:text-xs text-app-muted font-medium border border-app-border/40 flex-1 flex flex-col justify-center">
                  <p className="text-[9px] md:text-xs font-black uppercase tracking-wider text-app-muted mb-1 font-bold">Selected Mode Info</p>
                  <p className="text-app-text text-xs md:text-sm lg:text-base leading-snug md:leading-relaxed">
                    {selectedMode === 'glossary' ? (
                      'Browse your words with a focus on usage. See example sentences, categories, and correct pronunciations with interactive audio controls.'
                    ) : (
                      'Test your recall with flashcards. Swipe through your custom vocabulary bank and master meanings through active spaced-repetition loops.'
                    )}
                  </p>
                </div>
              </div>

              {/* Large CTA Start Button */}
              <button
                type="button"
                onClick={() => setMode(selectedMode)}
                className="w-full py-3 md:py-4 lg:py-5 bg-ph-blue text-white rounded-xl hover:bg-ph-blue/95 font-bold uppercase tracking-[0.1em] text-[11px] md:text-sm lg:text-base shadow-lg shadow-ph-blue/20 flex items-center justify-center gap-1.5 hover:scale-[1.01] active:scale-95 transition-all text-center select-none cursor-pointer"
              >
                Magsimula Na <ChevronRight size={14} className="shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-app-bg overflow-hidden animate-fade-in">
      <header className="h-12 md:h-14 bg-app-card border-b border-app-border px-4 md:px-6 flex items-center justify-between flex-shrink-0">
        <button 
          onClick={() => setMode('menu')}
          className="flex items-center gap-2 text-app-muted hover:text-ph-blue font-black uppercase tracking-widest text-[10px] transition-all"
        >
          <ChevronLeft size={14} /> Back to Hub
        </button>
        <div className="flex items-center gap-2">
          {mode === 'glossary' ? <BookOpen size={16} className="text-ph-blue" /> : <GraduationCap size={16} className="text-ph-red" />}
          <span className="font-black text-app-text uppercase tracking-[0.2em] text-[10px]">{mode === 'glossary' ? 'Context Glossary' : 'Active Review'}</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 md:p-6 pb-20 lg:pb-6">
        {mode === 'glossary' ? (
          <Glossary words={words} playAudio={playAudio} playingId={playingId} logWordResult={logWordResult} />
        ) : (
          <FlashcardReview words={words} playAudio={playAudio} playingId={playingId} logWordResult={logWordResult} />
        )}
      </div>
    </div>
  );
};

const Glossary: React.FC<StudyHubProps> = ({ words, playAudio, playingId }) => {
  return (
    <div className="max-w-none px-4 md:px-10 lg:px-16 p-4 md:p-8 space-y-4 md:space-y-8">
      {words.map((word) => (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key={word.id}
          className="bg-app-card border border-app-border rounded-xl md:rounded-2xl p-3 md:p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-6 opacity-0 md:opacity-5 group-hover:opacity-10 transition-opacity">
             <BookOpen size={60} className="md:size-[80px]" />
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center gap-3">
                <span className="px-2 md:px-3 py-1 bg-ph-blue text-white rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em]">
                  {word.category}
                </span>
                {word.correctCount !== undefined && (word.correctCount > 0 || word.incorrectCount! > 0) && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-app-bg rounded-md border border-app-border text-[8px] font-black uppercase tracking-tighter">
                    <span className="text-emerald-500">{word.correctCount}✓</span>
                    <span className="text-ph-red">{word.incorrectCount}✗</span>
                  </div>
                )}
                <button 
                  onClick={() => playAudio(word.tagalog, `glossary-${word.id}`)}
                  disabled={playingId !== null}
                  className={`p-1.5 rounded-full transition-all ${playingId === `glossary-${word.id}` ? 'bg-ph-blue text-white' : 'bg-ph-blue/10 text-ph-blue hover:bg-ph-blue hover:text-white'}`}
                >
                  {playingId === `glossary-${word.id}` ? <Loader2 size={14} className="animate-spin md:size-[16px]" /> : <Volume2 size={14} className="md:size-[16px]" />}
                </button>
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-black text-app-text mb-0.5 md:mb-1 tracking-tight">{word.tagalog}</h3>
                <p className="text-base md:text-lg font-bold text-app-muted">{word.english}</p>
              </div>
            </div>

            <div className="md:max-w-xs w-full">
              <p className="text-[9px] font-black uppercase tracking-widest text-ph-yellow-text mb-1.5 md:mb-2 flex items-center gap-2">
                <Sparkles size={10} /> Usage Context
              </p>
              <div className="p-3 md:p-4 rounded-lg md:rounded-xl border-l-2 border-ph-yellow/30 bg-slate-100 dark:bg-slate-800/60 shadow-inner">
                <p className="text-slate-800 dark:text-slate-100 font-medium text-xs md:text-sm leading-relaxed italic">
                  {word.exampleSentence || "(No example sentence generated yet. Use the 'AI Helper' in the Dashboard to add context!)"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const FlashcardReview: React.FC<StudyHubProps> = ({ words, playAudio, playingId, logWordResult }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [stats, setStats] = useState({ remembered: 0, forgotten: 0 });
  const [sessionFinished, setSessionFinished] = useState(false);

  const word = words[currentIndex];

  const handleNext = (remembered: boolean) => {
    // Log word result
    logWordResult(word.id, remembered);

    if (remembered) setStats(s => ({ ...s, remembered: s.remembered + 1 }));
    else setStats(s => ({ ...s, forgotten: s.forgotten + 1 }));

    if (currentIndex < words.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(currentIndex + 1), 150);
    } else {
      setSessionFinished(true);
    }
  };

  const resetSession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setStats({ remembered: 0, forgotten: 0 });
    setSessionFinished(false);
  };

  if (sessionFinished) {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-12 text-center flex flex-col">
        <div className="bg-app-card border border-app-border rounded-[2rem] p-6 md:p-16 shadow-2xl space-y-6 md:space-y-8">
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-ph-yellow/10 rounded-full flex items-center justify-center">
              <Brain className="text-ph-yellow" size={48} />
            </div>
          </div>
          <h2 className="text-4xl font-black text-app-text">Review Complete!</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50 dark:bg-emerald-500/10 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-500/20">
              <CheckCircle2 className="text-emerald-500 mx-auto mb-2" />
              <p className="text-2xl font-black text-emerald-600">{stats.remembered}</p>
              <p className="text-[10px] font-black uppercase text-emerald-600/70">Mastered</p>
            </div>
            <div className="bg-ph-red/5 p-6 rounded-3xl border border-ph-red/10">
              <XCircle className="text-ph-red mx-auto mb-2" />
              <p className="text-2xl font-black text-ph-red">{stats.forgotten}</p>
              <p className="text-[10px] font-black uppercase text-ph-red/70">Need Practice</p>
            </div>
          </div>
          <button 
            onClick={resetSession}
            className="w-full py-5 bg-ph-blue text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-ph-blue/20 hover:scale-105 transition-all"
          >
            Review Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto p-4 md:p-8 flex flex-col gap-6 md:gap-8">
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] text-app-muted">
        <span>Card {currentIndex + 1} of {words.length}</span>
        <button onClick={resetSession} className="flex items-center gap-1 hover:text-ph-blue transition-colors">
          <RotateCcw size={12} /> Restart
        </button>
      </div>

      <div className="perspective-2000 h-[220px] md:h-[300px] relative">
        <motion.div 
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-full h-full relative cursor-pointer preserve-3d"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front */}
          <div className="absolute inset-0 bg-app-card border-2 border-app-border rounded-xl md:rounded-2xl shadow-xl flex flex-col items-center justify-center p-4 md:p-8 backface-hidden">
            <span className="text-[8px] md:text-[10px] font-black text-ph-blue uppercase tracking-widest mb-2 md:mb-3">Tagalog</span>
            <h3 className="text-xl md:text-3xl font-black text-app-text text-center leading-tight mb-2 md:mb-4">
              {word.tagalog}
            </h3>
            <button 
              onClick={(e) => { e.stopPropagation(); playAudio(word.tagalog, `flash-${word.id}`); }}
              className="p-2 md:p-3 bg-ph-blue/5 text-ph-blue rounded-full hover:bg-ph-blue hover:text-white transition-all"
            >
              <Volume2 size={16} className="md:size-[20px]" />
            </button>
            <p className="absolute bottom-4 text-[8px] md:text-[10px] font-black text-app-muted uppercase tracking-widest opacity-50">Click to flip</p>
          </div>

          {/* Back */}
          <div className="absolute inset-0 bg-app-card border-2 border-ph-blue/30 rounded-xl md:rounded-2xl shadow-xl flex flex-col items-center justify-center p-4 md:p-8 rotate-y-180 backface-hidden bg-gradient-to-br from-white to-ph-blue/[0.02] dark:from-slate-900 dark:to-slate-800">
            <span className="text-[8px] md:text-[10px] font-black text-ph-red uppercase tracking-widest mb-1 md:mb-2">Meaning & Context</span>
            <h4 className="text-lg md:text-2xl font-black text-app-text text-center mb-2 md:mb-4">{word.english}</h4>
            <div className="w-full bg-slate-50 dark:bg-slate-900/50 p-3 md:p-4 rounded-lg md:rounded-xl border-l-4 border-ph-yellow text-center">
              <p className="text-[9px] md:text-xs font-medium italic text-slate-800 dark:text-slate-200">
                "{word.exampleSentence || "Review this word's meaning to master it!"}"
              </p>
            </div>
            <p className="absolute bottom-4 text-[8px] md:text-[10px] font-black text-app-muted uppercase tracking-widest opacity-50">Click to flip back</p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => handleNext(false)}
          className="py-5 bg-white dark:bg-slate-800 border-2 border-ph-red/20 text-ph-red rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-ph-red hover:text-white transition-all shadow-lg active:scale-95"
        >
          Need Practice
        </button>
        <button 
          onClick={() => handleNext(true)}
          className="py-5 bg-ph-blue text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl shadow-ph-blue/20 active:scale-95"
        >
          Got It!
        </button>
      </div>
    </div>
  );
};
