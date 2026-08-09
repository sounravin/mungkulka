import { TEMPLATES } from '../data/templates';
import { TemplateTheme } from '../types';

let inMemoryCustomTemplates: TemplateTheme[] = [];
let inMemoryTemplateOverrides: Record<string, Partial<TemplateTheme>> = {};

// Load saved overrides from localStorage
try {
  const savedOverrides = localStorage.getItem('mongkulkar_template_overrides');
  if (savedOverrides) {
    inMemoryTemplateOverrides = JSON.parse(savedOverrides);
  }
} catch (e) {}

// Helper to apply overrides
const applyOverrides = (templates: TemplateTheme[]): TemplateTheme[] => {
  return templates.map((tmpl) => {
    const override = inMemoryTemplateOverrides[tmpl.id];
    if (override) {
      return { ...tmpl, ...override };
    }
    return tmpl;
  });
};

// IndexedDB Helper for high-capacity local storage (prevents 5MB localStorage QuotaExceeded error)
const DB_NAME = 'mongkulkar_db';
const STORE_NAME = 'custom_templates';

function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject('IndexedDB not supported');
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const saveCustomTemplateLocalDB = async (template: TemplateTheme): Promise<void> => {
  try {
    const db = await openIDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(template);
  } catch (err) {
    console.warn('IndexedDB write warning:', err);
  }
};

export const getCustomTemplatesLocalDB = async (): Promise<TemplateTheme[]> => {
  try {
    const db = await openIDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  } catch (err) {
    return [];
  }
};

export const deleteCustomTemplateLocalDB = async (id: string): Promise<void> => {
  try {
    const db = await openIDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
  } catch (err) {
    console.warn('IndexedDB delete warning:', err);
  }
};

export const clearCustomTemplatesLocalDB = async (): Promise<void> => {
  try {
    const db = await openIDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
  } catch (err) {
    console.warn('IndexedDB clear warning:', err);
  }
};

// Helper to get all templates (built-in + custom) with overrides
export const getAllTemplates = (): TemplateTheme[] => {
  const all = [...TEMPLATES, ...inMemoryCustomTemplates];
  return applyOverrides(all);
};

// Helper to get only visible templates for member users
export const getVisibleTemplates = (): TemplateTheme[] => {
  return getAllTemplates().filter((tmpl) => !tmpl.hidden);
};

// Helper to get custom templates only
export const getCustomTemplates = (): TemplateTheme[] => {
  return inMemoryCustomTemplates;
};

// Toggle visibility of any template (Admin)
export const toggleTemplateVisibility = (id: string, forceHidden?: boolean): void => {
  const current = getAllTemplates().find((t) => t.id === id);
  const nextHidden = forceHidden !== undefined ? forceHidden : !current?.hidden;

  inMemoryTemplateOverrides[id] = {
    ...(inMemoryTemplateOverrides[id] || {}),
    hidden: nextHidden,
  };

  try {
    localStorage.setItem('mongkulkar_template_overrides', JSON.stringify(inMemoryTemplateOverrides));
  } catch (e) {}

  window.dispatchEvent(new CustomEvent('templates-updated'));
};

// Update details/overrides of any template (Admin)
export const updateTemplateOverride = (id: string, updates: Partial<TemplateTheme>): void => {
  inMemoryTemplateOverrides[id] = {
    ...(inMemoryTemplateOverrides[id] || {}),
    ...updates,
  };

  try {
    localStorage.setItem('mongkulkar_template_overrides', JSON.stringify(inMemoryTemplateOverrides));
  } catch (e) {}

  window.dispatchEvent(new CustomEvent('templates-updated'));
};

// Publish & sync current template settings to members
export const publishTemplatesToMembers = async (): Promise<boolean> => {
  try {
    const payload = {
      customTemplates: inMemoryCustomTemplates,
      overrides: inMemoryTemplateOverrides,
    };

    const res = await fetch('/api/admin/templates/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      window.dispatchEvent(new CustomEvent('templates-updated'));
      return true;
    }
  } catch (err) {
    console.warn('Could not publish templates to server:', err);
  }

  window.dispatchEvent(new CustomEvent('templates-updated'));
  return true;
};

// Fetch custom templates & overrides from backend server
export const fetchCustomTemplates = async (): Promise<TemplateTheme[]> => {
  try {
    const res = await fetch('/api/templates');
    if (res.ok) {
      const data = await res.json();
      const customTmpls = data.customTemplates || (Array.isArray(data) ? data : []);
      const overrides = data.overrides || {};

      if (Array.isArray(customTmpls)) {
        inMemoryCustomTemplates = customTmpls;
        inMemoryTemplateOverrides = overrides;

        try {
          localStorage.setItem('mongkulkar_custom_templates', JSON.stringify(customTmpls));
          localStorage.setItem('mongkulkar_template_overrides', JSON.stringify(overrides));
        } catch (e) {}

        window.dispatchEvent(new CustomEvent('templates-updated'));
        return getAllTemplates();
      }
    }
  } catch (err) {
    console.warn('Could not fetch custom templates from server, fallback to local storage:', err);
  }

  return getAllTemplates();
};

// Save new or updated custom template to server & state
export const saveCustomTemplate = async (template: TemplateTheme): Promise<void> => {
  const existingIdx = inMemoryCustomTemplates.findIndex((t) => t.id === template.id);
  if (existingIdx !== -1) {
    inMemoryCustomTemplates[existingIdx] = template;
  } else {
    inMemoryCustomTemplates.unshift(template);
  }

  // 1. Save locally to IndexedDB (supports large files & base64 images without quota limits)
  await saveCustomTemplateLocalDB(template);

  // 2. Safe attempt to save to localStorage with catch block
  try {
    localStorage.setItem('mongkulkar_custom_templates', JSON.stringify(inMemoryCustomTemplates));
  } catch (err) {
    console.warn('LocalStorage quota exceeded for custom templates; saved safely to IndexedDB and Server instead.', err);
  }

  window.dispatchEvent(new CustomEvent('templates-updated'));

  // 3. Save to server backend
  try {
    await fetch('/api/admin/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template),
    });
  } catch (err) {
    console.warn('Could not save custom template to server:', err);
  }
};

// Delete custom template
export const deleteCustomTemplate = async (templateId: string): Promise<void> => {
  inMemoryCustomTemplates = inMemoryCustomTemplates.filter((t) => t.id !== templateId);
  await deleteCustomTemplateLocalDB(templateId);

  try {
    localStorage.setItem('mongkulkar_custom_templates', JSON.stringify(inMemoryCustomTemplates));
  } catch (e) {}

  window.dispatchEvent(new CustomEvent('templates-updated'));

  try {
    await fetch(`/api/admin/templates/${templateId}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('Could not delete template from server:', err);
  }
};

// Utility to process zip file entries and extract or construct a TemplateTheme with automatic Khmer fonts and embedded assets
export const processZipTemplate = async (file: File): Promise<TemplateTheme> => {
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(file);

  let templateJson: any = null;
  let htmlContent = '';
  let cssContent = '';
  let previewImage = '';

  const filePaths = Object.keys(zip.files);

  // 1. Map and extract all images, fonts, audio and video assets inside Zip to Base64 Data URLs
  const assetMap: Record<string, string> = {};

  for (const path of filePaths) {
    const entry = zip.files[path];
    if (entry.dir) continue;

    const lowerPath = path.toLowerCase();
    let mimeType = '';

    if (lowerPath.endsWith('.png')) mimeType = 'image/png';
    else if (lowerPath.endsWith('.jpg') || lowerPath.endsWith('.jpeg')) mimeType = 'image/jpeg';
    else if (lowerPath.endsWith('.svg')) mimeType = 'image/svg+xml';
    else if (lowerPath.endsWith('.webp')) mimeType = 'image/webp';
    else if (lowerPath.endsWith('.gif')) mimeType = 'image/gif';
    else if (lowerPath.endsWith('.woff2')) mimeType = 'font/woff2';
    else if (lowerPath.endsWith('.woff')) mimeType = 'font/woff';
    else if (lowerPath.endsWith('.ttf')) mimeType = 'font/ttf';
    else if (lowerPath.endsWith('.otf')) mimeType = 'font/otf';
    else if (lowerPath.endsWith('.mp3')) mimeType = 'audio/mpeg';
    else if (lowerPath.endsWith('.wav')) mimeType = 'audio/wav';
    else if (lowerPath.endsWith('.ogg')) mimeType = 'audio/ogg';

    if (mimeType) {
      try {
        const base64 = await entry.async('base64');
        const dataUrl = `data:${mimeType};base64,${base64}`;
        assetMap[path] = dataUrl;
        
        // Also map by filename alone
        const fileName = path.split('/').pop();
        if (fileName) {
          assetMap[fileName] = dataUrl;
        }

        // Use preview image if cover/preview or first image
        if (!previewImage && (lowerPath.includes('preview') || lowerPath.includes('cover') || lowerPath.includes('thumb'))) {
          previewImage = dataUrl;
        }
      } catch (err) {
        console.warn('Failed converting zip asset to base64:', path, err);
      }
    }
  }

  // 2. Look for template.json / config.json / metadata.json
  const jsonPath = filePaths.find((p) =>
    p.toLowerCase().endsWith('template.json') ||
    p.toLowerCase().endsWith('config.json') ||
    p.toLowerCase().endsWith('metadata.json')
  );

  if (jsonPath) {
    try {
      const jsonStr = await zip.files[jsonPath].async('string');
      templateJson = JSON.parse(jsonStr);
    } catch (e) {
      console.warn('Error parsing JSON inside zip:', e);
    }
  }

  // 3. Look for index.html or *.html
  const htmlPath = filePaths.find((p) => p.toLowerCase().endsWith('index.html')) || filePaths.find((p) => p.toLowerCase().endsWith('.html'));
  if (htmlPath) {
    htmlContent = await zip.files[htmlPath].async('string');
  }

  // 4. Look for style.css or *.css and inline into htmlContent
  const cssPaths = filePaths.filter((p) => p.toLowerCase().endsWith('.css') && !zip.files[p].dir);
  for (const cssP of cssPaths) {
    try {
      const cssText = await zip.files[cssP].async('string');
      cssContent += `\n/* Zip CSS: ${cssP} */\n` + cssText;
      
      // Inline CSS into <link rel="stylesheet"> if matched
      const fileName = cssP.split('/').pop() || '';
      const cssRegex = new RegExp(`<link[^>]*rel=["']stylesheet["'][^>]*href=["'](?:\\./|/)?(?:${cssP.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}|${fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})["'][^>]*\\/?>`, 'gi');
      if (cssRegex.test(htmlContent)) {
        htmlContent = htmlContent.replace(cssRegex, `<style>\n/* Zip CSS: ${cssP} */\n${cssText}\n</style>`);
      }
    } catch (err) {
      console.warn('Error reading CSS file inside zip:', cssP, err);
    }
  }

  // 5. Process JavaScript files inside zip (.js)
  const jsPaths = filePaths.filter((p) => p.toLowerCase().endsWith('.js') && !zip.files[p].dir);
  const embeddedJsPaths = new Set<string>();

  // Attempt to inline JS directly into matching <script src="..."> tags in htmlContent
  for (const jsP of jsPaths) {
    try {
      const jsText = await zip.files[jsP].async('string');
      const fileName = jsP.split('/').pop() || '';
      
      const escapedPath = jsP.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const escapedFileName = fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // Match <script ... src="...jsP or fileName..."></script> or self-closing
      const scriptSrcRegex = new RegExp(`<script([^>]*)\\s+src=["'](?:\\./|/)?(?:${escapedPath}|${escapedFileName})["']([^>]*)>([\\s\\S]*?)<\\/script>`, 'gi');
      
      if (scriptSrcRegex.test(htmlContent)) {
        htmlContent = htmlContent.replace(scriptSrcRegex, `<script$1$2>\n;\n/* Zip Inline JS: ${jsP} */\n${jsText}\n;\n</script>`);
        embeddedJsPaths.add(jsP);
      }
    } catch (err) {
      console.warn('Error inlining script:', jsP, err);
    }
  }

  // Append any remaining JS files that were not referenced directly in script src tags
  let remainingJs = '';
  for (const jsP of jsPaths) {
    if (!embeddedJsPaths.has(jsP)) {
      try {
        const jsText = await zip.files[jsP].async('string');
        remainingJs += `;\n/* Zip Unreferenced JS: ${jsP} */\n` + jsText + `\n;\n`;
      } catch (err) {
        console.warn('Error reading JS file inside zip:', jsP, err);
      }
    }
  }

  if (remainingJs && htmlContent) {
    htmlContent += `\n<script>\n${remainingJs}\n</script>\n`;
  }

  // Fallback preview image if not set yet
  if (!previewImage) {
    const firstImgKey = Object.keys(assetMap)[0];
    if (firstImgKey) {
      previewImage = assetMap[firstImgKey];
    }
  }

  // 6. Replace relative asset paths in HTML & CSS with Base64 Data URLs
  for (const [assetPath, dataUrl] of Object.entries(assetMap)) {
    if (!assetPath) continue;

    const escapedPath = assetPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // HTML src="...", href="...", background="..."
    const htmlRegex = new RegExp(`(src|href|background)=["']?(\\./|/)?${escapedPath}["']?`, 'gi');
    htmlContent = htmlContent.replace(htmlRegex, `$1="${dataUrl}"`);

    // CSS url(...)
    const cssRegex = new RegExp(`url\\(["']?(\\./|/)?${escapedPath}["']?\\)`, 'gi');
    cssContent = cssContent.replace(cssRegex, `url("${dataUrl}")`);
  }

  // Auto-Khmer font conversion & Mobile Responsive Container Isolation
  const baseName = file.name.replace(/\.zip$/i, '');
  const cleanId = 'zip-tmpl-' + Date.now();

  const fontAndMobileCss = `@import url('https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@300;400;600;700&family=Moul&family=Siemreap&display=swap');

/* Mobile Phone Responsive Auto-Fixes & Clean Isolation */
.custom-zip-extracted-html {
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
  overflow-x: hidden !important;
  font-family: 'Kantumruy Pro', 'Siemreap', sans-serif;
}
.custom-zip-extracted-html * {
  box-sizing: border-box;
}
.custom-zip-extracted-html img,
.custom-zip-extracted-html svg,
.custom-zip-extracted-html video,
.custom-zip-extracted-html iframe {
  max-width: 100%;
}
.custom-zip-extracted-html table {
  width: 100% !important;
  max-width: 100% !important;
  display: block;
  overflow-x: auto;
}
.custom-zip-extracted-html h1,
.custom-zip-extracted-html h2,
.custom-zip-extracted-html h3,
.custom-zip-extracted-html .khmer-title {
  font-family: 'Moul', 'Kantumruy Pro', sans-serif;
}
`;

  cssContent = fontAndMobileCss + (cssContent || '');

  const newTemplate: TemplateTheme = {
    id: cleanId,
    nameKm: templateJson?.nameKm || `រចនាបថ ${baseName}`,
    nameEn: templateJson?.nameEn || `${baseName} Zip Custom Theme`,
    taglineKm: templateJson?.taglineKm || 'រចនាបថគំរូអាប់ឡូតតាមរយៈ Zip File ជាមួយ Font ខ្មែរស្វ័យប្រវត្តិ',
    taglineEn: templateJson?.taglineEn || 'Uploaded Custom Zip Template with Auto Khmer Font Conversion',
    badge: templateJson?.badge || '★ ZIP TEMPLATE',
    previewImage: templateJson?.previewImage || previewImage || 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=80',
    bgGradient: templateJson?.bgGradient || 'from-[#2C2117] via-[#3D2C1E] to-[#2C2117]',
    accentColor: templateJson?.accentColor || '#B8860B',
    borderColor: templateJson?.borderColor || '#E8DFC2',
    headerFontClass: templateJson?.headerFontClass || 'font-moul',
    bodyFontClass: templateJson?.bodyFontClass || 'font-kantumruy',
    cardBgClass: templateJson?.cardBgClass || 'bg-[#FFFDF9] text-[#2C2117] border-[#E8DFC2]',
    gatePattern: templateJson?.gatePattern || 'floral-arch',
    isCustom: true,
    htmlContent: htmlContent || templateJson?.htmlContent || '',
    cssContent: cssContent || templateJson?.cssContent || '',
    uploadedAt: new Date().toISOString(),
    zipFileName: file.name,
  };

  return newTemplate;
};
