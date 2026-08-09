import React, { useState, useRef } from 'react';
import {
  User,
  Calendar,
  MapPin,
  Clock,
  Music,
  Gift,
  Layout,
  Plus,
  Trash2,
  Save,
  Eye,
  Sparkles,
  CheckCircle2,
  Share2,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  Upload,
  Film,
  Check,
  LogOut,
  Palette,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Smartphone
} from 'lucide-react';
import { WeddingInvitationData, TemplateId, ScheduleItem, UnlockedPackage } from '../types';
import { SAMPLE_INVITATIONS } from '../data/presetInvitations';
import { TemplatePicker } from './TemplatePicker';
import { InvitationCard } from './InvitationCard';
import { ErrorBoundary } from './ErrorBoundary';
import { compressImage } from '../utils/imageCompressor';

interface InvitationBuilderProps {
  data: WeddingInvitationData;
  onChange: (newData: WeddingInvitationData) => void;
  lang: 'km' | 'en';
  onPreviewFullscreen: () => void;
  unlockedPackage?: UnlockedPackage | null;
  onLogout?: () => void;
}

export const InvitationBuilder: React.FC<InvitationBuilderProps> = ({
  data,
  onChange,
  lang,
  onPreviewFullscreen,
  unlockedPackage,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'couple' | 'gallery' | 'event' | 'templates' | 'schedule' | 'gift'>('couple');
  const [isSaved, setIsSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [customGuestName, setCustomGuestName] = useState('');
  const [copiedGeneral, setCopiedGeneral] = useState(false);
  const [copiedPersonal, setCopiedPersonal] = useState(false);
  const [newUrlInput, setNewUrlInput] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [phoneResetKey, setPhoneResetKey] = useState(0);

  const scrollTabsRef = useRef<HTMLDivElement>(null);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (scrollTabsRef.current) {
      const scrollAmount = 180;
      scrollTabsRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Helper updates
  const updateField = (field: keyof WeddingInvitationData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const updateParents = (parentField: keyof WeddingInvitationData['parents'], value: string) => {
    onChange({
      ...data,
      parents: { ...data.parents, [parentField]: value },
    });
  };

  const updateBank = (bankField: keyof WeddingInvitationData['bankBlessing'], value: string) => {
    onChange({
      ...data,
      bankBlessing: { ...data.bankBlessing, [bankField]: value },
    });
  };

  const MAX_PHOTOS = unlockedPackage?.maxPhotos || (unlockedPackage?.packageType === '15' ? 5 : 10);


  // Photo Upload Handler - Compresses HD Images & Saves to Cloud
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentGallery = data.galleryPhotos || [];
    const hasSampleImages = currentGallery.some((url) => url.includes('images.unsplash.com'));
    const effectiveGallery = hasSampleImages ? [] : currentGallery;

    if (effectiveGallery.length >= MAX_PHOTOS) {
      setUploadError(
        lang === 'km'
          ? `លោកអ្នកបាន Upload រូបថតគ្រប់ចំនួន ${MAX_PHOTOS} រូបរួចហើយ!`
          : `You have reached the maximum limit of ${MAX_PHOTOS} photos!`
      );
      e.target.value = '';
      return;
    }

    const availableSlots = MAX_PHOTOS - effectiveGallery.length;
    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      if (validFiles.length >= availableSlots) {
        setUploadError(
          lang === 'km'
            ? `អាចបន្ថែមបានត្រឹមតែ ${availableSlots} រូបទៀតប៉ុណ្ណោះ ដើម្បីគ្រប់ចំនួន ${MAX_PHOTOS} រូប!`
            : `Only ${availableSlots} slots remaining to reach the maximum limit of ${MAX_PHOTOS} photos!`
        );
        break;
      }
      const file = files[i];
      if (file.size > 20 * 1024 * 1024) {
        setUploadError(
          lang === 'km'
            ? `រូបថត "${file.name}" មានទំហំលើសពី 20MB! សូមជ្រើសរើសរូបភាពក្រោម 20MB`
            : `Photo "${file.name}" exceeds 20MB limit! Please choose an image under 20MB.`
        );
      } else {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) {
      e.target.value = '';
      return;
    }

    try {
      const compressedPhotos = await Promise.all(
        validFiles.map((f) => compressImage(f, 1200, 1200, 0.8))
      );

      const updatedGallery = [...compressedPhotos, ...effectiveGallery].slice(0, MAX_PHOTOS);
      const updatedCouplePhoto = compressedPhotos[0] || updatedGallery[0];
      const updatedCoverPhoto = compressedPhotos[0] || updatedGallery[0];

      const updatedData = {
        ...data,
        couplePhotoUrl: updatedCouplePhoto,
        coverPhotoUrl: updatedCoverPhoto,
        galleryPhotos: updatedGallery,
      };

      onChange(updatedData);
      await saveToCloud(updatedData);
    } catch (err) {
      console.error('Error compressing/saving photos:', err);
      setUploadError(
        lang === 'km'
          ? 'មិនអាចដំណើការរូបថតបានឡើយ! សូមព្យាយាមម្តងទៀត'
          : 'Failed to process photos! Please try again.'
      );
    }

    // Reset input
    e.target.value = '';
  };

  // Replace an individual photo directly at a specific index
  const handleReplaceSinglePhoto = async (indexToReplace: number, file: File) => {
    setUploadError(null);
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      setUploadError(
        lang === 'km'
          ? `រូបថត "${file.name}" មានទំហំលើសពី 20MB!`
          : `Photo "${file.name}" exceeds 20MB!`
      );
      return;
    }

    try {
      const compressed = await compressImage(file, 1200, 1200, 0.8);
      const currentGallery = [...(data.galleryPhotos || [])];
      const oldPhoto = currentGallery[indexToReplace];
      currentGallery[indexToReplace] = compressed;

      const isMain = data.couplePhotoUrl === oldPhoto || indexToReplace === 0;
      const updatedCouplePhoto = isMain ? compressed : data.couplePhotoUrl;
      const updatedCoverPhoto = indexToReplace === 0 ? compressed : data.coverPhotoUrl;

      const updatedData = {
        ...data,
        couplePhotoUrl: updatedCouplePhoto,
        coverPhotoUrl: updatedCoverPhoto,
        galleryPhotos: currentGallery,
      };

      onChange(updatedData);
      await saveToCloud(updatedData);
    } catch (err) {
      console.error('Error replacing single photo:', err);
    }
  };

  const handleAddPhotoUrl = () => {
    setUploadError(null);
    if (!newUrlInput.trim()) return;
    const currentGallery = data.galleryPhotos || [];
    const hasSampleImages = currentGallery.some((url) => url.includes('images.unsplash.com'));
    const effectiveGallery = hasSampleImages ? [] : currentGallery;

    if (effectiveGallery.length >= MAX_PHOTOS) {
      setUploadError(
        lang === 'km'
          ? `លោកអ្នកបាន Upload រូបថតគ្រប់ចំនួន ${MAX_PHOTOS} រូបរួចហើយ!`
          : `You have reached the maximum limit of ${MAX_PHOTOS} photos!`
      );
      return;
    }
    const url = newUrlInput.trim();
    const updatedGallery = [url, ...effectiveGallery].slice(0, MAX_PHOTOS);
    const updatedCouplePhoto = url;

    const updatedData = {
      ...data,
      couplePhotoUrl: updatedCouplePhoto,
      coverPhotoUrl: url,
      galleryPhotos: updatedGallery,
    };

    onChange(updatedData);
    saveToCloud(updatedData);
    setNewUrlInput('');
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    const currentGallery = data.galleryPhotos || [];
    const updatedGallery = currentGallery.filter((_, idx) => idx !== indexToRemove);
    const updatedCouplePhoto =
      data.couplePhotoUrl === currentGallery[indexToRemove]
        ? updatedGallery[0] || ''
        : data.couplePhotoUrl;

    const updatedData = {
      ...data,
      couplePhotoUrl: updatedCouplePhoto,
      galleryPhotos: updatedGallery,
    };

    onChange(updatedData);
    saveToCloud(updatedData);
  };

  const handleSetMainPhoto = (url: string) => {
    const updatedData = {
      ...data,
      couplePhotoUrl: url,
      coverPhotoUrl: url,
    };
    onChange(updatedData);
    saveToCloud(updatedData);
  };

  // Theme Color Swatch Helpers
  const currentThemeColors = data.themeColors || ['#A0522D', '#C59B27', '#FFD700', '#9370DB', '#DC143C'];

  const handleUpdateThemeColor = (index: number, newHex: string) => {
    const updated = [...currentThemeColors];
    updated[index] = newHex;
    onChange({ ...data, themeColors: updated });
  };

  const handleAddThemeColor = (colorHex = '#C59B27') => {
    const updated = [...currentThemeColors, colorHex];
    onChange({ ...data, themeColors: updated });
  };

  const handleRemoveThemeColor = (index: number) => {
    if (currentThemeColors.length <= 1) {
      alert(lang === 'km' ? 'ត្រូវតែមានពណ៌យ៉ាងហោចណាស់ ១!' : 'Must keep at least 1 color!');
      return;
    }
    const updated = currentThemeColors.filter((_, idx) => idx !== index);
    onChange({ ...data, themeColors: updated });
  };

  const handleApplyPresetPalette = (colors: string[]) => {
    onChange({ ...data, themeColors: colors });
  };

  // MP3 Audio File Upload Handler
  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      alert(
        lang === 'km'
          ? 'ឯកសារចម្រៀងលើសពី 25MB! សូមជ្រើសរើសឯកសារ MP3 ក្រោម 25MB'
          : 'Audio file exceeds 25MB limit! Please select an MP3 file under 25MB.'
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        const updatedData = { ...data, musicTrack: result };
        onChange(updatedData);
        saveToCloud(updatedData);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Schedule Helpers
  const addScheduleItem = (presetTitleKm?: string, presetTime?: string) => {
    const newItem: ScheduleItem = {
      id: `s-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      time: presetTime || '08:00 AM',
      titleKm: presetTitleKm || (lang === 'km' ? 'កម្មវិធីថ្មី' : 'New Program Event'),
      titleEn: presetTitleKm ? presetTitleKm : 'New Program Event',
      descriptionKm: '',
      descriptionEn: '',
    };
    onChange({ ...data, schedule: [...data.schedule, newItem] });
  };

  const updateScheduleItem = (id: string, field: keyof ScheduleItem, val: string) => {
    const updated = data.schedule.map((item) => (item.id === id ? { ...item, [field]: val } : item));
    onChange({ ...data, schedule: updated });
  };

  const removeScheduleItem = (id: string) => {
    const updated = data.schedule.filter((item) => item.id !== id);
    onChange({ ...data, schedule: updated });
  };

  const moveScheduleItem = (index: number, direction: 'up' | 'down') => {
    const newSchedule = [...data.schedule];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newSchedule.length) return;
    const temp = newSchedule[index];
    newSchedule[index] = newSchedule[targetIdx];
    newSchedule[targetIdx] = temp;
    onChange({ ...data, schedule: newSchedule });
  };

  const saveToCloud = async (invitationToSave: WeddingInvitationData) => {
    try {
      await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invitationToSave),
      });
    } catch (err) {
      console.warn('Failed to sync invitation to cloud server:', err);
    }
  };

  const copyToClipboard = async (text: string): Promise<boolean> => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn('Clipboard API error, fallback to execCommand:', err);
      }
    }

    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      console.error('Fallback copy failed:', err);
      return false;
    }
  };

  const handleSave = async () => {
    await saveToCloud(data);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleCopyLink = async () => {
    await saveToCloud(data);
    const url = `${window.location.origin}/?invite=${data.id}`;
    await copyToClipboard(url);
    setCopiedLink(true);
    setIsShareModalOpen(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-amber-200 shadow-sm mb-8">
        <div>
          <div className="flex items-center flex-wrap gap-2 text-[#B8860B] font-bold text-xs uppercase tracking-widest mb-1">
            <Sparkles className="w-4 h-4" />
            <span>{lang === 'km' ? 'ប្រព័ន្ធកែប្រែធៀបការ (Studio Editor)' : 'Wedding Invitation Studio'}</span>
            {unlockedPackage && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono text-[10px] normal-case">
                {lang === 'km' ? `កញ្ចប់ ${unlockedPackage.packageType === '35' ? 'VIP 35$' : '15$'}` : `Package $${unlockedPackage.packageType}`}
              </span>
            )}
          </div>
          <h1 className={`text-2xl font-bold text-stone-900 ${lang === 'km' ? 'font-moul' : 'font-playfair'}`}>
            {lang === 'km'
              ? `ធៀបការ៖ ${data.groomNameKm} & ${data.brideNameKm}`
              : `Invitation: ${data.groomNameEn} & ${data.brideNameEn}`}
          </h1>
          {unlockedPackage && (
            <p className="text-xs text-stone-500 mt-0.5">
              {lang === 'km'
                ? `កូដសកម្ម៖ ${unlockedPackage.activationCode} ${unlockedPackage.memberName ? `(${unlockedPackage.memberName})` : ''}`
                : `Code: ${unlockedPackage.activationCode} ${unlockedPackage.memberName ? `(${unlockedPackage.memberName})` : ''}`}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-full bg-stone-900 text-white font-bold text-xs shadow-md hover:bg-stone-800 transition-all flex items-center gap-2"
          >
            {isSaved ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? (lang === 'km' ? 'បានរក្សាទុក!' : 'Saved!') : (lang === 'km' ? 'រក្សាទុក' : 'Save Changes')}</span>
          </button>

          <button
            onClick={onPreviewFullscreen}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#B8860B] to-[#8C6D3B] text-white font-bold text-xs shadow-md hover:opacity-90 transition-all flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            <span>{lang === 'km' ? 'មើលពេញអេក្រង់' : 'Fullscreen Preview'}</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="px-4 py-2.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs hover:bg-amber-200 transition-all flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-800" />
            <span>{copiedLink ? (lang === 'km' ? 'បានចម្លង Link!' : 'Copied Link!') : (lang === 'km' ? 'ចម្លង Link' : 'Copy Share Link')}</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm(lang === 'km' ? 'តើអ្នកពិតជាចង់កំណត់ទិន្នន័យដើមឡើងវិញ (Reset Data) មែនទេ?' : 'Reset invitation data to default sample?')) {
                onChange(SAMPLE_INVITATIONS[0]);
              }
            }}
            className="px-3.5 py-2.5 rounded-full bg-red-50 border border-red-200 text-red-700 font-bold text-xs hover:bg-red-100 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title={lang === 'km' ? 'កំណត់ទិន្នន័យឡើងវិញ' : 'Reset Data'}
          >
            <RotateCcw className="w-3.5 h-3.5 text-red-600" />
            <span>{lang === 'km' ? 'Reset ទិន្នន័យ' : 'Reset Data'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Workspace: Left Control Tabs & Form + Right Phone Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Editor Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Super App Navigation Toolbar with Slide Controls */}
          <div className="relative w-full group">
            {/* Scroll Left Arrow Button */}
            <button
              type="button"
              onClick={() => scrollTabs('left')}
              className="absolute -left-3 top-1/2 -translate-y-1/2 z-40 p-2 rounded-full bg-white text-stone-700 shadow-lg border border-stone-200 hover:bg-amber-50 hover:text-[#B8860B] hover:border-amber-300 transition-all duration-200 active:scale-90 focus:outline-none hidden sm:flex items-center justify-center cursor-pointer"
              title={lang === 'km' ? 'រំកិលទៅឆ្វេង' : 'Scroll Left'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Scrollable Tabs Track */}
            <div
              ref={scrollTabsRef}
              className="flex items-center gap-2.5 p-2 bg-stone-100/95 backdrop-blur-xs rounded-2xl border border-stone-200/90 shadow-sm relative z-20 overflow-x-auto scroll-smooth touch-pan-x w-full no-scrollbar cursor-grab active:cursor-grabbing select-none"
            >
              {[
                { id: 'couple', icon: User, labelKm: 'កូនកម្លោះ-ក្រមុំ', labelEn: 'Couple Details' },
                { id: 'gallery', icon: ImageIcon, labelKm: 'រូបថត & Motion', labelEn: 'Photos & Motion' },
                { id: 'event', icon: Calendar, labelKm: 'កាលបរិច្ឆេទ & ទីតាំង', labelEn: 'Date & Venue' },
                { id: 'templates', icon: Layout, labelKm: 'Templates & តន្ត្រី', labelEn: 'Templates & Music' },
                { id: 'schedule', icon: Clock, labelKm: 'កម្មវិធីសិរីមង្គល', labelEn: 'Schedule' },
                { id: 'gift', icon: Gift, labelKm: 'ចំណងដៃ QR', labelEn: 'Gift QR' },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={(e) => {
                      setActiveTab(tab.id as any);
                      e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                    }}
                    className={`shrink-0 px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer relative z-30 active:scale-95 text-xs font-extrabold select-none ${
                      isActive
                        ? 'bg-gradient-to-r from-[#B8860B] via-amber-600 to-[#8C6D3B] text-white shadow-md ring-2 ring-amber-300/50'
                        : 'bg-white text-stone-700 hover:text-stone-900 hover:bg-stone-50 border border-stone-200/80 shadow-2xs'
                    }`}
                  >
                    <div
                      className={`p-1 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-white/20 text-white' : 'bg-amber-50 text-[#B8860B]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="whitespace-nowrap">{lang === 'km' ? tab.labelKm : tab.labelEn}</span>
                  </button>
                );
              })}
            </div>

            {/* Scroll Right Arrow Button */}
            <button
              type="button"
              onClick={() => scrollTabs('right')}
              className="absolute -right-3 top-1/2 -translate-y-1/2 z-40 p-2 rounded-full bg-white text-stone-700 shadow-lg border border-stone-200 hover:bg-amber-50 hover:text-[#B8860B] hover:border-amber-300 transition-all duration-200 active:scale-90 focus:outline-none hidden sm:flex items-center justify-center cursor-pointer"
              title={lang === 'km' ? 'រំកិលទៅស្តាំ' : 'Scroll Right'}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* TAB 1: COUPLE DETAILS */}
          {activeTab === 'couple' && (
            <div className="p-6 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-6 animate-fadeIn">
              <h3 className="font-bold text-stone-800 text-sm border-b border-stone-100 pb-2">
                {lang === 'km' ? 'ព័ត៌មានកូនកម្លោះ និងកូនក្រមុំ' : 'Groom & Bride Information'}
              </h3>

              {/* Groom */}
              <div className="space-y-4 p-4 rounded-2xl bg-amber-50/40 border border-amber-200/60">
                <h4 className="font-bold text-xs text-amber-900 uppercase tracking-wider">
                  {lang === 'km' ? 'ព័ត៌មានកូនកម្លោះ (Groom)' : 'Groom Info'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      {lang === 'km' ? 'ឈ្មោះកូនកម្លោះ (ភាសាខ្មែរ)' : 'Groom Name (Khmer)'}
                    </label>
                    <input
                      type="text"
                      value={data.groomNameKm}
                      onChange={(e) => updateField('groomNameKm', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      {lang === 'km' ? 'ឈ្មោះកូនកម្លោះ (English)' : 'Groom Name (English)'}
                    </label>
                    <input
                      type="text"
                      value={data.groomNameEn}
                      onChange={(e) => updateField('groomNameEn', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      {lang === 'km' ? 'លោកឪពុកខាងប្រុស' : 'Groom Father Name'}
                    </label>
                    <input
                      type="text"
                      value={data.parents.groomFather}
                      onChange={(e) => updateParents('groomFather', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      {lang === 'km' ? 'អ្នកម្តាយខាងប្រុស' : 'Groom Mother Name'}
                    </label>
                    <input
                      type="text"
                      value={data.parents.groomMother}
                      onChange={(e) => updateParents('groomMother', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Bride */}
              <div className="space-y-4 p-4 rounded-2xl bg-pink-50/40 border border-pink-200/60">
                <h4 className="font-bold text-xs text-pink-900 uppercase tracking-wider">
                  {lang === 'km' ? 'ព័ត៌មានកូនក្រមុំ (Bride)' : 'Bride Info'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      {lang === 'km' ? 'ឈ្មោះកូនក្រមុំ (ភាសាខ្មែរ)' : 'Bride Name (Khmer)'}
                    </label>
                    <input
                      type="text"
                      value={data.brideNameKm}
                      onChange={(e) => updateField('brideNameKm', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      {lang === 'km' ? 'ឈ្មោះកូនក្រមុំ (English)' : 'Bride Name (English)'}
                    </label>
                    <input
                      type="text"
                      value={data.brideNameEn}
                      onChange={(e) => updateField('brideNameEn', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      {lang === 'km' ? 'លោកឪពុកខាងស្រី' : 'Bride Father Name'}
                    </label>
                    <input
                      type="text"
                      value={data.parents.brideFather}
                      onChange={(e) => updateParents('brideFather', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      {lang === 'km' ? 'អ្នកម្តាយខាងស្រី' : 'Bride Mother Name'}
                    </label>
                    <input
                      type="text"
                      value={data.parents.brideMother}
                      onChange={(e) => updateParents('brideMother', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Photos & Welcome text */}
              <div className="space-y-4">
                <h4 className="font-bold text-xs text-stone-800 uppercase tracking-wider">
                  {lang === 'km' ? 'សារស្វាគមន៍ & លេខទំនាក់ទំនង' : 'Welcome Message & Phone'}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      {lang === 'km' ? 'លេខទូរស័ព្ទទំនាក់ទំនង' : 'Contact Phone'}
                    </label>
                    <input
                      type="text"
                      value={data.contactPhone || ''}
                      onChange={(e) => updateField('contactPhone', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-xs text-stone-700 mb-1">
                    {lang === 'km' ? 'សារគោរពអញ្ជើញ (ភាសាខ្មែរ)' : 'Welcome Invitation Text (Khmer)'}
                  </label>
                  <textarea
                    rows={3}
                    value={data.welcomeMessageKm}
                    onChange={(e) => updateField('welcomeMessageKm', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GALLERY & PHOTO UPLOAD SUPPORTING 20MB FULL HD (MAX 10 PHOTOS) */}
          {activeTab === 'gallery' && (
            <div className="p-6 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-6 animate-fadeIn">
              <div className="border-b border-stone-100 pb-3 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-bold text-stone-800 text-sm flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-600" />
                    <span>{lang === 'km' ? 'កម្រងរូបថត & Animation' : 'Photo Gallery & Opening Animation'}</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {lang === 'km'
                      ? 'រូបថតចំនួន ១០ រូបនេះនឹងបង្ហាញទាំងក្នុង Animation វាំងននក្រហម និងក្នុងទំព័រធៀបការ'
                      : 'These 10 photos will be shown in both the opening animation and the main invitation gallery'}
                  </p>
                </div>

                {/* Photo Counter Badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-extrabold text-[#8C6D3B]">
                    {lang === 'km'
                      ? `Upload បាន ${(data.galleryPhotos || []).length} / 10 រូប`
                      : `Uploaded ${(data.galleryPhotos || []).length} / 10 Photos`}
                  </span>
                </div>
              </div>

              {/* Progress Bar for 10 Photo Capacity */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold text-stone-600">
                  <span>{lang === 'km' ? 'កម្រិតផ្ទុករូបថត (Max 10 Photos)' : 'Photo Limit Capacity'}</span>
                  <span>{Math.round(((data.galleryPhotos || []).length / MAX_PHOTOS) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                  <div
                    className={`h-full transition-all duration-500 ${
                      (data.galleryPhotos || []).length >= MAX_PHOTOS
                        ? 'bg-amber-500'
                        : 'bg-gradient-to-r from-amber-400 to-[#B8860B]'
                    }`}
                    style={{ width: `${((data.galleryPhotos || []).length / MAX_PHOTOS) * 100}%` }}
                  />
                </div>
              </div>

              {/* HD Upload Badge Notice */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-[#8C6D3B]">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>
                    {lang === 'km'
                      ? 'គាំទ្ររូបភាព Full HD / 4K (អតិបរមា ១០ រូប / ទំហំ 20MB ក្នុងមួយរូប)'
                      : 'Supports Full HD / 4K Photos (Max 10 Photos / Up to 20MB Each)'}
                  </span>
                </div>
                <p className="text-stone-700 leading-relaxed text-[11px]">
                  {lang === 'km'
                    ? 'លោកអ្នកអាច Upload រូបថតចំនួន ១០ រូប។ រូបថតទាំង ១០ នេះនឹងបង្ហាញក្នុង Animation វាំងននក្រហម ព្រមទាំងក្នុងផ្នែកកម្រងរូបថតរបស់កម្មវិធីធៀបការ!'
                    : 'You can upload up to 10 photos. These 10 photos will appear in both the curtain opening animation and the gallery section.'}
                </p>
              </div>

              {/* Upload Dropzone */}
              <div
                className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${
                  (data.galleryPhotos || []).length >= MAX_PHOTOS
                    ? 'border-stone-300 bg-stone-50 cursor-not-allowed opacity-80'
                    : 'border-amber-300 hover:border-amber-500 bg-amber-50/30 cursor-pointer group'
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={(data.galleryPhotos || []).length >= MAX_PHOTOS}
                  onChange={handlePhotoUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed w-full h-full z-10"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-amber-100 group-hover:bg-amber-200 text-[#B8860B] flex items-center justify-center transition-colors">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-xs text-stone-800">
                    {(data.galleryPhotos || []).length >= MAX_PHOTOS
                      ? (lang === 'km' ? 'លោកអ្នកបាន Upload គ្រប់ចំនួន ១០ រូបថតរួចហើយ' : '10 / 10 Photos Uploaded (Max Reached)')
                      : (lang === 'km' ? 'ចុច ឬអូសរូបថតមកដាក់ទីនេះ (អតិបរមា ១០ រូប)' : 'Click or drag photos here to upload (Max 10 Photos)')}
                  </p>
                  <p className="text-[10px] text-stone-500 font-medium">
                    {lang === 'km' ? 'PNG, JPG, WEBP — អតិបរមា 20MB ក្នុងមួយរូប' : 'PNG, JPG, WEBP — Max 20MB per file'}
                  </p>
                </div>
              </div>

              {uploadError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                  {uploadError}
                </div>
              )}

              {/* Add Photo via URL Link Option */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-stone-700">
                  {lang === 'km' ? 'ឬបន្ថែមតាមរយៈ Link រូបថត (URL):' : 'Or add via photo URL link:'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newUrlInput}
                    disabled={(data.galleryPhotos || []).length >= MAX_PHOTOS}
                    onChange={(e) => setNewUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#B8860B] focus:outline-none disabled:bg-stone-100"
                  />
                  <button
                    onClick={handleAddPhotoUrl}
                    disabled={(data.galleryPhotos || []).length >= MAX_PHOTOS}
                    className="px-4 py-2 rounded-xl bg-[#B8860B] text-white text-xs font-bold hover:bg-[#966b08] disabled:opacity-50 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{lang === 'km' ? 'បន្ថែម' : 'Add'}</span>
                  </button>
                </div>
              </div>

              {/* Gallery Photo Cards Grid */}
              <div className="space-y-3 pt-4 border-t border-stone-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-stone-800 uppercase tracking-wider">
                    {lang === 'km'
                      ? `រូបថតក្នុងកម្រង (${(data.galleryPhotos || []).length} រូប)`
                      : `Gallery Photos (${(data.galleryPhotos || []).length})`}
                  </h4>

                  {(data.galleryPhotos || []).length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const confirmMsg = lang === 'km' ? 'តើអ្នកពិតជាចង់លុបរូបថតក្នុងកម្រងទាំងអស់ចេញមែនទេ?' : 'Are you sure you want to clear all photos?';
                        if (window.confirm(confirmMsg)) {
                          updateField('galleryPhotos', []);
                        }
                      }}
                      className="text-red-600 hover:text-red-800 text-xs font-bold flex items-center gap-1 hover:underline"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{lang === 'km' ? 'លុបរូបថតទាំងអស់' : 'Clear All Photos'}</span>
                    </button>
                  )}
                </div>

                {(data.galleryPhotos || []).length === 0 ? (
                  <div className="p-8 text-center bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 space-y-2">
                    <div className="w-12 h-12 rounded-full bg-amber-100 text-[#B8860B] flex items-center justify-center mx-auto shadow-sm">
                      <Upload className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-stone-800 text-xs">
                      {lang === 'km' ? 'មិនទាន់មានរូបថតក្នុងកម្រងនៅឡើយទេ' : 'No photos in gallery yet'}
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      {lang === 'km'
                        ? 'សូមចុចប៊ូតុង "ជ្រើសរើសរូបថត Upload" ខាងលើ ដើម្បី upload រូបថតរបស់អ្នក'
                        : 'Please click "Upload Photos" button above to add your own wedding photos'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(data.galleryPhotos || []).map((url, idx) => {
                      const isMain = data.couplePhotoUrl === url;
                      return (
                        <div
                          key={idx}
                          className={`relative group rounded-xl overflow-hidden border-2 shadow-sm bg-stone-100 ${
                            isMain ? 'border-amber-500 ring-2 ring-amber-300' : 'border-stone-200'
                          }`}
                        >
                          <div className="w-full h-32 relative">
                            <img
                              src={url || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'}
                              alt={`Gallery ${idx + 1}`}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            {isMain && (
                              <span className="absolute top-1 left-1 px-2 py-0.5 rounded-md bg-amber-500 text-white font-bold text-[9px] shadow">
                                {lang === 'km' ? 'រូបចម្បង' : 'Main Cover'}
                              </span>
                            )}
                          </div>

                          {/* Actions Overlay */}
                          <div className="p-2 bg-white flex items-center justify-between text-[10px] gap-1">
                            {!isMain ? (
                              <button
                                type="button"
                                onClick={() => handleSetMainPhoto(url)}
                                className="text-[#B8860B] font-bold hover:underline shrink-0"
                              >
                                {lang === 'km' ? 'ជារូបចម្បង' : 'Set Main'}
                              </button>
                            ) : (
                              <span className="text-amber-700 font-bold shrink-0">
                                {lang === 'km' ? '★ ចម្បង' : '★ Main'}
                              </span>
                            )}

                            <label
                              className="text-stone-600 font-bold hover:text-amber-700 hover:underline cursor-pointer flex items-center gap-0.5 shrink-0"
                              title={lang === 'km' ? 'ជំនួសរូបថតនេះ' : 'Replace this photo'}
                            >
                              <RefreshCw className="w-3 h-3 text-amber-600" />
                              <span>{lang === 'km' ? 'ជំនួស' : 'Replace'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleReplaceSinglePhoto(idx, file);
                                  e.target.value = '';
                                }}
                              />
                            </label>

                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(idx)}
                              className="text-red-600 font-bold hover:bg-red-50 p-1 rounded-md shrink-0 ml-auto"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DATE & VENUE */}
          {activeTab === 'event' && (
            <div className="p-6 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-6 animate-fadeIn">
              <h3 className="font-bold text-stone-800 text-sm border-b border-stone-100 pb-2">
                {lang === 'km' ? 'កាលបរិច្ឆេទ ពេលវេលា និងទីតាំង' : 'Date, Time & Location'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    {lang === 'km' ? 'កាលបរិច្ឆេទ (ISO YYYY-MM-DD)' : 'Wedding Date'}
                  </label>
                  <input
                    type="date"
                    value={data.weddingDateIso}
                    onChange={(e) => updateField('weddingDateIso', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    {lang === 'km' ? 'ពេលវេលាពិធី' : 'Ceremony Time'}
                  </label>
                  <input
                    type="text"
                    value={data.weddingTimeKm}
                    onChange={(e) => updateField('weddingTimeKm', e.target.value)}
                    placeholder="ឧទាហរណ៍៖ ម៉ោង ៥:០០ នាទីល្ងាច"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">
                    {lang === 'km' ? 'ថ្ងៃខែចន្ទគតិ (Khmer Lunar Calendar Date)' : 'Khmer Lunar Calendar Description'}
                  </label>
                  <input
                    type="text"
                    value={data.lunarDateKm}
                    onChange={(e) => updateField('lunarDateKm', e.target.value)}
                    placeholder="ឧទាហរណ៍៖ ថ្ងៃអាទិត្យ ៧កើត ខែជេស្ឋ ឆ្នាំខាល"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    {lang === 'km' ? 'ឈ្មោះទីតាំង (ភាសាខ្មែរ)' : 'Venue Name (Khmer)'}
                  </label>
                  <input
                    type="text"
                    value={data.venueNameKm}
                    onChange={(e) => updateField('venueNameKm', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    {lang === 'km' ? 'អាសយដ្ឋាន (ភាសាខ្មែរ)' : 'Address Details (Khmer)'}
                  </label>
                  <input
                    type="text"
                    value={data.addressKm}
                    onChange={(e) => updateField('addressKm', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">
                    {lang === 'km' ? 'តំណភ្ជាប់ Google Maps (URL)' : 'Google Maps Link'}
                  </label>
                  <input
                    type="text"
                    value={data.googleMapUrl}
                    onChange={(e) => updateField('googleMapUrl', e.target.value)}
                    placeholder="https://maps.google.com/..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TEMPLATES & AUDIO */}
          {activeTab === 'templates' && (
            <div className="p-6 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-6 animate-fadeIn">
              <TemplatePicker
                selectedId={data.templateId}
                onSelectTemplate={(id: TemplateId) => {
                  const updatedData = { ...data, templateId: id };
                  onChange(updatedData);
                  saveToCloud(updatedData);
                }}
                onPreviewTemplate={(tmpl) => {
                  const updatedData = { ...data, templateId: tmpl.id };
                  onChange(updatedData);
                  onPreviewFullscreen();
                }}
                lang={lang}
              />

              {/* Music Audio Choice & Custom MP3 Upload / YouTube Converter */}
              <div className="pt-6 border-t border-stone-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-stone-800 text-xs uppercase tracking-wider flex items-center gap-2">
                    <Music className="w-4 h-4 text-amber-600" />
                    <span>{lang === 'km' ? 'បទភ្លេងផ្ទៃក្រោយ (Background Music)' : 'Background Music Track'}</span>
                  </h4>

                  {/* YouTube or Audio Status Badge */}
                  {data.musicTrack?.includes('youtube.com') || data.musicTrack?.includes('youtu.be') ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold flex items-center gap-1 border border-red-200">
                      <span>▶</span> YouTube Audio Auto-Converter Active
                    </span>
                  ) : data.musicTrack?.startsWith('data:audio') ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1 border border-emerald-200">
                      <span>🎵</span> Custom MP3 File Uploaded
                    </span>
                  ) : null}
                </div>

                {/* Preset Song Quick Selectors */}
                <div className="space-y-2">
                  <label className="block text-stone-600 text-xs font-semibold">
                    {lang === 'km' ? 'ជ្រើសរើសបទភ្លេងការគំរូ (Preset Wedding Songs):' : 'Select Preset Song:'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      {
                        titleKm: '🎶 បទមង្គលរាជ : សិរីមង្គលអាពាហ៍ពិពាហ៍ (Khmer Traditional Pinpeat)',
                        titleEn: 'Royal Khmer Wedding Pinpeat',
                        url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8230f80.mp3',
                      },
                      {
                        titleKm: '🎻 វាយ៉ូឡាំងមង្គលការ (Romantic Wedding Violin)',
                        titleEn: 'Romantic Wedding Violin',
                        url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
                      },
                      {
                        titleKm: '🎹 អាពាហ៍ពិពាហ៍ផ្លុយ & ព្យាណូ (Flute & Piano Harmony)',
                        titleEn: 'Flute & Piano Harmony',
                        url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3',
                      },
                      {
                        titleKm: '✨ អនុស្សាវរីយ៍ស្នេហ៍ (Acoustic Guitar Romance)',
                        titleEn: 'Acoustic Guitar Romance',
                        url: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f7f893.mp3',
                      },
                    ].map((song, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          const updated = { ...data, musicTrack: song.url };
                          onChange(updated);
                          saveToCloud(updated);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between text-xs ${
                          data.musicTrack === song.url
                            ? 'bg-amber-50 border-amber-400 text-amber-900 font-bold shadow-xs'
                            : 'bg-stone-50/80 border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <span className="truncate pr-2">{lang === 'km' ? song.titleKm : song.titleEn}</span>
                        {data.musicTrack === song.url && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Option 1: Upload MP3 Audio File */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50/80 to-orange-50/80 border border-amber-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-amber-700" />
                      {lang === 'km' ? 'ឬ Upload ឯកសារចម្រៀង MP3 ផ្ទាល់ខ្លួន' : 'Or Upload Custom MP3 Audio File'}
                    </span>
                    <span className="text-[10px] text-stone-500">(Max 25MB)</span>
                  </div>

                  <label className="cursor-pointer w-full py-2 px-3 rounded-xl bg-white border border-amber-300 hover:border-amber-500 text-amber-900 font-bold text-xs flex items-center justify-center gap-2 shadow-xs hover:shadow-sm transition-all">
                    <Upload className="w-4 h-4 text-amber-600" />
                    <span>{lang === 'km' ? 'ជ្រើសរើសឯកសារ MP3 ពីទូរស័ព្ទ / កុំព្យូទ័រ' : 'Select MP3 File from Device'}</span>
                    <input type="file" accept="audio/*" onChange={handleAudioFileUpload} className="hidden" />
                  </label>
                </div>

                {/* Option 2: YouTube Link Support with Automatic Converter */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <label className="text-stone-700 font-semibold flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[9px] font-black">►</span>
                      {lang === 'km'
                        ? 'ឬ បិទភ្ជាប់តំណ YouTube Video (Paste YouTube Link - Auto Converted!)'
                        : 'Or Paste YouTube Video Link (Auto-Converted to Audio):'}
                    </label>
                  </div>
                  <input
                    type="text"
                    value={data.musicTrack}
                    onChange={(e) => updateField('musicTrack', e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... ឬ https://youtu.be/..."
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white"
                  />
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    💡 {lang === 'km'
                      ? 'លោកអ្នកអាច Copy លីងបទចម្រៀងពី YouTube (ឧទាហរណ៍៖ youtube.com/watch?v=...) មកដាក់ទីនេះ ប្រព័ន្ធនឹង convert ជា Audio ផ្ទៃក្រោយដោយស្វ័យប្រវត្តិ!'
                      : 'You can copy any YouTube music video URL and paste it here. The app automatically plays the audio in the background!'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SCHEDULE & THEME COLORS */}
          {activeTab === 'schedule' && (
            <div className="space-y-6 animate-fadeIn">
              {/* SECTION 1: WEDDING DRESS CODE & COLOR THEME */}
              <div className="p-6 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                      <Palette className="w-4 h-4 text-[#B8860B]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-800 text-sm">
                        {lang === 'km' ? 'ពណ៌នៃកម្មវិធីមង្គលការ (Wedding Color Theme)' : 'Wedding Color Theme'}
                      </h3>
                      <p className="text-[11px] text-stone-500">
                        {lang === 'km'
                          ? 'កំណត់ពណ៌សម្លៀកបំពាក់ភ្ញៀវ ឬពណ៌ប្រធានបទមង្គលការ'
                          : 'Set guest dress code colors or wedding theme palette'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleApplyPresetPalette(['#A0522D', '#C59B27', '#FFD700', '#9370DB', '#DC143C'])}
                    className="px-2.5 py-1 rounded-xl bg-stone-100 text-stone-600 font-bold text-xs hover:bg-stone-200 flex items-center gap-1"
                    title="Reset to default colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{lang === 'km' ? 'កំណត់ដើម' : 'Reset'}</span>
                  </button>
                </div>

                {/* Preset Theme Palette Quick Selection */}
                <div className="space-y-2">
                  <label className="block font-bold text-stone-700 text-xs">
                    {lang === 'km' ? 'ជ្រើសរើសតាមឈុតពណ៌គំរូ (Quick Palette Presets):' : 'Select Preset Color Palette:'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplyPresetPalette(['#A0522D', '#C59B27', '#FFD700', '#9370DB', '#DC143C'])}
                      className="p-2 rounded-xl border border-stone-200 hover:border-amber-400 bg-stone-50 text-left transition-all hover:bg-amber-50/50"
                    >
                      <span className="text-[10px] font-bold text-stone-700 block mb-1">🌟 មាសរាជវាំង (Royal Gold)</span>
                      <div className="flex gap-1">
                        {['#A0522D', '#C59B27', '#FFD700', '#9370DB', '#DC143C'].map((c, i) => (
                          <div key={i} className="w-3.5 h-3.5 rounded-full border border-white shadow-xs" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyPresetPalette(['#7F1D1D', '#991B1B', '#DC2626', '#E11D48', '#FCA5A5'])}
                      className="p-2 rounded-xl border border-stone-200 hover:border-amber-400 bg-stone-50 text-left transition-all hover:bg-amber-50/50"
                    >
                      <span className="text-[10px] font-bold text-stone-700 block mb-1">🌹 ក្រហមសិរីមង្គល (Crimson)</span>
                      <div className="flex gap-1">
                        {['#7F1D1D', '#991B1B', '#DC2626', '#E11D48', '#FCA5A5'].map((c, i) => (
                          <div key={i} className="w-3.5 h-3.5 rounded-full border border-white shadow-xs" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyPresetPalette(['#064E3B', '#047857', '#10B981', '#34D399', '#A7F3D0'])}
                      className="p-2 rounded-xl border border-stone-200 hover:border-amber-400 bg-stone-50 text-left transition-all hover:bg-amber-50/50"
                    >
                      <span className="text-[10px] font-bold text-stone-700 block mb-1">🌿 បៃតងមរកត (Emerald)</span>
                      <div className="flex gap-1">
                        {['#064E3B', '#047857', '#10B981', '#34D399', '#A7F3D0'].map((c, i) => (
                          <div key={i} className="w-3.5 h-3.5 rounded-full border border-white shadow-xs" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyPresetPalette(['#831843', '#9D174D', '#F43F5E', '#FB7185', '#FBCFE8'])}
                      className="p-2 rounded-xl border border-stone-200 hover:border-amber-400 bg-stone-50 text-left transition-all hover:bg-amber-50/50"
                    >
                      <span className="text-[10px] font-bold text-stone-700 block mb-1">🌸 ផ្ការ៉ូសហ្គោល (Rose Gold)</span>
                      <div className="flex gap-1">
                        {['#831843', '#9D174D', '#F43F5E', '#FB7185', '#FBCFE8'].map((c, i) => (
                          <div key={i} className="w-3.5 h-3.5 rounded-full border border-white shadow-xs" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyPresetPalette(['#1E3A8A', '#1D4ED8', '#3B82F6', '#60A5FA', '#BFDBFE'])}
                      className="p-2 rounded-xl border border-stone-200 hover:border-amber-400 bg-stone-50 text-left transition-all hover:bg-amber-50/50"
                    >
                      <span className="text-[10px] font-bold text-stone-700 block mb-1">👑 ខៀវរាជវាំង (Royal Blue)</span>
                      <div className="flex gap-1">
                        {['#1E3A8A', '#1D4ED8', '#3B82F6', '#60A5FA', '#BFDBFE'].map((c, i) => (
                          <div key={i} className="w-3.5 h-3.5 rounded-full border border-white shadow-xs" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyPresetPalette(['#581C87', '#7E22CE', '#A855F7', '#C084FC', '#E9D5FF'])}
                      className="p-2 rounded-xl border border-stone-200 hover:border-amber-400 bg-stone-50 text-left transition-all hover:bg-amber-50/50"
                    >
                      <span className="text-[10px] font-bold text-stone-700 block mb-1">💜 ស្វាយរាជវាំង (Purple)</span>
                      <div className="flex gap-1">
                        {['#581C87', '#7E22CE', '#A855F7', '#C084FC', '#E9D5FF'].map((c, i) => (
                          <div key={i} className="w-3.5 h-3.5 rounded-full border border-white shadow-xs" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Color Swatches Grid (Individual Color Customization) */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-stone-700 text-xs">
                      {lang === 'km' ? 'កែប្រែពណ៌នីមួយៗ (Custom Color Swatches):' : 'Custom Swatches:'}
                    </label>
                    <button
                      type="button"
                      onClick={() => handleAddThemeColor()}
                      className="px-3 py-1 rounded-xl bg-amber-100 text-amber-900 font-bold text-xs hover:bg-amber-200 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{lang === 'km' ? 'បន្ថែមពណ៌' : 'Add Color'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {currentThemeColors.map((colorHex, idx) => (
                      <div key={idx} className="p-2.5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col gap-2 relative group">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-stone-500">
                            {lang === 'km' ? `ពណ៌ទី ${idx + 1}` : `Color ${idx + 1}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveThemeColor(idx)}
                            className="p-1 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50"
                            title="Remove color"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={colorHex}
                            onChange={(e) => handleUpdateThemeColor(idx, e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer border border-stone-300 p-0"
                          />
                          <input
                            type="text"
                            value={colorHex}
                            onChange={(e) => handleUpdateThemeColor(idx, e.target.value)}
                            className="w-full px-2 py-1 text-xs rounded-lg border border-stone-300 bg-white font-mono uppercase"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 2: PROGRAM SCHEDULE MANAGEMENT */}
              <div className="p-6 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-3 gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-[#B8860B]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-800 text-sm">
                        {lang === 'km' ? 'កម្មវិធីសិរីមង្គល (Ceremony Schedule)' : 'Ceremony Schedule'}
                      </h3>
                      <p className="text-[11px] text-stone-500">
                        {lang === 'km'
                          ? 'អាចកែប្រែ ផ្លាស់ប្តូរម៉ោង ឬដកចេញកម្មវិធីណាមួយបានយ៉ាងងាយស្រួល'
                          : 'Edit, reorder, or remove any schedule event easily'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => addScheduleItem()}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-xs shadow-sm hover:from-amber-600 hover:to-amber-700 flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{lang === 'km' ? 'បន្ថែមកម្មវិធីថ្មី' : 'Add New Event'}</span>
                  </button>
                </div>

                {/* Quick Add Ceremonies Preset Bar */}
                <div className="space-y-2">
                  <label className="block font-bold text-stone-700 text-xs">
                    {lang === 'km' ? 'បន្ថែមពិធីការសំខាន់ៗដោយចុច 1 Tap (Quick Presets):' : 'Quick Add Common Events:'}
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => addScheduleItem('ពិធីហែជំនូនចូលរោងជ័យ', '០៧:០០ ព្រឹក')}
                      className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-bold hover:bg-amber-100 transition-colors"
                    >
                      + 🍵 ពិធីហែជំនូន
                    </button>
                    <button
                      type="button"
                      onClick={() => addScheduleItem('អញ្ជើញភ្ញៀវកិត្តិយសពិសារអាហារពេលព្រឹក', '០៧:៣០ ព្រឹក')}
                      className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-bold hover:bg-amber-100 transition-colors"
                    >
                      + 🥣 ពិសារអាហារពេលព្រឹក
                    </button>
                    <button
                      type="button"
                      onClick={() => addScheduleItem('ពិធីពិសារស្លាកំណត់ និងបំពាក់ចិញ្ចៀន', '០៨:០០ ព្រឹក')}
                      className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-bold hover:bg-amber-100 transition-colors"
                    >
                      + 💍 ពិធីបំពាក់ចិញ្ចៀន
                    </button>
                    <button
                      type="button"
                      onClick={() => addScheduleItem('ពិធីសូត្រមន្ត ចម្រើនព្រះបរិត្ត', '០៨:៣០ ព្រឹក')}
                      className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-bold hover:bg-amber-100 transition-colors"
                    >
                      + ⛩️ ពិធីសូត្រមន្ត
                    </button>
                    <button
                      type="button"
                      onClick={() => addScheduleItem('ពិធីកាត់សក់បង្កក់សិរី', '០៩:០០ ព្រឹក')}
                      className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-bold hover:bg-amber-100 transition-colors"
                    >
                      + 💇‍♂️ ពិធីកាត់សក់
                    </button>
                    <button
                      type="button"
                      onClick={() => addScheduleItem('ពិធីសំពះផ្ទឹម និងសែនចងដៃ', '១០:៣០ ព្រឹក')}
                      className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-bold hover:bg-amber-100 transition-colors"
                    >
                      + 👨‍👩‍👧 ពិធីសំពះផ្ទឹម
                    </button>
                    <button
                      type="button"
                      onClick={() => addScheduleItem('អញ្ជើញភ្ញៀវកិត្តិយសពិសារភោជនីយអាហារ', '០៥:០០ ល្ងាច')}
                      className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-bold hover:bg-amber-100 transition-colors"
                    >
                      + 🍷 ពិសារអាហារពេលល្ងាច
                    </button>
                  </div>
                </div>

                {/* Schedule Item Cards */}
                <div className="space-y-4">
                  {data.schedule.length === 0 ? (
                    <div className="p-8 text-center text-stone-500 bg-stone-50 rounded-2xl border border-dashed border-stone-300">
                      <p className="text-xs font-bold">
                        {lang === 'km' ? 'មិនទាន់មានកម្មវិធីសិរីមង្គលនៅឡើយទេ' : 'No schedule events added yet'}
                      </p>
                      <p className="text-[11px] text-stone-400 mt-1">
                        {lang === 'km' ? 'សូមចុច "បន្ថែមកម្មវិធីថ្មី" ឬជ្រើសរើសពី Presets ខាងលើ' : 'Click "Add New Event" or use presets above'}
                      </p>
                    </div>
                  ) : (
                    data.schedule.map((item, idx) => (
                      <div key={item.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 relative text-xs shadow-xs hover:border-amber-300 transition-colors">
                        {/* Control Actions (Move Up, Move Down, Delete/Remove) */}
                        <div className="flex items-center gap-1.5 absolute top-3 right-3">
                          <button
                            type="button"
                            onClick={() => moveScheduleItem(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1.5 rounded-lg bg-white border border-stone-200 text-stone-600 hover:text-amber-800 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => moveScheduleItem(idx, 'down')}
                            disabled={idx === data.schedule.length - 1}
                            className="p-1.5 rounded-lg bg-white border border-stone-200 text-stone-600 hover:text-amber-800 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => removeScheduleItem(item.id)}
                            className="p-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition-colors flex items-center gap-1"
                            title="ដកកម្មវិធីនេះចេញ (Remove)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold">{lang === 'km' ? 'ដកចេញ' : 'Remove'}</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 sm:pt-0">
                          <div>
                            <label className="block font-bold text-stone-700 mb-1">
                              {lang === 'km' ? 'ម៉ោងកំណត់' : 'Time'}
                            </label>
                            <input
                              type="text"
                              value={item.time}
                              onChange={(e) => updateScheduleItem(item.id, 'time', e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-white font-bold text-amber-900"
                              placeholder="e.g. ០៧:០០ ព្រឹក"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block font-bold text-stone-700 mb-1">
                              {lang === 'km' ? 'ឈ្មោះកម្មវិធី (ភាសាខ្មែរ)' : 'Program Title (Khmer)'}
                            </label>
                            <input
                              type="text"
                              value={item.titleKm}
                              onChange={(e) => updateScheduleItem(item.id, 'titleKm', e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-white font-semibold"
                              placeholder="e.g. ពិធីហែជំនូនចូលរោងជ័យ"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="block font-bold text-stone-600 mb-1 text-[11px]">
                              {lang === 'km' ? 'ឈ្មោះកម្មវិធី (ភាសាអង់គ្លេស)' : 'Program Title (English)'}
                            </label>
                            <input
                              type="text"
                              value={item.titleEn || ''}
                              onChange={(e) => updateScheduleItem(item.id, 'titleEn', e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-white"
                              placeholder="e.g. Gift Procession Ceremony"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-stone-600 mb-1 text-[11px]">
                              {lang === 'km' ? 'ពិពណ៌នាបន្ថែម (ជម្រើស)' : 'Description (Optional)'}
                            </label>
                            <input
                              type="text"
                              value={item.descriptionKm || ''}
                              onChange={(e) => updateScheduleItem(item.id, 'descriptionKm', e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-white"
                              placeholder="e.g. នៅគេហដ្ឋានខាងស្រី"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: GIFT BANK QR */}
          {activeTab === 'gift' && (
            <div className="p-6 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-6 animate-fadeIn">
              <h3 className="font-bold text-stone-800 text-sm border-b border-stone-100 pb-2">
                {lang === 'km' ? 'ព័ត៌មានប្រអប់ចំណងដៃ (Bank / ABA QR Code)' : 'Bank Cash Blessing Details'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    {lang === 'km' ? 'ឈ្មោះធនាគារ' : 'Bank Name'}
                  </label>
                  <input
                    type="text"
                    value={data.bankBlessing.bankName}
                    onChange={(e) => updateBank('bankName', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    {lang === 'km' ? 'ឈ្មោះគណនី (Account Name)' : 'Account Name'}
                  </label>
                  <input
                    type="text"
                    value={data.bankBlessing.accountName}
                    onChange={(e) => updateBank('accountName', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    {lang === 'km' ? 'លេខគណនី (Account Number)' : 'Account Number'}
                  </label>
                  <input
                    type="text"
                    value={data.bankBlessing.accountNumber}
                    onChange={(e) => updateBank('accountNumber', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    {lang === 'km' ? 'តំណភ្ជាប់ QR Code (URL)' : 'QR Code Image URL'}
                  </label>
                  <input
                    type="text"
                    value={data.bankBlessing.qrCodeUrl}
                    onChange={(e) => updateBank('qrCodeUrl', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Interactive Phone Simulator (5 Cols) */}
        <div className="lg:col-span-5 sticky top-16 flex flex-col items-center space-y-3">
          {/* Top Title & Interactive Quick Controls */}
          <div className="w-full max-w-[360px] bg-white/90 backdrop-blur-md p-2.5 rounded-2xl border border-amber-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100/90 text-amber-900 font-bold text-[10px] border border-amber-300/80 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600 animate-spin" />
                <span>{lang === 'km' ? 'ការបង្ហាញផ្សាយផ្ទាល់' : 'Live Phone Simulator'}</span>
              </span>
              <span className="text-[10px] text-stone-500 font-semibold">
                {lang === 'km' ? 'អន្តរកម្មលើទូរស័ព្ទ' : 'Interactive Preview'}
              </span>
            </div>

            {/* Quick Action Buttons Toolbar */}
            <div className="grid grid-cols-3 gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => setPhoneResetKey((prev) => prev + 1)}
                className="py-1.5 px-2 rounded-xl bg-stone-100 hover:bg-amber-100 text-stone-800 hover:text-amber-900 font-bold text-[10px] border border-stone-200 hover:border-amber-300 transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                title={lang === 'km' ? 'ចាក់តាំងពីដំបូង (Replay Intro)' : 'Replay Intro'}
              >
                <RotateCcw className="w-3 h-3 text-amber-700" />
                <span>{lang === 'km' ? 'សារឡើងវិញ' : 'Replay'}</span>
              </button>

              <button
                type="button"
                onClick={onPreviewFullscreen}
                className="py-1.5 px-2 rounded-xl bg-[#B8860B] hover:bg-[#966b08] text-white font-bold text-[10px] shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                title={lang === 'km' ? 'មើលពេញអេក្រង់ (Fullscreen)' : 'Fullscreen'}
              >
                <Maximize2 className="w-3 h-3 text-amber-100" />
                <span>{lang === 'km' ? 'ពេញអេក្រង់' : 'Fullscreen'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="py-1.5 px-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-[10px] border border-amber-300 transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                title={lang === 'km' ? 'ចែករំលែក Link' : 'Share Link'}
              >
                <Share2 className="w-3 h-3 text-amber-700" />
                <span>{lang === 'km' ? 'ចែករំលែក' : 'Share'}</span>
              </button>
            </div>
          </div>

          {/* Premium Smartphone Frame Outer Titanium Shell */}
          <div className="relative w-full max-w-[360px] h-[670px] rounded-[50px] bg-[#121214] p-3 shadow-2xl border-[6px] border-[#2A2A2E] ring-1 ring-black/80 overflow-hidden group">
            {/* Physical Side Buttons Accents */}
            <div className="absolute -left-[9px] top-24 w-1.5 h-8 bg-stone-700 rounded-l-md shadow-inner" />
            <div className="absolute -left-[9px] top-36 w-1.5 h-12 bg-stone-700 rounded-l-md shadow-inner" />
            <div className="absolute -left-[9px] top-52 w-1.5 h-12 bg-stone-700 rounded-l-md shadow-inner" />
            <div className="absolute -right-[9px] top-36 w-1.5 h-16 bg-stone-700 rounded-r-md shadow-inner" />

            {/* Dynamic Island Camera Notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-28 h-4.5 bg-black rounded-full flex items-center justify-between px-2.5 text-[8px] text-stone-400 pointer-events-none shadow-md">
              <div className="w-2.5 h-2.5 rounded-full bg-stone-900 border border-stone-800" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-900/60" />
            </div>

            {/* Simulated Glass Reflection Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-40" />

            {/* Simulated Phone Screen Container with Smooth Scroll */}
            <div className="w-full h-full rounded-[40px] overflow-y-auto overflow-x-hidden bg-white relative flex flex-col no-scrollbar shadow-inner">
              <ErrorBoundary>
                <InvitationCard data={data} key={phoneResetKey} />
              </ErrorBoundary>
            </div>

            {/* Bottom iOS Home Indicator Bar */}
            <div className="absolute bottom-2.5 inset-x-0 z-50 flex justify-center pointer-events-none">
              <div className="w-28 h-1 bg-stone-400/70 rounded-full shadow-xs backdrop-blur-2xs" />
            </div>
          </div>
        </div>
      </div>

      {/* SHARE INVITATION LINK MODAL */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-stone-100 space-y-5 animate-scaleUp">
            {/* Close button */}
            <button
              onClick={() => setIsShareModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-[#B8860B] flex items-center justify-center font-bold shadow-inner">
                <Share2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className={`text-lg font-bold text-stone-900 ${lang === 'km' ? 'font-moul text-base' : 'font-playfair'}`}>
                  {lang === 'km' ? 'ចម្លង Link ផ្ញើទៅកាន់ភ្ញៀវ' : 'Share Invitation Link'}
                </h3>
                <p className="text-xs text-stone-500">
                  {lang === 'km'
                    ? 'តំណភ្ជាប់នេះត្រូវបានរក្សាទុកដោយស្វ័យប្រវត្តិ និងបង្ហាញធៀបដែលអ្នកបាន Edit រួចលើ Mobile Fullscreen'
                    : 'This link displays your exact edited invitation card in full screen mode on guest phones.'}
                </p>
              </div>
            </div>

            {/* General Main Share Link */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <label className="block text-xs font-bold text-stone-700">
                {lang === 'km' ? '១. Link ធៀបការទូទៅ (General Link)' : '1. General Shareable Link'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/?invite=${data.id}`}
                  className="flex-1 px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-mono bg-white text-stone-800 selection:bg-amber-100 select-all"
                />
                <button
                  onClick={async () => {
                    const url = `${window.location.origin}/?invite=${data.id}`;
                    await copyToClipboard(url);
                    setCopiedGeneral(true);
                    setTimeout(() => setCopiedGeneral(false), 2000);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#B8860B] hover:bg-[#966b08] text-white text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shadow-sm"
                >
                  {copiedGeneral ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>{lang === 'km' ? 'បានចម្លង!' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{lang === 'km' ? 'ចម្លង Link' : 'Copy Link'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Personalized Guest Link Section */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
              <div>
                <label className="block text-xs font-extrabold text-amber-900 mb-1">
                  {lang === 'km' ? '២. Link ផ្ទាល់ខ្លួនសម្រាប់ភ្ញៀវម្នាក់ៗ (Personalized Guest Link)' : '2. Personal Guest Link (Optional)'}
                </label>
                <p className="text-[11px] text-amber-800">
                  {lang === 'km'
                    ? 'វាយបញ្ចូលឈ្មោះភ្ញៀវ ដើម្បីបង្កើត Link ពិសេសដែលមានដាក់ឈ្មោះគោរពអញ្ជើញភ្ញៀវម្នាក់ៗ'
                    : 'Type a guest name to generate a custom link that displays "Respectfully Invited: Guest Name"'}
                </p>
              </div>

              <input
                type="text"
                value={customGuestName}
                onChange={(e) => setCustomGuestName(e.target.value)}
                placeholder={lang === 'km' ? 'ឧ. លោក សុខ ពិសិដ្ឋ និង ភរិយា' : 'e.g. Mr. Sok Piseth & Spouse'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-white text-xs text-stone-900 focus:ring-2 focus:ring-[#B8860B] focus:outline-none"
              />

              {customGuestName.trim() && (
                <div className="flex items-center gap-2 pt-1 animate-fadeIn">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/?invite=${data.id}&guest=${encodeURIComponent(customGuestName.trim())}`}
                    className="flex-1 px-3 py-2 rounded-xl border border-amber-200 text-xs font-mono bg-amber-100/50 text-amber-900 selection:bg-amber-200"
                  />
                  <button
                    onClick={async () => {
                      const url = `${window.location.origin}/?invite=${data.id}&guest=${encodeURIComponent(customGuestName.trim())}`;
                      await copyToClipboard(url);
                      setCopiedPersonal(true);
                      setTimeout(() => setCopiedPersonal(false), 2000);
                    }}
                    className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shadow-md"
                  >
                    {copiedPersonal ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>{lang === 'km' ? 'បានចម្លង!' : 'Copied!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>{lang === 'km' ? 'ចម្លង Link ភ្ញៀវ' : 'Copy Guest Link'}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Test View Action */}
            <div className="pt-1 flex items-center justify-between gap-3">
              <a
                href={customGuestName.trim() ? `/?invite=${data.id}&guest=${encodeURIComponent(customGuestName.trim())}` : `/?invite=${data.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#B8860B] via-amber-500 to-[#8C6D3B] text-white text-xs font-extrabold shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 text-center"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{lang === 'km' ? 'សាកល្បងបើកមើលធៀប Fullscreen លើ Mobile' : 'Open Mobile Fullscreen Preview'}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
