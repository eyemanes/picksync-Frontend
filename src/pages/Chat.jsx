import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Brain, User, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export default function Chat() {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function fetchHistory() {
    try {
      const res = await fetch(`${API_URL}/api/chat/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        const formatted = data.history.reverse().map(h => ([
          { role: 'user', content: h.user_message },
          { role: 'assistant', content: h.ai_response },
        ])).flat();
        setMessages(formatted);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.03),transparent_50%)]" />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />

      <div className="relative z-10 flex-1 flex flex-col max-w-4xl mx-auto w-full p-3 sm:p-4">
        {/* Header */}
        <div className="mb-3 sm:mb-4 text-center">
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-2">
            <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
            <h1 className="text-2xl sm:text-3xl font-black gold-gradient">Chat with Grok</h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500">Ask about picks, sentiment, or strategy</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-3 sm:mb-4 space-y-3 sm:space-y-4 scrollbar-thin scrollbar-thumb-gold-500">
          {messages.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <Brain className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-800" />
              <p className="text-sm sm:text-base text-gray-500">Start a conversation with Grok</p>
              <div className="mt-4 sm:mt-6 space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                <p>Try asking:</p>
                <p>"What's your take on today's picks?"</p>
                <p>"Which sport looks best today?"</p>
                <p>"Should I hammer the Lakers pick?"</p>
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 sm:gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
                </div>
              )}
              
              <div
                className={`max-w-[85%] sm:max-w-[80%] px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-sm sm:text-base ${
                  msg.role === 'user'
                    ? 'bg-gold-gradient text-black font-semibold'
                    : 'glass-strong border border-purple-500/20 text-gray-300'
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gold-gradient flex items-center justify-center flex-shrink-0">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
                </div>
              )}
            </motion.div>
          ))}

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2 sm:gap-3"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
              </div>
              <div className="glass-strong border border-purple-500/20 px-3 sm:px-4 py-2 sm:py-3 rounded-xl">
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 animate-spin" />
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="glass-strong rounded-xl p-3 sm:p-4 border border-white/10">
          <div className="flex gap-2 sm:gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Grok anything..."
              className="flex-1 bg-transparent text-white text-sm sm:text-base placeholder-gray-600 outline-none"
              disabled={loading}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading || !input.trim()}
              className="px-3 sm:px-4 py-2 bg-gold-gradient text-black font-bold rounded-lg
                       disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline text-sm">Send</span>
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}
