import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, Phone, Mail, MapPin } from 'lucide-react';
import { getSystemConfig, SystemConfig } from '../utils/systemConfig';

interface FooterProps {
  lang: 'km' | 'en';
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  const [sysConfig, setSysConfig] = useState<SystemConfig>(() => getSystemConfig());

  useEffect(() => {
    const handleUpdate = () => {
      setSysConfig(getSystemConfig());
    };
    window.addEventListener('system-config-updated', handleUpdate);
    return () => window.removeEventListener('system-config-updated', handleUpdate);
  }, []);

  return (
    <footer className="bg-[#1C1714] text-[#E8DFC2] border-t border-amber-900/40 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              {sysConfig.logoUrl && sysConfig.logoUrl.trim() !== '' ? (
                <img
                  src={sysConfig.logoUrl}
                  alt="System Logo"
                  className="w-8 h-8 rounded-xl object-cover border border-amber-400/50"
                />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-[#B8860B] flex items-center justify-center text-white">
                  <Heart className="w-4 h-4 fill-white" />
                </div>
              )}
              <span className="font-moul text-lg text-amber-200">
                {lang === 'km' ? (sysConfig.systemNameKm || 'មង្គលការ') : (sysConfig.systemNameEn || 'MongkulKar')}
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed max-w-md">
              {lang === 'km'
                ? (sysConfig.taglineKm || 'ប្រព័ន្ធបង្កើតធៀបការអេឡិចត្រូនិក និងកាតអាពាហ៍ពិពាហ៍ឌីជីថលបែបខ្មែរទាន់សម័យ ងាយស្រួល ចែករំលែករហ័សតាមទូរស័ព្ទដៃ និងបណ្តាញសង្គម។')
                : (sysConfig.taglineEn || 'Beautiful Cambodian Digital Wedding E-Invitations made effortless, fast, and shareable across all smartphones.')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-amber-300 uppercase tracking-widest text-[11px]">
              {lang === 'km' ? 'តំណភ្ជាប់រហ័ស' : 'Quick Navigation'}
            </h4>
            <ul className="space-y-1.5 text-stone-300">
              <li>{lang === 'km' ? 'គំរូ Template ទាំងអស់' : 'All Templates'}</li>
              <li>{lang === 'km' ? 'របៀបបង្កើតធៀបការ' : 'How It Works'}</li>
              <li>{lang === 'km' ? 'តម្លៃ និងកញ្ចប់សេវាកម្ម' : 'Pricing Plans'}</li>
              <li>{lang === 'km' ? 'សំណួរញឹកញាប់ (FAQ)' : 'FAQ'}</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-amber-300 uppercase tracking-widest text-[11px]">
              {lang === 'km' ? 'ទំនាក់ទំនង' : 'Contact Support'}
            </h4>
            <div className="space-y-1.5 text-stone-300">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <a
                  href="https://t.me/laymeancamera"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-300 transition-colors underline font-medium"
                >
                  Telegram: @laymeancamera
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>support@mongkulkar.com</span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Phnom Penh, Cambodia</span>
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-800 text-center text-[11px] text-stone-500">
          <p>© 2026 មង្គលការ (MongkulKar). All Rights Reserved. Crafted with love for Cambodian Couples.</p>
        </div>
      </div>
    </footer>
  );
};
