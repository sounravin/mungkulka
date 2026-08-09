import React, { useState, useEffect } from 'react';
import { TemplateId, TemplateTheme } from '../types';
import { getAllTemplates, fetchCustomTemplates } from '../utils/templateManager';
import { Check, Eye, Sparkles, Wand2 } from 'lucide-react';

interface TemplatePickerProps {
  selectedId: TemplateId;
  onSelectTemplate: (templateId: TemplateId) => void;
  onPreviewTemplate?: (template: TemplateTheme) => void;
  lang: 'km' | 'en';
}

export const TemplatePicker: React.FC<TemplatePickerProps> = ({
  selectedId,
  onSelectTemplate,
  onPreviewTemplate,
  lang,
}) => {
  const [templates, setTemplates] = useState<TemplateTheme[]>(() => getAllTemplates());

  useEffect(() => {
    fetchCustomTemplates().then(() => {
      setTemplates(getAllTemplates());
    });

    const handleUpdate = () => {
      setTemplates(getAllTemplates());
    };

    window.addEventListener('templates-updated', handleUpdate);
    return () => window.removeEventListener('templates-updated', handleUpdate);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-200/60 pb-4">
        <div>
          <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-widest mb-1">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>{lang === 'km' ? 'បណ្តុំ Template ធៀបការ' : 'Wedding Invitation Templates'}</span>
          </div>
          <h2 className={`text-xl font-bold text-stone-800 ${lang === 'km' ? 'font-moul' : 'font-playfair'}`}>
            {lang === 'km' ? 'ជ្រើសរើសរចនាបថធៀបមង្គលការ' : 'Choose Your Wedding Style'}
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            {lang === 'km'
              ? 'រចនាបថគំរូដ៏ស្រស់ស្អាតប្រកបដោយប្រណីតភាព និងអត្ថន័យសិរីមង្គល'
              : 'Handcrafted themes honoring Cambodian tradition and modern elegance'}
          </p>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((tmpl) => {
          const isSelected = tmpl.id === selectedId;

          return (
            <div
              key={tmpl.id}
              className={`group relative rounded-3xl overflow-hidden border-2 transition-all duration-300 bg-white flex flex-col justify-between shadow-sm hover:shadow-xl ${
                isSelected
                  ? 'border-[#B8860B] ring-4 ring-amber-100'
                  : 'border-stone-200 hover:border-amber-300'
              }`}
            >
              {/* Badge Tag */}
              <div className="absolute top-3 left-3 z-10 flex gap-1">
                <span className="px-3 py-1 rounded-full bg-stone-900/80 backdrop-blur-md text-amber-300 font-bold text-[10px] uppercase tracking-wider border border-amber-400/30 shadow-md">
                  {tmpl.badge}
                </span>
                {tmpl.isCustom && (
                  <span className="px-2 py-1 rounded-full bg-blue-600/90 text-white font-bold text-[9px] uppercase tracking-wider shadow-md">
                    ZIP CUSTOM
                  </span>
                )}
              </div>

              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-[#B8860B] text-white flex items-center justify-center shadow-lg">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              )}

              {/* Thumbnail Container */}
              <div
                onClick={() => (onPreviewTemplate ? onPreviewTemplate(tmpl) : onSelectTemplate(tmpl.id))}
                className="relative h-56 w-full overflow-hidden bg-stone-100 cursor-pointer group-hover:opacity-95"
              >
                <img
                  src={tmpl.previewImage || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'}
                  alt={tmpl.nameEn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent opacity-80" />

                {/* Overlaid Title */}
                <div className="absolute bottom-3 left-4 right-4 text-white space-y-0.5">
                  <h3 className={`text-base font-bold text-amber-200 ${lang === 'km' ? 'font-moul' : 'font-playfair'}`}>
                    {lang === 'km' ? tmpl.nameKm : tmpl.nameEn}
                  </h3>
                  <p className="text-[11px] text-stone-200 line-clamp-1">
                    {lang === 'km' ? tmpl.taglineKm : tmpl.taglineEn}
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 bg-stone-50/80 border-t border-stone-100 flex items-center gap-2">
                <button
                  onClick={() => onSelectTemplate(tmpl.id)}
                  className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#B8860B] text-white shadow-md'
                      : 'bg-stone-800 text-stone-100 hover:bg-[#8C6D3B]'
                  }`}
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>
                    {isSelected
                      ? lang === 'km' ? 'កំពុងប្រកាសប្រើ' : 'Currently Active'
                      : lang === 'km' ? 'ជ្រើសរើស Template នេះ' : 'Select This Template'}
                  </span>
                </button>

                {onPreviewTemplate && (
                  <button
                    onClick={() => onPreviewTemplate(tmpl)}
                    className="p-2.5 rounded-2xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 transition-colors"
                    title={lang === 'km' ? 'មើលគំរូ' : 'Preview'}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
