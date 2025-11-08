import { motion } from 'framer-motion';
import { Database, Brain, CheckCircle2, Loader2 } from 'lucide-react';

export default function ProcessSteps({ currentStep }) {
  const steps = [
    {
      id: 1,
      icon: Database,
      title: 'Fetching Data',
      description: 'Pulling comments from r/sportsbook',
    },
    {
      id: 2,
      icon: Brain,
      title: 'AI Analysis',
      description: 'Grok-4 analyzing picks and confidence',
    },
    {
      id: 3,
      icon: CheckCircle2,
      title: 'Complete',
      description: 'Rankings ready',
    },
  ];

  return (
    <div className="mb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-2xl p-8"
      >
        <h2 className="text-xl font-bold text-white mb-8 text-center">
          Processing Analysis
        </h2>

        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isComplete = currentStep > step.id;
            const isUpcoming = currentStep < step.id;

            return (
              <div key={step.id} className="flex items-center flex-1">
                {/* Step */}
                <div className="flex flex-col items-center flex-1">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.2 }}
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 relative
                      ${isComplete ? 'bg-gold-gradient gold-glow' : ''}
                      ${isActive ? 'glass-strong shimmer border-gold-500' : ''}
                      ${isUpcoming ? 'glass border-gray-800' : ''}
                    `}
                  >
                    {isActive && (
                      <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
                    )}
                    {isComplete && (
                      <Icon className="w-8 h-8 text-black" />
                    )}
                    {isUpcoming && (
                      <Icon className="w-8 h-8 text-gray-600" />
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.2 + 0.1 }}
                    className="text-center"
                  >
                    <div className={`font-bold mb-1
                      ${isComplete || isActive ? 'text-white' : 'text-gray-600'}
                    `}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {step.description}
                    </div>
                  </motion.div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 h-px mx-4 relative" style={{ maxWidth: '100px' }}>
                    <div className="absolute inset-0 bg-gray-800" />
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: currentStep > step.id ? 1 : 0 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 bg-gold-gradient origin-left"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
