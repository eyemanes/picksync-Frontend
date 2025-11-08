import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Archive, Loader2, ArrowLeft, Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import PickCard from '../components/PickCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export default function HistoryDetail() {
  const { date: scanId } = useParams(); // route param is called "date" but it's actually scanId now
  const { token } = useAuth();
  const navigate = useNavigate();
  const [picks, setPicks] = useState([]);
  const [potdTitle, setPotdTitle] = useState('');
  const [potdDate, setPotdDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, hit, track, fade, none

  useEffect(() => {
    fetchPicksByScan();
  }, [scanId]);

  async function fetchPicksByScan() {
    try {
      const res = await fetch(`${API_URL}/api/archives/${scanId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        setPicks(data.picks);
        setPotdTitle(data.potdTitle || 'Pick of the Day');
        setPotdDate(data.potdDate || '');
      }
    } catch (err) {
      console.error('Failed to fetch picks:', err);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }

  const filteredPicks = filter === 'all' 
    ? picks 
    : picks.filter(p => p.user_action === filter);

  const stats = {
    total: picks.length,
    hit: picks.filter(p => p.user_action === 'hit').length,
    track: picks.filter(p => p.user_action === 'track').length,
    fade: picks.filter(p => p.user_action === 'fade').length,
    none: picks.filter(p => p.user_action === 'none').length,
    won: picks.filter(p => p.result === 'won').length,
    lost: picks.filter(p => p.result === 'lost').length,
    push: picks.filter(p => p.result === 'push').length,
  };

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.03),transparent_50%)]" />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <button
          onClick={() => navigate('/history')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to History
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-gold-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">{potdTitle}</h1>
              {potdDate && (
                <p className="text-gray-400 mt-1">{formatDate(potdDate)}</p>
              )}
            </div>
          </div>
          <p className="text-gray-400">{picks.length} total picks</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
          <div className="glass-strong p-4 rounded-xl">
            <div className="text-2xl font-bold text-white mb-1">{stats.total}</div>
            <div className="text-xs text-gray-400">Total</div>
          </div>
          <div className="glass-strong p-4 rounded-xl border border-green-500/20">
            <div className="text-2xl font-bold text-green-400 mb-1">{stats.hit}</div>
            <div className="text-xs text-gray-400">Hit</div>
          </div>
          <div className="glass-strong p-4 rounded-xl border border-blue-500/20">
            <div className="text-2xl font-bold text-blue-400 mb-1">{stats.track}</div>
            <div className="text-xs text-gray-400">Track</div>
          </div>
          <div className="glass-strong p-4 rounded-xl border border-red-500/20">
            <div className="text-2xl font-bold text-red-400 mb-1">{stats.fade}</div>
            <div className="text-xs text-gray-400">Fade</div>
          </div>
          <div className="glass-strong p-4 rounded-xl">
            <div className="text-2xl font-bold text-gray-400 mb-1">{stats.none}</div>
            <div className="text-xs text-gray-400">Ignored</div>
          </div>
          <div className="glass-strong p-4 rounded-xl border border-green-500/20 bg-green-500/5">
            <div className="text-2xl font-bold text-green-400 mb-1">{stats.won}</div>
            <div className="text-xs text-gray-400">Won ✅</div>
          </div>
          <div className="glass-strong p-4 rounded-xl border border-red-500/20 bg-red-500/5">
            <div className="text-2xl font-bold text-red-400 mb-1">{stats.lost}</div>
            <div className="text-xs text-gray-400">Lost ❌</div>
          </div>
          <div className="glass-strong p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
            <div className="text-2xl font-bold text-yellow-400 mb-1">{stats.push}</div>
            <div className="text-xs text-gray-400">Push ➖</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['all', 'hit', 'track', 'fade', 'none'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap
                ${filter === tab 
                  ? 'bg-gold-600 text-white shadow-lg shadow-gold-500/30' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Picks */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
          </div>
        ) : filteredPicks.length > 0 ? (
          <div className="space-y-4">
            {filteredPicks.map((pick, index) => (
              <PickCard key={pick.id} pick={pick} index={index} showResultButtons />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500">No picks in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}
