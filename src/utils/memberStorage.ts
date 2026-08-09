import { MemberAccount, MemberNotification, PackageOrder, UnlockedPackage } from '../types';
import { notifyRealtimeEvent } from './realtime';
import { safeFetchJson } from './apiClient';

const LOGGED_PHONE_KEY = 'mongkulkar_logged_phone';
const LOCAL_MEMBERS_KEY = 'mongkulkar_local_members_backup';

let inMemoryLoggedMember: MemberAccount | null = null;

// Local Backup Helpers
const getLocalMembersBackup = (): MemberAccount[] => {
  try {
    const raw = localStorage.getItem(LOCAL_MEMBERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [
    {
      id: "mem-demo-1",
      name: "សុខ ពិសិដ្ឋ",
      phone: "012345678",
      password: "123456",
      createdAt: new Date().toISOString(),
      notifications: [
        {
          id: "notif-demo-1",
          memberPhone: "012345678",
          titleKm: "ស្វាគមន៍មកកាន់ មង្គលការ E-Invite",
          titleEn: "Welcome to MongkulKar E-Invite",
          messageKm: "សូមជ្រើសរើសកញ្ចប់ 15$ ឬ 35$ ដើម្បីទទួលបាន Activation Code បើក Studio បង្កើតធៀបការ!",
          messageEn: "Please select a $15 or $35 package to receive an Activation Code and unlock Studio Builder!",
          isRead: false,
          createdAt: new Date().toISOString(),
        },
      ],
    },
  ];
};

const saveLocalMemberBackup = (member: MemberAccount) => {
  try {
    const list = getLocalMembersBackup();
    const idx = list.findIndex((m) => m.phone.replace(/\s+/g, '') === member.phone.replace(/\s+/g, ''));
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...member };
    } else {
      list.unshift(member);
    }
    localStorage.setItem(LOCAL_MEMBERS_KEY, JSON.stringify(list));
  } catch (e) {}
};

// Get currently logged-in member from Cloud server / session
export const getLoggedMember = (): MemberAccount | null => {
  return inMemoryLoggedMember;
};

// Set logged-in member state
export const setLoggedMember = (member: MemberAccount | null) => {
  inMemoryLoggedMember = member;
  if (member && member.phone) {
    sessionStorage.setItem(LOGGED_PHONE_KEY, member.phone);
    saveLocalMemberBackup(member);
  } else {
    sessionStorage.removeItem(LOGGED_PHONE_KEY);
    sessionStorage.removeItem('mongkulkar_admin_auth');
  }
};

// Fetch current logged-in member from Cloud server if logged in
export const fetchCurrentLoggedMember = async (): Promise<MemberAccount | null> => {
  const phone = sessionStorage.getItem(LOGGED_PHONE_KEY);
  if (!phone) return null;

  if (phone === 'admin' || sessionStorage.getItem('mongkulkar_admin_auth') === 'true') {
    const adminAcc: MemberAccount = {
      id: 'admin',
      name: 'គណនី Admin System',
      phone: 'admin',
      password: 'admin',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      activatedPackage: {
        packageType: '35',
        activationCode: 'ADMIN-VIP',
        memberName: 'Admin System',
        memberPhone: 'admin',
        maxPhotos: 10,
        unlockedAt: new Date().toISOString(),
      },
      notifications: [],
    };
    inMemoryLoggedMember = adminAcc;
    return adminAcc;
  }

  try {
    const res = await safeFetchJson<MemberAccount>(`/api/members/current?phone=${encodeURIComponent(phone)}`);
    if (res.ok && res.data) {
      inMemoryLoggedMember = res.data;
      saveLocalMemberBackup(res.data);
      return res.data;
    }
  } catch (err) {
    console.warn('Could not fetch current member from cloud:', err);
  }

  // Fallback to local backup
  const localList = getLocalMembersBackup();
  const matched = localList.find((m) => m.phone.replace(/\s+/g, '') === phone.replace(/\s+/g, ''));
  if (matched) {
    inMemoryLoggedMember = matched;
    return matched;
  }

  return inMemoryLoggedMember;
};

// Logout member
export const logoutMember = () => {
  setLoggedMember(null);
  notifyRealtimeEvent('MEMBER_LOGOUT');
};

// Fetch all registered members from Cloud server and merge with local backup
export const getMembers = async (): Promise<MemberAccount[]> => {
  let serverMembers: MemberAccount[] = [];
  try {
    const res = await safeFetchJson<MemberAccount[]>('/api/admin/members');
    if (res.ok && Array.isArray(res.data)) {
      serverMembers = res.data;
    }
  } catch (err) {
    console.warn('Could not fetch members from cloud server:', err);
  }

  const localList = getLocalMembersBackup();
  const map = new Map<string, MemberAccount>();

  serverMembers.forEach((m) => {
    if (m.phone !== 'admin' && m.id !== 'admin') {
      const key = m.phone ? m.phone.replace(/\s+/g, '') : m.id;
      map.set(key, m);
    }
  });

  localList.forEach((m) => {
    if (m.phone !== 'admin' && m.id !== 'admin' && m.id !== 'mem-demo-1') {
      const key = m.phone ? m.phone.replace(/\s+/g, '') : m.id;
      if (!map.has(key)) {
        map.set(key, m);
      }
    } else if (m.id === 'mem-demo-1' && !map.has('012345678')) {
      map.set('012345678', m);
    }
  });

  return Array.from(map.values());
};

// Login member via Cloud API or Local Fallback
export const loginMemberAsync = async (phone: string, password?: string): Promise<MemberAccount> => {
  const trimmedPhone = phone.trim().replace(/\s+/g, '');
  const trimmedPassword = password ? password.trim() : '';

  if (!trimmedPhone) {
    throw new Error('សូមបញ្ចូលលេខទូរស័ព្ទ (Please enter phone number)');
  }
  if (!trimmedPassword) {
    throw new Error('សូមបញ្ចូលពាក្យសម្ងាត់ (Please enter password)');
  }

  const res = await safeFetchJson<MemberAccount>('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: trimmedPhone, password: trimmedPassword }),
  });

  if (res.ok && res.data) {
    setLoggedMember(res.data);
    notifyRealtimeEvent('MEMBER_LOGIN', res.data);
    return res.data;
  }

  // If server responded with explicit business logic error (e.g. Wrong Password)
  if (res.error && (res.error.includes('ពាក្យសម្ងាត់') || res.error.includes('password'))) {
    throw new Error(res.error);
  }

  // Fallback check against local backup
  const localList = getLocalMembersBackup();
  const matched = localList.find((m) => m.phone.replace(/\s+/g, '') === trimmedPhone);

  if (matched) {
    if (matched.password && matched.password.trim() !== trimmedPassword) {
      throw new Error('ពាក្យសម្ងាត់មិនត្រឹមត្រូវឡើយ! (Incorrect password)');
    }
    setLoggedMember(matched);
    notifyRealtimeEvent('MEMBER_LOGIN', matched);
    return matched;
  }

  if (res.error) {
    throw new Error(res.error);
  }

  throw new Error('មិនទាន់មានគណនីជាមួយលេខទូរស័ព្ទនេះទេ! សូមចុះឈ្មោះបង្កើតគណនីថ្មី (Account not found. Please register first)');
};

// Register member via Cloud API
export const registerMemberAsync = async (name: string, phone: string, password?: string): Promise<MemberAccount> => {
  const trimmedName = name.trim();
  const trimmedPhone = phone.trim().replace(/\s+/g, '');
  const trimmedPassword = password ? password.trim() : '';

  if (!trimmedName) throw new Error('សូមបញ្ចូលឈ្មោះពេញរបស់អ្នក (Please enter your full name)');
  if (!trimmedPhone) throw new Error('សូមបញ្ចូលលេខទូរស័ព្ទ (Please enter your phone number)');
  if (!trimmedPassword) throw new Error('សូមបញ្ចូលពាក្យសម្ងាត់សម្រាប់បង្កើតគណនី (Please create a password)');

  const res = await safeFetchJson<MemberAccount>('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: trimmedName, phone: trimmedPhone, password: trimmedPassword }),
  });

  if (res.ok && res.data) {
    setLoggedMember(res.data);
    notifyRealtimeEvent('MEMBER_REGISTER', res.data);
    return res.data;
  }

  if (res.error && (res.error.includes('ចុះឈ្មោះរួចហើយ') || res.error.includes('registered'))) {
    throw new Error(res.error);
  }

  // Local fallback registration
  const nowIso = new Date().toISOString();
  const newMember: MemberAccount = {
    id: "mem-" + Date.now(),
    name: trimmedName,
    phone: trimmedPhone,
    password: trimmedPassword,
    createdAt: nowIso,
    lastLoginAt: nowIso,
    notifications: [
      {
        id: "notif-" + Date.now(),
        memberPhone: trimmedPhone,
        titleKm: "គណនីរបស់អ្នកត្រូវបានបង្កើតជោគជ័យ!",
        titleEn: "Account Created Successfully!",
        messageKm: "ស្វាគមន៍មកកាន់ប្រព័ន្ធធៀបការឌីជីថល! សូមជ្រើសរើសកញ្ចប់សេវាកម្មដើម្បីទទួលបាន Activation Code បើក Studio!",
        messageEn: "Welcome to MongkulKar! Choose a package plan to activate your Studio Builder.",
        isRead: false,
        createdAt: nowIso,
      },
    ],
  };

  setLoggedMember(newMember);
  notifyRealtimeEvent('MEMBER_REGISTER', newMember);
  return newMember;
};

// Activate package for member on Cloud server
export const activateMemberPackageAsync = async (phone: string, code: string): Promise<UnlockedPackage> => {
  const res = await safeFetchJson<{ member: MemberAccount; activatedPackage: UnlockedPackage }>('/api/activate-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code }),
  });

  if (res.ok && res.data && res.data.activatedPackage) {
    if (res.data.member) {
      setLoggedMember(res.data.member);
    }
    notifyRealtimeEvent('MEMBER_UPDATED', res.data.member);
    return res.data.activatedPackage;
  }

  if (res.error) {
    throw new Error(res.error);
  }

  throw new Error('កូដ Activation មិនត្រឹមត្រូវ (Invalid Activation Code)');
};

// Legacy sync helper kept for compatibility
export const activateMemberPackage = (phone: string, unlocked: UnlockedPackage): MemberAccount => {
  if (inMemoryLoggedMember && inMemoryLoggedMember.phone === phone) {
    inMemoryLoggedMember = { ...inMemoryLoggedMember, activatedPackage: unlocked };
  }
  return inMemoryLoggedMember || {
    id: 'mem-' + Date.now(),
    name: unlocked.memberName || 'Member',
    phone: phone,
    createdAt: new Date().toISOString(),
    activatedPackage: unlocked,
    notifications: [],
  };
};

// Add Notification to member via Cloud API
export const addMemberNotification = async (
  phone: string,
  notification: Omit<MemberNotification, 'id' | 'memberPhone' | 'createdAt' | 'isRead'>
) => {
  notifyRealtimeEvent('NOTIFICATION_SENT', { phone, notification });
};

// Mark notifications as read on Cloud server
export const markNotificationsRead = async (phone: string) => {
  try {
    await safeFetchJson('/api/notifications/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    if (inMemoryLoggedMember && inMemoryLoggedMember.phone === phone) {
      inMemoryLoggedMember = {
        ...inMemoryLoggedMember,
        notifications: (inMemoryLoggedMember.notifications || []).map((n) => ({ ...n, isRead: true })),
      };
    }
  } catch (err) {
    console.warn('Failed to mark notifications read on cloud server:', err);
  }
};

