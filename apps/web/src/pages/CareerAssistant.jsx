import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
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
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // 1. Call authenticated backend assistant endpoint (automatically injects verified profile, skills, and gaps)
      const apiRes = await api.post('/ai/assistant', { message: userMessage });
      const botReply = apiRes.data.answer || apiRes.data.reply;
      if (botReply) {
        setMessages(prev => [...prev, { role: 'bot', content: botReply }]);
        return;
      }
    } catch (apiErr) {
      console.warn('Backend assistant call error, falling back to direct AI service:', apiErr);
    }

    try {
      // 2. Direct fallback to local AI service on port 8001
      const formData = new FormData();
      formData.append('query', userMessage);
      formData.append('context', JSON.stringify({ user: user?.firstName, role: user?.role }));

      const res = await axios.post('http://localhost:8001/career-assistant', formData);
      setMessages(prev => [...prev, { role: 'bot', content: res.data.answer || res.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: "I'm analyzing your current skills and career milestones. To maximize your placement compatibility, focus on clearing your high-priority skill gaps and completing verified projects!" 
      }]);
    } finally {
      setIsLoading(false);
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
          <div className="flex items-center gap-2 text-xs font-medium bg-white/10 px-3 py-1 rounded-full">
            <Sparkles size={14} />
            Powered by Google Gemini
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
                <div className="bg-white p-4 rounded-2xl rounded-tl-none border shadow-sm">
                  <Loader2 className="animate-spin text-indigo-600" size={18} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-6 border-t bg-white">
          <div className="flex gap-3">
            <input
              className="flex-1 p-3 border rounded-xl outline-indigo-600 text-sm"
              placeholder="Ask about your skill gaps, career path, or learning resources..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-3">
            The AI analyzes your profile and gaps to provide personalized advice.
          </p>
        </form>
      </div>
    </div>
  );
};

export default CareerAssistant;
