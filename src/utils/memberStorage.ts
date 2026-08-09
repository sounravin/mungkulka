import { MemberAccount, MemberNotification, PackageOrder, UnlockedPackage } from '../types';
import { notifyRealtimeEvent } from './realtime';

const LOGGED_PHONE_KEY = 'mongkulkar_logged_phone';

let inMemoryLoggedMember: MemberAccount | null = null;

// Get currently logged-in member from Cloud server / session
export const getLoggedMember = (): MemberAccount | null => {
  return inMemoryLoggedMember;
};

// Set logged-in member state
export const setLoggedMember = (member: MemberAccount | null) => {
  inMemoryLoggedMember = member;
  if (member && member.phone) {
    sessionStorage.setItem(LOGGED_PHONE_KEY, member.phone);
  } else {
    sessionStorage.removeItem(LOGGED_PHONE_KEY);
    sessionStorage.removeItem('mongkulkar_admin_auth');
  }
};

// Fetch current logged-in member from Cloud server if logged in
export const fetchCurrentLoggedMember = async (): Promise<MemberAccount | null> => {
  const phone = sessionStorage.getItem(LOGGED_PHONE_KEY);
  if (!phone) return null;

  try {
    const res = await fetch(`/api/members/current?phone=${encodeURIComponent(phone)}`);
    if (res.ok) {
      const member: MemberAccount = await res.json();
      inMemoryLoggedMember = member;
      return member;
    }
  } catch (err) {
    console.warn('Could not fetch current member from cloud:', err);
  }
  return inMemoryLoggedMember;
};

// Logout member
export const logoutMember = () => {
  setLoggedMember(null);
  notifyRealtimeEvent('MEMBER_LOGOUT');
};

// Fetch all registered members from Cloud server
export const getMembers = async (): Promise<MemberAccount[]> => {
  try {
    const res = await fetch('/api/admin/members');
    if (res.ok) {
      const members: MemberAccount[] = await res.json();
      return members;
    }
  } catch (err) {
    console.warn('Could not fetch members from cloud server:', err);
  }
  return [];
};

// Login member via Cloud API
export const loginMemberAsync = async (phone: string, password?: string): Promise<MemberAccount> => {
  const trimmedPhone = phone.trim().replace(/\s+/g, '');
  const trimmedPassword = password ? password.trim() : '';

  if (!trimmedPhone) {
    throw new Error('សូមបញ្ចូលលេខទូរស័ព្ទ (Please enter phone number)');
  }
  if (!trimmedPassword) {
    throw new Error('សូមបញ្ចូលពាក្យសម្ងាត់ (Please enter password)');
  }

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: trimmedPhone, password: trimmedPassword }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Login failed');
  }

  setLoggedMember(data);
  notifyRealtimeEvent('MEMBER_LOGIN', data);
  return data;
};

// Register member via Cloud API
export const registerMemberAsync = async (name: string, phone: string, password?: string): Promise<MemberAccount> => {
  const trimmedName = name.trim();
  const trimmedPhone = phone.trim().replace(/\s+/g, '');
  const trimmedPassword = password ? password.trim() : '';

  if (!trimmedName) throw new Error('សូមបញ្ចូលឈ្មោះពេញរបស់អ្នក (Please enter your full name)');
  if (!trimmedPhone) throw new Error('សូមបញ្ចូលលេខទូរស័ព្ទ (Please enter your phone number)');
  if (!trimmedPassword) throw new Error('សូមបញ្ចូលពាក្យសម្ងាត់សម្រាប់បង្កើតគណនី (Please create a password)');

  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: trimmedName, phone: trimmedPhone, password: trimmedPassword }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Registration failed');
  }

  setLoggedMember(data);
  notifyRealtimeEvent('MEMBER_REGISTER', data);
  return data;
};

// Activate package for member on Cloud server
export const activateMemberPackageAsync = async (phone: string, code: string): Promise<UnlockedPackage> => {
  const res = await fetch('/api/activate-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Activation failed');
  }

  if (data.member) {
    setLoggedMember(data.member);
  }
  notifyRealtimeEvent('MEMBER_UPDATED', data.member);
  return data.activatedPackage;
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
  // Server handles notifications on order approval/rejection or status changes
  notifyRealtimeEvent('NOTIFICATION_SENT', { phone, notification });
};

// Mark notifications as read on Cloud server
export const markNotificationsRead = async (phone: string) => {
  try {
    await fetch('/api/notifications/read', {
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
