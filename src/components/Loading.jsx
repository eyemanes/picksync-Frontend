import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
            scale: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-r from-primary via-secondary to-accent 
                     flex items-center justify-center glow-green"
        >
          <TrendingUp className="w-12 h-12 text-white" />
        </motion.div>

        <motion.h2
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-2xl font-bold gradient-text mb-2"
        >
          Analyzing Picks
        </motion.h2>

        <motion.p
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          className="text-gray-400"
        >
          Fetching data from r/sportsbook...
        </motion.p>

        <div className="flex justify-center gap-2 mt-8">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -20, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
              }}
              className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-secondary"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
