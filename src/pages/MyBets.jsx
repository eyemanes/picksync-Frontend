import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Loader2, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PickCard from '../components/PickCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export default function MyBets() {
  const { token } = useAuth();
  const [picks, setPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, hit, track

  useEffect(() => {
    fetchMyBets();
  }, []);

  async function fetchMyBets() {
    try {
      const res = await fetch(`${API_URL}/api/my-bets`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        setPicks(data.picks);
      }
    } catch (err) {
      console.error('Failed to fetch my bets:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredPicks = filter === 'all' 
    ? picks 
    : picks.filter(p => p.user_action === filter);

  const stats = {
    total: picks.length,
    hit: picks.filter(p => p.user_action === 'hit').length,
    track: picks.filter(p => p.user_action === 'track').length,
    won: picks.filter(p => p.result === 'won').length,
    lost: picks.filter(p => p.result === 'lost').length,
    pending: picks.filter(p => p.result === 'pending').length,
  };

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,136,0.03),transparent_50%)]" />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-8 h-8 text-green-400" />
            <h1 className="text-3xl font-bold text-white">My Bets</h1>
          </div>
          <p className="text-gray-400">Picks you're hitting or tracking</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong p-4 rounded-xl"
          >
            <div className="text-2xl font-bold text-white mb-1">{stats.total}</div>
            <div className="text-sm text-gray-400">Total Bets</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-strong p-4 rounded-xl border border-green-500/20"
          >
            <div className="text-2xl font-bold text-green-400 mb-1">{stats.hit}</div>
            <div className="text-sm text-gray-400">Hitting</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-strong p-4 rounded-xl border border-blue-500/20"
          >
            <div className="text-2xl font-bold text-blue-400 mb-1">{stats.track}</div>
            <div className="text-sm text-gray-400">Tracking</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-strong p-4 rounded-xl"
          >
            <div className="text-2xl font-bold text-white mb-1">
              {stats.won}/{stats.total}
            </div>
            <div className="text-sm text-gray-400">Won</div>
          </motion.div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {['all', 'hit', 'track'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-6 py-2 rounded-lg font-medium transition-all
                ${filter === tab 
                  ? 'bg-green-600 text-white shadow-lg shadow-green-500/30' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Picks List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-green-400" />
          </div>
        ) : filteredPicks.length > 0 ? (
          <div className="space-y-4">
            {filteredPicks.map((pick, index) => (
              <PickCard key={pick.id} pick={pick} index={index} showResultButtons />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Target className="w-16 h-16 mx-auto mb-4 text-gray-700" />
            <h3 className="text-xl font-bold text-gray-500 mb-2">No Bets Yet</h3>
            <p className="text-gray-600">
              Hit the HIT or TRACK buttons on picks you like!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
