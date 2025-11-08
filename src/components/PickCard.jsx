import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, TrendingUp, Trophy, Clock, Calendar, Brain, MessageSquare, 
  ChevronDown, ChevronUp, Shield, Target, AlertCircle, Sparkles, Edit2, Trash2, Loader2 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export default function PickCard({ pick, index, showResultButtons = false, onEdit, onDelete }) {
  const { token, user } = useAuth();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [localGameTime, setLocalGameTime] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [userAction, setUserAction] = useState(pick.user_action || 'none');
  const [updating, setUpdating] = useState(false);
  const [localResult, setLocalResult] = useState(pick.result || 'pending');

  useEffect(() => {
    if (!pick.game_date || !pick.game_time) return;

    const calculateTimeInfo = () => {
      try {
        const timeStr = pick.game_time;
        
        const [year, month, day] = pick.game_date.split('-').map(Number);
        
        const hourMatch = timeStr.match(/(\d+)(?::(\d+))?\s*(am|pm|AM|PM)?/i);
        if (!hourMatch) {
          return '';
        }
        
        let hour = parseInt(hourMatch[1]);
        const minute = hourMatch[2] ? parseInt(hourMatch[2]) : 0;
        const isPM = timeStr.toLowerCase().includes('pm');
        
        if (isPM && hour !== 12) hour += 12;
        if (!isPM && hour === 12) hour = 0;
        
        let tzOffset = 0;
        const upperTime = timeStr.toUpperCase();
        
        if (upperTime.includes('EST') || upperTime.includes('EDT')) {
          tzOffset = -5;
        } else if (upperTime.includes('PST') || upperTime.includes('PDT')) {
          tzOffset = -8;
        } else if (upperTime.includes('CST') || upperTime.includes('CDT')) {
          tzOffset = -6;
        } else if (upperTime.includes('MST') || upperTime.includes('MDT')) {
          tzOffset = -7;
        } else {
          tzOffset = -5;
        }
        
        const utcDate = new Date(Date.UTC(
          year,
          month - 1,
          day,
          hour - tzOffset,
          minute,
          0,
          0
        ));
        
        const userLocalTime = utcDate.toLocaleTimeString('en-US', { 
          hour: 'numeric',
          minute: '2-digit',
          hour12: true 
        });
        setLocalGameTime(userLocalTime);
        
        const now = new Date();
        const diff = utcDate - now;

        if (diff < 0 && diff > -(3 * 60 * 60 * 1000)) {
          setIsLive(true);
          return 'LIVE NOW';
        } else {
          setIsLive(false);
        }

        if (diff < -(3 * 60 * 60 * 1000)) {
          return 'FINISHED';
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
        
      } catch (e) {
        console.error('Error calculating time:', e, pick);
        return '';
      }
    };

    const result = calculateTimeInfo();
    setTimeLeft(result);
    
    const interval = setInterval(() => {
      const result = calculateTimeInfo();
      setTimeLeft(result);
    }, 60000);

    return () => clearInterval(interval);
  }, [pick.game_date, pick.game_time]);

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'text-green-400 border-green-500/20 bg-green-500/10';
      case 'medium': return 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10';
      case 'high': return 'text-red-400 border-red-500/20 bg-red-500/10';
      default: return 'text-gray-400 border-gray-500/20 bg-gray-500/10';
    }
  };

  const keyFactors = (() => {
    try {
      if (typeof pick.key_factors === 'string') {
        return JSON.parse(pick.key_factors);
      }
      return pick.key_factors || [];
    } catch {
      return [];
    }
  })();

  const getCardBorderClass = () => {
    if (!showResultButtons) return 'hover:border-gold-500/30';
    
    if (localResult === 'won') return 'border-green-500/50 bg-green-500/5';
    if (localResult === 'lost') return 'border-red-500/50 bg-red-500/5';
    return 'hover:border-gray-500/30';
  };

  async function handleResultUpdate(result) {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/picks/${pick.id}/result`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ result })
      });
      if (res.ok) {
        setLocalResult(result);
      }
    } catch (err) {
      console.error('Failed to update result:', err);
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ y: -2 }}
      className="group"
    >
      <div className={`glass-strong rounded-2xl p-4 sm:p-6 transition-all duration-300 relative overflow-hidden ${getCardBorderClass()}`}>
        <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <div className="relative z-10">
          {/* Header - Rank & Confidence - MOBILE OPTIMIZED */}
          <div className="flex items-start justify-between mb-4 sm:mb-6 gap-2">
            <div className="flex items-center gap-2 sm:gap-4">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-gold-gradient flex items-center justify-center text-lg sm:text-2xl font-black text-black gold-glow flex-shrink-0"
              >
                #{pick.rank}
              </motion.div>
              <div>
                <div className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">Confidence</div>
                <div className="text-xl sm:text-3xl font-black gold-gradient">
                  {pick.confidence}%
                </div>
              </div>
            </div>

            {/* Poster Info - MOBILE OPTIMIZED */}
            <div className="text-right">
              <div className="flex items-center gap-1 sm:gap-2 justify-end mb-1">
                <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                <span className="text-xs sm:text-sm text-gray-300 font-semibold truncate max-w-[120px] sm:max-w-none">
                  u/{pick.comment_author}
                </span>
              </div>
              {pick.user_record && (
                <div className="text-xs sm:text-sm text-gold-400 font-mono">{pick.user_record}</div>
              )}
              {pick.comment_score > 0 && (
                <div className="text-[10px] sm:text-xs text-gray-600 mt-1">
                  ↑ {pick.comment_score} upvotes
                </div>
              )}
            </div>
          </div>

          {/* Game Info - MOBILE OPTIMIZED */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <div className="inline-block px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold
                              bg-gold-500/10 text-gold-400 border border-gold-500/20 uppercase">
                {pick.sport}
              </div>
              
              {pick.risk_factors && (
                <div className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold border ${getRiskColor(pick.risk_factors)} uppercase`}>
                  <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span className="hidden sm:inline">{pick.risk_factors} RISK</span>
                  <span className="sm:hidden">{pick.risk_factors}</span>
                </div>
              )}
              
              {timeLeft && (
                <motion.div
                  animate={isLive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                  transition={{ duration: 1.5, repeat: isLive ? Infinity : 0 }}
                  className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg ${
                    isLive 
                      ? 'bg-red-500/20 border-red-500/40 border-2' 
                      : timeLeft === 'FINISHED'
                      ? 'bg-gray-500/10 border-gray-500/20 border'
                      : 'bg-blue-500/10 border-blue-500/20 border'
                  }`}
                >
                  <Clock className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                    isLive 
                      ? 'text-red-400' 
                      : timeLeft === 'FINISHED'
                      ? 'text-gray-400'
                      : 'text-blue-400'
                  }`} />
                  <span className={`text-[10px] sm:text-xs font-bold ${
                    isLive 
                      ? 'text-red-400' 
                      : timeLeft === 'FINISHED'
                      ? 'text-gray-400'
                      : 'text-blue-400'
                  }`}>
                    {timeLeft}
                  </span>
                </motion.div>
              )}
              
              {localGameTime && (
                <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-400">
                  <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span className="font-medium">{localGameTime}</span>
                  <span className="text-gray-600 hidden sm:inline">(your time)</span>
                </div>
              )}
            </div>
            
            {pick.event && (
              <h3 className="text-base sm:text-xl font-bold text-white mb-2 leading-tight">
                {pick.event}
              </h3>
            )}
          </div>

          {/* The Pick - MOBILE OPTIMIZED */}
          <div className="mb-4 p-3 sm:p-4 rounded-xl glass border border-gold-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full blur-2xl" />
            <div className="relative">
              <div className="text-[10px] sm:text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold flex items-center gap-2">
                <Target className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                The Pick
              </div>
              <div className="text-base sm:text-xl font-bold text-gold-400 break-words">
                {pick.pick}
              </div>
            </div>
          </div>

          {/* Gamblina's Analysis - MOBILE OPTIMIZED */}
          {pick.reasoning && (
            <div className="mb-4">
              <button
                onClick={() => setShowAnalysis(!showAnalysis)}
                className="w-full text-left p-3 sm:p-4 rounded-xl glass border border-purple-500/20 hover:border-purple-500/40 transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="relative flex-shrink-0">
                      <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                      <Sparkles className="w-2 h-2 sm:w-3 sm:h-3 text-purple-300 absolute -top-1 -right-1 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[10px] sm:text-xs text-purple-400 uppercase tracking-wider font-semibold">
                        Gamblina's Analysis
                      </span>
                      <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 rounded bg-purple-500/20 text-[9px] sm:text-[10px] font-bold text-purple-300">
                        AI
                      </span>
                    </div>
                  </div>
                  {showAnalysis ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                </div>
              </button>
              
              <AnimatePresence>
                {showAnalysis && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 p-3 sm:p-5 rounded-xl glass border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
                      <div className="mb-3 sm:mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-px flex-1 bg-purple-500/20"></div>
                          <span className="text-[10px] sm:text-xs text-purple-400 uppercase tracking-wider font-semibold whitespace-nowrap">
                            Why {pick.confidence}% Confident
                          </span>
                          <div className="h-px flex-1 bg-purple-500/20"></div>
                        </div>
                        <p className="text-gray-200 leading-relaxed text-sm sm:text-[15px]">
                          {pick.reasoning}
                        </p>
                      </div>
                      
                      {keyFactors && keyFactors.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-[10px] sm:text-xs text-purple-400 uppercase tracking-wider font-semibold flex items-center gap-2">
                            <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            Key Factors
                          </div>
                          <div className="space-y-2 pl-1">
                            {keyFactors.map((factor, idx) => (
                              <motion.div 
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm"
                              >
                                <div className="flex-shrink-0 mt-1">
                                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-purple-400"></div>
                                </div>
                                <span className="text-gray-300 leading-relaxed">{factor}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Original Comment - MOBILE OPTIMIZED */}
          {pick.comment_body && (
            <div>
              <button
                onClick={() => setShowOriginal(!showOriginal)}
                className="w-full text-left p-3 sm:p-4 rounded-xl glass border border-blue-500/20 hover:border-blue-500/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
                    <span className="text-[10px] sm:text-xs text-blue-400 uppercase tracking-wider font-semibold">
                      Original Comment
                    </span>
                  </div>
                  {showOriginal ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                </div>
              </button>
              
              <AnimatePresence>
                {showOriginal && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 p-3 sm:p-4 rounded-xl glass border border-blue-500/20 bg-blue-500/5">
                      <p className="text-gray-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {pick.comment_body}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons - MOBILE OPTIMIZED */}
      <div className="space-y-2">
        {/* Admin Controls */}
        {user?.role === 'admin' && (
          <div className="flex gap-2 p-2 sm:p-3 border-t border-gray-800/50 bg-gray-900/30">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onEdit && onEdit(pick)}
              disabled={deleteLoading}
              className="flex-1 py-2 px-2 sm:px-3 rounded-lg font-bold text-xs sm:text-sm bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 transition-all flex items-center justify-center gap-1 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">EDIT</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={async () => {
                if (!token || deleteLoading || !confirm(`Delete pick "${pick.pick}"?`)) return;
                setDeleteLoading(true);
                try {
                  const res = await fetch(`${API_URL}/api/picks/${pick.id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                  });
                  if (res.ok && onDelete) onDelete(pick.id);
                } catch (err) {
                  console.error('Failed to delete pick:', err);
                } finally {
                  setDeleteLoading(false);
                }
              }}
              disabled={deleteLoading}
              className="flex-1 py-2 px-2 sm:px-3 rounded-lg font-bold text-xs sm:text-sm bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30 transition-all flex items-center justify-center gap-1 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleteLoading ? (
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
              ) : (
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
              <span className="hidden sm:inline">{deleteLoading ? 'DELETING...' : 'DELETE'}</span>
            </motion.button>
          </div>
        )}
        
        {/* User Action Buttons - MOBILE OPTIMIZED */}
        <div className="flex gap-2 p-3 sm:p-4 border-t border-gray-800/50">
        {showResultButtons ? (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleResultUpdate('won')}
              className={`flex-1 py-2.5 sm:py-3 px-2 sm:px-4 rounded-lg font-bold text-xs sm:text-sm transition-all
                ${localResult === 'won'
                  ? 'bg-green-600 text-white shadow-lg shadow-green-500/50 border-2 border-green-400'
                  : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:bg-green-600/20 hover:text-green-400 hover:border-green-500/30'
                }`}
            >
              ✅ WON
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleResultUpdate('lost')}
              className={`flex-1 py-2.5 sm:py-3 px-2 sm:px-4 rounded-lg font-bold text-xs sm:text-sm transition-all
                ${localResult === 'lost'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-500/50 border-2 border-red-400'
                  : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:bg-red-600/20 hover:text-red-400 hover:border-red-500/30'
                }`}
            >
              ❌ LOST
            </motion.button>
          </>
        ) : (
          <>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={async () => {
            if (!token || updating) return;
            setUpdating(true);
            try {
              const res = await fetch(`${API_URL}/api/picks/${pick.id}/action`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action: 'hit' })
              });
              if (res.ok) setUserAction('hit');
            } catch (err) {
              console.error('Failed to update action:', err);
            } finally {
              setUpdating(false);
            }
          }}
          disabled={updating}
          className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-4 rounded-lg font-bold text-xs sm:text-sm transition-all
            ${userAction === 'hit' 
              ? 'bg-green-600 text-white shadow-lg shadow-green-500/50' 
              : 'bg-gray-800 text-gray-400 hover:bg-green-600/20 hover:text-green-400'
            } disabled:opacity-50`}
        >
          ✅ HIT
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={async () => {
            if (!token || updating) return;
            setUpdating(true);
            try {
              const res = await fetch(`${API_URL}/api/picks/${pick.id}/action`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action: 'track' })
              });
              if (res.ok) setUserAction('track');
            } catch (err) {
              console.error('Failed to update action:', err);
            } finally {
              setUpdating(false);
            }
          }}
          disabled={updating}
          className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-4 rounded-lg font-bold text-xs sm:text-sm transition-all
            ${userAction === 'track' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50' 
              : 'bg-gray-800 text-gray-400 hover:bg-blue-600/20 hover:text-blue-400'
            } disabled:opacity-50`}
        >
          👀 TRACK
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={async () => {
            if (!token || updating) return;
            setUpdating(true);
            try {
              const res = await fetch(`${API_URL}/api/picks/${pick.id}/action`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action: 'fade' })
              });
              if (res.ok) setUserAction('fade');
            } catch (err) {
              console.error('Failed to update action:', err);
            } finally {
              setUpdating(false);
            }
          }}
          disabled={updating}
          className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-4 rounded-lg font-bold text-xs sm:text-sm transition-all
            ${userAction === 'fade' 
              ? 'bg-red-600 text-white shadow-lg shadow-red-500/50' 
              : 'bg-gray-800 text-gray-400 hover:bg-red-600/20 hover:text-red-400'
            } disabled:opacity-50`}
        >
          ❌ FADE
        </motion.button>
          </>
        )}
        </div>
      </div>
    </motion.div>
  );
}
