import { motion } from 'framer-motion';

const sportIcons = {
  'ALL': '🎯',
  'NBA': '🏀',
  'NFL': '🏈',
  'NHL': '🏒',
  'MLB': '⚾',
  'CFB': '🏈',
  'SOCCER': '⚽',
  'TENNIS': '🎾',
  'MMA': '🥊',
  'BOXING': '🥊',
  'ESPORTS': '🎮',
  'GOLF': '⛳',
  'CRICKET': '🏏',
  'RUGBY': '🏉',
};

export default function SportFilters({ sports, selected, onSelect }) {
  return (
    <div className="mb-8 overflow-x-auto">
      <div className="flex gap-3 pb-2">
        {sports.map((sport) => {
          const isSelected = selected === sport;
          const icon = sportIcons[sport] || '🎲';
          
          return (
            <motion.button
              key={sport}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(sport)}
              className={`
                relative px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap
                transition-all duration-300 border
                ${isSelected 
                  ? 'bg-gold-gradient text-black border-gold-500 gold-glow shadow-lg' 
                  : 'glass border-white/5 text-gray-400 hover:border-gold-500/30 hover:text-gray-200'
                }
              `}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">{icon}</span>
                <span>{sport}</span>
              </span>
              
              {/* Active indicator */}
              {isSelected && (
                <motion.div
                  layoutId="activeFilter"
                  className="absolute inset-0 rounded-xl shimmer pointer-events-none"
                  transition={{ type: 'spring', duration: 0.6 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
