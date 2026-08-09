import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, KeyRound, ShieldCheck, Wand2, Tag, LogOut, Bell, User } from 'lucide-react';
import { UnlockedPackage, MemberAccount } from '../types';
import { getSystemConfig, SystemConfig } from '../utils/systemConfig';

interface NavbarProps {
  lang: 'km' | 'en';
  onLanguageToggle: () => void;
  onNavigate: (view: 'landing' | 'templates' | 'builder' | 'demo' | 'admin') => void;
  currentView: string;
  unlockedPackage: UnlockedPackage | null;
  loggedMember: MemberAccount | null;
  onOpenMemberLogin: (tab?: 'login' | 'register') => void;
  onOpenActivationCodeModal: () => void;
  onOpenPricing: () => void;
  onOpenNotifications: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onLanguageToggle,
  onNavigate,
  currentView,
  unlockedPackage,
  loggedMember,
  onOpenMemberLogin,
  onOpenActivationCodeModal,
  onOpenPricing,
  onOpenNotifications,
  onLogout,
}) => {
  const isAdmin = loggedMember?.id === 'admin' || loggedMember?.phone === 'admin' || currentView === 'admin';
  const unreadCount = loggedMember?.notifications?.filter((n) => !n.isRead).length || 0;

  const [sysConfig, setSysConfig] = useState<SystemConfig>(() => getSystemConfig());

  useEffect(() => {
    const handleUpdate = () => {
      setSysConfig(getSystemConfig());
    };
    window.addEventListener('system-config-updated', handleUpdate);
    return () => window.removeEventListener('system-config-updated', handleUpdate);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DFC2]/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => {
            if (!isAdmin) onNavigate('landing');
          }}
          className={`flex items-center gap-2.5 ${isAdmin ? '' : 'cursor-pointer group'}`}
        >
          {sysConfig.logoUrl && sysConfig.logoUrl.trim() !== '' ? (
            <img
              src={sysConfig.logoUrl}
              alt="System Logo"
              className="w-10 h-10 rounded-2xl object-cover shadow-md border-2 border-amber-300/80"
            />
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#B8860B] via-[#E6C687] to-[#8C6D3B] flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-5 h-5 text-yellow-100" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-moul text-lg text-[#8C6D3B] tracking-wide">
              {isAdmin
                ? (lang === 'km' ? 'ប្រព័ន្ធ Admin' : 'Admin Portal')
                : (lang === 'km' ? (sysConfig.systemNameKm || 'មង្គលការ') : (sysConfig.systemNameEn || 'MongkulKar'))}
            </span>
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest -mt-1">
              {sysConfig.systemNameEn || 'MongkulKar System'}
            </span>
          </div>
        </div>

        {/* Center Nav */}
        {isAdmin ? (
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-bold shadow-sm">
            <ShieldCheck className="w-4 h-4 text-[#B8860B]" />
            <span>{lang === 'km' ? 'ផ្ទាំងគ្រប់គ្រងប្រព័ន្ធ Admin' : 'Admin System Dashboard'}</span>
          </div>
        ) : (
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-stone-700">
            <button
              onClick={() => onNavigate('landing')}
              className={`hover:text-[#B8860B] transition-colors ${
                currentView === 'landing' ? 'text-[#B8860B] font-bold border-b-2 border-[#B8860B] pb-1' : ''
              }`}
            >
              {lang === 'km' ? 'ទំព័រដើម' : 'Home'}
            </button>

            <button
              onClick={() => onNavigate('demo')}
              className={`hover:text-[#B8860B] transition-colors ${
                currentView === 'demo' ? 'text-[#B8860B] font-bold border-b-2 border-[#B8860B] pb-1' : ''
              }`}
            >
              {lang === 'km' ? 'មើលគំរូ Demo' : 'Live Demo'}
            </button>

            <button
              onClick={onOpenPricing}
              className="hover:text-[#B8860B] transition-colors flex items-center gap-1"
            >
              <Tag className="w-3.5 h-3.5 text-amber-600" />
              <span>{lang === 'km' ? 'កញ្ចប់សេវាកម្ម (15$ / 35$)' : 'Packages ($15 / $35)'}</span>
            </button>

            {unlockedPackage && (
              <button
                onClick={() => onNavigate('builder')}
                className={`hover:text-[#B8860B] transition-colors flex items-center gap-1 ${
                  currentView === 'builder' ? 'text-[#B8860B] font-bold border-b-2 border-[#B8860B] pb-1' : ''
                }`}
              >
                <Wand2 className="w-3.5 h-3.5 text-amber-600" />
                <span>{lang === 'km' ? 'ប្រព័ន្ធបង្កើត Studio' : 'Builder Studio'}</span>
              </button>
            )}
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Language Toggle Button */}
          <button
            onClick={onLanguageToggle}
            className="px-3 py-1.5 rounded-full bg-white border border-stone-200 text-stone-700 font-bold text-xs shadow-sm hover:bg-stone-100 transition-all flex items-center gap-1.5"
          >
            <span className="text-sm">{lang === 'km' ? '🇰🇭' : '🇬🇧'}</span>
            <span className="hidden sm:inline">{lang === 'km' ? 'KH ខ្មែរ' : 'EN English'}</span>
          </button>

          {/* Admin Logged Controls vs Normal Member Controls */}
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-stone-900 text-amber-300 text-xs font-bold border border-amber-500/50 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'km' ? 'គណនី Admin' : 'Admin Account'}</span>
              </span>

              <button
                onClick={onLogout}
                title={lang === 'km' ? 'ចាកចេញពីប្រព័ន្ធ Admin' : 'Logout Admin'}
                className="px-3 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs shadow-sm border border-rose-200 transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>{lang === 'km' ? 'ចាកចេញ' : 'Logout'}</span>
              </button>
            </div>
          ) : loggedMember ? (
            <div className="flex items-center gap-2">
              {/* Notification Bell Button */}
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-all hover:scale-105 active:scale-95"
                title={lang === 'km' ? 'សារជូនដំណឹង' : 'Notifications'}
              >
                <Bell className="w-4 h-4 text-[#B8860B]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white font-extrabold text-[9px] flex items-center justify-center animate-bounce shadow">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* IF ACTIVATED -> SHOW DIRECT STUDIO LAUNCHER (ACTIVATION CODE BUTTON IS HIDDEN) */}
              {unlockedPackage ? (
                <button
                  onClick={() => onNavigate('builder')}
                  className="px-3.5 py-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-xs shadow-md hover:scale-105 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>
                    {lang === 'km'
                      ? `Studio (${unlockedPackage.packageType === '35' ? '35$' : '15$'})`
                      : `Studio ($${unlockedPackage.packageType})`}
                  </span>
                </button>
              ) : (
                /* IF LOGGED IN BUT NOT YET ACTIVATED -> SHOW ACTIVATION CODE BUTTON */
                <button
                  onClick={onOpenActivationCodeModal}
                  className="px-3.5 py-2 rounded-full bg-[#B8860B] text-white font-bold text-xs shadow-md hover:bg-[#966b08] transition-all flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5 text-yellow-200" />
                  <span>{lang === 'km' ? 'បញ្ចូល Activation Code' : 'Enter Activation Code'}</span>
                </button>
              )}

              {/* Member Name Badge */}
              <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 text-xs font-bold border border-stone-200">
                <User className="w-3.5 h-3.5 text-amber-700" />
                <span className="max-w-[90px] truncate">{loggedMember.name}</span>
              </span>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                title={lang === 'km' ? 'ចាកចេញពីគណនី Member' : 'Logout Member'}
                className="px-3 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs shadow-sm border border-rose-200 transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">{lang === 'km' ? 'ចាកចេញ' : 'Logout'}</span>
              </button>
            </div>
          ) : (
            /* UNLOGGED MEMBER -> ONLY LOGIN/REGISTER BUTTON */
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenMemberLogin('login')}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-[#B8860B] via-amber-500 to-[#8C6D3B] text-white font-bold text-xs shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>{lang === 'km' ? 'ចូលគណនី / ចុះឈ្មោះ' : 'Login / Register'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
