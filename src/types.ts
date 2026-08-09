export type Language = 'km' | 'en';

export type TemplateId =
  | 'wedgo-floral'
  | 'chateau-blue'
  | 'velvet-ruby'
  | string;

export interface ParentNames {
  groomFather: string;
  groomMother: string;
  brideFather: string;
  brideMother: string;
}

export interface ScheduleItem {
  id: string;
  time: string;
  titleKm: string;
  titleEn: string;
  descriptionKm?: string;
  descriptionEn?: string;
  iconName?: string;
}

export interface GuestWish {
  id: string;
  guestName: string;
  message: string;
  attendance: 'attending' | 'regret' | 'maybe';
  guestCount: number;
  createdAt: string;
}

export interface BankBlessing {
  bankName: string;
  accountName: string;
  accountNumber: string;
  qrCodeUrl: string;
  currency: 'USD' | 'KHR' | 'BOTH';
}

export interface WeddingInvitationData {
  id: string;
  slug: string;
  templateId: TemplateId;
  
  // Couple Information
  groomNameKm: string;
  groomNameEn: string;
  groomTitleKm?: string;
  brideNameKm: string;
  brideNameEn: string;
  brideTitleKm?: string;
  parents: ParentNames;
  
  // Date & Time
  weddingDateIso: string; // e.g. "2026-06-21"
  weddingTimeKm: string; // e.g. "ម៉ោង ៥:០០ នាទីល្ងាច"
  weddingTimeEn: string; // e.g. "5:00 PM Onwards"
  lunarDateKm: string; // e.g. "ថ្ងៃអាទិត្យ ៧កើត ខែជេស្ឋ ឆ្នាំខាល ចត្វាស័ក"
  
  // Location
  venueNameKm: string;
  venueNameEn: string;
  addressKm: string;
  addressEn: string;
  googleMapUrl: string;
  
  // Audio & Media
  musicTrack: string; // preset key or URL
  coverPhotoUrl: string;
  couplePhotoUrl: string;
  galleryPhotos: string[];
  
  // Features
  schedule: ScheduleItem[];
  themeColor?: string;
  themeColors?: string[];
  bankBlessing: BankBlessing;
  wishes: GuestWish[];
  
  // Meta
  welcomeMessageKm?: string;
  welcomeMessageEn?: string;
  contactPhone?: string;
}

export interface TemplateTheme {
  id: TemplateId;
  nameKm: string;
  nameEn: string;
  taglineKm: string;
  taglineEn: string;
  badge: string;
  previewImage: string;
  bgGradient: string;
  accentColor: string;
  borderColor: string;
  headerFontClass: string;
  bodyFontClass: string;
  cardBgClass: string;
  gatePattern: 'gold-gate' | 'floral-arch' | 'palace-arch' | 'temple-arch' | 'modern-arch' | 'velvet-ruby-card' | string;
  isCustom?: boolean;
  htmlContent?: string;
  cssContent?: string;
  customFont?: string;
  uploadedAt?: string;
  zipFileName?: string;
}

export type PackageTier = '15' | '35';

export interface PackageOrder {
  id: string;
  orderCode: string;
  memberName: string;
  memberPhone: string;
  telegram?: string;
  packageType: PackageTier;
  price: number;
  paymentRef?: string;
  paymentProofUrl?: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  activationCode?: string;
  maxPhotos: number;
  notes?: string;
}

export interface MemberNotification {
  id: string;
  memberPhone: string;
  titleKm: string;
  titleEn: string;
  messageKm: string;
  messageEn: string;
  activationCode?: string;
  packageType?: PackageTier;
  isRead: boolean;
  createdAt: string;
}

export interface MemberAccount {
  id: string;
  name: string;
  phone: string;
  password?: string;
  createdAt: string;
  lastLoginAt?: string;
  activatedPackage?: UnlockedPackage | null;
  notifications: MemberNotification[];
}

export interface UnlockedPackage {
  packageType: PackageTier;
  activationCode: string;
  memberName: string;
  memberPhone: string;
  maxPhotos: number;
  unlockedAt: string;
}

