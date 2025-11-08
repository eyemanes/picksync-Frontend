import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Clock, Calendar, Users, FileText } from 'lucide-react';

export default function EditPickModal({ pick, isOpen, onClose, onSave, token }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    game_time: '',
    game_date: '',
    teams: '',
    notes: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && pick) {
      setFormData({
        game_time: pick.game_time || '',
        game_date: pick.game_date || '',
        teams: pick.teams || '',
        notes: pick.notes || ''
      });
    }
  }, [isOpen, pick]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/admin/picks/${pick.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        onSave(pick.id, formData);
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update pick');
      }
    } catch (err) {
      console.error('Failed to update pick:', err);
      alert('Failed to update pick. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4" 
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-gray-900 rounded-2xl border border-gold-500/20 p-6 max-h-[90vh] overflow-y-auto shadow-2xl"
            style={{ position: 'relative', zIndex: 10000 }}
          >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Edit Pick Info</h2>
              <p className="text-sm text-gray-400 mt-1">Update game time and additional information</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Pick Info Display */}
          <div className="mb-6 p-4 rounded-xl bg-gold-500/5 border border-gold-500/20">
            <div className="text-xs text-gold-400 uppercase tracking-wider font-semibold mb-1">
              The Pick
            </div>
            <div className="text-lg font-bold text-white">{pick.pick}</div>
            <div className="text-sm text-gray-400 mt-1">
              by u/{pick.poster} • {pick.confidence}% confidence
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Game Date */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-400 mb-2">
                <Calendar className="w-4 h-4" />
                Game Date
              </label>
              <input
                type="date"
                value={formData.game_date}
                onChange={(e) => setFormData({ ...formData, game_date: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700 text-white focus:border-gold-500 focus:outline-none"
              />
            </div>

            {/* Game Time */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-400 mb-2">
                <Clock className="w-4 h-4" />
                Game Time (e.g., "7:00 PM EST" or "19:00")
              </label>
              <input
                type="text"
                value={formData.game_time}
                onChange={(e) => setFormData({ ...formData, game_time: e.target.value })}
                placeholder="7:00 PM EST"
                className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700 text-white focus:border-gold-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Include timezone (EST, PST, CST, etc.)
              </p>
            </div>

            {/* Teams */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-400 mb-2">
                <Users className="w-4 h-4" />
                Teams/Matchup
              </label>
              <input
                type="text"
                value={formData.teams}
                onChange={(e) => setFormData({ ...formData, teams: e.target.value })}
                placeholder="Team A vs Team B"
                className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700 text-white focus:border-gold-500 focus:outline-none"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-400 mb-2">
                <FileText className="w-4 h-4" />
                Admin Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any additional information or notes about this pick..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700 text-white focus:border-gold-500 focus:outline-none resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 rounded-xl bg-gold-gradient text-black font-bold shadow-lg gold-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
              <button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-gray-700 text-white font-bold hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
      )}
    </>
  );
}
