import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Highlight, HighlightColor, ReadingSettings } from '../types';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

interface NotesContextType {
  addHighlights: (items: any[]) => void;
  highlights: Highlight[];
  userHighlights: Highlight[];
  addHighlight: (data: {
    conversationId: string;
    conversationTitle: string;
    paragraphId: string;
    selectedText: string;
    color: HighlightColor;
    note?: string;
    startOffset?: number;
    endOffset?: number;
  }) => Highlight;
  removeHighlight: (id: string) => void;
  updateHighlightNote: (id: string, note: string) => void;
  getHighlightsForParagraph: (paragraphId: string) => Highlight[];
  readingSettings: ReadingSettings;
  updateReadingSettings: (updates: Partial<ReadingSettings>) => void;
}

const HIGHLIGHTS_KEY = 'sohbet_app_highlights_v1';
const READING_SETTINGS_KEY = 'sohbet_app_reading_settings_v1';

const DEFAULT_READING_SETTINGS: ReadingSettings = {
  fontSize: 'lg',
  fontFamily: 'serif',
  lineHeight: 'relaxed',
  theme: 'paper',
};

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const notesRef=useRef<Highlight[]>([]);
  const saveQueue=useRef(Promise.resolve());
  useEffect(() => {let cancelled=false;notesRef.current=[];setHighlights([]);if(currentUser?.status==='approved') api('notes').then(items=>{if(!cancelled&&notesRef.current.length===0){notesRef.current=items;setHighlights(items);}}).catch(e=>alert(e.message));return()=>{cancelled=true;};}, [currentUser?.id]);
  const persist = (items: Highlight[]) => {notesRef.current=items;setHighlights(items);saveQueue.current=saveQueue.current.then(()=>api('notes',items)).then(()=>{}).catch(e=>alert('Vurgulama kaydedilemedi: '+e.message));};

  const [readingSettings, setReadingSettings] = useState<ReadingSettings>(() => {
    const saved = localStorage.getItem(READING_SETTINGS_KEY);
    if (saved) {
      try {
        return { ...DEFAULT_READING_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to parse reading settings', e);
      }
    }
    return DEFAULT_READING_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem(READING_SETTINGS_KEY, JSON.stringify(readingSettings));
    document.documentElement.dataset.readingTheme = readingSettings.theme;
    // Apply dark class to document if theme is dark
    if (readingSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [readingSettings]);

  const userHighlights = highlights.filter(h =>
    currentUser ? h.userId === currentUser.id : true
  );

  const addHighlight = (data: {
    conversationId: string;
    conversationTitle: string;
    paragraphId: string;
    selectedText: string;
    color: HighlightColor;
    note?: string;
    startOffset?: number;
    endOffset?: number;
  }) => {
    const newHighlight: Highlight = {
      ...data,
      id: `hl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: currentUser?.id || 'guest',
      createdAt: new Date().toISOString(),
    };

    persist([newHighlight, ...notesRef.current]);
    return newHighlight;
  };

  const removeHighlight = (id: string) => {
    persist(notesRef.current.filter(h => h.id !== id));
  };

  const updateHighlightNote = (id: string, note: string) => {
    persist(notesRef.current.map(h => h.id === id ? { ...h, note } : h));
  };

  const getHighlightsForParagraph = (paragraphId: string) => {
    return userHighlights.filter(h => h.paragraphId === paragraphId);
  };

  const updateReadingSettings = (updates: Partial<ReadingSettings>) => {
    setReadingSettings(prev => ({ ...prev, ...updates }));
  };

  return (
    <NotesContext.Provider
      value={{
        addHighlights: (items: any[]) => persist([...items.map(data=>({...data,id:crypto.randomUUID(),userId:currentUser.id,createdAt:new Date().toISOString()})),...notesRef.current]),
        highlights,
        userHighlights,
        addHighlight,
        removeHighlight,
        updateHighlightNote,
        getHighlightsForParagraph,
        readingSettings,
        updateReadingSettings,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};
