import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { PackageOrder, MemberAccount, MemberNotification, PackageTier, UnlockedPackage, TemplateTheme } from "./src/types.js";

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "server_data.json");

interface ServerData {
  members: MemberAccount[];
  orders: PackageOrder[];
  adminQr: {
    qrImage: string;
    accountName: string;
    accountNumber: string;
  };
  systemConfig?: {
    logoUrl: string;
    systemNameKm: string;
    systemNameEn: string;
    taglineKm: string;
    taglineEn: string;
  };
  invitations?: Record<string, any>;
  customTemplates?: TemplateTheme[];
  templateOverrides?: Record<string, any>;
}

// Initial default seed
const defaultData: ServerData = {
  customTemplates: [],
  members: [
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
  ],
  orders: [],
  adminQr: {
    qrImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
    accountName: "MONGKULKAR STUDIO",
    accountNumber: "012 345 678",
  },
  systemConfig: {
    logoUrl: "",
    systemNameKm: "មង្គលការ",
    systemNameEn: "MongkulKar System",
    taglineKm: "កម្មវិធីបង្កើតលិខិតអញ្ជើញអាពាហ៍ពិពាហ៍ឌីជីថល",
    taglineEn: "Khmer Digital Wedding E-Invitation Builder",
  },
};

// Read / Write Database file helpers
function loadData(): ServerData {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      const data = JSON.parse(content);
      data.customTemplates = []; // Clear custom zip templates
      return data;
    }
  } catch (err) {
    console.error("Error reading database file, using fallback", err);
  }
  return defaultData;
}

function saveData(data: ServerData) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving database file", err);
  }
}

let dbData = loadData();
dbData.customTemplates = [];
saveData(dbData);

// Realtime SSE Clients list
const sseClients: express.Response[] = [];

function broadcastRealtime(type: string, data?: any) {
  const payload = JSON.stringify({ type, data, timestamp: Date.now() });
  sseClients.forEach((client) => {
    client.write(`data: ${payload}\n\n`);
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "100mb" }));
  app.use(express.urlencoded({ limit: "100mb", extended: true }));

  // ================= API ROUTES ================= //

  // Realtime Server-Sent Events (SSE) Stream Endpoint
  app.get("/api/realtime/stream", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders();

    // Send connected handshake
    res.write(`data: ${JSON.stringify({ type: "CONNECTED", timestamp: Date.now() })}\n\n`);

    sseClients.push(res);

    req.on("close", () => {
      const idx = sseClients.indexOf(res);
      if (idx !== -1) {
        sseClients.splice(idx, 1);
      }
    });
  });

  // Get Custom Uploaded Templates & Overrides List
  app.get("/api/templates", (req, res) => {
    res.json({
      customTemplates: dbData.customTemplates || [],
      overrides: dbData.templateOverrides || {},
    });
  });

  // Save / Publish All Templates & Overrides to User Members (Admin)
  app.post("/api/admin/templates/publish", (req, res) => {
    const { customTemplates, overrides } = req.body || {};
    if (Array.isArray(customTemplates)) {
      dbData.customTemplates = customTemplates;
    }
    if (overrides && typeof overrides === 'object') {
      dbData.templateOverrides = overrides;
    }

    saveData(dbData);
    broadcastRealtime("TEMPLATES_UPDATED", {
      customTemplates: dbData.customTemplates,
      overrides: dbData.templateOverrides,
    });

    res.json({
      success: true,
      customTemplates: dbData.customTemplates || [],
      overrides: dbData.templateOverrides || {},
    });
  });

  // Save / Update Custom Uploaded Template (Admin)
  app.post("/api/admin/templates", (req, res) => {
    const template: TemplateTheme = req.body;
    if (!template || !template.id) {
      return res.status(400).json({ error: "Invalid template data or missing ID" });
    }

    if (!dbData.customTemplates) {
      dbData.customTemplates = [];
    }

    const idx = dbData.customTemplates.findIndex((t) => t.id === template.id);
    if (idx !== -1) {
      dbData.customTemplates[idx] = template;
    } else {
      dbData.customTemplates.unshift(template);
    }

    saveData(dbData);
    broadcastRealtime("TEMPLATES_UPDATED", {
      customTemplates: dbData.customTemplates,
      overrides: dbData.templateOverrides || {},
    });
    res.json({ success: true, customTemplates: dbData.customTemplates });
  });

  // Delete Custom Uploaded Template (Admin)
  app.delete("/api/admin/templates/:id", (req, res) => {
    const templateId = req.params.id;
    if (dbData.customTemplates) {
      dbData.customTemplates = dbData.customTemplates.filter((t) => t.id !== templateId);
      if (dbData.templateOverrides && dbData.templateOverrides[templateId]) {
        delete dbData.templateOverrides[templateId];
      }
      saveData(dbData);
      broadcastRealtime("TEMPLATES_UPDATED", {
        customTemplates: dbData.customTemplates,
        overrides: dbData.templateOverrides || {},
      });
    }
    res.json({ success: true, customTemplates: dbData.customTemplates || [] });
  });

  // Get Admin QR Config
  app.get("/api/admin/qr", (req, res) => {
    res.json(dbData.adminQr);
  });

  // Get System Config
  app.get("/api/system-config", (req, res) => {
    res.json(dbData.systemConfig || {
      logoUrl: "",
      systemNameKm: "មង្គលការ",
      systemNameEn: "MongkulKar System",
      taglineKm: "កម្មវិធីបង្កើតលិខិតអញ្ជើញអាពាហ៍ពិពាហ៍ឌីជីថល",
      taglineEn: "Khmer Digital Wedding E-Invitation Builder",
    });
  });

  // Save / Update Invitation
  app.post("/api/invitations", (req, res) => {
    const invitationData = req.body;
    if (!invitationData || !invitationData.id) {
      return res.status(400).json({ error: "Invalid invitation data or ID missing" });
    }

    if (!dbData.invitations) {
      dbData.invitations = {};
    }

    dbData.invitations[invitationData.id] = {
      ...invitationData,
      updatedAt: new Date().toISOString(),
    };

    saveData(dbData);
    res.json({ success: true, id: invitationData.id, invitation: dbData.invitations[invitationData.id] });
  });

  // Get Invitation by ID
  app.get("/api/invitations/:id", (req, res) => {
    const id = req.params.id;
    if (!dbData.invitations || !dbData.invitations[id]) {
      return res.status(404).json({ error: "Invitation not found" });
    }
    res.json(dbData.invitations[id]);
  });

  // Add Guest Wish to Invitation
  app.post("/api/invitations/:id/wishes", (req, res) => {
    const id = req.params.id;
    const wish = req.body;

    if (!dbData.invitations || !dbData.invitations[id]) {
      return res.status(404).json({ error: "Invitation not found" });
    }

    const invitation = dbData.invitations[id];
    if (!Array.isArray(invitation.wishes)) {
      invitation.wishes = [];
    }

    invitation.wishes.unshift({
      id: "w-" + Date.now(),
      guestName: wish.guestName || "Guest",
      message: wish.message || "",
      attendance: wish.attendance || "attending",
      guestCount: wish.guestCount || 1,
      createdAt: new Date().toISOString(),
    });

    saveData(dbData);
    broadcastRealtime("NEW_WISH_ADDED", { invitationId: id, wish });
    res.json({ success: true, wishes: invitation.wishes });
  });

  // Update System Config
  app.post("/api/system-config", (req, res) => {
    const { logoUrl, systemNameKm, systemNameEn, taglineKm, taglineEn } = req.body;
    dbData.systemConfig = {
      logoUrl: logoUrl !== undefined ? logoUrl : (dbData.systemConfig?.logoUrl || ""),
      systemNameKm: systemNameKm || dbData.systemConfig?.systemNameKm || "មង្គលការ",
      systemNameEn: systemNameEn || dbData.systemConfig?.systemNameEn || "MongkulKar System",
      taglineKm: taglineKm || dbData.systemConfig?.taglineKm || "កម្មវិធីបង្កើតលិខិតអញ្ជើញអាពាហ៍ពិពាហ៍ឌីជីថល",
      taglineEn: taglineEn || dbData.systemConfig?.taglineEn || "Khmer Digital Wedding E-Invitation Builder",
    };
    saveData(dbData);
    broadcastRealtime("SYSTEM_CONFIG_UPDATED", dbData.systemConfig);
    res.json({ success: true, systemConfig: dbData.systemConfig });
  });

  // Update Admin QR Config
  app.post("/api/admin/qr", (req, res) => {
    const { qrImage, accountName, accountNumber } = req.body;
    dbData.adminQr = {
      qrImage: qrImage || dbData.adminQr.qrImage,
      accountName: accountName || dbData.adminQr.accountName,
      accountNumber: accountNumber || dbData.adminQr.accountNumber,
    };
    saveData(dbData);
    broadcastRealtime("QR_UPDATED", dbData.adminQr);
    res.json({ success: true, adminQr: dbData.adminQr });
  });

  // Get Admin Members List
  // Get Admin Members List
  app.get("/api/admin/members", (req, res) => {
    // Return registered user members (excluding system admin account)
    const userMembers = dbData.members.filter((m) => m.phone !== "admin" && m.id !== "admin");
    res.json(userMembers);
  });

  // Delete Member Account (Admin)
  app.delete("/api/admin/members/:id", (req, res) => {
    const memberId = req.params.id;
    dbData.members = dbData.members.filter((m) => m.id !== memberId && m.phone !== memberId);
    saveData(dbData);
    broadcastRealtime("MEMBER_UPDATED", { deletedId: memberId });
    res.json({ success: true, members: dbData.members });
  });

  // Get current member info by phone
  app.get("/api/members/current", (req, res) => {
    const rawPhone = (req.query.phone as string)?.trim() || "";
    const phone = rawPhone.replace(/\s+/g, "");
    if (!phone) {
      return res.status(400).json({ error: "Phone required" });
    }

    if (phone === "admin" || rawPhone.toLowerCase() === "admin") {
      const adminAcc: MemberAccount = {
        id: "admin",
        name: "គណនី Admin System",
        phone: "admin",
        password: "admin",
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        activatedPackage: {
          packageType: "35",
          activationCode: "ADMIN-VIP",
          memberName: "Admin System",
          memberPhone: "admin",
          maxPhotos: 10,
          unlockedAt: new Date().toISOString(),
        },
        notifications: [],
      };
      return res.json(adminAcc);
    }

    const member = dbData.members.find((m) => m.phone.replace(/\s+/g, "") === phone);
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }
    res.json(member);
  });

  // Register Member
  app.post("/api/auth/register", (req, res) => {
    const { name, phone, password } = req.body;
    const trimmedName = name ? String(name).trim() : "";
    const trimmedPhone = phone ? String(phone).trim().replace(/\s+/g, "") : "";
    const trimmedPassword = password ? String(password).trim() : "";

    if (!trimmedName) {
      return res.status(400).json({ error: "សូមបញ្ចូលឈ្មោះពេញរបស់អ្នក (Please enter your name)" });
    }
    if (!trimmedPhone) {
      return res.status(400).json({ error: "សូមបញ្ចូលលេខទូរស័ព្ទ (Please enter phone number)" });
    }
    if (!trimmedPassword) {
      return res.status(400).json({ error: "សូមបញ្ចូលពាក្យសម្ងាត់ (Please enter password)" });
    }

    const existing = dbData.members.find((m) => m.phone.replace(/\s+/g, "") === trimmedPhone);
    if (existing) {
      return res.status(400).json({ error: "លេខទូរស័ព្ទនេះបានចុះឈ្មោះរួចហើយ! (Phone already registered)" });
    }

    const nowIso = new Date().toISOString();
    const newMember: MemberAccount = {
      id: "mem-" + Date.now(),
      name: trimmedName,
      phone: String(phone).trim(),
      password: trimmedPassword,
      createdAt: nowIso,
      lastLoginAt: nowIso,
      notifications: [
        {
          id: "notif-" + Date.now(),
          memberPhone: String(phone).trim(),
          titleKm: "គណនីរបស់អ្នកត្រូវបានបង្កើតជោគជ័យ!",
          titleEn: "Account Created Successfully!",
          messageKm: "ស្វាគមន៍មកកាន់ប្រព័ន្ធធៀបការឌីជីថល! សូមជ្រើសរើសកញ្ចប់សេវាកម្មដើម្បីទទួលបាន Activation Code បើក Studio!",
          messageEn: "Welcome to MongkulKar! Choose a package plan to activate your Studio Builder.",
          isRead: false,
          createdAt: nowIso,
        },
      ],
    };

    dbData.members.unshift(newMember);
    saveData(dbData);

    broadcastRealtime("MEMBER_REGISTER", newMember);
    res.json(newMember);
  });

  // Login Member
  app.post("/api/auth/login", (req, res) => {
    const { phone, password } = req.body;
    const rawInput = phone ? String(phone).trim() : "";
    const trimmedPhone = rawInput.replace(/\s+/g, "");
    const trimmedPassword = password ? String(password).trim() : "";

    if (!trimmedPhone) {
      return res.status(400).json({ error: "សូមបញ្ចូលលេខទូរស័ព្ទ (Please enter phone number)" });
    }
    if (!trimmedPassword) {
      return res.status(400).json({ error: "សូមបញ្ចូលពាក្យសម្ងាត់ (Please enter password)" });
    }

    // Admin Login support
    if (trimmedPhone.toLowerCase() === "admin" || rawInput.toLowerCase() === "admin") {
      if (trimmedPassword === "admin" || trimmedPassword === "admin123") {
        const adminAcc: MemberAccount = {
          id: "admin",
          name: "គណនី Admin System",
          phone: "admin",
          password: "admin",
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          activatedPackage: {
            packageType: "35",
            activationCode: "ADMIN-VIP",
            memberName: "Admin System",
            memberPhone: "admin",
            maxPhotos: 10,
            unlockedAt: new Date().toISOString(),
          },
          notifications: [],
        };
        broadcastRealtime("MEMBER_LOGIN", adminAcc);
        return res.json(adminAcc);
      } else {
        return res.status(400).json({ error: "ពាក្យសម្ងាត់ Admin មិនត្រឹមត្រូវឡើយ! (admin / admin123)" });
      }
    }

    const member = dbData.members.find((m) => m.phone.replace(/\s+/g, "") === trimmedPhone);
    if (!member) {
      return res.status(404).json({ error: "មិនទាន់មានគណនីជាមួយលេខទូរស័ព្ទនេះទេ! (Account not found. Please register first)" });
    }

    const memberPass = member.password ? member.password.trim() : "";
    if (memberPass && memberPass !== trimmedPassword) {
      return res.status(400).json({ error: "ពាក្យសម្ងាត់មិនត្រឹមត្រូវឡើយ! (Incorrect password)" });
    }

    member.lastLoginAt = new Date().toISOString();
    saveData(dbData);

    broadcastRealtime("MEMBER_LOGIN", member);
    res.json(member);
  });

  // Activate Code Endpoint with Strict Single-Account Ownership Check
  app.post("/api/activate-code", (req, res) => {
    const { phone, code } = req.body;
    const trimmedPhone = phone ? String(phone).trim().replace(/\s+/g, "") : "";
    const cleanCode = code ? String(code).trim().toUpperCase() : "";

    if (!trimmedPhone) {
      return res.status(400).json({ error: "សូមចូលប្រើប្រាស់គណនីរបស់អ្នកជាមុនសិន! (Please login first)" });
    }
    if (!cleanCode) {
      return res.status(400).json({ error: "សូមបញ្ចូល Activation Code (Please enter Activation Code)" });
    }

    const member = dbData.members.find((m) => m.phone.replace(/\s+/g, "") === trimmedPhone);
    if (!member) {
      return res.status(404).json({ error: "រកមិនឃើញគណនីសមាជិកឡើយ! (Member account not found)" });
    }

    // Check if code was generated for an order
    const matchedOrder = dbData.orders.find(
      (o) => o.activationCode && o.activationCode.trim().toUpperCase() === cleanCode
    );

    let tier: "15" | "35" = "15";
    let maxPhotos = 5;

    if (matchedOrder) {
      if (matchedOrder.status !== "approved") {
        return res.status(400).json({ error: "កូដ Activation នេះមិនទាន់ត្រូវបាន Admin អនុម័តឡើយ!" });
      }

      // STRICT ACCOUNT BINDING CHECK:
      const orderPhoneNormalized = matchedOrder.memberPhone.trim().replace(/\s+/g, "");
      if (orderPhoneNormalized !== trimmedPhone) {
        return res.status(400).json({
          error: `⛔ កូដ Activation នេះជារបស់គណនី [${matchedOrder.memberName || matchedOrder.memberPhone}]! អ្នកមិនអាចយក Activation Code របស់គណនីផ្សេងមកប្រើលើគណនីនេះបានឡើយ។`
        });
      }

      tier = matchedOrder.packageType;
      maxPhotos = matchedOrder.maxPhotos || (tier === "35" ? 10 : 5);
    } else if (cleanCode === "STUDIO-15" || cleanCode.startsWith("STD-")) {
      tier = "15";
      maxPhotos = 5;
    } else if (cleanCode === "STUDIO-35" || cleanCode.startsWith("VIP-") || cleanCode === "VIP-35") {
      tier = "35";
      maxPhotos = 10;
    } else {
      return res.status(400).json({
        error: "កូដ Activation មិនត្រឹមត្រូវ ឬមិនទាន់បានបង្កើតឡើយ! សូមពិនិត្យមើលសារ Notification របស់អ្នក។"
      });
    }

    // Check if another member already used this exact code
    const alreadyUsed = dbData.members.find(
      (m) => m.phone.replace(/\s+/g, "") !== trimmedPhone && m.activatedPackage?.activationCode?.trim().toUpperCase() === cleanCode
    );
    if (alreadyUsed) {
      return res.status(400).json({
        error: "កូដ Activation នេះត្រូវគេប្រើប្រាស់លើគណនីផ្សេងរួចរាល់ហើយ! មិនអាចប្រើប្រាស់ឡើងវិញបានឡើយ។"
      });
    }

    const unlocked: UnlockedPackage = {
      packageType: tier,
      activationCode: cleanCode,
      memberName: member.name,
      memberPhone: member.phone,
      maxPhotos: maxPhotos,
      unlockedAt: new Date().toISOString(),
    };

    member.activatedPackage = unlocked;
    saveData(dbData);

    broadcastRealtime("MEMBER_UPDATED", member);
    res.json({ success: true, member, activatedPackage: unlocked });
  });

  // Get Orders List
  app.get("/api/orders", (req, res) => {
    res.json(dbData.orders);
  });

  // Submit Package Order
  app.post("/api/orders", (req, res) => {
    const { orderCode, memberName, memberPhone, telegram, packageType, price, paymentRef, paymentProofUrl, maxPhotos } = req.body;

    if (!memberName || !memberPhone || !paymentProofUrl) {
      return res.status(400).json({ error: "Missing required order fields" });
    }

    const newOrder: PackageOrder = {
      id: "order-" + Date.now(),
      orderCode: orderCode || `ORD-${packageType}-${Math.floor(1000 + Math.random() * 9000)}`,
      memberName: String(memberName).trim(),
      memberPhone: String(memberPhone).trim(),
      telegram: telegram ? String(telegram).trim() : String(memberPhone).trim(),
      packageType: packageType || "35",
      price: price || (packageType === "35" ? 35 : 15),
      paymentRef: paymentRef ? String(paymentRef).trim() : `ABA-KHQR-${Math.floor(100000 + Math.random() * 900000)}`,
      paymentProofUrl,
      createdAt: new Date().toISOString(),
      status: "pending",
      maxPhotos: maxPhotos || (packageType === "35" ? 10 : 5),
    };

    dbData.orders.unshift(newOrder);
    saveData(dbData);

    broadcastRealtime("ORDER_SUBMITTED", newOrder);
    res.json(newOrder);
  });

  // Approve Order (Admin)
  app.post("/api/admin/orders/:id/approve", (req, res) => {
    const orderId = req.params.id;
    const order = dbData.orders.find((o) => o.id === orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const code = `ACT-${order.packageType}-${Math.floor(100000 + Math.random() * 900000)}`;
    order.status = "approved";
    order.activationCode = code;

    const unlocked: UnlockedPackage = {
      packageType: order.packageType,
      activationCode: code,
      memberName: order.memberName,
      memberPhone: order.memberPhone,
      maxPhotos: order.maxPhotos,
      unlockedAt: new Date().toISOString(),
    };

    // Find member and activate
    const targetPhone = order.memberPhone.trim().replace(/\s+/g, "");
    const member = dbData.members.find((m) => m.phone.replace(/\s+/g, "") === targetPhone);

    const newNotif: MemberNotification = {
      id: "notif-" + Date.now(),
      memberPhone: order.memberPhone,
      titleKm: `🎉 Admin បានអនុម័តការទិញកញ្ចប់ ${order.price}$ រួចរាល់!`,
      titleEn: `🎉 Admin Approved Your $${order.price} Package!`,
      messageKm: `សូមប្រើប្រាស់ Activation Code [${code}] ដើម្បីបើកដំណើរការប្រព័ន្ធ Studio បង្កើតធៀបការរបស់អ្នក!`,
      messageEn: `Use Activation Code [${code}] to unlock Studio Builder!`,
      activationCode: code,
      packageType: order.packageType,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    if (member) {
      // Do NOT auto-activate immediately. Send activation code in notification for member to activate manually.
      member.notifications.unshift(newNotif);
    }

    saveData(dbData);

    broadcastRealtime("ORDER_APPROVED", order);
    broadcastRealtime("NOTIFICATION_SENT", { phone: order.memberPhone, notification: newNotif, updatedMember: member });

    res.json({ success: true, order, activationCode: code });
  });

  // Delete Member Account (Admin)
  app.delete("/api/admin/members/:id", (req, res) => {
    const memberId = req.params.id;
    const initialCount = dbData.members.length;
    const targetMember = dbData.members.find((m) => m.id === memberId || m.phone === memberId);
    
    dbData.members = dbData.members.filter((m) => m.id !== memberId && m.phone !== memberId);
    
    if (dbData.members.length < initialCount) {
      saveData(dbData);
      broadcastRealtime("MEMBER_UPDATED", null);
      return res.json({ success: true, deleted: targetMember });
    }
    return res.status(404).json({ error: "Member not found" });
  });

  // Reject Order (Admin)
  app.post("/api/admin/orders/:id/reject", (req, res) => {
    const orderId = req.params.id;
    const order = dbData.orders.find((o) => o.id === orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = "rejected";

    const newNotif: MemberNotification = {
      id: "notif-" + Date.now(),
      memberPhone: order.memberPhone,
      titleKm: `⚠️ ការផ្ទៀងផ្ទាត់វិក្កយបត្រមិនជោគជ័យ`,
      titleEn: `⚠️ Payment Verification Failed`,
      messageKm: `វិក្កយបត្រទូទាត់កញ្ចប់ ${order.price}$ របស់អ្នកមិនអាចផ្ទៀងផ្ទាត់បានឡើយ។ សូមទាក់ទង Admin ឬផ្ញើវិក្កយបត្រម្ដងទៀត!`,
      messageEn: `Payment verification failed. Please contact Admin or resubmit your receipt.`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    const targetPhone = order.memberPhone.trim().replace(/\s+/g, "");
    const member = dbData.members.find((m) => m.phone.replace(/\s+/g, "") === targetPhone);
    if (member) {
      member.notifications.unshift(newNotif);
    }

    saveData(dbData);

    broadcastRealtime("ORDER_REJECTED", order);
    broadcastRealtime("NOTIFICATION_SENT", { phone: order.memberPhone, notification: newNotif, updatedMember: member });

    res.json({ success: true, order });
  });

  // Mark Notifications Read
  app.post("/api/notifications/read", (req, res) => {
    const { phone } = req.body;
    const targetPhone = (phone as string)?.trim().replace(/\s+/g, "");

    if (targetPhone) {
      const member = dbData.members.find((m) => m.phone.replace(/\s+/g, "") === targetPhone);
      if (member) {
        member.notifications.forEach((n) => {
          n.isRead = true;
        });
        saveData(dbData);
        broadcastRealtime("MEMBER_UPDATED", member);
      }
    }
    res.json({ success: true });
  });

  // ================= VITE OR STATIC MIDDLEWARE ================= //
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
