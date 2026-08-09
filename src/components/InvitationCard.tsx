import React, { useState, useRef, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'motion/react';
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Gift,
  Heart,
  ChevronDown,
  Copy,
  Check,
  X,
  Send,
  Users,
  Utensils,
  Scissors,
  Sun,
  Film,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  ExternalLink,
  Disc,
  Music,
  Trash2
} from 'lucide-react';
import { WeddingInvitationData, GuestWish, TemplateTheme } from '../types';
import { KhmerCalendar } from './KhmerCalendar';
import { TEMPLATES } from '../data/templates';
import { ChateauBlueInvitationView } from './ChateauBlueInvitationView';
import { VelvetRubyInvitationView } from './VelvetRubyInvitationView';
import { CustomZipInvitationView } from './CustomZipInvitationView';
import { VintageVinylPlayer } from './VintageVinylPlayer';
import { getAllTemplates, fetchCustomTemplates } from '../utils/templateManager';

interface InvitationCardProps {
  data: WeddingInvitationData;
  isStandalone?: boolean;
  guestRecipientName?: string;
  onUpdateWishes?: (newWish: GuestWish) => void;
}

const BurgundyFloralLeftSVG = () => (
  <svg
    className="absolute -left-2 top-0 bottom-0 h-full w-28 sm:w-36 pointer-events-none z-10 filter drop-shadow-md opacity-95"
    viewBox="0 0 140 320"
    fill="none"
  >
    {/* Delicate Stems */}
    <path d="M 20 10 C 35 80, 25 180, 15 310" stroke="#7A6855" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M 30 50 C 50 120, 35 220, 25 290" stroke="#7A6855" strokeWidth="1.2" strokeLinecap="round" />

    {/* Olive Green Leaves */}
    <path d="M 30 35 C 50 25, 60 10, 52 0 C 42 5, 32 25, 30 35 Z" fill="#606E50" opacity="0.85" />
    <path d="M 22 90 C 42 80, 55 65, 46 52 C 36 58, 25 78, 22 90 Z" fill="#758563" opacity="0.9" />
    <path d="M 38 140 C 58 130, 70 115, 62 102 C 50 108, 40 128, 38 140 Z" fill="#586648" opacity="0.85" />
    <path d="M 18 210 C 38 200, 50 185, 42 172 C 32 178, 22 198, 18 210 Z" fill="#6A7A57" opacity="0.85" />
    <path d="M 25 270 C 45 260, 58 245, 50 232 C 38 238, 28 258, 25 270 Z" fill="#586648" opacity="0.9" />

    {/* Gold Berry Sprigs */}
    <g fill="#D4AF37">
      <circle cx="52" cy="42" r="3.5" />
      <circle cx="58" cy="35" r="2.8" />
      <circle cx="45" cy="48" r="2.5" />
      <circle cx="62" cy="125" r="3.5" />
      <circle cx="68" cy="118" r="2.8" />
      <circle cx="55" cy="132" r="2.5" />
      <circle cx="48" cy="225" r="3.5" />
      <circle cx="54" cy="218" r="2.8" />
    </g>

    {/* Top Burgundy Rose Cluster */}
    <g transform="translate(32, 60)">
      <circle cx="0" cy="0" r="26" fill="#3D0007" />
      <path d="M-18 -10 C-10 -24 10 -24 18 -10 C24 5 8 20 -8 18 C-22 15 -24 0 -18 -10 Z" fill="#580A14" />
      <path d="M-14 -6 C-8 -18 8 -18 14 -6 C18 4 6 15 -6 14 C-17 11 -18 0 -14 -6 Z" fill="#780A1A" />
      <path d="M-10 -4 C-5 -12 5 -12 10 -4 C13 3 4 10 -4 9 C-12 7 -13 0 -10 -4 Z" fill="#991228" />
      <circle cx="0" cy="0" r="4" fill="#D4AF37" />
    </g>

    {/* Cream Peony Accent */}
    <g transform="translate(18, 115)">
      <circle cx="0" cy="0" r="18" fill="#D9CBB7" />
      <circle cx="-1" cy="-1" r="14" fill="#EFE5D5" />
      <circle cx="0" cy="0" r="10" fill="#FAF6EE" />
      <circle cx="0" cy="0" r="4" fill="#D4AF37" />
    </g>

    {/* Large Main Burgundy Peony Rose (Center-Left) */}
    <g transform="translate(36, 175)">
      <circle cx="0" cy="0" r="32" fill="#320005" />
      <circle cx="-2" cy="-2" r="27" fill="#500713" />
      <circle cx="1" cy="1" r="22" fill="#6E0A1A" />
      <circle cx="0" cy="-1" r="17" fill="#8C0F22" />
      <circle cx="-1" cy="0" r="12" fill="#AB152D" />
      <circle cx="0" cy="0" r="7" fill="#C71B35" />
      <circle cx="0" cy="0" r="4" fill="#E2C275" />
    </g>

    {/* Bottom Burgundy Peony Rose */}
    <g transform="translate(24, 245)">
      <circle cx="0" cy="0" r="24" fill="#3D0007" />
      <circle cx="-1" cy="-1" r="19" fill="#5A0815" />
      <circle cx="1" cy="1" r="15" fill="#780A1A" />
      <circle cx="0" cy="-1" r="11" fill="#960E24" />
      <circle cx="0" cy="0" r="4" fill="#D4AF37" />
    </g>
  </svg>
);

const BurgundyFloralRightSVG = () => (
  <svg
    className="absolute -right-2 top-0 bottom-0 h-full w-28 sm:w-36 pointer-events-none z-10 filter drop-shadow-md opacity-95"
    viewBox="0 0 140 320"
    fill="none"
  >
    {/* Delicate Stems */}
    <path d="M 120 10 C 105 80, 115 180, 125 310" stroke="#7A6855" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M 110 50 C 90 120, 105 220, 115 290" stroke="#7A6855" strokeWidth="1.2" strokeLinecap="round" />

    {/* Olive Green Leaves */}
    <path d="M 110 35 C 90 25, 80 10, 88 0 C 98 5, 108 25, 110 35 Z" fill="#606E50" opacity="0.85" />
    <path d="M 118 90 C 98 80, 85 65, 94 52 C 104 58, 115 78, 118 90 Z" fill="#758563" opacity="0.9" />
    <path d="M 102 140 C 82 130, 70 115, 78 102 C 90 108, 100 128, 102 140 Z" fill="#586648" opacity="0.85" />
    <path d="M 122 210 C 102 200, 90 185, 98 172 C 108 178, 118 198, 122 210 Z" fill="#6A7A57" opacity="0.85" />
    <path d="M 115 270 C 95 260, 82 245, 90 232 C 102 238, 112 258, 115 270 Z" fill="#586648" opacity="0.9" />

    {/* Gold Berry Sprigs */}
    <g fill="#D4AF37">
      <circle cx="88" cy="42" r="3.5" />
      <circle cx="82" cy="35" r="2.8" />
      <circle cx="95" cy="48" r="2.5" />
      <circle cx="78" cy="125" r="3.5" />
      <circle cx="72" cy="118" r="2.8" />
      <circle cx="85" cy="132" r="2.5" />
      <circle cx="92" cy="225" r="3.5" />
      <circle cx="86" cy="218" r="2.8" />
    </g>

    {/* Top Main Burgundy Peony Rose */}
    <g transform="translate(104, 75)">
      <circle cx="0" cy="0" r="32" fill="#320005" />
      <circle cx="2" cy="-2" r="27" fill="#500713" />
      <circle cx="-1" cy="1" r="22" fill="#6E0A1A" />
      <circle cx="0" cy="-1" r="17" fill="#8C0F22" />
      <circle cx="1" cy="0" r="12" fill="#AB152D" />
      <circle cx="0" cy="0" r="7" fill="#C71B35" />
      <circle cx="0" cy="0" r="4" fill="#E2C275" />
    </g>

    {/* Cream Peony Accent */}
    <g transform="translate(118, 145)">
      <circle cx="0" cy="0" r="18" fill="#D9CBB7" />
      <circle cx="1" cy="-1" r="14" fill="#EFE5D5" />
      <circle cx="0" cy="0" r="10" fill="#FAF6EE" />
      <circle cx="0" cy="0" r="4" fill="#D4AF37" />
    </g>

    {/* Center-Right Burgundy Peony Rose */}
    <g transform="translate(102, 205)">
      <circle cx="0" cy="0" r="28" fill="#3D0007" />
      <path d="M-20 -10 C-12 -26 12 -26 20 -10 C26 5 10 22 -10 20 C-24 17 -26 0 -20 -10 Z" fill="#580A14" />
      <path d="M-15 -7 C-9 -20 9 -20 15 -7 C19 4 7 16 -7 15 C-18 12 -19 0 -15 -7 Z" fill="#780A1A" />
      <path d="M-11 -4 C-6 -13 6 -13 11 -4 C14 3 5 11 -5 10 C-13 8 -14 0 -11 -4 Z" fill="#991228" />
      <circle cx="0" cy="0" r="4" fill="#D4AF37" />
    </g>

    {/* Bottom Burgundy Rose Bud */}
    <g transform="translate(112, 265)">
      <circle cx="0" cy="0" r="16" fill="#3D0007" />
      <circle cx="1" cy="-1" r="12" fill="#5A0815" />
      <circle cx="-1" cy="1" r="9" fill="#780A1A" />
      <circle cx="0" cy="0" r="3" fill="#D4AF37" />
    </g>
  </svg>
);

const getStage1ButtonClass = (templateId: string) => {
  switch (templateId) {
    case 'chateau-blue':
      return 'mt-4 px-8 py-3.5 rounded-full bg-[#1E293B] text-white font-serif font-medium text-xs tracking-wider shadow-lg hover:bg-[#0F172A] active:scale-95 transition-all cursor-pointer';
    default:
      return 'mt-4 px-8 py-3.5 rounded-full bg-white border-2 border-[#D4AF37] text-[#8C6D3B] font-bold text-xs sm:text-sm shadow-lg hover:bg-amber-50 hover:scale-105 active:scale-95 transition-all ring-2 ring-amber-200/50 cursor-pointer';
  }
};

const getSlideAnimClass = (templateId: string) => {
  switch (templateId) {
    case 'chateau-blue':
      return 'animate-photo-3d-tilt';
    default:
      return 'animate-photo-3d-tilt';
  }
};

const getSlideFrameStyle = (templateId: string) => {
  switch (templateId) {
    case 'chateau-blue':
      return 'rounded-3xl border-2 border-amber-300/90 bg-gradient-to-b from-[#1E3A8A]/40 via-black/60 to-black/90 backdrop-blur-md shadow-[0_25px_60px_rgba(30,58,138,0.7)]';
    default:
      return 'rounded-3xl border-2 border-amber-400/60 bg-black/50 backdrop-blur-md shadow-[0_25px_50px_rgba(0,0,0,0.8)]';
  }
};

const getSlideGlowBg = (templateId: string) => {
  switch (templateId) {
    case 'chateau-blue':
      return 'bg-gradient-to-r from-[#1E3A8A]/80 via-[#3B82F6]/50 to-[#1E3A8A]/80';
    default:
      return 'bg-gradient-to-r from-amber-500/50 via-rose-500/40 to-amber-500/50';
  }
};

const getActionButtonClass = (templateId: string) => {
  switch (templateId) {
    case 'chateau-blue':
      return 'w-full py-3 rounded-full bg-[#1E3A8A] text-white font-serif font-bold text-xs shadow-md hover:bg-[#1E293B] active:scale-95 transition-all flex items-center justify-center gap-2 border border-blue-200 cursor-pointer';
    default:
      return 'w-full py-3 rounded-2xl bg-gradient-to-r from-[#FFD700] via-[#E6C687] to-[#B8860B] text-stone-900 font-extrabold text-xs shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 border border-amber-200 cursor-pointer';
  }
};

export const InvitationCard: React.FC<InvitationCardProps> = ({
  data,
  isStandalone = false,
  guestRecipientName,
  onUpdateWishes,
}) => {
  const [allTemplatesList, setAllTemplatesList] = useState<TemplateTheme[]>(() => getAllTemplates());

  useEffect(() => {
    fetchCustomTemplates().then((updated) => {
      setAllTemplatesList(getAllTemplates());
    });

    const handleUpdate = () => {
      setAllTemplatesList(getAllTemplates());
    };

    window.addEventListener('templates-updated', handleUpdate);
    return () => window.removeEventListener('templates-updated', handleUpdate);
  }, []);

  const currentTemplate = useMemo(() => {
    return (
      allTemplatesList.find((t) => t.id === data.templateId) ||
      TEMPLATES.find((t) => t.id === data.templateId) ||
      allTemplatesList[0] ||
      TEMPLATES[0]
    );
  }, [allTemplatesList, data.templateId]);

  // Stage 0: Closed Wax Seal Envelope
  // Stage 1: Card Front Cover Arch Gate with Entrance Text & "ចុចដើម្បីបើកធៀប"
  // Stage 1.5: Theater Red Curtain Opening & Couple Photo Gallery Animation (Video Match!)
  // Stage 2: Main Opened Invitation Details
  const [stage, setStage] = useState<0 | 1 | 1.5 | 2>(0);
  const [lang, setLang] = useState<'km' | 'en'>('km');
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeModal, setActiveModal] = useState<'location' | 'gift' | 'schedule' | null>(null);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [wishes, setWishes] = useState<GuestWish[]>(data.wishes || []);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Countdown State
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetDate = new Date(data.weddingDateIso || '2026-06-21').getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (!isNaN(difference) && difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [data.weddingDateIso]);

  // Curtain & Photo Slideshow State
  const [curtainOpen, setCurtainOpen] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isAutoSlideshow, setIsAutoSlideshow] = useState(true);
  const [isTransitioningBlur, setIsTransitioningBlur] = useState(false);
  const [isPhotoLightboxOpen, setIsPhotoLightboxOpen] = useState(false);

  // Form State
  const [guestName, setGuestName] = useState('');
  const [guestMessage, setGuestMessage] = useState('');
  const [attendance, setAttendance] = useState<'attending' | 'regret' | 'maybe'>('attending');
  const [guestCount, setGuestCount] = useState(1);

  // Floating Dock Visibility on Scroll (Hide when scrolling down, show when scrolling up or at top)
  const [showQuickDock, setShowQuickDock] = useState(true);
  const lastScrollTopRef = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target;
      let scrollTop = 0;
      if (target && target !== document && target !== window && 'scrollTop' in (target as HTMLElement)) {
        scrollTop = (target as HTMLElement).scrollTop;
      } else {
        scrollTop = window.scrollY || document.documentElement.scrollTop;
      }

      const delta = scrollTop - lastScrollTopRef.current;
      if (scrollTop <= 40) {
        setShowQuickDock(true);
      } else if (delta > 6) {
        // Scrolling down -> hide button
        setShowQuickDock(false);
      } else if (delta < -6) {
        // Scrolling up -> show button
        setShowQuickDock(true);
      }
      lastScrollTopRef.current = scrollTop;
    };

    const containerEl = scrollContainerRef.current;
    if (containerEl) {
      containerEl.addEventListener('scroll', handleScroll, { passive: true });
    }
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (containerEl) {
        containerEl.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, [stage]);

  // Collect all photos for animation and main card gallery (Max 10 photos)
  const galleryPhotosList = React.useMemo(() => {
    const list: string[] = [];

    if (data.galleryPhotos && data.galleryPhotos.length > 0) {
      data.galleryPhotos.forEach((url) => {
        if (url && !list.includes(url)) list.push(url);
      });
    } else if (data.couplePhotoUrl) {
      list.push(data.couplePhotoUrl);
    }

    // Fallback defaults ONLY if list is empty
    if (list.length === 0) {
      list.push(
        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80'
      );
    }
    return list.slice(0, 10);
  }, [data.couplePhotoUrl, data.galleryPhotos]);

  // Photo slideshow auto timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (stage === 1.5 && isAutoSlideshow && galleryPhotosList.length > 1) {
      timer = setInterval(() => {
        setActivePhotoIdx((prev) => (prev + 1) % galleryPhotosList.length);
      }, 3500);
    }
    return () => clearInterval(timer);
  }, [stage, isAutoSlideshow, galleryPhotosList]);

  // YouTube Video Link Auto-Converter
  const youtubeVideoId = useMemo(() => {
    if (!data.musicTrack) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = data.musicTrack.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }, [data.musicTrack]);

  // Sound & Music
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [stage]);

  const toggleMusic = () => {
    if (youtubeVideoId) {
      setIsPlaying((prev) => !prev);
      return;
    }
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log('Audio error:', err));
    }
  };

  // Step 0 -> Step 1: Open Envelope Wax Seal
  const handleOpenEnvelope = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#D4AF37', '#FFD700', '#F5EFE6', '#E8DFC2'],
    });
    setStage(1);
  };

  // Step 1 -> Step 1.5: Open Red Theater Curtain & Couple Photo Animation
  const handleOpenMainCard = () => {
    setStage(1.5);
    setCurtainOpen(false);
    setIsTransitioningBlur(false);
    setActivePhotoIdx(0);

    // Fire golden celebration confetti
    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#FFD700', '#F8BBD0', '#E8DFC2'],
    });

    // Start background music
    if (youtubeVideoId) {
      setIsPlaying(true);
    } else if (audioRef.current && !isPlaying) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log('Audio autoplay prevented:', err));
    }

    // Trigger curtain split animation
    setTimeout(() => {
      setCurtainOpen(true);
    }, 150);

    // Photo slideshow presentation duration: 10.45 seconds total
    // Activate motion blur transition effect at 10.0s (10000ms)
    setTimeout(() => {
      setIsTransitioningBlur(true);
    }, 10000);

    // Transition to Stage 2 (Main Invitation) after 10.45s (10450ms)
    setTimeout(() => {
      setStage(2);
      setIsTransitioningBlur(false);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#D4AF37', '#FFD700', '#E8DFC2'],
      });
    }, 10450);
  };

  // Proceed from Photo Curtain Animation to Main Card Details
  const handleProceedToDetails = () => {
    setStage(2);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#D4AF37', '#FFD700', '#E8DFC2'],
    });
  };

  const handleCopyAccount = () => {
    if (data.bankBlessing?.accountNumber && navigator.clipboard) {
      navigator.clipboard.writeText(data.bankBlessing.accountNumber);
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    }
  };

  const handleAddWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    const newWish: GuestWish = {
      id: `w-${Date.now()}`,
      guestName: guestName.trim(),
      message: guestMessage.trim() || (lang === 'km' ? 'សូមជូនពរឱ្យមានសុភមង្គលរហូត!' : 'Wishing you lifetime happiness!'),
      attendance,
      guestCount,
      createdAt: new Date().toISOString(),
    };

    const updated = [newWish, ...wishes];
    setWishes(updated);
    if (onUpdateWishes) onUpdateWishes(newWish);

    setGuestName('');
    setGuestMessage('');

    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#D4AF37', '#FF69B4', '#E8DFC2'],
    });
  };

  const handleDeleteWish = (wishId: string) => {
    setWishes((prev) => prev.filter((w) => w.id !== wishId));
  };

  const handleClearAllWishes = () => {
    if (window.confirm(lang === 'km' ? 'តើអ្នកប្រាកដថាលុបសារជូនពរទាំងអស់មែនទេ?' : 'Are you sure you want to delete all guest wishes?')) {
      setWishes([]);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div ref={scrollContainerRef} className="relative w-full h-full min-h-full bg-[#EFE8DC] text-[#2C2117] flex justify-center items-start overflow-y-auto selection:bg-[#E8C8A3]">
      {/* Background Audio or YouTube Converter Embed */}
      {youtubeVideoId ? (
        isPlaying && (
          <iframe
            className="hidden pointer-events-none w-0 h-0 opacity-0"
            src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&enablejsapi=1&loop=1&playlist=${youtubeVideoId}`}
            allow="autoplay"
            title="YouTube Audio Background"
          />
        )
      ) : data.musicTrack && data.musicTrack.trim() !== '' ? (
        <audio ref={audioRef} src={data.musicTrack} loop />
      ) : null}

      {/* Template Particle Overlay Effects */}

      {/* Main Container Mobile Aspect Frame */}
      <div className={`relative w-full max-w-[430px] min-h-full shadow-2xl flex flex-col font-kantumruy transition-all duration-500 overflow-x-hidden border-x border-[#E8DFC2] ${currentTemplate.cardBgClass}`}>
        
        {/* ================= STAGE 0: WAX SEAL ENVELOPE (Image 1) ================= */}
        {stage === 0 && (
          currentTemplate.id === 'chateau-blue' ? (
            /* Château Porcelain Blue Royal European Envelope Frame */
            <div className="relative w-full min-h-full flex-1 bg-gradient-to-b from-[#0B1E38] via-[#102B4E] to-[#071324] flex flex-col items-center justify-between p-6 text-center animate-fadeIn overflow-hidden">
              {/* Floating Snowflakes / Golden Stars Watermark Overlay */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
                <div className="absolute top-12 left-8 text-amber-200 text-sm animate-pulse">✨</div>
                <div className="absolute top-1/4 right-10 text-sky-200 text-xs animate-bounce">❄️</div>
                <div className="absolute bottom-1/3 left-10 text-amber-300 text-xs animate-ping">⚜️</div>
                <div className="absolute bottom-20 right-12 text-blue-200 text-base animate-pulse">✨</div>
              </div>

              {/* Top Vintage Music Player */}
              <div className="absolute top-4 right-4 z-40">
                <VintageVinylPlayer
                  isPlaying={isPlaying}
                  onToggle={toggleMusic}
                  lang={lang}
                  variant="dark"
                />
              </div>

              <div className="my-auto w-full flex flex-col items-center justify-center space-y-6 relative z-10">
                {/* Guest Name Badge (if personalized link) */}
                {guestRecipientName && (
                  <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] border border-amber-300/80 text-amber-200 text-xs font-bold shadow-lg animate-bounce">
                    <span>{lang === 'km' ? 'គោរពអញ្ជើញ៖ ' : 'Respectfully Invited: '}</span>
                    <span className="text-white font-extrabold">{guestRecipientName}</span>
                  </div>
                )}

                {/* Porcelain Blue Royal Envelope Frame */}
                <div
                  onClick={handleOpenEnvelope}
                  className="relative w-full max-w-[320px] h-[220px] bg-gradient-to-br from-[#FFFFFF] via-[#F0F6FF] to-[#E2EDFF] rounded-2xl border-2 border-amber-300/90 shadow-[0_20px_50px_rgba(30,58,138,0.5)] flex items-center justify-center cursor-pointer group hover:scale-[1.03] transition-all duration-300 overflow-hidden"
                >
                  {/* Porcelain Floral Inner Corner Filigree */}
                  <div className="absolute inset-2 border border-amber-300/40 rounded-xl pointer-events-none" />

                  {/* Envelope Flap Lines */}
                  <div className="absolute inset-0 pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 320 220" fill="none">
                      <path d="M 0 0 L 160 110 L 320 0" stroke="#1E3A8A" strokeWidth="2" strokeDasharray="6 3" />
                      <path d="M 0 0 L 160 110 L 320 0" stroke="#D4AF37" strokeWidth="1" />
                      <path d="M 0 220 L 160 110 L 320 220" stroke="#3B82F6" strokeWidth="1.5" opacity="0.6" />
                    </svg>
                  </div>

                  {/* 3D Royal Porcelain Wax Seal Stamp in Center */}
                  <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-tr from-[#0F172A] via-[#1E3A8A] to-[#2563EB] p-1 shadow-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500 border border-amber-300/80">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-[#1E3A8A] via-[#172554] to-[#0F172A] border-2 border-amber-300/90 flex flex-col items-center justify-center shadow-inner text-amber-300">
                      <span className="text-xl filter drop-shadow">⚜️</span>
                      <span className="text-[10px] font-moul tracking-widest text-amber-200 mt-0.5">ម.ក</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs font-semibold text-amber-200 tracking-wider animate-pulse filter drop-shadow">
                  {lang === 'km' ? 'ប៉ះលើត្រា ឬស្រោមសំបុត្ររាជវាំងដើម្បីបើកធៀប' : 'Tap Royal Seal or Envelope to Open'}
                </p>
              </div>
            </div>
          ) : (
            /* Default Wax Seal Envelope */
            <div className="relative w-full min-h-full flex-1 bg-[repeating-linear-gradient(45deg,#F5EFE6_0px,#F5EFE6_3px,#EFE8DC_3px,#EFE8DC_6px)] flex flex-col items-center justify-between p-6 text-center animate-fadeIn overflow-hidden">
              {/* Top Vintage Music Player */}
              <div className="absolute top-4 right-4 z-40">
                <VintageVinylPlayer
                  isPlaying={isPlaying}
                  onToggle={toggleMusic}
                  lang={lang}
                  variant="compact"
                />
              </div>

              <div className="my-auto w-full flex flex-col items-center justify-center space-y-6">
                {/* Guest Name Badge (if personalized link) */}
                {guestRecipientName && (
                  <div className="px-4 py-2 rounded-2xl bg-amber-100/90 border border-amber-300 text-amber-900 text-xs font-bold shadow-sm animate-bounce">
                    <span>{lang === 'km' ? 'គោរពអញ្ជើញ៖ ' : 'Respectfully Invited: '}</span>
                    <span className="text-[#B8860B] font-extrabold">{guestRecipientName}</span>
                  </div>
                )}

                {/* Envelope Frame */}
                <div
                  onClick={handleOpenEnvelope}
                  className="relative w-full max-w-[320px] h-[220px] bg-[#F7F2E8] rounded-2xl border border-[#DCD0B7] shadow-xl flex items-center justify-center cursor-pointer group hover:scale-[1.02] transition-transform duration-300"
                >
                  {/* Envelope Flap Lines */}
                  <div className="absolute inset-0 pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 320 220" fill="none">
                      <path d="M 0 0 L 160 110 L 320 0" stroke="#DCD0B7" strokeWidth="1.5" />
                      <path d="M 0 220 L 160 110 L 320 220" stroke="#E2D7BE" strokeWidth="1" />
                    </svg>
                  </div>

                  {/* 3D Gold Wax Seal Stamp in Center */}
                  <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-tr from-[#8C6D3B] via-[#E6C687] to-[#B8860B] p-1 shadow-2xl flex items-center justify-center group-hover:rotate-6 transition-transform">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-[#D4AF37] via-[#C59B27] to-[#8C6D3B] border-2 border-[#FFE8A3]/60 flex items-center justify-center shadow-inner">
                      {/* Palm Branch / Leaf Embossed Design */}
                      <svg className="w-10 h-10 text-[#5C4520] fill-current opacity-80" viewBox="0 0 24 24">
                        <path d="M12 2C12 2 10.5 7 7 10C3.5 13 2 17 2 17C2 17 6 16.5 9 14C12 11.5 12 8 12 8C12 8 12 11.5 15 14C18 16.5 22 17 22 17C22 17 20.5 13 17 10C13.5 7 12 2 12 2Z" />
                        <path d="M12 8V22" stroke="#5C4520" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                </div>

                <p className="text-xs font-semibold text-[#8C6D3B] tracking-wide animate-pulse">
                  {lang === 'km' ? 'ប៉ះលើត្រា ឬស្រោមសំបុត្រដើម្បីបើកធៀប' : 'Tap wax seal or envelope to open'}
                </p>
              </div>
            </div>
          )
        )}

        {/* ================= STAGE 1: CARD COVER ARCH GATE (Image 2) ================= */}
        {stage === 1 && (
          currentTemplate.id === 'chateau-blue' ? (
            <div className="relative w-full min-h-full flex-1 bg-gradient-to-b from-[#0B1E38] via-[#102B4E] to-[#071324] flex flex-col items-center justify-center p-6 text-center animate-fadeIn overflow-hidden">
              {/* Floating Snowflakes / Stars Overlay */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                <div className="absolute top-10 left-8 text-blue-200 text-sm animate-bounce opacity-80">❄️</div>
                <div className="absolute top-1/4 right-10 text-sky-100 text-xs animate-pulse opacity-90">✨</div>
                <div className="absolute bottom-1/3 left-12 text-blue-100 text-xs animate-ping opacity-70">⭐</div>
                <div className="absolute bottom-20 right-12 text-blue-200 text-base animate-bounce delay-300 opacity-80">❄</div>
              </div>

              {/* Language Switcher Top Floating */}
              <div className="absolute top-4 right-4 z-30">
                <div className="inline-flex items-center gap-1 p-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white">
                  <button
                    type="button"
                    onClick={() => setLang('en')}
                    className={`px-2.5 py-0.5 rounded-full transition-all ${
                      lang === 'en' ? 'bg-[#1E3A8A] text-white shadow-xs' : 'text-slate-300'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLang('km')}
                    className={`px-2.5 py-0.5 rounded-full transition-all ${
                      lang === 'km' ? 'bg-[#1E3A8A] text-white shadow-xs' : 'text-slate-300'
                    }`}
                  >
                    ខ្មែរ
                  </button>
                </div>
              </div>

              {/* Centered Porcelain Card (Video Frame 0:00 - 0:02) */}
              <div className="relative z-20 w-full max-w-[320px] bg-white rounded-2xl shadow-2xl p-7 text-center border border-blue-100 space-y-4 animate-scaleUp">
                {/* Heart Icon Circle Header */}
                <div className="w-10 h-10 mx-auto rounded-full bg-[#1E3A8A] text-white flex items-center justify-center text-sm shadow-md">
                  💙
                </div>

                <div className="space-y-1">
                  <h1 className={lang === 'km' ? "font-moul text-lg text-[#1E3A8A] leading-relaxed" : "font-serif text-xl sm:text-2xl font-light tracking-[0.2em] text-[#1E3A8A] uppercase"}>
                    {lang === 'km' ? (data.groomNameKm || data.groomNameEn) : (data.groomNameEn || 'WILLIAM')}
                  </h1>
                  <p className="text-xs italic text-slate-400">{lang === 'km' ? 'និង' : '&'}</p>
                  <h1 className={lang === 'km' ? "font-moul text-lg text-[#1E3A8A] leading-relaxed" : "font-serif text-xl sm:text-2xl font-light tracking-[0.2em] text-[#1E3A8A] uppercase"}>
                    {lang === 'km' ? (data.brideNameKm || data.brideNameEn) : (data.brideNameEn || 'CHARLOTTE')}
                  </h1>
                </div>

                <div className="text-slate-300 text-xs">❀</div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-600 font-semibold tracking-widest">
                    {lang === 'km' ? (data.lunarDateKm || data.weddingDateIso) : (data.weddingDateIso || 'October 10, 2026')}
                  </p>
                  <p className="text-[11px] italic text-slate-400">
                    {lang === 'km' ? 'សូមអញ្ជើញចូលរួម' : "You're Invited"}
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleOpenMainCard}
                    className="w-full py-2.5 rounded-full bg-[#1E293B] text-white text-xs font-bold tracking-wider shadow-lg hover:bg-[#0F172A] active:scale-95 transition-all cursor-pointer"
                  >
                    {lang === 'km' ? 'ចុចដើម្បីបើកធៀប' : 'Open Invitation'}
                  </button>
                </div>
              </div>
            </div>
          ) : currentTemplate.id === 'velvet-ruby' ? (
            /* Velvet Ruby & Wine Rose Horizontal Intro Card (Exact Image 2 Match) */
            <div className="relative w-full min-h-full flex-1 bg-[#3A030A] flex flex-col items-center justify-center p-5 text-center animate-fadeIn overflow-hidden">
              {/* Floating Hearts & Gold Dust Particles */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 opacity-60">
                <div className="absolute top-12 left-6 text-amber-200 text-xs animate-bounce">🤍</div>
                <div className="absolute top-1/3 right-8 text-rose-300 text-sm animate-pulse">❤️</div>
                <div className="absolute bottom-1/4 left-10 text-amber-300 text-xs animate-ping">✨</div>
                <div className="absolute bottom-16 right-12 text-rose-200 text-xs animate-bounce delay-200">🤍</div>
              </div>

              {/* Language Switcher Top Floating */}
              <div className="absolute top-4 right-4 z-30">
                <div className="inline-flex items-center gap-1 p-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white">
                  <button
                    type="button"
                    onClick={() => setLang('en')}
                    className={`px-2.5 py-0.5 rounded-full transition-all ${
                      lang === 'en' ? 'bg-[#580A14] text-white shadow-xs' : 'text-amber-200/70'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLang('km')}
                    className={`px-2.5 py-0.5 rounded-full transition-all ${
                      lang === 'km' ? 'bg-[#580A14] text-white shadow-xs' : 'text-amber-200/70'
                    }`}
                  >
                    ខ្មែរ
                  </button>
                </div>
              </div>

              {/* Centered Cream Landscape Card with Botanical Floral Bouquets (Image 2 Match) */}
              <div className="relative z-20 w-full max-w-[340px] bg-[#FAF7F2] rounded-2xl shadow-2xl px-6 py-7 text-center border border-amber-200/50 space-y-3 animate-scaleUp overflow-hidden">
                {/* Botanical Rose Flowers Left & Right */}
                <BurgundyFloralLeftSVG />
                <BurgundyFloralRightSVG />

                {/* Heart Icon Badge Header */}
                <div className="relative z-20 w-11 h-11 mx-auto rounded-full bg-[#4A0A10] text-white flex items-center justify-center text-sm shadow-md border border-amber-300/30">
                  ❤️
                </div>

                <div className="relative z-20 space-y-1">
                  <h1 className={lang === 'km' ? "font-moul text-lg text-[#4A0A10] leading-relaxed" : "font-serif text-2xl font-light tracking-[0.2em] text-[#4A0A10] uppercase"}>
                    {lang === 'km' ? (data.groomNameKm || data.groomNameEn) : (data.groomNameEn || 'JULIAN')}
                  </h1>
                  <p className="text-sm italic font-serif text-[#4A0A10] my-0.5">&</p>
                  <h1 className={lang === 'km' ? "font-moul text-lg text-[#4A0A10] leading-relaxed" : "font-serif text-2xl font-light tracking-[0.2em] text-[#4A0A10] uppercase"}>
                    {lang === 'km' ? (data.brideNameKm || data.brideNameEn) : (data.brideNameEn || 'VIVIAN')}
                  </h1>
                </div>

                {/* Ornament Line Divider */}
                <div className="relative z-20 flex items-center justify-center gap-2 text-[#4A0A10] text-xs opacity-75">
                  <span className="w-8 h-px bg-[#4A0A10]/30" />
                  <span>❦</span>
                  <span className="w-8 h-px bg-[#4A0A10]/30" />
                </div>

                <div className="relative z-20 space-y-1">
                  <p className="text-xs text-stone-700 font-semibold tracking-widest">
                    {lang === 'km' ? (data.lunarDateKm || data.weddingDateIso) : (data.weddingDateIso ? new Date(data.weddingDateIso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'May 16, 2026')}
                  </p>
                  <p className="text-[11px] italic text-stone-500 font-serif">
                    {lang === 'km' ? 'សូមអញ្ជើញចូលរួម' : 'Cordially Invites'}
                  </p>
                </div>

                <div className="relative z-20 pt-2">
                  <button
                    type="button"
                    onClick={handleOpenMainCard}
                    className="px-8 py-2.5 rounded-full bg-[#4A0A10] hover:bg-[#2E050A] text-white text-xs sm:text-sm font-serif font-medium tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer border border-amber-300/30"
                  >
                    {lang === 'km' ? 'ចុចដើម្បីបើកធៀប' : 'Open'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="relative w-full min-h-full flex-1 bg-cover bg-center flex flex-col items-center justify-between py-10 px-6 text-center animate-fadeIn overflow-hidden"
              style={{ backgroundImage: `url(${currentTemplate.previewImage})` }}
            >
              {/* White Soft Overlay */}
              <div className="absolute inset-0 bg-amber-50/85 backdrop-blur-[2px] -z-0" />

              {/* Top Language Switcher Bar (Floating Absolute) */}
              <div className="absolute top-4 right-4 z-20">
                <div className="inline-flex items-center gap-1 p-1 rounded-full bg-white/90 border border-stone-200 shadow-sm text-xs font-bold text-stone-700">
                  <button
                    onClick={() => setLang('en')}
                    className={`px-2.5 py-1 rounded-full transition-all ${
                      lang === 'en' ? 'bg-[#B8860B] text-white shadow-sm' : 'text-stone-600'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLang('km')}
                    className={`px-2.5 py-1 rounded-full transition-all ${
                      lang === 'km' ? 'bg-[#B8860B] text-white shadow-sm' : 'text-stone-600'
                    }`}
                  >
                    ខ្មែរ
                  </button>
                </div>
              </div>

              {/* Middle Entrance Content - Perfectly Centered */}
              <div className="relative z-10 w-full my-auto flex flex-col items-center justify-center space-y-6 py-6">
                {/* Main Heading */}
                <h3 className="font-moul text-lg sm:text-xl text-[#8C6D3B] tracking-wide drop-shadow-sm animate-slideDown">
                  {lang === 'km' ? 'សិរីមង្គលអាពាហ៍ពិពាហ៍' : 'Holy Matrimony Wedding'}
                </h3>

                {/* Couple Names */}
                <div className="space-y-2 animate-fadeIn delay-100">
                  <h1 className="font-moul text-2xl sm:text-3xl text-[#2C2117] leading-relaxed drop-shadow-sm">
                    {lang === 'km' ? data.groomNameKm : data.groomNameEn}
                  </h1>
                  <p className="font-moul text-base text-[#D81B60] font-bold">និង</p>
                  <h1 className="font-moul text-2xl sm:text-3xl text-[#2C2117] leading-relaxed drop-shadow-sm">
                    {lang === 'km' ? data.brideNameKm : data.brideNameEn}
                  </h1>
                </div>

                {/* Decorative Divider */}
                <div className="flex items-center justify-center gap-2 text-[#C59B27] text-xs">
                  <span>◇</span>
                  <span>◈</span>
                  <span>◇</span>
                </div>

                {/* Date */}
                <p className="text-xs sm:text-sm font-semibold text-stone-700 tracking-wide">
                  {lang === 'km' ? data.lunarDateKm : data.weddingDateIso}
                </p>

                {/* OPEN MAIN INVITATION BUTTON */}
                <button
                  onClick={handleOpenMainCard}
                  className={getStage1ButtonClass(currentTemplate.id)}
                >
                  {lang === 'km' ? 'ចុចដើម្បីបើកធៀប' : 'Click to View Invitation'}
                </button>
              </div>

              {/* Bottom Arch Decorative Gate */}
              <div className="absolute bottom-2 inset-x-0 z-10 flex flex-col items-center opacity-60 pointer-events-none">
                <div className="w-full max-w-[220px] h-12 rounded-t-full border-t border-x border-[#D4AF37]/50 bg-white/30 flex items-center justify-center">
                  <div className="text-[9px] text-stone-500 font-semibold tracking-widest uppercase">
                    {lang === 'km' ? 'មង្គលការ (MongkulKar)' : 'MongkulKar E-Invite'}
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        {/* ================= STAGE 1.5: THEATER RED CURTAIN & PHOTO ANIMATION ================= */}
        {stage === 1.5 && (
          <div
            className={`relative w-full min-h-full h-full flex-1 bg-stone-950 flex flex-col items-center justify-between p-4 overflow-hidden transition-all duration-500 ${
              isTransitioningBlur ? 'blur-2xl opacity-0 scale-105' : 'blur-0 opacity-100 scale-100'
            }`}
          >
            {/* Custom Keyframe Animations for Cinematic Slideshow & Floating Depth Cards */}
            <style>{`
              @keyframes kenburnsBgMotion {
                0% { transform: scale(1.1) translate(0%, 0%) rotate(0deg); }
                25% { transform: scale(1.22) translate(-2.5%, 1.5%) rotate(0.4deg); }
                50% { transform: scale(1.28) translate(2.5%, -1.5%) rotate(-0.4deg); }
                75% { transform: scale(1.18) translate(-1.5%, -2.5%) rotate(0.6deg); }
                100% { transform: scale(1.1) translate(0%, 0%) rotate(0deg); }
              }
              .animate-kenburns-bg {
                animation: kenburnsBgMotion 20s ease-in-out infinite alternate;
              }

              @keyframes photo3dTiltWave {
                0% { transform: perspective(1000px) rotateY(-5deg) rotateX(2deg) scale(0.99); }
                33% { transform: perspective(1000px) rotateY(0deg) rotateX(-3deg) scale(1.02); }
                66% { transform: perspective(1000px) rotateY(5deg) rotateX(2deg) scale(1.00); }
                100% { transform: perspective(1000px) rotateY(-5deg) rotateX(2deg) scale(0.99); }
              }
              .animate-photo-3d-tilt {
                animation: photo3dTiltWave 6s ease-in-out infinite;
              }

              @keyframes floatCardTopRight {
                0% { transform: translate(0px, 0px) rotate(-12deg) scale(0.85); }
                50% { transform: translate(10px, -14px) rotate(-8deg) scale(0.88); }
                100% { transform: translate(0px, 0px) rotate(-12deg) scale(0.85); }
              }
              .animate-float-topright {
                animation: floatCardTopRight 7s ease-in-out infinite;
              }

              @keyframes floatCardBottomLeft {
                0% { transform: translate(0px, 0px) rotate(14deg) scale(0.82); }
                50% { transform: translate(-12px, 12px) rotate(18deg) scale(0.86); }
                100% { transform: translate(0px, 0px) rotate(14deg) scale(0.82); }
              }
              .animate-float-bottomleft {
                animation: floatCardBottomLeft 8s ease-in-out infinite;
              }

              @keyframes floatCardTopLeft {
                0% { transform: translate(0px, 0px) rotate(8deg) scale(0.75); }
                50% { transform: translate(-8px, -10px) rotate(4deg) scale(0.78); }
                100% { transform: translate(0px, 0px) rotate(8deg) scale(0.75); }
              }
              .animate-float-topleft {
                animation: floatCardTopLeft 9s ease-in-out infinite;
              }
            `}</style>

            {/* Background Ken Burns Pan-Zoom Motion Layer (Matching Active Photo Color & Tone) */}
            <div
              className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-70 animate-kenburns-bg transition-all duration-1000"
              style={{ backgroundImage: `url(${galleryPhotosList[activePhotoIdx]})` }}
            />
            {/* Dark Vignette Overlay for Depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-stone-950/50 to-black/85 backdrop-blur-sm" />

            {/* Split Curtains / Royal Gates Animation */}
            {currentTemplate.id === 'chateau-blue' ? (
              /* Château Porcelain Royal French Gate Doors Reveal (No Red Curtains!) */
              <div className="absolute inset-0 z-30 pointer-events-none flex">
                {/* Left Royal Porcelain Gate Door */}
                <div
                  className={`w-1/2 h-full bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#1E3A8A] shadow-2xl transition-transform duration-1000 ease-in-out border-r-2 border-amber-300/80 relative flex items-center justify-end pr-3 ${
                    curtainOpen ? '-translate-x-full' : 'translate-x-0'
                  }`}
                >
                  {/* Porcelain Filigree & Gold Damask Pattern */}
                  <div className="absolute inset-0 bg-[radial-gradient(#3B82F6_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                  <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-amber-400/30 to-transparent border-b border-amber-300/40" />
                  <div className="relative z-10 text-center space-y-1.5 text-amber-200">
                    <div className="text-3xl filter drop-shadow">⚜️</div>
                    <div className="text-[10px] font-serif tracking-widest text-blue-100 uppercase font-bold">
                      {lang === 'km' ? 'វិមានអឺរ៉ុប' : 'Château'}
                    </div>
                  </div>
                </div>

                {/* Right Royal Porcelain Gate Door */}
                <div
                  className={`w-1/2 h-full bg-gradient-to-l from-[#0F172A] via-[#1E293B] to-[#1E3A8A] shadow-2xl transition-transform duration-1000 ease-in-out border-l-2 border-amber-300/80 relative flex items-center justify-start pl-3 ${
                    curtainOpen ? 'translate-x-full' : 'translate-x-0'
                  }`}
                >
                  {/* Porcelain Filigree & Gold Damask Pattern */}
                  <div className="absolute inset-0 bg-[radial-gradient(#3B82F6_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                  <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-amber-400/30 to-transparent border-b border-amber-300/40" />
                  <div className="relative z-10 text-center space-y-1.5 text-amber-200">
                    <div className="text-3xl filter drop-shadow">⚜️</div>
                    <div className="text-[10px] font-serif tracking-widest text-blue-100 uppercase font-bold">
                      {lang === 'km' ? 'ឥន្ទនីល' : 'Porcelain Blue'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Default Split Red Velvet Theater Curtains Animation */
              <div className="absolute inset-0 z-30 pointer-events-none flex">
                {/* Left Curtain */}
                <div
                  className={`w-1/2 h-full bg-gradient-to-r from-[#700018] via-[#9E0022] to-[#B80028] shadow-2xl transition-transform duration-1000 ease-in-out border-r-4 border-[#FFD700] relative ${
                    curtainOpen ? '-translate-x-full' : 'translate-x-0'
                  }`}
                >
                  {/* Vertical Fold Textures */}
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(0,0,0,0.3)_0px,rgba(0,0,0,0.3)_15px,transparent_15px,transparent_30px)]" />
                  {/* Gold Fringe Valance Top */}
                  <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-[#FFD700] via-[#C59B27] to-transparent border-b border-[#FFE8A3]" />
                </div>

                {/* Right Curtain */}
                <div
                  className={`w-1/2 h-full bg-gradient-to-l from-[#700018] via-[#9E0022] to-[#B80028] shadow-2xl transition-transform duration-1000 ease-in-out border-l-4 border-[#FFD700] relative ${
                    curtainOpen ? 'translate-x-full' : 'translate-x-0'
                  }`}
                >
                  {/* Vertical Fold Textures */}
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(0,0,0,0.3)_0px,rgba(0,0,0,0.3)_15px,transparent_15px,transparent_30px)]" />
                  {/* Gold Fringe Valance Top */}
                  <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-[#FFD700] via-[#C59B27] to-transparent border-b border-[#FFE8A3]" />
                </div>
              </div>
            )}

            {/* Stage Top Header */}
            <div className="relative z-40 w-full pt-2 flex items-center justify-between text-white text-xs">
              <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-400/50 text-[11px] text-amber-200 font-bold flex items-center gap-1.5 shadow-lg">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {lang === 'km'
                    ? `រូបថតទី ${activePhotoIdx + 1} / ${galleryPhotosList.length}`
                    : `Photo ${activePhotoIdx + 1} of ${galleryPhotosList.length}`}
                </span>
              </div>

              {/* Vintage Music Vinyl Disc Player */}
              <VintageVinylPlayer
                isPlaying={isPlaying}
                onToggle={toggleMusic}
                lang={lang}
                variant="dark"
              />
            </div>

            {/* ================= DYNAMIC MULTI-LAYERED FLOATING PHOTO SLIDESHOW ================= */}
            <div className="relative z-20 flex-1 w-full my-auto flex items-center justify-center p-2 overflow-hidden">
              
              {/* 1. FLOATING BACKGROUND PHOTO CARD (Top Right - Matches Reference Image) */}
              {galleryPhotosList.length > 1 && (
                <div className="absolute -top-4 -right-8 sm:right-2 w-[160px] sm:w-[200px] h-[200px] sm:h-[250px] bg-[#FAF8F5] p-2 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] border border-amber-200/60 pointer-events-none opacity-80 animate-float-topright z-0 overflow-hidden">
                  <div className="w-full h-[150px] sm:h-[190px] overflow-hidden rounded-lg bg-stone-900">
                    <img
                      src={galleryPhotosList[(activePhotoIdx + 1) % galleryPhotosList.length]}
                      alt="Top Right Floating Card"
                      className="w-full h-full object-cover filter brightness-90"
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[8px] font-mono text-stone-500 px-1">
                    <span>✦ PHOTO FRAME</span>
                    <span>02/05</span>
                  </div>
                </div>
              )}

              {/* 2. FLOATING BACKGROUND PHOTO CARD (Bottom Left - Matches Reference Image) */}
              {galleryPhotosList.length > 2 && (
                <div className="absolute -bottom-6 -left-8 sm:left-2 w-[150px] sm:w-[190px] h-[190px] sm:h-[240px] bg-[#FAF8F5] p-2 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] border border-amber-200/60 pointer-events-none opacity-75 animate-float-bottomleft z-0 overflow-hidden">
                  <div className="w-full h-[140px] sm:h-[180px] overflow-hidden rounded-lg bg-stone-900">
                    <img
                      src={galleryPhotosList[(activePhotoIdx + 2) % galleryPhotosList.length]}
                      alt="Bottom Left Floating Card"
                      className="w-full h-full object-cover filter brightness-90"
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[8px] font-mono text-stone-500 px-1">
                    <span>✦ MEMORIES</span>
                    <span>03/05</span>
                  </div>
                </div>
              )}

              {/* 3. FLOATING BACKGROUND PHOTO CARD (Top Left - Depth Layer) */}
              {galleryPhotosList.length > 3 && (
                <div className="absolute top-2 -left-12 w-[130px] h-[160px] bg-white/90 p-1.5 rounded-lg shadow-xl border border-amber-200/40 pointer-events-none opacity-50 animate-float-topleft z-0 overflow-hidden hidden sm:block">
                  <div className="w-full h-[120px] overflow-hidden rounded bg-stone-900">
                    <img
                      src={galleryPhotosList[(activePhotoIdx + galleryPhotosList.length - 1) % galleryPhotosList.length]}
                      alt="Top Left Depth Card"
                      className="w-full h-full object-cover filter brightness-75"
                    />
                  </div>
                </div>
              )}

              {/* Left Navigation Arrow Button */}
              {galleryPhotosList.length > 1 && (
                <button
                  type="button"
                  onClick={() => setActivePhotoIdx((prev) => (prev - 1 + galleryPhotosList.length) % galleryPhotosList.length)}
                  className="absolute left-1 sm:left-4 z-40 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-amber-300 border border-amber-400/60 backdrop-blur-md flex items-center justify-center shadow-2xl active:scale-90 transition-all cursor-pointer"
                  title="Previous Photo"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* MAIN CENTRAL STUDIO PHOTO FRAME (Direct Match to User's Uploaded Reference Photo) */}
              <div className={`relative z-20 w-full max-w-[320px] sm:max-w-[360px] group transition-all duration-700 ${getSlideAnimClass(currentTemplate.id)}`}>
                
                {/* Glow Backdrop */}
                <div className={`absolute -inset-3 blur-2xl opacity-85 animate-pulse rounded-3xl ${getSlideGlowBg(currentTemplate.id)}`} />

                {/* Studio White/Cream Paper Frame Container */}
                <div className="relative w-full bg-[#FAF8F5] p-3 sm:p-4 rounded-2xl sm:rounded-3xl border-2 border-amber-300/80 shadow-[0_30px_70px_rgba(0,0,0,0.8)] overflow-hidden">
                  
                  {/* Top Bar Stamp Metadata (Same as reference image "✦ PHOTO FRAME - 01/05") */}
                  <div className="w-full pb-2 flex items-center justify-between text-[9px] sm:text-[10px] font-mono tracking-wider text-stone-600 border-b border-stone-200/80 mb-2">
                    <span className="flex items-center gap-1 font-semibold text-amber-900">
                      <span className="text-amber-600">✦</span> PHOTO FRAME - 0{activePhotoIdx + 1}
                    </span>
                    <span className="font-bold text-amber-800">
                      0{activePhotoIdx + 1} / 0{galleryPhotosList.length}
                    </span>
                  </div>

                  {/* Main Image Holder */}
                  <div className="relative w-full h-[320px] sm:h-[370px] overflow-hidden rounded-xl bg-stone-900 shadow-inner">
                    <img
                      key={activePhotoIdx}
                      src={galleryPhotosList[activePhotoIdx] || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'}
                      alt="Couple Photo"
                      className="w-full h-full object-cover transition-all duration-700 hover:scale-105 animate-fadeIn"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Subtle Dark Bottom Gradient Text Frame Overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 pt-8 text-white text-center space-y-0.5">
                      <h3 className="font-moul text-sm sm:text-base tracking-wide text-amber-200 filter drop-shadow">
                        {lang === 'km' ? `${data.groomNameKm} & ${data.brideNameKm}` : `${data.groomNameEn} & ${data.brideNameEn}`}
                      </h3>
                      <p className="text-[11px] text-stone-200 font-semibold filter drop-shadow">
                        {lang === 'km' ? data.lunarDateKm : data.weddingDateIso}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Bar Details (Same as reference image "MEMORIES | មង្គលការ") */}
                  <div className="w-full pt-2 mt-1 flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-stone-600 border-t border-stone-200/80">
                    <span className="text-stone-500 font-serif font-bold">
                      {data.weddingDateIso || 'WEDDING DAY'}
                    </span>
                    <span className="font-moul text-amber-900 tracking-wider">
                      MEMORIES | {lang === 'km' ? 'មង្គលការ' : 'WEDDING'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Navigation Arrow Button */}
              {galleryPhotosList.length > 1 && (
                <button
                  type="button"
                  onClick={() => setActivePhotoIdx((prev) => (prev + 1) % galleryPhotosList.length)}
                  className="absolute right-1 sm:right-4 z-40 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-amber-300 border border-amber-400/60 backdrop-blur-md flex items-center justify-center shadow-2xl active:scale-90 transition-all cursor-pointer"
                  title="Next Photo"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Bottom Photo Dots Indicator & Skip Button */}
            <div className="relative z-40 w-full pt-2 pb-4 flex flex-col items-center space-y-2">
              <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-amber-400/30">
                {galleryPhotosList.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === activePhotoIdx ? 'w-6 bg-amber-400' : 'w-1.5 bg-white/40'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => setStage(2)}
                className="px-4 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold text-xs shadow-lg transition-all border border-amber-300 flex items-center gap-1.5 active:scale-95"
              >
                <span>{lang === 'km' ? 'ចូលមើលធៀបការ ➔' : 'View Full Invitation ➔'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= STAGE 2: MAIN INVITATION PAGE (Video Match) ================= */}
        {stage === 2 && (
          currentTemplate.id === 'chateau-blue' ? (
            <ChateauBlueInvitationView
              data={data}
              lang={lang}
              setLang={setLang}
              isPlaying={isPlaying}
              toggleMusic={toggleMusic}
              timeLeft={timeLeft}
              galleryPhotosList={galleryPhotosList}
              activeModal={activeModal}
              setActiveModal={setActiveModal}
              setIsPhotoLightboxOpen={setIsPhotoLightboxOpen}
              setActivePhotoIdx={setActivePhotoIdx}
              wishes={wishes}
              guestName={guestName}
              setGuestName={setGuestName}
              guestMessage={guestMessage}
              setGuestMessage={setGuestMessage}
              attendance={attendance}
              setAttendance={setAttendance}
              guestCount={guestCount}
              setGuestCount={setGuestCount}
              handleAddWish={handleAddWish}
              handleDeleteWish={handleDeleteWish}
              copiedAccount={copiedAccount}
              handleCopyAccount={handleCopyAccount}
              scrollToSection={scrollToSection}
            />
          ) : currentTemplate.isCustom || currentTemplate.htmlContent || currentTemplate.id.startsWith('zip-tmpl-') ? (
            <CustomZipInvitationView
              data={data}
              template={currentTemplate}
              lang={lang}
              setLang={setLang}
              isPlaying={isPlaying}
              toggleMusic={toggleMusic}
              timeLeft={timeLeft}
              galleryPhotosList={galleryPhotosList}
              activeModal={activeModal}
              setActiveModal={setActiveModal}
              setIsPhotoLightboxOpen={setIsPhotoLightboxOpen}
              setActivePhotoIdx={setActivePhotoIdx}
              wishes={wishes}
              guestName={guestName}
              setGuestName={setGuestName}
              guestMessage={guestMessage}
              setGuestMessage={setGuestMessage}
              attendance={attendance}
              setAttendance={setAttendance}
              guestCount={guestCount}
              setGuestCount={setGuestCount}
              handleAddWish={handleAddWish}
              handleDeleteWish={handleDeleteWish}
              copiedAccount={copiedAccount}
              handleCopyAccount={handleCopyAccount}
              scrollToSection={scrollToSection}
            />
          ) : currentTemplate.id === 'velvet-ruby' ? (
            <VelvetRubyInvitationView
              data={data}
              lang={lang}
              setLang={setLang}
              isPlaying={isPlaying}
              toggleMusic={toggleMusic}
              timeLeft={timeLeft}
              galleryPhotosList={galleryPhotosList}
              activeModal={activeModal}
              setActiveModal={setActiveModal}
              setIsPhotoLightboxOpen={setIsPhotoLightboxOpen}
              setActivePhotoIdx={setActivePhotoIdx}
              wishes={wishes}
              guestName={guestName}
              setGuestName={setGuestName}
              guestMessage={guestMessage}
              setGuestMessage={setGuestMessage}
              attendance={attendance}
              setAttendance={setAttendance}
              guestCount={guestCount}
              setGuestCount={setGuestCount}
              handleAddWish={handleAddWish}
              handleDeleteWish={handleDeleteWish}
              copiedAccount={copiedAccount}
              handleCopyAccount={handleCopyAccount}
              scrollToSection={scrollToSection}
            />
          ) : (
            <div className="relative w-full flex-1 flex flex-col space-y-8 p-4 sm:p-5 pb-20 animate-fadeIn">
            
            {/* Top Floating Controls Bar (Image 3 Header) */}
            <div className="sticky top-0 z-40 w-full px-3 py-2 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E8DFC2] flex items-center justify-between text-xs rounded-b-2xl shadow-sm">
              {/* Language Pill */}
              <div className="inline-flex items-center gap-1 p-0.5 rounded-full bg-stone-100 border border-stone-200 text-[11px] font-bold text-stone-700">
                <button
                  onClick={() => setLang('en')}
                  className={`px-2.5 py-0.5 rounded-full transition-all ${
                    lang === 'en' ? 'bg-[#B8860B] text-white shadow-sm' : 'text-stone-600'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLang('km')}
                  className={`px-2.5 py-0.5 rounded-full transition-all ${
                    lang === 'km' ? 'bg-[#B8860B] text-white shadow-sm' : 'text-stone-600'
                  }`}
                >
                  ខ្មែរ
                </button>
              </div>

              {/* Vintage Music Vinyl Disc Player */}
              <VintageVinylPlayer
                isPlaying={isPlaying}
                onToggle={toggleMusic}
                lang={lang}
                variant="compact"
              />
            </div>

            {/* Right Side Floating Vertical Action Bar (Image 3 & 4) */}
            <div className={`absolute right-3 top-1/3 z-40 flex flex-col items-center gap-2.5 bg-white/85 backdrop-blur-md p-2 rounded-full border border-amber-200 shadow-xl transition-all duration-300 ${showQuickDock ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-16 pointer-events-none'}`}>
              <button
                onClick={() => handleOpenMainCard()}
                className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center hover:bg-amber-200 transition-colors shadow-sm"
                title="Replay Photo Animation"
              >
                <Film className="w-4 h-4 text-[#B8860B]" />
              </button>

              <button
                onClick={() => scrollToSection('schedule-section')}
                className="w-8 h-8 rounded-full bg-amber-50 text-amber-900 flex items-center justify-center hover:bg-amber-200 transition-colors"
                title="Schedule"
              >
                <CalendarIcon className="w-4 h-4 text-[#B8860B]" />
              </button>

              <button
                onClick={() => scrollToSection('location-section')}
                className="w-8 h-8 rounded-full bg-amber-50 text-amber-900 flex items-center justify-center hover:bg-amber-200 transition-colors"
                title="Location"
              >
                <MapPin className="w-4 h-4 text-[#B8860B]" />
              </button>

              <button
                onClick={() => scrollToSection('calendar-section')}
                className="w-8 h-8 rounded-full bg-amber-50 text-amber-900 flex items-center justify-center hover:bg-amber-200 transition-colors"
                title="Countdown"
              >
                <Clock className="w-4 h-4 text-[#B8860B]" />
              </button>

              <button
                onClick={() => scrollToSection('guestbook-section')}
                className="w-8 h-8 rounded-full bg-amber-50 text-amber-900 flex items-center justify-center hover:bg-amber-200 transition-colors"
                title="Guestbook"
              >
                <Heart className="w-4 h-4 text-[#B8860B]" />
              </button>

              <button
                onClick={() => setActiveModal('gift')}
                className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center hover:bg-amber-300 transition-colors shadow-sm"
                title="Cash Gift Blessing"
              >
                <Gift className="w-4 h-4 text-[#B8860B]" />
              </button>
            </div>

            {/* 1. Header Title & Couple Names */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center space-y-3 pt-2"
            >
              <h3 className="font-moul text-lg text-[#8C6D3B] tracking-wide">
                {lang === 'km' ? 'សិរីមង្គលអាពាហ៍ពិពាហ៍' : 'Holy Matrimony Wedding'}
              </h3>

              <div className="space-y-1">
                <h1 className="font-moul text-2xl sm:text-3xl text-[#2C2117]">
                  {lang === 'km' ? data.groomNameKm : data.groomNameEn}
                </h1>
                <p className="font-moul text-sm text-[#D81B60]">និង</p>
                <h1 className="font-moul text-2xl sm:text-3xl text-[#2C2117]">
                  {lang === 'km' ? data.brideNameKm : data.brideNameEn}
                </h1>
              </div>

              <div className="flex items-center justify-center gap-2 text-[#C59B27] text-xs">
                <span>◇</span>
                <span>◈</span>
                <span>◇</span>
              </div>

              <p className="text-xs italic text-stone-600 font-semibold">
                {lang === 'km' ? 'នឹងប្រារព្ធនៅ' : 'Will be held on'}
              </p>

              <div className="space-y-0.5">
                <p className="font-moul text-sm text-[#8C6D3B]">
                  {lang === 'km' ? data.lunarDateKm : data.weddingDateIso}
                </p>
                <p className="text-xs font-semibold text-stone-700">
                  {lang === 'km' ? data.weddingTimeKm : data.weddingTimeEn}
                </p>
              </div>

              {/* Venue Name & Building */}
              <div className="pt-2 max-w-xs mx-auto space-y-1">
                <p className="text-xs font-bold text-stone-800 leading-snug">
                  {lang === 'km' ? data.venueNameKm : data.venueNameEn}
                </p>
                <p className="text-xs font-semibold text-[#8C6D3B]">
                  {lang === 'km' ? data.addressKm : data.addressEn}
                </p>
              </div>
            </motion.div>

            {/* 2. Khmer Month Calendar Card with Add to Calendar button */}
            <motion.div
              id="calendar-section"
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="pt-2 space-y-3 text-center"
            >
              <KhmerCalendar weddingDateIso={data.weddingDateIso} lang={lang} />
            </motion.div>

            {/* 3. Feature Portrait Couple Photo + Parents Info Box + Formal Invitation (Video Frame 00:02 - 00:03) */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="space-y-4"
            >
              {/* Couple Feature Photo */}
              <div className="relative w-full rounded-3xl overflow-hidden shadow-xl border-2 border-[#D4AF37]/50 group">
                <img
                  src={
                    (data.couplePhotoUrl && data.couplePhotoUrl.trim() !== '' && !data.couplePhotoUrl.includes('unsplash.com')
                      ? data.couplePhotoUrl
                      : galleryPhotosList[0] || data.couplePhotoUrl) || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'
                  }
                  alt="Feature Couple"
                  className="w-full h-[380px] sm:h-[420px] object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Parents Information Card */}
              <div className="p-5 bg-[#FFFDF9] rounded-3xl border border-[#E8DFC2] shadow-sm text-center space-y-4">
                <div className="grid grid-cols-2 gap-4 border-b border-amber-100 pb-4 text-xs">
                  {/* Groom Parents */}
                  <div className="space-y-1">
                    <p className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">
                      {lang === 'km' ? 'លោកឪពុកលោកស្រី' : 'Groom Parents'}
                    </p>
                    <p className="font-bold text-stone-800">
                      {data.parents?.groomFather || (lang === 'km' ? 'លោក លី ស៊ី' : 'Mr. Ly Si')}
                    </p>
                    <p className="font-bold text-stone-800">
                      {data.parents?.groomMother || (lang === 'km' ? 'លោកស្រី ញ៉ិច កែវរតនា' : 'Mrs. Nhek Keo Rotana')}
                    </p>
                  </div>

                  {/* Bride Parents */}
                  <div className="space-y-1 border-l border-amber-100 pl-3">
                    <p className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">
                      {lang === 'km' ? 'លោកឪពុកលោកស្រី' : 'Bride Parents'}
                    </p>
                    <p className="font-bold text-stone-800">
                      {data.parents?.brideFather || (lang === 'km' ? 'លោក យី សុផល' : 'Mr. Yi Sophal')}
                    </p>
                    <p className="font-bold text-stone-800">
                      {data.parents?.brideMother || (lang === 'km' ? 'លោកស្រី ជិន សុផា' : 'Mrs. Chin Sopha')}
                    </p>
                  </div>
                </div>

                {/* Formal Invitation Speech */}
                <div className="space-y-2 pt-1">
                  <h4 className="font-moul text-sm text-[#8C6D3B]">
                    {lang === 'km' ? 'យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ' : 'We Cordially Invite You'}
                  </h4>
                  <p className="text-xs text-stone-700 leading-relaxed font-medium px-1">
                    {lang === 'km'
                      ? 'លោកអ្នកឧកញ៉ា អ្នកឧកញ៉ា លោកឧកញ៉ា លោក លោកស្រី អ្នកនាងកញ្ញា និងប្រិយមិត្តសព្វសារពើ ចូលរួមជាអធិបតី និងជាភ្ញៀវកិត្តិយស ដើម្បីប្រសិទ្ធពរជ័យ សិរីសួស្តី ជ័យមង្គល ក្នុងពិធីរៀបអាពាហ៍ពិពាហ៍រវាង កូនប្រុស កូនស្រី របស់យើងខ្ញុំ'
                      : 'Distinguished Guests, Relatives, and Friends to honor us with your presence and blessings at the Holy Matrimony Wedding of our Son & Daughter.'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 4. Marriage Countdown Timer Box (Video Frame 00:03 - 00:04) */}
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="p-5 bg-gradient-to-br from-[#FFFDF9] via-[#FAF4E8] to-[#FFFDF9] rounded-3xl border border-[#D4AF37]/40 shadow-sm text-center space-y-3"
            >
              <h4 className="font-moul text-sm text-[#8C6D3B] tracking-wide">
                {lang === 'km' ? 'ថ្ងៃដែលត្រូវរៀបអាពាហ៍ពិពាហ៍' : 'Wedding Countdown'}
              </h4>

              {/* 4 Digital Timer Cards */}
              <div className="grid grid-cols-4 gap-2 pt-1 max-w-xs mx-auto">
                <div className="p-2.5 rounded-2xl bg-white border border-amber-200 shadow-sm flex flex-col items-center">
                  <span className="font-mono text-lg font-extrabold text-[#8C6D3B]">{timeLeft.days}</span>
                  <span className="text-[10px] text-stone-500 font-bold">{lang === 'km' ? 'ថ្ងៃ' : 'Days'}</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-white border border-amber-200 shadow-sm flex flex-col items-center">
                  <span className="font-mono text-lg font-extrabold text-[#8C6D3B]">{timeLeft.hours}</span>
                  <span className="text-[10px] text-stone-500 font-bold">{lang === 'km' ? 'ម៉ោង' : 'Hours'}</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-white border border-amber-200 shadow-sm flex flex-col items-center">
                  <span className="font-mono text-lg font-extrabold text-[#8C6D3B]">{timeLeft.minutes}</span>
                  <span className="text-[10px] text-stone-500 font-bold">{lang === 'km' ? 'នាទី' : 'Mins'}</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-white border border-amber-200 shadow-sm flex flex-col items-center">
                  <span className="font-mono text-lg font-extrabold text-[#8C6D3B]">{timeLeft.seconds}</span>
                  <span className="text-[10px] text-stone-500 font-bold">{lang === 'km' ? 'វិនាទី' : 'Secs'}</span>
                </div>
              </div>
            </motion.div>

            {/* 5. Photo Gallery Showcase Grid (Video Frame 00:04 - 00:07 - កម្រងរូបថត) */}
            <div className="space-y-4 pt-2">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex flex-col items-center justify-center text-center gap-1 text-[#8C6D3B]"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h3 className="font-moul text-base tracking-wide">
                    {lang === 'km' ? '❀ កម្រងរូបថត' : '❀ Photo Gallery'}
                  </h3>
                </div>
                <p className="text-[11px] text-stone-500 font-medium">
                  {lang === 'km'
                    ? `រូបថតអបអរសាទរអាពាហ៍ពិពាហ៍ (${galleryPhotosList.length} រូប)`
                    : `Wedding Celebration Photos (${galleryPhotosList.length} Photos)`}
                </p>
              </motion.div>

              {/* Vertical Stack of All Uploaded Wedding Photos (up to 10 photos) */}
              <div className="space-y-4">
                {galleryPhotosList.map((photoUrl, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
                    className="relative rounded-3xl overflow-hidden shadow-lg border border-amber-200/80 bg-white group"
                  >
                    <img
                      src={photoUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'}
                      alt={`Gallery ${i + 1}`}
                      className="w-full h-[280px] sm:h-[340px] object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-8 text-white text-center flex items-center justify-between px-4">
                      <span className="text-[11px] font-bold text-amber-200 bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-amber-400/30">
                        {lang === 'km' ? `រូបថតទី ${i + 1} នៃ ${galleryPhotosList.length}` : `Photo ${i + 1} of ${galleryPhotosList.length}`}
                      </span>
                      <p className="text-xs font-semibold text-amber-100 tracking-wide drop-shadow">
                        {lang === 'km' ? `${data.groomNameKm} & ${data.brideNameKm}` : `${data.groomNameEn} & ${data.brideNameEn}`}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* 6. Location Map Card (Video Frame 00:08 - 00:09 - ទីតាំងកម្មវិធី) */}
            <motion.div
              id="location-section"
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="p-5 bg-[#FFFDF9] rounded-3xl border border-[#E8DFC2] shadow-sm space-y-4"
            >
              <div className="flex items-center justify-center gap-2 border-b border-amber-100 pb-3">
                <MapPin className="w-4 h-4 text-[#B8860B]" />
                <h3 className="font-moul text-base text-[#8C6D3B]">
                  {lang === 'km' ? '❀ ទីតាំងកម្មវិធី' : '❀ Event Location'}
                </h3>
              </div>

              {/* Venue Info */}
              <div className="text-center space-y-1 text-xs">
                <p className="font-bold text-stone-800">{lang === 'km' ? data.venueNameKm : data.venueNameEn}</p>
                <p className="text-stone-600">{lang === 'km' ? data.addressKm : data.addressEn}</p>
              </div>

              {/* Embedded Map Card */}
              <div className="relative w-full h-52 rounded-2xl overflow-hidden border border-amber-200 shadow-inner bg-stone-100">
                <iframe
                  title="Google Map Location"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src="https://maps.google.com/maps?q=Chroy+Changvar+Convention+Center+Phnom+Penh&t=&z=15&ie=UTF8&iwloc=&output=embed"
                />
              </div>

              <a
                href={data.googleMapUrl || 'https://maps.google.com/?q=Chroy+Changvar+Convention+Center'}
                target="_blank"
                rel="noreferrer"
                className={getActionButtonClass(currentTemplate.id)}
              >
                <MapPin className="w-4 h-4" />
                <span>{lang === 'km' ? '📍 ទទួលបានទិសដៅ (Open Map)' : '📍 Get Directions'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </motion.div>

            {/* 7. Traditional Program Schedule (Video Frame 00:09 - 00:10 - កម្មវិធីសិរីមង្គល) */}
            <motion.div
              id="schedule-section"
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="p-5 bg-[#FFFDF9] rounded-3xl border border-[#E8DFC2] shadow-sm space-y-6"
            >
              <div className="flex items-center justify-center gap-2 border-b border-amber-100 pb-3">
                <Clock className="w-4 h-4 text-[#B8860B]" />
                <h3 className="font-moul text-base text-[#8C6D3B]">
                  {lang === 'km' ? '❀ កម្មវិធីសិរីមង្គល' : '❀ Wedding Ceremony Schedule'}
                </h3>
              </div>

              {/* Vertical Timeline Nodes */}
              <div className="relative pl-6 border-l-2 border-amber-200 space-y-6">
                {(data.schedule || []).map((item, idx) => (
                  <div key={item.id || idx} className="relative group">
                    {/* Circle Node Icon */}
                    <div className="absolute -left-[35px] top-0 w-8 h-8 rounded-full bg-[#FAF7F2] border-2 border-[#B8860B] flex items-center justify-center text-[#8C6D3B] shadow-sm group-hover:bg-amber-100 transition-colors">
                      {idx % 4 === 0 ? (
                        <Sun className="w-3.5 h-3.5" />
                      ) : idx % 4 === 1 ? (
                        <Users className="w-3.5 h-3.5" />
                      ) : idx % 4 === 2 ? (
                        <Scissors className="w-3.5 h-3.5" />
                      ) : (
                        <Utensils className="w-3.5 h-3.5" />
                      )}
                    </div>

                    {/* Time & Title */}
                    <div className="space-y-1">
                      <span className="font-bold text-xs text-[#B8860B] tracking-wide">
                        {item.time}
                      </span>
                      <h4 className="font-bold text-xs text-stone-800 leading-snug">
                        {lang === 'km' ? item.titleKm : item.titleEn}
                      </h4>
                      {(item.descriptionKm || item.descriptionEn) && (
                        <p className="text-[11px] text-stone-500 leading-normal">
                          {lang === 'km' ? item.descriptionKm : item.descriptionEn}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 8. Thank You Note & Apology (Video Frame 00:10 - 00:11) */}
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="p-6 bg-[#FFFDF9] rounded-3xl border border-[#E8DFC2] shadow-sm text-center space-y-4"
            >
              <h3 className="font-moul text-base text-[#8C6D3B] leading-relaxed">
                {lang === 'km' ? 'សេចក្តីថ្លែងអំណរគុណ និងសូមអភ័យទោស' : 'Gratitude & Acknowledgements'}
              </h3>

              <p className="text-xs text-stone-700 leading-relaxed text-justify px-1 font-medium">
                {lang === 'km' ? data.welcomeMessageKm : data.welcomeMessageEn}
              </p>
            </motion.div>

            {/* 9. Color Theme Palette Circles (Video Frame 00:11 - 00:12 - ពណ៌នៃកម្មវិធីមង្គលការ) */}
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="p-5 bg-[#FFFDF9] rounded-3xl border border-[#E8DFC2] shadow-sm text-center space-y-3"
            >
              <h4 className="font-moul text-sm text-[#8C6D3B]">
                {lang === 'km' ? 'ពណ៌នៃកម្មវិធីមង្គលការ' : 'Wedding Dress Code Color Theme'}
              </h4>

              {/* Theme Circles */}
              <div className="flex items-center justify-center gap-3 pt-1 flex-wrap">
                {(data.themeColors && data.themeColors.length > 0
                  ? data.themeColors
                  : ['#A0522D', '#C59B27', '#FFD700', '#9370DB', '#DC143C']
                ).map((colorHex, idx) => (
                  <div
                    key={idx}
                    className="w-9 h-9 rounded-full shadow-md ring-2 ring-white border border-stone-200 transition-transform hover:scale-110 flex items-center justify-center"
                    style={{ backgroundColor: colorHex }}
                    title={colorHex}
                  >
                    <div className="w-2 h-2 rounded-full bg-white/30" />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 10. Guest Wishes & RSVP Section */}
            <motion.div
              id="guestbook-section"
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="p-5 bg-[#FFFDF9] rounded-3xl border border-[#E8DFC2] shadow-sm space-y-4"
            >
              <div className="text-center space-y-1">
                <h3 className="font-moul text-sm text-[#8C6D3B]">
                  {lang === 'km' ? 'ផ្ញើសារជូនពរ & បញ្ជាក់ការចូលរួម' : 'Guestbook & RSVP'}
                </h3>
                <p className="text-[11px] text-stone-500">
                  {lang === 'km' ? 'សូមផ្ញើសារជូនពរល្អៗដល់គូស្វាមីភរិយាថ្មី' : 'Send your warmest wishes to the newlyweds'}
                </p>
              </div>

              {/* Wish Form */}
              <form onSubmit={handleAddWish} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    {lang === 'km' ? 'ឈ្មោះរបស់អ្នក *' : 'Your Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder={lang === 'km' ? 'ឧទាហរណ៍៖ សុខ ចាន់ថា' : 'e.g., John Doe'}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#B8860B]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    {lang === 'km' ? 'សារជូនពរ' : 'Wishes Message'}
                  </label>
                  <textarea
                    rows={2}
                    value={guestMessage}
                    onChange={(e) => setGuestMessage(e.target.value)}
                    placeholder={
                      lang === 'km'
                        ? 'សូមជូនពរឱ្យមានសុភមង្គល និងស្រឡាញ់គ្នារហូត...'
                        : 'Wishing you eternal joy & bliss...'
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#B8860B]"
                  />
                </div>

                <button
                  type="submit"
                  className={getActionButtonClass(currentTemplate.id)}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{lang === 'km' ? 'ផ្ញើសារជូនពរ' : 'Submit Wish & RSVP'}</span>
                </button>
              </form>

              {/* Wishes Feed */}
              {wishes.length > 0 && (
                <div className="pt-3 border-t border-amber-100 space-y-2 max-h-52 overflow-y-auto no-scrollbar">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-[10px] font-bold text-stone-500">
                      {lang === 'km' ? `សារជូនពរសរុប: ${wishes.length}` : `Total Wishes: ${wishes.length}`}
                    </span>
                    <button
                      type="button"
                      onClick={handleClearAllWishes}
                      className="text-[10px] text-red-600 hover:text-red-800 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{lang === 'km' ? 'លុបទាំងអស់' : 'Clear All'}</span>
                    </button>
                  </div>
                  {wishes.map((w) => (
                    <div key={w.id} className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-100 text-xs space-y-1 relative group">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#8C6D3B]">{w.guestName}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteWish(w.id)}
                          className="p-1 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title={lang === 'km' ? 'លុបសារនេះ' : 'Delete Wish'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-stone-700 italic pr-4">"{w.message}"</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* 11. Re-statement Couple Names & Footer (Video Frame 00:12 - 00:13) */}
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center pt-4 pb-6 space-y-2 border-t border-amber-200"
            >
              <h2 className="font-moul text-xl text-[#2C2117]">
                {lang === 'km' ? `${data.groomNameKm} និង ${data.brideNameKm}` : `${data.groomNameEn} & ${data.brideNameEn}`}
              </h2>
              <p className="text-xs text-stone-600 font-semibold">
                {lang === 'km' ? data.lunarDateKm : data.weddingDateIso}
              </p>
              <p className="text-[10px] text-stone-400 font-medium pt-2">
                Made with ❤️ by <span className="font-bold text-[#8C6D3B]">WedGo / MongkulKar</span>
                <br />
                DIGITAL WEDDING INVITATIONS
              </p>
            </motion.div>
          </div>
        )
      )}

        {/* ================= MODAL DIALOGS ================= */}
        {/* ABA QR CODE CASH BLESSING MODAL */}
        {activeModal === 'gift' && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 text-center space-y-4 shadow-2xl border border-amber-200">
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <span className="text-xs font-bold text-[#B8860B] uppercase tracking-widest">
                  {lang === 'km' ? 'ប្រអប់ចំណងដៃ' : 'Cash Blessing'}
                </span>
                <h3 className="font-moul text-base text-stone-800">
                  {data.bankBlessing?.bankName || 'ABA Bank'}
                </h3>
              </div>

              {/* QR Image */}
              <div className="w-48 h-48 mx-auto p-2 bg-white rounded-2xl border-2 border-amber-300 shadow-md flex items-center justify-center">
                <img
                  src={(data.bankBlessing?.qrCodeUrl && data.bankBlessing.qrCodeUrl.trim() !== '') ? data.bankBlessing.qrCodeUrl : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80'}
                  alt="ABA QR Code"
                  className="w-full h-full object-contain rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-1 p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs">
                <p className="text-[11px] text-stone-500">{lang === 'km' ? 'ឈ្មោះគណនី:' : 'Account Name:'}</p>
                <p className="font-bold text-stone-800 text-sm">{data.bankBlessing?.accountName || 'N/A'}</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="font-mono font-bold text-[#8C6D3B]">{data.bankBlessing?.accountNumber || 'N/A'}</span>
                  <button
                    onClick={handleCopyAccount}
                    className="px-2 py-1 rounded bg-amber-200 text-amber-900 text-[10px] font-bold flex items-center gap-1 hover:bg-amber-300"
                  >
                    {copiedAccount ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedAccount ? (lang === 'km' ? 'បានចម្លង!' : 'Copied!') : (lang === 'km' ? 'ចម្លង' : 'Copy')}</span>
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-stone-400">
                {lang === 'km' ? 'សូមអរគុណទឹកចិត្តដ៏ថ្លៃថ្លារបស់លោកអ្នក!' : 'Thank you for your generous gift & support!'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
