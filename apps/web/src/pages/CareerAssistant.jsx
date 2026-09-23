import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Loader2, Square, Power, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import api from '../api/authApi';
import { useAuth } from '../hooks/useAuth';
import { getStudentProfile } from '../api/skillApi';
import { getSkillGaps } from '../api/skillApi';

const CareerAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { role: 'bot', content: "Hello! I'm your AI Career Assistant. I have access to your skill profile and career goals. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAiEnabled, setIsAiEnabled] = useState(true);
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setMessages(prev => [
      ...prev,
      { role: 'bot', content: "⏹️ AI response generation was stopped." }
    ]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // If AI is paused by the user, use local rule-based intelligence immediately
    if (!isAiEnabled) {
      setTimeout(() => {
        setMessages(prev => [
          ...prev, 
          { 
            role: 'bot', 
            content: `[AI Paused Mode] Your query has been noted: "${userMessage}". To maximize placement match, check your Skill Gap dashboard and complete your core requirements.` 
          }
        ]);
        setIsLoading(false);
        abortControllerRef.current = null;
      }, 500);
      return;
    }

    try {
      // 1. Call authenticated backend assistant endpoint (automatically injects verified profile, skills, and gaps)
      const apiRes = await api.post('/ai/assistant', { message: userMessage, useAi: isAiEnabled }, { signal: controller.signal });
      const botReply = apiRes.data.answer || apiRes.data.reply;
      if (botReply) {
        setMessages(prev => [...prev, { role: 'bot', content: botReply }]);
        return;
      }
    } catch (apiErr) {
      if (axios.isCancel(apiErr) || apiErr.name === 'CanceledError' || apiErr.name === 'AbortError') {
        // Handled by handleStop
        return;
      }
      console.warn('Backend assistant call error, falling back to direct AI service:', apiErr);
    }

    try {
      // 2. Direct fallback to local AI service on port 8001
      const formData = new FormData();
      formData.append('query', userMessage);
      formData.append('context', JSON.stringify({ user: user?.firstName, role: user?.role }));

      const res = await axios.post('http://localhost:8001/career-assistant', formData, { signal: controller.signal });
      setMessages(prev => [...prev, { role: 'bot', content: res.data.answer || res.data.reply }]);
    } catch (err) {
      if (axios.isCancel(err) || err.name === 'CanceledError' || err.name === 'AbortError') {
        return;
      }
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: "I'm analyzing your current skills and career milestones. To maximize your placement compatibility, focus on clearing your high-priority skill gaps and completing verified projects!" 
      }]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto h-[calc(100vh-4rem)] flex flex-col bg-white rounded-3xl border shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b bg-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Bot size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">AI Career Assistant</h1>
              <p className="text-indigo-100 text-xs">Personalized Guidance & Skill Analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAiEnabled(!isAiEnabled)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition cursor-pointer ${
                isAiEnabled 
                  ? 'bg-emerald-500/20 border-emerald-300 text-white hover:bg-emerald-500/30' 
                  : 'bg-rose-500/30 border-rose-300 text-white hover:bg-rose-500/40'
              }`}
              title={isAiEnabled ? "Click to disable/pause external AI" : "Click to enable AI"}
            >
              <Power size={13} />
              <span>{isAiEnabled ? 'AI Active' : 'AI Stopped (Offline)'}</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium bg-white/10 px-3 py-1.5 rounded-full">
              <Sparkles size={14} />
              Google Gemini
            </div>
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border shadow-sm'
                }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-700 border shadow-sm rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-white text-indigo-600 border shadow-sm flex items-center justify-center shrink-0">
                  <Bot size={16} />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-tl-none border shadow-sm flex items-center gap-3">
                  <Loader2 className="animate-spin text-indigo-600" size={18} />
                  <span className="text-xs text-slate-500 font-medium">Generating answer...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-6 border-t bg-white">
          {isLoading && (
            <div className="flex justify-center pb-3">
              <button
                type="button"
                onClick={handleStop}
                className="flex items-center gap-2 px-4 py-1 rounded-full bg-rose-50 border border-rose-300 text-rose-600 hover:bg-rose-100 text-xs font-bold shadow-sm transition animate-pulse"
              >
                <Square size={12} className="fill-rose-600" />
                Stop AI Response
              </button>
            </div>
          )}
          <div className="flex gap-3">
            <input
              className="flex-1 p-3 border rounded-xl outline-indigo-600 text-sm"
              placeholder={isAiEnabled ? "Ask about your skill gaps, career path, or learning resources..." : "[AI Paused] Type question for local advisor..."}
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isLoading}
            />
            {isLoading ? (
              <button
                type="button"
                onClick={handleStop}
                className="bg-rose-600 text-white px-4 py-3 rounded-xl hover:bg-rose-700 transition flex items-center gap-1.5 text-xs font-bold shadow-sm"
                title="Stop AI Generation"
              >
                <Square size={14} className="fill-white" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 cursor-pointer"
                title="Send Message"
              >
                <Send size={20} />
              </button>
            )}
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-3 px-1">
            <span>The AI analyzes your verified profile and gaps to provide personalized advice.</span>
            <span>AI Status: <strong className={isAiEnabled ? "text-emerald-600" : "text-amber-600"}>{isAiEnabled ? "Active (Gemini)" : "Stopped (Offline)"}</strong></span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CareerAssistant;
