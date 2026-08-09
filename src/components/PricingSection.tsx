import React from 'react';
import { Sparkles, CheckCircle2, ShieldCheck, Zap, HeartHandshake } from 'lucide-react';
import { PackageTier } from '../types';

interface PricingSectionProps {
  lang: 'km' | 'en';
  onSelectPackage: (tier: PackageTier) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ lang, onSelectPackage }) => {
  return (
    <section id="pricing-section" className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Section Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/80 border border-amber-300 text-[#8C6D3B] text-xs font-extrabold shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>{lang === 'km' ? 'កញ្ចប់សេវាកម្មប្រព័ន្ធ E-Invite' : 'E-Invite Pricing Plans'}</span>
        </div>
        <h2 className={`text-2xl sm:text-4xl font-extrabold text-[#2C2117] ${lang === 'km' ? 'font-moul' : 'font-playfair'}`}>
          {lang === 'km' ? 'ជ្រើសរើសកញ្ចប់បង្កើតធៀបការមង្គលការ' : 'Choose Your E-Invitation Package'}
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          {lang === 'km'
            ? 'ទិញតែម្តងប្រើប្រាស់បានរហូតពេញមួយកម្មវិធីអាពាហ៍ពិពាហ៍! គ្មានតម្លៃលាក់កំបាំង ផ្ញើទៅភ្ញៀវបានមិនកំណត់។'
            : 'Pay once for your wedding event! No hidden fees, share with unlimited guests.'}
        </p>
      </div>

      {/* Grid of 2 Package Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
        {/* ========== OPTION 1: $15 PACKAGE ========== */}
        <div className="relative bg-white rounded-3xl border-2 border-stone-200 hover:border-amber-400 p-8 shadow-md hover:shadow-xl transition-all flex flex-col justify-between space-y-6 group">
          <div className="space-y-6">
            {/* Header Badge & Price */}
            <div className="flex items-start justify-between border-b border-stone-100 pb-5">
              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full bg-amber-100 text-[#8C6D3B] text-[11px] font-extrabold tracking-wide">
                  {lang === 'km' ? 'កញ្ចប់ស្តង់ដារ (Standard)' : 'Standard Package'}
                </span>
                <h3 className="text-xl font-bold text-stone-900 mt-2">
                  {lang === 'km' ? 'កញ្ចប់ 15$' : '$15 Package'}
                </h3>
                <p className="text-xs text-stone-500">
                  {lang === 'km' ? 'ល្អឥតខ្ចោះសម្រាប់ធៀបការទូទៅ' : 'Perfect for classic digital wedding invitations'}
                </p>
              </div>

              <div className="text-right">
                <div className="flex items-baseline gap-0.5 text-[#B8860B]">
                  <span className="text-2xl font-bold">$</span>
                  <span className="text-4xl font-extrabold tracking-tight">15</span>
                </div>
                <span className="text-[10px] text-stone-400 font-medium">
                  {lang === 'km' ? 'ទិញដាច់ / មួយកម្មវិធី' : 'One-time payment'}
                </span>
              </div>
            </div>

            {/* Feature Bullet Points */}
            <div className="space-y-3.5">
              <p className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                {lang === 'km' ? 'មុខងារដែលទទួលបានរួមមាន៖' : 'Package Included Features:'}
              </p>

              <ul className="space-y-3 text-xs text-stone-700">
                <li className="flex items-start gap-2.5">
                  <span className="text-base leading-none">🎨</span>
                  <span className="font-semibold">
                    {lang === 'km' ? 'គំរូប្រណីតជាង ១៦ ប្រភេទ' : 'Over 16+ Premium Templates'}
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="text-base leading-none">🇰🇭</span>
                  <span>
                    {lang === 'km' ? 'ពីរភាសា (ខ្មែរ និង អង់គ្លេស)' : 'Bilingual Support (Khmer & English)'}
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="text-base leading-none">📸</span>
                  <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {lang === 'km' ? 'ដាក់រូបថតបានរហូតដល់ ៥ សន្លឹក' : 'Upload Up To 5 Photos in Gallery'}
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="text-base leading-none">🎵</span>
                  <span>{lang === 'km' ? 'តន្ត្រីចម្រៀងការមង្គល' : 'Wedding Background Music'}</span>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="text-base leading-none">📍</span>
                  <span>{lang === 'km' ? 'ផែនទី Google Maps ទីតាំងពិធី' : 'Google Maps Venue Location'}</span>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="text-base leading-none">⏳</span>
                  <span>{lang === 'km' ? 'Countdown រាប់ថយក្រោយដល់ថ្ងៃការ' : 'Live Countdown Event Timer'}</span>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="text-base leading-none">🎁</span>
                  <span>{lang === 'km' ? 'ចំណងដៃឌីជីថល (ABA KHQR)' : 'Digital Cash Blessing (ABA KHQR)'}</span>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="text-base leading-none">👥</span>
                  <span>{lang === 'km' ? 'ឈ្មោះភ្ញៀវ ជាមួយលីងផ្ទាល់ខ្លួន' : 'Personalized Guest Name Links'}</span>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="text-base leading-none">📲</span>
                  <span>{lang === 'km' ? 'ចែករំលែកទៅភ្ញៀវគ្មានដែនកំណត់' : 'Unlimited Guest Sharing'}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Buy CTA Button */}
          <button
            onClick={() => onSelectPackage('15')}
            className="w-full py-3.5 px-6 rounded-2xl bg-stone-900 hover:bg-[#B8860B] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>{lang === 'km' ? 'ទិញកញ្ចប់ 15$ ឥឡូវនេះ' : 'Buy $15 Package Now'}</span>
          </button>
        </div>

        {/* ========== OPTION 2: $35 PACKAGE (POPULAR / PREMIUM) ========== */}
        <div className="relative bg-gradient-to-b from-amber-50/90 via-white to-amber-50/60 rounded-3xl border-2 border-amber-400 p-8 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between space-y-6 group">
          {/* Most Popular Badge */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#B8860B] via-amber-500 to-[#8C6D3B] text-white text-[11px] font-black uppercase tracking-widest shadow-md flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-200 animate-spin" />
            <span>{lang === 'km' ? 'កញ្ចប់ពេញនិយមបំផុត (VIP)' : 'Most Popular Choice'}</span>
          </div>

          <div className="space-y-6 pt-2">
            {/* Header Badge & Price */}
            <div className="flex items-start justify-between border-b border-amber-200 pb-5">
              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-[11px] font-extrabold tracking-wide shadow-sm">
                  {lang === 'km' ? 'កញ្ចប់ប្រណីត (Premium VIP)' : 'Premium VIP Package'}
                </span>
                <h3 className="text-xl font-bold text-stone-900 mt-2">
                  {lang === 'km' ? 'កញ្ចប់ 35$' : '$35 Package'}
                </h3>
                <p className="text-xs text-stone-600">
                  {lang === 'km' ? 'គ្រប់គ្រងមុខងារពេញលេញ រូបថត ១០ សន្លឹក និងកត់ត្រាប្រតិទិន' : 'Full luxury feature set with 10 gallery photos'}
                </p>
              </div>

              <div className="text-right">
                <div className="flex items-baseline gap-0.5 text-[#B8860B]">
                  <span className="text-2xl font-bold">$</span>
                  <span className="text-5xl font-extrabold tracking-tight">35</span>
                </div>
                <span className="text-[10px] text-stone-500 font-semibold">
                  {lang === 'km' ? 'ទិញដាច់ / មួយកម្មវិធី' : 'One-time payment'}
                </span>
              </div>
            </div>

            {/* Feature Bullet Points */}
            <div className="space-y-3.5">
              <p className="text-xs font-bold text-[#8C6D3B] uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                <span>{lang === 'km' ? 'មុខងារពិសេស VIP រួមមាន៖' : 'Full VIP Package Features:'}</span>
              </p>

              <ul className="space-y-3 text-xs text-stone-800">
                <li className="flex items-start gap-2.5 font-bold text-amber-900">
                  <span className="text-base leading-none">🎨</span>
                  <span>
                    {lang === 'km' ? 'គំរូប្រណីតជាង ១៦ ប្រភេទ' : 'Over 16+ Premium Templates'}
                  </span>
                </li>

                <li className="flex items-start gap-2.5 font-bold text-amber-900">
                  <span className="text-base leading-none">✨</span>
                  <span className="bg-amber-200/80 px-2 py-0.5 rounded border border-amber-300">
                    {lang === 'km' ? 'រចនាបថច្រើនបែបថែមទៀត (Extended Styles)' : 'Extended Special Customization Styles'}
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="text-base leading-none">🇰🇭</span>
                  <span>
                    {lang === 'km' ? 'ពីរភាសា (ខ្មែរ និង អង់គ្លេស)' : 'Bilingual Support (Khmer & English)'}
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="text-base leading-none">📸</span>
                  <span className="font-extrabold text-[#8C6D3B] bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                    {lang === 'km' ? 'ដាក់រូបថតបានរហូតដល់ ១០ សន្លឹក (Max 10 Photos)' : 'Upload Up To 10 Gallery Photos'}
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="text-base leading-none">🎵</span>
                  <span>{lang === 'km' ? 'តន្ត្រីចម្រៀងការមង្គល' : 'Wedding Background Music'}</span>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="text-base leading-none">📍</span>
                  <span>{lang === 'km' ? 'ផែនទី Google Maps' : 'Google Maps Location'}</span>
                </li>

                <li className="flex items-start gap-2.5 font-bold text-amber-900">
                  <span className="text-base leading-none">📅</span>
                  <span className="bg-amber-200/80 px-2 py-0.5 rounded border border-amber-300">
                    {lang === 'km' ? 'កត់ចំណាំក្នុងប្រតិទិន (Google Calendar Reminders)' : 'Calendar Add Reminder Feature'}
                  </span>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="text-base leading-none">⏳</span>
                  <span>{lang === 'km' ? 'Countdown រាប់ថយក្រោយ' : 'Live Countdown Timer'}</span>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="text-base leading-none">🎁</span>
                  <span>{lang === 'km' ? 'ចំណងដៃឌីជីថល (ABA KHQR)' : 'Digital Cash Blessing (ABA KHQR)'}</span>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="text-base leading-none">👥</span>
                  <span>{lang === 'km' ? 'ឈ្មោះភ្ញៀវ ជាមួយលីងផ្ទាល់ខ្លួន' : 'Personalized Guest Name Links'}</span>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="text-base leading-none">📲</span>
                  <span>{lang === 'km' ? 'ចែករំលែកទៅភ្ញៀវគ្មានដែនកំណត់' : 'Unlimited Guest Sharing'}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Buy CTA Button */}
          <button
            onClick={() => onSelectPackage('35')}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#B8860B] via-amber-500 to-[#8C6D3B] text-white font-extrabold text-xs shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-yellow-200" />
            <span>{lang === 'km' ? 'ទិញកញ្ចប់ 35$ VIP ឥឡូវនេះ' : 'Buy $35 VIP Package Now'}</span>
          </button>
        </div>
      </div>

      {/* Security & Guarantee Guarantee Footer */}
      <div className="max-w-3xl mx-auto p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-center flex flex-wrap items-center justify-center gap-6 text-xs text-stone-600 font-medium">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{lang === 'km' ? 'ការទូទាត់ប្រាក់មានសុវត្ថិភាព ABA KHQR' : 'Secure ABA KHQR Payment'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-600" />
          <span>{lang === 'km' ? 'អនុម័តកូដបង្កើត Studio យ៉ាងរហ័ស' : 'Fast Studio Activation Code Delivery'}</span>
        </div>
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-4 h-4 text-amber-700" />
          <span>{lang === 'km' ? 'គាំទ្រអតិថិជន ២៤/៧' : '24/7 Customer Support'}</span>
        </div>
      </div>
    </section>
  );
};
