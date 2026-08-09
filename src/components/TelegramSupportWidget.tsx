import React, { useState } from 'react';
import { Send, X, MessageCircle, ExternalLink } from 'lucide-react';

interface TelegramSupportWidgetProps {
  lang: 'km' | 'en';
}

export const TelegramSupportWidget: React.FC<TelegramSupportWidgetProps> = ({ lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const telegramUsername = 'laymeancamera';
  const telegramUrl = `https://t.me/${telegramUsername}`;

  return (
    <>
      {/* FLOATING ACTION BUTTON (BOTTOM RIGHT) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 group">
        {/* Hover / Hint Tooltip */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-stone-200 text-[11px] font-bold text-stone-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{lang === 'km' ? 'ជំនួយតាម Telegram' : 'Telegram Support'}</span>
        </div>

        {/* Floating Circle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 rounded-full bg-[#4E7C59] hover:bg-[#3D6346] text-white shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 ring-4 ring-white/80"
          title="Telegram Support"
          aria-label="Telegram Support"
        >
          {isOpen ? (
            <X className="w-6 h-6 transition-transform duration-200 rotate-90" />
          ) : (
            <div className="relative">
              {/* Paperplane Telegram Icon */}
              <Send className="w-6 h-6 transform -rotate-12 translate-x-[1px] translate-y-[-1px]" />
              {/* Pulse Badge Dot */}
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#4E7C59] animate-ping" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#4E7C59]" />
            </div>
          )}
        </button>
      </div>

      {/* SUPPORT POPUP CARD MODAL (Matching User Image Exact Design) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          {/* Backdrop Click to Close */}
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

          <div className="relative bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl border border-stone-100 text-center space-y-4 animate-scaleUp z-10">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Top Green Circle Icon with Telegram Paper Plane */}
            <div className="w-16 h-16 rounded-full bg-[#4E7C59] flex items-center justify-center text-white mx-auto shadow-md">
              <Send className="w-8 h-8 transform -rotate-12 translate-x-[2px] translate-y-[-2px]" />
            </div>

            {/* Subtitle in Green Italic */}
            <div className="text-[#4E7C59] italic text-sm font-medium">
              {lang === 'km' ? 'យើងនៅទីនេះ' : 'We are here for you'}
            </div>

            {/* Main Header Title */}
            <h3 className="font-moul text-xl text-stone-900 tracking-wide leading-snug">
              {lang === 'km' ? 'ត្រូវការជំនួយមែនទេ?' : 'Need Any Help?'}
            </h3>

            {/* Paragraph Text */}
            <p className="text-xs text-stone-600 leading-relaxed max-w-xs mx-auto font-kantumruy">
              {lang === 'km'
                ? 'តើអ្នកមានចម្ងល់អំពីការបង្កើត ឬត្រូវការជំនួយបច្ចេកទេសមែនទេ? អាចទាក់ទងមកយើងខ្ញុំបានតាមរយៈ Telegram — យើងរីករាយនឹងជួយអ្នកជានិច្ច!'
                : 'Have questions about creating invitations or need technical support? Contact us on Telegram — we are always happy to help!'}
            </p>

            {/* Direct Chat Button */}
            <div className="pt-2">
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 rounded-full bg-[#4E7C59] hover:bg-[#3D6346] active:bg-[#325239] text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2.5 group"
              >
                <Send className="w-4 h-4 transform -rotate-12 group-hover:translate-x-0.5 transition-transform" />
                <span>
                  {lang === 'km' ? 'Chat ទាក់ទងតាម Telegram' : 'Chat on Telegram'}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-white/80 ml-0.5" />
              </a>
            </div>

            {/* Subtext */}
            <p className="text-[11px] text-stone-400 font-medium pt-1">
              @{telegramUsername} · {lang === 'km' ? 'ឆ្លើយតបយ៉ាងឆាប់រហ័សក្នុងរយៈពេលប៉ុន្មានម៉ោង' : 'Usually replies within a few hours'}
            </p>
          </div>
        </div>
      )}
    </>
  );
};
