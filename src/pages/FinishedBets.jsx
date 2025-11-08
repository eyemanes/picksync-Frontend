import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Minus, Filter, Check, X, 
  Edit2, Save, Calendar, User, Target, Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export default function FinishedBets() {
  const { token } = useAuth();
  const [picks, setPicks] = useState([]);
  const [filteredPicks, setFilteredPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [editingPick, setEditingPick] = useState(null);
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    fetchFinishedPicks();
  }, []);

  useEffect(() => {
    if (selectedFilter === 'ALL') {
      setFilteredPicks(picks);
    } else {
      setFilteredPicks(picks.filter(p => p.result === selectedFilter.toLowerCase()));
    }
  }, [selectedFilter, picks]);

  async function fetchFinishedPicks() {
    try {
      const res = await fetch(`${API_URL}/api/picks/finished`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setPicks(data.picks);
        setFilteredPicks(data.picks);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function updatePickResult(pickId, result, notes = '') {
    try {
      const res = await fetch(`${API_URL}/api/picks/${pickId}/result`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ result, notes }),
      });
      
      if (res.ok) {
        // Update local state
        setPicks(picks.map(p => 
          p.id === pickId 
            ? { ...p, result, notes, updated_at: new Date().toISOString() }
            : p
        ));
        setEditingPick(null);
        setEditNotes('');
      }
    } catch (err) {
      console.error(err);
    }
  }

  function handleEditClick(pick) {
    setEditingPick(pick.id);
    setEditNotes(pick.notes || '');
  }

  function handleSaveClick(pickId, result) {
    updatePickResult(pickId, result, editNotes);
  }

  const getResultColor = (result) => {
    switch (result) {
      case 'won': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'lost': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'push': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getResultIcon = (result) => {
    switch (result) {
      case 'won': return <Check className="w-5 h-5" />;
      case 'lost': return <X className="w-5 h-5" />;
      case 'push': return <Minus className="w-5 h-5" />;
      default: return null;
    }
  };

  // Calculate stats
  const stats = {
    total: picks.length,
    won: picks.filter(p => p.result === 'won').length,
    lost: picks.filter(p => p.result === 'lost').length,
    push: picks.filter(p => p.result === 'push').length,
  };
  const winRate = stats.total > 0 ? ((stats.won / (stats.won + stats.lost)) * 100).toFixed(1) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.03),transparent_50%)]" />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black gold-gradient mb-2">Finished Bets</h1>
          <p className="text-gray-500">Track your betting results and performance</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="glass-strong rounded-xl p-4 border border-white/5">
            <div className="text-sm text-gray-500 mb-1">Total Bets</div>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </div>
          <div className="glass-strong rounded-xl p-4 border border-green-500/20">
            <div className="text-sm text-gray-500 mb-1">Won</div>
            <div className="text-2xl font-bold text-green-400">{stats.won}</div>
          </div>
          <div className="glass-strong rounded-xl p-4 border border-red-500/20">
            <div className="text-sm text-gray-500 mb-1">Lost</div>
            <div className="text-2xl font-bold text-red-400">{stats.lost}</div>
          </div>
          <div className="glass-strong rounded-xl p-4 border border-yellow-500/20">
            <div className="text-sm text-gray-500 mb-1">Push</div>
            <div className="text-2xl font-bold text-yellow-400">{stats.push}</div>
          </div>
          <div className="glass-strong rounded-xl p-4 border border-gold-500/20">
            <div className="text-sm text-gray-500 mb-1">Win Rate</div>
            <div className="text-2xl font-bold gold-gradient">{winRate}%</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['ALL', 'WON', 'LOST', 'PUSH', 'PENDING'].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                selectedFilter === filter
                  ? 'bg-gold-gradient text-black'
                  : 'glass border border-white/10 text-gray-400 hover:border-gold-500/30'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Picks List */}
        {filteredPicks.length === 0 ? (
          <div className="text-center py-20">
            <Filter className="w-20 h-20 mx-auto mb-4 text-gray-800" />
            <p className="text-gray-500">No {selectedFilter.toLowerCase()} bets found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPicks.map((pick, index) => (
              <motion.div
                key={pick.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="glass-strong rounded-xl p-6 border border-white/5 hover:border-gold-500/20 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  {/* Pick Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono text-gray-500">
                        {new Date(pick.created_at).toLocaleDateString()}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-bold bg-gold-500/10 text-gold-400 border border-gold-500/20 uppercase">
                        {pick.sport}
                      </span>
                      {pick.confidence && (
                        <span className="px-2 py-1 rounded text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          {pick.confidence}% Confidence
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-2">{pick.teams}</h3>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-gray-500" />
                      <span className="text-gold-400 font-semibold">{pick.pick}</span>
                    </div>

                    {pick.poster && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <User className="w-4 h-4" />
                        <span>u/{pick.poster}</span>
                        {pick.poster_record && (
                          <span className="text-gold-400 font-mono">({pick.poster_record})</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Result Badge */}
                  <div className={`px-4 py-2 rounded-xl border font-bold text-sm flex items-center gap-2 ${getResultColor(pick.result)}`}>
                    {getResultIcon(pick.result)}
                    {pick.result.toUpperCase()}
                  </div>
                </div>

                {/* Result Controls */}
                <div className="border-t border-white/5 pt-4 mt-4">
                  {editingPick === pick.id ? (
                    // Edit Mode
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveClick(pick.id, 'won')}
                          className="flex-1 py-2 px-4 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Won
                        </button>
                        <button
                          onClick={() => handleSaveClick(pick.id, 'lost')}
                          className="flex-1 py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Lost
                        </button>
                        <button
                          onClick={() => handleSaveClick(pick.id, 'push')}
                          className="flex-1 py-2 px-4 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                          <Minus className="w-4 h-4" />
                          Push
                        </button>
                      </div>
                      
                      <textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="Add notes about this bet..."
                        className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:border-gold-500/50 focus:outline-none resize-none"
                        rows="2"
                      />
                      
                      <button
                        onClick={() => {
                          setEditingPick(null);
                          setEditNotes('');
                        }}
                        className="text-sm text-gray-500 hover:text-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    // View Mode
                    <div>
                      {pick.notes && (
                        <div className="mb-3 p-3 rounded-lg bg-black/20 border border-white/5">
                          <div className="text-xs text-gray-500 mb-1">Notes:</div>
                          <p className="text-sm text-gray-300">{pick.notes}</p>
                        </div>
                      )}
                      
                      <button
                        onClick={() => handleEditClick(pick)}
                        className="flex items-center gap-2 text-sm text-gold-400 hover:text-gold-300 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Result
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
