import React, { useState, useEffect } from 'react';
import { safeFetchJson } from '../utils/apiClient';
import {
  ShieldCheck,
  Lock,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Users,
  Copy,
  Plus,
  Search,
  LogOut,
  Sparkles,
  Check,
  AlertCircle,
  Phone,
  Wand2,
  FileText,
  Eye,
  EyeOff,
  Palette,
  Edit3,
  Send,
  X,
  QrCode,
  Upload,
  Save,
  Trash2,
} from 'lucide-react';
import { PackageOrder, PackageTier, UnlockedPackage, MemberAccount, TemplateTheme } from '../types';
import { addMemberNotification, activateMemberPackage, getMembers, getLoggedMember, setLoggedMember } from '../utils/memberStorage';
import { subscribeRealtime, notifyRealtimeEvent } from '../utils/realtime';
import { getSystemConfig, saveSystemConfig, SystemConfig } from '../utils/systemConfig';
import { compressImage } from '../utils/imageCompressor';
import {
  getAllTemplates,
  fetchCustomTemplates,
  toggleTemplateVisibility,
  updateTemplateOverride,
  publishTemplatesToMembers,
  processZipTemplate,
  saveCustomTemplate,
  deleteCustomTemplate,
} from '../utils/templateManager';
import { InvitationCard } from './InvitationCard';
import { SAMPLE_INVITATIONS } from '../data/presetInvitations';

interface AdminDashboardProps {
  lang: 'km' | 'en';
  onExitAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ lang, onExitAdmin }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const current = getLoggedMember();
    return (
      sessionStorage.getItem('mongkulkar_admin_auth') === 'true' ||
      current?.id === 'admin' ||
      current?.phone === 'admin'
    );
  });

  useEffect(() => {
    const current = getLoggedMember();
    if (
      sessionStorage.getItem('mongkulkar_admin_auth') === 'true' ||
      current?.id === 'admin' ||
      current?.phone === 'admin'
    ) {
      setIsAuthenticated(true);
      sessionStorage.setItem('mongkulkar_admin_auth', 'true');
    }
  }, []);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const [orders, setOrders] = useState<PackageOrder[]>([]);
  const [members, setMembers] = useState<MemberAccount[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'members' | 'templates'>('orders');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [memberFilterStatus, setMemberFilterStatus] = useState<'all' | 'activated' | 'free'>('all');
  const [selectedMemberDetail, setSelectedMemberDetail] = useState<MemberAccount | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Template Control Panel State
  const [allAdminTemplates, setAllAdminTemplates] = useState<TemplateTheme[]>(() => getAllTemplates());
  const [editingTemplate, setEditingTemplate] = useState<TemplateTheme | null>(null);
  const [previewingTemplate, setPreviewingTemplate] = useState<TemplateTheme | null>(null);
  const [templateSearchTerm, setTemplateSearchTerm] = useState('');
  const [templateFilterStatus, setTemplateFilterStatus] = useState<'all' | 'visible' | 'hidden'>('all');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccessMessage, setPublishSuccessMessage] = useState<string | null>(null);
  const [isUploadingZip, setIsUploadingZip] = useState(false);

  const refreshAdminTemplates = () => {
    setAllAdminTemplates(getAllTemplates());
  };

  const handleToggleHideTemplate = (id: string) => {
    toggleTemplateVisibility(id);
    refreshAdminTemplates();
  };

  const handlePublishTemplates = async () => {
    setIsPublishing(true);
    await publishTemplatesToMembers();
    setIsPublishing(false);
    setPublishSuccessMessage(
      lang === 'km'
        ? '🚀 បានដាក់បញ្ចូល និង Sync បណ្តុំ Template ទៅកាន់ User Member រួចរាល់!'
        : '🚀 Templates published and synced to user members successfully!'
    );
    setTimeout(() => setPublishSuccessMessage(null), 4000);
  };

  const handleZipFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingZip(true);
    try {
      const processed = await processZipTemplate(file);
      await saveCustomTemplate(processed);
      refreshAdminTemplates();
    } catch (err) {
      console.error('Error uploading zip template:', err);
    } finally {
      setIsUploadingZip(false);
      e.target.value = '';
    }
  };

  const handleSaveEditedTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;
    updateTemplateOverride(editingTemplate.id, {
      nameKm: editingTemplate.nameKm,
      nameEn: editingTemplate.nameEn,
      badge: editingTemplate.badge,
      taglineKm: editingTemplate.taglineKm,
      taglineEn: editingTemplate.taglineEn,
    });
    if (editingTemplate.isCustom) {
      await saveCustomTemplate(editingTemplate);
    }
    setEditingTemplate(null);
    refreshAdminTemplates();
  };

  const handleDeleteCustomTemplate = async (id: string) => {
    if (confirm(lang === 'km' ? 'តើអ្នកប្រាកដថាលុប Template នេះទេ?' : 'Are you sure you want to delete this template?')) {
      await deleteCustomTemplate(id);
      refreshAdminTemplates();
    }
  };

  // Invoice modal state
  const [selectedInvoiceUrl, setSelectedInvoiceUrl] = useState<string | null>(null);

  // Manual code creation modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newPackageType, setNewPackageType] = useState<PackageTier>('35');

  // KHQR Customization modal state
  const [isQrSettingsOpen, setIsQrSettingsOpen] = useState(false);
  const [qrImage, setQrImage] = useState<string>('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80');
  const [qrAccountName, setQrAccountName] = useState<string>('MONGKULKAR STUDIO');
  const [qrAccountNumber, setQrAccountNumber] = useState<string>('012 345 678');
  const [qrSaveSuccess, setQrSaveSuccess] = useState(false);

  useEffect(() => {
    safeFetchJson('/api/admin/qr')
      .then((res) => {
        if (res.ok && res.data) {
          if (res.data.qrImage) setQrImage(res.data.qrImage);
          if (res.data.accountName) setQrAccountName(res.data.accountName);
          if (res.data.accountNumber) setQrAccountNumber(res.data.accountNumber);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveQrSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const config = {
      qrImage,
      accountName: qrAccountName.trim() || 'MONGKULKAR STUDIO',
      accountNumber: qrAccountNumber.trim() || '012 345 678',
    };

    try {
      await safeFetchJson('/api/admin/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
    } catch (err) {}

    setQrSaveSuccess(true);
    setTimeout(() => {
      setQrSaveSuccess(false);
      setIsQrSettingsOpen(false);
    }, 1200);
  };

  const handleAdminQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 800, 800, 0.85);
        setQrImage(compressed);
      } catch (err) {
        console.error('Error compressing QR image:', err);
      }
    }
  };

  // System Logo & Branding Modal State
  const [isLogoSettingsOpen, setIsLogoSettingsOpen] = useState(false);
  const [sysLogoConfig, setSysLogoConfig] = useState<SystemConfig>(() => getSystemConfig());
  const [logoSaveSuccess, setLogoSaveSuccess] = useState(false);

  const handleSaveLogoSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSystemConfig(sysLogoConfig);
    setLogoSaveSuccess(true);
    setTimeout(() => {
      setLogoSaveSuccess(false);
      setIsLogoSettingsOpen(false);
    }, 1200);
  };

  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 800, 800, 0.85);
        setSysLogoConfig((prev) => ({ ...prev, logoUrl: compressed }));
      } catch (err) {
        console.error('Error compressing logo image:', err);
      }
    }
  };

  // Load orders from Cloud API
  const loadOrders = async () => {
    try {
      const res = await safeFetchJson('/api/orders');
      if (res.ok && res.data) {
        setOrders(res.data);
      }
    } catch (e) {
      console.warn('Could not fetch orders from cloud server:', e);
    }
  };

  // Load registered member accounts from Cloud API / Storage
  const loadMembers = async () => {
    try {
      const memberList = await getMembers();
      setMembers(memberList);
    } catch (e) {
      console.warn('Could not fetch members:', e);
    }
  };

  const [realtimeToast, setRealtimeToast] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
      loadMembers();
      fetchCustomTemplates().then(() => {
        setAllAdminTemplates(getAllTemplates());
      });
    }

    const handleTemplatesUpdated = () => {
      setAllAdminTemplates(getAllTemplates());
    };

    window.addEventListener('templates-updated', handleTemplatesUpdated);
    return () => window.removeEventListener('templates-updated', handleTemplatesUpdated);
  }, [isAuthenticated, activeTab]);

  // Subscribe to Realtime events across tabs & components
  useEffect(() => {
    const unsubscribe = subscribeRealtime((event) => {
      if (event.type === 'ORDER_SUBMITTED') {
        loadOrders();
        loadMembers();
        const order: PackageOrder = event.data;
        const msg = lang === 'km'
          ? `🔔 បញ្ជាទិញថ្មី! សមាជិក ${order.memberName || order.memberPhone} បានទិញកញ្ចប់ ${order.price}$ (${order.orderCode})`
          : `🔔 New Order! Member ${order.memberName || order.memberPhone} purchased $${order.price} package (${order.orderCode})`;
        setRealtimeToast(msg);
        setTimeout(() => setRealtimeToast(null), 6000);
      } else if (event.type === 'MEMBER_REGISTER' || event.type === 'MEMBER_LOGIN' || event.type === 'MEMBER_UPDATED') {
        loadMembers();
        const mem = event.data;
        if (mem) {
          const action = event.type === 'MEMBER_REGISTER' 
            ? (lang === 'km' ? 'បានចុះឈ្មោះបង្កើតគណនីថ្មី' : 'registered a new account') 
            : (lang === 'km' ? 'បានចូលប្រើប្រាស់' : 'logged in');
          const msg = `👤 សមាជិក ${mem?.name || mem?.phone} ${action}`;
          setRealtimeToast(msg);
          setTimeout(() => setRealtimeToast(null), 5000);
        }
      } else if (event.type === 'ORDER_APPROVED') {
        loadOrders();
        loadMembers();
      }
    });

    return () => unsubscribe();
  }, [lang]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = password.trim();
    if (trimmedUser === 'admin' && (trimmedPass === 'admin' || trimmedPass === 'admin123')) {
      const adminAccount: MemberAccount = {
        id: 'admin',
        name: lang === 'km' ? 'គណនី Admin System' : 'Admin System',
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
      setLoggedMember(adminAccount);
      setIsAuthenticated(true);
      sessionStorage.setItem('mongkulkar_admin_auth', 'true');
    } else {
      setLoginError(
        lang === 'km'
          ? 'Username ឬ Password មិនត្រឹមត្រូវឡើយ! (Username: admin, Password: admin/admin123)'
          : 'Invalid Username or Password! (Username: admin, Password: admin/admin123)'
      );
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('mongkulkar_admin_auth');
    onExitAdmin();
  };

  const saveOrders = (updated: PackageOrder[]) => {
    setOrders(updated);
    try {
      localStorage.setItem('mongkulkar_orders', JSON.stringify(updated.slice(0, 15)));
    } catch (e) {
      console.warn('localStorage quota limit reached while saving orders:', e);
    }
  };

  // Approve order, generate Activation Code & notify member directly
  const handleApproveOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/approve`, { method: 'POST' });
      if (res.ok) {
        await loadOrders();
        return;
      }
    } catch (e) {
      console.warn('Backend approve fallback to local handling:', e);
    }

    const updated = orders.map((ord) => {
      if (ord.id === orderId) {
        const randSuffix = Math.floor(1000 + Math.random() * 9000);
        const code = `STUDIO-${ord.packageType}-${randSuffix}`;

        // Create notification for member
        addMemberNotification(ord.memberPhone, {
          titleKm: `ការទិញកញ្ចប់ ${ord.price}$ របស់អ្នកត្រូវបានអនុម័ត!`,
          titleEn: `Your $${ord.price} Package Order Has Been Approved!`,
          messageKm: `Admin បានអនុម័តការទូទាត់ប្រាក់របស់អ្នករួចរាល់។ លេខ Activation Code របស់អ្នកគឺ៖ ${code}`,
          messageEn: `Admin has approved your payment. Your Activation Code is: ${code}`,
          activationCode: code,
          packageType: ord.packageType,
        });

        // Note: Do not auto-activate here. Send code in notification for member to activate manually.
        const approvedOrd = {
          ...ord,
          status: 'approved' as const,
          activationCode: code,
        };
        notifyRealtimeEvent('ORDER_APPROVED', approvedOrd);
        return approvedOrd;
      }
      return ord;
    });
    saveOrders(updated);
  };

  // Delete member account handler
  const handleDeleteMember = async (memberId: string, memberName: string) => {
    const confirmMsg = lang === 'km'
      ? `តើអ្នកពិតជាចង់លុបគណនីសមាជិក "${memberName}" ចេញពីប្រព័ន្ធមែនទេ?`
      : `Are you sure you want to delete member account "${memberName}"?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await fetch(`/api/admin/members/${memberId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Backend delete member fallback:', e);
    }

    const updated = members.filter((m) => m.id !== memberId && m.phone !== memberId);
    setMembers(updated);
    if (selectedMemberDetail?.id === memberId) {
      setSelectedMemberDetail(null);
    }
    notifyRealtimeEvent('MEMBER_UPDATED', null);
  };

  // Reject order
  const handleRejectOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/reject`, { method: 'POST' });
      if (res.ok) {
        await loadOrders();
        return;
      }
    } catch (e) {
      console.warn('Backend reject fallback to local handling:', e);
    }

    const updated = orders.map((ord) => {
      if (ord.id === orderId) {
        addMemberNotification(ord.memberPhone, {
          titleKm: `ការទិញកញ្ចប់ ${ord.price}$ មិនត្រូវបានអនុម័ត`,
          titleEn: `Your $${ord.price} Package Order Was Rejected`,
          messageKm: `ការទូទាត់ប្រាក់របស់អ្នកមិនអាចផ្ទៀងផ្ទាត់បានឡើយ។ សូមទាក់ទងមកកាន់ Admin ឬអាប់ឡូតវិក្កយបត្រឡើងវិញ។`,
          messageEn: `Payment verification failed. Please contact Admin or resubmit your receipt.`,
        });

        const rejectedOrd = { ...ord, status: 'rejected' as const };
        notifyRealtimeEvent('ORDER_REJECTED', rejectedOrd);
        return rejectedOrd;
      }
      return ord;
    });
    saveOrders(updated);
  };

  // Delete order record
  const handleDeleteOrder = (orderId: string) => {
    if (confirm(lang === 'km' ? 'តើអ្នកប្រាកដជាចង់លុបទិន្នន័យនេះមែនទេ?' : 'Are you sure you want to delete this order?')) {
      const updated = orders.filter((o) => o.id !== orderId);
      saveOrders(updated);
    }
  };

  // Manual creation of code
  const handleCreateManualCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberPhone.trim()) return;

    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const code = `STUDIO-${newPackageType}-${randSuffix}`;
    const price = newPackageType === '35' ? 35 : 15;
    const maxPhotos = newPackageType === '35' ? 10 : 5;

    const newOrder: PackageOrder = {
      id: 'ord-' + Date.now(),
      orderCode: `ORD-${newPackageType}-${randSuffix}`,
      memberName: newMemberName.trim(),
      memberPhone: newMemberPhone.trim(),
      packageType: newPackageType,
      price,
      paymentRef: 'ADMIN-MANUAL',
      createdAt: new Date().toISOString(),
      status: 'approved',
      activationCode: code,
      maxPhotos,
    };

    // Notify & activate member
    addMemberNotification(newMemberPhone.trim(), {
      titleKm: `លោកអ្នកទទួលបាន Activation Code កញ្ចប់ ${price}$!`,
      titleEn: `You Received an Activation Code for $${price} Package!`,
      messageKm: `Admin បានផ្ញើ Activation Code ទៅកាន់គណនីរបស់អ្នក។ លេខកូដគឺ៖ ${code}`,
      messageEn: `Admin issued an Activation Code to your account: ${code}`,
      activationCode: code,
      packageType: newPackageType,
    });

    const unlocked: UnlockedPackage = {
      packageType: newPackageType,
      activationCode: code,
      memberName: newMemberName.trim(),
      memberPhone: newMemberPhone.trim(),
      maxPhotos,
      unlockedAt: new Date().toISOString(),
    };
    activateMemberPackage(newMemberPhone.trim(), unlocked);

    saveOrders([newOrder, ...orders]);
    setIsCreateModalOpen(false);
    setNewMemberName('');
    setNewMemberPhone('');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Filtered orders list
  const filteredOrders = orders.filter((ord) => {
    const matchesStatus = statusFilter === 'all' || ord.status === statusFilter;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (ord.memberName || '').toLowerCase().includes(searchLower) ||
      (ord.memberPhone || '').includes(searchLower) ||
      (ord.orderCode || '').toLowerCase().includes(searchLower) ||
      (ord.activationCode && ord.activationCode.toLowerCase().includes(searchLower));
    return matchesStatus && matchesSearch;
  });

  // Filtered member accounts list
  const filteredMembers = members.filter((m) => {
    const matchesStatus =
      memberFilterStatus === 'all' ||
      (memberFilterStatus === 'activated' && m.activatedPackage) ||
      (memberFilterStatus === 'free' && !m.activatedPackage);

    const searchLower = memberSearchTerm.toLowerCase();
    const matchesSearch =
      (m.name || '').toLowerCase().includes(searchLower) ||
      (m.phone || '').includes(searchLower) ||
      (m.activatedPackage?.activationCode && m.activatedPackage.activationCode.toLowerCase().includes(searchLower));

    return matchesStatus && matchesSearch;
  });

  // Analytics Metrics
  const totalRevenue = orders
    .filter((o) => o.status === 'approved')
    .reduce((sum, o) => sum + o.price, 0);

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const approvedCount = orders.filter((o) => o.status === 'approved').length;

  /* ================= ADMIN LOGIN SCREEN ================= */
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-amber-200 overflow-hidden animate-fadeIn">
          <div className="bg-gradient-to-r from-[#2C2117] via-[#3D2C1E] to-[#2C2117] p-8 text-white text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#B8860B] to-[#E6C687] flex items-center justify-center text-white mx-auto shadow-lg">
              <ShieldCheck className="w-8 h-8 text-yellow-100" />
            </div>
            <h2 className="font-moul text-xl text-amber-200">
              {lang === 'km' ? 'ផ្ទាំងគ្រប់គ្រង Admin' : 'Admin Portal Login'}
            </h2>
            <p className="text-xs text-amber-100/80">
              {lang === 'km' ? 'ប្រព័ន្ធគ្រប់គ្រងសមាជិកទិញកញ្ចប់ E-Invite' : 'MongkulKar Management System'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-5">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-700">
                {lang === 'km' ? 'Username Admin' : 'Admin Username'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#B8860B] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-700">
                {lang === 'km' ? 'Password Admin' : 'Admin Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#B8860B] focus:outline-none"
                />
              </div>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#B8860B] via-amber-500 to-[#8C6D3B] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{lang === 'km' ? 'ចូលប្រព័ន្ធ Admin' : 'Sign In as Admin'}</span>
            </button>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 text-center">
              💡 Credential: <strong>admin</strong> / <strong>admin</strong>
            </div>

            <button
              type="button"
              onClick={onExitAdmin}
              className="w-full py-2 text-center text-xs font-bold text-stone-500 hover:text-stone-800"
            >
              ← {lang === 'km' ? 'ត្រឡប់ទៅទំព័រដើម' : 'Back to Home'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ================= AUTHENTICATED ADMIN DASHBOARD ================= */
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn relative">
      {/* Realtime Toast Banner */}
      {realtimeToast && (
        <div className="fixed top-20 right-6 z-50 max-w-md bg-stone-900 text-white p-4 rounded-2xl shadow-2xl border-2 border-amber-400 flex items-center justify-between gap-3 animate-bounce">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <span>{realtimeToast}</span>
          </div>
          <button
            onClick={() => setRealtimeToast(null)}
            className="p-1 hover:bg-stone-800 rounded-lg text-stone-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Navbar Header */}
      <div className="p-6 bg-gradient-to-r from-[#2C2117] via-[#3D2C1E] to-[#2C2117] rounded-3xl text-white flex flex-wrap items-center justify-between gap-4 shadow-xl border border-amber-900/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#B8860B] to-[#E6C687] flex items-center justify-center text-white shadow-md">
            <ShieldCheck className="w-6 h-6 text-yellow-100" />
          </div>
          <div>
            <h1 className="font-moul text-lg text-amber-200">
              {lang === 'km' ? 'ផ្ទាំងគ្រប់គ្រងសមាជិក (Admin Dashboard)' : 'Admin Member Management Dashboard'}
            </h1>
            <p className="text-xs text-amber-100/80">
              {lang === 'km' ? 'ពិនិត្យ និងអនុម័តកញ្ចប់សេវាកម្ម E-Invite ($15 & $35)' : 'Approve Member Packages & Issues Activation Codes'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsLogoSettingsOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B8860B] to-[#966b08] hover:from-[#966b08] hover:to-[#8C6D3B] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 border border-amber-300/40"
          >
            <Upload className="w-4 h-4 text-amber-200" />
            <span>{lang === 'km' ? 'កំណត់ Logo ប្រព័ន្ធ' : 'System Logo'}</span>
          </button>

          <button
            onClick={() => setIsQrSettingsOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 border border-amber-400/40"
          >
            <QrCode className="w-4 h-4 text-amber-200" />
            <span>{lang === 'km' ? 'កំណត់/Upload KHQR' : 'Manage KHQR'}</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'km' ? 'បង្កើត Activation Code ថ្មី' : 'Issue New Code'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>{lang === 'km' ? 'ចាកចេញ' : 'Logout'}</span>
          </button>
        </div>
      </div>

      {/* Overview Analytics Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 bg-white rounded-2xl border border-amber-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-stone-500 uppercase">
              {lang === 'km' ? 'ចំណូលសរុប (Total Revenue)' : 'Total Revenue'}
            </p>
            <p className="text-2xl font-extrabold text-stone-900">${totalRevenue}</p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-blue-200/80 shadow-sm flex items-center gap-4 cursor-pointer hover:bg-blue-50/30 transition-colors" onClick={() => setActiveTab('members')}>
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-stone-500 uppercase">
              {lang === 'km' ? 'ចំនួនគណនីចុះឈ្មោះសរុប' : 'Total Members'}
            </p>
            <p className="text-2xl font-extrabold text-blue-900">{members.length}</p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-emerald-200/80 shadow-sm flex items-center gap-4 cursor-pointer hover:bg-emerald-50/30 transition-colors" onClick={() => setActiveTab('members')}>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-stone-500 uppercase">
              {lang === 'km' ? 'ចំនួនគណនីបានទិញកញ្ចប់' : 'Active Package Users'}
            </p>
            <p className="text-2xl font-extrabold text-emerald-800">{members.filter((m) => m.activatedPackage).length}</p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-amber-200/80 shadow-sm flex items-center gap-4 cursor-pointer hover:bg-amber-50/30 transition-colors" onClick={() => setActiveTab('orders')}>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-stone-500 uppercase">
              {lang === 'km' ? 'រង់ចាំការអនុម័ត' : 'Pending Approvals'}
            </p>
            <p className="text-2xl font-extrabold text-amber-700">{pendingCount}</p>
          </div>
        </div>
      </div>

      {/* Main Admin Navigation Tabs Bar */}
      <div className="flex bg-stone-200/80 p-1.5 rounded-2xl w-full sm:w-auto self-start gap-1 shadow-inner border border-stone-300/50">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-white text-stone-900 shadow-md border border-stone-200'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
          }`}
        >
          <FileText className="w-4 h-4 text-amber-600" />
          <span>{lang === 'km' ? '📦 ការបញ្ជាទិញកញ្ចប់ ($15 & $35)' : 'Package Orders'}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-extrabold ml-1">
            {orders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'members'
              ? 'bg-white text-stone-900 shadow-md border border-stone-200'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
          }`}
        >
          <Users className="w-4 h-4 text-blue-600" />
          <span>{lang === 'km' ? '👤 គ្រប់គ្រងគណនីសមាជិកចុះឈ្មោះ' : 'Registered Member Accounts'}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800 font-extrabold ml-1">
            {members.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'templates'
              ? 'bg-white text-stone-900 shadow-md border border-stone-200'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
          }`}
        >
          <Palette className="w-4 h-4 text-purple-600" />
          <span>{lang === 'km' ? '🎨 គ្រប់គ្រងរចនាបថធៀប (Template Control Panel)' : 'Template Control Panel'}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-800 font-extrabold ml-1">
            {allAdminTemplates.length}
          </span>
        </button>
      </div>

      {/* Orders Management Table Card */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-amber-200/80 shadow-md p-6 space-y-6 animate-fadeIn">
          {/* Table Filters Header */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-stone-100 pb-4">
            {/* Status Tabs */}
            <div className="flex bg-stone-100 p-1 rounded-2xl w-full md:w-auto">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize ${
                    statusFilter === tab
                      ? 'bg-white text-[#8C6D3B] shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {tab === 'all'
                    ? (lang === 'km' ? 'ទាំងអស់' : 'All')
                    : tab === 'pending'
                    ? (lang === 'km' ? 'រង់ចាំអនុម័ត' : 'Pending')
                    : tab === 'approved'
                    ? (lang === 'km' ? 'អនុម័តរួច' : 'Approved')
                    : (lang === 'km' ? 'បដិសេធ' : 'Rejected')}
                </button>
              ))}
            </div>

            {/* Search Field */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ស្វែងរកឈ្មោះ លេខទូរស័ព្ទ ឬកូដ..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#B8860B] focus:outline-none"
              />
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px] bg-stone-50/50">
                  <th className="py-3 px-4">{lang === 'km' ? 'សមាជិក / លេខទូរស័ព្ទ' : 'Member & Contact'}</th>
                  <th className="py-3 px-4">{lang === 'km' ? 'កញ្ចប់សេវាកម្ម' : 'Package Tier'}</th>
                  <th className="py-3 px-4">{lang === 'km' ? 'វិក្កយបត្រ' : 'Invoice Proof'}</th>
                  <th className="py-3 px-4">{lang === 'km' ? 'កាលបរិច្ឆេទ' : 'Date'}</th>
                  <th className="py-3 px-4">{lang === 'km' ? 'ស្ថានភាព' : 'Status'}</th>
                  <th className="py-3 px-4">{lang === 'km' ? 'Activation Code' : 'Activation Code'}</th>
                  <th className="py-3 px-4 text-right">{lang === 'km' ? 'សកម្មភាព' : 'Actions'}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100 text-stone-700">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-amber-50/40 transition-colors">
                      {/* Member Details */}
                      <td className="py-4 px-4 font-medium">
                        <p className="font-bold text-stone-900 text-sm">{ord.memberName}</p>
                        <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-stone-400" />
                          <span>{ord.memberPhone}</span>
                        </p>
                      </td>

                      {/* Package Tier */}
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold ${
                          ord.packageType === '35'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-stone-100 text-stone-800 border border-stone-200'
                        }`}>
                          ${ord.price} ({ord.packageType === '35' ? 'VIP' : 'Standard'})
                        </span>
                      </td>

                      {/* Payment Ref & Receipt Image Button */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <p className="font-mono font-semibold text-stone-600">{ord.paymentRef || 'N/A'}</p>
                          {ord.paymentProofUrl ? (
                            <button
                              onClick={() => setSelectedInvoiceUrl(ord.paymentProofUrl!)}
                              className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold flex items-center gap-1 hover:bg-amber-200"
                            >
                              <Eye className="w-3 h-3" />
                              <span>{lang === 'km' ? 'មើលរូបវិក្កយបត្រ' : 'View Receipt'}</span>
                            </button>
                          ) : (
                            <span className="text-stone-400 text-[10px] italic">{lang === 'km' ? 'គ្មានរូបភាព' : 'No Receipt'}</span>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-[11px] text-stone-500">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            ord.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : ord.status === 'rejected'
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                          }`}
                        >
                          {ord.status === 'approved'
                            ? (lang === 'km' ? 'អនុម័តរួច' : 'Approved')
                            : ord.status === 'rejected'
                            ? (lang === 'km' ? 'បដិសេធ' : 'Rejected')
                            : (lang === 'km' ? 'រង់ចាំអនុម័ត' : 'Pending')}
                        </span>
                      </td>

                      {/* Activation Code */}
                      <td className="py-4 px-4">
                        {ord.activationCode ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-[#8C6D3B] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {ord.activationCode}
                            </span>
                            <button
                              onClick={() => handleCopyCode(ord.activationCode!)}
                              className="p-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-600"
                              title="Copy Code"
                            >
                              {copiedCode === ord.activationCode ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-stone-400 italic text-[11px]">
                            {lang === 'km' ? 'មិនទាន់បង្កើត' : 'Not generated'}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {ord.status !== 'approved' && (
                            <button
                              onClick={() => handleApproveOrder(ord.id)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition-all flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{lang === 'km' ? 'អនុម័ត' : 'Approve'}</span>
                            </button>
                          )}

                          {ord.status !== 'rejected' && ord.status !== 'approved' && (
                            <button
                              onClick={() => handleRejectOrder(ord.id)}
                              className="px-3 py-1.5 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 font-bold text-[11px] transition-all flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>{lang === 'km' ? 'បដិសេធ' : 'Reject'}</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteOrder(ord.id)}
                            className="p-1.5 rounded-xl hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors"
                            title="Delete Record"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-400 italic">
                      {lang === 'km' ? 'មិនមានទិន្នន័យបញ្ជាទិញឡើយ' : 'No order records found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Template Control Panel Card */}
      {activeTab === 'templates' && (
        <div className="bg-white rounded-3xl border border-amber-200/80 shadow-md p-6 space-y-6 animate-fadeIn">
          {/* Header & Main Publish Action Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200 pb-5">
            <div>
              <div className="flex items-center gap-2 text-[#B8860B] font-bold text-xs uppercase tracking-widest mb-1">
                <Palette className="w-4 h-4" />
                <span>{lang === 'km' ? 'កន្លែងគ្រប់គ្រង Template ធៀបការ' : 'Template Control Panel'}</span>
              </div>
              <h2 className="text-xl font-bold text-stone-900 font-moul">
                {lang === 'km' ? 'គ្រប់គ្រងបណ្តុំរចនាបថធៀបមង្គលការ' : 'Wedding Invitation Template Manager'}
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                {lang === 'km'
                  ? 'អ្នកអាចលាក់/បង្ហាញ (Hide/Show) ផ្លាស់ប្តូរព័ត៌មាន បញ្ចូល ZIP Custom ថ្មី និងចុចប៊ូតុង "ដាក់បញ្ចូលទៅកាន់ User Member" ដើម្បីអោយសមាជិកប្រើប្រាស់'
                  : 'Hide/Show any template, edit details, upload zip themes, and publish to make available for members.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Upload Zip Button */}
              <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs shadow-sm border border-stone-300 transition-all flex items-center gap-2">
                <Upload className="w-4 h-4 text-purple-600" />
                <span>{isUploadingZip ? (lang === 'km' ? 'កំពុងដំណើការ...' : 'Uploading...') : (lang === 'km' ? '➕ អាប់ឡូត ZIP Template ថ្មី' : 'Upload ZIP Template')}</span>
                <input
                  type="file"
                  accept=".zip"
                  onChange={handleZipFileUpload}
                  className="hidden"
                  disabled={isUploadingZip}
                />
              </label>

              {/* PUBLISH BUTTON */}
              <button
                onClick={handlePublishTemplates}
                disabled={isPublishing}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#B8860B] to-[#966b08] hover:from-[#966b08] hover:to-[#8C6D3B] text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 border border-amber-300/40 transform active:scale-95 cursor-pointer"
              >
                <Send className={`w-4 h-4 text-amber-200 ${isPublishing ? 'animate-spin' : ''}`} />
                <span>
                  {isPublishing
                    ? (lang === 'km' ? 'កំពុង Sync ទៅកាន់សមាជិក...' : 'Syncing...')
                    : (lang === 'km' ? '🚀 ដាក់បញ្ចូលទៅកាន់ User Member អោយប្រើប្រាស់' : 'Publish / Sync to User Members')}
                </span>
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {publishSuccessMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 font-bold text-xs flex items-center gap-3 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{publishSuccessMessage}</span>
            </div>
          )}

          {/* Filter & Search Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex bg-stone-100 p-1 rounded-2xl w-full sm:w-auto">
              {(['all', 'visible', 'hidden'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setTemplateFilterStatus(status)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize ${
                    templateFilterStatus === status
                      ? 'bg-white text-[#B8860B] shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {status === 'all'
                    ? (lang === 'km' ? `ទាំងអស់ (${allAdminTemplates.length})` : `All (${allAdminTemplates.length})`)
                    : status === 'visible'
                    ? (lang === 'km' ? `👁️ បង្ហាញក្នុងប្រព័ន្ធ (${allAdminTemplates.filter(t => !t.hidden).length})` : `Visible (${allAdminTemplates.filter(t => !t.hidden).length})`)
                    : (lang === 'km' ? `🙈 បានលាក់ (${allAdminTemplates.filter(t => t.hidden).length})` : `Hidden (${allAdminTemplates.filter(t => t.hidden).length})`)}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={templateSearchTerm}
                onChange={(e) => setTemplateSearchTerm(e.target.value)}
                placeholder={lang === 'km' ? 'ស្វែងរក Template...' : 'Search template name...'}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#B8860B]"
              />
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {allAdminTemplates
              .filter((tmpl) => {
                if (templateFilterStatus === 'visible' && tmpl.hidden) return false;
                if (templateFilterStatus === 'hidden' && !tmpl.hidden) return false;
                if (templateSearchTerm.trim()) {
                  const q = templateSearchTerm.toLowerCase();
                  return tmpl.nameKm.toLowerCase().includes(q) || tmpl.nameEn.toLowerCase().includes(q) || tmpl.id.toLowerCase().includes(q);
                }
                return true;
              })
              .map((tmpl) => {
                const isHidden = tmpl.hidden;

                return (
                  <div
                    key={tmpl.id}
                    className={`rounded-3xl border-2 transition-all overflow-hidden bg-white flex flex-col justify-between shadow-sm hover:shadow-xl relative ${
                      isHidden ? 'border-red-300 opacity-75 bg-red-50/20' : 'border-stone-200 hover:border-amber-400'
                    }`}
                  >
                    {/* Status Ribbon & Badge */}
                    <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5">
                      <span
                        className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider shadow-md flex items-center gap-1 ${
                          isHidden
                            ? 'bg-red-600 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {isHidden ? (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>{lang === 'km' ? 'បានលាក់ (Hidden)' : 'Hidden'}</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>{lang === 'km' ? 'បង្ហាញ (Visible)' : 'Visible'}</span>
                          </>
                        )}
                      </span>

                      <span className="px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-md text-amber-300 font-bold text-[10px] border border-amber-400/30 shadow-md">
                        {tmpl.badge}
                      </span>
                    </div>

                    {/* Preview Image */}
                    <div className="relative h-48 w-full overflow-hidden bg-stone-100">
                      <img
                        src={tmpl.previewImage || 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=80'}
                        alt={tmpl.nameEn}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <p className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                          ID: {tmpl.id}
                        </p>
                        <h3 className="font-moul text-sm text-white line-clamp-1">
                          {tmpl.nameKm}
                        </h3>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-stone-800 text-xs">
                          {tmpl.nameEn}
                        </h4>
                        <p className="text-[11px] text-stone-500 line-clamp-2 mt-1">
                          {tmpl.taglineKm}
                        </p>
                      </div>

                      {/* Control Action Buttons */}
                      <div className="space-y-2 pt-2 border-t border-stone-100">
                        <div className="grid grid-cols-2 gap-2">
                          {/* Toggle Hide/Show Button */}
                          <button
                            onClick={() => handleToggleHideTemplate(tmpl.id)}
                            className={`w-full py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
                              isHidden
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                            }`}
                          >
                            {isHidden ? (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                <span>{lang === 'km' ? 'បង្ហាញឡើងវិញ' : 'Unhide'}</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>{lang === 'km' ? 'លាក់រចនាបថនេះ' : 'Hide'}</span>
                              </>
                            )}
                          </button>

                          {/* Edit Details Button */}
                          <button
                            onClick={() => setEditingTemplate(tmpl)}
                            className="w-full py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-stone-300 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-stone-600" />
                            <span>{lang === 'km' ? 'កែប្រែ' : 'Edit'}</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Live Preview Button */}
                          <button
                            onClick={() => setPreviewingTemplate(tmpl)}
                            className="flex-1 py-1.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#B8860B] font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 border border-amber-200 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{lang === 'km' ? 'មើលគំរូធៀប (Preview)' : 'Preview Template'}</span>
                          </button>

                          {/* Delete Button for Custom Zip Templates */}
                          {tmpl.isCustom && (
                            <button
                              onClick={() => handleDeleteCustomTemplate(tmpl.id)}
                              className="py-1.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[11px] transition-all flex items-center justify-center gap-1 border border-red-200 cursor-pointer"
                              title="Delete custom template"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Registered Members Accounts Directory Card */}
      {activeTab === 'members' && (
        <div className="bg-white rounded-3xl border border-blue-200/80 shadow-md p-6 space-y-6 animate-fadeIn">
          {/* Members Table Filters Header */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-stone-100 pb-4">
            {/* Filter Tabs */}
            <div className="flex bg-stone-100 p-1 rounded-2xl w-full md:w-auto">
              <button
                onClick={() => setMemberFilterStatus('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  memberFilterStatus === 'all'
                    ? 'bg-white text-blue-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {lang === 'km' ? `សមាជិកទាំងអស់ (${members.length})` : `All Members (${members.length})`}
              </button>

              <button
                onClick={() => setMemberFilterStatus('activated')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  memberFilterStatus === 'activated'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {lang === 'km'
                  ? `បានទិញកញ្ចប់ (${members.filter((m) => m.activatedPackage).length})`
                  : `Active Package (${members.filter((m) => m.activatedPackage).length})`}
              </button>

              <button
                onClick={() => setMemberFilterStatus('free')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  memberFilterStatus === 'free'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {lang === 'km'
                  ? `មិនទាន់ទិញ (${members.filter((m) => !m.activatedPackage).length})`
                  : `Free Account (${members.filter((m) => !m.activatedPackage).length})`}
              </button>
            </div>

            {/* Member Search Bar */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                value={memberSearchTerm}
                onChange={(e) => setMemberSearchTerm(e.target.value)}
                placeholder={lang === 'km' ? 'ស្វែងរកឈ្មោះ ឬលេខទូរស័ព្ទ...' : 'Search name or phone...'}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Members Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px] bg-stone-50/50">
                  <th className="py-3 px-4">{lang === 'km' ? 'ឈ្មោះ និង លេខទូរស័ព្ទ' : 'Member & Contact'}</th>
                  <th className="py-3 px-4">{lang === 'km' ? 'កាលបរិច្ឆេទចុះឈ្មោះ' : 'Registered Date'}</th>
                  <th className="py-3 px-4">{lang === 'km' ? 'សកម្មភាពចុងក្រោយ' : 'Last Login/Active'}</th>
                  <th className="py-3 px-4">{lang === 'km' ? 'ស្ថានភាពកញ្ចប់' : 'Package Status'}</th>
                  <th className="py-3 px-4">{lang === 'km' ? 'Activation Code' : 'Activation Code'}</th>
                  <th className="py-3 px-4 text-right">{lang === 'km' ? 'សកម្មភាព' : 'Actions'}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100 text-stone-700">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((mem) => (
                    <tr key={mem.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-4 px-4 font-medium">
                        <p className="font-bold text-stone-900 text-sm flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-600" />
                          <span>{mem.name}</span>
                        </p>
                        <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-stone-400" />
                          <span>{mem.phone}</span>
                        </p>
                      </td>

                      <td className="py-4 px-4 text-[11px] text-stone-500">
                        {mem.createdAt ? new Date(mem.createdAt).toLocaleString() : 'N/A'}
                      </td>

                      <td className="py-4 px-4 text-[11px] text-stone-500">
                        {mem.lastLoginAt ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-emerald-500" />
                            {new Date(mem.lastLoginAt).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-stone-400 italic">មិនទាន់ចូលប្រព័ន្ធ</span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        {mem.activatedPackage ? (
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            កញ្ចប់ ${mem.activatedPackage.packageType} VIP
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-stone-100 text-stone-600 border border-stone-200">
                            {lang === 'km' ? 'មិនទាន់ទិញ' : 'Free Account'}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        {mem.activatedPackage?.activationCode ? (
                          <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {mem.activatedPackage.activationCode}
                          </span>
                        ) : (
                          <span className="text-stone-400 text-[10px] italic">-</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setNewMemberName(mem.name);
                              setNewMemberPhone(mem.phone);
                              setIsCreateModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] shadow-sm flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>{lang === 'km' ? 'ផ្តល់ Code' : 'Issue Code'}</span>
                          </button>

                          <button
                            onClick={() => setSelectedMemberDetail(mem)}
                            className="px-2.5 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold text-[10px] flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>{lang === 'km' ? 'ព័ត៌មានលម្អិត' : 'View Details'}</span>
                          </button>

                          <button
                            onClick={() => handleDeleteMember(mem.id, mem.name)}
                            className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 hover:bg-rose-300 font-bold text-[10px] flex items-center gap-1 transition-colors"
                            title={lang === 'km' ? 'លុបគណនីសមាជិកនេះ' : 'Delete Member Account'}
                          >
                            <Trash2 className="w-3 h-3 text-rose-600" />
                            <span>{lang === 'km' ? 'លុបគណនី' : 'Delete'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-400 italic">
                      {lang === 'km' ? 'មិនមានគណនីសមាជិកឡើយ' : 'No member accounts found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Template Control Panel Card */}
      {activeTab === 'templates' && (
        <div className="bg-white rounded-3xl border border-amber-200/80 shadow-md p-6 space-y-6 animate-fadeIn">
          {/* Header & Main Publish Action Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200 pb-5">
            <div>
              <div className="flex items-center gap-2 text-[#B8860B] font-bold text-xs uppercase tracking-widest mb-1">
                <Palette className="w-4 h-4" />
                <span>{lang === 'km' ? 'កន្លែងគ្រប់គ្រង Template ធៀបការ' : 'Template Control Panel'}</span>
              </div>
              <h2 className="text-xl font-bold text-stone-900 font-moul">
                {lang === 'km' ? 'គ្រប់គ្រងបណ្តុំរចនាបថធៀបមង្គលការ' : 'Wedding Invitation Template Manager'}
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                {lang === 'km'
                  ? 'អ្នកអាចលាក់/បង្ហាញ (Hide/Show) ផ្លាស់ប្តូរព័ត៌មាន បញ្ចូល ZIP Custom ថ្មី និងចុចប៊ូតុង "ដាក់បញ្ចូលទៅកាន់ User Member" ដើម្បីអោយសមាជិកប្រើប្រាស់'
                  : 'Hide/Show any template, edit details, upload zip themes, and publish to make available for members.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Upload Zip Button */}
              <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs shadow-sm border border-stone-300 transition-all flex items-center gap-2">
                <Upload className="w-4 h-4 text-purple-600" />
                <span>{isUploadingZip ? (lang === 'km' ? 'កំពុងដំណើការ...' : 'Uploading...') : (lang === 'km' ? '➕ អាប់ឡូត ZIP Template ថ្មី' : 'Upload ZIP Template')}</span>
                <input
                  type="file"
                  accept=".zip"
                  onChange={handleZipFileUpload}
                  className="hidden"
                  disabled={isUploadingZip}
                />
              </label>

              {/* PUBLISH BUTTON */}
              <button
                onClick={handlePublishTemplates}
                disabled={isPublishing}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#B8860B] to-[#966b08] hover:from-[#966b08] hover:to-[#8C6D3B] text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 border border-amber-300/40 transform active:scale-95 cursor-pointer"
              >
                <Send className={`w-4 h-4 text-amber-200 ${isPublishing ? 'animate-spin' : ''}`} />
                <span>
                  {isPublishing
                    ? (lang === 'km' ? 'កំពុង Sync ទៅកាន់សមាជិក...' : 'Syncing...')
                    : (lang === 'km' ? '🚀 ដាក់បញ្ចូលទៅកាន់ User Member អោយប្រើប្រាស់' : 'Publish / Sync to User Members')}
                </span>
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {publishSuccessMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 font-bold text-xs flex items-center gap-3 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{publishSuccessMessage}</span>
            </div>
          )}

          {/* Filter & Search Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex bg-stone-100 p-1 rounded-2xl w-full sm:w-auto">
              {(['all', 'visible', 'hidden'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setTemplateFilterStatus(status)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize ${
                    templateFilterStatus === status
                      ? 'bg-white text-[#B8860B] shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {status === 'all'
                    ? (lang === 'km' ? `ទាំងអស់ (${allAdminTemplates.length})` : `All (${allAdminTemplates.length})`)
                    : status === 'visible'
                    ? (lang === 'km' ? `👁️ បង្ហាញក្នុងប្រព័ន្ធ (${allAdminTemplates.filter(t => !t.hidden).length})` : `Visible (${allAdminTemplates.filter(t => !t.hidden).length})`)
                    : (lang === 'km' ? `🙈 បានលាក់ (${allAdminTemplates.filter(t => t.hidden).length})` : `Hidden (${allAdminTemplates.filter(t => t.hidden).length})`)}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={templateSearchTerm}
                onChange={(e) => setTemplateSearchTerm(e.target.value)}
                placeholder={lang === 'km' ? 'ស្វែងរក Template...' : 'Search template name...'}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#B8860B]"
              />
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {allAdminTemplates
              .filter((tmpl) => {
                if (templateFilterStatus === 'visible' && tmpl.hidden) return false;
                if (templateFilterStatus === 'hidden' && !tmpl.hidden) return false;
                if (templateSearchTerm.trim()) {
                  const q = templateSearchTerm.toLowerCase();
                  return tmpl.nameKm.toLowerCase().includes(q) || tmpl.nameEn.toLowerCase().includes(q) || tmpl.id.toLowerCase().includes(q);
                }
                return true;
              })
              .map((tmpl) => {
                const isHidden = tmpl.hidden;

                return (
                  <div
                    key={tmpl.id}
                    className={`rounded-3xl border-2 transition-all overflow-hidden bg-white flex flex-col justify-between shadow-sm hover:shadow-xl relative ${
                      isHidden ? 'border-red-300 opacity-75 bg-red-50/20' : 'border-stone-200 hover:border-amber-400'
                    }`}
                  >
                    {/* Status Ribbon & Badge */}
                    <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5">
                      <span
                        className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider shadow-md flex items-center gap-1 ${
                          isHidden
                            ? 'bg-red-600 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {isHidden ? (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>{lang === 'km' ? 'បានលាក់ (Hidden)' : 'Hidden'}</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>{lang === 'km' ? 'បង្ហាញ (Visible)' : 'Visible'}</span>
                          </>
                        )}
                      </span>

                      <span className="px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-md text-amber-300 font-bold text-[10px] border border-amber-400/30 shadow-md">
                        {tmpl.badge}
                      </span>
                    </div>

                    {/* Preview Image */}
                    <div className="relative h-48 w-full overflow-hidden bg-stone-100">
                      <img
                        src={tmpl.previewImage || 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=80'}
                        alt={tmpl.nameEn}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <p className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                          ID: {tmpl.id}
                        </p>
                        <h3 className="font-moul text-sm text-white line-clamp-1">
                          {tmpl.nameKm}
                        </h3>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-stone-800 text-xs">
                          {tmpl.nameEn}
                        </h4>
                        <p className="text-[11px] text-stone-500 line-clamp-2 mt-1">
                          {tmpl.taglineKm}
                        </p>
                      </div>

                      {/* Control Action Buttons */}
                      <div className="space-y-2 pt-2 border-t border-stone-100">
                        <div className="grid grid-cols-2 gap-2">
                          {/* Toggle Hide/Show Button */}
                          <button
                            onClick={() => handleToggleHideTemplate(tmpl.id)}
                            className={`w-full py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
                              isHidden
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                            }`}
                          >
                            {isHidden ? (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                <span>{lang === 'km' ? 'បង្ហាញឡើងវិញ' : 'Unhide'}</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>{lang === 'km' ? 'លាក់រចនាបថនេះ' : 'Hide'}</span>
                              </>
                            )}
                          </button>

                          {/* Edit Details Button */}
                          <button
                            onClick={() => setEditingTemplate(tmpl)}
                            className="w-full py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-stone-300 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-stone-600" />
                            <span>{lang === 'km' ? 'កែប្រែ' : 'Edit'}</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Live Preview Button */}
                          <button
                            onClick={() => setPreviewingTemplate(tmpl)}
                            className="flex-1 py-1.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#B8860B] font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 border border-amber-200 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{lang === 'km' ? 'មើលគំរូធៀប (Preview)' : 'Preview Template'}</span>
                          </button>

                          {/* Delete Button for Custom Zip Templates */}
                          {tmpl.isCustom && (
                            <button
                              onClick={() => handleDeleteCustomTemplate(tmpl.id)}
                              className="py-1.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[11px] transition-all flex items-center justify-center gap-1 border border-red-200 cursor-pointer"
                              title="Delete custom template"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}


      {selectedInvoiceUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-amber-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-moul text-base text-stone-900">
                {lang === 'km' ? 'រូបភាពវិក្កយបត្រទូទាត់' : 'Uploaded Invoice Receipt'}
              </h3>
              <button
                onClick={() => setSelectedInvoiceUrl(null)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedInvoiceUrl && selectedInvoiceUrl.trim() !== '' && (
              <div className="bg-stone-100 rounded-2xl p-2 flex items-center justify-center overflow-hidden max-h-[60vh]">
                <img
                  src={selectedInvoiceUrl}
                  alt="Payment Receipt"
                  className="max-h-[55vh] object-contain rounded-xl"
                />
              </div>
            )}

            <button
              onClick={() => setSelectedInvoiceUrl(null)}
              className="w-full py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs"
            >
              {lang === 'km' ? 'បិទ' : 'Close'}
            </button>
          </div>
        </div>
      )}

      {/* Manual Issue Activation Code Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-amber-200 space-y-4">
            <h3 className="font-moul text-base text-stone-900 border-b pb-3">
              {lang === 'km' ? 'បង្កើត Activation Code ដោយផ្ទាល់' : 'Issue Activation Code Manually'}
            </h3>

            <form onSubmit={handleCreateManualCode} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'km' ? 'ឈ្មោះសមាជិក' : 'Member Name'}
                </label>
                <input
                  type="text"
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="ឧទាហរណ៍៖ សុខ ពិសិដ្ឋ"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#B8860B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'km' ? 'លេខទូរស័ព្ទ' : 'Phone Number'}
                </label>
                <input
                  type="tel"
                  required
                  value={newMemberPhone}
                  onChange={(e) => setNewMemberPhone(e.target.value)}
                  placeholder="012 990 011"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#B8860B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'km' ? 'ជ្រើសរើសកញ្ចប់សេវាកម្ម' : 'Package Tier'}
                </label>
                <select
                  value={newPackageType}
                  onChange={(e) => setNewPackageType(e.target.value as PackageTier)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#B8860B] focus:outline-none"
                >
                  <option value="15">{lang === 'km' ? 'កញ្ចប់ 15$ (Max 5 Photos)' : '$15 Package (Max 5 Photos)'}</option>
                  <option value="35">{lang === 'km' ? 'កញ្ចប់ 35$ VIP (Max 10 Photos)' : '$35 VIP Package (Max 10 Photos)'}</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-100"
                >
                  {lang === 'km' ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#B8860B] text-white text-xs font-bold hover:bg-[#966b08]"
                >
                  {lang === 'km' ? 'បង្កើត និងអនុម័ត' : 'Create & Approve'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin KHQR Customization Modal */}
      {isQrSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-amber-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-moul text-base text-stone-900 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#B8860B]" />
                <span>{lang === 'km' ? 'កំណត់/Upload រូបភាព KHQR Admin' : 'Manage Admin KHQR Code'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsQrSettingsOpen(false)}
                className="p-1 rounded-full hover:bg-stone-100 text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQrSettings} className="space-y-4">
              {/* QR Image Preview & Upload */}
              <div className="text-center space-y-2">
                <label className="block text-xs font-bold text-stone-700">
                  {lang === 'km' ? 'រូបភាព ABA KHQR Code Admin *' : 'Admin KHQR Image *'}
                </label>

                <div className="w-44 h-44 bg-stone-50 p-2 rounded-2xl border-2 border-amber-300 mx-auto flex items-center justify-center shadow-inner overflow-hidden relative group">
                  <img
                    src={qrImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80'}
                    alt="Admin KHQR Preview"
                    className="w-full h-full object-contain rounded-xl"
                  />
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer rounded-xl">
                    <Upload className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold">
                      {lang === 'km' ? 'ប្តូររូបភាព' : 'Change Image'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAdminQrUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <label className="inline-block px-3 py-1.5 rounded-lg bg-amber-100 text-[#B8860B] font-bold text-xs cursor-pointer hover:bg-amber-200 transition-colors">
                  <Upload className="w-3.5 h-3.5 inline mr-1" />
                  <span>{lang === 'km' ? 'អាប់ឡូតរូប QR ថ្មី' : 'Upload New QR Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAdminQrUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Account Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'km' ? 'ឈ្មោះគណនីធនាគារ (Account Name)' : 'Account Name'}
                </label>
                <input
                  type="text"
                  required
                  value={qrAccountName}
                  onChange={(e) => setQrAccountName(e.target.value)}
                  placeholder="ឧទាហរណ៍៖ MONGKULKAR STUDIO"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#B8860B] focus:outline-none"
                />
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'km' ? 'លេខគណនី ABA (Account Number)' : 'ABA Account Number'}
                </label>
                <input
                  type="text"
                  required
                  value={qrAccountNumber}
                  onChange={(e) => setQrAccountNumber(e.target.value)}
                  placeholder="ឧទាហរណ៍៖ 012 345 678"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#B8860B] focus:outline-none"
                />
              </div>

              {qrSaveSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold text-center">
                  ✓ {lang === 'km' ? 'បានរក្សាទុក KHQR Admin ដោយជោគជ័យ!' : 'Admin KHQR saved successfully!'}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQrSettingsOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-100"
                >
                  {lang === 'km' ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#B8860B] via-amber-500 to-[#8C6D3B] text-white text-xs font-bold shadow hover:shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{lang === 'km' ? 'រក្សាទុក' : 'Save KHQR'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Details Modal */}
      {selectedMemberDetail && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-blue-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-moul text-base text-stone-900 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                <span>{lang === 'km' ? 'ព័ត៌មានលម្អិតគណនីសមាជិក' : 'Member Account Details'}</span>
              </h3>
              <button
                onClick={() => setSelectedMemberDetail(null)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold text-stone-500">ឈ្មោះពេញ៖</span>
                  <span className="font-extrabold text-stone-900 text-sm">{selectedMemberDetail.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-stone-500">លេខទូរស័ព្ទ៖</span>
                  <span className="font-mono font-extrabold text-blue-800">{selectedMemberDetail.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-stone-500">កាលបរិច្ឆេទចុះឈ្មោះ៖</span>
                  <span className="text-stone-700">{selectedMemberDetail.createdAt ? new Date(selectedMemberDetail.createdAt).toLocaleString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-stone-500">ចូលប្រព័ន្ធចុងក្រោយ៖</span>
                  <span className="text-stone-700">{selectedMemberDetail.lastLoginAt ? new Date(selectedMemberDetail.lastLoginAt).toLocaleString() : 'មិនទាន់ចូលប្រព័ន្ធ'}</span>
                </div>
              </div>

              {/* Package Details */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                <h4 className="font-bold text-amber-900 text-xs uppercase flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>{lang === 'km' ? 'កញ្ចប់សេវាកម្មដែលបានបើកដំណើរការ' : 'Activated Package'}</span>
                </h4>
                {selectedMemberDetail.activatedPackage ? (
                  <div className="space-y-1 text-stone-800">
                    <p>កញ្ចប់៖ <strong>${selectedMemberDetail.activatedPackage.packageType} VIP</strong></p>
                    <p>Activation Code: <span className="font-mono font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">{selectedMemberDetail.activatedPackage.activationCode}</span></p>
                    <p className="text-[11px] text-stone-500">កាលបរិច្ឆេទបើក៖ {new Date(selectedMemberDetail.activatedPackage.unlockedAt).toLocaleString()}</p>
                  </div>
                ) : (
                  <p className="text-stone-500 italic">មិនទាន់មានកញ្ចប់សេវាកម្មនៅឡើយ (Free Account)</p>
                )}
              </div>

              {/* Member Notifications History */}
              <div className="space-y-2">
                <h4 className="font-bold text-stone-800 text-xs">
                  {lang === 'km' ? `សារជូនដំណឹងទៅកាន់សមាជិកនេះ (${selectedMemberDetail.notifications?.length || 0})` : `Notifications (${selectedMemberDetail.notifications?.length || 0})`}
                </h4>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                  {selectedMemberDetail.notifications && selectedMemberDetail.notifications.length > 0 ? (
                    selectedMemberDetail.notifications.map((notif) => (
                      <div key={notif.id} className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-[11px]">
                        <p className="font-bold text-stone-900">{lang === 'km' ? notif.titleKm : notif.titleEn}</p>
                        <p className="text-stone-600">{lang === 'km' ? notif.messageKm : notif.messageEn}</p>
                        <p className="text-[10px] text-stone-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-stone-400 italic text-[11px]">គ្មានសារជូនដំណឹង</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setNewMemberName(selectedMemberDetail.name);
                    setNewMemberPhone(selectedMemberDetail.phone);
                    setSelectedMemberDetail(null);
                    setIsCreateModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{lang === 'km' ? 'ផ្តល់ Code' : 'Issue Code'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteMember(selectedMemberDetail.id, selectedMemberDetail.name)}
                  className="px-3 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>{lang === 'km' ? 'លុបគណនី' : 'Delete Account'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMemberDetail(null)}
                className="px-5 py-2 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800"
              >
                {lang === 'km' ? 'បិទ' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SYSTEM LOGO & BRANDING SETTINGS MODAL */}
      {isLogoSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-amber-200 overflow-hidden space-y-5 p-6 relative">
            <button
              onClick={() => setIsLogoSettingsOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-amber-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Upload className="w-5 h-5 text-[#B8860B]" />
              </div>
              <div>
                <h3 className="font-moul text-base text-stone-800">
                  {lang === 'km' ? 'កំណត់ Logo & ឈ្មោះប្រព័ន្ធ' : 'System Logo & Branding'}
                </h3>
                <p className="text-xs text-stone-500">
                  {lang === 'km' ? 'Upload Logo ផ្ទាល់ខ្លួន ឬកែប្រែឈ្មោះប្រព័ន្ធ' : 'Upload custom system logo or edit app brand name'}
                </p>
              </div>
            </div>

            {logoSaveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'km' ? 'រក្សាទុក Logo & ប្រព័ន្ធជោគជ័យ!' : 'System branding updated successfully!'}</span>
              </div>
            )}

            <form onSubmit={handleSaveLogoSettings} className="space-y-4">
              {/* Logo Preview & Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-700">
                  {lang === 'km' ? 'រូបភាព Logo ប្រព័ន្ធ (Upload System Logo Image):' : 'System Logo Image:'}
                </label>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-stone-100 border-2 border-dashed border-amber-300 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                    {sysLogoConfig.logoUrl && sysLogoConfig.logoUrl.trim() !== '' ? (
                      <img src={sysLogoConfig.logoUrl} alt="Logo Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ShieldCheck className="w-8 h-8 text-[#B8860B]" />
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 font-bold text-xs hover:bg-amber-100 cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{lang === 'km' ? 'ជ្រើសរើសរូប Logo ថ្មី' : 'Upload Logo Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFileUpload}
                        className="hidden"
                      />
                    </label>

                    {sysLogoConfig.logoUrl && (
                      <button
                        type="button"
                        onClick={() => setSysLogoConfig((prev) => ({ ...prev, logoUrl: '' }))}
                        className="block text-[11px] text-red-600 hover:underline font-semibold"
                      >
                        {lang === 'km' ? 'លុប Logo ចេញ (ប្រើ Logo ដើម)' : 'Reset to default logo'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Logo URL input option */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700">
                  {lang === 'km' ? 'ឬបញ្ចូល URL រូបភាព Logo' : 'Or enter Logo Image URL'}
                </label>
                <input
                  type="text"
                  value={sysLogoConfig.logoUrl}
                  onChange={(e) => setSysLogoConfig((prev) => ({ ...prev, logoUrl: e.target.value }))}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#B8860B] focus:outline-none"
                />
              </div>

              {/* Brand Name Khmer & English */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-700">
                    {lang === 'km' ? 'ឈ្មោះប្រព័ន្ធ (ភាសាខ្មែរ)' : 'System Name (Khmer)'}
                  </label>
                  <input
                    type="text"
                    value={sysLogoConfig.systemNameKm}
                    onChange={(e) => setSysLogoConfig((prev) => ({ ...prev, systemNameKm: e.target.value }))}
                    placeholder="មង្គលការ"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-700">
                    {lang === 'km' ? 'ឈ្មោះប្រព័ន្ធ (ភាសាអង់គ្លេស)' : 'System Name (English)'}
                  </label>
                  <input
                    type="text"
                    value={sysLogoConfig.systemNameEn}
                    onChange={(e) => setSysLogoConfig((prev) => ({ ...prev, systemNameEn: e.target.value }))}
                    placeholder="MongkulKar System"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsLogoSettingsOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 font-bold text-xs hover:bg-stone-200"
                >
                  {lang === 'km' ? 'បោះបង់' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#B8860B] text-white font-bold text-xs hover:bg-[#966b08] shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{lang === 'km' ? 'រក្សាទុកការផ្លាស់ប្តូរ' : 'Save System Branding'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Template Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2 text-[#B8860B]">
                <Edit3 className="w-5 h-5" />
                <h3 className="font-moul text-base text-stone-900">
                  {lang === 'km' ? 'កែប្រែព័ត៌មាន Template' : 'Edit Template Information'}
                </h3>
              </div>
              <button
                onClick={() => setEditingTemplate(null)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedTemplate} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700">
                  {lang === 'km' ? 'ឈ្មោះ Template (ភាសាខ្មែរ)' : 'Template Name (Khmer)'}
                </label>
                <input
                  type="text"
                  value={editingTemplate.nameKm}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, nameKm: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-800"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700">
                  {lang === 'km' ? 'ឈ្មោះ Template (ភាសាអង់គ្លេស)' : 'Template Name (English)'}
                </label>
                <input
                  type="text"
                  value={editingTemplate.nameEn}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, nameEn: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-800"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700">
                  {lang === 'km' ? 'ស្លាកសញ្ញា Badge' : 'Badge Tag'}
                </label>
                <input
                  type="text"
                  value={editingTemplate.badge}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, badge: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-800"
                  placeholder="e.g. ពេញនិយមបំផុត"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700">
                  {lang === 'km' ? 'ការពិពណ៌នាសង្ខេប Tagline (ភាសាខ្មែរ)' : 'Tagline Description (Khmer)'}
                </label>
                <textarea
                  rows={2}
                  value={editingTemplate.taglineKm}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, taglineKm: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingTemplate(null)}
                  className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 font-bold text-xs hover:bg-stone-200 cursor-pointer"
                >
                  {lang === 'km' ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#B8860B] text-white font-bold text-xs hover:bg-[#966b08] shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{lang === 'km' ? 'រក្សាទុក' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Template Modal */}
      {previewingTemplate && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl relative">
            <button
              onClick={() => setPreviewingTemplate(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-stone-900/80 text-white hover:bg-stone-900 transition-all shadow-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <InvitationCard
              data={{
                ...SAMPLE_INVITATIONS[0],
                templateId: previewingTemplate.id,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
