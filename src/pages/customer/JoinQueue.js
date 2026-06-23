import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiArrowLeft, HiUserGroup } from 'react-icons/hi';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { queueAPI } from '../../api/axios';
import { toast } from '../../components/ui/Toast';
import { RESTAURANT_ID } from '../../utils/constants';

const PARTY_OPTIONS = [
  { size: 1, label: '1', desc: 'Solo',    emoji: '🧑' },
  { size: 2, label: '2', desc: 'Couple',  emoji: '👫' },
  { size: 3, label: '3', desc: 'Small',   emoji: '👨‍👩‍👦' },
  { size: 4, label: '4', desc: 'Family',  emoji: '👨‍👩‍👧‍👦' },
  { size: 5, label: '5', desc: 'Group',   emoji: '🎉' },
  { size: 6, label: '6+', desc: 'Large',  emoji: '🎊' },
];

export default function JoinQueue() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [partySize, setPartySize] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null); // { token, wait_time, status }

  const handleJoin = async () => {
    if (!partySize) return;
    setLoading(true);
    try {
      const res = await queueAPI.joinQueue({
        name: user.name,
        phone: user.phone,
        party_size: partySize,
        restaurant_id: RESTAURANT_ID,
      });
      const data = res.data;
      localStorage.setItem('queueToken', data.token);
      setSuccess(data);
      setTimeout(() => navigate('/customer/status'), 2500);
    } catch (err) {
      const msg = err.response?.data?.error ?? 'Failed to join queue';
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper className="min-h-screen px-4 py-8 max-w-lg mx-auto">
      <AnimatePresence mode="wait">
        {success ? (
          /* Success State */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-[80vh] text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.6 }}
              className="text-7xl mb-6"
            >
              🎫
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {success.status === 'seated' ? 'Table Ready!' : "You're in the queue!"}
            </h2>
            <div className="card mt-4 w-full">
              <p className="text-4xl font-black gradient-text mb-1">{success.token}</p>
              <p className="text-slate-400 text-sm">Your token number</p>
              {success.wait_time > 0 && (
                <p className="text-orange-400 font-semibold mt-3">~{success.wait_time} min wait</p>
              )}
              {success.status === 'seated' && (
                <p className="text-green-400 font-semibold mt-3">🪑 Table {success.table} assigned!</p>
              )}
            </div>
            <p className="text-slate-500 text-sm mt-6">Redirecting to status page...</p>
          </motion.div>
        ) : (
          /* Form State */
          <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <button onClick={() => navigate('/customer/home')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
              <HiArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white mb-1">Join the Queue</h1>
              <p className="text-slate-400 text-sm">Select your party size to get a token</p>
            </div>

            <div className="card mb-6">
              <div className="flex items-center gap-2 mb-4">
                <HiUserGroup className="w-5 h-5 text-orange-400" />
                <span className="text-white font-semibold">Party Size</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {PARTY_OPTIONS.map(opt => (
                  <motion.button
                    key={opt.size}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPartySize(opt.size)}
                    className={`py-4 rounded-xl border transition-all text-center ${
                      partySize === opt.size
                        ? 'border-orange-500 bg-orange-500/20 shadow-lg shadow-orange-500/20'
                        : 'border-white/10 bg-slate-800/40 hover:border-white/20'
                    }`}
                  >
                    <div className="text-2xl mb-1">{opt.emoji}</div>
                    <div className={`text-lg font-bold ${partySize === opt.size ? 'text-orange-400' : 'text-white'}`}>{opt.label}</div>
                    <div className="text-xs text-slate-500">{opt.desc}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            <Button onClick={handleJoin} loading={loading} disabled={!partySize}>
              {partySize ? `Join Queue — Party of ${partySize}` : 'Select party size'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
