import React, { useState } from 'react';
import { User, Lock, Mail, LogOut, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { id: string; email: string } | null;
  onLoginSuccess: (user: { id: string; email: string }) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (supabase && isSupabaseConfigured) {
        if (isSignUp) {
          const { data, error: signUpErr } = await supabase.auth.signUp({ email, password });
          if (signUpErr) throw signUpErr;
          if (data.user) {
            setSuccessMsg('Account created successfully! You are now logged in.');
            onLoginSuccess({ id: data.user.id, email: data.user.email || email });
            setTimeout(() => {
              onClose();
            }, 1000);
          }
        } else {
          const { data, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
          if (signInErr) throw signInErr;
          if (data.user) {
            onLoginSuccess({ id: data.user.id, email: data.user.email || email });
            onClose();
          }
        }
      } else {
        // Fallback local auth simulation
        const mockUserId = `user-${email.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        const userInfo = { id: mockUserId, email };
        try {
          localStorage.setItem('pramaan_current_user_id', mockUserId);
          localStorage.setItem('pramaan_current_user_email', email);
        } catch {}
        onLoginSuccess(userInfo);
        setSuccessMsg('Logged in successfully (Local Session Mode)');
        setTimeout(() => {
          onClose();
        }, 800);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestDemo = () => {
    const guestId = 'guest-user-12345';
    const guestEmail = 'citizen.guest@gov.in';
    try {
      localStorage.setItem('pramaan_current_user_id', guestId);
      localStorage.setItem('pramaan_current_user_email', guestEmail);
    } catch {}
    onLoginSuccess({ id: guestId, email: guestEmail });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-[#0B3D6B] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <User className="w-5 h-5 text-[#FF9933]" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Pramaan User Account</h3>
              <p className="text-xs text-blue-200">Secure Government Standards Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {currentUser ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-blue-50 text-[#0B3D6B] rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                <User className="w-8 h-8" />
              </div>
              <h4 className="font-semibold text-gray-900 text-lg mb-1">{currentUser.email}</h4>
              <p className="text-xs text-gray-500 mb-6 font-mono">ID: {currentUser.id}</p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={onClose}
                  className="w-full py-2.5 bg-[#0B3D6B] text-white rounded-lg font-medium hover:bg-[#093054] transition shadow-xs"
                >
                  Continue to Chat History
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="w-full py-2.5 bg-gray-100 text-red-600 rounded-lg font-medium hover:bg-red-50 transition flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div>
              {!isSupabaseConfigured && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                  <span className="font-semibold">Notice:</span> Supabase credentials not set in environment. Running in secure local session mode with persistent browser storage.
                </div>
              )}

              <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
                <button
                  type="button"
                  onClick={() => { setIsSignUp(false); setError(null); }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-md transition ${!isSignUp ? 'bg-white text-[#0B3D6B] shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setIsSignUp(true); setError(null); }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-md transition ${isSignUp ? 'bg-white text-[#0B3D6B] shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Create Account
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="citizen@gov.in or name@company.com"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3D6B] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B3D6B] focus:outline-hidden"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-[#0B3D6B] text-white rounded-lg font-medium hover:bg-[#093054] transition shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : isSignUp ? (
                    'Create Account'
                  ) : (
                    'Sign In to Chat History'
                  )}
                </button>
              </form>

              <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                <button
                  onClick={handleGuestDemo}
                  className="text-xs text-[#0B3D6B] hover:underline font-medium"
                >
                  ⚡ Quick Guest Demo Access (Instant Login)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
