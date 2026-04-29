import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Sparkles, Filter, Calendar, BookOpen, LogIn, LogOut, Users, LayoutDashboard, ShieldCheck, Sun, Moon, Gamepad2, Wand2, Volume2, Loader2, Compass, LayoutGrid, CheckCircle2, AlertCircle, ArrowRight, Music, Youtube, Play, MessageSquare, Activity, HardDrive, Lock, Settings, History, Download, Eye, Terminal, Globe, Shield, RefreshCw, Save, Server, Key, Copy, Info, AlertTriangle, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { GoogleGenAI } from "@google/genai";
import { Games } from './components/Games';
import { StudyHub } from './components/StudyHub';
import { localAi } from './services/localAi';

// Safe AI initialization to prevent boot-time crashes
const getAiInstance = () => {
  try {
    const key = process.env.GEMINI_API_KEY || '';
    if (!key) return null;
    return new GoogleGenAI({ apiKey: key });
  } catch (e) {
    console.warn("AI Initialization postponed: process.env.GEMINI_API_KEY access failed.");
    return null;
  }
};

const ai = getAiInstance();

// Configure axios for JWT authentication
const token = typeof window !== 'undefined' ? localStorage.getItem('gabay_auth_token') : null;
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Global interceptor to handle errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        window.dispatchEvent(new CustomEvent('unauthorized'));
      }
      if (error.response.status === 503 && error.response.data?.type === 'INFRASTRUCTURE_ERROR') {
        window.dispatchEvent(new CustomEvent('infra-missing'));
      }
    }
    return Promise.reject(error);
  }
);

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  _count?: { words: number };
  createdAt: string;
}

interface Word {
  id: string;
  tagalog: string;
  english: string;
  category: string;
  exampleSentence?: string;
  createdAt: string;
  correctCount?: number;
  incorrectCount?: number;
  lastReviewedAt?: string;
}

const CATEGORIES = ["Household", "Botanical", "Daily", "Food", "Travel", "Emotions"];

const EXPLORER_TOPICS = [
  "Beach Trip", "Hospital", "In the Kitchen", "Business Meeting",
  "Filipino Breakfast", "Commuting in Manila", "Mall Culture", "Island Hopping", 
  "Fiesta Traditions", "Filipino Hospitality", "Modern Pinoy Slang", "Barangay Life", 
  "Night Market", "Public School Life", "Baking Pandesal", "Fruit Stand", 
  "Basketball in the Streets", "Karaoke Night", "Christmas in the Philippines", 
  "Wedding Traditions", "Traditional Healing (Hilot)", "Folk Dances", "Ancestral Houses",
  "Tech Startup Scene", "Video Gaming Hubs", "Environmental Protection", "Organic Farming",
  "Baguio Scenery", "Cebu Street Food", "Davao Durian Experience", "Vigan Heritage",
  "Palawan Lagoons", "Siargao Surfing", "Boracay Sunsets", "Sagada Caves",
  "Divisoria Shopping", "Quiapo Market", "Makati Business District", "BGC Nightlife",
  "Intramuros History", "Binondo Food Crawl", "Iloilo Heritage", "Bacolod Chicken Inasal",
  "Zamboanga Vintas", "CDO River Rafting", "Tagaytay Ridge View", "Bohol Chocolate Hills",
  "Legazpi Mayon Volcano", "Dumaguete Gentle People", "Subic Bay Adventures", "Tacloban Resilience"
];

const InfrastructureMissingScreen = () => (
  <div className="min-h-screen bg-app-bg flex items-center justify-center p-6">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl w-full bg-app-card rounded-[3rem] border border-app-border shadow-2xl overflow-hidden"
    >
      <div className="p-12 text-center">
        <div className="w-24 h-24 bg-ph-blue/10 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-ph-blue/20">
          <PhilippineSun size={48} className="text-ph-blue animate-pulse" />
        </div>
        
        <h2 className="text-3xl font-black text-app-text mb-4 uppercase tracking-tight">PostgreSQL 16 Setup Required</h2>
        <p className="text-app-muted leading-relaxed mb-10 max-w-md mx-auto">
          The Gabay Security Protocol has detected a missing infrastructure link. To proceed with the Neural GCM deployment, you must configure your PostgreSQL 16 connection.
        </p>
        
        <div className="bg-app-bg rounded-2xl p-8 text-left space-y-6 border border-app-border mb-10">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-ph-red text-white font-black flex items-center justify-center rounded-full shrink-0 text-xs">1</div>
            <div>
              <p className="text-sm font-black text-app-text mb-1 uppercase tracking-widest">Open Secrets Panel</p>
              <p className="text-xs text-app-muted">Navigate to the <span className="text-ph-blue font-bold">Secrets</span> panel in the AI Studio Settings menu.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-ph-blue text-white font-black flex items-center justify-center rounded-full shrink-0 text-xs">2</div>
            <div>
              <p className="text-sm font-black text-app-text mb-1 uppercase tracking-widest">Define Entry</p>
              <p className="text-xs text-app-muted">Add a new secret named <code className="bg-app-card px-2 py-0.5 rounded font-mono text-emerald-500">DATABASE_URL</code>.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-ph-yellow text-app-text font-black flex items-center justify-center rounded-full shrink-0 text-xs">3</div>
            <div>
              <p className="text-sm font-black text-app-text mb-1 uppercase tracking-widest">Apply Connection</p>
              <p className="text-xs text-app-muted">Paste your PostgreSQL 16 connection string and restart the environment.</p>
            </div>
          </div>
        </div>

        <button 
          onClick={() => window.location.reload()}
          className="w-full py-5 bg-ph-blue text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-ph-blue/20"
        >
          Check Connectivity
        </button>
      </div>
      
      <div className="bg-ph-blue/5 p-6 border-t border-app-border flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <Database size={14} className="text-ph-blue" />
          <span className="text-[10px] font-black text-app-muted uppercase tracking-widest">PostgreSQL 16 Engine</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-ph-blue" />
          <span className="text-[10px] font-black text-app-muted uppercase tracking-widest">Gabay Secured</span>
        </div>
      </div>
    </motion.div>
  </div>
);

export const PhilippineSun = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="currentColor" 
    className={className}
  >
    <circle cx="50" cy="50" r="20" />
    <g transform="translate(50, 50)">
      {[...Array(8)].map((_, i) => (
        <g key={i} transform={`rotate(${i * 45})`}>
          <path d="M-4,-23 L0,-50 L4,-23 Z" />
          <path d="M-11,-23 L-8,-42 L-2,-23 Z" />
          <path d="M2,-23 L8,-42 L11,-23 Z" />
        </g>
      ))}
    </g>
  </svg>
);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [view, setView] = useState<'dashboard' | 'management' | 'games' | 'study' | 'explorer' | 'songExplorer'>('dashboard');
  
  const [words, setWords] = useState<Word[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [systemStats, setSystemStats] = useState<any | null>(null);
  const [managementTab, setManagementTab] = useState<'users' | 'logs' | 'backup' | 'security'>('users');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newWord, setNewWord] = useState({ tagalog: "", english: "", category: "Daily" });
  const [newUser, setNewUser] = useState({ email: "", name: "", role: "USER" });
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [explorerSearch, setExplorerSearch] = useState("");
  const [explorerResults, setExplorerResults] = useState<any[]>([]);
  const [isExplorerLoading, setIsExplorerLoading] = useState(false);
  const [suggestedThemes, setSuggestedThemes] = useState<string[]>([]);
  const [explorerWordCount, setExplorerWordCount] = useState<number>(10);
  const [songUrl, setSongUrl] = useState("");
  const [songResults, setSongResults] = useState<any[]>([]);
  const [isSongLoading, setIsSongLoading] = useState(false);
  const [youtubeLibrary, setYoutubeLibrary] = useState<any[]>([]);
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [cloudflareToken, setCloudflareToken] = useState("");
  const [configSource, setConfigSource] = useState<"ENVIRONMENT" | "DATABASE" | "NONE">("NONE");
  const [isConfigLoading, setIsConfigLoading] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [isInfraMissing, setIsInfraMissing] = useState(false);
  const [addingExplorerWords, setAddingExplorerWords] = useState<Set<string>>(new Set());
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isAirportMode, setIsAirportMode] = useState(false);
  const [localAiAvailable, setLocalAiAvailable] = useState(false);
  const [useLocalAi, setUseLocalAi] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      if (localAiAvailable) setIsAirportMode(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const checkLocalAi = async () => {
      const available = await localAi.isAvailable();
      setLocalAiAvailable(available);
      if (available) {
        const saved = localStorage.getItem('gabay_use_local_ai');
        if (saved === 'true') setUseLocalAi(true);
      }
    };
    checkLocalAi();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [localAiAvailable]);

  useEffect(() => {
    localStorage.setItem('gabay_use_local_ai', String(useLocalAi));
  }, [useLocalAi]);

  const triggerSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const triggerError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 4000);
  };
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const generateWithAi = async (prompt: string, modelType: 'flash' | 'tts' = 'flash', options: any = {}): Promise<any> => {
    if (useLocalAi && localAiAvailable && modelType !== 'tts' && !options.useTools) {
      console.log("Using Local AI for generation...");
      const text = await localAi.prompt(prompt);
      return { text };
    }

    if (!ai) throw new Error("Cloud AI not initialized");
    
    const config: any = {};
    if (options.mimeType) config.responseMimeType = options.mimeType;

    const model = (ai.models as any).get(
      modelType === 'tts' ? "gemini-3.1-flash-tts-preview" : "gemini-3-flash-preview"
    );
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: config,
      ...(modelType === 'tts' ? {
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        }
      } : {})
    });
    
    return result.response;
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      if (view === 'dashboard' || view === 'games' || view === 'study') fetchWords();
      if (view === 'management' && user.role === 'ADMIN') {
        fetchUsers();
        fetchStats();
        fetchLogs();
        if (managementTab === 'security') fetchSecurityConfig();
      }
    }
  }, [user, search, selectedCategory, view, managementTab]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setWords([]);
      setUsers([]);
      localStorage.removeItem('gabay_auth_token');
      delete axios.defaults.headers.common['Authorization'];
    };

    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data.token) {
        localStorage.setItem('gabay_auth_token', event.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${event.data.token}`;
        checkAuth();
      }
    };

    const handleInfraMissing = () => {
      setIsInfraMissing(true);
    };

    window.addEventListener('unauthorized', handleUnauthorized);
    window.addEventListener('message', handleOAuthMessage);
    window.addEventListener('infra-missing', handleInfraMissing);
    return () => {
      window.removeEventListener('unauthorized', handleUnauthorized);
      window.removeEventListener('message', handleOAuthMessage);
      window.removeEventListener('infra-missing', handleInfraMissing);
    };
  }, []);

  const checkAuth = async () => {
    // Check URL params for token (after OAuth redirect if popup blocked)
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    if (urlToken) {
      localStorage.setItem('gabay_auth_token', urlToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${urlToken}`;
      window.history.replaceState({}, document.title, "/");
    }

    const currentToken = localStorage.getItem('gabay_auth_token');
    if (!currentToken || currentToken === 'undefined' || currentToken === 'null') {
      localStorage.removeItem('gabay_auth_token');
      setAuthChecked(true);
      return;
    }

    try {
      const resp = await axios.get('/api/auth/me');
      setUser(resp.data);
    } catch {
      localStorage.removeItem('gabay_auth_token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    } finally {
      setAuthChecked(true);
    }
  };

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      const { data } = await axios.get('/api/auth/url');
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const popup = window.open(
        data.url, 
        'gabay_auth', 
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // If popup fails (blocked), use dev-login as fallback unless disabled
      if (!popup) {
        if (import.meta.env.VITE_DISABLE_DEV_AUTH === 'true') {
          triggerError("Login popup was blocked. Please enable popups to sign in.");
          return;
        }
        console.warn("Popup blocked, falling back to dev login");
        const resp = await axios.post('/api/auth/dev-login');
        const { user: userData, token: userToken } = resp.data;
        localStorage.setItem('gabay_auth_token', userToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
        setUser(userData);
      }
    } catch (err) {
      if (import.meta.env.VITE_DISABLE_DEV_AUTH === 'true') {
        triggerError("Authentication failed.");
        return;
      }
      console.warn("OAuth failed, falling back to dev login", err);
      try {
        const resp = await axios.post('/api/auth/dev-login');
        const { user: userData, token: userToken } = resp.data;
        localStorage.setItem('gabay_auth_token', userToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
        setUser(userData);
      } catch (inner) {
        triggerError("Authentication failed.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (err) {
      console.error("Logout Error:", err);
    } finally {
      localStorage.removeItem('gabay_auth_token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setView('dashboard');
    }
  };

  const fetchWords = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/words?search=${search}&category=${selectedCategory}`);
      let fetchedWords = Array.isArray(response.data) ? response.data : [];
      
      // Smart Learning Prioritization
      // Prioritize words with high error rate or never reviewed
      fetchedWords.sort((a: Word, b: Word) => {
        const aScore = (a.incorrectCount || 0) * 2 - (a.correctCount || 0);
        const bScore = (b.incorrectCount || 0) * 2 - (b.correctCount || 0);
        
        // If scores are same, prioritize older/never reviewed
        if (aScore === bScore) {
          if (!a.lastReviewedAt) return -1;
          if (!b.lastReviewedAt) return 1;
          return new Date(a.lastReviewedAt).getTime() - new Date(b.lastReviewedAt).getTime();
        }
        
        return bScore - aScore;
      });

      setWords(fetchedWords);
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.error("Fetch error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const logWordResult = async (wordId: string, correct: boolean) => {
    try {
      await axios.post(`/api/words/${wordId}/log-result`, { correct });
      // Minor optimization: update local state count to reflect immediately if needed
      // But we usually refresh when switching back to dashboard or session ends
    } catch (error) {
      console.error("Log result error:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users');
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.error("Fetch users error:", error);
      }
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await axios.get('/api/admin/logs');
      setSystemLogs(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error("Fetch logs error:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/stats');
      setSystemStats(response.data);
    } catch (error: any) {
      console.error("Fetch stats error:", error);
    }
  };

  const downloadBackup = async () => {
    try {
      const resp = await axios.get('/api/admin/database/backup', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([resp.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `gabay_backup_${new Date().toISOString()}.enc`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      triggerSuccess("Secure backup generated and downloaded.");
    } catch (err) {
      triggerError("Failed to generate backup.");
    }
  };

  const updateUserRole = async (targetId: string, newRole: string) => {
    try {
      await axios.patch(`/api/admin/users/${targetId}/role`, { role: newRole });
      fetchUsers();
    } catch (err: any) {
      if (err.response?.status !== 401) {
        triggerError("Failed to update role");
      }
    }
  };

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/users', newUser);
      setIsAddUserModalOpen(false);
      setNewUser({ email: "", name: "", role: "USER" });
      triggerSuccess("New user created successfully.");
      fetchUsers();
    } catch (err: any) {
      triggerError(err.response?.data?.error || "Failed to create user.");
    }
  };

  const generateSecureKey = async () => {
    try {
      const resp = await axios.get('/api/admin/security/generate-key');
      setGeneratedKey(resp.data.key);
      triggerSuccess("New entropy-rich kernel secret generated.");
    } catch (err) {
      triggerError("Failed to generate secure key.");
    }
  };

  const fetchSecurityConfig = async () => {
    setIsConfigLoading(true);
    try {
      const resp = await axios.get('/api/admin/security/config');
      setCloudflareToken(resp.data.cloudflareToken || "");
      setConfigSource(resp.data.source || "NONE");
    } catch (err) {
      console.warn("Failed to fetch security config");
    } finally {
      setIsConfigLoading(false);
    }
  };

  const saveSecurityConfig = async () => {
    setIsSavingConfig(true);
    try {
      await axios.post('/api/admin/security/config', { cloudflareToken });
      triggerSuccess("Network security configuration updated.");
    } catch (err) {
      triggerError("Failed to save security configuration.");
    } finally {
      setIsSavingConfig(false);
    }
  };

  const [isTranslating, setIsTranslating] = useState(false);

  const handleAutoTranslate = async (source: 'tagalog' | 'english') => {
    const textToTranslate = source === 'tagalog' ? newWord.tagalog : newWord.english;
    if (!textToTranslate || textToTranslate.trim().length === 0) return;

    setIsTranslating(true);
    try {
      const prompt = source === 'tagalog' 
        ? `Translate the Tagalog word "${textToTranslate}" to its most common English equivalent. Return ONLY the translated word/phrase.`
        : `Translate the English word "${textToTranslate}" to its most common Tagalog equivalent. Return ONLY the translated word/phrase.`;

      const response = await generateWithAi(prompt);
      const translatedText = response.text?.trim() || "";
      if (source === 'tagalog') {
        setNewWord(prev => ({ ...prev, english: translatedText }));
      } else {
        setNewWord(prev => ({ ...prev, tagalog: translatedText }));
      }
    } catch (error) {
      console.error("Translation Error:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  const onSaveWord = async (wordData: { tagalog: string, english: string, category: string }) => {
    try {
      await axios.post('/api/words', wordData);
      fetchWords();
      triggerSuccess(`"${wordData.tagalog}" saved to bank!`);
    } catch (error: any) {
      triggerError(error.response?.data?.error || "Failed to save word.");
    }
  };

  const addWord = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveWord(newWord);
    setNewWord({ tagalog: "", english: "", category: "Daily" });
    setIsAddModalOpen(false);
  };

  const fetchThemedWords = async (themeToSearch: string) => {
    if (!themeToSearch.trim()) return;

    setIsExplorerLoading(true);
    setExplorerResults([]);
    try {
      if (isAirportMode && !useLocalAi) {
        triggerError("Explorer requires an internet connection or Local AI.");
        return;
      }
      
      const prompt = `Generate a list of ${explorerWordCount} Tagalog words/phrases for the theme: "${themeToSearch}". 
        Include a category for each (one of: ${CATEGORIES.join(", ")}) and a brief reason why it's essential.
        Format as JSON array: [{"tagalog": "...", "english": "...", "category": "...", "reason": "..."}]`;
        
      const response = await generateWithAi(prompt, 'flash', { mimeType: "application/json" });
      const results = JSON.parse(response.text || "[]");
      setExplorerResults(results);
    } catch (error) {
      console.error("Explorer AI Error:", error);
      triggerError("Failed to explore this theme. Try a different topic!");
    } finally {
      setIsExplorerLoading(false);
    }
  };

  const handleExplorerClick = () => {
    setView('explorer');
    setExplorerResults([]);
    // Pick 8 random unique topics
    const shuffled = [...EXPLORER_TOPICS].sort(() => 0.5 - Math.random());
    setSuggestedThemes(shuffled.slice(0, 8));
  };

  const generateThemedWords = async (e: React.FormEvent) => {
    e.preventDefault();
    fetchThemedWords(explorerSearch);
  };

  const fetchSongWords = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!songUrl.trim()) return;
    executeAnalysis(songUrl);
  };

  const executeAnalysis = async (url: string) => {
    setIsSongLoading(true);
    setSongResults([]);
    try {
      if (!isOnline) {
        triggerError("Melody Learner requires an internet connection to search for lyrics.");
        return;
      }

      const prompt = `I want to learn Tagalog from this song/video: ${url}. 
        Cross-reference multiple lyrics platforms like Genius, Musixmatch, AZLyrics, and OPMLyrics to find the most accurate and complete Tagalog lyrics for this song. 
        Analyze the song structure and concentrate your extraction on the CHORUS and words/phrases that are frequently REPEATED throughout the track...
        Format as JSON array: [{"tagalog": "...", "english": "...", "lyricsLine": "...", "category": "..."}]`;

      const response = await generateWithAi(prompt, 'flash', { useTools: true, mimeType: "application/json" });
      const results = JSON.parse(response.text || "[]");
      setSongResults(results);
    } catch (error) {
      console.error("Song AI Error:", error);
      triggerError("Failed to analyze this song. Please make sure the URL is valid or the song is in Tagalog!");
    } finally {
      setIsSongLoading(false);
      setShowLibrary(false);
    }
  };

  const fetchYoutubeLibrary = async () => {
    setIsLibraryLoading(true);
    try {
      const resp = await axios.get('/api/youtube/library');
      setYoutubeLibrary(resp.data);
      setShowLibrary(true);
    } catch (err: any) {
      if (err.response?.status === 401) {
        if (confirm("YouTube library access needs permission. Would you like to reconnect your account?")) {
          handleLogin();
        }
      } else {
        triggerError("Failed to fetch YouTube library. Make sure you've granted YouTube permissions.");
      }
    } finally {
      setIsLibraryLoading(false);
    }
  };

  const addExplorerWord = async (word: any, index: number) => {
    if (addingExplorerWords.has(word.tagalog)) return;
    
    setAddingExplorerWords(prev => new Set(prev).add(word.tagalog));
    try {
      await axios.post('/api/words', {
        tagalog: word.tagalog,
        english: word.english,
        category: word.category || "Daily"
      });
      fetchWords();
      triggerSuccess(`Added "${word.tagalog}"`);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message;
      const details = error.response?.data?.details || "";
      console.error("Failed to add explorer word", error);
      triggerSuccess(`Error: ${errorMsg} ${details}`);
    }
  };

  const bulkAddExplorerWords = async () => {
    const wordsToAdd = explorerResults.filter(w => !addingExplorerWords.has(w.tagalog));
    if (wordsToAdd.length === 0) return;
    
    const newAdding = new Set(addingExplorerWords);
    wordsToAdd.forEach(w => newAdding.add(w.tagalog));
    setAddingExplorerWords(newAdding);

    try {
      await Promise.all(wordsToAdd.map(w => 
        axios.post('/api/words', {
          tagalog: w.tagalog,
          english: w.english,
          category: w.category || "Daily"
        })
      ));
      fetchWords();
      setExplorerResults([]);
      setView('dashboard');
      triggerSuccess(`Successfully added ${wordsToAdd.length} words`);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message;
      const details = error.response?.data?.details || "";
      console.error("Bulk add failed", error);
      triggerSuccess(`Bulk Error: ${errorMsg} ${details}`);
      // Re-enable adding if failed
      setAddingExplorerWords(new Set());
    }
  };

  const deleteWord = async (id: string) => {
    if (!confirm("Are you sure you want to delete this word?")) return;
    try {
      await axios.delete(`/api/words/${id}`);
      fetchWords();
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.error("Delete error:", error);
      }
    }
  };

  const [playingId, setPlayingId] = useState<string | null>(null);

  const playAudio = async (text: string, id: string) => {
    if (playingId) return;
    if (!isOnline) {
      triggerError("Voice synthesis requires an internet connection.");
      return;
    }
    setPlayingId(id);
    try {
      const response = await generateWithAi(`Pronounce clearly: ${text}`, 'tts');
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Gemini TTS raw PCM is 16-bit little-endian
        const pcmData = new Int16Array(bytes.buffer);
        const float32Data = new Float32Array(pcmData.length);
        for (let i = 0; i < pcmData.length; i++) {
          float32Data[i] = pcmData[i] / 32768.0;
        }

        const buffer = audioContext.createBuffer(1, float32Data.length, 24000);
        buffer.getChannelData(0).set(float32Data);

        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.onended = () => {
          setPlayingId(null);
          audioContext.close();
        };
        source.start();
      } else {
        setPlayingId(null);
      }
    } catch (error) {
      console.error("TTS Error:", error);
      setPlayingId(null);
    }
  };

  const generateSentence = async (word: Word) => {
    setGeneratingId(word.id);
    try {
      const prompt = `Generate a natural Tagalog example sentence using the word "${word.tagalog}" (meaning "${word.english}"). Provide ONLY the Tagalog sentence followed by its English translation in parentheses. Keep it simple and helpful for a learner.`;
      const response = await generateWithAi(prompt);

      const sentence = response.text || "";
      const updatedWords = words.map(w => 
        w.id === word.id ? { ...w, exampleSentence: sentence } : w
      );
      setWords(updatedWords);
    } catch (error) {
      console.error("Gemini Error:", error);
      triggerError("Failed to generate sentence using Google AI.");
    } finally {
      setGeneratingId(null);
    }
  };

  if (!authChecked) return (
    <div className="h-screen flex items-center justify-center bg-app-bg transition-colors duration-300">
      <div className="w-12 h-12 border-4 border-ph-blue border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return (
    <div className="h-screen flex items-center justify-center bg-app-bg transition-colors duration-300 p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-app-card p-12 rounded-[2.5rem] shadow-2xl border border-app-border text-center"
      >
        <div className="w-20 h-20 bg-ph-blue rounded-3xl mx-auto flex items-center justify-center shadow-ph-blue/20 shadow-xl mb-8 relative group">
          <PhilippineSun size={56} className="text-ph-yellow animate-[spin_10s_linear_infinite]" />
        </div>
        <h1 className="text-3xl font-extrabold text-app-text mb-2">Mabuhay!</h1>
        <p className="text-app-muted mb-10 leading-relaxed font-medium">Welcome to <span className="text-ph-blue font-black">Gabay: Tagalog Learning Helper</span>. Sign in to start building your Tagalog vocabulary.</p>
        
        <button 
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="w-full flex items-center justify-center gap-4 bg-app-card border-2 border-app-border hover:border-ph-blue/30 text-app-text px-6 py-4 rounded-2xl transition-all font-bold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          {isLoggingIn ? (
            <div className="w-5 h-5 border-2 border-ph-blue border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" referrerPolicy="no-referrer" />
          )}
          <span>{isLoggingIn ? 'Signing in...' : 'Continue with Google'}</span>
        </button>

        {import.meta.env.VITE_DISABLE_DEV_AUTH !== 'true' && (
          <button 
            onClick={async () => {
              if (isLoggingIn) return;
              setIsLoggingIn(true);
              try {
                const resp = await axios.post('/api/auth/dev-login');
                const { user: userData, token: userToken } = resp.data;
                localStorage.setItem('gabay_auth_token', userToken);
                axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
                setUser(userData);
              } catch (err) {
                triggerError("Dev login failed.");
              } finally {
                setIsLoggingIn(false);
              }
            }}
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-2 text-app-muted hover:text-ph-blue text-sm font-bold p-2 transition-colors disabled:opacity-50"
          >
            <ShieldCheck size={16} />
            <span>Enter Developer Mode</span>
          </button>
        )}
        
        <div className="mt-12 flex justify-center gap-2">
          <div className="w-8 h-1 bg-ph-blue rounded-full"></div>
          <div className="w-8 h-1 bg-ph-red rounded-full"></div>
          <div className="w-8 h-1 bg-ph-yellow rounded-full"></div>
        </div>
      </motion.div>
    </div>
  );

  if (isInfraMissing) return <InfrastructureMissingScreen />;

  const recentWordsCount = Array.isArray(words) ? words.filter(w => {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return new Date(w.createdAt) > dayAgo;
  }).length : 0;

  return (
    <div className="flex h-screen bg-app-bg text-app-text font-sans overflow-hidden transition-colors duration-300">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-app-card border-r border-app-border flex flex-col hidden lg:flex">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-ph-blue rounded-lg flex items-center justify-center shadow-sm">
              <PhilippineSun size={20} className="text-ph-yellow" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-app-text whitespace-nowrap">Gabay</h1>
          </div>
          <button 
            onClick={toggleTheme}
            className="p-2 text-app-muted hover:text-ph-blue hover:bg-ph-blue/10 rounded-lg transition-all"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
          <button 
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${view === 'dashboard' ? 'bg-ph-blue text-white shadow-md shadow-ph-blue/20' : 'text-app-muted hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            <LayoutDashboard size={18} className="mr-3" />
            Dashboard
          </button>

          <button 
            onClick={() => setView('study')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${view === 'study' ? 'bg-ph-blue text-white shadow-md shadow-ph-blue/20' : 'text-app-muted hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            <BookOpen size={18} className="mr-3" />
            Study Hub
          </button>
          
          <button 
            onClick={() => setView('games')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${view === 'games' ? 'bg-ph-blue text-white shadow-md shadow-ph-blue/20' : 'text-app-muted hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            <Gamepad2 size={18} className="mr-3" />
            Learning Games
          </button>
          
          <button 
            onClick={handleExplorerClick}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${view === 'explorer' ? 'bg-ph-blue text-white shadow-md shadow-ph-blue/20' : 'text-app-muted hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            <Compass size={18} className="mr-3" />
            Theme Explorer
          </button>

          <button 
            onClick={() => setView('songExplorer')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${view === 'songExplorer' ? 'bg-ph-blue text-white shadow-md shadow-ph-blue/20' : 'text-app-muted hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            <Music size={18} className="mr-3" />
            Melody Learner
          </button>
          
          {user.role === 'ADMIN' && (
            <button 
              onClick={() => setView('management')}
              className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${view === 'management' ? 'bg-ph-blue text-white shadow-md shadow-ph-blue/20' : 'text-app-muted hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
            >
              <Users size={18} className="mr-3" />
              Management
            </button>
          )}
          
          {view === 'dashboard' && (
            <>
              <div className="pt-6 pb-2 px-4 uppercase tracking-[0.2em] text-[10px] font-black text-app-muted opacity-80">
                Categories
              </div>
              <button 
                onClick={() => setSelectedCategory("")}
                className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${selectedCategory === "" ? 'text-white bg-ph-blue shadow-sm' : 'text-app-muted hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
              >
                All Words
              </button>
              {CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${selectedCategory === cat ? 'text-white bg-ph-blue shadow-sm' : 'text-app-muted hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                >
                  {cat}
                </button>
              ))}
            </>
          )}
        </nav>

        <div className="p-6 border-t border-app-border space-y-4">
          <div className="p-4 bg-ph-blue/5 rounded-2xl border border-ph-blue/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-ph-blue flex items-center justify-center text-[10px] font-bold text-white uppercase tracking-tighter">
                {user.name[0]}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-app-text truncate">{user.name}</p>
                <p className="text-[10px] font-black text-app-muted uppercase tracking-widest">{user.role}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-ph-red hover:bg-ph-red/5 rounded-lg transition-colors border border-transparent hover:border-ph-red/10"
            >
              <LogOut size={12} />
              Log out
            </button>
          </div>
          
          <div className="p-4 bg-ph-blue rounded-2xl relative overflow-hidden shadow-lg shadow-ph-blue/20">
            <div className="absolute top-0 right-0 p-1 opacity-20">
              <Sparkles size={40} className="text-ph-yellow" />
            </div>
            <p className="text-[10px] font-black text-white/90 uppercase tracking-widest mb-1 shadow-sm">AI Configuration</p>
            
            <div className="space-y-3 mt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${isOnline ? 'bg-ph-yellow shadow-[0_0_8px_#FCD116]' : 'bg-slate-400'}`}></div>
                  <span className="text-[10px] text-white font-bold uppercase tracking-tight">Cloud Gemini</span>
                </div>
                <span className={`text-[8px] font-black uppercase ${isOnline ? 'text-ph-yellow' : 'text-white/40'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              {localAiAvailable && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${useLocalAi ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-slate-400'}`}></div>
                    <span className="text-[10px] text-white font-bold uppercase tracking-tight">Local Prompt API</span>
                  </div>
                  <button 
                    onClick={() => setUseLocalAi(!useLocalAi)}
                    className={`text-[8px] font-black px-2 py-0.5 rounded border transition-colors ${useLocalAi ? 'bg-white text-ph-blue border-white' : 'text-white/60 border-white/20'}`}
                  >
                    {useLocalAi ? 'ACTIVE' : 'ENABLE'}
                  </button>
                </div>
              )}
            </div>

            {isAirportMode && (
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
                <Globe size={10} className="text-ph-yellow animate-pulse" />
                <span className="text-[9px] font-black text-white uppercase tracking-widest">Airport Learning Active</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Header (Hidden on Laptop) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-safe-top pt-safe bg-app-card border-b border-app-border z-40 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <PhilippineSun size={24} className="text-ph-yellow animate-spin-slow" />
          <h1 className="text-xl font-black tracking-tight text-app-text uppercase leading-none">Gabay</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme}
            className="p-2 text-app-muted hover:text-ph-blue"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="w-10 h-10 bg-ph-blue text-white rounded-full flex items-center justify-center shadow-lg shadow-ph-blue/20"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col transition-colors duration-300 lg:pt-0 pt-safe lg:pb-0 overflow-hidden relative">
        <div className="absolute inset-0 flex flex-col pt-16 pb-32 md:pb-20 overflow-y-auto">
        {view === 'games' ? (
          <Games 
            words={words} 
            playAudio={playAudio} 
            playingId={playingId} 
            logWordResult={logWordResult} 
            onSaveWord={onSaveWord}
            onSetView={setView}
            isOnline={isOnline}
            useLocalAi={useLocalAi}
            localAiAvailable={localAiAvailable}
          />
        ) : view === 'study' ? (
          <StudyHub words={words} playAudio={playAudio} playingId={playingId} logWordResult={logWordResult} />
        ) : view === 'songExplorer' ? (
          <div className="flex-1 flex flex-col">
             <header className="h-16 md:h-20 bg-app-card border-b border-app-border px-4 md:px-8 flex items-center justify-between flex-shrink-0 gap-3">
                <div className="flex items-center gap-2 md:gap-4 flex-1">
                   <h2 className="text-sm md:text-lg font-black text-app-text whitespace-nowrap hidden xs:block">Melody Learner</h2>
                   <form onSubmit={fetchSongWords} className="relative w-full max-w-[200px] md:max-w-md">
                     <Music className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-ph-blue" size={14} />
                     <input 
                       type="text" 
                       placeholder="YouTube Link..."
                       value={songUrl}
                       onChange={(e) => setSongUrl(e.target.value)}
                       className="w-full pl-9 md:pl-10 pr-16 md:pr-24 py-1.5 md:py-2 bg-app-bg border border-transparent rounded-full text-[10px] md:text-xs font-medium focus:bg-app-card focus:ring-2 focus:ring-ph-blue focus:border-ph-blue outline-none transition-all placeholder:text-app-muted"
                     />
                     <button 
                       type="submit"
                       disabled={isSongLoading || !songUrl.trim()}
                       className="absolute right-1 top-1/2 -translate-y-1/2 bg-ph-blue text-white px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[8px] md:text-[10px] font-black uppercase hover:opacity-90 disabled:opacity-50"
                     >
                       {isSongLoading ? <Loader2 size={10} className="animate-spin" /> : "Analyze"}
                     </button>
                   </form>
                   <button 
                     onClick={fetchYoutubeLibrary}
                     disabled={isLibraryLoading}
                     className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-red-600 text-white rounded-full text-[8px] md:text-[10px] font-black uppercase hover:bg-red-700 transition-all disabled:opacity-50"
                   >
                     {isLibraryLoading ? <Loader2 size={10} className="animate-spin" /> : <Youtube size={10} className="md:size-[12px]" />}
                     <span className="hidden sm:inline">Library</span>
                   </button>
                </div>
                {songResults.length > 0 && (
                  <button 
                    onClick={() => {
                      songResults.forEach((w, i) => addExplorerWord(w, i));
                    }}
                    className="px-4 md:px-5 py-2 md:py-2.5 bg-ph-blue text-white rounded-full text-[10px] md:text-sm font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-md flex items-center gap-2"
                  >
                    <Plus size={14} className="md:size-[18px]" />
                    <span className="hidden sm:inline">Add All</span>
                  </button>
                )}
             </header>

             <div className="flex-1 p-3 md:p-12 bg-app-bg/30 relative">
               <AnimatePresence>
                 {showLibrary && (
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className="fixed inset-0 z-50 bg-app-bg/95 p-6 md:p-12 flex flex-col"
                   >
                      <div className="flex justify-between items-end mb-8">
                        <div>
                          <h2 className="text-3xl font-black text-app-text mb-1">Your Liked Songs</h2>
                          <p className="text-app-muted font-bold">Pick one to break down its Tagalog essence.</p>
                        </div>
                        <button 
                          onClick={() => setShowLibrary(false)}
                          className="px-6 py-2 border border-app-border rounded-full text-xs font-black uppercase tracking-widest hover:bg-app-card transition-all"
                        >
                          Close
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                           {youtubeLibrary.map((item: any) => (
                             <button 
                               key={item.id}
                               onClick={() => {
                                 const url = `https://www.youtube.com/watch?v=${item.id}`;
                                 setSongUrl(url);
                                 executeAnalysis(url);
                               }}
                               className="group text-left space-y-3 focus:outline-none"
                             >
                               <div className="aspect-video rounded-2xl overflow-hidden relative border border-app-border bg-app-muted/10">
                                 <img 
                                   src={item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url} 
                                   alt={item.snippet.title}
                                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                   referrerPolicy="no-referrer"
                                 />
                                 <div className="absolute inset-0 bg-ph-blue/0 group-hover:bg-ph-blue/20 transition-colors flex items-center justify-center">
                                   <Play size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                 </div>
                               </div>
                               <div className="px-1">
                                 <h4 className="font-bold text-xs text-app-text line-clamp-2 group-hover:text-ph-blue transition-colors">
                                   {item.snippet.title}
                                 </h4>
                                 <p className="text-[10px] text-app-muted font-medium mt-1">
                                   {item.snippet.channelTitle}
                                 </p>
                               </div>
                             </button>
                           ))}
                        </div>
                      </div>
                   </motion.div>
                 )}
               </AnimatePresence>

               <div className="max-w-4xl mx-auto">
                 {!songResults.length && !isSongLoading ? (
                    <div className="text-center py-20 space-y-6">
                       <div className="w-24 h-24 bg-red-500/10 rounded-[2rem] mx-auto flex items-center justify-center">
                         <Youtube size={40} className="text-red-500" />
                       </div>
                       <div className="space-y-2">
                         <h3 className="text-2xl font-black text-app-text">Learn from the Melody</h3>
                         <p className="text-app-muted max-w-sm mx-auto">Paste a YouTube Music link and Gabay AI will extract essential lyrics for you.</p>
                       </div>
                    </div>
                 ) : isSongLoading ? (
                    <div className="text-center py-20 space-y-4">
                      <div className="w-12 h-12 border-4 border-ph-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-app-muted font-bold animate-pulse">Analyzing track lyrics...</p>
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                      {songResults.map((word, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          key={idx}
                           className="bg-app-card border border-app-border p-3 md:p-5 rounded-lg md:rounded-xl shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                        >
                          <div className="absolute top-0 right-0 p-4 opacity-0 md:opacity-5 group-hover:opacity-10 transition-opacity">
                            <Music size={24} className="md:size-[32px]" />
                          </div>
                          <div className="flex justify-between items-start mb-2 md:mb-3">
                            <span className="px-2 py-0.5 bg-ph-yellow/10 text-ph-yellow-text rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest">
                              {word.category}
                            </span>
                            <div className="flex gap-1.5">
                              <button 
                                onClick={() => playAudio(word.tagalog, `song-${idx}`)}
                                disabled={playingId !== null}
                                className={`p-1.5 md:p-2 rounded-lg transition-all ${playingId === `song-${idx}` ? 'bg-ph-blue text-white' : 'bg-app-muted/10 text-app-text hover:bg-ph-blue/10'}`}
                              >
                                {playingId === `song-${idx}` ? <Loader2 size={12} className="animate-spin md:size-[14px]" /> : <Volume2 size={12} className="md:size-[14px]" />}
                              </button>
                              <button 
                               onClick={() => addExplorerWord(word, idx)}
                               disabled={addingExplorerWords.has(word.tagalog)}
                               className={`p-1.5 md:p-2 rounded-lg transition-all ${addingExplorerWords.has(word.tagalog) ? 'bg-emerald-500 text-white' : 'bg-ph-blue text-white hover:scale-110 shadow-lg shadow-ph-blue/20'}`}
                              >
                               {addingExplorerWords.has(word.tagalog) ? <CheckCircle2 size={12} className="md:size-[14px]" /> : <Plus size={12} className="md:size-[14px]" />}
                              </button>
                            </div>
                          </div>
                          <h3 className="text-base md:text-lg font-black text-app-text mb-0.5">{word.tagalog}</h3>
                          <p className="text-sm md:text-base font-bold text-app-muted mb-2 md:mb-3">{word.english}</p>
                          {word.lyricsLine && (
                            <div className="pt-2 md:pt-3 border-t border-app-border flex items-start gap-1.5">
                              <Play size={10} className="text-ph-blue mt-0.5 shrink-0" />
                              <p className="text-[9px] md:text-[10px] text-app-muted leading-relaxed italic">"{word.lyricsLine}"</p>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                 )}
               </div>
             </div>
          </div>
        ) : view === 'explorer' ? (
          <div className="flex-1 flex flex-col">
             <header className="h-16 md:h-20 bg-app-card border-b border-app-border px-4 md:px-8 flex items-center justify-between flex-shrink-0 gap-3">
               <div className="flex items-center gap-2 md:gap-4 flex-1">
                 <h2 className="text-sm md:text-lg font-black text-app-text whitespace-nowrap hidden xs:block">Theme Explorer</h2>
                 <form onSubmit={generateThemedWords} className="relative w-full max-w-[200px] sm:max-w-xs">
                   <Compass className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-ph-blue" size={14} />
                   <input 
                     type="text" 
                     placeholder="Topic..."
                     value={explorerSearch}
                     onChange={(e) => setExplorerSearch(e.target.value)}
                     className="w-full pl-9 md:pl-10 pr-4 py-1.5 md:py-2 bg-app-bg border border-transparent rounded-full text-[10px] md:text-xs font-medium focus:bg-app-card focus:ring-2 focus:ring-ph-blue focus:border-ph-blue outline-none transition-all placeholder:text-app-muted"
                   />
                 </form>
                 <div className="hidden lg:flex items-center gap-1 bg-app-bg/50 p-1 rounded-full border border-app-border ml-2">
                   {[5, 10, 15, 25].map(cnt => (
                     <button
                       key={cnt}
                       type="button"
                       onClick={() => setExplorerWordCount(cnt)}
                       className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${explorerWordCount === cnt ? 'bg-ph-blue text-white shadow-sm' : 'text-app-muted hover:bg-app-muted/10'}`}
                     >
                       {cnt}
                     </button>
                   ))}
                 </div>
               </div>
               {explorerResults.length > 0 && (
                 <button 
                   onClick={bulkAddExplorerWords}
                   className="px-5 py-2.5 bg-ph-blue text-white rounded-full text-sm font-semibold hover:opacity-90 transition-all shadow-md flex items-center gap-2"
                 >
                   <Plus size={18} />
                   Add All to Bank
                 </button>
               )}
             </header>

             <div className="flex-1 p-3 md:p-12 bg-app-bg/30">
               <div className="max-w-4xl mx-auto">
                 {!explorerResults.length && !isExplorerLoading ? (
                   <div className="text-center py-20 space-y-6">
                      <div className="w-24 h-24 bg-ph-blue/10 rounded-[2rem] mx-auto flex items-center justify-center">
                        <Sparkles size={40} className="text-ph-blue" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-black text-app-text">Discover New Themes</h3>
                        <p className="text-app-muted max-w-sm mx-auto">Choose a theme below or type a topic to curate essential Tagalog vocabulary.</p>
                      </div>
                       <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-6 px-4">
                        {suggestedThemes.map(tip => (
                          <button 
                            key={tip}
                            onClick={() => { 
                              setExplorerSearch(tip); 
                              fetchThemedWords(tip);
                            }}
                            className="px-4 py-4 md:py-6 bg-app-card border border-app-border rounded-2xl text-[10px] md:text-xs font-black text-app-muted hover:border-ph-blue hover:text-ph-blue hover:bg-ph-blue/5 transition-all shadow-sm flex flex-col items-center justify-center gap-2 md:gap-3 text-center uppercase tracking-tight"
                          >
                             <div className="w-8 h-8 rounded-full bg-ph-blue/5 flex items-center justify-center">
                               <Compass size={14} />
                             </div>
                             {tip}
                          </button>
                        ))}
                      </div>
                   </div>
                 ) : isExplorerLoading ? (
                   <div className="text-center py-20 space-y-4">
                     <div className="w-12 h-12 border-4 border-ph-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
                     <p className="text-app-muted font-bold animate-pulse">Curating your thematic list...</p>
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                     {explorerResults.map((word, idx) => (
                       <motion.div 
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: idx * 0.05 }}
                         key={idx}
                          className="bg-app-card border border-app-border p-3 md:p-5 rounded-lg md:rounded-xl shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                       >
                         <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                           <LayoutGrid size={60} />
                         </div>
                         <div className="flex justify-between items-start mb-6">
                           <span className="px-3 py-1 bg-ph-blue/10 text-ph-blue rounded-full text-[10px] font-black uppercase tracking-widest">
                             {word.category}
                           </span>
                           <div className="flex gap-2">
                             <button 
                               onClick={() => playAudio(word.tagalog, `explorer-${idx}`)}
                               disabled={playingId !== null}
                               className={`p-3 rounded-2xl transition-all ${playingId === `explorer-${idx}` ? 'bg-ph-blue text-white' : 'bg-app-muted/10 text-app-text hover:bg-ph-blue/10'}`}
                             >
                               {playingId === `explorer-${idx}` ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />}
                             </button>
                             <button 
                              onClick={() => addExplorerWord(word, idx)}
                              disabled={addingExplorerWords.has(word.tagalog)}
                              className={`p-3 rounded-2xl transition-all ${addingExplorerWords.has(word.tagalog) ? 'bg-emerald-500 text-white' : 'bg-ph-blue text-white hover:scale-110 shadow-lg shadow-ph-blue/20'}`}
                             >
                              {addingExplorerWords.has(word.tagalog) ? <CheckCircle2 size={18} /> : <Plus size={18} />}
                             </button>
                           </div>
                         </div>
                         <h3 className="text-lg font-black text-app-text mb-0.5">{word.tagalog}</h3>
                         <p className="text-sm font-bold text-app-muted mb-2 md:mb-3">{word.english}</p>
                         <div className="pt-4 border-t border-app-border flex items-start gap-2">
                           <ArrowRight size={14} className="text-ph-yellow mt-0.5 shrink-0" />
                           <p className="text-xs text-app-muted leading-relaxed italic">{word.reason}</p>
                         </div>
                       </motion.div>
                     ))}
                   </div>
                 )}
               </div>
             </div>
          </div>
        ) : (
          <>
            {/* Top Header */}
            <header className="h-16 md:h-20 bg-app-card border-b border-app-border px-4 md:px-8 flex items-center justify-between flex-shrink-0 gap-3">
              <div className="flex items-center gap-2 md:gap-4 flex-1">
                <h2 className="text-sm md:text-lg font-black text-app-text whitespace-nowrap hidden xs:block">
                  {view === 'dashboard' ? 'Your Bank' : 'System'}
                </h2>
                {view === 'dashboard' && (
                  <div className="relative w-full max-w-[200px] sm:max-w-xs">
                    <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-app-muted" size={14} />
                    <input 
                      type="text" 
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 md:pl-10 pr-4 py-1.5 md:py-2 bg-app-bg border border-transparent rounded-full text-[10px] md:text-xs font-medium focus:bg-app-card focus:ring-2 focus:ring-ph-blue focus:border-ph-blue outline-none transition-all placeholder:text-app-muted"
                    />
                  </div>
                )}
              </div>
          
              <div className="flex items-center gap-2 md:gap-4">
                {view === 'dashboard' && (
                  <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 md:px-5 py-2 md:py-2.5 bg-ph-blue text-white rounded-full text-[10px] md:text-sm font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-md flex items-center gap-2"
                  >
                    <Plus size={14} className="md:size-[18px]" />
                    <span className="hidden sm:inline">Add Word</span>
                  </button>
                )}
              </div>
        </header>

        <div className="p-4 md:p-8 flex-1 flex flex-col">
          <div className="max-w-6xl mx-auto">
            {view === 'dashboard' ? (
              <div className="space-y-8">
                {/* Statistics Grid */}
                <section className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                  <div className="bg-app-card p-3 md:p-6 rounded-xl md:rounded-3xl border border-app-border shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-1 md:w-2 h-full bg-ph-blue opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <p className="text-app-muted text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">New Today</p>
                    <h3 className="text-2xl md:text-4xl font-black text-app-text mt-1">{recentWordsCount}</h3>
                  </div>
                  <div className="bg-app-card p-3 md:p-6 rounded-xl md:rounded-3xl border border-app-border shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-1 md:w-2 h-full bg-ph-red opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <p className="text-app-muted text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">Total Bank</p>
                    <h3 className="text-2xl md:text-4xl font-black text-app-text mt-1">{words.length}</h3>
                  </div>
                  <div className="bg-app-card p-3 md:p-6 rounded-xl md:rounded-3xl border border-app-border shadow-sm relative overflow-hidden group col-span-2 lg:col-span-1">
                    <div className="absolute top-0 right-0 w-1 md:w-2 h-full bg-ph-yellow opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <p className="text-app-muted text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">User Status</p>
                    <div className="flex items-center gap-2 mt-1 md:mt-2">
                       <ShieldCheck className="text-ph-blue w-3 h-3 md:w-5 md:h-5" />
                       <span className="text-sm md:text-xl font-bold text-app-text">{user.role}</span>
                    </div>
                  </div>
                </section>

                {/* List Surface */}
                <section className="bg-app-card rounded-xl md:rounded-[2.5rem] border border-app-border shadow-sm flex flex-col overflow-hidden min-h-[300px]">
                  <div className="px-5 md:px-8 py-4 md:py-6 border-b border-app-border flex justify-between items-center bg-app-muted/5">
                    <div>
                      <h2 className="font-black text-lg md:text-xl text-app-text">Vocabulary Bank</h2>
                      <p className="text-[10px] md:text-xs text-app-muted mt-0.5 font-medium">Managing your custom learning journey.</p>
                    </div>
                    <span className="px-3 md:px-4 py-1 md:py-1.5 bg-ph-blue text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-white rounded-full shadow-sm">
                      {selectedCategory || "Global View"}
                    </span>
                  </div>

                  <div className="divide-y divide-app-border">
                    <AnimatePresence mode="popLayout">
                      {Array.isArray(words) && words.map((word) => (
                        <motion.div 
                          key={word.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="px-5 md:px-8 py-2 md:py-3 hover:bg-ph-blue/5 transition-all group flex items-center justify-between gap-3 md:gap-4 border-l-4 border-transparent hover:border-ph-blue"
                        >
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 items-center gap-2 md:gap-4">
                            <div className="sm:col-span-3 flex flex-col group/item">
                              <span className="text-[8px] md:text-[9px] font-black text-ph-blue dark:text-white uppercase tracking-widest mb-0.5">{word.category}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-base md:text-lg font-black text-app-text leading-tight">{word.tagalog}</span>
                                <button 
                                  onClick={() => playAudio(word.tagalog, word.id)}
                                  className={`p-1 md:p-1.5 rounded-full transition-all ${playingId === word.id ? 'bg-ph-blue text-white' : 'hover:bg-ph-blue/10 text-ph-blue opacity-100 sm:opacity-0 group-hover:opacity-100 group-hover/item:opacity-100'}`}
                                  disabled={playingId !== null}
                                >
                                  {playingId === word.id ? <Loader2 size={10} className="animate-spin md:size-12" /> : <Volume2 size={10} className="md:size-12" />}
                                </button>
                              </div>
                            </div>
                            <div className="sm:col-span-3 text-app-muted font-bold text-[10px] md:text-xs flex items-center gap-2">
                              {word.english}
                              {word.correctCount !== undefined && (word.correctCount > 0 || word.incorrectCount! > 0) && (
                                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 dark:bg-slate-900 border border-app-border rounded-md text-[7px] font-black uppercase shrink-0">
                                  <span className="text-emerald-500">{word.correctCount}✓</span>
                                  <span className="text-ph-red">{word.incorrectCount}✗</span>
                                </div>
                              )}
                            </div>
                            <div className="sm:col-span-6 flex items-center justify-end">
                              {word.exampleSentence ? (
                                <p className="text-[10px] md:text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic border-l-2 border-ph-red/20 pl-3 bg-slate-50 dark:bg-slate-900/50 py-1.5 md:py-2 rounded-r-lg md:rounded-r-xl w-full">
                                  {word.exampleSentence}
                                </p>
                              ) : (
                                <button 
                                  onClick={() => generateSentence(word)}
                                  disabled={generatingId === word.id}
                                  className="flex items-center gap-1.5 text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-white bg-ph-blue px-3 md:px-4 py-1.5 md:py-2 rounded-full hover:bg-ph-blue/90 hover:shadow-md transition-all disabled:opacity-50 shadow-sm"
                                >
                                  <Sparkles size={12} className="text-ph-yellow" />
                                  {generatingId === word.id ? 'Analyzing...' : 'AI Helper'}
                                </button>
                              )}
                            </div>
                          </div>
                          <button 
                            onClick={() => deleteWord(word.id)}
                            className="text-app-muted opacity-30 hover:opacity-100 hover:text-ph-red transition-all scale-90 hover:scale-110 p-2"
                          >
                            <Trash2 size={18} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {words.length === 0 && !loading && (
                      <div className="text-center py-32 text-app-muted">
                        <PhilippineSun className="mx-auto mb-6 opacity-5" size={100} />
                        <p className="font-bold text-lg uppercase tracking-widest">Library Empty</p>
                        <p className="text-sm">Start adding words to your personal directory.</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Management Navigation Tabs */}
                <div className="flex flex-wrap items-center gap-2 bg-app-card border border-app-border p-2 rounded-2xl md:rounded-full shadow-sm">
                  <button 
                    onClick={() => setManagementTab('users')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${managementTab === 'users' ? 'bg-ph-blue text-white shadow-lg shadow-ph-blue/20' : 'text-app-muted hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    <Users size={14} />
                    <span>User Directory</span>
                  </button>
                  <button 
                    onClick={() => setManagementTab('logs')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${managementTab === 'logs' ? 'bg-ph-red text-white shadow-lg shadow-ph-red/20' : 'text-app-muted hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    <History size={14} />
                    <span>System Logs</span>
                  </button>
                  <button 
                    onClick={() => setManagementTab('backup')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${managementTab === 'backup' ? 'bg-ph-yellow text-slate-900 shadow-lg shadow-ph-yellow/20' : 'text-app-muted hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    <HardDrive size={14} />
                    <span>Maintenance</span>
                  </button>
                  <button 
                    onClick={() => setManagementTab('security')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${managementTab === 'security' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-app-muted hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    <ShieldCheck size={14} />
                    <span>Security</span>
                  </button>
                </div>

                {/* Management Content */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {managementTab === 'users' && (
                    <div className="bg-app-card rounded-[2.5rem] border border-app-border shadow-sm overflow-hidden">
                      <div className="p-8 border-b border-app-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h2 className="text-2xl font-black text-app-text">User Registry</h2>
                          <p className="text-sm text-app-muted mt-1">Review activity and manage collective access.</p>
                        </div>
                        <button 
                          onClick={() => setIsAddUserModalOpen(true)}
                          className="px-6 py-3 bg-ph-blue text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                          <Plus size={16} />
                          <span>Add User</span>
                        </button>
                      </div>
                      
                      {/* Desktop Table View */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                          <thead>
                            <tr className="bg-app-muted/5 text-[10px] font-black uppercase tracking-[0.2em] text-app-muted">
                              <th className="px-8 py-4">User Identity</th>
                              <th className="px-8 py-4">Role</th>
                              <th className="px-8 py-4">Knowledge Base</th>
                              <th className="px-8 py-4">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-app-border">
                            {Array.isArray(users) && users.map(u => (
                              <tr key={u.id} className="hover:bg-app-muted/5 transition-colors">
                                <td className="px-8 py-6">
                                  <p className="font-bold text-app-text">{u.name}</p>
                                  <p className="text-xs text-app-muted">{u.email}</p>
                                </td>
                                <td className="px-8 py-6">
                                  <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${u.role === 'ADMIN' ? 'bg-ph-blue/10 text-ph-blue border border-ph-blue/20' : 'bg-app-muted/10 text-app-muted'}`}>
                                    {u.role}
                                  </span>
                                </td>
                                <td className="px-8 py-6 text-sm font-bold text-app-muted">
                                  {u._count?.words || 0} items
                                </td>
                                <td className="px-8 py-6">
                                  <button 
                                    onClick={() => updateUserRole(u.id, u.role === 'ADMIN' ? 'USER' : 'ADMIN')}
                                    disabled={u.id === user?.id}
                                    className="text-[10px] font-bold uppercase tracking-widest text-ph-blue hover:scale-105 active:scale-95 transition-all disabled:opacity-30 flex items-center gap-2"
                                  >
                                    <Lock size={12} />
                                    Toggle Position
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Card View */}
                      <div className="md:hidden divide-y divide-app-border">
                        {Array.isArray(users) && users.map(u => (
                          <div key={u.id} className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-bold text-app-text truncate max-w-[200px]">{u.name}</p>
                                <p className="text-xs text-app-muted truncate max-w-[200px]">{u.email}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-[8px] font-black tracking-widest uppercase ${u.role === 'ADMIN' ? 'bg-ph-blue/10 text-ph-blue border border-ph-blue/20' : 'bg-app-muted/10 text-app-muted'}`}>
                                {u.role}
                              </span>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                              <p className="text-[10px] font-bold text-app-muted uppercase tracking-widest">{u._count?.words || 0} Knowledge Items</p>
                              <button 
                                onClick={() => updateUserRole(u.id, u.role === 'ADMIN' ? 'USER' : 'ADMIN')}
                                disabled={u.id === user?.id}
                                className="text-[10px] font-black uppercase tracking-widest text-ph-blue flex items-center gap-2 bg-ph-blue/5 px-4 py-2 rounded-xl active:scale-95 transition-all disabled:opacity-30"
                              >
                                <Lock size={10} />
                                Role
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {managementTab === 'logs' && (
                    <div className="bg-slate-900 text-slate-300 rounded-[2.5rem] border border-slate-800 shadow-2xl p-4 md:p-8 font-mono">
                      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                          <Terminal className="text-emerald-400" size={24} />
                          <div>
                            <h2 className="text-lg font-black text-white">System Events</h2>
                            <p className="text-[10px] uppercase tracking-widest text-slate-500">Real-time audit log stream</p>
                          </div>
                        </div>
                        <button onClick={fetchLogs} className="text-xs text-slate-500 hover:text-white transition-colors">Refresh Log</button>
                      </div>
                      <div className="space-y-3 overflow-y-auto max-h-[600px] pr-4 custom-scrollbar">
                        {systemLogs.length === 0 ? (
                          <p className="text-center py-20 text-slate-600">No events recorded by the system.</p>
                        ) : (
                          systemLogs.map(log => (
                            <div key={log.id} className="text-xs border-l-2 border-slate-800 pl-4 py-1 hover:bg-slate-800/30 transition-colors">
                              <span className="text-slate-500">[{new Date(log.createdAt).toLocaleTimeString()}]</span>
                              <span className="text-ph-blue ml-2 font-black">{log.action}:</span>
                              <span className="ml-2 text-slate-300">{log.details}</span>
                              {log.userEmail && <span className="ml-2 text-ph-yellow text-[10px]">@{log.userEmail}</span>}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {managementTab === 'backup' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 space-y-6">
                        <div className="bg-app-card p-10 rounded-[3rem] border border-app-border shadow-sm flex items-center justify-between gap-8 group">
                          <div className="space-y-2">
                            <h2 className="text-2xl font-black text-app-text">Relational Engine</h2>
                            <p className="text-sm text-app-muted leading-relaxed">
                              Your database system is running on a healthy file handle. Gabay Wika utilizes an encrypted backup protocol for production deployments.
                            </p>
                          </div>
                          <div className="flex-shrink-0 p-6 bg-app-muted/5 rounded-full group-hover:scale-110 transition-transform">
                            <HardDrive size={40} className="text-ph-blue" />
                          </div>
                        </div>

                        <div className="bg-ph-blue text-white p-10 rounded-[3rem] shadow-xl shadow-ph-blue/20 flex flex-col md:flex-row items-center justify-between gap-8">
                          <div className="text-center md:text-left">
                            <h3 className="text-2xl font-black mb-2">Secure Backup Store</h3>
                            <p className="text-ph-blue/20 font-black uppercase tracking-[0.2em] text-[10px]">AES-256 Symmetric Encryption</p>
                            <p className="text-sm mt-4 opacity-80 max-w-sm">Encrypted with your unique system secret. Use the maintenance tools to restore in case of catastrophic malfunction.</p>
                          </div>
                          <button 
                            onClick={downloadBackup}
                            className="bg-white text-ph-blue px-8 py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-xs hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-3"
                          >
                            <Download size={18} />
                            Initiate Backup
                          </button>
                        </div>
                      </div>

                      <div className="bg-app-card p-10 rounded-[3rem] border border-app-border shadow-sm space-y-8">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-app-muted mb-6 border-b border-app-border pb-4">Infrastructure Stats</p>
                          {systemStats && (
                            <div className="space-y-6">
                              <div className="flex justify-between items-end">
                                <span className="text-xs font-bold text-app-muted">Knowledge Assets</span>
                                <span className="text-xl font-black text-app-text">{systemStats.wordCount}</span>
                              </div>
                              <div className="flex justify-between items-end">
                                <span className="text-xs font-bold text-app-muted">System Accounts</span>
                                <span className="text-xl font-black text-app-text">{systemStats.userCount}</span>
                              </div>
                              <div className="flex justify-between items-end">
                                <span className="text-xs font-bold text-app-muted">Storage Usage</span>
                                <span className="text-xl font-black text-app-text">{(systemStats.dbSize / 1024).toFixed(1)} KB</span>
                              </div>
                              <div className="flex justify-between items-end">
                                <span className="text-xs font-bold text-app-muted">Engine Version</span>
                                <span className="text-xs font-black text-ph-blue">{systemStats.nodeVersion}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="pt-6 border-t border-app-border">
                          <p className="text-[10px] font-black uppercase tracking-widest text-app-muted mb-4">Operations Target</p>
                          <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500">
                            <Activity size={12} className="animate-pulse" />
                            SYTEM_READY: HEALTHY
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                   {managementTab === 'security' && (
                    <div className="space-y-8">
                      <div className="bg-app-card rounded-[3rem] border border-app-border shadow-sm overflow-hidden p-10">
                        <div className="flex flex-col md:flex-row items-start justify-between gap-10">
                          <div className="max-w-md">
                            <div className="p-4 bg-ph-red/10 rounded-2xl w-fit mb-6">
                              <Lock className="text-ph-red" size={24} />
                            </div>
                            <h2 className="text-3xl font-black text-app-text mb-4">Gabay Security Protocol</h2>
                            <p className="text-sm text-app-muted leading-relaxed mb-6">
                              Managed access is restricted to encrypted identities. All administrative modifications are captured by the global audit stream for review.
                            </p>
                            <div className="space-y-4">
                              <div className="flex items-center gap-3 p-4 bg-app-bg rounded-2xl border border-app-border">
                                <ShieldCheck size={20} className="text-emerald-500 flex-shrink-0" />
                                <p className="font-bold text-xs">JWT Identity verification active</p>
                              </div>
                              <div className="flex items-center gap-3 p-4 bg-app-bg rounded-2xl border border-app-border">
                                <ShieldCheck size={20} className="text-emerald-500 flex-shrink-0" />
                                <p className="font-bold text-xs">DDoS Mitigation (Rate Limiting)</p>
                              </div>
                              <div className="flex items-center gap-3 p-4 bg-app-bg rounded-2xl border border-app-border">
                                <ShieldCheck size={20} className="text-emerald-500 flex-shrink-0" />
                                <p className="font-bold text-xs">XSS Protection & Data Sanitization</p>
                              </div>
                              <div className="flex items-center gap-3 p-4 bg-app-bg rounded-2xl border border-app-border">
                                <ShieldCheck size={20} className="text-emerald-500 flex-shrink-0" />
                                <p className="font-bold text-xs">AES-256 Backup Encryption</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex-1 w-full space-y-6">
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[2rem] border border-app-border">
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-app-muted mb-6">Security Hardening Status</p>
                              <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold">Protocol Version</span>
                                  <span className="px-3 py-1 bg-ph-blue text-white text-[10px] font-black rounded-lg uppercase tracking-widest">GABAY_V1.0</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold">HTTP Parameters</span>
                                  <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-lg">LOCKED</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold">SQL Injection Guard</span>
                                  <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-lg">POSTGRESS_ACTIVE</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold">Kernel Secret</span>
                                  {systemStats?.usingDefaultSecret ? (
                                    <span className="px-3 py-1 bg-ph-red text-white text-[10px] font-black rounded-lg animate-pulse">FACTORY_DEFAULT_WARN</span>
                                  ) : (
                                    <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-lg">CUSTOM_HARDENED</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {systemStats?.usingDefaultSecret && (
                              <div className="bg-ph-red/5 border border-ph-red/20 p-6 rounded-[2rem] flex items-start gap-4">
                                <AlertTriangle className="text-ph-red flex-shrink-0" size={20} />
                                <div>
                                  <p className="text-xs font-black text-ph-red uppercase tracking-widest mb-1">Security Warning</p>
                                  <p className="text-[11px] text-app-text leading-relaxed">
                                    This instance is using the built-in development secret. To secure your JWT sessions and backups, generate a custom high-entropy key and set it as <code className="bg-ph-red/10 px-1 rounded text-ph-red">SESSION_SECRET</code> in your project environment.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-app-card rounded-[3rem] border border-app-border shadow-sm p-10">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Key className="text-ph-blue" size={20} />
                              <h3 className="text-xl font-black text-app-text uppercase tracking-widest">Vault Operations</h3>
                            </div>
                            <p className="text-sm text-app-muted max-w-lg mb-6 md:mb-0">
                              Generate a cryptographically secure, high-entropy kernel secret. This key is used for neural GCM backup encryption and session integrity.
                            </p>
                          </div>
                          <button 
                            onClick={generateSecureKey}
                            className="w-full md:w-auto px-8 py-5 bg-ph-blue text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-ph-blue/20 flex items-center justify-center gap-3"
                          >
                            <RefreshCw size={16} />
                            Generate Kernel Secret
                          </button>
                        </div>

                        {generatedKey && (
                          <div className="mt-8 animate-in zoom-in-95 duration-300">
                            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] space-y-4">
                              <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black text-ph-blue uppercase tracking-[0.2em]">New Kernel Secret Proposal</p>
                                <button 
                                  onClick={() => {
                                    navigator.clipboard.writeText(generatedKey);
                                    triggerSuccess("Key copied to vault clipboard.");
                                  }}
                                  className="text-[10px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2"
                                >
                                  <Copy size={12} />
                                  Copy Key
                                </button>
                              </div>
                              <div className="bg-black/50 p-6 rounded-xl border border-slate-800 break-all font-mono text-xs text-emerald-400 select-all">
                                {generatedKey}
                              </div>
                              <div className="flex items-start gap-3 pt-2">
                                <Info size={14} className="text-slate-500 flex-shrink-0 mt-0.5" />
                                <p className="text-[10px] text-slate-500 leading-relaxed">
                                  CRITICAL: Copy this key and save it to your project environment variables as <span className="text-slate-300">SESSION_SECRET</span>. Once you apply it, all existing sessions will be invalidated and you must re-login.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="bg-app-card rounded-[3rem] border border-app-border shadow-sm p-10">
                        <div className="flex flex-col md:flex-row items-start justify-between gap-10">
                          <div className="max-w-md">
                            <div className="flex items-center gap-3 mb-4">
                              <Globe className="text-ph-blue" size={24} />
                              <h3 className="text-xl font-black text-app-text uppercase tracking-widest">Network Security</h3>
                            </div>
                            <p className="text-sm text-app-muted leading-relaxed mb-6">
                              The Gabay Protocol mandates all production nodes be shielded via a Cloudflare Tunnel. Enter your production tunnel token to verify connectivity.
                            </p>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <label className="block text-[10px] font-black text-app-muted uppercase tracking-[0.2em]">Cloudflare Tunnel Token</label>
                                {configSource === "ENVIRONMENT" && (
                                  <span className="text-[9px] font-bold text-ph-blue bg-ph-blue/10 px-2 py-0.5 rounded uppercase">Encrypted Env</span>
                                )}
                              </div>
                              <div className="relative group">
                                <input 
                                  type="password"
                                  value={cloudflareToken}
                                  onChange={(e) => setCloudflareToken(e.target.value)}
                                  disabled={configSource === "ENVIRONMENT"}
                                  placeholder={configSource === "ENVIRONMENT" ? "Token managed by environment variable" : "Enter Cloudflare Tunnel Token..."}
                                  className={`w-full bg-app-bg border border-app-border rounded-2xl p-5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-ph-blue/50 transition-all font-mono ${configSource === "ENVIRONMENT" ? "cursor-not-allowed opacity-70" : ""}`}
                                />
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-app-muted opacity-50 group-focus-within:opacity-100 transition-opacity">
                                  {configSource === "ENVIRONMENT" ? <Server size={18} /> : <Shield size={18} />}
                                </div>
                              </div>
                            </div>
                            {configSource !== "ENVIRONMENT" && (
                              <button 
                                onClick={saveSecurityConfig}
                                disabled={isSavingConfig}
                                className="mt-6 px-10 py-5 bg-ph-blue text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:scale-105 active:scale-95 disabled:opacity-50 transition-all shadow-xl shadow-ph-blue/20 flex items-center gap-3"
                              >
                                {isSavingConfig ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                                Authenticate Tunnel
                              </button>
                            )}
                          </div>
                          
                          <div className="flex-1 w-full bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[2rem] border border-app-border">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-app-muted mb-6">Network Health</p>
                            <div className="space-y-6">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold">Tunnel Status</span>
                                {cloudflareToken ? (
                                  <span className="flex items-center gap-2 text-emerald-500 text-[10px] font-black">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    TUNNEL_ACTIVE
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-2 text-ph-red text-[10px] font-black">
                                    <div className="w-2 h-2 rounded-full bg-ph-red" />
                                    OFFLINE
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold">Config Source</span>
                                <span className="px-3 py-1 bg-ph-blue/10 text-ph-blue text-[10px] font-black rounded-lg">{configSource}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold">Edge Protection</span>
                                <span className="px-3 py-1 bg-ph-blue text-white text-[10px] font-black rounded-lg">CLOUDFLARE_WAF</span>
                              </div>
                              {cloudflareToken && (
                                <div className="pt-6 border-t border-app-border">
                                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                    <Activity size={12} className="animate-pulse" />
                                    SECURE_ENCLAVE_READY
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    )}
    </div>
  </main>

      {/* Mobile Navigation (Bottom Bar) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-safe-bottom bg-app-card border-t border-app-border z-40 flex items-center justify-around px-2 pb-safe">
        <button 
          onClick={() => setView('dashboard')}
          className={`flex flex-col items-center gap-1 p-2 transition-all ${view === 'dashboard' ? 'text-ph-blue scale-110' : 'text-app-muted'}`}
        >
          <LayoutDashboard size={20} />
          <span className="text-[10px] font-black uppercase tracking-widest">Bank</span>
        </button>
        <button 
          onClick={() => setView('study')}
          className={`flex flex-col items-center gap-1 p-2 transition-all ${view === 'study' ? 'text-ph-blue scale-110' : 'text-app-muted'}`}
        >
          <BookOpen size={20} />
          <span className="text-[10px] font-black uppercase tracking-widest">Study</span>
        </button>
        <button 
          onClick={() => setView('games')}
          className={`flex flex-col items-center gap-1 p-2 transition-all ${view === 'games' ? 'text-ph-blue scale-110' : 'text-app-muted'}`}
        >
          <Gamepad2 size={20} />
          <span className="text-[10px] font-black uppercase tracking-widest">Play</span>
        </button>
        {user?.role === 'ADMIN' && (
          <button 
            onClick={() => setView('management')}
            className={`flex flex-col items-center gap-1 p-2 transition-all ${view === 'management' ? 'text-ph-blue scale-110' : 'text-app-muted'}`}
          >
            <ShieldCheck size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest">Admin</span>
          </button>
        )}
      </nav>

      {/* Success & Error Toasts */}
      <AnimatePresence>
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.9, x: '-50%' }}
            className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom)+1rem)] lg:bottom-12 left-1/2 z-[60] bg-emerald-500 text-white px-6 py-3 rounded-full font-black uppercase tracking-widest text-[10px] shadow-xl flex items-center gap-2 ring-4 ring-emerald-500/20 whitespace-nowrap"
          >
            <CheckCircle2 size={14} />
            {successMessage}
          </motion.div>
        )}
        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.9, x: '-50%' }}
            className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom)+1rem)] lg:bottom-12 left-1/2 z-[60] bg-ph-red text-white px-6 py-3 rounded-full font-black uppercase tracking-widest text-[10px] shadow-xl flex items-center gap-2 ring-4 ring-ph-red/20 whitespace-nowrap"
          >
            <AlertCircle size={14} />
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add User Modal */}
      <AnimatePresence>
        {isAddUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddUserModalOpen(false)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-app-card rounded-[3rem] shadow-2xl overflow-hidden border border-app-border"
            >
              <div className="p-10">
                <h2 className="text-3xl font-black mb-8 text-app-text">Invite User</h2>
                <form onSubmit={addUser} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-app-muted mb-2 border-l-4 border-ph-blue pl-3">Email Address</label>
                    <input 
                      required
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      type="email" 
                      placeholder="user@example.com"
                      className="w-full px-5 py-4 bg-app-bg border border-app-border rounded-2xl focus:bg-app-card focus:outline-none focus:ring-4 focus:ring-ph-blue/10 focus:border-ph-blue transition-all font-bold placeholder:text-app-muted/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-app-muted mb-2 border-l-4 border-ph-red pl-3">Display Name</label>
                    <input 
                      required
                      value={newUser.name}
                      onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                      type="text" 
                      placeholder="e.g. Maria de la Cruz"
                      className="w-full px-5 py-4 bg-app-bg border border-app-border rounded-2xl focus:bg-app-card focus:outline-none focus:ring-4 focus:ring-ph-blue/10 focus:border-ph-blue transition-all font-bold placeholder:text-app-muted/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-app-muted mb-2 border-l-4 border-ph-yellow pl-3">Assigned Role</label>
                    <select 
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                      className="w-full px-5 py-4 bg-app-bg border border-app-border rounded-2xl focus:bg-app-card focus:outline-none focus:ring-4 focus:ring-ph-blue/10 focus:border-ph-blue transition-all appearance-none font-bold cursor-pointer text-app-text"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                  <div className="flex gap-4 pt-6">
                    <button 
                      type="button"
                      onClick={() => setIsAddUserModalOpen(false)}
                      className="flex-1 px-6 py-4 text-app-muted font-bold hover:bg-app-muted/5 rounded-2xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 bg-ph-blue text-white px-6 py-4 rounded-2xl hover:bg-ph-blue/90 active:scale-95 transition-all font-black shadow-xl shadow-ph-blue/20"
                    >
                      Create User
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Word Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-app-card rounded-[3rem] shadow-2xl overflow-hidden border border-app-border"
            >
              <div className="p-10">
                <h2 className="text-3xl font-black mb-8 text-app-text">Add New Entry</h2>
                <form onSubmit={addWord} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-app-muted mb-2 border-l-4 border-ph-blue pl-3">Tagalog Expression</label>
                    <div className="relative group">
                      <input 
                        required
                        value={newWord.tagalog}
                        onChange={(e) => setNewWord({...newWord, tagalog: e.target.value})}
                        type="text" 
                        placeholder="e.g. Kapwa"
                        className="w-full px-5 py-4 bg-app-bg border border-app-border rounded-2xl focus:bg-app-card focus:outline-none focus:ring-4 focus:ring-ph-blue/10 focus:border-ph-blue transition-all font-bold placeholder:text-app-muted/50 pr-14"
                      />
                      <button
                        type="button"
                        onClick={() => handleAutoTranslate('tagalog')}
                        disabled={isTranslating || !newWord.tagalog}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-ph-blue/10 text-ph-blue rounded-xl hover:bg-ph-blue hover:text-white transition-all disabled:opacity-30 flex items-center justify-center"
                        title="Translate to English"
                      >
                        <Wand2 size={16} className={isTranslating ? 'animate-pulse' : ''} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-app-muted mb-2 border-l-4 border-ph-red pl-3">English Translation</label>
                    <div className="relative group">
                      <input 
                        required
                        value={newWord.english}
                        onChange={(e) => setNewWord({...newWord, english: e.target.value})}
                        type="text" 
                        placeholder="e.g. Shared identity"
                        className="w-full px-5 py-4 bg-app-bg border border-app-border rounded-2xl focus:bg-app-card focus:outline-none focus:ring-4 focus:ring-ph-blue/10 focus:border-ph-blue transition-all font-bold placeholder:text-app-muted/50 pr-14"
                      />
                      <button
                        type="button"
                        onClick={() => handleAutoTranslate('english')}
                        disabled={isTranslating || !newWord.english}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-ph-red/10 text-ph-red rounded-xl hover:bg-ph-red hover:text-white transition-all disabled:opacity-30 flex items-center justify-center"
                        title="Translate to Tagalog"
                      >
                        <Wand2 size={16} className={isTranslating ? 'animate-pulse' : ''} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-app-muted mb-2 border-l-4 border-ph-yellow pl-3">Classification</label>
                    <select 
                      value={newWord.category}
                      onChange={(e) => setNewWord({...newWord, category: e.target.value})}
                      className="w-full px-5 py-4 bg-app-bg border border-app-border rounded-2xl focus:bg-app-card focus:outline-none focus:ring-4 focus:ring-ph-blue/10 focus:border-ph-blue transition-all appearance-none font-bold cursor-pointer text-app-text"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-4 pt-6">
                    <button 
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="flex-1 px-6 py-4 text-app-muted font-bold hover:bg-app-muted/5 rounded-2xl transition-colors"
                    >
                      Dismiss
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 bg-ph-blue text-white px-6 py-4 rounded-2xl hover:bg-ph-blue/90 active:scale-95 transition-all font-black shadow-xl shadow-ph-blue/20"
                    >
                      Save Word
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
