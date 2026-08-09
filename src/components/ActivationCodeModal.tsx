import React, { useState } from 'react';
import { X, KeyRound, Sparkles, Wand2, AlertCircle, LogIn, CheckCircle2, ShieldCheck } from 'lucide-react';
import { UnlockedPackage, MemberAccount } from '../types';
import { getLoggedMember, activateMemberPackage } from '../utils/memberStorage';

interface ActivationCodeModalProps {
  lang: 'km' | 'en';
  loggedMember: MemberAccount | null;
  onClose: () => void;
  onUnlockStudio: (unlocked: UnlockedPackage) => void;
  onOpenPurchaseModal: () => void;
  onOpenLoginModal: () => void;
}

export const ActivationCodeModal: React.FC<ActivationCodeModalProps> = ({
  lang,
  loggedMember,
  onClose,
  onUnlockStudio,
  onOpenPurchaseModal,
  onOpenLoginModal,
}) => {
  const [activationInput, setActivationInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate and submit activation code
  const handleValidateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const code = activationInput.trim().toUpperCase();

    if (!code) {
      setErrorMsg(lang === 'km' ? 'សូមបញ្ចូល Activation Code របស់អ្នក' : 'Please enter your Activation Code');
      return;
    }

    if (!loggedMember) {
      setErrorMsg(
        lang === 'km'
          ? 'សូមចូលប្រើប្រាស់គណនីសមាជិកជាមុនសិន ដើម្បីបញ្ចូល Activation Code!'
          : 'Please login to your member account first before entering an Activation Code!'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Try server endpoint
      const res = await fetch('/api/activate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: loggedMember.phone, code }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (lang === 'km' ? 'កូដ Activation មិនត្រឹមត្រូវ' : 'Invalid Activation Code'));
      }

      const unlocked: UnlockedPackage = data.activatedPackage;
      activateMemberPackage(loggedMember.phone, unlocked);
      onUnlockStudio(unlocked);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || (lang === 'km' ? 'កូដ Activation មិនត្រឹមត្រូវ' : 'Invalid Activation Code'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-amber-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2C2117] via-[#3D2C1E] to-[#2C2117] p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#B8860B] to-[#E6C687] flex items-center justify-center text-white shadow-md">
              <KeyRound className="w-5 h-5 text-yellow-200" />
            </div>
            <div>
              <h3 className="font-moul text-base text-amber-200">
                {lang === 'km' ? 'បញ្ចូល Activation Code' : 'Enter Activation Code'}
              </h3>
              <p className="text-[11px] text-amber-100/80">
                {lang === 'km' ? 'ផ្ទាំងបញ្ជាក់កូដបើកដំណើរការ Studio' : 'Redeem your Studio Builder Activation Code'}
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

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Unlogged State Notice */}
          {!loggedMember ? (
            <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 mx-auto flex items-center justify-center">
                <LogIn className="w-6 h-6 text-[#B8860B]" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-stone-900 text-sm">
                  {lang === 'km' ? 'សូមចូលប្រើប្រាស់គណនីជាមុនសិន' : 'Please Login First'}
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {lang === 'km'
                    ? 'Activation Code ត្រូវបានរក្សាទុកយ៉ាងមានសុវត្ថិភាពសម្រាប់តែគណនីដែលបានទិញប៉ុណ្ណោះ។ សូមចូលប្រើប្រាស់គណនីរបស់អ្នកដើម្បីបញ្ចូលកូដ!'
                    : 'Activation codes are uniquely bound to the single member account that purchased them. Please login to activate!'}
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenLoginModal();
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#B8860B] via-amber-500 to-[#8C6D3B] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{lang === 'km' ? 'ចូលប្រើ ឬ ចុះឈ្មោះ' : 'Login / Register'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPurchaseModal();
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-100 text-[#8C6D3B] font-bold text-xs hover:bg-amber-200 transition-all flex items-center justify-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{lang === 'km' ? 'ទិញកញ្ចប់ 15$ / 35$' : 'Purchase Package'}</span>
                </button>
              </div>
            </div>
          ) : loggedMember.activatedPackage ? (
            /* Already Activated Notice */
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-emerald-900 text-sm">
                {lang === 'km' ? 'គណនីរបស់អ្នកបានបើកដំណើរការរួចរាល់ហើយ!' : 'Account Already Activated!'}
              </h4>
              <p className="text-xs text-emerald-700">
                {lang === 'km'
                  ? `អ្នកបានភ្ជាប់កញ្ចប់ $${loggedMember.activatedPackage.packageType} VIP ជាមួយ Code: ${loggedMember.activatedPackage.activationCode}`
                  : `Activated Package $${loggedMember.activatedPackage.packageType} with Code: ${loggedMember.activatedPackage.activationCode}`}
              </p>
              <button
                type="button"
                onClick={() => {
                  onUnlockStudio(loggedMember.activatedPackage!);
                  onClose();
                }}
                className="w-full py-3 rounded-xl bg-emerald-700 text-white font-bold text-xs shadow hover:bg-emerald-800 transition-all"
              >
                {lang === 'km' ? 'ចូលទៅកាន់ Studio បង្កើតធៀបការ' : 'Go to Studio Builder'}
              </button>
            </div>
          ) : (
            /* Standard Activation Form for Logged Member */
            <form onSubmit={handleValidateCode} className="space-y-4">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-2.5 text-xs text-blue-900">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <p className="font-bold">គណនីបច្ចុប្បន្ន៖ <span className="text-blue-900">{loggedMember.name} ({loggedMember.phone})</span></p>
                  <p className="text-[11px] text-blue-700">កូដដែលអ្នកបញ្ចូលនឹងត្រូវបានភ្ជាប់ជារៀងរហូតតែមួយគណនីនេះប៉ុណ្ណោះ។</p>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700">
                  {lang === 'km' ? 'បញ្ចូល Activation Code របស់អ្នក *' : 'Enter Your Activation Code *'}
                </label>
                <input
                  type="text"
                  required
                  value={activationInput}
                  onChange={(e) => setActivationInput(e.target.value)}
                  placeholder="ឧទាហរណ៍៖ ACT-35-8921"
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm font-mono tracking-wider focus:ring-2 focus:ring-[#B8860B] focus:outline-none uppercase"
                />
                <p className="text-[11px] text-stone-500">
                  {lang === 'km'
                    ? 'កូដនេះត្រូវបានផ្ញើជូនតាមរយៈសារ Notification បន្ទាប់ពី Admin បានអនុម័តការទិញ'
                    : 'Check your account Notifications to get your approved Activation Code'}
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#B8860B] via-amber-500 to-[#8C6D3B] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Wand2 className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? (lang === 'km' ? 'កំពុងផ្ទៀងផ្ទាត់...' : 'Verifying...')
                    : (lang === 'km' ? 'ផ្ទៀងផ្ទាត់ និងបើក Studio' : 'Verify & Unlock Studio')}
                </span>
              </button>

              <div className="pt-2 text-center border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPurchaseModal();
                  }}
                  className="text-xs font-bold text-[#B8860B] hover:underline inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{lang === 'km' ? 'មិនទាន់មានកូដមែនទេ? ទិញកញ្ចប់ $15 / $35' : 'No code yet? Buy $15 / $35 Package'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
