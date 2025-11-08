import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Archive, Loader2, ChevronRight, Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export default function History() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [potds, setPotds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPOTDs();
  }, []);

  async function fetchPOTDs() {
    try {
      const res = await fetch(`${API_URL}/api/archives/potds`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        setPotds(data.potds);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return 'Unknown Date';
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

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.03),transparent_50%)]" />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Archive className="w-8 h-8 text-gold-400" />
            <h1 className="text-3xl font-bold text-white">POTD History</h1>
          </div>
          <p className="text-gray-400">View picks from past Pick of the Day threads</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
          </div>
        ) : potds.length > 0 ? (
          <div className="space-y-3">
            {potds.map((potd, index) => (
              <motion.button
                key={potd.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/history/${potd.id}`)}
                className="w-full glass-strong p-5 rounded-xl hover:bg-gray-800/50 
                         transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-gold-500/10 flex items-center 
                                justify-center flex-shrink-0">
                    <Trophy className="w-6 h-6 text-gold-400" />
                  </div>
                  
                  <div className="text-left flex-1 min-w-0">
                    <div className="text-white font-medium truncate">
                      {potd.potd_title || 'Pick of the Day'}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                      <span>{formatDate(potd.potd_date)}</span>
                      <span>•</span>
                      <span className="text-gold-400 font-semibold">
                        {potd.actual_picks || potd.total_picks || 0} picks
                      </span>
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-gold-400 
                                       transition-colors flex-shrink-0" />
              </motion.button>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Archive className="w-16 h-16 mx-auto mb-4 text-gray-700" />
            <h3 className="text-xl font-bold text-gray-500 mb-2">No History Yet</h3>
            <p className="text-gray-600">
              Old POTDs will appear here when you scan a new day's thread
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
