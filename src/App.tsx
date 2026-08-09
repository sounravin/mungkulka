import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingHero } from './components/LandingHero';
import { TemplatePicker } from './components/TemplatePicker';
import { InvitationBuilder } from './components/InvitationBuilder';
import { InvitationCard } from './components/InvitationCard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PurchaseModal } from './components/PurchaseModal';
import { MemberLoginModal } from './components/MemberLoginModal';
import { ActivationCodeModal } from './components/ActivationCodeModal';
import { NotificationsModal } from './components/NotificationsModal';
import { AdminDashboard } from './components/AdminDashboard';
import { TelegramSupportWidget } from './components/TelegramSupportWidget';
import { SAMPLE_INVITATIONS } from './data/presetInvitations';
import { WeddingInvitationData, TemplateId, Language, PackageTier, UnlockedPackage, MemberAccount } from './types';
import { getLoggedMember, logoutMember, fetchCurrentLoggedMember } from './utils/memberStorage';
import { subscribeRealtime } from './utils/realtime';
import { fetchSystemConfigFromCloud } from './utils/systemConfig';
import { X, Smartphone, Sparkles, ArrowLeft } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>('km');
  const [currentView, setCurrentView] = useState<'landing' | 'templates' | 'builder' | 'demo' | 'admin'>('landing');
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState(false);

  // Guest Shared Invitation Link state
  const [isGuestShareView, setIsGuestShareView] = useState(false);
  const [guestRecipientName, setGuestRecipientName] = useState<string | null>(null);
  const [sharedInvitation, setSharedInvitation] = useState<WeddingInvitationData | null>(null);

  // Check URL query params for ?invite=... or ?invitationId=... or ?guest=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviteId =
      params.get('invite') ||
      params.get('invitationId') ||
      window.location.hash.replace('#invitation-', '').replace('#', '');
    const guestName = params.get('guest');

    if (inviteId) {
      if (guestName) {
        setGuestRecipientName(guestName);
      }

      // Fetch specific edited invitation from cloud server
      fetch(`/api/invitations/${inviteId}`)
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Invitation not found on server');
        })
        .then((data) => {
          if (data && data.id) {
            setSharedInvitation(data);
            setIsGuestShareView(true);
          }
        })
        .catch((err) => {
          console.warn('Could not load shared invitation from cloud:', err);
        });
    }
  }, []);

  // Sync System Branding & Logo Config and active member session on app load
  useEffect(() => {
    fetchSystemConfigFromCloud();
    fetchCurrentLoggedMember().then((member) => {
      if (member) {
        setLoggedMember(member);
        if (member.activatedPackage) {
          setUnlockedPackage(member.activatedPackage);
        }
      }
    });
  }, []);

  // Logged-in Member State
  const [loggedMember, setLoggedMember] = useState<MemberAccount | null>(() => getLoggedMember());

  // Unlocked Package State (from member account)
  const [unlockedPackage, setUnlockedPackage] = useState<UnlockedPackage | null>(null);

  // Keep unlocked package synced if member already has activatedPackage
  useEffect(() => {
    if (loggedMember?.activatedPackage) {
      setUnlockedPackage(loggedMember.activatedPackage);
    }
  }, [loggedMember]);

  // Clear sample gallery photos when a user member logs in so they can upload their own photos
  // Fetch member invitation from Cloud when member logs in
  useEffect(() => {
    if (loggedMember && loggedMember.id !== 'admin' && loggedMember.phone !== 'admin') {
      const invId = `inv-${loggedMember.phone}`;
      fetch(`/api/invitations/${invId}`)
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Not found');
        })
        .then((cloudData) => {
          if (cloudData && cloudData.id) {
            setInvitationData((prev) => ({
              ...prev,
              ...cloudData,
              parents: { ...prev.parents, ...(cloudData.parents || {}) },
              bankBlessing: { ...prev.bankBlessing, ...(cloudData.bankBlessing || {}) },
              schedule: Array.isArray(cloudData.schedule) ? cloudData.schedule : prev.schedule,
              galleryPhotos: Array.isArray(cloudData.galleryPhotos) ? cloudData.galleryPhotos : [],
            }));
          }
        })
        .catch(() => {
          // New member without saved cloud invitation -> initialize clean gallery
          setInvitationData((prev) => ({
            ...prev,
            id: invId,
            galleryPhotos: [],
          }));
        });
    }
  }, [loggedMember?.id, loggedMember?.phone]);

  // Subscribe to Realtime system events (Member login, order approval, notifications)
  useEffect(() => {
    const refreshMemberFromCloud = async (phone: string) => {
      try {
        const res = await fetch(`/api/members/current?phone=${encodeURIComponent(phone)}`);
        if (res.ok) {
          const fresh = await res.json();
          setLoggedMember(fresh);
          if (fresh?.activatedPackage) {
            setUnlockedPackage(fresh.activatedPackage);
          }
          return;
        }
      } catch (e) {}

      const freshMember = getLoggedMember();
      setLoggedMember(freshMember);
      if (freshMember?.activatedPackage) {
        setUnlockedPackage(freshMember.activatedPackage);
      }
    };

    const unsubscribe = subscribeRealtime((event) => {
      const current = getLoggedMember();
      if (current?.phone) {
        refreshMemberFromCloud(current.phone);
      } else {
        const freshMember = getLoggedMember();
        setLoggedMember(freshMember);
        if (freshMember?.activatedPackage) {
          setUnlockedPackage(freshMember.activatedPackage);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Modal Controls
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedPurchaseTier, setSelectedPurchaseTier] = useState<PackageTier>('35');
  const [isMemberLoginModalOpen, setIsMemberLoginModalOpen] = useState(false);
  const [memberAuthTab, setMemberAuthTab] = useState<'login' | 'register'>('login');
  const [isActivationCodeModalOpen, setIsActivationCodeModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);

  // Initialize invitation data from preset sample
  const [invitationData, setInvitationData] = useState<WeddingInvitationData>(SAMPLE_INVITATIONS[0]);

  const isAdmin = loggedMember?.id === 'admin' || loggedMember?.phone === 'admin' || sessionStorage.getItem('mongkulkar_admin_auth') === 'true';

  useEffect(() => {
    if (isAdmin) {
      setCurrentView('admin');
    }
  }, [isAdmin]);

  const handleLanguageToggle = () => {
    setLang((prev) => (prev === 'km' ? 'en' : 'km'));
  };

  const handleSelectTemplate = (templateId: TemplateId) => {
    setInvitationData((prev) => ({ ...prev, templateId }));
  };

  // Safe view navigation logic (restricts direct Studio builder access unless unlocked)
  const handleNavigate = (view: 'landing' | 'templates' | 'builder' | 'demo' | 'admin') => {
    if (isAdmin) {
      setCurrentView('admin');
      return;
    }
    if (view === 'builder' && !unlockedPackage) {
      setIsActivationCodeModalOpen(true);
      return;
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPurchase = (tier: PackageTier) => {
    setSelectedPurchaseTier(tier);
    setIsPurchaseModalOpen(true);
  };

  const handleOpenAuthModal = (tab: 'login' | 'register' = 'login') => {
    setMemberAuthTab(tab);
    setIsMemberLoginModalOpen(true);
  };

  const handleLogout = () => {
    logoutMember();
    sessionStorage.removeItem('mongkulkar_admin_auth');
    setLoggedMember(null);
    setUnlockedPackage(null);
    localStorage.removeItem('mongkulkar_unlocked');
    setCurrentView('landing');
  };

  const handleRefreshMemberState = () => {
    const fresh = getLoggedMember();
    setLoggedMember(fresh);
  };

  // FULL SCREEN MOBILE STANDALONE VIEW FOR GUESTS OPENING A SHARED INVITATION LINK
  if (isGuestShareView && sharedInvitation) {
    return (
      <div className="fixed inset-0 w-screen h-screen min-h-[100dvh] h-[100dvh] bg-[#1c1917] flex flex-col items-center justify-center overflow-hidden selection:bg-amber-200 z-50">
        {/* Standalone Fullscreen Phone Card Container - Pure Invitation for Guests */}
        <div className="w-full h-full min-h-[100dvh] h-[100dvh] sm:h-[860px] sm:max-w-[430px] sm:my-auto sm:rounded-[38px] bg-[#FAF7F2] shadow-2xl overflow-hidden relative flex flex-col border-x sm:border border-amber-200/50">
          <ErrorBoundary>
            <InvitationCard
              data={sharedInvitation}
              isStandalone
              guestRecipientName={guestRecipientName || undefined}
              onUpdateWishes={(newWish) => {
                fetch(`/api/invitations/${sharedInvitation.id}/wishes`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(newWish),
                }).catch(() => {});
              }}
            />
          </ErrorBoundary>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#2C2420] font-sans selection:bg-[#E8C8A3] selection:text-[#3D2513]">
      {/* Top Header Navbar */}
      <Navbar
        lang={lang}
        onLanguageToggle={handleLanguageToggle}
        onNavigate={handleNavigate}
        currentView={currentView}
        unlockedPackage={unlockedPackage}
        loggedMember={loggedMember}
        onOpenMemberLogin={(tab) => handleOpenAuthModal(tab || 'login')}
        onOpenActivationCodeModal={() => setIsActivationCodeModalOpen(true)}
        onOpenPricing={() => {
          if (currentView !== 'landing') {
            setCurrentView('landing');
            setTimeout(() => {
              const el = document.getElementById('pricing-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          } else {
            const el = document.getElementById('pricing-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        onOpenNotifications={() => setIsNotificationsModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Views */}
      <main className="flex-1">
        {isAdmin ? (
          <AdminDashboard
            lang={lang}
            onExitAdmin={handleLogout}
          />
        ) : (
          <>
            {currentView === 'landing' && (
              <LandingHero
                sampleInvitation={invitationData}
                lang={lang}
                onNavigate={handleNavigate}
                onSelectTemplate={handleSelectTemplate}
                onPreviewTemplate={(tmpl) => {
                  handleSelectTemplate(tmpl.id);
                  setIsFullscreenModalOpen(true);
                }}
                onSelectPackage={handleOpenPurchase}
                onOpenMemberLogin={() => handleOpenAuthModal('login')}
                unlockedPackage={unlockedPackage}
                onLogout={handleLogout}
              />
            )}

            {currentView === 'templates' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
                {!unlockedPackage && (
                  <div className="p-4 rounded-2xl bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold flex items-center justify-between flex-wrap gap-3">
                    <span>
                      {lang === 'km'
                        ? '⚠️ លោកអ្នកត្រូវធ្វើការទិញកញ្ចប់ និងបញ្ចូល Activation Code ជាមុនសិន ទើបអាចចូលទៅកាន់ Studio កែច្នៃធៀបបាន!'
                        : '⚠️ You need to purchase a package and enter an Activation Code to unlock the Studio Builder!'}
                    </span>
                    <button
                      onClick={() => setIsActivationCodeModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-[#B8860B] text-white text-[11px] font-extrabold hover:bg-[#966b08]"
                    >
                      {lang === 'km' ? 'បញ្ចូល Activation Code' : 'Enter Activation Code'}
                    </button>
                  </div>
                )}

                <TemplatePicker
                  selectedId={invitationData.templateId}
                  onSelectTemplate={(templateId) => {
                    handleSelectTemplate(templateId);
                    if (unlockedPackage) {
                      setCurrentView('builder');
                    } else {
                      setIsActivationCodeModalOpen(true);
                    }
                  }}
                  onPreviewTemplate={(tmpl) => {
                    handleSelectTemplate(tmpl.id);
                    setIsFullscreenModalOpen(true);
                  }}
                  lang={lang}
                />
              </div>
            )}

            {currentView === 'builder' && unlockedPackage && (
              <InvitationBuilder
                data={invitationData}
                onChange={(newData) => setInvitationData(newData)}
                lang={lang}
                onPreviewFullscreen={() => setIsFullscreenModalOpen(true)}
                unlockedPackage={unlockedPackage}
                onLogout={handleLogout}
              />
            )}

            {currentView === 'demo' && (
              <div className="py-8 px-4 flex flex-col items-center justify-center min-h-[85vh] w-full max-w-7xl mx-auto">
                <div className="text-center mb-6 space-y-3 max-w-xl mx-auto">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                    <span>{lang === 'km' ? 'ការបង្ហាញផ្ទាំងធៀបការ (Demo Preview)' : 'Interactive Invitation Demo'}</span>
                  </div>
                  <h2 className={`text-2xl sm:text-3xl font-extrabold text-stone-900 ${lang === 'km' ? 'font-moul' : 'font-playfair'}`}>
                    {lang === 'km' ? 'បទពិសោធន៍ធៀបការលើទូរស័ព្ទដៃ' : 'Mobile Digital Invitation Experience'}
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {lang === 'km'
                      ? 'នេះជាការបង្ហាញធៀបការគំរូដែលភ្ញៀវនឹងបានឃើញលើទូរស័ព្ទ។ លោកអ្នកអាចចុចបើកស្រោមសំបុត្រ ស្ដាប់តន្ត្រី មើលរូបថត និងប្រអប់ចងដៃ ABA បាន!'
                      : 'This is a live interactive preview of how guests see your digital wedding invitation.'}
                  </p>

                  <div className="pt-1 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => handleOpenPurchase('35')}
                      className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#B8860B] via-amber-500 to-[#8C6D3B] text-white text-xs font-bold shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-yellow-200" />
                      <span>{lang === 'km' ? 'ទិញកញ្ចប់ $35 VIP បង្កើតធៀបការ' : 'Purchase $35 VIP Package'}</span>
                    </button>
                    <button
                      onClick={() => setCurrentView('landing')}
                      className="px-5 py-2.5 rounded-full bg-white border border-stone-300 text-stone-700 text-xs font-bold shadow-sm hover:bg-stone-50 transition-all flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>{lang === 'km' ? 'ត្រឡប់ទៅទំព័រដើម' : 'Back to Home'}</span>
                    </button>
                  </div>
                </div>

                {/* Centered Phone Preview Frame */}
                <div className="flex justify-center items-center w-full my-auto">
                  <div className="relative w-full max-w-[380px] h-[720px] max-h-[80vh] rounded-[48px] bg-stone-900 p-3 shadow-2xl border-4 border-stone-800 ring-1 ring-stone-900 overflow-hidden flex flex-col justify-center items-center mx-auto">
                    {/* Camera Notch */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-28 h-4 bg-stone-900 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-stone-800 border border-stone-700" />
                    </div>
                    <div className="w-full h-full rounded-[38px] overflow-y-auto overflow-x-hidden bg-white relative flex flex-col no-scrollbar">
                      <ErrorBoundary>
                        <InvitationCard data={invitationData} isStandalone />
                      </ErrorBoundary>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentView === 'admin' && (
              <AdminDashboard
                lang={lang}
                onExitAdmin={handleLogout}
              />
            )}
          </>
        )}
      </main>

      {/* MEMBER PURCHASE MODAL */}
      {isPurchaseModalOpen && (
        <PurchaseModal
          selectedTier={selectedPurchaseTier}
          lang={lang}
          loggedMember={loggedMember}
          onClose={() => setIsPurchaseModalOpen(false)}
          onOrderSubmitted={() => handleRefreshMemberState()}
          onOpenStatusCheck={() => setIsNotificationsModalOpen(true)}
          onOpenAuth={() => handleOpenAuthModal('register')}
        />
      )}

      {/* PURE MEMBER LOGIN / REGISTER MODAL */}
      {isMemberLoginModalOpen && (
        <MemberLoginModal
          lang={lang}
          initialTab={memberAuthTab}
          onClose={() => setIsMemberLoginModalOpen(false)}
          onUnlockStudio={(unlocked) => {
            setUnlockedPackage(unlocked);
            handleRefreshMemberState();
            setCurrentView('builder');
          }}
          onMemberLoggedIn={(member) => {
            setLoggedMember(member);
            if (member.activatedPackage) {
              setUnlockedPackage(member.activatedPackage);
            }
          }}
          onAdminLoggedIn={() => setCurrentView('admin')}
        />
      )}

      {/* SEPARATE DEDICATED ACTIVATION CODE MODAL */}
      {isActivationCodeModalOpen && (
        <ActivationCodeModal
          lang={lang}
          loggedMember={loggedMember}
          onClose={() => setIsActivationCodeModalOpen(false)}
          onUnlockStudio={(unlocked) => {
            setUnlockedPackage(unlocked);
            handleRefreshMemberState();
            setCurrentView('builder');
          }}
          onOpenPurchaseModal={() => setIsPurchaseModalOpen(true)}
          onOpenLoginModal={() => handleOpenAuthModal('login')}
        />
      )}

      {/* MEMBER NOTIFICATIONS MODAL */}
      {isNotificationsModalOpen && (
        <NotificationsModal
          lang={lang}
          loggedMember={loggedMember}
          onClose={() => {
            setIsNotificationsModalOpen(false);
            handleRefreshMemberState();
          }}
          onRefreshMember={handleRefreshMemberState}
          onActivateCode={(code, tier) => {
            const unlocked: UnlockedPackage = {
              packageType: tier,
              activationCode: code,
              memberName: loggedMember?.name || 'Member',
              memberPhone: loggedMember?.phone || '012000000',
              maxPhotos: tier === '35' ? 10 : 5,
              unlockedAt: new Date().toISOString(),
            };
            setUnlockedPackage(unlocked);
            handleRefreshMemberState();
            setIsNotificationsModalOpen(false);
            setCurrentView('builder');
          }}
          onOpenAuth={() => handleOpenAuthModal('login')}
        />
      )}

      {/* FULLSCREEN PREVIEW MODAL */}
      {isFullscreenModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fadeIn">
          {/* Header controls inside fullscreen modal */}
          <div className="w-full max-w-md flex items-center justify-between text-white pb-3 px-2">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              <span>{lang === 'km' ? 'ធៀបការលើអេក្រង់ពេញ' : 'Fullscreen Phone Preview'}</span>
            </span>

            <button
              onClick={() => setIsFullscreenModalOpen(false)}
              className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Phone Frame Modal Content */}
          <div className="relative w-full max-w-[380px] h-[80vh] rounded-[48px] bg-stone-900 p-3 shadow-2xl border-4 border-stone-800 overflow-hidden">
            <div className="w-full h-full rounded-[38px] overflow-y-auto overflow-x-hidden bg-white relative no-scrollbar">
              <ErrorBoundary>
                <InvitationCard data={invitationData} isStandalone />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      )}

      {/* Floating Telegram Support Widget */}
      <TelegramSupportWidget lang={lang} />

      {/* Footer */}
      <Footer lang={lang} />
    </div>
  );
}
