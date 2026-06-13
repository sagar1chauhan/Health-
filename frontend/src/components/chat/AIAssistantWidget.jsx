import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import gsap from 'gsap';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  Minimize2,
  Trash2,
} from 'lucide-react';
import api from '../../app/api';

// ─── Zod validation schema ─────────────────────────────────────────────
const messageSchema = z.object({
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(500, 'Message cannot exceed 500 characters')
    .transform((val) => val.trim()),
});

// ─── Quick suggestion chips ────────────────────────────────────────────
const QUICK_SUGGESTIONS = [
  { label: '💊 My Health Risk', text: 'What is my current health risk?' },
  { label: '🥗 Diet Plan', text: 'Can you suggest a healthy diet plan?' },
  { label: '🏃 Exercise', text: 'What exercises should I do this week?' },
  { label: '🧘 Stress Tips', text: 'How can I manage my stress better?' },
];

// ─── Single chat bubble ────────────────────────────────────────────────
const ChatBubble = ({ role, content, timestamp }) => {
  const isUser = role === 'user';
  const bubbleRef = useRef(null);

  useEffect(() => {
    if (bubbleRef.current) {
      gsap.fromTo(
        bubbleRef.current,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'back.out(1.4)' }
      );
    }
  }, []);

  return (
    <div
      ref={bubbleRef}
      className={`flex items-end gap-2 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md ${
          isUser
            ? 'bg-gradient-to-tr from-blue-500 to-purple-500'
            : 'bg-gradient-to-tr from-emerald-500 to-teal-400'
        }`}
      >
        {isUser ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[80%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
          isUser
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-md'
            : 'bg-slate-800/80 text-slate-200 border border-slate-700/50 rounded-bl-md'
        }`}
      >
        {content}
        {timestamp && (
          <span
            className={`block text-[10px] mt-1.5 ${
              isUser ? 'text-blue-200/60' : 'text-slate-500'
            }`}
          >
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
};

// ─── Typing indicator ──────────────────────────────────────────────────
const TypingIndicator = () => {
  const dotsRef = useRef(null);

  useEffect(() => {
    if (dotsRef.current) {
      const dots = dotsRef.current.querySelectorAll('.typing-dot');
      gsap.to(dots, {
        y: -4,
        stagger: 0.15,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        duration: 0.4,
      });
    }
  }, []);

  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shrink-0 shadow-md">
        <Bot size={14} className="text-white" />
      </div>
      <div className="bg-slate-800/80 border border-slate-700/50 px-4 py-3 rounded-2xl rounded-bl-md">
        <div ref={dotsRef} className="flex gap-1.5">
          <span className="typing-dot w-2 h-2 bg-emerald-400 rounded-full" />
          <span className="typing-dot w-2 h-2 bg-emerald-400 rounded-full" />
          <span className="typing-dot w-2 h-2 bg-emerald-400 rounded-full" />
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════
// Main Widget
// ════════════════════════════════════════════════════════════════════════
export default function AIAssistantWidget() {
  const { user } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const chatContainerRef = useRef(null);
  const widgetRef = useRef(null);
  const fabRef = useRef(null);

  // ─── React Hook Form + Zod ────────────────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(messageSchema),
    mode: 'onChange',
    defaultValues: { message: '' },
  });

  // ─── Scroll to bottom on new message ──────────────────────────────
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // ─── FAB pulse animation ──────────────────────────────────────────
  useEffect(() => {
    if (fabRef.current && !isOpen) {
      const pulse = gsap.to(fabRef.current, {
        boxShadow: '0 0 0 12px rgba(59,130,246,0)',
        repeat: -1,
        duration: 1.8,
        ease: 'power1.inOut',
      });
      return () => pulse.kill();
    }
  }, [isOpen]);

  // ─── Open / close widget with GSAP ────────────────────────────────
  useEffect(() => {
    if (widgetRef.current) {
      if (isOpen) {
        gsap.fromTo(
          widgetRef.current,
          { opacity: 0, scale: 0.8, y: 30 },
          { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }
        );
      }
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (widgetRef.current) {
      gsap.to(widgetRef.current, {
        opacity: 0,
        scale: 0.8,
        y: 30,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => setIsOpen(false),
      });
    } else {
      setIsOpen(false);
    }
  }, []);

  // ─── Send message ─────────────────────────────────────────────────
  const onSubmit = useCallback(
    async (data) => {
      const userMsg = {
        role: 'user',
        content: data.message,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      reset();
      setIsLoading(true);

      try {
        const res = await api.post('/ai-assistant/chat', {
          message: data.message,
          sessionId,
        });

        if (res.data.success) {
          if (!sessionId) setSessionId(res.data.data.sessionId);
          const assistantMsg = {
            role: 'assistant',
            content: res.data.data.reply,
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, assistantMsg]);
        }
      } catch (err) {
        const errorMsg = {
          role: 'assistant',
          content: '⚠️ Sorry, I encountered an error. Please try again later.',
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, reset]
  );

  // ─── Quick suggestion click ───────────────────────────────────────
  const handleQuickSuggestion = useCallback(
    (text) => {
      setValue('message', text, { shouldValidate: true });
      handleSubmit(onSubmit)();
    },
    [setValue, handleSubmit, onSubmit]
  );

  // ─── Clear chat ───────────────────────────────────────────────────
  const handleClearChat = useCallback(() => {
    setMessages([]);
    setSessionId(null);
  }, []);

  // ─── Welcome message ─────────────────────────────────────────────
  const welcomeMessage = useMemo(
    () => ({
      role: 'assistant',
      content: `👋 Hello${user?.name ? `, ${user.name}` : ''}! I'm your **HealthHub+ AI Assistant**.\n\nI can help you with:\n🔍 Health risk insights\n🥗 Personalized diet plans\n🏃 Exercise recommendations\n🧘 Stress management\n\nHow can I help you today?`,
      timestamp: new Date().toISOString(),
    }),
    [user?.name]
  );

  const displayMessages = useMemo(
    () => (messages.length === 0 ? [welcomeMessage] : messages),
    [messages, welcomeMessage]
  );

  // Don't render if user is not logged in or not a patient
  if (!user || user.role !== 'patient') return null;

  return (
    <>
      {/* ── Floating Action Button ─────────────────────────────────── */}
      {!isOpen && (
        <button
          ref={fabRef}
          id="ai-assistant-fab"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 text-white flex items-center justify-center shadow-2xl shadow-blue-500/30 hover:scale-110 active:scale-95 transition-transform"
          aria-label="Open AI Health Assistant"
        >
          <MessageCircle size={26} />
        </button>
      )}

      {/* ── Chat Widget ────────────────────────────────────────────── */}
      {isOpen && (
        <div
          ref={widgetRef}
          className="fixed z-50
            bottom-0 right-0 w-full h-full
            sm:bottom-6 sm:right-6 sm:w-[420px] sm:h-[600px] sm:max-h-[80vh] sm:rounded-2xl
            flex flex-col overflow-hidden
            bg-slate-900/95 backdrop-blur-2xl
            border-0 sm:border sm:border-slate-700/50
            shadow-2xl shadow-black/40"
        >
          {/* ── Header ───────────────────────────────────────────── */}
          <div className="relative px-5 py-4 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-pink-600/90 backdrop-blur-lg flex items-center justify-between shrink-0">
            {/* Animated glow line */}
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 opacity-60" />

            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Sparkles size={20} className="text-white" />
                </div>
                {/* Online indicator */}
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-purple-600" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm tracking-wide">
                  AI Health Assistant
                </h3>
                <p className="text-blue-100/70 text-xs">Always here to help</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Clear chat"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={handleClose}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Close"
              >
                <span className="hidden sm:block"><Minimize2 size={16} /></span>
                <span className="block sm:hidden"><X size={18} /></span>
              </button>
            </div>
          </div>

          {/* ── Messages area ────────────────────────────────────── */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scroll-smooth"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#475569 transparent',
            }}
          >
            {displayMessages.map((msg, idx) => (
              <ChatBubble key={idx} {...msg} />
            ))}
            {isLoading && <TypingIndicator />}
          </div>

          {/* ── Quick suggestions (only when no user messages) ──── */}
          {messages.length === 0 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2 shrink-0">
              {QUICK_SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => handleQuickSuggestion(s.text)}
                  className="text-xs px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700/50 text-slate-300 hover:text-white hover:border-blue-500/50 hover:bg-blue-500/10 transition-all active:scale-95"
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {/* ── Input area ───────────────────────────────────────── */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-4 py-3 border-t border-slate-700/50 bg-slate-900/80 backdrop-blur-lg shrink-0"
          >
            {errors.message && (
              <p className="text-red-400 text-xs mb-1.5 px-1">{errors.message.message}</p>
            )}
            <div className="flex items-center gap-2">
              <input
                {...register('message')}
                type="text"
                placeholder="Ask me about your health..."
                autoComplete="off"
                disabled={isLoading}
                className="flex-1 bg-slate-800/80 text-sm text-white placeholder-slate-500 border border-slate-700/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 disabled:opacity-50 transition-all"
              />
              <button
                type="submit"
                disabled={isLoading || !isValid}
                className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-500 text-white flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 transition-all shadow-lg shadow-blue-500/20"
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
