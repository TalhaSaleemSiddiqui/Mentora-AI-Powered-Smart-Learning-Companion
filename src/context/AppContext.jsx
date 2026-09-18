import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AppContext = createContext();
const API_BASE = 'http://127.0.0.1:8000';

export const useApp = () => useContext(AppContext);

const normalizeChatId = (id) => {
  const n = Number(id);
  return Number.isNaN(n) ? id : n;
};

export const AppProvider = ({ children }) => {
  
  const getLocalData = () => JSON.parse(localStorage.getItem('mentora_local_data')) || {};
  const saveLocalData = (data) => localStorage.setItem('mentora_local_data', JSON.stringify(data));

  const defaultStats = {
    score: 0, streak: 0, points: 0, questionsAnswered: 0, accuracy: 100, ahaMoments: 0,
    recentScores: [],
    recentResults: [],
    dailyActivity: [ { day: 'Mon', h: 0 }, { day: 'Tue', h: 0 }, { day: 'Wed', h: 0 }, { day: 'Thu', h: 0 }, { day: 'Fri', h: 0 }, { day: 'Sat', h: 0 }, { day: 'Sun', h: 0 } ]
  };

  const defaultTopics = {
    Addition: { pct: 0, level: 1 },
    Subtraction: { pct: 0, level: 1 },
    Multiplication: { pct: 0, level: 1 },
    Division: { pct: 0, level: 1 },
  };

  const defaultChats = [];

  // --- RUNTIME STATE ---
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(defaultStats);
  const [topics, setTopics] = useState(defaultTopics);
  const [chats, setChats] = useState(defaultChats);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const isBootstrapping = useRef(true);

  useEffect(() => {
    const savedSession = localStorage.getItem('mentora_active_session');
    if (savedSession) {
      const parsedSession = JSON.parse(savedSession);
      setUser(parsedSession);
      
      const localData = getLocalData();
      if (localData[parsedSession.email]) {
        setStats(localData[parsedSession.email].stats || defaultStats);
        setTopics(localData[parsedSession.email].topics || defaultTopics);
        setChats(localData[parsedSession.email].chats || defaultChats);
      }
    }
    isBootstrapping.current = false;
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!user?.user_id || isBootstrapping.current) return;
    fetchChatList(user.user_id);
  }, [user?.user_id]);

  useEffect(() => {
    if (isBootstrapping.current) return;
    if (user) {
      const localData = getLocalData();
      if (!localData[user.email]) localData[user.email] = {};
      localData[user.email].stats = stats;
      localData[user.email].topics = topics;
      localData[user.email].chats = chats;
      saveLocalData(localData);
    }
  }, [stats, topics, chats, user]);

  
  
  const loginUser = async (email, password) => {
    const userEmail = email.toLowerCase();
    try {
      let response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, password: password })
      });
      const data = await response.json();
      
      if (response.ok) {
        completeLoginState(data, data.role, userEmail, false);
        return { success: true };
      } else {
        return { success: false, error: data.detail || 'Login failed.' };
      }
    } catch (err) {
      console.error("Backend Error:", err);
      return { success: false, error: 'Cannot connect to server. Is backend running?' };
    }
  };

  const registerUser = async (role, fullName, email, password) => {
    const userEmail = email.toLowerCase();
    try {
      let response = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, full_name: fullName, email: userEmail, password })
      });
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.detail || 'Signup failed.' };
      }
    } catch (err) {
      console.error("Backend Error:", err);
      return { success: false, error: 'Cannot connect to server. Is backend running?' };
    }
  };

  const forgotPassword = async (email) => {
    const userEmail = email.toLowerCase();
    try {
      let response = await fetch(`${API_BASE}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail })
      });
      return { success: true };
    } catch (err) {
      console.error("Backend Error:", err);
      return { success: false, error: 'Cannot connect to server.' };
    }
  };

  const completeLoginState = (data, role, userEmail, isNewAccount) => {
      
      const name = data.full_name || userEmail.split('@')[0];
      const userData = { role, email: userEmail, name: name, user_id: data.user_id };
      setUser(userData);
      localStorage.setItem('mentora_active_session', JSON.stringify(userData));

      if (isNewAccount) {
          setStats(defaultStats);
          setTopics(defaultTopics);
          setChats(defaultChats);
      } else {
          const localData = getLocalData();
          if (localData[userEmail]) {
             setStats(localData[userEmail].stats || defaultStats);
             setTopics(localData[userEmail].topics || defaultTopics);
             setChats(localData[userEmail].chats || defaultChats);
          }
      }
      setCurrentChatId(null);
  };
  
  const logout = () => {
    setUser(null);
    setStats(defaultStats);
    setTopics(defaultTopics);
    setChats(defaultChats);
    setCurrentChatId(null);
    localStorage.removeItem('mentora_active_session');
  };

  const updateStats = (newStats) => setStats(prev => ({ ...prev, ...newStats }));

  const updateTopic = (topicName, newPct) => {
    setTopics(prev => ({
      ...prev,
      [topicName]: { ...prev[topicName], pct: Math.min(100, Math.max(0, newPct)) }
    }));
  };

  const updateUser = (updates) => {
    if (!user) return;
    const newUserData = { ...user, ...updates };
    setUser(newUserData);
  };

  const recordQuizResult = (topicName, levelNum, score, totalQuestions, points) => {
    const pct = Math.round((score / totalQuestions) * 100);

    setTopics(prev => ({
      ...prev,
      [topicName]: {
        
        pct: Math.min(100, Math.max(prev[topicName]?.pct || 0, pct)), 
        level: Math.max(prev[topicName]?.level || 1, levelNum),
      }
    }));

    const days  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const today = days[new Date().getDay()];

    setStats(prev => {
      const totalAnswered = prev.questionsAnswered + totalQuestions;
      const prevCorrect   = Math.round((prev.accuracy / 100) * prev.questionsAnswered);
      const newCorrect    = prevCorrect + score;
      const newAccuracy   = totalAnswered > 0
        ? Math.round((newCorrect / totalAnswered) * 100)
        : 100;

      const newDailyActivity = prev.dailyActivity.map(d =>
        d.day === today
          ? { ...d, h: Math.min(100, d.h + totalQuestions * 2) }
          : d
      );

      const newRecentScores = [
        ...(prev.recentScores || []),
        pct,
      ].slice(-5);

      const newRecentResults = [
        ...(prev.recentResults || []),
        { topic: topicName, level: levelNum, pct },
      ].slice(-5);

      const newAhaMoments = pct === 100
        ? prev.ahaMoments + 1
        : prev.ahaMoments;

      return {
        ...prev,
        score: prev.score + points,
        questionsAnswered: totalAnswered,
        accuracy: newAccuracy,
        ahaMoments: newAhaMoments,
        dailyActivity: newDailyActivity,
        recentScores: newRecentScores,
        recentResults: newRecentResults,
      };
    });
  };

  // --- CHAT ACTIONS ---
  const createNewChat = () => {
    const id = Date.now();
    const newChat = { id, title: "New Conversation", messages: [], pinned: false };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(id);
    return id;
  };

  const addMessageToChat = (chatId, msgRole, text, visual = null, isSlideshow = false) => {
    setChats(prev => prev.map(c => {
      if (String(c.id) === String(chatId)) {
        const isFirstUserMsg = msgRole === 'user' && c.messages.filter(m => m.role === 'user').length === 0;
        const newTitle = isFirstUserMsg ? (text.length > 25 ? text.substring(0, 25) + "..." : text) : c.title;
        return {
          ...c,
          title: newTitle,
          messages: [...c.messages, { 
              id: Date.now() + Math.random(), 
              role: msgRole, 
              text, 
              visual,        
              isSlideshow    
          }]
        };
      }
      return c;
    }));
  };

  const togglePinChat = (id) => {
    setChats(prev => prev.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c));
  };

 const deleteChat = async (id) => {
    
    setChats(prev => {
      
      const filtered = prev.filter(c => String(c.id) !== String(id));
      if (String(currentChatId) === String(id)) {
        setCurrentChatId(null);
      }
      return filtered;
    });

    
    try {
      const response = await fetch(`${API_BASE}/chats/${encodeURIComponent(String(id))}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        console.warn('Chat backend par nahi mili ya pehle hi delete ho chuki thi.');
      }
    } catch (err) {
      console.error('Backend connection error:', err);
    }
  };

  const fetchChatList = async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/chats/user/${userId}`);
      if (!response.ok) return;

      const data = await response.json();
      setChats(prev => {
        const localById = Object.fromEntries(prev.map(c => [String(c.id), c]));
        return (data.chats || []).map(bc => {
          const id = normalizeChatId(bc.id);
          const local = localById[String(id)];
          return {
            id,
            title: bc.title || local?.title || 'Conversation',
            messages: local?.messages || [],
            pinned: local?.pinned || false,
          };
        });
      });
    } catch (err) {
      console.error('Failed to fetch chat list:', err);
    }
  };

  const loadChatMessages = async (chatId, userId) => {
    const id = normalizeChatId(chatId);
    try {
      const response = await fetch(
        `${API_BASE}/chats/${encodeURIComponent(String(id))}/messages?user_id=${userId}`
      );
      if (!response.ok) {
        return { success: false, error: 'Could not load this chat. Please try again.' };
      }

      const data = await response.json();
      setChats(prev => {
        const exists = prev.some(c => String(c.id) === String(id));
        if (exists) {
          return prev.map(c =>
            String(c.id) === String(id)
              ? { ...c, title: data.title || c.title, messages: data.messages || [] }
              : c
          );
        }
        return [
          {
            id,
            title: data.title || 'Conversation',
            messages: data.messages || [],
            pinned: false,
          },
          ...prev,
        ];
      });
      setCurrentChatId(id);
      return { success: true };
    } catch (err) {
      console.error('Failed to load chat messages:', err);
      return { success: false, error: 'Could not load this chat. Please try again.' };
    }
  };

  return (
    <AppContext.Provider value={{
      user, loginUser, registerUser, forgotPassword, logout, updateUser,
      stats, updateStats,
      topics, updateTopic,
      recordQuizResult,
      chats, currentChatId, setCurrentChatId, createNewChat, addMessageToChat, togglePinChat, deleteChat,
      fetchChatList, loadChatMessages,
      isReady,
    }}>
      {children}
    </AppContext.Provider>
  );
};