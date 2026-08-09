import React from 'react';
import { X, Bell, Sparkles, Copy, Wand2, UserPlus } from 'lucide-react';
import { MemberAccount, UnlockedPackage } from '../types';
import { markNotificationsRead, activateMemberPackage } from '../utils/memberStorage';

interface NotificationsModalProps {
  loggedMember: MemberAccount | null;
  lang: 'km' | 'en';
  onClose: () => void;
  onUnlockStudio?: (unlocked: UnlockedPackage) => void;
  onActivateCode?: (code: string, tier: '15' | '35') => void;
  onRefreshMember?: () => void;
  onOpenAuth?: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  loggedMember,
  lang,
  onClose,
  onUnlockStudio,
  onActivateCode,
  onRefreshMember,
  onOpenAuth,
}) => {
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (loggedMember?.phone) {
      markNotificationsRead(loggedMember.phone);
    }
    onRefreshMember?.();
  }, [loggedMember?.phone]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleActivateFromNotification = (code: string, packageType: '15' | '35' = '35') => {
    if (!loggedMember) {
      onOpenAuth?.();
      return;
    }

    const unlocked: UnlockedPackage = {
      packageType,
      activationCode: code,
      memberName: loggedMember.name,
      memberPhone: loggedMember.phone,
      maxPhotos: packageType === '35' ? 10 : 5,
      unlockedAt: new Date().toISOString(),
    };

    activateMemberPackage(loggedMember.phone, unlocked);
    if (onActivateCode) {
      onActivateCode(code, packageType);
    } else if (onUnlockStudio) {
      onUnlockStudio(unlocked);
    }
    onClose();
  };

  const notifications = loggedMember?.notifications || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-amber-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2C2117] via-[#3D2C1E] to-[#2C2117] p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#B8860B] to-[#E6C687] flex items-center justify-center text-white shadow-md">
              <Bell className="w-5 h-5 text-yellow-200" />
            </div>
            <div>
              <h3 className="font-moul text-base text-amber-200">
                {lang === 'km' ? 'សារជូនដំណឹង (Notifications)' : 'Notifications'}
              </h3>
              <p className="text-[11px] text-amber-100/80">
                {loggedMember
                  ? lang === 'km'
                    ? `គណនី៖ ${loggedMember.name} (${loggedMember.phone})`
                    : `Account: ${loggedMember.name}`
                  : lang === 'km'
                  ? 'សូមចូលគណនីជាមុនសិន'
                  : 'Please log in first'}
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

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {!loggedMember ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-full bg-amber-100 text-[#B8860B] flex items-center justify-center mx-auto">
                <UserPlus className="w-7 h-7" />
              </div>
              <p className="text-xs font-bold text-stone-800">
                {lang === 'km' ? 'សូមចូលប្រើប្រាស់គណនីដើម្បីពិនិត្យ Notification' : 'Please log in to view your notifications'}
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth?.();
                }}
                className="px-5 py-2.5 rounded-xl bg-[#B8860B] text-white font-bold text-xs shadow hover:bg-[#966b08]"
              >
                {lang === 'km' ? 'ចូលគណនី / ចុះឈ្មោះ' : 'Log In / Register'}
              </button>
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/90 to-orange-50/40 border border-amber-200/90 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#B8860B] shrink-0" />
                    <h4 className="font-bold text-xs text-stone-900">
                      {lang === 'km' ? notif.titleKm : notif.titleEn}
                    </h4>
                  </div>
                  <span className="text-[10px] text-stone-400">
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-xs text-stone-700 leading-relaxed">
                  {lang === 'km' ? notif.messageKm : notif.messageEn}
                </p>

                {/* Display Activation Code Box if Code is Present */}
                {notif.activationCode && (
                  <div className="p-3 rounded-xl bg-white border border-amber-300 space-y-2 text-center shadow-inner">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                      {lang === 'km' ? 'Activation Code របស់អ្នក' : 'Your Activation Code'}
                    </span>

                    <div className="flex items-center justify-center gap-2">
                      <span className="font-mono text-lg font-extrabold text-[#8C6D3B] tracking-wider bg-amber-100/60 px-3 py-1 rounded-lg border border-amber-300/80">
                        {notif.activationCode}
                      </span>
                      <button
                        onClick={() => handleCopy(notif.activationCode!)}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-100 text-amber-900 text-[11px] font-bold flex items-center gap-1 hover:bg-amber-200 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>
                          {copiedCode === notif.activationCode
                            ? (lang === 'km' ? 'បានចម្លង!' : 'Copied!')
                            : (lang === 'km' ? 'ចម្លង' : 'Copy')}
                        </span>
                      </button>
                    </div>

                    <button
                      onClick={() =>
                        handleActivateFromNotification(
                          notif.activationCode!,
                          notif.packageType || '35'
                        )
                      }
                      className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#B8860B] via-amber-500 to-[#8C6D3B] text-white text-xs font-bold shadow hover:shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <Wand2 className="w-4 h-4 text-yellow-200" />
                      <span>{lang === 'km' ? 'បើកដំណើរការ Studio ឥឡូវនេះ' : 'Activate Studio Now'}</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-stone-400 space-y-2">
              <Bell className="w-8 h-8 mx-auto opacity-40 text-amber-800" />
              <p className="text-xs italic">
                {lang === 'km' ? 'មិនទាន់មានសារជូនដំណឹងឡើយ' : 'No notifications yet'}
              </p>
            </div>
          )}
        </div>

        {/* Footer Close */}
        <div className="p-4 bg-stone-50 border-t border-stone-100 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-100"
          >
            {lang === 'km' ? 'បិទ' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
