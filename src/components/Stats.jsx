import { motion } from 'framer-motion';
import { TrendingUp, Users, Target, Trophy } from 'lucide-react';

export default function Stats({ picks, allPicks }) {
  const avgConfidence = picks.length > 0
    ? (picks.reduce((sum, p) => sum + p.confidence, 0) / picks.length).toFixed(1)
    : 0;

  const topPick = picks[0];
  
  // Count unique sports
  const uniqueSports = new Set(allPicks.map(p => p.sport?.toUpperCase()).filter(Boolean)).size;
  
  const stats = [
    { label: 'Total Picks', value: picks.length, icon: Target, color: 'text-blue-400' },
    { label: 'Avg Confidence', value: `${avgConfidence}%`, icon: TrendingUp, color: 'text-green-400' },
    { label: 'Top Pick', value: `${topPick?.confidence || 0}%`, icon: Trophy, color: 'text-gold-400' },
    { label: 'Sports', value: uniqueSports, icon: Users, color: 'text-purple-400' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -2 }}
            className="glass-strong rounded-xl p-3 sm:p-5 text-center border border-white/5 hover:border-gold-500/30 transition-all"
          >
            <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color} mx-auto mb-1 sm:mb-2`} />
            <div className="text-2xl sm:text-3xl font-black text-white mb-0.5 sm:mb-1">{stat.value}</div>
            <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider font-semibold">{stat.label}</div>
          </motion.div>
        );
      })}
    </div>
  );
}
