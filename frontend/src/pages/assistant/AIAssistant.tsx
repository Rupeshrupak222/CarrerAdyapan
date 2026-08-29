import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import BackButton from '../../components/common/BackButton';
import { useTheme } from '../../context/ThemeContext';
import { aiService } from '../../services/aiService';
import toast from 'react-hot-toast';
import {
  Sparkles,
  Send,
  Copy,
  Check,
  StopCircle,
  Bot,
  User as UserIcon,
  RefreshCw
} from 'lucide-react';

const INITIAL_WELCOME = {
  sender: 'assistant',
  text: `Hello! I am **HireAI**, your AI Recruitment & Career Intelligence Copilot for Adyapan Edutech.

I can assist you with:
- **Application & Candidate Data**: Real-time candidate search, ATS scores, open job requisitions, pipeline metrics, and interview schedules.
- **General Career & HR Intelligence**: Interview preparation tips, technical concepts (Frontend, Backend, AI/ML), drafting professional emails, and recruitment strategies.

How can I help you today?`,
};

// Rich Markdown & Table Formatter Component
const MarkdownContent: React.FC<{ content: string; isDark: boolean }> = ({ content, isDark }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let inList = false;
  let listItems: string[] = [];

  let inTable = false;
  let tableHeader: string[] = [];
  let tableRows: string[][] = [];

  const renderInline = (text: string) => {
    // Replace **bold** with <strong>
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-amber-600 dark:text-amber-400">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const flushList = () => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="my-2 space-y-1.5 list-none pl-1">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm">
              <span className="text-amber-500 mt-1 shrink-0 font-bold">•</span>
              <span className="leading-relaxed">{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const flushTable = () => {
    if (inTable && tableHeader.length > 0) {
      elements.push(
        <div key={`table-${elements.length}`} className="my-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={isDark ? 'bg-slate-900 border-b border-slate-800' : 'bg-slate-100/80 border-b border-slate-200'}>
                {tableHeader.map((th, idx) => (
                  <th key={idx} className="px-3 py-2 font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                    {renderInline(th.trim())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {tableRows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className={`${rIdx % 2 === 0 ? (isDark ? 'bg-slate-950/40' : 'bg-white') : (isDark ? 'bg-slate-900/30' : 'bg-slate-50/50')} hover:bg-amber-500/5 transition-colors`}
                >
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 text-slate-700 dark:text-slate-300 whitespace-nowrap sm:whitespace-normal">
                      {renderInline(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      inTable = false;
      tableHeader = [];
      tableRows = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      flushTable();
      continue;
    }

    // Markdown Table Detection (lines starting and ending with |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList();
      const cells = trimmed.slice(1, -1).split('|');

      // Check if it's the separator row (e.g. |---|---|)
      if (cells.every(c => /^[\s-:]+$/.test(c))) {
        // Skip separator row
        continue;
      }

      if (!inTable) {
        inTable = true;
        tableHeader = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    } else {
      flushTable();
    }

    // Headers
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={`h3-${i}`} className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-3 mb-1.5 flex items-center gap-1.5">
          {trimmed.slice(4)}
        </h3>
      );
      continue;
    }

    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={`h2-${i}`} className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-4 mb-2">
          {trimmed.slice(3)}
        </h2>
      );
      continue;
    }

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***') {
      flushList();
      elements.push(
        <hr key={`hr-${i}`} className="my-3 border-slate-200 dark:border-slate-800" />
      );
      continue;
    }

    // Bullet items
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      inList = true;
      listItems.push(trimmed.slice(2));
      continue;
    }

    // Numbered items
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      flushList();
      elements.push(
        <div key={`num-${i}`} className="my-1.5 flex items-start gap-2 text-xs sm:text-sm pl-1">
          <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
            {numMatch[1]}
          </span>
          <div className="flex-1 leading-relaxed">{renderInline(numMatch[2])}</div>
        </div>
      );
      continue;
    }

    // Standard paragraph
    flushList();
    elements.push(
      <p key={`p-${i}`} className="my-1.5 text-xs sm:text-sm leading-relaxed">
        {renderInline(line)}
      </p>
    );
  }

  flushList();
  flushTable();

  return <div className="space-y-1">{elements}</div>;
};

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState([INITIAL_WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Reset conversation memory and start a new chat?')) return;
    try {
      await aiService.clearHistory();
      setMessages([INITIAL_WELCOME]);
      toast.success('Conversation reset');
    } catch (e) {
      setMessages([INITIAL_WELCOME]);
      toast.success('Chat cleared');
    }
  };

  const handleCopyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success('Response copied to clipboard!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
      toast.success('Generation stopped');
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
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // 3. Call Streaming API
    await aiService.streamQuery({
      message: userQuery,
      history: messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        text: m.text,
      })),
      signal: abortController.signal,
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
        abortControllerRef.current = null;
        toast.error(errorMsg || 'Communication error with AI Copilot');
        setMessages((prev) => {
          const updated = [...prev];
          if (updated[assistantIndex]) {
            updated[assistantIndex] = {
              sender: 'assistant',
              text: `⚠️ **Notice**: ${errorMsg || 'Unable to connect to AI server. Please try again in a moment.'}`,
            };
          }
          return updated;
        });
      },
      onComplete: () => {
        setLoading(false);
        abortControllerRef.current = null;
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className={`p-6 rounded-3xl border transition-all relative overflow-hidden shadow-sm ${
          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div className="space-y-1.5">
              <BackButton label="Back to Dashboard" to="/dashboard" />
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                <Sparkles size={13} className="text-amber-500" />
                <span>Adyapan AI Hiring &amp; Career Intelligence</span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                AI Recruitment Copilot
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-normal">
                Natural-language assistant with verified database tools, multi-turn memory &amp; career guidance.
              </p>
            </div>

            <button
              onClick={handleClearHistory}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 self-start sm:self-center shrink-0 shadow-sm cursor-pointer ${
                isDark
                  ? 'bg-slate-950 text-slate-300 border-slate-700 hover:border-amber-400'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400 hover:bg-slate-50'
              }`}
              title="Reset conversation context"
            >
              <RefreshCw size={14} className="text-amber-500" />
              <span>New Conversation</span>
            </button>
          </div>
        </div>

        {/* Chat Window */}
        <div className={`rounded-3xl border shadow-sm flex flex-col h-[580px] overflow-hidden ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          {/* Messages Container */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4">
            {messages.map((msg, index) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                      <Bot size={17} />
                    </div>
                  )}

                  <div className={`group relative max-w-[85%] sm:max-w-2xl p-4 sm:p-5 rounded-2xl text-xs sm:text-sm font-normal leading-relaxed shadow-sm transition-all ${
                    isUser
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-br-none whitespace-pre-line'
                      : isDark
                      ? 'bg-slate-950 text-slate-100 border border-slate-800 rounded-bl-none'
                      : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-bl-none'
                  }`}>
                    {isUser ? (
                      <div>{msg.text}</div>
                    ) : (
                      <>
                        <MarkdownContent content={msg.text} isDark={isDark} />

                        {msg.text && (
                          <div className="flex items-center justify-end gap-2 pt-2 mt-2 border-t border-slate-200/50 dark:border-slate-800/60 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleCopyMessage(msg.text, index)}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
                              title="Copy response"
                            >
                              {copiedIndex === index ? (
                                <>
                                  <Check size={12} className="text-emerald-500" />
                                  <span className="text-emerald-500">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={12} />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                      <UserIcon size={17} />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && messages[messages.length - 1]?.text === '' && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Bot size={17} />
                </div>
                <div className="bg-amber-500/10 text-amber-800 dark:text-amber-300 px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 border border-amber-500/20 shadow-sm">
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                  <span>HireAI is thinking &amp; generating response...</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input */}
          <div className={`p-4 border-t flex items-center gap-3 ${
            isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-white/60'
          }`}>
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask HireAI anything: e.g. How many candidates are shortlisted? How to prepare for an HR interview?"
              className={`flex-1 px-4 py-3 text-xs sm:text-sm font-normal border rounded-2xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 resize-none max-h-24 ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                  : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
              }`}
            />

            {loading ? (
              <button
                onClick={handleStopGeneration}
                className="px-4 py-3 text-xs font-bold text-red-600 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-2xl transition-all shadow-sm shrink-0 flex items-center gap-1.5 cursor-pointer"
                title="Stop generation"
              >
                <StopCircle size={15} />
                <span>Stop</span>
              </button>
            ) : (
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className={`px-5 py-3 text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-2xl transition-all shadow-md shrink-0 uppercase tracking-wider flex items-center gap-1.5 ${
                  !input.trim() ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02] active:scale-95'
                }`}
              >
                <span>Send</span>
                <Send size={13} />
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIAssistant;