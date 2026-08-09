import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  CheckCircle2,
  QrCode,
  Copy,
  Sparkles,
  Send,
  ShieldCheck,
  ArrowRight,
  Upload,
  ImageIcon,
  LogIn,
  UserPlus,
  ArrowLeft,
  Check,
  Camera,
  Music,
  MapPin,
  Clock,
  Heart,
  FileText,
  Smartphone,
  CreditCard,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { safeFetchJson } from '../utils/apiClient';
import { PackageTier, PackageOrder, MemberAccount } from '../types';
import { notifyRealtimeEvent } from '../utils/realtime';
import { compressImage } from '../utils/imageCompressor';

interface PurchaseModalProps {
  selectedTier: PackageTier;
  lang: 'km' | 'en';
  loggedMember: MemberAccount | null;
  onClose: () => void;
  onOrderSubmitted: (newOrder: PackageOrder) => void;
  onOpenStatusCheck: () => void;
  onOpenAuth: () => void;
}

interface AdminQrConfig {
  qrImage: string;
  accountName: string;
  accountNumber: string;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  selectedTier,
  lang,
  loggedMember,
  onClose,
  onOrderSubmitted,
  onOpenStatusCheck,
  onOpenAuth,
}) => {
  const price = selectedTier === '35' ? 35 : 15;
  const maxPhotos = selectedTier === '35' ? 10 : 5;

  // Multi-step modal state:
  // step 1: Package Features & Plan Details
  // step 2: Pop-up KHQR Code Payment
  // step 3: Next Page - Upload KHQR Invoice Receipt
  // step 4: Submitted & Pending Admin Approval
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [memberName, setMemberName] = useState(loggedMember?.name || '');
  const [memberPhone, setMemberPhone] = useState(loggedMember?.phone || '');
  const [telegram, setTelegram] = useState('');
  const [paymentRef, setPaymentRef] = useState('');
  const [invoiceImage, setInvoiceImage] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [createdOrderCode, setCreatedOrderCode] = useState('');
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Admin QR config loaded dynamically from storage or default
  const [qrConfig, setQrConfig] = useState<AdminQrConfig>(() => {
    const saved = localStorage.getItem('mongkulkar_admin_qr');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      qrImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
      accountName: 'MONGKULKAR STUDIO',
      accountNumber: '012 345 678',
    };
  });

  useEffect(() => {
    if (loggedMember) {
      if (loggedMember.name) setMemberName(loggedMember.name);
      if (loggedMember.phone) setMemberPhone(loggedMember.phone);
    }
  }, [loggedMember]);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(qrConfig.accountNumber);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  // Mobile-Optimized Compressed Receipt Upload Handler
  const handleInvoiceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    setError(null);

    try {
      // Compress image to 1000px max width/height JPEG ~100KB-200KB max for mobile
      const compressedDataUrl = await compressImage(file, 1000, 1000, 0.75);
      setInvoiceImage(compressedDataUrl);
    } catch (err) {
      console.error('Error compressing receipt upload:', err);
      setError(
        lang === 'km'
          ? 'មិនអាចអានរូបភាពវិក្កយបត្របានឡើយ! សូមសាកល្បងជ្រើសរើសរូបភាពផ្សេងទៀត'
          : 'Failed to process receipt photo. Please try choosing another file.'
      );
    } finally {
      setIsCompressing(false);
      // Reset input value so re-selecting same file triggers onChange
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim()) {
      setError(lang === 'km' ? 'សូមបញ្ចូលឈ្មោះពេញរបស់អ្នក' : 'Please enter your full name');
      return;
    }
    if (!memberPhone.trim()) {
      setError(lang === 'km' ? 'សូមបញ្ចូលលេខទូរស័ព្ទរបស់អ្នក' : 'Please enter your phone number');
      return;
    }
    if (!invoiceImage) {
      setError(
        lang === 'km'
          ? 'សូមអាប់ឡូតរូបភាព Screenshot វិក្កយបត្រ KHQR របស់អ្នកជាមុនសិន!'
          : 'Please upload your KHQR invoice receipt screenshot first!'
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const orderCode = `ORD-${selectedTier}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrderPayload = {
      orderCode,
      memberName: memberName.trim(),
      memberPhone: memberPhone.trim(),
      telegram: telegram.trim() || memberPhone.trim(),
      packageType: selectedTier,
      price,
      paymentRef: paymentRef.trim() || 'ABA-KHQR-' + Math.floor(100000 + Math.random() * 900000),
      paymentProofUrl: invoiceImage,
      maxPhotos,
    };

    let newOrder: PackageOrder = {
      id: 'order-' + Date.now(),
      ...newOrderPayload,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    try {
      const res = await safeFetchJson('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrderPayload),
      });
      if (res.ok && res.data) {
        newOrder = res.data;
      }
    } catch (err) {
      console.warn('Backend API submission fallback to local storage:', err);
    }

    // Save to localStorage as backup safely
    try {
      const savedOrdersStr = localStorage.getItem('mongkulkar_orders');
      let ordersList: PackageOrder[] = [];
      if (savedOrdersStr) {
        try {
          ordersList = JSON.parse(savedOrdersStr);
        } catch (err) {
          ordersList = [];
        }
      }
      const existingIdx = ordersList.findIndex((o) => o.id === newOrder.id);
      if (existingIdx !== -1) {
        ordersList[existingIdx] = newOrder;
      } else {
        ordersList.unshift(newOrder);
      }
      // Store max 15 recent orders in localStorage to protect against storage quota limits
      if (ordersList.length > 15) {
        ordersList = ordersList.slice(0, 15);
      }
      localStorage.setItem('mongkulkar_orders', JSON.stringify(ordersList));
    } catch (err) {
      console.warn('localStorage quota warning caught:', err);
    }

    notifyRealtimeEvent('ORDER_SUBMITTED', newOrder);

    setCreatedOrderCode(newOrder.orderCode);
    setIsSubmitting(false);
    setCurrentStep(4);
    onOrderSubmitted(newOrder);
  };

  // Package feature items description
  const featuresList =
    selectedTier === '35'
      ? [
          { icon: Camera, textKm: 'ដាក់រូបថត Gallery អាល់ប៊ុមបានរហូតដល់ ១០ រូប', textEn: 'Up to 10 Gallery Photos' },
          { icon: Music, textKm: 'ដាក់ចម្រៀង Background តាមចំណង់ចំណូលចិត្ត', textEn: 'Custom Background Music MP3' },
          { icon: MapPin, textKm: 'ទីតាំងលើ Google Maps បង្ហាញផ្លូវទៅកាន់រោងការ', textEn: 'Live Google Maps Navigation' },
          { icon: Clock, textKm: 'នាឡិការាប់ថយក្រោយថ្ងៃមង្គលការ (Countdown)', textEn: 'Interactive Wedding Countdown' },
          { icon: Heart, textKm: 'ប្រព័ន្ធសរសេរសារជូនពរពីភ្ញៀវ (Wish Guestbook)', textEn: 'Guestbook Wish System' },
          { icon: FileText, textKm: 'ប្រព័ន្ធឆ្លើយតបវត្តមានភ្ញៀវ (RSVP Form)', textEn: 'Guest RSVP Form' },
          { icon: CreditCard, textKm: 'ដាក់ QR Code ទទួលបានចំណងដៃឌីជីថល (ABA QR)', textEn: 'ABA QR Code Digital Blessing' },
          { icon: Smartphone, textKm: 'ទាញយករូបភាព ឬ PDF ធៀបការសម្រាប់ Print', textEn: 'Export PDF & Image High-Res' },
          { icon: Sparkles, textKm: 'ប្រព័ន្ធ Studio ប្រើប្រាស់រហូត (Lifetime Access)', textEn: 'Lifetime Studio Access' },
        ]
      : [
          { icon: Camera, textKm: 'ដាក់រូបថត Gallery អាល់ប៊ុមបាន ៥ រូប', textEn: 'Up to 5 Gallery Photos' },
          { icon: Music, textKm: 'ដាក់ចម្រៀង Background', textEn: 'Background Music MP3' },
          { icon: MapPin, textKm: 'ទីតាំងលើ Google Maps បង្ហាញផ្លូវ', textEn: 'Live Google Maps Navigation' },
          { icon: Clock, textKm: 'នាឡិការាប់ថយក្រោយថ្ងៃមង្គលការ (Countdown)', textEn: 'Interactive Wedding Countdown' },
          { icon: Heart, textKm: 'ប្រព័ន្ធសរសេរសារជូនពរពីភ្ញៀវ', textEn: 'Guestbook Wish System' },
          { icon: CreditCard, textKm: 'ដាក់ QR Code ទទួលបានចំណងដៃ', textEn: 'ABA QR Code Digital Blessing' },
          { icon: Sparkles, textKm: 'ប្រព័ន្ធ Studio ប្រើប្រាស់រហូត (Lifetime Access)', textEn: 'Lifetime Studio Access' },
        ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-amber-200 overflow-hidden my-8">
        {/* Header with Progress Steps */}
        <div className="bg-gradient-to-r from-[#2C2117] via-[#3D2C1E] to-[#2C2117] p-6 text-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#B8860B] to-[#E6C687] flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-5 h-5 text-yellow-200" />
              </div>
              <div>
                <h3 className="font-moul text-base text-amber-200">
                  {lang === 'km'
                    ? `ទិញកញ្ចប់ ${price}$ (${selectedTier === '35' ? 'VIP 10 Photos' : 'Standard 5 Photos'})`
                    : `Purchase $${price} Package (${selectedTier === '35' ? 'VIP' : 'Standard'})`}
                </h3>
                <p className="text-[11px] text-amber-100/80">
                  {currentStep === 1
                    ? lang === 'km' ? 'ជំហាន ១/៣៖ ព័ត៌មានកញ្ចប់គម្រោង' : 'Step 1/3: Package Overview'
                    : currentStep === 2
                    ? lang === 'km' ? 'ជំហាន ២/៣៖ ទូទាត់ប្រាក់តាម ABA KHQR' : 'Step 2/3: KHQR Scan Payment'
                    : currentStep === 3
                    ? lang === 'km' ? 'ជំហាន ៣/៣៖ អាប់ឡូតវិក្កយបត្រ KHQR' : 'Step 3/3: Upload KHQR Receipt'
                    : lang === 'km' ? 'រង់ចាំ Admin អនុម័ត' : 'Awaiting Admin Approval'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Visual Step Progress Bar */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div
              className={`h-1.5 rounded-full transition-all ${
                currentStep >= 1 ? 'bg-amber-400' : 'bg-stone-700'
              }`}
            />
            <div
              className={`h-1.5 rounded-full transition-all ${
                currentStep >= 2 ? 'bg-amber-400' : 'bg-stone-700'
              }`}
            />
            <div
              className={`h-1.5 rounded-full transition-all ${
                currentStep >= 3 ? 'bg-amber-400' : 'bg-stone-700'
              }`}
            />
          </div>
        </div>

        {/* Modal Content Container */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* IF USER IS NOT LOGGED IN -> REQUIRE REGISTER/LOGIN FIRST! */}
          {!loggedMember ? (
            <div className="text-center py-8 space-y-6">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-[#B8860B] flex items-center justify-center mx-auto shadow-md">
                <UserPlus className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className={`text-xl font-bold text-stone-900 ${lang === 'km' ? 'font-moul' : 'font-playfair'}`}>
                  {lang === 'km' ? 'សូមចុះឈ្មោះ ឬចូលគណនីជាមុនសិន' : 'Please Register or Login First'}
                </h3>
                <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
                  {lang === 'km'
                    ? `ដើម្បីទិញកញ្ចប់សេវាកម្ម ${price}$ លោកអ្នកត្រូវចុះឈ្មោះបង្កើតគណនីសមាជិកនៅក្នុងប្រព័ន្ធជាមុនសិន ទើប Admin អាចផ្ញើ Activation Code ទៅកាន់គណនីរបស់អ្នកបាន!`
                    : `To purchase the $${price} package, please register a member account so Admin can deliver your Activation Code directly!`}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 max-w-sm mx-auto text-xs text-amber-900 font-bold space-y-1 text-left">
                <p>✨ {lang === 'km' ? `កញ្ចប់ដែលបានជ្រើសរើស៖ ${price}$ (${selectedTier === '35' ? 'VIP 10 Photos' : 'Standard 5 Photos'})` : `Selected Package: $${price}`}</p>
                <p>🔒 {lang === 'km' ? 'កូដ Activation នឹងរក្សាទុកក្នុងគណនីរបស់អ្នករហូត' : 'Activation Code will be permanently saved in your account'}</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuth();
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#B8860B] via-amber-500 to-[#8C6D3B] text-white font-extrabold text-xs shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{lang === 'km' ? 'ចុះឈ្មោះ / ចូលគណនី (Register / Login)' : 'Register / Login Now'}</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-100"
                >
                  {lang === 'km' ? 'បោះបង់' : 'Cancel'}
                </button>
              </div>
            </div>
          ) : currentStep === 1 ? (
            /* ================= STEP 1: PACKAGE OVERVIEW & PLAN DETAILS ================= */
            <div className="space-y-5 animate-fadeIn">
              {/* Logged Member Account Badge */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                    {lang === 'km' ? 'គណនីសមាជិកដែលកំពុងប្រើ' : 'Logged Member'}
                  </span>
                  <p className="font-extrabold text-stone-900">{memberName} ({memberPhone})</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                  ✓ Account Active
                </span>
              </div>

              {/* Package Summary Header Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300 flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#B8860B] text-white font-extrabold text-[10px] uppercase">
                    {selectedTier === '35' ? 'VIP Package' : 'Standard Package'}
                  </span>
                  <h4 className="font-moul text-base text-stone-900">
                    {lang === 'km' ? `កញ្ចប់សេវាកម្ម ${price}$` : `$${price} Package Plan`}
                  </h4>
                  <p className="text-xs text-stone-600">
                    {lang === 'km' ? 'ទទួលបានការបើកដំណើរការ Studio បង្កើតធៀបការគ្មានដែនកំណត់' : 'Full access to Studio Builder'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-extrabold text-[#B8860B]">${price}</span>
                  <span className="block text-[10px] font-bold text-stone-400 uppercase">One-Time Pay</span>
                </div>
              </div>

              {/* Features List Section */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#B8860B]" />
                  <span>{lang === 'km' ? 'មុខងារពិសេសទទួលបានក្នុងកញ្ចប់នេះ (Included Features):' : 'Included Features:'}</span>
                </h5>

                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 divide-y divide-stone-100 space-y-2.5">
                  {featuresList.map((feat, idx) => {
                    const IconComp = feat.icon;
                    return (
                      <div key={idx} className="pt-2 first:pt-0 flex items-start gap-2.5 text-xs text-stone-700">
                        <div className="p-1 rounded-lg bg-amber-100 text-[#B8860B] shrink-0 mt-0.5">
                          <IconComp className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold leading-relaxed">
                          {lang === 'km' ? feat.textKm : feat.textEn}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Proceed to Payment Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100"
                >
                  {lang === 'km' ? 'បោះបង់' : 'Cancel'}
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#B8860B] via-amber-500 to-[#8C6D3B] text-white text-xs font-extrabold shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                >
                  <span>{lang === 'km' ? 'ទូទាត់ប្រាក់ (Proceed to Payment)' : 'Proceed to Payment'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : currentStep === 2 ? (
            /* ================= STEP 2: POP-UP ADMIN ABA KHQR PAYMENT ================= */
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 space-y-3 text-center">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-[#B8860B]" />
                    <span className="font-bold text-xs text-stone-900">
                      {lang === 'km' ? 'ទូទាត់ប្រាក់តាម ABA KHQR' : 'Scan ABA KHQR to Pay'}
                    </span>
                  </div>
                  <span className="text-sm font-extrabold text-[#B8860B]">${price}.00 USD</span>
                </div>

                {/* ABA KHQR Image Card */}
                <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-md space-y-3">
                  <div className="w-52 h-52 bg-white p-2 rounded-2xl border-2 border-amber-300 mx-auto shadow-inner flex items-center justify-center overflow-hidden">
                    <img
                      src={qrConfig.qrImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80'}
                      alt="Admin ABA KHQR"
                      className="w-full h-full object-contain rounded-xl"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="space-y-1 text-center">
                    <p className="font-extrabold text-stone-900 text-sm">{qrConfig.accountName}</p>
                    <p className="text-xs text-stone-600 font-mono">ABA: {qrConfig.accountNumber}</p>

                    <button
                      type="button"
                      onClick={handleCopyAccount}
                      className="mt-1 px-3 py-1 rounded-lg bg-amber-100 text-amber-900 text-[11px] font-bold inline-flex items-center gap-1.5 hover:bg-amber-200"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>
                        {copiedAccount
                          ? (lang === 'km' ? 'បានចម្លង!' : 'Copied!')
                          : (lang === 'km' ? 'ចម្លងលេខគណនី' : 'Copy ABA Number')}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Instructions Box */}
                <div className="p-3 bg-white/80 rounded-xl border border-stone-200 text-stone-600 text-[11px] text-left space-y-1">
                  <p className="font-bold text-stone-800">
                    📲 {lang === 'km' ? 'របៀបទូទាត់ប្រាក់៖' : 'Instructions:'}
                  </p>
                  <p>1. {lang === 'km' ? `ស្កែន QR ខាងលើដើម្បីវេរប្រាក់ចំនួន $${price}.00` : `Scan QR code to transfer $${price}.00`}</p>
                  <p>2. {lang === 'km' ? 'ថតរូប Screenshot វិក្កយបត្រដែលបានវេរប្រាក់រួច' : 'Take a screenshot of the payment receipt'}</p>
                  <p>3. {lang === 'km' ? 'ចុចប៊ូតុង "បន្តទៅអាប់ឡូតវិក្កយបត្រ" នៅខាងក្រោម' : 'Click "Next Page to Upload Invoice KHQR" below'}</p>
                </div>
              </div>

              {/* Buttons Step 2 */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{lang === 'km' ? 'ត្រឡប់ក្រោយ' : 'Back'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#B8860B] via-amber-500 to-[#8C6D3B] text-white text-xs font-extrabold shadow-md hover:scale-105 transition-all flex items-center gap-1.5"
                >
                  <span>{lang === 'km' ? 'បន្តទៅអាប់ឡូតវិក្កយបត្រ (Next Step)' : 'Next: Upload Receipt'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : currentStep === 3 ? (
            /* ================= STEP 3: NEXT PAGE - UPLOAD INVOICE KHQR RECEIPT ================= */
            <form onSubmit={handleSubmitOrder} className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 space-y-4">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <h4 className="font-moul text-xs text-stone-900 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-[#B8860B]" />
                    <span>{lang === 'km' ? 'អាប់ឡូតរូបភាពវិក្កយបត្រ KHQR' : 'Upload KHQR Receipt'}</span>
                  </h4>
                  <span className="text-[11px] font-bold text-[#B8860B]">${price}.00 USD</span>
                </div>

                {/* Customer Contact Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-800 mb-1">
                      {lang === 'km' ? 'ឈ្មោះពេញរបស់អ្នក *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={memberName}
                      onChange={(e) => setMemberName(e.target.value)}
                      placeholder={lang === 'km' ? 'ឧ. សុខ ពិសិដ្ឋ' : 'e.g. Sok Piseth'}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#B8860B] focus:outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-800 mb-1">
                      {lang === 'km' ? 'លេខទូរស័ព្ទរបស់អ្នក *' : 'Phone Number *'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={memberPhone}
                      onChange={(e) => setMemberPhone(e.target.value)}
                      placeholder="012 345 678"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#B8860B] focus:outline-none bg-white"
                    />
                  </div>
                </div>

                {/* File Upload Area */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-800 mb-1.5">
                    {lang === 'km' ? 'រូបភាព Screenshot វិក្កយបត្រវេរប្រាក់ KHQR *' : 'KHQR Payment Receipt Screenshot *'}
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleInvoiceUpload}
                    className="hidden"
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-amber-400 hover:border-amber-600 bg-white hover:bg-amber-50 rounded-2xl cursor-pointer transition-all text-center shadow-sm touch-manipulation"
                  >
                    {isCompressing ? (
                      <div className="py-4 space-y-2 text-stone-600">
                        <Loader2 className="w-7 h-7 text-[#B8860B] animate-spin mx-auto" />
                        <p className="text-xs font-bold text-[#B8860B]">
                          {lang === 'km' ? 'កំពុងរៀបចំ និងបង្ហាប់រូបភាព...' : 'Processing receipt image...'}
                        </p>
                      </div>
                    ) : invoiceImage && invoiceImage.trim() !== '' ? (
                      <div className="space-y-2">
                        <img
                          src={invoiceImage}
                          alt="Uploaded KHQR Receipt"
                          className="h-36 object-contain rounded-xl border border-amber-300 mx-auto shadow-md"
                        />
                        <p className="text-xs text-emerald-700 font-bold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{lang === 'km' ? 'បានភ្ជាប់រូបវិក្កយបត្ររួចរាល់! (ចុចដើម្បីប្តូររូប)' : 'Invoice attached! (Tap to change)'}</span>
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 py-2">
                        <ImageIcon className="w-10 h-10 text-[#B8860B] mx-auto opacity-80 animate-bounce" />
                        <p className="text-xs font-bold text-stone-800">
                          {lang === 'km' ? 'ចុចទីនេះដើម្បីជ្រើសរើសរូបភាពវិក្កយបត្រ KHQR' : 'Tap here to upload KHQR receipt screenshot'}
                        </p>
                        <p className="text-[10px] text-stone-500">
                          Supports PNG, JPG, JPEG (Screenshot from ABA/KHQR)
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="mt-2 px-4 py-1.5 rounded-lg bg-amber-100 text-[#B8860B] text-xs font-bold hover:bg-amber-200 transition-colors inline-flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{lang === 'km' ? 'ជ្រើសរើសរូបភាព (Select Receipt)' : 'Select Receipt'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Ref Input (Optional) */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    {lang === 'km' ? 'លេខប្រតិបត្តិការទូទាត់ Transaction Ref (បើមាន)' : 'Payment Transaction Ref (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    placeholder="ឧទាហរណ៍៖ ABA-9823471"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#B8860B] focus:outline-none bg-white"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Buttons Step 3 */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{lang === 'km' ? 'ត្រឡប់ក្រោយ' : 'Back'}</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || isCompressing}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#B8860B] via-amber-500 to-[#8C6D3B] text-white text-xs font-extrabold shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{lang === 'km' ? 'កំពុងផ្ញើទៅកាន់ Admin...' : 'Submitting to Admin...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{lang === 'km' ? 'ផ្ញើទៅកាន់ Admin ដើម្បីអនុម័ត' : 'Submit to Admin for Approval'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* ================= STEP 4: AWAITING ADMIN APPROVAL (PENDING SCREEN) ================= */
            <div className="text-center py-6 space-y-6 animate-fadeIn">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-amber-100 animate-ping opacity-40"></div>
                <div className="relative w-16 h-16 rounded-full bg-amber-100 text-[#B8860B] border-2 border-amber-300 flex items-center justify-center shadow-md">
                  <Clock className="w-9 h-9 animate-spin-slow text-[#B8860B]" />
                </div>
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-amber-100 text-[#B8860B] font-extrabold text-[11px] inline-flex items-center gap-1.5 border border-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  <span>{lang === 'km' ? 'ស្ថានភាព៖ កំពុងរង់ចាំ Admin អនុម័ត' : 'Status: Pending Admin Approval'}</span>
                </span>

                <h3 className={`text-lg font-bold text-stone-900 ${lang === 'km' ? 'font-moul' : 'font-playfair'}`}>
                  {lang === 'km' ? 'កំពុងរង់ចាំការពិនិត្យ និងអនុម័តពី Admin' : 'Awaiting Admin Verification & Approval'}
                </h3>

                <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
                  {lang === 'km'
                    ? 'វិក្កយបត្រទូទាត់របស់អ្នកត្រូវបានផ្ញើទៅកាន់ Admin រួចរាល់។ សូមរង់ចាំ Admin ពិនិត្យផ្ទៀងផ្ទាត់! នៅពេល Admin ចុច "អនុម័ត" ប្រព័ន្ធនឹងផ្ញើ Activation Code ចូលទៅកាន់ Notification ក្នុងគណនីរបស់អ្នកភ្លាមៗ។'
                    : 'Your payment invoice has been submitted. Please wait for Admin verification. Once approved, your Activation Code will be delivered directly to your account Notifications.'}
                </p>
              </div>

              {/* Notification Explanation Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 text-xs text-stone-800 max-w-sm mx-auto space-y-2 text-left shadow-sm">
                <div className="flex items-center gap-2 font-bold text-[#B8860B]">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <span>{lang === 'km' ? 'ព័ត៌មានទទួល Activation Code:' : 'How to receive Activation Code:'}</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed pl-1">
                  {lang === 'km'
                    ? 'លោកអ្នកមិនចាំបាច់រង់ចាំលើផ្ទាំងនេះទេ! នៅពេលដែល Admin អនុម័តរួចរាល់ លោកអ្នកនឹងទទួលបានសារ Notification Alert នៅក្នុងគណនីរបស់អ្នក ហើយចុច "បើកដំណើរការ" បានភ្លាមៗ។'
                    : 'You do not need to wait on this screen! Once approved by Admin, you will receive a Notification Alert in your account to activate your Studio right away.'}
                </p>
              </div>

              {/* Action Buttons Step 4 */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenStatusCheck();
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#B8860B] via-amber-500 to-[#8C6D3B] text-white font-extrabold text-xs shadow-md hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <span>{lang === 'km' ? 'ពិនិត្យសារ Notification' : 'Check Notifications'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100"
                >
                  {lang === 'km' ? 'យល់ព្រម / បិទផ្ទាំងនេះ' : 'Close'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
