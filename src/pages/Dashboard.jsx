import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Loader2, Filter, Trophy, Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import PickCard from '../components/PickCard';
import EditPickModal from '../components/EditPickModal';
import Stats from '../components/Stats';
import ProcessSteps from '../components/ProcessSteps';
import SportFilters from '../components/SportFilters';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export default function Dashboard() {
  const { token, user } = useAuth();
  const [picks, setPicks] = useState([]);
  const [filteredPicks, setFilteredPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSport, setSelectedSport] = useState('ALL');
  const [sortBy, setSortBy] = useState('confidence'); // 'confidence' or 'upvotes'
  const [potdTitle, setPotdTitle] = useState('');
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const [scanProgress, setScanProgress] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [darkMode, setDarkMode] = useState(true);
  const [editingPick, setEditingPick] = useState(null);

  useEffect(() => {
    fetchPicks();
    setHasInitialLoad(true);
  }, []);

  useEffect(() => {
    // Sort and filter picks
    let sorted = [...picks];
    
    if (sortBy === 'confidence') {
      sorted.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
    } else if (sortBy === 'upvotes') {
      sorted.sort((a, b) => (b.comment_score || 0) - (a.comment_score || 0));
    }
    
    if (selectedSport === 'ALL') {
      setFilteredPicks(sorted);
    } else {
      setFilteredPicks(sorted.filter(p => p.sport?.toUpperCase() === selectedSport));
    }
  }, [selectedSport, picks, sortBy]);

  async function fetchPicks() {
    try {
      setError(null);
      setCurrentStep(1);
      
      const res = await fetch(`${API_URL}/api/picks/today`);
      const data = await res.json();
      
      setCurrentStep(2);
      
      if (data.success) {
        setPicks(data.picks);
        setFilteredPicks(data.picks);
        setPotdTitle(data.potdTitle || '');
        setCurrentStep(3);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to connect to backend');
      console.error(err);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setRefreshing(false);
      }, 500);
    }
  }

  async function handleScan() {
    if (!token) return;
    
    setRefreshing(true);
    setCurrentStep(1);
    setError(null);
    setScanProgress('Starting scan...');
    
    try {
      // STEP 1: Prepare scan (fetch Reddit only)
      console.log('🔄 Step 1: Preparing scan (fetching Reddit)...');
      setScanProgress('Fetching Reddit comments...');
      setProgressPercent(10);
      
      const prepareRes = await fetch(`${API_URL}/api/scan/prepare`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const prepareData = await prepareRes.json();
      
      if (!prepareData.success) {
        setError(prepareData.error || 'Failed to prepare scan');
        setRefreshing(false);
        setScanProgress('');
        return;
      }
      
      console.log(`✅ Step 1 complete: ${prepareData.totalComments} comments found`);
      console.log(`📦 Processing ${prepareData.numBatches} batches of ${prepareData.batchSize} comments each`);
      
      setCurrentStep(2);
      setScanProgress(`Found ${prepareData.totalComments} comments. Processing batches...`);
      setProgressPercent(20);
      
      const { scanId, numBatches } = prepareData;
      
      // STEP 2: Process each batch sequentially
      for (let batchNum = 1; batchNum <= numBatches; batchNum++) {
        console.log(`🔄 Processing batch ${batchNum}/${numBatches}...`);
        
        const batchProgress = 20 + ((batchNum - 1) / numBatches) * 70;
        setScanProgress(`Processing batch ${batchNum}/${numBatches} with AI...`);
        setProgressPercent(Math.round(batchProgress));
        
        const batchRes = await fetch(`${API_URL}/api/scan/process-batch`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ scanId, batchNum })
        });
        
        const batchData = await batchRes.json();
        
        if (!batchData.success) {
          setError(`Batch ${batchNum} failed: ${batchData.error}`);
          setRefreshing(false);
          setScanProgress('');
          return;
        }
        
        console.log(`✅ Batch ${batchNum}/${numBatches} complete: ${batchData.picksInBatch} picks saved`);
        
        // If last batch, finalize
        if (batchData.isLastBatch) {
          console.log('🎉 All batches processed! Fetching final picks...');
          setCurrentStep(3);
          setScanProgress('Finalizing and loading picks...');
          setProgressPercent(95);
        }
      }
      
      // STEP 3: Fetch the completed picks
      console.log('📥 Fetching completed picks...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay for DB to finalize
      
      const picksRes = await fetch(`${API_URL}/api/picks/today?t=${Date.now()}`);
      const picksData = await picksRes.json();
      
      if (picksData.success && picksData.picks && picksData.picks.length > 0) {
        setPicks(picksData.picks);
        setPotdTitle(picksData.potdTitle || '');
        setScanProgress('Scan complete!');
        setProgressPercent(100);
        
        console.log(`✅ Scan complete: ${picksData.picks.length} picks loaded`);
        
        // Clear UI after 2 seconds
        setTimeout(() => {
          setRefreshing(false);
          setScanProgress('');
          setProgressPercent(0);
        }, 2000);
      } else {
        setError('Scan completed but no picks found');
        setRefreshing(false);
        setScanProgress('');
      }
      
    } catch (err) {
      console.error('❌ Scan error:', err);
      setError(`Scan failed: ${err.message}`);
      setRefreshing(false);
      setScanProgress('');
      setProgressPercent(0);
    }
  }

  const availableSports = ['ALL', ...new Set(picks.map(p => p.sport?.toUpperCase()).filter(Boolean))];

  return (
    <div className={`relative ${darkMode ? '' : 'light-mode'}`}>
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.03),transparent_50%)]" />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />

      {/* Admin Badge */}
      {user?.role === 'admin' && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed top-4 left-4 z-50 px-4 py-2 rounded-full bg-purple-600/90 backdrop-blur-sm border border-purple-400/30 shadow-lg"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">👑</span>
            <span className="text-white text-sm font-bold">ADMIN</span>
          </div>
        </motion.div>
      )}

      {/* Dark/Light Mode Toggle */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-4 right-4 z-50 p-3 rounded-full glass-strong"
      >
        {darkMode ? <Sun className="w-5 h-5 text-gold-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
      </motion.button>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {(loading || refreshing) && (
          <>
            <ProcessSteps currentStep={currentStep} />
            {scanProgress && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 rounded-xl glass-strong border border-gold-500/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gold-400 font-medium">🔄 {scanProgress}</p>
                  <span className="text-xs text-gold-400">{progressPercent}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gold-gradient"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            )}
          </>
        )}

        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 rounded-2xl glass-strong border-red-500/20"
          >
            <p className="text-red-400 text-center">⚠️ {error}</p>
          </motion.div>
        )}

        {!loading && picks.length > 0 && (
          <>
            {potdTitle && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-5 rounded-2xl glass-strong border border-gold-500/30 bg-gradient-to-r from-gold-500/10 to-transparent"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gold-500/20 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-gold-400" />
                  </div>
                  <div>
                    <div className="text-xs text-gold-400 font-semibold uppercase tracking-wider">Reddit Thread</div>
                    <div className="text-lg font-bold text-white">{potdTitle}</div>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div>
                <h2 className="text-3xl font-bold text-white mb-1">Today's Picks</h2>
                {potdTitle && <p className="text-sm text-gray-500">{potdTitle}</p>}
              </div>
              
              <div className="flex gap-3">
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 rounded-xl glass-strong border border-gray-700 text-white cursor-pointer"
                >
                  <option value="confidence">Sort by Confidence</option>
                  <option value="upvotes">Sort by Upvotes</option>
                </select>
                
                {/* Full Rescan - ADMIN ONLY */}
                {user?.role === 'admin' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleScan}
                    disabled={refreshing}
                    className="px-6 py-3 rounded-xl bg-gold-gradient text-black font-bold
                             shadow-lg gold-glow disabled:opacity-50 disabled:cursor-not-allowed
                             flex items-center gap-2"
                  >
                    {refreshing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {scanProgress || 'Scanning...'}
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-5 h-5" />
                        Full Rescan
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </div>

            <Stats picks={filteredPicks} allPicks={picks} />
            <SportFilters 
              sports={availableSports} 
              selected={selectedSport}
              onSelect={setSelectedSport}
            />
          </>
        )}

        {!loading && filteredPicks.length > 0 && (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPicks.map((pick, index) => (
                <PickCard 
                  key={pick.id || index} 
                  pick={pick} 
                  index={index} 
                  compact
                  onEdit={(pick) => setEditingPick(pick)}
                  onDelete={(pickId) => {
                    setPicks(picks.filter(p => p.id !== pickId));
                    setFilteredPicks(filteredPicks.filter(p => p.id !== pickId));
                  }}
                />
              ))}
            </div>
          </AnimatePresence>
        )}

        {!loading && picks.length > 0 && filteredPicks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Filter className="w-16 h-16 mx-auto mb-4 text-gray-800" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">No {selectedSport} picks</h3>
            <p className="text-gray-500">Try selecting a different sport</p>
          </motion.div>
        )}

        {!loading && picks.length === 0 && !error && hasInitialLoad && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">🚀 Ready to Start</h3>
              <p className="text-gray-400 mb-8">
                {user?.role === 'admin' 
                  ? 'No picks yet. Scan Reddit for today\'s POTD!' 
                  : 'No picks available yet. Check back later!'}
              </p>
              
              {user?.role === 'admin' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleScan}
                  disabled={refreshing}
                  className="px-8 py-4 rounded-xl bg-gold-gradient text-black font-bold text-lg
                           shadow-lg gold-glow disabled:opacity-50 flex items-center gap-3 mx-auto"
                >
                  {refreshing ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-6 h-6" />
                      Start First Scan
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Single Edit Modal for All Picks */}
      {editingPick && (
        <EditPickModal
          pick={editingPick}
          isOpen={!!editingPick}
          onClose={() => setEditingPick(null)}
          onSave={(pickId, updates) => {
            setPicks(picks.map(p => p.id === pickId ? { ...p, ...updates } : p));
            setFilteredPicks(filteredPicks.map(p => p.id === pickId ? { ...p, ...updates } : p));
            setEditingPick(null);
          }}
          token={token}
        />
      )}
    </div>
  );
}
