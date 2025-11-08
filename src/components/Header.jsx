import { motion } from 'framer-motion';
import { TrendingUp, Trophy, Target } from 'lucide-react';

export default function Header({ lastUpdate, onRefresh, refreshing }) {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="relative py-12 mb-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Logo/Title */}
          <motion.div
            className="inline-flex items-center gap-3 mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <Trophy className="w-12 h-12 text-primary animate-float" />
            <h1 className="text-6xl md:text-7xl font-black gradient-text tracking-tight">
              PICKSYNC
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 mb-6 max-w-2xl mx-auto"
          >
            AI-Powered Betting Analysis from r/sportsbook
            <br />
            <span className="text-sm text-gray-500">
              Ranked by confidence • Verified records only
            </span>
          </motion.p>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRefresh}
              disabled={refreshing}
              className="px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-xl font-semibold
                         shadow-lg hover:shadow-primary/50 transition-all duration-300 
                         disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Target className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Analyzing...' : 'Force Refresh'}
            </motion.button>

            {lastUpdate && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="px-4 py-2 glass rounded-xl text-sm text-gray-400"
              >
                <span className="text-gray-500">Last updated:</span>{' '}
                <span className="text-gray-300 font-medium">
                  {new Date(lastUpdate).toLocaleTimeString()}
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Decorative line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
      />
    </motion.header>
  );
}
