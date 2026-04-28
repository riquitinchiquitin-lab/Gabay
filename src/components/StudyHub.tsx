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
      <div className="p-4 md:p-8 max-w-6xl mx-auto flex flex-col py-8 md:py-12">
        <header className="mb-8 md:mb-16 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-app-text mb-4 md:mb-6">Study Hub</h1>
          <p className="text-app-muted text-base md:text-xl max-w-2xl mx-auto font-medium">
            Deepen your Tagalog knowledge. Explore word usage in detail or test your memory with active recall.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <motion.div 
            whileHover={{ y: -5, scale: 1.02 }}
            className="group bg-app-card border-2 border-app-border rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 cursor-pointer shadow-xl hover:border-ph-blue/30 transition-all"
            onClick={() => setMode('glossary')}
          >
            <div className="w-12 h-12 md:w-20 md:h-20 bg-ph-blue/10 rounded-2xl md:rounded-3xl flex items-center justify-center mb-6 md:mb-8">
              <BookOpen className="text-ph-blue w-6 h-6 md:w-10 md:h-10" />
            </div>
            <h2 className="text-xl md:text-3xl font-black text-app-text mb-2 md:mb-4">Context Glossary</h2>
            <p className="text-app-muted text-sm md:text-lg mb-6 md:mb-8 leading-relaxed">
              Browse your words with a focus on usage. See example sentences, categories, and hear correct pronunciations.
            </p>
            <div className="text-ph-blue font-black uppercase tracking-widest flex items-center gap-2 text-xs md:text-base">
              Explore Library <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5, scale: 1.02 }}
            className="group bg-app-card border-2 border-app-border rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 cursor-pointer shadow-xl hover:border-ph-red/30 transition-all"
            onClick={() => setMode('flashcards')}
          >
            <div className="w-12 h-12 md:w-20 md:h-20 bg-ph-red/10 rounded-2xl md:rounded-3xl flex items-center justify-center mb-6 md:mb-8">
              <GraduationCap className="text-ph-red w-6 h-6 md:w-10 md:h-10" />
            </div>
            <h2 className="text-xl md:text-3xl font-black text-app-text mb-2 md:mb-4">Active Review</h2>
            <p className="text-app-muted text-sm md:text-lg mb-6 md:mb-8 leading-relaxed">
              Test your recall with flashcards. Swipe through your vocabulary bank and master meanings through repetition.
            </p>
            <div className="text-ph-red font-black uppercase tracking-widest flex items-center gap-2 text-xs md:text-base">
              Start Session <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-app-bg/30">
      <header className="h-16 md:h-20 bg-app-card border-b border-app-border px-4 md:px-8 flex items-center justify-between flex-shrink-0">
        <button 
          onClick={() => setMode('menu')}
          className="flex items-center gap-2 text-app-muted hover:text-ph-blue font-black uppercase tracking-widest text-xs transition-all"
        >
          <ChevronLeft size={16} /> Back to Hub
        </button>
        <div className="flex items-center gap-3">
          {mode === 'glossary' ? <BookOpen size={20} className="text-ph-blue" /> : <GraduationCap size={20} className="text-ph-red" />}
          <span className="font-black text-app-text uppercase tracking-[0.2em]">{mode === 'glossary' ? 'Context Glossary' : 'Active Review'}</span>
        </div>
      </header>

      <div className="py-6">
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
    <div className="max-w-4xl mx-auto p-4 md:p-12 space-y-4 md:space-y-8">
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
        <div className="bg-app-card border-2 border-app-border rounded-[3rem] p-16 shadow-2xl space-y-8">
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
    <div className="max-w-xl mx-auto p-4 md:p-12 flex flex-col gap-6 md:gap-12">
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
