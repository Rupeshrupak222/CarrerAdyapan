import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import BackButton from '../../components/common/BackButton';
import { useTheme } from '../../context/ThemeContext';
import { aiService } from '../../services/aiService';
import toast from 'react-hot-toast';

const QUICK_PROMPTS = [
  "Analyze Rahul's resume & find missing skills",
  "Who are the top candidates for open roles?",
  "Compare Rahul with Priya for the BDA role",
  "Draft 3 technical & behavioral interview questions",
  "Summarize my recruitment pipeline status",
];

const INITIAL_WELCOME = {
  sender: 'assistant',
  text: "Hello! I am **HireAI**, your AI Recruitment Copilot for Adyapan Edutech. How can I help you today with candidate evaluations, resume analysis, or your hiring workflow?",
};

const AIAssistant = () => {
  const [messages, setMessages] = useState([INITIAL_WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const chatBottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClearHistory = async () => {
    try {
      await aiService.clearHistory();
      setMessages([INITIAL_WELCOME]);
      toast.success('Conversation memory reset');
    } catch (e) {
      setMessages([INITIAL_WELCOME]);
      toast.success('Chat cleared');
    }
  };

  const handleSend = async (customPrompt?: string) => {
    const userQuery = (customPrompt || input).trim();
    if (!userQuery || loading) return;

    // 1. Add User Message to Chat
    const userMsg = { sender: 'user', text: userQuery };
    const currentHistory = [...messages, userMsg];

    setMessages(currentHistory);
    if (!customPrompt) setInput('');
    setLoading(true);

    // 2. Add placeholder assistant message for streaming
    const assistantIndex = currentHistory.length;
    setMessages((prev) => [...prev, { sender: 'assistant', text: '' }]);

    let streamedText = '';

    // 3. Call Streaming API
    await aiService.streamQuery({
      message: userQuery,
      history: messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        text: m.text,
      })),
      onChunk: (chunk) => {
        streamedText += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          if (updated[assistantIndex]) {
            updated[assistantIndex] = { sender: 'assistant', text: streamedText };
          }
          return updated;
        });
      },
      onError: (errorMsg) => {
        setLoading(false);
        toast.error(errorMsg || 'Error communicating with Gemini Copilot');
        setMessages((prev) => {
          const updated = [...prev];
          if (updated[assistantIndex]) {
            updated[assistantIndex] = {
              sender: 'assistant',
              text: `⚠️ **Service Notice**: ${errorMsg || 'Unable to connect to AI server. Please check backend connection.'}`,
            };
          }
          return updated;
        });
      },
      onComplete: () => {
        setLoading(false);
      },
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageText = (text: string) => {
    if (!text) return '';
    return text
      .replace(/^```(json|markdown|code|javascript)?/gi, '')
      .replace(/```$/g, '')
      .trim();
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className={`p-6 rounded-3xl border transition-all relative overflow-hidden shadow-sm ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div className="space-y-1.5">
              <BackButton label="Back to Dashboard" to="/dashboard" />
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                Adyapan Gemini AI Hiring Intelligence
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                AI Recruitment Copilot
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-normal">
                Natural-language ATS assistant with database tools retrieval, candidate resume analysis & multi-turn memory.
              </p>
            </div>

            <button
              onClick={handleClearHistory}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 self-start sm:self-center shrink-0 shadow-sm ${theme === 'dark'
                  ? 'bg-slate-950 text-slate-300 border-slate-700 hover:border-amber-400'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400 hover:bg-slate-50'
                }`}
              title="Reset conversation context"
            >
              <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>New Conversation</span>
            </button>
          </div>
        </div>

        {/* Prompt Chips */}
        <div className={`p-6 rounded-3xl border shadow-sm space-y-3 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
            Suggested Recruitment Prompts:
          </span>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all text-left shadow-sm ${theme === 'dark'
                    ? 'bg-slate-950 text-slate-200 hover:border-amber-400 border-slate-800'
                    : 'bg-white text-slate-800 hover:bg-slate-100 hover:border-slate-300 border-slate-200'
                  }`}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className={`rounded-3xl border shadow-sm flex flex-col h-[560px] overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
          {/* Messages Container */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-2xl p-4 sm:p-5 rounded-2xl text-xs sm:text-sm font-normal leading-relaxed shadow-sm transition-all ${msg.sender === 'user'
                      ? 'bg-amber-400 text-slate-950 font-semibold rounded-br-none whitespace-pre-line'
                      : theme === 'dark'
                        ? 'bg-slate-950 text-slate-100 border border-slate-800 rounded-bl-none'
                        : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-bl-none'
                    }`}
                >
                  {/* Markdown Renderer Simple Parser */}
                  <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                    {formatMessageText(msg.text) || (loading && index === messages.length - 1 ? 'Thinking...' : '')}
                  </div>
                </div>
              </div>
            ))}

            {loading && messages[messages.length - 1]?.text === '' && (
              <div className="flex justify-start">
                <div className="bg-amber-500/15 text-amber-800 dark:text-amber-300 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 border border-amber-500/30 shadow-sm">
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                  <span>HireAI is querying candidate database & generating response...</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input */}
          <div className={`p-4 border-t flex items-center gap-3 ${theme === 'dark' ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-white/40'
            }`}>
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask HireAI: e.g. Analyze Rahul's resume. What are his missing skills? Compare him with Priya..."
              className={`flex-1 px-4 py-3 text-xs sm:text-sm font-normal border rounded-2xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 resize-none max-h-24 ${theme === 'dark'
                  ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                  : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                }`}
            />

            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className={`px-5 py-3 text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-2xl transition-all shadow-md shrink-0 uppercase tracking-wider flex items-center gap-1.5 ${loading || !input.trim() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02]'
                }`}
            >
              <span>Send</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIAssistant;