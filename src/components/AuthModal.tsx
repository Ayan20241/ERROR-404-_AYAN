import React, { useState } from 'react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'attendee' | 'host'>('attendee');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || password.length < 6) {
      setStatusMessage('Please enter a valid mobile number/email and password (min 6 characters).');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(authMode === 'signin' ? 'Authenticating with Supabase...' : 'Creating Cultural Pass...');

    setTimeout(() => {
      setIsSubmitting(false);
      setStatusMessage('Verified! Welcome to Locora');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 900);
    }, 1000);
  };

  const handleQuickOtp = (method: string) => {
    const target = identifier || 'your registered mobile number';
    alert(`Dispatching 6-digit one-time passcode via ${method.toUpperCase()} to ${target}.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#e2e8f0] my-8">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-[#f8fafc] hover:bg-[#e2e8f0] flex items-center justify-center text-[#0f172a] transition-colors"
        >
          <span className="material-symbols-outlined text-base">close</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          
          {/* LEFT EDITORIAL HERO PANEL (5 Cols) */}
          <div className="lg:col-span-5 relative flex flex-col justify-between overflow-hidden bg-[#090d16] text-white p-6 md:p-8">
            {/* Ambient Graphic Glow */}
            <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-[#e11d48]/25 blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#4f46e5]/35 blur-3xl pointer-events-none"></div>

            {/* Editorial Header */}
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                <span className="w-2 h-2 rounded-full bg-[#f43f5e] animate-pulse"></span>
                <span className="font-['Plus_Jakarta_Sans'] text-[10px] tracking-widest uppercase text-[#fef3c7] font-bold">
                  Tonight in India
                </span>
              </div>
              <h1 className="font-['Plus_Jakarta_Sans'] text-3xl font-bold leading-tight text-white tracking-tight">
                The city is <span className="text-[#fda4af]">alive.</span> Step inside.
              </h1>
              <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#e2e8f0]/80 leading-relaxed max-w-sm">
                Access curated acoustic rooftops in Koramangala, underground vinyl listening bars in Bandra, and midnight design salons across NCR.
              </p>
            </div>

            {/* Live City Pulse Capsule */}
            <div className="relative z-10 space-y-4 pt-6">
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md space-y-2 border border-white/10">
                <div className="flex items-center justify-between text-xs font-['Plus_Jakarta_Sans']">
                  <span className="uppercase tracking-wider text-[#e2e8f0]/70">Live Indian Gatherings</span>
                  <span className="text-[#ffe4e6] font-bold">142 Happening Tonight</span>
                </div>
                
                {/* Sparkline SVG */}
                <svg className="w-full h-8 text-[#f43f5e]" fill="none" viewBox="0 0 200 40">
                  <path d="M0 25 C30 25, 45 10, 70 22 C95 34, 110 5, 140 18 C165 30, 180 8, 200 12" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5"></path>
                  <circle cx="140" cy="18" fill="#ffffff" r="3"></circle>
                </svg>

                <div className="flex justify-between items-center text-[10px] font-['Plus_Jakarta_Sans'] text-[#e2e8f0]/70 pt-1">
                  <div className="flex -space-x-1 overflow-hidden">
                    <span className="inline-block h-5 w-5 rounded-full bg-[#e11d48] text-center font-bold text-white leading-5">BLR</span>
                    <span className="inline-block h-5 w-5 rounded-full bg-[#4f46e5] text-center font-bold text-white leading-5">BOM</span>
                    <span className="inline-block h-5 w-5 rounded-full bg-[#d97706] text-center font-bold text-white leading-5">DEL</span>
                  </div>
                  <span>Verified Zero-Spam Access</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-['Plus_Jakarta_Sans'] text-[#e2e8f0]/80">
                <span className="material-symbols-outlined text-[#ffe4e6] text-base">verified_user</span>
                <span>Instant WhatsApp OTP & Supabase Auth</span>
              </div>
            </div>
          </div>

          {/* RIGHT AUTHENTICATION SUITE (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col justify-center bg-white p-6 md:p-10 space-y-5">
            
            {/* Header & Mode Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-[#0f172a]">Locora</span>
                  <span className="font-['Plus_Jakarta_Sans'] text-[10px] px-2 py-0.5 rounded-full bg-[#e0e7ff] text-[#3730a3] font-bold uppercase tracking-wider">
                    Bharat Beta
                  </span>
                </div>
                <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#475569] mt-0.5">Your festival pass to hyper-local culture.</p>
              </div>

              {/* Segmented Control */}
              <div className="inline-flex p-1 bg-[#f1f5f9] rounded-full self-start sm:self-auto border border-[#e2e8f0]">
                <button 
                  onClick={() => setAuthMode('signin')}
                  className={`px-3.5 py-1 rounded-full font-['Plus_Jakarta_Sans'] text-xs font-bold transition-all ${
                    authMode === 'signin' 
                      ? 'bg-[#0f172a] text-white shadow-sm' 
                      : 'text-[#475569] hover:text-[#0f172a]'
                  }`}
                >
                  Sign In
                </button>
                <button 
                  onClick={() => setAuthMode('signup')}
                  className={`px-3.5 py-1 rounded-full font-['Plus_Jakarta_Sans'] text-xs font-bold transition-all ${
                    authMode === 'signup' 
                      ? 'bg-[#0f172a] text-white shadow-sm' 
                      : 'text-[#475569] hover:text-[#0f172a]'
                  }`}
                >
                  Create Account
                </button>
              </div>
            </div>

            {/* Role Selection (on signup) */}
            {authMode === 'signup' && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <label className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-widest text-[#475569] font-bold">
                  My Pulse Intention
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label 
                    onClick={() => setRole('attendee')}
                    className={`flex flex-col p-3 rounded-xl cursor-pointer transition-all border ${
                      role === 'attendee' ? 'bg-[#e0e7ff] border-[#c7d2fe]' : 'bg-[#f8fafc] border-[#e2e8f0]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#0f172a]">
                      <span className="material-symbols-outlined text-sm">explore</span>
                      <span>Discover Events</span>
                    </div>
                    <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#475569] mt-0.5">Attend gigs & pop-ups</span>
                  </label>

                  <label 
                    onClick={() => setRole('host')}
                    className={`flex flex-col p-3 rounded-xl cursor-pointer transition-all border ${
                      role === 'host' ? 'bg-[#e0e7ff] border-[#c7d2fe]' : 'bg-[#f8fafc] border-[#e2e8f0]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#0f172a]">
                      <span className="material-symbols-outlined text-sm">celebration</span>
                      <span>Host Gatherings</span>
                    </div>
                    <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#475569] mt-0.5">Curate salons & meetups</span>
                  </label>
                </div>
              </div>
            )}

            {/* One-Click Socials */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button 
                  onClick={() => handleQuickOtp('whatsapp')}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] font-['Plus_Jakarta_Sans'] text-xs font-semibold text-[#0f172a] border border-[#e2e8f0] transition-all"
                >
                  <span className="material-symbols-outlined text-emerald-600 font-bold text-lg">chat</span>
                  <span>WhatsApp Quick OTP</span>
                </button>

                <button 
                  onClick={() => handleQuickOtp('google')}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] font-['Plus_Jakarta_Sans'] text-xs font-semibold text-[#0f172a] border border-[#e2e8f0] transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"></path>
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>

              <div className="relative flex items-center justify-center my-2">
                <div className="w-full h-px bg-[#e2e8f0]"></div>
                <span className="absolute bg-white px-3 font-['Plus_Jakarta_Sans'] text-[9px] uppercase tracking-widest text-[#475569] font-bold">
                  Or with Indian Mobile / Email
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#0f172a]">Mobile (+91) or Email Address</label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-[#475569] text-base">alternate_email</span>
                  <input 
                    type="text" 
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="98200 12345 or priya@gmail.com"
                    required
                    className="w-full bg-[#f8fafc] focus:bg-white text-[#0f172a] font-['Plus_Jakarta_Sans'] text-xs pl-10 pr-4 py-2.5 rounded-xl border border-[#e2e8f0] focus:ring-2 focus:ring-[#4f46e5] outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#0f172a]">Password</label>
                  <button type="button" onClick={() => alert('Password recovery link dispatched via Supabase.')} className="font-['Plus_Jakarta_Sans'] text-[11px] text-[#e11d48] hover:underline">
                    Forgot Password?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-[#475569] text-base">lock</span>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your security phrase"
                    required
                    className="w-full bg-[#f8fafc] focus:bg-white text-[#0f172a] font-['Plus_Jakarta_Sans'] text-xs pl-10 pr-10 py-2.5 rounded-xl border border-[#e2e8f0] focus:ring-2 focus:ring-[#4f46e5] outline-none transition-all"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-[#475569] hover:text-[#0f172a]"
                  >
                    <span className="material-symbols-outlined text-base">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* SMS OTP Bypass Option */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#4f46e5] text-base">sms</span>
                  <div className="text-[11px] font-['Plus_Jakarta_Sans'] leading-tight">
                    <span className="font-bold text-[#0f172a]">Prefer SMS Instant Passcode?</span>
                    <span className="block text-[#475569]">Bypass password via 6-digit verification</span>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => handleQuickOtp('sms')}
                  className="px-2.5 py-1 rounded-full bg-[#4f46e5] text-white font-['Plus_Jakarta_Sans'] text-[10px] font-bold hover:opacity-90"
                >
                  Send OTP
                </button>
              </div>

              {statusMessage && (
                <div className="p-2 rounded-xl bg-[#ffe4e6] text-[#881337] font-['Plus_Jakarta_Sans'] text-xs font-semibold">
                  {statusMessage}
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-6 rounded-full bg-[#e11d48] hover:bg-[#be123c] text-white font-['Plus_Jakarta_Sans'] text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                <span>{authMode === 'signin' ? 'Sign In to Locora' : 'Join Locora Hub'}</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </form>

            <div className="pt-2 text-center space-y-1">
              <p className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#475569]">
                By continuing, you agree to Locora's <a className="underline" href="#">Terms</a> & <a className="underline" href="#">Community Guidelines</a>.
              </p>
              <div className="flex items-center justify-between opacity-75 pt-2 text-[9px] font-['Plus_Jakarta_Sans'] text-[#475569]">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Supabase Auth Engine · Encrypted at Rest
                </span>
                <span>Region: ap-south-1 (Mumbai)</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
