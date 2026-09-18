import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MentoraMascot from '../components/MentoraMascot';
import PageBackground from '../components/PageBackground';
import PinModal from '../components/PinModal';
import { useApp } from '../context/AppContext';
import MathVisual from '../MathVisual'; 
import { playPop, playWhoosh } from '../utils/sounds'; 

const TOPIC_DISPLAY = {
  addition: 'Addition',
  subtraction: 'Subtraction',
  multiplication: 'Multiplication',
  division: 'Division',
  fractions: 'Fractions',
};

// --- AUDIO SETUP ---
const globalAudio = new Audio(); 
const silentAudioBase64 = "data:audio/mp3;base64,SUQzBAAAAAABAFRYWFgAAAASAAADbWFqb3JfYnJhbmQAbXA0MgBUWFhYAAAAEQAAA21pbm9yX3ZlcnNpb24AMABUWFhYAAAAHAAAA2NvbXBhdGlibGVfYnJhbmRzAGlzb21tcDQyAFRTU0UAAAAPAAADTGF2ZjU3LjU2LjEwMAAAAAAAAAAAAAAA//uQZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWgAAAA0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const unlockAudioContext = () => {
  if (globalAudio.src !== silentAudioBase64) {
      globalAudio.src = silentAudioBase64;
  }
  globalAudio.play().catch(e => console.log("Audio unlock triggered"));
};

const speak = (audioBase64) => {
  return new Promise((resolve) => {
    if (!audioBase64) { resolve(); return; }
    globalAudio.pause();
    globalAudio.currentTime = 0;
    globalAudio.src = audioBase64;
    globalAudio.onended = () => resolve();
    globalAudio.onerror = (e) => { console.error("Audio Error", e); resolve(); };
    globalAudio.play().catch(e => {
        console.warn("Audio blocked. Interact first.", e);
        resolve();
    });
  });
};


const enforceTextRender = (visualString) => {
  if (!visualString || typeof visualString !== 'string') return visualString;
  const parts = visualString.split(' ');
  if (parts.length < 4) return visualString;
  const countA = parseInt(parts[1], 10) || 0;
  const countB = parseInt(parts[2], 10) || 0;
  
  
  if (countA + countB > 40 || countA > 40 || countB > 40) {
    parts[3] = 'number';
    return parts.join(' ');
  }
  
  return visualString;
};

export default function HomePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, stats, topics, chats, currentChatId, setCurrentChatId, createNewChat, addMessageToChat, updateStats, loadChatMessages } = useApp();
  
  
  const [activeTopic, setActiveTopic] = useState('general');
  const lessonTopicRef = useRef('general');

  /* ── Hero / UI state ── */
  const [emotion, setEmotion] = useState('waving');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [chatMode, setChatMode] = useState(false);
  const [isVideoFinished, setIsVideoFinished] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(null);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [chatLoadError, setChatLoadError] = useState(null);
  const chatEndRef = useRef(null);
  const loadingChatRef = useRef(null);

  const SpeechRecognitionAPI =
    typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;
  const speechSupported = !!SpeechRecognitionAPI;
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const handleMicClick = () => {
    if (!speechSupported) return;

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    unlockAudioContext();

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.results.length - 1; i >= 0; i--) {
        if (event.results[i].isFinal) {
          transcript = event.results[i][0].transcript.trim();
          break;
        }
      }
      if (transcript) sendMessage(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  const sendMessage = async (text, specificTopic = null) => {
    const q = text || inputText;
    if (!q.trim()) return;

    if (specificTopic) {
      const k = specificTopic.toLowerCase();
      lessonTopicRef.current = k;
    }
    const topicToLock =
      lessonTopicRef.current !== 'general'
        ? lessonTopicRef.current
        : (activeTopic !== 'general' ? activeTopic : specificTopic?.toLowerCase() || 'general');

    unlockAudioContext();

    let targetChatId = currentChatId;
    if (!targetChatId || (chats.find(c => c.id === targetChatId)?.messages.length === 0 && !chatMode)) {
      targetChatId = createNewChat();
    }
    
    addMessageToChat(targetChatId, 'user', q);

    setChatMode(true);
    setSearchParams({ chat: String(targetChatId) }, { replace: true });
    setInputText('');
    setEmotion('thinking');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:8000/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: q,
          user_id: user?.user_id,
          topic: topicToLock,
          chat_id: targetChatId ? String(targetChatId) : null,
          free_form: true 
        }),
      });

      if (!response.ok) throw new Error('Backend response not ok');
      const data = await response.json(); 

      setIsTyping(false);

      // Step-by-Step Slideshow Playback
      for (let i = 0; i < data.length; i++) {
        const step = data[i];
        
        setCurrentSlide({ text: step.speech, visual: enforceTextRender(step.visual) });
        setEmotion('excited'); 
        
        await speak(step.audio); 
        await new Promise(r => setTimeout(r, 800)); 
      }

      setCurrentSlide(null);
      const fullReply = data.map(step => step.speech).join(' ');
      const finalVisual = data[data.length - 1]?.visual; 
      
      addMessageToChat(targetChatId || currentChatId, 'mentora', fullReply, finalVisual, false);
      setEmotion('happy');
    } catch (error) {
      console.error("Integration Error:", error);
      addMessageToChat(targetChatId || currentChatId, 'mentora', "Oops! Mentora is a bit confused. Let's try again!");
      setEmotion('sad');
      setCurrentSlide(null);
    } finally {
      setIsTyping(false);
    }
  };

  const topicParam = searchParams.get('topic');

  /* ── LISTEN FOR TOPIC FROM TILE (e.g. /extra?topic=addition) ── */
  useEffect(() => {
    if (!topicParam) return;

    const key = topicParam.toLowerCase();
    const label = TOPIC_DISPLAY[key] || (topicParam.charAt(0).toUpperCase() + topicParam.slice(1).toLowerCase());

    lessonTopicRef.current = key;
    setActiveTopic(key);

    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      sendMessage(`Hi! I'm ready to start learning ${label} today.`, key);
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [topicParam]);

  const openChat = async (chatId) => {
    if (!user?.user_id || !chatId) return;
    const id = Number(chatId);
    const normalizedId = Number.isNaN(id) ? chatId : id;

    if (loadingChatRef.current === String(normalizedId)) return;

    const localChat = chats.find(c => String(c.id) === String(normalizedId));
    if (localChat?.messages?.length > 0) {
      setChatLoadError(null);
      setCurrentChatId(normalizedId);
      setChatMode(true);
      return;
    }

    loadingChatRef.current = String(normalizedId);

    setChatLoadError(null);
    setIsLoadingChat(true);
    setCurrentChatId(normalizedId);
    setChatMode(true);

    const result = await loadChatMessages(normalizedId, user.user_id);
    if (!result.success) {
      setChatLoadError(result.error || 'Could not load this chat. Please try again.');
    }

    setIsLoadingChat(false);
    loadingChatRef.current = null;
  };

  useEffect(() => {
    const chatParam = searchParams.get('chat');
    if (!chatParam || !user?.user_id || searchParams.get('topic')) return;
    openChat(chatParam);
  }, [searchParams.get('chat'), user?.user_id]);

  /* Derived messages */
  const activeChat = chats.find(c => String(c.id) === String(currentChatId));
  const messages = activeChat?.messages || [];
  const showChatView = chatMode || !!currentChatId || !!searchParams.get('chat');

  /* Auto scroll chat to bottom */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, chatMode, currentSlide]);

  /* ─── SHARED INPUT BAR RENDERER ─── */
  const renderInputBar = (compact = false) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: compact ? '1000px' : '660px' }}>
      {speechSupported && (
        <style>{`
          @keyframes chatMicPulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(61,217,197,0.5); }
            50% { box-shadow: 0 0 0 10px rgba(61,217,197,0); }
          }
        `}</style>
      )}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        background: 'rgba(22,35,72,0.55)', backdropFilter: 'blur(28px)',
        border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: '24px',
        padding: '10px 10px 10px 20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}>
        <input
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'white', fontFamily: '"Nunito", sans-serif', fontSize: '15px' }}
          type="text"
          placeholder={`Ask about ${activeTopic === 'general' ? 'math' : activeTopic}...`}
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { unlockAudioContext(); sendMessage(); } }}
        />
        {speechSupported && (
          <button
            type="button"
            onClick={handleMicClick}
            aria-label={isListening ? 'Stop listening' : 'Start voice input'}
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '15px',
              flexShrink: 0,
              border: isListening ? '2px solid #3DD9C5' : 'none',
              background: isListening ? 'rgba(61,217,197,0.25)' : 'rgba(255,255,255,0.08)',
              cursor: 'pointer',
              color: isListening ? '#3DD9C5' : 'white',
              fontSize: '20px',
              lineHeight: 1,
              animation: isListening ? 'chatMicPulse 1.2s ease-in-out infinite' : 'none',
            }}
          >
            🎤︎︎
          </button>
        )}
        <button
          onClick={() => { unlockAudioContext(); sendMessage(); }}
          style={{ width: '46px', height: '46px', borderRadius: '15px', background: 'linear-gradient(135deg, #FF6B4A, #e85530)', border: 'none', cursor: 'pointer', color: 'white' }}
        >➤</button>
      </div>
    </div>
  );

  /* ─── CHAT MODE VIEW ─── */
  if (showChatView) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Left Panel: Mascot + Navigation */}
          <div style={{ width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', background: 'rgba(13,27,62,0.5)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
            
            
            <button 
              onClick={() => { 
                playWhoosh(); 
                setSearchParams({}, { replace: true }); 
                lessonTopicRef.current = 'general'; 
                setActiveTopic('general'); 
                setChatMode(false); 
                setCurrentChatId(null); 
                navigate('/welcome');
              }} 
              style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: '13px', marginBottom: '30px' }}
            >
              ← Back
            </button>

            {/* Wrapped in a flex container to keep it perfectly centered vertically and horizontally */}
           
<div style={{ marginTop: '-60px', marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>
  <MentoraMascot emotion={emotion} size={140} />
</div>

            <div style={{ background: 'rgba(28,45,86,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '12px 16px', width: '100%', marginTop: '-90px' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#3DD9C5', textTransform: 'uppercase', marginBottom: '4px' }}>✦ Current Lesson</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>{activeTopic.toUpperCase()}</div>
            </div>

            <button
              onClick={() => { setSearchParams({}, { replace: true }); lessonTopicRef.current = 'general'; setChatMode(false); setCurrentChatId(null); setActiveTopic('general'); }}
              style={{ marginTop: 'auto', width: '100%', padding: '10px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer' }}
            >Exit Lesson</button>
          </div>

          {/* Right Panel: Chat Feed */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {isLoadingChat && (
                <div style={{ color: '#3DD9C5', fontSize: '13px', fontWeight: 700 }}>Loading conversation...</div>
              )}
              {chatLoadError && (
                <div style={{ color: '#FF6B4A', fontSize: '13px', fontWeight: 700 }}>{chatLoadError}</div>
              )}
              {messages.map(msg => (
                <div key={msg.id} style={{ display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: '12px' }}>
                  <div style={{
                    maxWidth: '85%', padding: '14px 18px', borderRadius: '20px',
                    background: msg.role === 'user' ? '#FF6B4A' : 'rgba(28,45,86,0.85)',
                    color: 'white', fontSize: '14px', fontWeight: 600, lineHeight: 1.5
                  }}>
                    {msg.text}
                    {msg.visual && msg.role === 'mentora' && (
                        <div style={{ marginTop: '12px' }}>
                            <MathVisual 
            visual={msg.visual} 
            isActive={msg.id === messages[messages.length - 1]?.id && !isTyping}/>
                        </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && <div style={{ color: '#3DD9C5', fontSize: '13px', fontWeight: 700 }}>Mentora is thinking...</div>}
              <div ref={chatEndRef} />
            </div>

            <div style={{ padding: '16px 32px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(13,27,62,0.4)' }}>
              {renderInputBar(true)}
            </div>
          </div>
        </div>

        {/* Animation Overlay */}
        {currentSlide && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <MathVisual visual={currentSlide.visual} />
            <p style={{ color: 'white', fontSize: '32px', fontWeight: 800, textAlign: 'center', maxWidth: '80%', marginTop: '40px' }}>{currentSlide.text}</p>
          </div>
        )}
      </div>
    );
  }

  /* ─── HERO VIEW ─── */
  return (
    <PageBackground style={{ overflowY: 'auto' }}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 28px' }}>
        
        
        {!isVideoFinished ? (
          <video 
            src="/hi.mp4" 
            autoPlay 
            playsInline
            onEnded={() => setIsVideoFinished(true)} 
            style={{ width: '550px', borderRadius: '25px', objectFit: 'cover' , border: '1px solid #3DD9C5', 
                boxShadow: '0 0 15px rgba(61, 217, 197, 0.5)'}}
            
          />
        ) : (
          <MentoraMascot emotion={emotion} size={220} />
        )}

        <h2 style={{ color: 'white', marginTop: '20px', fontSize: '28px', fontWeight: 800 }}>Good morning, {user?.name || 'Zara'}!</h2>
        <div style={{ marginTop: '32px', width: '100%', display: 'flex', justifyContent: 'center' }}>
          {renderInputBar()}
        </div>
      </div>
    </PageBackground>
  );
}