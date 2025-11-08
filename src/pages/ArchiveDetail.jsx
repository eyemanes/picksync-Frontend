import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PickCard from '../components/PickCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export default function ArchiveDetail() {
  const { scanId } = useParams();
  const { token } = useAuth();
  const [picks, setPicks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPicks();
  }, [scanId]);

  async function fetchPicks() {
    try {
      const res = await fetch(`${API_URL}/api/archives/${scanId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setPicks(data.picks);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function updateResult(pickId, result) {
    try {
      await fetch(`${API_URL}/api/picks/${pickId}/result`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ result }),
      });

      // Update local state
      setPicks(picks.map(p => 
        p.id === pickId ? { ...p, result } : p
      ));
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-400"></div>
      </div>
    );
  }

  const stats = {
    won: picks.filter(p => p.result === 'won').length,
    lost: picks.filter(p => p.result === 'lost').length,
    push: picks.filter(p => p.result === 'push').length,
    pending: picks.filter(p => p.result === 'pending').length,
  };

  const winRate = stats.won + stats.lost > 0 
    ? ((stats.won / (stats.won + stats.lost)) * 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.03),transparent_50%)]" />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back button */}
        <Link to="/archives" className="inline-flex items-center gap-2 text-gray-400 hover:text-gold-400 mb-6">
          <ArrowLeft className="w-5 h-5" />
          Back to Archives
        </Link>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="glass-strong rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-white">{picks.length}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="glass-strong rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-green-400">{stats.won}</div>
            <div className="text-xs text-gray-500">Won</div>
          </div>
          <div className="glass-strong rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-red-400">{stats.lost}</div>
            <div className="text-xs text-gray-500">Lost</div>
          </div>
          <div className="glass-strong rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-gray-400">{stats.push}</div>
            <div className="text-xs text-gray-500">Push</div>
          </div>
          <div className="glass-strong rounded-xl p-4 text-center">
            <div className="text-2xl font-black gold-gradient">{winRate}%</div>
            <div className="text-xs text-gray-500">Win Rate</div>
          </div>
        </div>

        {/* Picks with result buttons */}
        <div className="space-y-4">
          {picks.map((pick, index) => (
            <div key={pick.id} className="relative">
              <PickCard pick={pick} index={index} />
              
              {/* Result buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => updateResult(pick.id, 'won')}
                  className={`p-2 rounded-lg transition-all ${
                    pick.result === 'won'
                      ? 'bg-green-500 text-white'
                      : 'glass border border-white/10 text-gray-500 hover:text-green-400'
                  }`}
                >
                  <CheckCircle className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => updateResult(pick.id, 'lost')}
                  className={`p-2 rounded-lg transition-all ${
                    pick.result === 'lost'
                      ? 'bg-red-500 text-white'
                      : 'glass border border-white/10 text-gray-500 hover:text-red-400'
                  }`}
                >
                  <XCircle className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => updateResult(pick.id, 'push')}
                  className={`p-2 rounded-lg transition-all ${
                    pick.result === 'push'
                      ? 'bg-gray-500 text-white'
                      : 'glass border border-white/10 text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <MinusCircle className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
