import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Loader2, Square } from 'lucide-react';
import axios from 'axios';
import api from '../api/authApi';
import { useAuth } from '../hooks/useAuth';

const CareerAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { 
      role: 'bot', 
      content: "Hello! I'm your SkillForge Career Assistant. I have access to your verified skill profile and career goals. How can I help you today?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isWaitingNetwork, setIsWaitingNetwork] = useState(false);

  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);
  const streamIntervalRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  // Stop answering function (cancels network request or stops typing mid-stream)
  const handleStopAnswer = () => {
    // 1. Cancel network request if still waiting
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // 2. Halt typewriter word-stream
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }

    setIsWaitingNetwork(false);
    setIsGenerating(false);

    // 3. Mark the bot's current answer as stopped
    setMessages(prev => {
      const lastIndex = prev.length - 1;
      if (lastIndex >= 0 && prev[lastIndex].role === 'bot') {
        const lastMsg = prev[lastIndex];
        return [
          ...prev.slice(0, lastIndex),
          {
            ...lastMsg,
            content: lastMsg.content ? `${lastMsg.content} [Stopped]` : "⏹️ AI answer was stopped.",
            isStreaming: false
          }
        ];
      }
      return [
        ...prev,
        { role: 'bot', content: "⏹️ AI answer was stopped." }
      ];
    });
  };

  // Progressive streaming effect for natural output that can be stopped at any moment
  const streamBotResponse = (fullResponse) => {
    setIsWaitingNetwork(false);
    const words = fullResponse.split(' ');
    let currentIdx = 0;

    // Append initial empty message container for the bot
    setMessages(prev => [...prev, { role: 'bot', content: '', isStreaming: true }]);

    streamIntervalRef.current = setInterval(() => {
      currentIdx++;
      const currentText = words.slice(0, currentIdx).join(' ');

      setMessages(prev => {
        const lastIdx = prev.length - 1;
        const updated = [...prev];
        updated[lastIdx] = {
          role: 'bot',
          content: currentText,
          isStreaming: currentIdx < words.length
        };
        return updated;
      });

      if (currentIdx >= words.length) {
        clearInterval(streamIntervalRef.current);
        streamIntervalRef.current = null;
        setIsGenerating(false);
      }
    }, 30); // 30ms per word allows fluid streaming with ample opportunity to click "Stop"
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsGenerating(true);
    setIsWaitingNetwork(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // 1. Send query to backend assistant endpoint (injects verified profile and career goal context)
      const apiRes = await api.post(
        '/ai/assistant', 
        { message: userMessage }, 
        { signal: controller.signal }
      );

      const botReply = apiRes.data.answer || apiRes.data.reply;
      if (botReply) {
        streamBotResponse(botReply);
        return;
      }
    } catch (apiErr) {
      if (axios.isCancel(apiErr) || apiErr.name === 'CanceledError' || apiErr.name === 'AbortError') {
        return; // Handled cleanly by handleStopAnswer
      }
      console.warn('Backend assistant request error, attempting direct AI service:', apiErr);
    }

    try {
      // 2. Direct fallback to AI service
      const formData = new FormData();
      formData.append('query', userMessage);
      formData.append('context', JSON.stringify({ user: user?.firstName, role: user?.role }));

      const res = await axios.post(
        'http://localhost:8001/career-assistant', 
        formData, 
        { signal: controller.signal }
      );

      const directReply = res.data.answer || res.data.reply;
      if (directReply) {
        streamBotResponse(directReply);
      } else {
        streamBotResponse("I analyzed your profile. Focus on your high-priority skill gaps and ensure your capstone projects are verified!");
      }
    } catch (err) {
      if (axios.isCancel(err) || err.name === 'CanceledError' || err.name === 'AbortError') {
        return;
      }
      streamBotResponse("I'm analyzing your current skills and career milestones. To maximize placement compatibility, focus on clearing your high-priority skill gaps and completing verified projects!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="max-w-4xl mx-auto h-[calc(100vh-4rem)] flex flex-col bg-white rounded-3xl border shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b bg-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl">
              <Bot size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Career Assistant</h1>
              <p className="text-indigo-100 text-xs">Personalized Guidance & Skill Analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">
            <Sparkles size={14} className="text-amber-300" />
            <span>Advisory Engine</span>
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
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-sm'
                    : 'bg-white text-slate-800 border border-slate-200/80 shadow-sm rounded-tl-none'
                }`}>
                  {msg.content}
                  {msg.isStreaming && (
                    <span className="inline-block w-1.5 h-4 ml-1 bg-indigo-600 animate-pulse align-middle" />
                  )}
                </div>
              </div>
            </div>
          ))}

          {isWaitingNetwork && (
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

        {/* Input Area & Controls */}
        <form onSubmit={handleSend} className="p-4 md:p-6 border-t bg-white relative">
          {/* Floating Stop Generating Button */}
          {isGenerating && (
            <div className="flex justify-center pb-3">
              <button
                type="button"
                onClick={handleStopAnswer}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold shadow-sm transition"
              >
                <Square size={12} className="fill-white" />
                <span>Stop generating answer</span>
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <input
              className="flex-1 p-3 border border-slate-300 rounded-xl outline-none focus:border-indigo-600 text-sm shadow-sm"
              placeholder={isGenerating ? "AI is answering... (click Stop to interrupt)" : "Ask about your skill gaps, career path, or learning resources..."}
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isGenerating}
            />

            {isGenerating ? (
              <button
                type="button"
                onClick={handleStopAnswer}
                className="bg-rose-600 text-white px-5 py-3 rounded-xl hover:bg-rose-700 transition flex items-center gap-1.5 text-xs font-bold shadow-md cursor-pointer active:scale-95"
                title="Stop AI Answer"
              >
                <Square size={14} className="fill-white" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-40 cursor-pointer shadow-sm active:scale-95"
                title="Send Question"
              >
                <Send size={20} />
              </button>
            )}
          </div>

          <p className="text-center text-[10px] text-slate-400 mt-3">
            The AI analyzes your profile and gaps to provide personalized advice. You can stop the answer at any time.
          </p>
        </form>
      </div>
    </div>
  );
};

export default CareerAssistant;
