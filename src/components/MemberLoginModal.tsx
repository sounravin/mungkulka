import React, { useState } from 'react';
import { X, LogIn, UserPlus, Phone, Lock, User, AlertCircle, ShieldCheck } from 'lucide-react';
import { UnlockedPackage, MemberAccount } from '../types';
import { registerMemberAsync, loginMemberAsync } from '../utils/memberStorage';

interface MemberLoginModalProps {
  lang: 'km' | 'en';
  onClose: () => void;
  onMemberLoggedIn: (member: MemberAccount) => void;
  onUnlockStudio?: (unlocked: UnlockedPackage) => void;
  initialTab?: 'login' | 'register';
  onAdminLoggedIn?: () => void;
}

export const MemberLoginModal: React.FC<MemberLoginModalProps> = ({
  lang,
  onClose,
  onMemberLoggedIn,
  onUnlockStudio,
  initialTab = 'login',
  onAdminLoggedIn,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(
    initialTab === 'register' ? 'register' : 'login'
  );

  // Form states
  const [phoneInput, setPhoneInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [regNameInput, setRegNameInput] = useState('');
  const [regPhoneInput, setRegPhoneInput] = useState('');
  const [regPasswordInput, setRegPasswordInput] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Handle Login (Supports Member Phone OR Admin "admin")
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const trimmedInput = phoneInput.trim();

    if (!trimmedInput) {
      setErrorMsg(lang === 'km' ? 'សូមបញ្ចូលលេខទូរស័ព្ទ ឬ Username' : 'Please enter phone number or username');
      return;
    }

    // Check if logging in as Admin
    if (trimmedInput.toLowerCase() === 'admin') {
      if (passwordInput === 'admin' || passwordInput === 'admin123') {
        sessionStorage.setItem('mongkulkar_admin_auth', 'true');
        const adminAccount: MemberAccount = {
          id: 'admin',
          name: lang === 'km' ? 'គណនី Admin' : 'Admin System',
          phone: 'admin',
          createdAt: new Date().toISOString(),
          activatedPackage: {
            packageType: '35',
            activationCode: 'ADMIN-VIP',
            memberName: 'Admin System',
            memberPhone: 'admin',
            maxPhotos: 10,
            unlockedAt: new Date().toISOString(),
          },
          notifications: [],
        };

        onMemberLoggedIn(adminAccount);
        setSuccessMsg(lang === 'km' ? 'ចូលប្រើប្រាស់គណនី Admin ជោគជ័យ!' : 'Logged in as Admin successfully!');

        if (onAdminLoggedIn) {
          onAdminLoggedIn();
        }

        setTimeout(() => {
          onClose();
        }, 600);
        return;
      } else {
        setErrorMsg(lang === 'km' ? 'ពាក្យសម្ងាត់ Admin មិនត្រឹមត្រូវ! (admin)' : 'Incorrect Admin password! (admin)');
        return;
      }
    }

    // Regular Member Login
    try {
      const member = await loginMemberAsync(trimmedInput, passwordInput);
      onMemberLoggedIn(member);
      setSuccessMsg(lang === 'km' ? 'ចូលប្រើប្រាស់ជោគជ័យ!' : 'Logged in successfully!');

      if (member.activatedPackage && onUnlockStudio) {
        onUnlockStudio(member.activatedPackage);
      }

      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error logging in');
    }
  };

  // Handle Register
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!regNameInput.trim()) {
      setErrorMsg(lang === 'km' ? 'សូមបញ្ចូលឈ្មោះពេញ' : 'Please enter your full name');
      return;
    }
    if (!regPhoneInput.trim()) {
      setErrorMsg(lang === 'km' ? 'សូមបញ្ចូលលេខទូរស័ព្ទ' : 'Please enter your phone number');
      return;
    }

    try {
      const newMember = await registerMemberAsync(regNameInput, regPhoneInput, regPasswordInput);
      onMemberLoggedIn(newMember);
      setSuccessMsg(lang === 'km' ? 'ចុះឈ្មោះជោគជ័យ!' : 'Registered successfully!');

      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error registering');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-amber-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2C2117] via-[#3D2C1E] to-[#2C2117] p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#B8860B] to-[#E6C687] flex items-center justify-center text-white shadow-md">
              <User className="w-5 h-5 text-yellow-200" />
            </div>
            <div>
              <h3 className="font-moul text-base text-amber-200">
                {lang === 'km' ? 'គណនីសមាជិក (Member Portal)' : 'Member Account Portal'}
              </h3>
              <p className="text-[11px] text-amber-100/80">
                {lang === 'km' ? 'ចូលប្រើប្រាស់ ឬ ចុះឈ្មោះគណនី' : 'Login or Register your account'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-stone-200 bg-stone-50">
          <button
            onClick={() => {
              setActiveTab('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-3.5 px-3 text-xs font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'border-[#B8860B] text-[#8C6D3B] bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>{lang === 'km' ? 'ចូលប្រើ (Login)' : 'Login'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('register');
              setErrorMsg(null);
            }}
            className={`flex-1 py-3.5 px-3 text-xs font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'register'
                ? 'border-[#B8860B] text-[#8C6D3B] bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>{lang === 'km' ? 'ចុះឈ្មោះ (Register)' : 'Register'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold text-center">
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700">
                  {lang === 'km' ? 'លេខទូរស័ព្ទ / Username *' : 'Phone Number / Username *'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder={lang === 'km' ? '012 345 678 ឬ admin' : '012 345 678 or admin'}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#B8860B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700">
                  {lang === 'km' ? 'ពាក្យសម្ងាត់ (Password) *' : 'Password *'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#B8860B] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#B8860B] via-amber-500 to-[#8C6D3B] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{lang === 'km' ? 'ចូលប្រើប្រាស់ (Login)' : 'Sign In'}</span>
              </button>

              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-stone-600 text-center space-y-1">
                <p className="font-bold text-[#8C6D3B]">
                  💡 {lang === 'km' ? 'ព័ត៌មានចូលប្រើ (Login Info):' : 'Login Credentials:'}
                </p>
                <p>Member: <strong className="font-mono">012345678</strong> | Pass: <strong className="font-mono">123456</strong></p>
                <p>Admin: <strong className="font-mono">admin</strong> | Pass: <strong className="font-mono">admin</strong></p>
              </div>

              <div className="pt-2 text-center border-t border-stone-100">
                <p className="text-xs text-stone-500 mb-1">
                  {lang === 'km' ? 'មិនទាន់មានគណនីសមាជិកមែនទេ?' : "Don't have a member account yet?"}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="text-xs font-bold text-[#B8860B] hover:underline"
                >
                  {lang === 'km' ? 'ចុចទីនេះដើម្បីចុះឈ្មោះ (Register)' : 'Click here to Register'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTER */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700">
                  {lang === 'km' ? 'ឈ្មោះពេញរបស់អ្នក (Full Name) *' : 'Full Name *'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={regNameInput}
                    onChange={(e) => setRegNameInput(e.target.value)}
                    placeholder="ឧទាហរណ៍៖ សុខ ពិសិដ្ឋ"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#B8860B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700">
                  {lang === 'km' ? 'លេខទូរស័ព្ទ (Phone Number) *' : 'Phone Number *'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={regPhoneInput}
                    onChange={(e) => setRegPhoneInput(e.target.value)}
                    placeholder="012 345 678"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#B8860B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700">
                  {lang === 'km' ? 'បង្កើតពាក្យសម្ងាត់ (Password) *' : 'Create Password *'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={regPasswordInput}
                    onChange={(e) => setRegPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#B8860B] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#B8860B] via-amber-500 to-[#8C6D3B] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>{lang === 'km' ? 'ចុះឈ្មោះបង្កើតគណនី' : 'Register Account'}</span>
              </button>

              <div className="pt-2 text-center border-t border-stone-100">
                <p className="text-xs text-stone-500 mb-1">
                  {lang === 'km' ? 'មានគណនីរួចហើយមែនទេ?' : 'Already have an account?'}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-xs font-bold text-[#B8860B] hover:underline"
                >
                  {lang === 'km' ? 'ចូលប្រើប្រាស់ (Login)' : 'Sign In here'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
