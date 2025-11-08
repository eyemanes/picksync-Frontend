import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Home, Target, Calendar, MessageSquare, LogOut, Zap, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const links = [
    { path: '/', icon: Home, label: 'Live Picks' },
    { path: '/my-bets', icon: Target, label: 'My Bets' },
    { path: '/history', icon: Calendar, label: 'History' },
    { path: '/chat', icon: MessageSquare, label: 'AI Assistant' },
  ];

  // Add admin link if user is admin
  if (user?.role === 'admin') {
    links.push({ path: '/admin', icon: Shield, label: 'Admin' });
  }

  return (
    <nav className="border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl bg-dark-bg/90">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-neon-gradient flex items-center justify-center neon-green-glow">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-black neon-green-gradient">PICKSYNC</span>
              <div className="text-[9px] sm:text-[10px] text-gray-500 font-semibold tracking-wider hidden sm:block">GAMBLINA AI 💋</div>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1 sm:gap-2">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;

              return (
                <Link key={link.path} to={link.path}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      px-2 sm:px-4 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2
                      transition-all
                      ${isActive
                        ? 'bg-neon-gradient text-black shadow-lg neon-green-glow'
                        : 'text-gray-400 hover:text-neon-400 hover:bg-white/5'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline">{link.label}</span>
                  </motion.div>
                </Link>
              );
            })}

            {/* User + Logout */}
            <div className="ml-2 sm:ml-4 flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-white/10">
              <div className="text-right hidden lg:block">
                <div className="text-xs text-gray-500 uppercase tracking-wider">
                  {user?.role === 'admin' ? '👑 Admin' : '🎲 Gambler'}
                </div>
                <div className="text-sm font-bold neon-green-gradient">{user?.username}</div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="p-2 rounded-lg glass-strong border border-white/10 hover:border-red-500/50 text-gray-400 hover:text-red-400 transition-all"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
