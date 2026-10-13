import React, { useState } from 'react';
import { X, Sparkles, User, Mail, ArrowRight, ShieldCheck, Check } from 'lucide-react';

export interface UserProfile {
  name: string;
  handle: string;
  avatar: string;
  isLoggedIn: boolean;
  memberTier: 'Creator' | 'Critic' | 'Guest';
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
}

const AVATAR_OPTIONS = ['😎', '🐸', '🐱', '🧠', '🐶', '🔥', '👾', '🚀'];

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
}) => {
  const [email, setEmail] = useState('');
  const [handle, setHandle] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('😎');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHandle = handle.trim() ? handle.trim().replace(/^@/, '') : 'memester';
    const profile: UserProfile = {
      name: email.split('@')[0] || 'Meme Creator',
      handle: `@${cleanHandle}`,
      avatar: selectedAvatar,
      isLoggedIn: true,
      memberTier: 'Creator',
    };
    onLogin(profile);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 900);
  };

  const handleGuestLogin = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    const profile: UserProfile = {
      name: 'Guest Critic',
      handle: `@guest_${randomNum}`,
      avatar: '🐸',
      isLoggedIn: true,
      memberTier: 'Guest',
    };
    onLogin(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border-2 border-black bg-[#FAF7F2] p-6 shadow-[8px_8px_0px_#18181B]">
        {/* Playful sticker in top corner */}
        <div className="absolute -top-3 -right-3 rotate-12 rounded-full border-2 border-black bg-[#FEF08A] px-4 py-1 text-[11px] font-black uppercase text-black shadow-[2px_2px_0px_#18181B]">
          MEME PASS 🎟️
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg border-2 border-black bg-white text-black hover:bg-[#EF4444] hover:text-white transition-colors neo-box-sm"
        >
          <X className="h-4 w-4" />
        </button>

        {currentUser.isLoggedIn ? (
          /* Profile view if already logged in */
          <div className="pt-2 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-black bg-[#FEF08A] text-4xl shadow-[4px_4px_0px_#18181B]">
              {currentUser.avatar}
            </div>
            <h3 className="mt-4 font-display text-2xl font-black text-black">
              {currentUser.name}
            </h3>
            <p className="font-mono text-sm font-bold text-[#2563EB]">
              {currentUser.handle}
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-lg border-2 border-black bg-white px-3 py-1 text-xs font-bold shadow-[2px_2px_0px_#18181B]">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Status: Active {currentUser.memberTier} Pass</span>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={onClose}
                className="w-full rounded-xl border-2 border-black bg-[#2563EB] py-3 text-sm font-black text-white neo-btn"
              >
                Back to Studio
              </button>
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full rounded-xl border-2 border-black bg-white py-2.5 text-xs font-bold text-[#EF4444] hover:bg-red-50 neo-btn"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          /* Sign In Form */
          <div>
            <div className="mb-5">
              <div className="inline-block rounded-md border-2 border-black bg-[#FEF08A] px-2.5 py-0.5 text-[10px] font-black uppercase text-black shadow-[2px_2px_0px_#18181B] mb-2">
                LOLLAB CLUB
              </div>
              <h2 className="font-display text-2xl font-black text-black">
                Sign in to LOLLAB
              </h2>
              <p className="text-xs text-[#57534E] mt-1 font-medium">
                Save your favorite memes, keep prompt histories, and unlock studio badges.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-bold text-black mb-1.5 uppercase tracking-wide">
                  Pick Your Mood Avatar
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {AVATAR_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedAvatar(emoji)}
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 text-xl transition-all ${
                        selectedAvatar === emoji
                          ? 'border-black bg-[#FEF08A] shadow-[3px_3px_0px_#18181B] scale-105'
                          : 'border-black/30 bg-white hover:border-black'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-black mb-1 uppercase tracking-wide">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full rounded-xl border-2 border-black bg-white py-2.5 pl-9 pr-3 text-sm text-black placeholder-stone-400 font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              {/* Creator Handle */}
              <div>
                <label className="block text-xs font-bold text-black mb-1 uppercase tracking-wide">
                  Meme Handle
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-2.5 text-sm font-mono font-bold text-stone-400">
                    @
                  </span>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="memeking_99"
                    className="w-full rounded-xl border-2 border-black bg-white py-2.5 pl-8 pr-3 text-sm text-black placeholder-stone-400 font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-black bg-[#2563EB] py-3 text-sm font-black text-white neo-btn shadow-[4px_4px_0px_#18181B]"
              >
                {isSubmitted ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Welcome Aboard!</span>
                  </>
                ) : (
                  <>
                    <span>Enter Creator Studio</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Guest Mode Divider */}
            <div className="mt-4 pt-3 border-t-2 border-black/10 flex flex-col items-center gap-2">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                Or jump in instantly
              </span>
              <button
                type="button"
                onClick={handleGuestLogin}
                className="w-full rounded-xl border-2 border-black bg-[#FEF08A] py-2.5 text-xs font-black text-black neo-btn"
              >
                Continue as Guest Critic ⚡
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
