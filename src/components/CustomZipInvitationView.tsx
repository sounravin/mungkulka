import React, { useEffect, useRef } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Gift,
  Heart,
  Send,
  Users,
  Utensils,
  Scissors,
  Sun,
  Sparkles,
  Play,
  Pause,
  Copy,
  Check,
  ExternalLink,
  Disc,
  Trash2
} from 'lucide-react';
import { WeddingInvitationData, GuestWish, TemplateTheme } from '../types';
import { KhmerCalendar } from './KhmerCalendar';
import { VintageVinylPlayer } from './VintageVinylPlayer';

interface CustomZipInvitationViewProps {
  data: WeddingInvitationData;
  template: TemplateTheme;
  lang: 'km' | 'en';
  setLang: (lang: 'km' | 'en') => void;
  isPlaying: boolean;
  toggleMusic: () => void;
  timeLeft: { days: number; hours: number; minutes: number; seconds: number };
  galleryPhotosList: string[];
  activeModal: 'location' | 'gift' | 'schedule' | null;
  setActiveModal: (modal: 'location' | 'gift' | 'schedule' | null) => void;
  setIsPhotoLightboxOpen: (open: boolean) => void;
  setActivePhotoIdx: (idx: number) => void;
  wishes: GuestWish[];
  guestName: string;
  setGuestName: (name: string) => void;
  guestMessage: string;
  setGuestMessage: (msg: string) => void;
  attendance: 'attending' | 'regret' | 'maybe' | 'yes' | 'no';
  setAttendance: (att: 'attending' | 'regret' | 'maybe') => void;
  guestCount: number;
  setGuestCount: (cnt: number) => void;
  handleAddWish: (e: React.FormEvent) => void;
  handleDeleteWish: (id: string) => void;
  copiedAccount: boolean;
  handleCopyAccount: (accNumber?: string) => void;
  scrollToSection: (id: string) => void;
}

export const CustomZipInvitationView: React.FC<CustomZipInvitationViewProps> = ({
  data,
  template,
  lang,
  setLang,
  isPlaying,
  toggleMusic,
  timeLeft,
  galleryPhotosList,
  activeModal,
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
  const accentColor = template.accentColor || '#B8860B';
  const borderColor = template.borderColor || '#E8DFC2';
  const headerFont = template.headerFontClass || 'font-moul';
  const bodyFont = template.bodyFontClass || 'font-kantumruy';
  const htmlContainerRef = useRef<HTMLDivElement>(null);

  // Process HTML Content if extracted from Zip file with comprehensive placeholder replacements
  const getProcessedHtml = () => {
    if (!template.htmlContent) return null;

    let html = template.htmlContent;
    const groomKm = data.groomNameKm || data.groomNameEn || '';
    const groomEn = data.groomNameEn || data.groomNameKm || '';
    const brideKm = data.brideNameKm || data.brideNameEn || '';
    const brideEn = data.brideNameEn || data.brideNameKm || '';
    const dateStr = lang === 'km' ? (data.lunarDateKm || data.weddingDateIso) : data.weddingDateIso;
    const timeStr = lang === 'km' ? (data.weddingTimeKm || 'ម៉ោង ៧:០០ ព្រឹក') : (data.weddingTimeEn || '7:00 AM');
    const locStr = lang === 'km' ? (data.venueNameKm || data.venueNameEn || data.addressKm) : (data.venueNameEn || data.venueNameKm || data.addressEn);
    const venueStr = lang === 'km' ? (data.venueNameKm || data.venueNameEn || locStr) : (data.venueNameEn || data.venueNameKm || locStr);
    const addrStr = lang === 'km' ? (data.addressKm || data.addressEn || '') : (data.addressEn || data.addressKm || '');

    // Replace both double braces {{...}} and single braces {...}
    html = html.replace(/\{\{groomNameKm\}\}|\{groomNameKm\}/g, groomKm);
    html = html.replace(/\{\{groomNameEn\}\}|\{groomNameEn\}/g, groomEn);
    html = html.replace(/\{\{groomName\}\}|\{groomName\}|\{\{groom_name\}\}/g, lang === 'km' ? groomKm : groomEn);

    html = html.replace(/\{\{brideNameKm\}\}|\{brideNameKm\}/g, brideKm);
    html = html.replace(/\{\{brideNameEn\}\}|\{brideNameEn\}/g, brideEn);
    html = html.replace(/\{\{brideName\}\}|\{brideName\}|\{\{bride_name\}\}/g, lang === 'km' ? brideKm : brideEn);

    html = html.replace(/\{\{weddingDate\}\}|\{weddingDate\}|\{\{date\}\}/g, dateStr);
    html = html.replace(/\{\{lunarDate\}\}|\{lunarDate\}/g, data.lunarDateKm || '');
    html = html.replace(/\{\{solarDate\}\}|\{solarDate\}|\{\{weddingDateIso\}\}/g, data.weddingDateIso || '');
    html = html.replace(/\{\{weddingTime\}\}|\{weddingTime\}|\{\{time\}\}/g, timeStr);

    html = html.replace(/\{\{location\}\}|\{location\}|\{\{locationKm\}\}/g, locStr);
    html = html.replace(/\{\{venueName\}\}|\{venueName\}/g, venueStr);
    html = html.replace(/\{\{locationAddress\}\}|\{locationAddress\}|\{\{address\}\}/g, addrStr);
    html = html.replace(/\{\{googleMapUrl\}\}|\{googleMapUrl\}|\{\{locationMapUrl\}\}/g, data.googleMapUrl || '#');

    html = html.replace(/\{\{groomFather\}\}|\{groomFather\}/g, data.parents?.groomFather || '');
    html = html.replace(/\{\{groomMother\}\}|\{groomMother\}/g, data.parents?.groomMother || '');
    html = html.replace(/\{\{brideFather\}\}|\{brideFather\}/g, data.parents?.brideFather || '');
    html = html.replace(/\{\{brideMother\}\}|\{brideMother\}/g, data.parents?.brideMother || '');

    html = html.replace(/\{\{couplePhotoUrl\}\}|\{couplePhotoUrl\}|\{\{photo\}\}/g, data.couplePhotoUrl || galleryPhotosList[0] || '');
    html = html.replace(/\{\{coverPhotoUrl\}\}|\{coverPhotoUrl\}/g, data.coverPhotoUrl || '');

    html = html.replace(/\{\{bankName\}\}|\{bankName\}/g, data.bankBlessing?.bankName || '');
    html = html.replace(/\{\{bankAccountName\}\}|\{bankAccountName\}/g, data.bankBlessing?.accountName || '');
    html = html.replace(/\{\{bankAccountNumber\}\}|\{bankAccountNumber\}/g, data.bankBlessing?.accountNumber || '');

    return html;
  };

  const processedHtml = getProcessedHtml();

  // Intercept click and submit events in injected HTML to prevent unwanted page reloads & auto-open covers
  useEffect(() => {
    const container = htmlContainerRef.current;
    if (!container) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const clickable = target.closest('a, button, [role="button"], .btn, .button, [onclick], .open-btn, .btn-open, #open-btn, #open, .open, .envelope, .cover');

      // Check if this click is meant to open/unseal the invitation card
      const text = (target.textContent || '').trim().toLowerCase();
      const isOpenTrigger =
        text.includes('open') ||
        text.includes('បើក') ||
        text.includes('unseal') ||
        text.includes('explore') ||
        (clickable && (
          clickable.classList.contains('open') ||
          clickable.classList.contains('btn-open') ||
          clickable.classList.contains('open-btn') ||
          clickable.classList.contains('envelope') ||
          clickable.id === 'open' ||
          clickable.id === 'open-btn' ||
          clickable.getAttribute('onclick')?.toLowerCase().includes('open') ||
          clickable.getAttribute('onclick')?.toLowerCase().includes('cover')
        ));

      if (isOpenTrigger) {
        // Find cover, envelope, splash, curtain or opening containers and hide them or toggle active classes
        const covers = container.querySelectorAll(
          '#cover, .cover, #envelope, .envelope, #opening, .opening, .splash, #splash, .invitation-cover, .curtain, #curtain, [class*="cover"], [id*="cover"], [class*="envelope"], [id*="envelope"], [class*="opening"], [id*="opening"]'
        );

        covers.forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.classList.add('opened', 'active', 'open', 'hide', 'hidden', 'fade-out');
          htmlEl.style.display = 'none';
        });

        // Make main content sections visible
        const contents = container.querySelectorAll(
          '#content, .content, #main, .main, #invitation-content, .invitation-content, [class*="content"], [id*="content"], .card-body'
        );

        contents.forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.classList.add('active', 'show', 'opened', 'visible');
          if (htmlEl.style.display === 'none') {
            htmlEl.style.display = 'block';
          }
        });
      }

      const link = target.closest('a');
      if (link) {
        const href = link.getAttribute('href');
        if (!href || href === '#' || href === '' || href.startsWith('javascript:')) {
          e.preventDefault();
          // Do not call stopPropagation so inline event listeners & custom JS can execute
          return;
        }
        if (href.startsWith('http://') || href.startsWith('https://')) {
          e.preventDefault();
          window.open(href, '_blank', 'noopener,noreferrer');
          return;
        }
        // Relative link inside zip
        e.preventDefault();
        return;
      }

      const btn = target.closest('button');
      if (btn && !btn.getAttribute('type')) {
        btn.setAttribute('type', 'button');
      }
    };

    const handleSubmit = (e: Event) => {
      e.preventDefault();
    };

    container.addEventListener('click', handleClick);
    container.addEventListener('submit', handleSubmit);

    return () => {
      container.removeEventListener('click', handleClick);
      container.removeEventListener('submit', handleSubmit);
    };
  }, [processedHtml]);

  useEffect(() => {
    if (!htmlContainerRef.current || !processedHtml) return;

    const scripts = htmlContainerRef.current.querySelectorAll('script');
    const createdScripts: HTMLScriptElement[] = [];

    scripts.forEach((oldScript) => {
      try {
        const newScript = document.createElement('script');
        // Ensure scripts execute sequentially in the exact order they appear
        newScript.async = false;
        Array.from(oldScript.attributes).forEach((attr: Attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });
        if (oldScript.textContent) {
          // Add semicolon boundary to prevent (intermediate value)(...) syntax errors
          newScript.textContent = `;\n${oldScript.textContent}\n;\n`;
        }
        document.body.appendChild(newScript);
        createdScripts.push(newScript);
      } catch (err) {
        console.warn('Error executing zip script tag:', err);
      }
    });

    // Dispatch DOMContentLoaded and load events so uploaded scripts initializing on these events run
    const timer = setTimeout(() => {
      try {
        window.dispatchEvent(new Event('DOMContentLoaded'));
        window.dispatchEvent(new Event('load'));
      } catch (e) {
        // ignore
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      createdScripts.forEach((s) => {
        if (s.parentNode) {
          s.parentNode.removeChild(s);
        }
      });
    };
  }, [processedHtml]);

  return (
    <div className={`relative w-full flex-1 flex flex-col space-y-6 p-4 sm:p-5 pb-28 animate-fadeIn ${bodyFont}`}>
      {/* Inject Extracted Zip CSS Styles */}
      {template.cssContent && (
        <style dangerouslySetInnerHTML={{ __html: template.cssContent }} />
      )}

      {/* Sticky Header Controls */}
      <div className="sticky top-0 z-40 w-full px-3.5 py-2 bg-white/95 backdrop-blur-md border-b border-stone-200/80 flex items-center justify-between text-xs rounded-2xl shadow-sm">
        {/* Language Pill */}
        <div className="inline-flex items-center gap-1 p-0.5 rounded-full bg-stone-100 border border-stone-200 text-[11px] font-bold text-stone-700">
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`px-2.5 py-0.5 rounded-full transition-all ${
              lang === 'en' ? 'bg-stone-900 text-white shadow-xs' : 'text-stone-600'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLang('km')}
            className={`px-2.5 py-0.5 rounded-full transition-all ${
              lang === 'km' ? 'bg-stone-900 text-white shadow-xs' : 'text-stone-600'
            }`}
          >
            ខ្មែរ
          </button>
        </div>

        {/* Custom Zip Template Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-900 border border-purple-200 font-bold text-[10px] uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>{template.nameKm || template.nameEn}</span>
        </div>

        {/* Music Control */}
        <button
          type="button"
          onClick={toggleMusic}
          className={`p-2 rounded-full border transition-all ${
            isPlaying ? 'bg-amber-100 text-amber-900 border-amber-300 animate-spin-slow' : 'bg-stone-100 text-stone-600 border-stone-300'
          }`}
          title="Play/Pause Music"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Main Extracted HTML or Default Template Card */}
      <div id="overview">
        {processedHtml ? (
          <div className="w-full relative rounded-3xl bg-white shadow-xl border border-stone-200 overflow-hidden min-h-[400px]">
            <div
              ref={htmlContainerRef}
              className="custom-zip-extracted-html w-full"
              dangerouslySetInnerHTML={{ __html: processedHtml }}
            />
          </div>
        ) : (
          /* Render Custom Zip Dynamic Card Header */
          <div
            className="relative rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl border-2 overflow-hidden"
            style={{
              borderColor: borderColor,
              backgroundColor: '#FFFDF9',
            }}
          >
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-900 text-amber-300 text-xs font-bold shadow-md">
              <span>{template.badge || '★ ZIP TEMPLATE'}</span>
            </div>

            <div className="space-y-3">
              <h3 className={`${headerFont} text-stone-600 text-sm sm:text-base`}>
                {lang === 'km' ? 'សិរីមង្គលអាពាហ៍ពិពាហ៍' : 'Wedding Invitation'}
              </h3>

              {/* Groom & Bride Names */}
              <div className="space-y-2">
                <h1 className={`${headerFont} text-2xl sm:text-4xl text-stone-900 leading-relaxed`} style={{ color: accentColor }}>
                  {lang === 'km' ? (data.groomNameKm || data.groomNameEn) : (data.groomNameEn || data.groomNameKm)}
                </h1>
                <p className="text-xl italic font-serif text-stone-400">&</p>
                <h1 className={`${headerFont} text-2xl sm:text-4xl text-stone-900 leading-relaxed`} style={{ color: accentColor }}>
                  {lang === 'km' ? (data.brideNameKm || data.brideNameEn) : (data.brideNameEn || data.brideNameKm)}
                </h1>
              </div>

              {/* Parents names */}
              <div className="grid grid-cols-2 gap-4 pt-4 text-xs text-stone-600 border-t border-stone-200 max-w-md mx-auto">
                <div>
                  <p className="font-bold text-stone-800">{lang === 'km' ? 'ខាងប្រុស' : 'Groom Side'}</p>
                  <p>{data.parents?.groomFather}</p>
                  <p>{data.parents?.groomMother}</p>
                </div>
                <div>
                  <p className="font-bold text-stone-800">{lang === 'km' ? 'ខាងស្រី' : 'Bride Side'}</p>
                  <p>{data.parents?.brideFather}</p>
                  <p>{data.parents?.brideMother}</p>
                </div>
              </div>
            </div>

            {/* Date & Location Box */}
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 space-y-2 max-w-md mx-auto text-xs text-stone-800">
              <div className="flex items-center justify-center gap-2 font-bold text-stone-900">
                <Calendar className="w-4 h-4 text-amber-700" />
                <span>{lang === 'km' ? (data.lunarDateKm || data.weddingDateIso) : data.weddingDateIso}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-stone-600">
                <MapPin className="w-4 h-4 text-rose-600" />
                <span>{lang === 'km' ? (data.venueNameKm || data.addressKm) : (data.venueNameEn || data.addressEn)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Countdown Timer */}
      <div id="date-location" className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white rounded-3xl p-6 shadow-xl border border-stone-700 text-center space-y-4">
        <h3 className={`${headerFont} text-sm sm:text-base text-amber-300`}>
          {lang === 'km' ? 'រាប់ថយក្រោយដល់ថ្ងៃសិរីមង្គល' : 'Countdown to Wedding Day'}
        </h3>
        <div className="grid grid-cols-4 gap-3 max-w-xs mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15">
            <span className="text-xl sm:text-2xl font-bold font-mono text-amber-300 block">{timeLeft.days}</span>
            <span className="text-[10px] text-stone-300 uppercase">{lang === 'km' ? 'ថ្ងៃ' : 'Days'}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15">
            <span className="text-xl sm:text-2xl font-bold font-mono text-amber-300 block">{timeLeft.hours}</span>
            <span className="text-[10px] text-stone-300 uppercase">{lang === 'km' ? 'ម៉ោង' : 'Hours'}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15">
            <span className="text-xl sm:text-2xl font-bold font-mono text-amber-300 block">{timeLeft.minutes}</span>
            <span className="text-[10px] text-stone-300 uppercase">{lang === 'km' ? 'នាទី' : 'Mins'}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15">
            <span className="text-xl sm:text-2xl font-bold font-mono text-amber-300 block">{timeLeft.seconds}</span>
            <span className="text-[10px] text-stone-300 uppercase">{lang === 'km' ? 'វិនាទី' : 'Secs'}</span>
          </div>
        </div>
      </div>

      {/* Program Schedule */}
      {data.schedule && data.schedule.length > 0 && (
        <div id="schedule" className="bg-white rounded-3xl p-6 shadow-xl border border-stone-200 space-y-4">
          <h3 className={`${headerFont} text-base text-stone-900 text-center`}>
            {lang === 'km' ? 'កម្មវិធីសិរីមង្គល' : 'Wedding Schedule'}
          </h3>

          <div className="space-y-3">
            {data.schedule.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
                <div className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 font-bold text-xs shrink-0 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  <span>{item.time}</span>
                </div>
                <div className="space-y-0.5 text-xs text-stone-800">
                  <p className="font-bold text-stone-900">{lang === 'km' ? item.titleKm : item.titleEn}</p>
                  {item.descriptionKm && (
                    <p className="text-stone-500 text-[11px]">{lang === 'km' ? item.descriptionKm : item.descriptionEn}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photo Gallery Grid */}
      {galleryPhotosList.length > 0 && (
        <div id="gallery" className="bg-white rounded-3xl p-6 shadow-xl border border-stone-200 space-y-4">
          <div className="text-center space-y-1">
            <h3 className={`${headerFont} text-base text-stone-900`}>
              {lang === 'km' ? 'កម្រងរូបថតអនុស្សាវរីយ៍' : 'Photo Gallery'}
            </h3>
            <p className="text-xs text-stone-500">{lang === 'km' ? 'ចុចលើរូបថតដើម្បីមើលទំហំធំ' : 'Click photo to view full size'}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {galleryPhotosList.map((photo, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setActivePhotoIdx(idx);
                  setIsPhotoLightboxOpen(true);
                }}
                className="aspect-4/5 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.02] transition-all"
              >
                <img src={photo} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Traditional Khmer Wedding Calendar Component */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-stone-200 space-y-4">
        <KhmerCalendar weddingDateIso={data.weddingDateIso} lang={lang} />
      </div>

      {/* Gift QR Modal Button & Location Map */}
      <div id="gift" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.bankBlessing?.qrCodeUrl && (
          <button
            type="button"
            onClick={() => setActiveModal('gift')}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-900 font-bold text-xs shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 border border-amber-200 cursor-pointer active:scale-95"
          >
            <Gift className="w-5 h-5 text-stone-900" />
            <span>{lang === 'km' ? 'ចំណងដៃអាពាហ៍ពិពាហ៍ (Gift QR)' : 'Send Wedding Gift (QR)'}</span>
          </button>
        )}

        {data.googleMapUrl && (
          <a
            href={data.googleMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 px-6 rounded-2xl bg-stone-900 text-amber-300 font-bold text-xs shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2 border border-stone-700 active:scale-95"
          >
            <MapPin className="w-5 h-5 text-rose-400" />
            <span>{lang === 'km' ? 'មើលទីតាំងលើ Google Maps' : 'View Location on Google Maps'}</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
          </a>
        )}
      </div>

      {/* RSVP & Wishes Form */}
      <div id="wishes" className="bg-white rounded-3xl p-6 shadow-xl border border-stone-200 space-y-5">
        <div className="text-center space-y-1">
          <h3 className={`${headerFont} text-base text-stone-900`}>
            {lang === 'km' ? 'សារជូនពរ & ឆ្លើយតបការអញ្ជើញ (RSVP)' : 'Best Wishes & RSVP'}
          </h3>
          <p className="text-xs text-stone-500">
            {lang === 'km' ? 'សូមផ្ញើសារជូនពរដល់កូនកំលោះ និងកូនក្រមុំ' : 'Send your warmest wishes to the newlyweds'}
          </p>
        </div>

        <form onSubmit={handleAddWish} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="block font-bold text-stone-700">{lang === 'km' ? 'ឈ្មោះរបស់អ្នក' : 'Your Name'}</label>
            <input
              type="text"
              required
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder={lang === 'km' ? 'ឧទាហរណ៍៖ សុខ ជា' : 'e.g. John Doe'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-stone-700">{lang === 'km' ? 'សារជូនពរ' : 'Best Wishes'}</label>
            <textarea
              required
              rows={3}
              value={guestMessage}
              onChange={(e) => setGuestMessage(e.target.value)}
              placeholder={lang === 'km' ? 'សូមជូនពរអោយកូនកំលោះ និងកូនក្រមុំមានសុភមង្គល...' : 'Wishing you a lifetime of love and happiness...'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Attendance option */}
          <div className="space-y-2">
            <label className="block font-bold text-stone-700">{lang === 'km' ? 'ការចូលរួម' : 'Attendance'}</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAttendance('attending')}
                className={`py-2 px-3 rounded-xl border font-bold text-center transition-all ${
                  attendance === 'attending' || attendance === 'yes' ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-stone-50 text-stone-700 border-stone-200'
                }`}
              >
                {lang === 'km' ? 'ចូលរួម' : 'Attending'}
              </button>
              <button
                type="button"
                onClick={() => setAttendance('regret')}
                className={`py-2 px-3 rounded-xl border font-bold text-center transition-all ${
                  attendance === 'regret' || attendance === 'no' ? 'bg-rose-600 text-white border-rose-600 shadow-sm' : 'bg-stone-50 text-stone-700 border-stone-200'
                }`}
              >
                {lang === 'km' ? 'អាក់ខាន' : 'Cannot Attend'}
              </button>
              <button
                type="button"
                onClick={() => setAttendance('maybe')}
                className={`py-2 px-3 rounded-xl border font-bold text-center transition-all ${
                  attendance === 'maybe' ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-stone-50 text-stone-700 border-stone-200'
                }`}
              >
                {lang === 'km' ? 'មិនប្រាកដ' : 'Maybe'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-stone-900 hover:bg-black text-amber-300 font-bold shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Send className="w-4 h-4 text-amber-300" />
            <span>{lang === 'km' ? 'ផ្ញើសារជូនពរ' : 'Send Best Wishes'}</span>
          </button>
        </form>

        {/* Guest Wishes List */}
        {wishes.length > 0 && (
          <div className="pt-4 border-t border-stone-200 space-y-3">
            <h4 className="font-bold text-stone-800 text-xs flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>{lang === 'km' ? `សារជូនពរដែលបានផ្ញើ (${wishes.length})` : `Wishes Received (${wishes.length})`}</span>
            </h4>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {wishes.map((w) => (
                <div key={w.id} className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs space-y-1 relative group">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">{w.guestName}</span>
                    <span className="text-[10px] text-stone-400">{new Date(w.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-stone-700 text-[11px] leading-relaxed">{w.message}</p>

                  <button
                    type="button"
                    onClick={() => handleDeleteWish(w.id)}
                    className="absolute top-2 right-2 text-stone-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Wish"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Quick Dock Navigation */}
      <div className="fixed bottom-3 left-0 right-0 z-40 px-4 max-w-md mx-auto pointer-events-auto">
        <div className="bg-stone-900/90 backdrop-blur-md border border-amber-500/30 text-amber-300 rounded-2xl p-2 shadow-2xl flex items-center justify-around text-[10px] font-bold">
          <button
            type="button"
            onClick={() => scrollToSection('overview')}
            className="flex flex-col items-center gap-1 p-1 hover:text-white transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>{lang === 'km' ? 'ដើម' : 'Top'}</span>
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('date-location')}
            className="flex flex-col items-center gap-1 p-1 hover:text-white transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span>{lang === 'km' ? 'ថ្ងៃ' : 'Date'}</span>
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('schedule')}
            className="flex flex-col items-center gap-1 p-1 hover:text-white transition-colors"
          >
            <Clock className="w-4 h-4" />
            <span>{lang === 'km' ? 'កម្មវិធី' : 'Schedule'}</span>
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('gallery')}
            className="flex flex-col items-center gap-1 p-1 hover:text-white transition-colors"
          >
            <Users className="w-4 h-4" />
            <span>{lang === 'km' ? 'រូបថត' : 'Photos'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveModal('gift')}
            className="flex flex-col items-center gap-1 p-1 hover:text-white transition-colors"
          >
            <Gift className="w-4 h-4 text-amber-400" />
            <span>{lang === 'km' ? 'ចំណងដៃ' : 'Gift'}</span>
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('wishes')}
            className="flex flex-col items-center gap-1 p-1 hover:text-white transition-colors"
          >
            <Heart className="w-4 h-4 text-rose-400" />
            <span>{lang === 'km' ? 'ជូនពរ' : 'RSVP'}</span>
          </button>
        </div>
      </div>

      {/* Gift Modal */}
      {activeModal === 'gift' && data.bankBlessing?.qrCodeUrl && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-amber-200 text-center space-y-4 relative">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            >
              ✕
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-inner">
              <Gift className="w-6 h-6 text-amber-700" />
            </div>

            <h3 className={`${headerFont} text-base text-stone-900`}>
              {lang === 'km' ? 'ចំណងដៃអាពាហ៍ពិពាហ៍' : 'Wedding Gift'}
            </h3>

            <div className="w-48 h-48 mx-auto rounded-2xl border-2 border-amber-200 p-2 bg-white shadow-md">
              <img
                src={data.bankBlessing.qrCodeUrl}
                alt="Gift QR Code"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>

            {data.bankBlessing.accountNumber && (
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs flex items-center justify-between gap-2">
                <div className="text-left space-y-0.5">
                  <p className="font-bold text-stone-900">{data.bankBlessing.bankName || 'ABA Bank'}</p>
                  <p className="font-mono text-stone-600">{data.bankBlessing.accountNumber}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyAccount(data.bankBlessing.accountNumber)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 text-stone-900 font-bold text-[11px] shadow-sm flex items-center gap-1 hover:bg-amber-400"
                >
                  {copiedAccount ? <Check className="w-3.5 h-3.5 text-stone-900" /> : <Copy className="w-3.5 h-3.5 text-stone-900" />}
                  <span>{copiedAccount ? (lang === 'km' ? 'បានចម្លង' : 'Copied') : (lang === 'km' ? 'ចម្លង' : 'Copy')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
