import React from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Gift,
  Send,
  Trash2,
  Copy,
  Check,
  CalendarPlus,
  ChevronRight,
} from 'lucide-react';
import { WeddingInvitationData, GuestWish, Language } from '../types';
import { VintageVinylPlayer } from './VintageVinylPlayer';

interface ChateauBlueProps {
  data: WeddingInvitationData;
  lang: Language;
  setLang: (lang: Language) => void;
  isPlaying: boolean;
  toggleMusic: () => void;
  timeLeft: { days: number; hours: number; minutes: number; seconds: number };
  galleryPhotosList: string[];
  activeModal: 'gift' | 'schedule' | 'location' | null;
  setActiveModal: (m: 'gift' | 'schedule' | 'location' | null) => void;
  setIsPhotoLightboxOpen: (open: boolean) => void;
  setActivePhotoIdx: (idx: number) => void;
  wishes: GuestWish[];
  guestName: string;
  setGuestName: (v: string) => void;
  guestMessage: string;
  setGuestMessage: (v: string) => void;
  attendance: 'attending' | 'regret' | 'maybe';
  setAttendance: (a: 'attending' | 'regret' | 'maybe') => void;
  guestCount: number;
  setGuestCount: (c: number) => void;
  handleAddWish: (e: React.FormEvent) => void;
  handleDeleteWish: (id: string) => void;
  copiedAccount: boolean;
  handleCopyAccount: () => void;
  scrollToSection: (id: string) => void;
}

export const ChateauBlueInvitationView: React.FC<ChateauBlueProps> = ({
  data,
  lang,
  setLang,
  isPlaying,
  toggleMusic,
  timeLeft,
  galleryPhotosList,
  setActiveModal,
  setIsPhotoLightboxOpen,
  setActivePhotoIdx,
  wishes,
  guestName,
  setGuestName,
  guestMessage,
  setGuestMessage,
  attendance,
  setAttendance,
  guestCount,
  setGuestCount,
  handleAddWish,
  handleDeleteWish,
  copiedAccount,
  handleCopyAccount,
  scrollToSection,
}) => {
  // Calendar calculation
  const dateObj = new Date(data.weddingDateIso || '2026-10-10');
  const year = dateObj.getFullYear() || 2026;
  const monthIdx = dateObj.getMonth(); // 0 - 11
  const targetDay = dateObj.getDate() || 10;

  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthNamesKm = [
    'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
    'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
  ];
  const monthName = monthNamesEn[monthIdx] || 'October';
  const monthNameKm = monthNamesKm[monthIdx] || 'តុលា';

  // First day of month (0 = Sun, 1 = Mon...)
  const firstDayOfMonth = new Date(year, monthIdx, 1).getDay();
  // Adjust so Mon = 0, Sun = 6
  const startDayOffset = (firstDayOfMonth + 6) % 7;
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

  const calendarCells = [];
  for (let i = 0; i < startDayOffset; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  // Fallback schedule items if data.schedule is empty
  const scheduleItems = (data.schedule && data.schedule.length > 0)
    ? data.schedule
    : [
        {
          id: 's1',
          time: '07:00 AM',
          titleKm: 'ពិធីជួបជុំញាតិមិត្ត និងហែជំនូន (ក្បួនហែជំនូន)',
          titleEn: 'Groom Procession & Proposal Ceremony',
          descriptionKm: 'ជួបជុំភ្ញៀវកិត្តិយស ហែក្បួនជំនូនចូលគេហដ្ឋានកូនស្រី',
          descriptionEn: 'Procession arrives at the bride’s house with traditional gifts',
        },
        {
          id: 's2',
          time: '08:30 AM',
          titleKm: 'ពិធីកាត់សក់បង្កក់សិរី',
          titleEn: 'Traditional Hair Cutting Ceremony',
          descriptionKm: 'ពិសិដ្ឋកាត់សក់ដើម្បីជម្រះឧបទ្រពចង្រៃ និងប្រសិទ្ធពរជ័យ',
          descriptionEn: 'Symbolic cleansing and blessing by parents and honored guests',
        },
        {
          id: 's3',
          time: '10:00 AM',
          titleKm: 'ពិធីសែនព្រេន និងបង្វិលពពិល',
          titleEn: 'Ancestor Ceremony & Sacred Ringing',
          descriptionKm: 'សែនដូនតា និងចងដៃប្រសិទ្ធពរជ័យសិរីមង្គល',
          descriptionEn: 'Honoring ancestors and sacred candle circle blessing',
        },
        {
          id: 's4',
          time: '05:00 PM',
          titleKm: 'ពិធីលៀងសាយភោជន៍ អាហារពេលល្ងាច',
          titleEn: 'Wedding Banquet & Grand Reception',
          descriptionKm: 'ទទួលទានអាហារ រាំកម្សាន្ត និងថតរូបអនុស្សាវរីយ៍',
          descriptionEn: 'Grand dinner reception, music, toasts, and photo session',
        },
      ];

  // Google Calendar Link
  const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    `Wedding of ${data.groomNameEn || data.groomNameKm} & ${data.brideNameEn || data.brideNameKm}`
  )}&dates=${data.weddingDateIso.replace(/-/g, '')}T100000Z/${data.weddingDateIso.replace(/-/g, '')}T160000Z&details=${encodeURIComponent(
    `Celebrate the wedding of ${data.groomNameEn || data.groomNameKm} and ${data.brideNameEn || data.brideNameKm}`
  )}&location=${encodeURIComponent(data.venueNameEn || data.venueNameKm || data.addressEn)}`;

  return (
    <div className={`relative w-full flex-1 flex flex-col space-y-12 p-3 sm:p-5 pb-24 text-[#0F172A] bg-white animate-fadeIn overflow-hidden ${lang === 'km' ? 'font-kantumruy' : 'font-serif'}`}>
      
      {/* Dynamic Floating Scroll Background Motion Petals & Sparkles */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{ y: [0, 400, 800], x: [0, 20, -20], opacity: [0.3, 0.6, 0.2] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute top-10 left-4 text-blue-300/40 text-lg"
        >
          ❀
        </motion.div>
        <motion.div
          animate={{ y: [0, 600, 1000], x: [0, -30, 15], opacity: [0.2, 0.5, 0.1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear', delay: 2 }}
          className="absolute top-20 right-6 text-amber-300/40 text-base"
        >
          ✨
        </motion.div>
        <motion.div
          animate={{ y: [0, 500, 900], x: [0, 25, -15], opacity: [0.4, 0.7, 0.2] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'linear', delay: 5 }}
          className="absolute top-1/3 left-1/2 text-blue-200/50 text-sm"
        >
          🍃
        </motion.div>
      </div>

      {/* Sticky Controls Bar */}
      <div className="sticky top-0 z-40 w-full px-3 py-2 bg-white/90 backdrop-blur-md border-b border-blue-100 flex items-center justify-between text-xs rounded-b-2xl shadow-xs">
        <div className="inline-flex items-center gap-1 p-0.5 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700">
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`px-2.5 py-0.5 rounded-full transition-all ${
              lang === 'en' ? 'bg-[#1E3A8A] text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLang('km')}
            className={`px-2.5 py-0.5 rounded-full transition-all ${
              lang === 'km' ? 'bg-[#1E3A8A] text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            ខ្មែរ
          </button>
        </div>

        <VintageVinylPlayer
          isPlaying={isPlaying}
          onToggle={toggleMusic}
          lang={lang}
          variant="compact"
        />
      </div>

      {/* 1. HEADER SECTION: TITLE, NAMES & CHÂTEAU WATERCOLOR ESTATE */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.15 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="text-center space-y-4 pt-2 relative z-10"
      >
        <div className="flex items-center justify-center gap-2 py-1">
          <span className="text-amber-500 text-xs sm:text-sm filter drop-shadow">⚜️</span>
          <span
            className={`tracking-wider ${
              lang === 'km'
                ? 'font-moul text-base sm:text-lg text-[#B8860B] drop-shadow-xs leading-relaxed'
                : 'font-serif text-xs tracking-[0.25em] text-slate-600 uppercase font-bold'
            }`}
          >
            {lang === 'km' ? 'សិរីមង្គលអាពាហ៍ពិពាហ៍' : 'HOLY MATRIMONY'}
          </span>
          <span className="text-amber-500 text-xs sm:text-sm filter drop-shadow">⚜️</span>
        </div>

        <div className="space-y-1">
          <h1 className={`tracking-widest text-[#1E3A8A] ${lang === 'km' ? 'font-moul text-2xl sm:text-3xl leading-relaxed' : 'font-serif text-3xl sm:text-4xl font-normal uppercase'}`}>
            {lang === 'km' ? (data.groomNameKm || data.groomNameEn) : (data.groomNameEn || 'WILLIAM')}
          </h1>
          <p className="text-xs italic text-slate-400">{lang === 'km' ? 'និង' : '&'}</p>
          <h1 className={`tracking-widest text-[#1E3A8A] ${lang === 'km' ? 'font-moul text-2xl sm:text-3xl leading-relaxed' : 'font-serif text-3xl sm:text-4xl font-normal uppercase'}`}>
            {lang === 'km' ? (data.brideNameKm || data.brideNameEn) : (data.brideNameEn || 'CHARLOTTE')}
          </h1>
        </div>

        {/* Watercolor Painting Image Frame */}
        <div className="relative w-full rounded-2xl overflow-hidden shadow-xl border border-blue-100 mt-4 group">
          <img
            src={
              data.coverPhotoUrl && !data.coverPhotoUrl.includes('unsplash.com/photo-1519741497674')
                ? data.coverPhotoUrl
                : galleryPhotosList[0] || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80'
            }
            alt="Château Estate"
            className="w-full h-[280px] sm:h-[340px] object-cover transition-transform duration-1000 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        </div>
      </motion.section>

      {/* 2. CEREMONY INFO SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.15 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="text-center space-y-6 pt-4 border-t border-slate-100 relative z-10"
      >
        {/* Blue Floral Divider Graphic */}
        <div className="flex items-center justify-center gap-2 text-blue-300 text-sm">
          <span>🍃</span>
          <span className="text-lg animate-pulse">❀</span>
          <span>🍃</span>
        </div>

        <h2 className={`uppercase font-bold ${lang === 'km' ? 'font-moul text-sm text-[#B8860B]' : 'text-xs tracking-[0.25em] text-slate-500'}`}>
          {lang === 'km' ? '― ព័ត៌មានពិធីសិរីមង្គល ―' : '― CEREMONY INFO ―'}
        </h2>

        {/* Parents Two Column Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs max-w-sm mx-auto pt-2">
          <div className="space-y-1 text-slate-700">
            <p className="text-[10px] text-slate-400 italic">
              {lang === 'km' ? 'លោកឪពុក លោកស្រី (ខាងប្រុស)' : 'Mr. & Mrs. (Groom)'}
            </p>
            <p className="font-semibold text-[#1E293B]">
              {data.parents?.groomFather || (lang === 'km' ? 'លោក លី ស៊ី' : 'Mr. Ly Si')}
            </p>
            <p className="font-semibold text-[#1E293B]">
              {data.parents?.groomMother || (lang === 'km' ? 'លោកស្រី ញ៉ិច កែវរតនា' : 'Mrs. Nhek Keo Rotana')}
            </p>
          </div>

          <div className="space-y-1 text-slate-700 border-l border-slate-100 pl-3">
            <p className="text-[10px] text-slate-400 italic">
              {lang === 'km' ? 'លោកឪពុក លោកស្រី (ខាងស្រី)' : 'Mr. & Mrs. (Bride)'}
            </p>
            <p className="font-semibold text-[#1E293B]">
              {data.parents?.brideFather || (lang === 'km' ? 'លោក យី សុផល' : 'Mr. Yi Sophal')}
            </p>
            <p className="font-semibold text-[#1E293B]">
              {data.parents?.brideMother || (lang === 'km' ? 'លោកស្រី ជិន សុផា' : 'Mrs. Chin Sopha')}
            </p>
          </div>
        </div>

        {/* Marriage Announcement */}
        <div className="space-y-3 pt-2">
          <p className="text-[11px] italic text-slate-500 leading-relaxed px-2">
            {lang === 'km'
              ? 'យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ ឯកឧត្តម លោកឧកញ៉ា លោក លោកស្រី អ្នកនាងកញ្ញា ចូលរួមជាអធិបតី និងជាភ្ញៀវកិត្តិយស ក្នុងពិធីរៀបអាពាហ៍ពិពាហ៍'
              : 'With joy, we announce the marriage of'}
          </p>

          <div className="space-y-1">
            <h3 className={`text-xl font-bold text-[#1E3A8A] tracking-wider ${lang === 'km' ? 'font-moul text-lg' : ''}`}>
              {lang === 'km' ? (data.groomNameKm || data.groomNameEn) : (data.groomNameEn || 'William Beaumont')}
            </h3>
            <p className="text-xs text-slate-400">{lang === 'km' ? 'និង' : '&'}</p>
            <h3 className={`text-xl font-bold text-[#1E3A8A] tracking-wider ${lang === 'km' ? 'font-moul text-lg' : ''}`}>
              {lang === 'km' ? (data.brideNameKm || data.brideNameEn) : (data.brideNameEn || 'Charlotte Devereux')}
            </h3>
          </div>

          <div className="pt-3 space-y-1">
            <p className={`text-xs font-semibold text-slate-800 ${lang === 'km' ? 'font-moul text-amber-800' : ''}`}>
              {lang === 'km' ? 'ពិធីសិរីសួស្តីអាពាហ៍ពិពាហ៍' : 'Wedding Ceremony'}
            </p>
            <p className="text-[11px] text-slate-600 font-medium">
              {lang === 'km' ? (data.venueNameKm || data.venueNameEn) : (data.venueNameEn || 'Schloss Elmau')}
            </p>
            <p className="text-[10px] tracking-widest text-[#1E3A8A] uppercase pt-1 font-bold">
              {lang === 'km' ? 'វេលាម៉ោង' : 'TIME'}
            </p>
            <p className="text-lg font-bold text-slate-800">
              {lang === 'km' ? (data.weddingTimeKm || data.weddingTimeEn) : (data.weddingTimeEn || '16:30')}
            </p>
            {lang === 'km' && data.lunarDateKm && (
              <p className="text-xs text-[#1E3A8A] font-semibold pt-1">
                {data.lunarDateKm}
              </p>
            )}
          </div>

          {/* Date Block */}
          <div className="flex items-center justify-center gap-4 text-xs tracking-widest text-slate-700 pt-2 border-y border-slate-100 py-3 max-w-xs mx-auto font-semibold">
            <span>{lang === 'km' ? 'ថ្ងៃរៀបការ' : 'WEDDING DAY'}</span>
            <span className="text-lg font-bold text-[#1E3A8A]">{targetDay}</span>
            <span>{lang === 'km' ? monthNameKm : monthName.toUpperCase()}</span>
          </div>

          <p className="text-xs tracking-widest text-slate-400 font-semibold">{year}</p>
        </div>
      </motion.section>

      {/* 3. OUR STORY / BENTO PHOTO GALLERY */}
      <motion.section
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.15 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="space-y-4 pt-4 border-t border-slate-100 relative z-10"
      >
        <h2 className={`text-center uppercase font-bold ${lang === 'km' ? 'font-moul text-sm text-[#B8860B]' : 'text-xs tracking-[0.25em] text-slate-500'}`}>
          {lang === 'km' ? '― រូបថតអនុស្សាវរីយ៍ ―' : '― OUR STORY ―'}
        </h2>

        <div className="grid grid-cols-2 gap-2 pt-2">
          {/* Left Tall Portrait Photo */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              setActivePhotoIdx(0);
              setIsPhotoLightboxOpen(true);
            }}
            className="relative row-span-2 rounded-2xl overflow-hidden shadow-md cursor-pointer group"
          >
            <img
              src={galleryPhotosList[0] || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80'}
              alt="Story 1"
              className="w-full h-full min-h-[220px] object-cover transition-transform duration-500 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          {/* Top Right Photo */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              setActivePhotoIdx(1);
              setIsPhotoLightboxOpen(true);
            }}
            className="relative rounded-2xl overflow-hidden shadow-md h-28 cursor-pointer group"
          >
            <img
              src={galleryPhotosList[1] || 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80'}
              alt="Story 2"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          {/* Middle Right Photo */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              setActivePhotoIdx(2);
              setIsPhotoLightboxOpen(true);
            }}
            className="relative rounded-2xl overflow-hidden shadow-md h-28 cursor-pointer group"
          >
            <img
              src={galleryPhotosList[2] || 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80'}
              alt="Story 3"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          {/* Bottom Left Photo */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              setActivePhotoIdx(3 % galleryPhotosList.length);
              setIsPhotoLightboxOpen(true);
            }}
            className="relative rounded-2xl overflow-hidden shadow-md h-28 cursor-pointer group"
          >
            <img
              src={galleryPhotosList[3] || 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=80'}
              alt="Story 4"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          {/* Bottom Right Photo with Lightbox Overlay */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              setActivePhotoIdx(0);
              setIsPhotoLightboxOpen(true);
            }}
            className="relative rounded-2xl overflow-hidden shadow-md h-28 cursor-pointer group"
          >
            <img
              src={galleryPhotosList[4] || galleryPhotosList[0]}
              alt="Story 5"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white font-bold text-sm tracking-wide group-hover:bg-slate-900/40 transition-colors">
              + {galleryPhotosList.length}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* 4. RECEPTION INFO SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.15 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="text-center space-y-6 pt-4 border-t border-slate-100 relative z-10"
      >
        {/* Blue Crest Icon */}
        <div className="text-blue-400 text-xl">❀</div>

        <h2 className={`uppercase font-bold ${lang === 'km' ? 'font-moul text-sm text-[#B8860B]' : 'text-xs tracking-[0.25em] text-slate-500'}`}>
          {lang === 'km' ? '― ពិធីលៀងសាយភោជន៍ ―' : '― RECEPTION INFO ―'}
        </h2>

        <p className="text-[11px] tracking-widest text-slate-600 uppercase font-semibold px-2">
          {lang === 'km'
            ? 'សូមគោរពអញ្ជើញ ពិសាអាហារ និងរាំកម្សាន្តនៅវេលាម៉ោង'
            : 'WE INVITE YOU TO CELEBRATE WITH US AT:'}
        </p>

        <p className="text-xl font-bold text-slate-800">
          {lang === 'km' ? (data.weddingTimeKm || 'ម៉ោង ៥:០០ នាទីល្ងាច') : (data.weddingTimeEn || '18:30')}
        </p>

        {/* Date Display */}
        <div className="flex items-center justify-center gap-4 text-xs tracking-widest text-slate-700 border-y border-slate-100 py-3 max-w-xs mx-auto font-semibold">
          <span>{lang === 'km' ? 'ថ្ងៃរៀបការ' : 'WEDDING DAY'}</span>
          <span className="text-lg font-bold text-[#1E3A8A]">{targetDay}</span>
          <span>{lang === 'km' ? monthNameKm : monthName.toUpperCase()}</span>
        </div>

        <p className="text-xs tracking-widest text-slate-400 font-semibold">{year}</p>

        {/* Time schedule bullet */}
        <div className="flex items-center justify-center gap-6 text-[11px] text-slate-600">
          <div>
            <span className="block text-[9px] text-slate-400 uppercase font-bold">
              {lang === 'km' ? 'ទទួលភ្ញៀវ' : 'GUESTS ARRIVE'}
            </span>
            <span className="font-bold">17:00 / 18:00</span>
          </div>
          <div className="h-6 w-[1px] bg-slate-200" />
          <div>
            <span className="block text-[9px] text-slate-400 uppercase font-bold">
              {lang === 'km' ? 'ពិសាអាហារ' : 'RECEPTION BEGINS'}
            </span>
            <span className="font-bold">17:30 / 18:30</span>
          </div>
        </div>

        {/* COUNTING DOWN */}
        <div className="pt-2 space-y-1">
          <p className="text-[10px] tracking-widest text-slate-400 uppercase font-bold">
            {lang === 'km' ? 'រាប់ថយក្រោយ' : 'COUNTING DOWN'}
          </p>
          <p className="text-xs text-slate-700 tracking-wide font-semibold">
            {lang === 'km'
              ? `${timeLeft.days} ថ្ងៃ ${timeLeft.hours} ម៉ោង ${timeLeft.minutes} នាទី ${timeLeft.seconds} វិនាទី`
              : `${timeLeft.days} days ${timeLeft.hours} hours ${timeLeft.minutes} min ${timeLeft.seconds} sec`}
          </p>
        </div>

        {/* CALENDAR BOX */}
        <div className="p-4 bg-slate-50/80 rounded-2xl border border-blue-100/80 max-w-xs mx-auto text-center space-y-3 shadow-xs">
          <p className="text-xs text-[#1E3A8A] font-bold">
            {lang === 'km' ? `ខែ${monthNameKm} ឆ្នាំ${year}` : `${monthName} ${year}`}
          </p>

          {/* Calendar Table */}
          <div className="grid grid-cols-7 gap-1 text-[10px] text-slate-500 pt-1">
            {(lang === 'km'
              ? ['ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហ', 'សុក្រ', 'សៅរ៍', 'អាទិត្យ']
              : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
            ).map((dayStr) => (
              <div key={dayStr} className="font-bold text-slate-400 py-1 text-[9px]">
                {dayStr}
              </div>
            ))}

            {calendarCells.map((cell, idx) => (
              <div
                key={idx}
                className={`h-7 flex items-center justify-center rounded-lg ${
                  cell === targetDay
                    ? 'bg-[#1E3A8A] text-white font-bold shadow-xs'
                    : cell
                    ? 'text-slate-700 hover:bg-slate-200/50'
                    : ''
                }`}
              >
                {cell === targetDay ? (
                  <span className="inline-flex items-center justify-center gap-0.5">
                    {cell} <span className="text-[9px]">💙</span>
                  </span>
                ) : (
                  cell
                )}
              </div>
            ))}
          </div>

          {/* Add to Calendar Link */}
          <a
            href={googleCalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] text-[#1E3A8A] font-semibold hover:underline pt-1"
          >
            <CalendarPlus className="w-3.5 h-3.5 text-[#1E3A8A]" />
            <span>{lang === 'km' ? 'បន្ថែមក្នុងកាលវិភាគ Calendar' : 'Add to Calendar'}</span>
          </a>
        </div>

        {/* RSVP Pill Button */}
        <div>
          <button
            type="button"
            onClick={() => scrollToSection('guestwishes-chateau')}
            className="px-8 py-2.5 rounded-full bg-[#1E3A8A] text-white text-xs font-bold tracking-wider shadow-md hover:bg-[#1E293B] active:scale-95 transition-all cursor-pointer"
          >
            {lang === 'km' ? 'ឆ្លើយតបការអញ្ជើញ (RSVP)' : 'RSVP'}
          </button>
        </div>
      </motion.section>

      {/* 5. RECEPTION VENUE SECTION */}
      <motion.section
        id="location-chateau"
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.15 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="text-center space-y-4 pt-4 border-t border-slate-100 relative z-10"
      >
        {/* Dynamic Venue / Hall Photo (Fully replaceble from uploaded user photos or location photo) */}
        <div className="relative w-full max-w-xs mx-auto rounded-2xl overflow-hidden shadow-lg border border-blue-100 group">
          <img
            src={
              data.locationPhotoUrl ||
              galleryPhotosList[3] ||
              galleryPhotosList[2] ||
              galleryPhotosList[0] ||
              data.couplePhotoUrl ||
              data.coverPhotoUrl ||
              'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=80'
            }
            alt="Venue Table Setting"
            className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        </div>

        <h2 className={`uppercase font-bold ${lang === 'km' ? 'font-moul text-sm text-[#B8860B]' : 'text-xs tracking-[0.25em] text-slate-500'}`}>
          {lang === 'km' ? '― ទីតាំងប្រារព្ធពិធី ―' : '― RECEPTION VENUE ―'}
        </h2>

        <div className="space-y-1 max-w-xs mx-auto text-xs text-slate-700">
          <p className={`font-bold text-[#1E293B] ${lang === 'km' ? 'font-moul text-sm' : ''}`}>
            {lang === 'km' ? (data.venueNameKm || data.venueNameEn) : (data.venueNameEn || 'Schloss Elmau')}
          </p>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            {lang === 'km' ? (data.addressKm || data.addressEn) : (data.addressEn || 'In Elmau 2, 82493 Krün, Bavaria, Germany')}
          </p>
        </div>

        {/* Embedded Google Map */}
        <div className="relative w-full h-52 rounded-2xl overflow-hidden shadow-md border border-slate-200">
          <iframe
            title="Venue Location Map"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={`https://maps.google.com/maps?q=${encodeURIComponent(
              data.addressKm || data.addressEn || data.venueNameKm || data.venueNameEn || 'Phnom Penh'
            )}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
          />
        </div>
      </motion.section>

      {/* 6. WEDDING DAY SCHEDULE SECTION (FULLY DYNAMIC & KHMER SUPPORTED) */}
      <motion.section
        id="schedule-chateau"
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.15 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="space-y-4 pt-4 border-t border-slate-100 relative z-10"
      >
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-blue-800">
            <Clock className="w-4 h-4" />
            <h2 className={`uppercase font-bold ${lang === 'km' ? 'font-moul text-sm text-[#B8860B]' : 'text-xs tracking-[0.2em] text-[#1E3A8A]'}`}>
              {lang === 'km' ? '― កម្មវិធីសិរីមង្គល (កាលវិភាគ) ―' : '― WEDDING DAY SCHEDULE ―'}
            </h2>
          </div>
          <p className="text-[11px] text-slate-500">
            {lang === 'km' ? 'កាលវិភាគប្រារព្ធពិធីអាពាហ៍ពិពាហ៍តាមលំដាប់' : 'Chronological schedule of ceremonies & banquet'}
          </p>
        </div>

        {/* Dynamic Timeline Schedule List */}
        <div className="space-y-3 pt-2 max-w-sm mx-auto">
          {scheduleItems.map((item, idx) => (
            <motion.div
              key={item.id || idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-3.5 bg-slate-50/90 rounded-2xl border border-blue-100/90 shadow-2xs hover:border-blue-300 transition-all flex items-start gap-3"
            >
              {/* Time Badge */}
              <div className="shrink-0 px-2.5 py-1 rounded-xl bg-[#1E3A8A] text-white text-[10px] font-bold tracking-wide shadow-xs text-center min-w-[70px]">
                {item.time}
              </div>

              {/* Title & Description */}
              <div className="space-y-0.5 text-xs flex-1">
                <h4 className={`font-bold text-[#0F172A] leading-snug ${lang === 'km' ? 'text-xs text-blue-950 font-bold' : 'font-semibold'}`}>
                  {lang === 'km' ? (item.titleKm || item.titleEn) : (item.titleEn || item.titleKm)}
                </h4>
                {(item.descriptionKm || item.descriptionEn) && (
                  <p className="text-[11px] text-slate-500 leading-normal">
                    {lang === 'km' ? (item.descriptionKm || item.descriptionEn) : (item.descriptionEn || item.descriptionKm)}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 7. GUEST WISHES / RSVP SECTION */}
      <motion.section
        id="guestwishes-chateau"
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.15 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="space-y-6 pt-4 border-t border-slate-100 relative z-10"
      >
        <h2 className={`text-center uppercase font-bold ${lang === 'km' ? 'font-moul text-sm text-[#B8860B]' : 'text-xs tracking-[0.25em] text-slate-500'}`}>
          {lang === 'km' ? '― សៀវភៅចំណងដៃ និងពរជ័យ ―' : '― GUEST WISHES ―'}
        </h2>

        {/* Wish Form */}
        <form onSubmit={handleAddWish} className="p-4 bg-slate-50 rounded-2xl border border-blue-100 space-y-3">
          <div>
            <label className="block text-[10px] text-slate-500 uppercase mb-1 font-bold">
              {lang === 'km' ? 'ឈ្មោះរបស់អ្នក*' : 'Your name*'}
            </label>
            <input
              type="text"
              required
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:border-[#1E3A8A]"
              placeholder={lang === 'km' ? 'ឧ. គ្រួសារ លី' : 'e.g. The Bennett Family'}
            />
          </div>

          <div>
            <label className="block text-[10px] text-slate-500 uppercase mb-1 font-bold">
              {lang === 'km' ? 'សារពរជ័យសម្រាប់គូស្វាមីភរិយា*' : 'Your wish for the couple*'}
            </label>
            <textarea
              required
              rows={2}
              value={guestMessage}
              onChange={(e) => setGuestMessage(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:border-[#1E3A8A]"
              placeholder={lang === 'km' ? 'សូមជូនពរអ្នកទាំងពីរទទួលបានសុភមង្គលជារៀងរហូត!' : 'Wishing you lifetime of love and laughter!'}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAttendance('attending')}
                className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                  attendance === 'attending'
                    ? 'bg-[#1E3A8A] text-white'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                {lang === 'km' ? 'ចូលរួម' : 'Attending'}
              </button>
              <button
                type="button"
                onClick={() => setAttendance('regret')}
                className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                  attendance === 'regret'
                    ? 'bg-rose-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                {lang === 'km' ? 'មិនបានចូលរួម' : 'Regret'}
              </button>
            </div>

            <button
              type="submit"
              className="px-5 py-1.5 rounded-full bg-[#1E3A8A] text-white text-xs font-bold shadow-xs hover:bg-[#1E293B] cursor-pointer"
            >
              {lang === 'km' ? 'ផ្ញើសារពរជ័យ' : 'Send Wish'}
            </button>
          </div>
        </form>

        {/* Wishes List */}
        <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar pr-1">
          {wishes.map((w) => (
            <div key={w.id} className="p-3 bg-white rounded-xl border border-slate-100 shadow-2xs text-xs space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-bold text-slate-800">{w.guestName}</span>
                <span>{new Date(w.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-slate-600 leading-relaxed italic">{w.message}</p>
            </div>
          ))}
        </div>

        {/* Cash Gift Bank Modal Button */}
        {data.bankBlessing?.accountNumber && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setActiveModal('gift')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-100 text-[#1E3A8A] text-xs font-bold border border-slate-200 shadow-2xs hover:bg-slate-200 cursor-pointer"
            >
              <Gift className="w-4 h-4 text-[#1E3A8A]" />
              <span>{lang === 'km' ? 'ប្រអប់ចំណងដៃ (Cash Blessing)' : 'Send Gift Blessing'}</span>
            </button>
          </div>
        )}

        {/* Footer Birds Artwork */}
        <div className="pt-6 text-center text-slate-300 text-xs flex justify-center items-center gap-2">
          <span>🕊️</span>
          <span>•</span>
          <span>🕊️</span>
        </div>
      </motion.section>
    </div>
  );
};
