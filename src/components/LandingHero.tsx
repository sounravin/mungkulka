import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Smartphone,
  Wand2,
  Share2,
  Gift,
  Music,
  Calendar,
  KeyRound,
  ChevronDown,
  ChevronUp,
  Tag,
  LogOut
} from 'lucide-react';
import { WeddingInvitationData, PackageTier, UnlockedPackage, TemplateTheme } from '../types';
import { InvitationCard } from './InvitationCard';
import { ErrorBoundary } from './ErrorBoundary';
import { TemplatePicker } from './TemplatePicker';
import { PricingSection } from './PricingSection';

interface LandingHeroProps {
  sampleInvitation: WeddingInvitationData;
  lang: 'km' | 'en';
  onNavigate: (view: 'landing' | 'templates' | 'builder' | 'demo' | 'admin') => void;
  onSelectTemplate: (templateId: any) => void;
  onPreviewTemplate?: (template: TemplateTheme) => void;
  onSelectPackage: (tier: PackageTier) => void;
  onOpenMemberLogin: () => void;
  unlockedPackage: UnlockedPackage | null;
  onLogout?: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  sampleInvitation,
  lang,
  onNavigate,
  onSelectTemplate,
  onPreviewTemplate,
  onSelectPackage,
  onOpenMemberLogin,
  unlockedPackage,
  onLogout,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      qKm: 'តើត្រូវធ្វើយ៉ាងណាទើបអាចចូលទៅកាន់ប្រព័ន្ធបង្កើត Studio បាន?',
      qEn: 'How can I access the Studio Builder system?',
      aKm: 'លោកអ្នកត្រូវធ្វើការជ្រើសរើស និងទិញកញ្ចប់សេវាកម្ម (កញ្ចប់ 15$ ឬ 35$) ជាមុនសិន។ បន្ទាប់ពីទូទាត់ប្រាក់ និង Admin បានអនុម័ត លោកអ្នកនឹងទទួលបាន Activation Code សម្រាប់វាយបញ្ចូលបើកប្រើប្រាស់ប្រព័ន្ធ Studio បង្កើតធៀបការ។',
      aEn: 'You need to choose and purchase an E-Invite package ($15 or $35) first. Once payment is made and approved by Admin, you will receive an Activation Code to unlock the Studio Builder.',
    },
    {
      qKm: 'តើកញ្ចប់ 15$ និង កញ្ចប់ 35$ ខុសគ្នាយ៉ាងដូចម្តេច?',
      qEn: 'What is the difference between $15 and $35 packages?',
      aKm: 'កញ្ចប់ 15$ (Standard) អាចដាក់រូបថតបាន ៥ សន្លឹក មានមុខងារគ្រប់គ្រាន់។ រីឯកញ្ចប់ 35$ (Premium VIP) អាចដាក់រូបថតបានរហូតដល់ ១០ សន្លឹក មានរចនាបថច្រើនបែបថែមទៀត និងបន្ថែមមុខងារកត់ចំណាំក្នុងប្រតិទិន (Calendar Add)។',
      aEn: 'The $15 Standard Package allows up to 5 photos with core features. The $35 Premium VIP Package allows up to 10 photos, extended design styles, and Google Calendar syncing.',
    },
    {
      qKm: 'តើខ្ញុំអាចកែប្រែព័ត៌មានឡើងវិញបានទេបន្ទាប់ពីបង្កើតរួច?',
      qEn: 'Can I edit the invitation details after creation?',
      aKm: 'អ្នកអាចចូលមកកែប្រែព័ត៌មាន កាលបរិច្ឆេទ ទីតាំង ឬរូបថតបានគ្រប់ពេលវេលា ដោយមិនចាំបាច់ផ្ញើ Link ថ្មីទៅភ្ញៀវឡើយ។',
      aEn: 'You can update details, photos, or schedules anytime. Your existing invitation link automatically reflects all updates!',
    },
  ];

  return (
    <div className="w-full space-y-16 sm:space-y-24 pb-16">
      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-6 sm:pt-12 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8 overflow-hidden">
        {/* Glowing Decorative Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-amber-300/25 via-rose-200/20 to-amber-100/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-40 -left-20 w-72 h-72 bg-amber-400/15 rounded-full blur-2xl -z-10 pointer-events-none animate-pulse" />
        <div className="absolute top-60 -right-20 w-80 h-80 bg-rose-400/15 rounded-full blur-2xl -z-10 pointer-events-none animate-pulse" />

        {/* Shimmer Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/90 backdrop-blur-md border border-amber-300/80 shadow-md text-xs sm:text-sm text-stone-800 hover:border-amber-400 transition-all">
          <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
          <span className="font-extrabold text-stone-800">
            {lang === 'km'
              ? '✨ ប្រព័ន្ធធៀបការឌីជីថលបែបខ្មែរទំនើប — ងាយស្រួល រហ័ស និងទាន់សម័យ'
              : '✨ Modern Khmer Digital E-Invitation Platform'}
          </span>
          <span className="flex text-amber-500 ml-1">★★★★★</span>
        </div>

        {/* Subtitle Accent */}
        <p className="text-xs sm:text-sm font-extrabold text-[#B8860B] tracking-widest uppercase flex items-center justify-center gap-2">
          <span>◆</span>
          <span>
            {lang === 'km'
              ? 'ជ្រើសរើសកញ្ចប់ទិញ $15 ឬ $35 ដើម្បីទទួលបាន Activation Code បង្កើតធៀបការ'
              : 'Select $15 or $35 Package to get Activation Code'}
          </span>
          <span>◆</span>
        </p>

        {/* Main Title with Gold Gradient Shimmer */}
        <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight max-w-5xl mx-auto ${lang === 'km' ? 'font-moul' : 'font-playfair'}`}>
          <span className="bg-gradient-to-r from-[#7A5B1E] via-[#B8860B] to-[#D4AF37] bg-clip-text text-transparent drop-shadow-sm">
            {lang === 'km'
              ? 'បង្កើតធៀបការអេឡិចត្រូនិកយ៉ាងស្រស់ស្អាត'
              : 'Beautiful Wedding E-Invitations'}
          </span>
          <br className="hidden sm:inline" />
          <span className="text-[#2C2117]">
            {lang === 'km' ? ' ងាយស្រួល រហ័ស និងទាក់ភ្នែក' : ', Made Simple & Elegant'}
          </span>
        </h1>

        {/* Paragraph Description */}
        <p className="text-sm sm:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed font-medium">
          {lang === 'km'
            ? 'មួយតំណភ្ជាប់ (Link) ដំណើរការបានល្អលើគ្រប់ប្រភេទទូរស័ព្ទ។ បង្កើតធៀបការមង្គលការ បញ្ចូលរូបថត Gallery 10 សន្លឹក, ទីតាំង Google Maps, បទភ្លេងការ និងប្រអប់ចងដៃ ABA QR Code យ៉ាងប្រណីត!'
            : 'One link that works on every phone. Pick a template, add your details, gallery photos, ABA blessing box, and share with your guests instantly.'}
        </p>

        {/* Call-to-action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
          {/* Live Demo Preview Button */}
          <button
            onClick={() => onNavigate('demo')}
            className="px-7 py-3.5 rounded-full bg-white border-2 border-amber-300/90 text-stone-800 font-extrabold text-xs sm:text-sm shadow-md hover:bg-amber-50 hover:border-amber-400 hover:shadow-lg transition-all flex items-center gap-2.5 active:scale-95 cursor-pointer"
          >
            <Smartphone className="w-4 h-4 text-amber-700 animate-bounce" />
            <span>{lang === 'km' ? 'មើលគំរូ Demo ផ្សាយផ្ទាល់' : 'View Live Mobile Demo'}</span>
          </button>

          {/* Pricing Scroll CTA */}
          <button
            onClick={() => {
              const el = document.getElementById('pricing-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#B8860B] via-amber-500 to-[#8C6D3B] text-white font-extrabold text-xs sm:text-sm shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 border border-amber-200 cursor-pointer"
          >
            <Tag className="w-4 h-4 text-yellow-200" />
            <span>{lang === 'km' ? 'ជ្រើសរើសកញ្ចប់ទិញ ($15 / $35)' : 'Select Package ($15 / $35)'}</span>
          </button>

          {/* Studio Launcher if unlocked */}
          {unlockedPackage && (
            <button
              onClick={() => onNavigate('builder')}
              className="px-7 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-xl hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Wand2 className="w-4 h-4 text-yellow-200 animate-spin" />
              <span>{lang === 'km' ? 'ចូលប្រព័ន្ធបង្កើត Studio' : 'Launch Studio Builder'}</span>
            </button>
          )}
        </div>

        {/* Quick Member Login Prompt */}
        <div className="pt-2 text-xs font-semibold text-stone-500 flex items-center justify-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span>
            {lang === 'km'
              ? 'ទិញកញ្ចប់រួចហើយ? សូមចូលគណនីរបស់អ្នកដើម្បីវាយបញ្ចូល Activation Code បើក Studio →'
              : 'Purchased already? Please log in to enter your Activation Code →'}
          </span>
        </div>

        {/* ================= TRUST METRICS COUNTER BAR ================= */}
        <div className="pt-4 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-center">
          <div className="p-3.5 rounded-2xl bg-white/80 border border-amber-200/80 shadow-sm backdrop-blur-sm">
            <div className="text-lg sm:text-2xl font-black text-[#B8860B]">5,000+</div>
            <div className="text-[11px] text-stone-600 font-bold">{lang === 'km' ? 'ធៀបការបានបង្កើត' : 'Invitations Created'}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/80 border border-amber-200/80 shadow-sm backdrop-blur-sm">
            <div className="text-lg sm:text-2xl font-black text-[#B8860B]">100%</div>
            <div className="text-[11px] text-stone-600 font-bold">{lang === 'km' ? 'គាំទ្រគ្រប់ទូរស័ព្ទ' : 'Mobile Compatible'}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/80 border border-amber-200/80 shadow-sm backdrop-blur-sm">
            <div className="text-lg sm:text-2xl font-black text-[#B8860B]">4.9 / 5.0</div>
            <div className="text-[11px] text-stone-600 font-bold">{lang === 'km' ? 'ការពេញចិត្ត' : 'Guest Satisfaction'}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/80 border border-amber-200/80 shadow-sm backdrop-blur-sm">
            <div className="text-lg sm:text-2xl font-black text-[#B8860B]">24 / 7</div>
            <div className="text-[11px] text-stone-600 font-bold">{lang === 'km' ? 'ជំនួយតាម Telegram' : 'Live Telegram Support'}</div>
          </div>
        </div>

        {/* ================= HERO PHONE PREVIEW FRAME WITH FLOATING CHIPS ================= */}
        <div className="pt-8 flex justify-center relative max-w-2xl mx-auto">
          {/* Floating Feature Badges around Phone */}
          <div className="hidden md:flex absolute top-16 -left-8 z-30 px-3.5 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-amber-300 shadow-xl items-center gap-2 animate-bounce">
            <Music className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-stone-800">{lang === 'km' ? '🎵 តន្ត្រីការអម' : 'Wedding Music'}</span>
          </div>

          <div className="hidden md:flex absolute top-40 -right-8 z-30 px-3.5 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-amber-300 shadow-xl items-center gap-2 animate-bounce delay-300">
            <Gift className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-stone-800">{lang === 'km' ? '🎁 ប្រអប់ចងដៃ ABA' : 'ABA Cash Blessing'}</span>
          </div>

          <div className="hidden md:flex absolute bottom-28 -left-12 z-30 px-3.5 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-amber-300 shadow-xl items-center gap-2 animate-bounce delay-500">
            <Calendar className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-stone-800">{lang === 'km' ? '📍 Google Maps & ថ្ងៃខែ' : 'Maps & Calendar'}</span>
          </div>

          {/* Golden Glow Backdrop */}
          <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-3xl -z-10" />

          {/* Smartphone Bezel */}
          <div className="relative w-full max-w-[360px] h-[680px] rounded-[48px] bg-stone-900 p-3 shadow-2xl border-4 border-stone-800 ring-2 ring-amber-500/30 overflow-hidden group">
            {/* Camera Notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-28 h-4 bg-stone-900 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-stone-800 border border-stone-700" />
            </div>

            {/* Smartphone Live Preview Screen */}
            <div className="w-full h-full rounded-[38px] overflow-hidden bg-white relative">
              <ErrorBoundary>
                <InvitationCard data={sampleInvitation} />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PRICING PACKAGES SECTION ================= */}
      <PricingSection lang={lang} onSelectPackage={onSelectPackage} />

      {/* ================= FEATURES HIGHLIGHT GRID ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold text-[#B8860B] uppercase tracking-widest px-3 py-1 rounded-full bg-amber-100 border border-amber-200">
            {lang === 'km' ? 'មុខងារពិសេសៗ' : 'Key Platform Features'}
          </span>
          <h2 className={`text-2xl sm:text-4xl font-extrabold text-stone-900 ${lang === 'km' ? 'font-moul' : 'font-playfair'}`}>
            {lang === 'km' ? 'ហេតុអ្វីជ្រើសរើស មង្គលការ (MongkulKar)?' : 'Why Choose Our E-Invitation System?'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="p-6 bg-white/90 backdrop-blur-md rounded-3xl border border-amber-200/90 shadow-md hover:shadow-xl hover:border-amber-400 transition-all space-y-3.5 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-100 to-amber-200 text-[#B8860B] flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <Wand2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-stone-900">
              {lang === 'km' ? 'បណ្តុំ Template បែបខ្មែរប្រណីត' : 'Stunning Khmer Templates'}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              {lang === 'km'
                ? 'រចនាបថគំរូជាច្រើនដូចជា ក្លោងទ្វារមាសបុរាណ ផ្កាកុលាប ពណ៌បៃតងត្បូងមរកត និងប្រាសាទអង្គរវត្ត។'
                : 'Choose from traditional royal gold arches, floral rose romance, emerald royal palace, and Angkor themes.'}
            </p>
          </div>

          <div className="p-6 bg-white/90 backdrop-blur-md rounded-3xl border border-amber-200/90 shadow-md hover:shadow-xl hover:border-amber-400 transition-all space-y-3.5 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-100 to-amber-200 text-[#B8860B] flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <Gift className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-stone-900">
              {lang === 'km' ? 'ប្រអប់ចងដៃ ABA & សារជូនពរ' : 'ABA Cash Blessing & Guestbook'}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              {lang === 'km'
                ? 'ភ្ញៀវកិត្តិយសអាចចងដៃតាម ABA / Bank QR Code និងផ្ញើសារជូនពរអបអរសាទរបានភ្លាមៗ។'
                : 'Integrated ABA Bank QR code blessing box and guestbook for warm wishes.'}
            </p>
          </div>

          <div className="p-6 bg-white/90 backdrop-blur-md rounded-3xl border border-amber-200/90 shadow-md hover:shadow-xl hover:border-amber-400 transition-all space-y-3.5 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-100 to-amber-200 text-[#B8860B] flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <Music className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-stone-900">
              {lang === 'km' ? 'តន្ត្រី & ប្រកាសទិន្នទិនក្នុងខែ' : 'Music & Calendar RSVP'}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              {lang === 'km'
                ? 'បទភ្លេងការរំភើបចិត្ត កាលបរិច្ឆេទចន្ទគតិខ្មែរ និងប៊ូតុងរក្សាទុកក្នុង Google Calendar។'
                : 'Background wedding music player, Khmer lunar calendar, and Google Calendar syncing.'}
            </p>
          </div>
        </div>
      </section>

      {/* ================= TEMPLATES SHOWCASE SECTION ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-amber-50/60 p-6 sm:p-10 rounded-3xl border border-amber-200/80 shadow-sm space-y-8">
        <TemplatePicker
          selectedId={sampleInvitation.templateId}
          onSelectTemplate={(id) => {
            onSelectTemplate(id);
            if (unlockedPackage) {
              onNavigate('builder');
            } else {
              onOpenMemberLogin();
            }
          }}
          onPreviewTemplate={onPreviewTemplate}
          lang={lang}
        />
      </section>

      {/* ================= FAQ ACCORDION ================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold text-[#B8860B] uppercase tracking-widest px-3 py-1 rounded-full bg-amber-100 border border-amber-200">
            {lang === 'km' ? 'សំណួរដែលសួរញឹកញាប់' : 'Got Questions?'}
          </span>
          <h2 className={`text-2xl sm:text-3xl font-extrabold text-stone-900 ${lang === 'km' ? 'font-moul' : 'font-playfair'}`}>
            {lang === 'km' ? 'សំណួរ និងចម្លើយ (FAQ)' : 'Frequently Asked Questions'}
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isExpanded = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-amber-200/90 overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isExpanded ? null : idx)}
                  className="w-full p-5 text-left font-bold text-sm text-stone-800 flex items-center justify-between gap-4 hover:bg-amber-50/50 transition-colors"
                >
                  <span>{lang === 'km' ? faq.qKm : faq.qEn}</span>
                  {isExpanded ? <ChevronDown className="w-5 h-5 text-amber-700 rotate-180 transition-transform" /> : <ChevronDown className="w-5 h-5 text-stone-400 transition-transform" />}
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-3">
                    {lang === 'km' ? faq.aKm : faq.aEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
