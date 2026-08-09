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
  ChevronLeft,
  Sparkles,
  GlassWater,
  Music,
  Cake,
  PartyPopper
} from 'lucide-react';
import { WeddingInvitationData, GuestWish, Language } from '../types';
import { VintageVinylPlayer } from './VintageVinylPlayer';

interface VelvetRubyProps {
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

export const VelvetRubyInvitationView: React.FC<VelvetRubyProps> = ({
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
  const dateObj = new Date(data.weddingDateIso || '2026-05-16');
  const year = dateObj.getFullYear() || 2026;
  const monthIdx = dateObj.getMonth(); // 0 - 11
  const targetDay = dateObj.getDate() || 16;

  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthNamesKm = [
    'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
    'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
  ];
  const monthName = monthNamesEn[monthIdx] || 'May';
  const monthNameKm = monthNamesKm[monthIdx] || 'ឧសភា';

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

  // Active Photo Carousel State inside gallery
  const [photoIndex, setPhotoIndex] = React.useState(0);

  const nextPhoto = () => {
    if (galleryPhotosList.length > 0) {
      setPhotoIndex((prev) => (prev + 1) % galleryPhotosList.length);
    }
  };

  const prevPhoto = () => {
    if (galleryPhotosList.length > 0) {
      setPhotoIndex((prev) => (prev - 1 + galleryPhotosList.length) % galleryPhotosList.length);
    }
  };

  // Google Calendar Link
  const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    `Wedding of ${data.groomNameEn || data.groomNameKm} & ${data.brideNameEn || data.brideNameKm}`
  )}&dates=${data.weddingDateIso.replace(/-/g, '')}T100000Z/${data.weddingDateIso.replace(/-/g, '')}T160000Z&details=${encodeURIComponent(
    `Celebrate the wedding of ${data.groomNameEn || data.groomNameKm} and ${data.brideNameEn || data.brideNameKm}`
  )}&location=${encodeURIComponent(data.venueNameEn || data.venueNameKm || data.addressEn)}`;

  // Rose Bouquet SVG / Decorative Element Component
  const RoseBouquetAccent = ({ className = "w-20 h-20" }: { className?: string }) => (
    <div className={`relative pointer-events-none select-none ${className}`}>
      {/* High Quality Styled Rose Floral Graphic */}
      <div className="absolute inset-0 flex items-center justify-center filter drop-shadow-md">
        <span className="text-3xl sm:text-4xl">🌹</span>
        <span className="text-xl -ml-2 -mt-2">🌸</span>
        <span className="text-2xl -ml-2 mt-2">🌿</span>
      </div>
    </div>
  );

  return (
    <div className={`relative w-full flex-1 flex flex-col space-y-10 p-3 sm:p-5 pb-24 text-[#2B0007] bg-[#FAF6F0] animate-fadeIn ${lang === 'km' ? 'font-kantumruy' : 'font-serif'}`}>
      
      {/* 1. TOP FLOATING NAVIGATION & LANGUAGE BAR */}
      <div className="sticky top-0 z-40 w-full px-3 py-2 bg-[#FAF6F0]/90 backdrop-blur-md border-b border-[#E5D7C5] flex items-center justify-between text-xs rounded-b-2xl shadow-xs">
        {/* Language Switcher */}
        <div className="inline-flex items-center gap-1 p-0.5 rounded-full bg-stone-100 border border-stone-200 text-[11px] font-bold text-stone-700">
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`px-2.5 py-0.5 rounded-full transition-all ${
              lang === 'en' ? 'bg-[#580A14] text-white shadow-2xs' : 'text-stone-600'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLang('km')}
            className={`px-2.5 py-0.5 rounded-full transition-all ${
              lang === 'km' ? 'bg-[#580A14] text-white shadow-2xs' : 'text-stone-600'
            }`}
          >
            ខ្មែរ
          </button>
        </div>

        {/* Music Vinyl Player Compact */}
        <VintageVinylPlayer isPlaying={isPlaying} onToggle={toggleMusic} lang={lang} variant="compact" />
      </div>

      {/* 2. HERO SECTION: UNSEALED BURGUNDY ENVELOPE WITH COUPLE PHOTO (Matching Video 0:03) */}
      <div className="relative w-full flex flex-col items-center pt-2 pb-6">
        {/* Subtle Architectural Line Sketch Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#580A14_0.75px,transparent_0.75px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

        {/* Outer Envelope Container */}
        <div className="relative w-full max-w-[340px] flex flex-col items-center">
          {/* Unsealed Burgundy Envelope Graphic */}
          <div className="relative w-full bg-[#580A14] rounded-2xl shadow-2xl p-4 pt-10 border border-[#8C0B20] text-center overflow-visible">
            
            {/* Top V-Shaped Opened Envelope Flap */}
            <div className="absolute -top-7 inset-x-0 mx-auto w-full flex justify-center">
              <div className="w-0 h-0 border-l-[160px] border-l-transparent border-r-[160px] border-r-transparent border-b-[35px] border-b-[#4A0404] filter drop-shadow-md" />
            </div>

            {/* Emerging Photo Card inside Envelope */}
            <div className="relative -mt-16 mb-4 z-10 w-full bg-white p-2 rounded-xl shadow-xl border border-amber-200 transform hover:scale-[1.02] transition-all">
              <div className="relative w-full h-56 rounded-lg overflow-hidden bg-stone-100">
                <img
                  src={data.couplePhotoUrl || data.coverPhotoUrl || galleryPhotosList[0]}
                  alt="Groom & Bride"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
              {/* Deep Red Floral Bouquet Decoration overlapping the envelope top left */}
              <div className="absolute -top-5 -left-5 z-20 pointer-events-none flex items-center">
                <span className="text-4xl filter drop-shadow-lg">🌹</span>
                <span className="text-2xl -ml-3 mt-3">🌸</span>
              </div>
            </div>

            {/* Wax Seal Emblem at Envelope Center */}
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-20 w-11 h-11 rounded-full bg-gradient-to-tr from-[#996515] via-[#D4AF37] to-[#8C6D3B] p-0.5 shadow-xl flex items-center justify-center cursor-pointer hover:scale-110 transition-all">
              <div className="w-full h-full rounded-full bg-[#580A14] border border-amber-200 flex items-center justify-center text-amber-300 font-bold text-xs">
                ❤️
              </div>
            </div>
          </div>

          {/* Large Elegant Names below Envelope */}
          <div className="mt-8 text-center space-y-1">
            <h1 className={lang === 'km' ? "font-moul text-2xl text-[#580A14] leading-relaxed" : "font-serif text-3xl font-light tracking-[0.2em] text-[#580A14] uppercase"}>
              {lang === 'km' ? (data.groomNameKm || data.groomNameEn) : (data.groomNameEn || 'JULIAN')}
            </h1>
            <h1 className={lang === 'km' ? "font-moul text-2xl text-[#580A14] leading-relaxed" : "font-serif text-3xl font-light tracking-[0.2em] text-[#580A14] uppercase"}>
              {lang === 'km' ? (data.brideNameKm || data.brideNameEn) : (data.brideNameEn || 'VIVIAN')}
            </h1>
          </div>
        </div>
      </div>

      {/* 3. CEREMONY INFO CARD (Matching Video 0:05 - 0:09) */}
      <div className="relative w-full max-w-[360px] mx-auto bg-[#4A0E17] text-amber-50 rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#8C0B20] relative overflow-hidden">
        
        {/* Deep Rose Floral Bouquet Accent on Right Edge */}
        <div className="absolute top-10 -right-4 z-20 pointer-events-none opacity-90 flex flex-col items-center">
          <span className="text-5xl filter drop-shadow-xl">🌹</span>
          <span className="text-3xl -mt-3 mr-2">🌸</span>
        </div>

        <div className="relative z-10 space-y-5 text-center">
          {/* Header */}
          <div className="border-b border-amber-400/30 pb-3">
            <h2 className={lang === 'km' ? "font-moul text-base text-amber-200 tracking-wide" : "font-serif text-sm tracking-[0.25em] text-amber-200 font-bold uppercase"}>
              {lang === 'km' ? 'កម្មវិធីពិធីការ' : 'CEREMONY INFO'}
            </h2>
          </div>

          {/* Parents Names (2 Columns) */}
          <div className="grid grid-cols-2 gap-3 text-xs border-b border-amber-400/20 pb-4">
            <div className="space-y-0.5">
              <p className="text-[10px] text-amber-300/80 font-bold uppercase">{lang === 'km' ? 'លោកឪពុក អ្នកម្តាយខាងប្រុស' : 'Mr. & Mrs.'}</p>
              <p className="font-semibold text-amber-100">{data.parents?.groomFather || 'Robert Sinclair'}</p>
              <p className="font-semibold text-amber-100">{data.parents?.groomMother || 'Margaret Sinclair'}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] text-amber-300/80 font-bold uppercase">{lang === 'km' ? 'លោកឪពុក អ្នកម្តាយខាងស្រី' : 'Mr. & Mrs.'}</p>
              <p className="font-semibold text-amber-100">{data.parents?.brideFather || 'Charles Hayes'}</p>
              <p className="font-semibold text-amber-100">{data.parents?.brideMother || 'Eleanor Hayes'}</p>
            </div>
          </div>

          {/* Announcement Subtitle */}
          <p className="text-[11px] italic text-amber-200/90 leading-relaxed px-2">
            {lang === 'km'
              ? 'ដោយក្តីសោមនស្សរីករាយ យើងខ្ញុំសូមជម្រាបជូនដំណឹងអាពាហ៍ពិពាហ៍កូនប្រុសកូនស្រីរបស់យើងខ្ញុំ'
              : 'WITH JOYFUL HEARTS WE ANNOUNCE THE WEDDING OF OUR CHILDREN'}
          </p>

          {/* Groom & Bride Details */}
          <div className="space-y-3 py-1">
            <div>
              <h3 className={lang === 'km' ? "font-moul text-lg text-white" : "font-serif text-xl font-medium tracking-widest text-white uppercase"}>
                {lang === 'km' ? (data.groomNameKm || data.groomNameEn) : (data.groomNameEn || 'JULIAN EVERETT')}
              </h3>
              <p className="text-[10px] text-amber-300/80 uppercase font-bold tracking-widest">
                {lang === 'km' ? 'កូនប្រុស' : 'THE GROOM'}
              </p>
            </div>

            <div className="text-amber-400 text-sm italic font-serif">&</div>

            <div>
              <h3 className={lang === 'km' ? "font-moul text-lg text-white" : "font-serif text-xl font-medium tracking-widest text-white uppercase"}>
                {lang === 'km' ? (data.brideNameKm || data.brideNameEn) : (data.brideNameEn || 'VIVIAN HAYES')}
              </h3>
              <p className="text-[10px] text-amber-300/80 uppercase font-bold tracking-widest">
                {lang === 'km' ? 'កូនស្រី' : 'THE BRIDE'}
              </p>
            </div>
          </div>

          {/* Ceremony Venue Subtitle */}
          <p className="text-xs font-bold text-amber-200 tracking-wider uppercase border-t border-amber-400/20 pt-3">
            {lang === 'km' ? (data.venueNameKm || 'ពិធីសិរីមង្គលអាពាហ៍ពិពាហ៍ នៅគេហដ្ឋាន') : (data.venueNameEn || 'WEDDING CEREMONY AT FAMILY HOME')}
          </p>

          {/* Time & Date Banner Box */}
          <div className="bg-black/30 rounded-2xl p-4 border border-amber-400/30 flex items-center justify-around text-center">
            <div>
              <p className="text-[10px] text-amber-300 uppercase">{lang === 'km' ? 'វេលាម៉ោង' : 'AT'}</p>
              <p className="text-xs font-bold text-white">{data.weddingTimeEn || '09:00 AM'}</p>
            </div>
            <div className="h-8 w-px bg-amber-400/30" />
            <div>
              <p className="text-2xl font-serif font-bold text-amber-300">{targetDay}</p>
            </div>
            <div className="h-8 w-px bg-amber-400/30" />
            <div>
              <p className="text-[10px] text-amber-300 uppercase">{monthName}</p>
              <p className="text-xs font-bold text-white">{year}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. PHOTO GALLERY CAROUSEL (Matching Video 0:10) */}
      <div className="relative w-full max-w-[360px] mx-auto text-center space-y-4 pt-2">
        <h2 className={lang === 'km' ? "font-moul text-base text-[#580A14]" : "font-serif text-sm tracking-[0.25em] text-[#580A14] font-bold uppercase"}>
          {lang === 'km' ? 'កម្រងរូបថតអនុស្សាវរីយ៍' : 'PHOTO GALLERY'}
        </h2>

        {/* 3D Stack / Interactive Photo Frame */}
        <div className="relative w-full h-72 rounded-3xl overflow-hidden bg-stone-900 shadow-2xl border-2 border-amber-300/60 group">
          <img
            src={galleryPhotosList[photoIndex] || data.coverPhotoUrl}
            alt="Gallery Photo"
            className="w-full h-full object-cover transition-all duration-500"
            onClick={() => {
              setActivePhotoIdx(photoIndex);
              setIsPhotoLightboxOpen(true);
            }}
          />

          {/* Previous & Next Navigation Buttons */}
          <button
            type="button"
            onClick={prevPhoto}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={nextPhoto}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-all cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Bottom Pagination Dots */}
          <div className="absolute bottom-3 inset-x-0 z-20 flex justify-center gap-1.5">
            {galleryPhotosList.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPhotoIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === photoIndex ? 'w-6 bg-amber-400' : 'w-2 bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 5. RECEPTION INFO & MONTH CALENDAR (Matching Video 0:11 - 0:12) */}
      <div className="relative w-full max-w-[360px] mx-auto bg-[#4A0E17] text-amber-50 rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#8C0B20] space-y-6 relative overflow-hidden">
        
        {/* Rose Floral Accent on Left Edge */}
        <div className="absolute top-10 -left-4 z-20 pointer-events-none opacity-90 flex flex-col items-center">
          <span className="text-5xl filter drop-shadow-xl">🌹</span>
          <span className="text-3xl -mt-3 ml-2">🌸</span>
        </div>

        {/* Title */}
        <div className="text-center border-b border-amber-400/30 pb-3">
          <h2 className={lang === 'km' ? "font-moul text-base text-amber-200 tracking-wide" : "font-serif text-sm tracking-[0.25em] text-amber-200 font-bold uppercase"}>
            {lang === 'km' ? 'កម្មវិធីពិធីជប់លៀង' : 'RECEPTION INFO'}
          </h2>
          <p className="text-[11px] text-amber-300/80 uppercase tracking-widest mt-1">
            {lang === 'km' ? 'ពិធីជប់លៀងពិសាភោជនាហារនឹងប្រព្រឹត្តទៅនៅ:' : 'THE RECEPTION WILL TAKE PLACE AT:'}
          </p>
        </div>

        {/* Time Banner */}
        <div className="grid grid-cols-2 gap-2 text-center bg-black/30 p-3 rounded-2xl border border-amber-400/20 text-xs">
          <div>
            <p className="text-[10px] text-amber-300 uppercase">{lang === 'km' ? 'ទទួលភ្ញៀវ' : 'WELCOME'}</p>
            <p className="font-bold text-white">{data.weddingTimeKm || '16:30 PM'}</p>
          </div>
          <div>
            <p className="text-[10px] text-amber-300 uppercase">{lang === 'km' ? 'ពិសាភោជនាហារ' : 'RECEPTION'}</p>
            <p className="font-bold text-white">{data.weddingTimeEn || '17:00 PM'}</p>
          </div>
        </div>

        {/* Month Calendar Grid View */}
        <div className="bg-white/10 rounded-2xl p-4 border border-amber-300/30 text-center space-y-3">
          <div className="font-serif font-bold text-sm text-amber-200 tracking-wider">
            {monthName} {year}
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 text-[10px] font-bold text-amber-300/80 border-b border-amber-300/20 pb-2">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-xs">
            {calendarCells.map((dayNum, i) => {
              if (dayNum === null) {
                return <div key={`empty-${i}`} className="h-7" />;
              }
              const isWeddingDay = dayNum === targetDay;
              return (
                <div
                  key={`day-${dayNum}`}
                  className={`h-7 flex items-center justify-center rounded-full text-xs font-semibold ${
                    isWeddingDay
                      ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-stone-900 font-extrabold shadow-lg scale-110'
                      : 'text-amber-100 hover:bg-white/10'
                  }`}
                >
                  {isWeddingDay ? '❤️' : dayNum}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <a
            href={googleCalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 rounded-full bg-white/15 hover:bg-white/25 text-amber-100 font-bold text-xs border border-amber-300/50 flex items-center justify-center gap-2 transition-all"
          >
            <CalendarPlus className="w-4 h-4 text-amber-300" />
            <span>{lang === 'km' ? 'រក្សាទុកក្នុងកាលវិភាគ' : 'Add to Calendar'}</span>
          </a>

          <button
            type="button"
            onClick={() => scrollToSection('rsvp-section')}
            className="w-full py-3 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 font-extrabold text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Heart className="w-4 h-4 fill-current text-rose-950" />
            <span>{lang === 'km' ? 'ឆ្លើយតបវត្តមាន (RSVP)' : 'CONFIRM ATTENDANCE'}</span>
          </button>
        </div>
      </div>

      {/* 6. VENUE LOCATION & GOOGLE MAP (Matching Video 0:13) */}
      <div className="relative w-full max-w-[360px] mx-auto bg-white rounded-3xl p-6 shadow-xl border border-stone-200 space-y-4">
        <div className="text-center space-y-1">
          <h2 className={lang === 'km' ? "font-moul text-base text-[#580A14]" : "font-serif text-sm tracking-[0.2em] text-[#580A14] font-bold uppercase"}>
            {lang === 'km' ? 'ទីតាំងប្រារព្ធពិធី' : 'WEDDING RECEPTION VENUE'}
          </h2>
          <p className="text-xs font-bold text-stone-800">
            {lang === 'km' ? (data.venueNameKm || 'មជ្ឈមណ្ឌលសិរីមង្គល') : (data.venueNameEn || 'The Grand Ballroom')}
          </p>
          <p className="text-[11px] text-stone-600">
            {lang === 'km' ? (data.addressKm || 'រាជធានីភ្នំពេញ') : (data.addressEn || '200 Park Ave, New York, NY 10166')}
          </p>
        </div>

        {/* Embedded Map iframe or Action Link */}
        <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-stone-100 border border-stone-300 shadow-inner">
          {data.googleMapUrl && data.googleMapUrl.includes('pb=') ? (
            <iframe
              src={data.googleMapUrl}
              className="w-full h-full border-0"
              loading="lazy"
              title="Venue Location"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-amber-50 text-center space-y-2">
              <MapPin className="w-8 h-8 text-[#580A14]" />
              <p className="text-xs font-semibold text-stone-700">
                {lang === 'km' ? 'ចុចខាងក្រោមដើម្បីមើលទីតាំងលើ Google Maps' : 'Click below to view map'}
              </p>
            </div>
          )}
        </div>

        <a
          href={data.googleMapUrl || 'https://maps.google.com'}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 rounded-full bg-[#580A14] hover:bg-[#3D0008] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
        >
          <MapPin className="w-4 h-4 text-amber-300" />
          <span>{lang === 'km' ? 'បើកមើលទីតាំង Google Maps' : 'Open in Google Maps'}</span>
        </a>
      </div>

      {/* 7. DRESS CODE (Matching Video 0:14) */}
      <div className="relative w-full max-w-[360px] mx-auto bg-white rounded-3xl p-5 shadow-xl border border-stone-200 text-center space-y-3">
        <h2 className={lang === 'km' ? "font-moul text-sm text-[#580A14]" : "font-serif text-xs tracking-[0.2em] text-[#580A14] font-bold uppercase"}>
          {lang === 'km' ? 'សម្លៀកបំពាក់កំណត់' : 'DRESS CODE'}
        </h2>
        <p className="text-xs font-semibold text-stone-600">
          {lang === 'km' ? 'ពណ៌សម្លៀកបំពាក់ចូលរួម' : 'Party Attire'}
        </p>

        {/* Swatches */}
        <div className="flex justify-center items-center gap-4 pt-1">
          <div className="w-9 h-9 rounded-full bg-[#F5EBE6] border-2 border-stone-300 shadow-md transform hover:scale-110 transition-all" title="Cream" />
          <div className="w-9 h-9 rounded-full bg-[#D4AF37] border-2 border-amber-300 shadow-md transform hover:scale-110 transition-all" title="Gold" />
          <div className="w-9 h-9 rounded-full bg-[#580A14] border-2 border-[#8C0B20] shadow-md transform hover:scale-110 transition-all" title="Burgundy" />
        </div>
      </div>

      {/* 8. WEDDING DAY SCHEDULE (Matching Video 0:14) */}
      <div className="relative w-full max-w-[360px] mx-auto bg-[#4A0E17] text-amber-50 rounded-3xl p-6 shadow-2xl border border-[#8C0B20] space-y-4 relative overflow-hidden">
        
        {/* Bouquet Floral Accent */}
        <div className="absolute top-6 -right-4 z-20 pointer-events-none opacity-80">
          <span className="text-4xl filter drop-shadow-md">🌹</span>
        </div>

        <h2 className={lang === 'km' ? "font-moul text-base text-center text-amber-200" : "font-serif text-sm tracking-[0.2em] text-center text-amber-200 font-bold uppercase"}>
          {lang === 'km' ? 'កម្មវិធីលម្អិតតាមម៉ោង' : 'WEDDING DAY SCHEDULE'}
        </h2>

        {/* Schedule List */}
        <div className="space-y-3 text-xs pt-1">
          <div className="flex items-center gap-3 bg-black/25 p-3 rounded-2xl border border-amber-300/20">
            <span className="font-bold text-amber-300 min-w-[50px]">17:00</span>
            <div className="w-px h-6 bg-amber-300/30" />
            <span>{lang === 'km' ? 'ទទួលភ្ញៀវកិត្តិយស' : 'Welcome guests'}</span>
          </div>

          <div className="flex items-center gap-3 bg-black/25 p-3 rounded-2xl border border-amber-300/20">
            <span className="font-bold text-amber-300 min-w-[50px]">18:00</span>
            <div className="w-px h-6 bg-amber-300/30" />
            <span>{lang === 'km' ? 'ចាប់ផ្តើមពិធីជប់លៀង' : 'Reception begins'}</span>
          </div>

          <div className="flex items-center gap-3 bg-black/25 p-3 rounded-2xl border border-amber-300/20">
            <span className="font-bold text-amber-300 min-w-[50px]">18:30</span>
            <div className="w-px h-6 bg-amber-300/30" />
            <span>{lang === 'km' ? 'ពិធីអាពាហ៍ពិពាហ៍ផ្លូវការ' : 'Wedding ceremony'}</span>
          </div>

          <div className="flex items-center gap-3 bg-black/25 p-3 rounded-2xl border border-amber-300/20">
            <span className="font-bold text-amber-300 min-w-[50px]">19:00</span>
            <div className="w-px h-6 bg-amber-300/30" />
            <span>{lang === 'km' ? 'ពិធីកាត់នំអាពាហ៍ពិពាហ៍' : 'Cake cutting & toast'}</span>
          </div>

          <div className="flex items-center gap-3 bg-black/25 p-3 rounded-2xl border border-amber-300/20">
            <span className="font-bold text-amber-300 min-w-[50px]">20:30</span>
            <div className="w-px h-6 bg-amber-300/30" />
            <span>{lang === 'km' ? 'បិទកម្មវិធី និងជម្រាបលា' : 'Farewell'}</span>
          </div>
        </div>
      </div>

      {/* 9. GUESTBOOK / WISHES SECTION (Matching Video 0:15 - 0:16) */}
      <div id="rsvp-section" className="relative w-full max-w-[360px] mx-auto bg-white rounded-3xl p-6 shadow-xl border border-stone-200 space-y-4">
        <h2 className={lang === 'km' ? "font-moul text-base text-center text-[#580A14]" : "font-serif text-sm tracking-[0.2em] text-center text-[#580A14] font-bold uppercase"}>
          {lang === 'km' ? 'សៀវភៅកំណត់ត្រាពរជ័យ' : 'GUESTBOOK'}
        </h2>

        {/* Input Form */}
        <form onSubmit={handleAddWish} className="space-y-3">
          <input
            type="text"
            required
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder={lang === 'km' ? 'ឈ្មោះរបស់អ្នក...' : 'Enter your name...'}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#580A14] text-xs outline-none bg-stone-50"
          />

          <textarea
            required
            rows={3}
            value={guestMessage}
            onChange={(e) => setGuestMessage(e.target.value)}
            placeholder={lang === 'km' ? 'ពាក្យជូនពររបស់អ្នក...' : 'Enter your wishes...'}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#580A14] text-xs outline-none bg-stone-50 resize-none"
          />

          <button
            type="submit"
            className="w-full py-2.5 rounded-full bg-[#580A14] hover:bg-[#3D0008] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-amber-300" />
            <span>{lang === 'km' ? 'ផ្ញើសារជូនពរ' : 'SEND WISHES'}</span>
          </button>
        </form>

        {/* Wishes List Feed */}
        <div className="max-h-56 overflow-y-auto space-y-2 pt-2 pr-1 no-scrollbar border-t border-stone-200">
          {wishes.length === 0 ? (
            <p className="text-center text-stone-400 text-xs italic py-4">
              {lang === 'km' ? 'មិនទាន់មានសារជូនពរនៅឡើយទេ' : 'Be the first to leave a wish!'}
            </p>
          ) : (
            wishes.map((w) => (
              <div key={w.id} className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-1 relative group">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#580A14]">{w.guestName}</span>
                  <span className="text-[10px] text-stone-400">{w.createdAt}</span>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed">{w.message}</p>
                <button
                  type="button"
                  onClick={() => handleDeleteWish(w.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-500 text-xs p-1 cursor-pointer transition-all"
                  title="Delete wish"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 10. GIFT BOX / BANKING (Matching Video 0:17) */}
      <div className="relative w-full max-w-[360px] mx-auto bg-[#4A0E17] text-amber-50 rounded-3xl p-6 shadow-2xl border border-[#8C0B20] text-center space-y-4">
        <h2 className={lang === 'km' ? "font-moul text-base text-amber-200" : "font-serif text-sm tracking-[0.2em] text-amber-200 font-bold uppercase"}>
          {lang === 'km' ? 'ចំណងដៃតាមរយៈគណនីធនាគារ' : 'GIFT BOX'}
        </h2>

        {/* Gift Box Icon / QR Code Container */}
        <div className="bg-white p-4 rounded-2xl shadow-xl border border-amber-300 inline-block mx-auto max-w-[200px] text-stone-900">
          {data.bankBlessing?.qrCodeUrl ? (
            <img
              src={data.bankBlessing.qrCodeUrl}
              alt="Bank QR Code"
              className="w-40 h-40 object-contain mx-auto rounded-lg"
            />
          ) : (
            <div className="w-40 h-40 bg-amber-50 rounded-lg flex flex-col items-center justify-center p-2 text-center space-y-1">
              <Gift className="w-10 h-10 text-[#580A14]" />
              <p className="text-[10px] font-bold text-stone-700">ABA / KHQR</p>
            </div>
          )}

          <div className="mt-2 text-center space-y-0.5">
            <p className="text-xs font-bold text-[#580A14]">{data.bankBlessing?.accountName || 'JULIAN & VIVIAN'}</p>
            <p className="text-[11px] font-mono text-stone-600 font-bold">{data.bankBlessing?.accountNumber || '000 123 456'}</p>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={handleCopyAccount}
            className="px-6 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
          >
            {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-950" /> : <Copy className="w-3.5 h-3.5 text-stone-950" />}
            <span>
              {copiedAccount
                ? lang === 'km'
                  ? 'បានចម្លងលេខគណនី'
                  : 'Copied Account Number!'
                : lang === 'km'
                ? 'ចម្លងលេខគណនី'
                : 'Copy Account Number'}
            </span>
          </button>
        </div>
      </div>

    </div>
  );
};
