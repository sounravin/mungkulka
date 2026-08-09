export interface SystemConfig {
  logoUrl: string;
  systemNameKm: string;
  systemNameEn: string;
  taglineKm: string;
  taglineEn: string;
}

const DEFAULT_CONFIG: SystemConfig = {
  logoUrl: '/logo.svg',
  systemNameKm: 'មង្គលការ',
  systemNameEn: 'MongkulKar System',
  taglineKm: 'កម្មវិធីបង្កើតលិខិតអញ្ជើញអាពាហ៍ពិពាហ៍ឌីជីថល',
  taglineEn: 'Khmer Digital Wedding E-Invitation Builder',
};

let inMemoryConfig: SystemConfig = { ...DEFAULT_CONFIG };

export const getSystemConfig = (): SystemConfig => {
  return inMemoryConfig;
};

export const fetchSystemConfigFromCloud = async (): Promise<SystemConfig> => {
  try {
    const res = await fetch('/api/system-config');
    if (res.ok) {
      const cloudConfig = await res.json();
      inMemoryConfig = { ...DEFAULT_CONFIG, ...cloudConfig };
      window.dispatchEvent(new Event('system-config-updated'));
      return inMemoryConfig;
    }
  } catch (err) {
    console.warn('Could not fetch system config from cloud server:', err);
  }
  return inMemoryConfig;
};

export const saveSystemConfig = async (config: SystemConfig): Promise<void> => {
  inMemoryConfig = { ...config };
  window.dispatchEvent(new Event('system-config-updated'));

  try {
    await fetch('/api/system-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
  } catch (err) {
    console.warn('Could not save system config to cloud server:', err);
  }
};


