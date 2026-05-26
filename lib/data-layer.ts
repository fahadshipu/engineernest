import {
  boqSeeds,
  contentSeeds,
  estimatorConfigSeed,
  inventorySeeds,
  materialRateSeeds,
  documentSeeds,
  profileSeed,
  projectSeeds,
  reportSeeds,
  workLogSeeds,
} from "@/lib/seed-data";
import {
  CollectionName,
  CompanyProfile,
  ContentSection,
  EstimatorConfig,
  BoqItem,
  DailyReport,
  DocumentItem,
  InventoryItem,
  MaterialRate,
  Project,
  WorkLog,
} from "@/lib/types";

const STORAGE_PREFIX = "engineernest";

type Collections = {
  projects: Project[];
  boqItems: BoqItem[];
  reports: DailyReport[];
  documents: DocumentItem[];
  contentSections: ContentSection[];
  materialRates: MaterialRate[];
  workLogs: WorkLog[];
  inventoryItems: InventoryItem[];
};

const memoryStore: Collections = {
  projects: structuredClone(projectSeeds),
  boqItems: structuredClone(boqSeeds),
  reports: structuredClone(reportSeeds),
  documents: structuredClone(documentSeeds),
  contentSections: structuredClone(contentSeeds),
  materialRates: structuredClone(materialRateSeeds),
  workLogs: structuredClone(workLogSeeds),
  inventoryItems: structuredClone(inventorySeeds),
};

let memoryProfile = structuredClone(profileSeed);
let memoryEstimatorConfig = structuredClone(estimatorConfigSeed);

const getStorage = () => (typeof window !== "undefined" ? window.localStorage : null);

const keyFor = (name: CollectionName | "profile" | "estimatorConfig") => `${STORAGE_PREFIX}:${name}`;

const readCollection = <T>(name: CollectionName, fallback: T[]): T[] => {
  const storage = getStorage();
  if (!storage) {
    return memoryStore[name] as T[];
  }

  const raw = storage.getItem(keyFor(name));
  if (!raw) {
    storage.setItem(keyFor(name), JSON.stringify(fallback));
    return structuredClone(fallback);
  }

  try {
    return JSON.parse(raw) as T[];
  } catch {
    storage.setItem(keyFor(name), JSON.stringify(fallback));
    return structuredClone(fallback);
  }
};

const writeCollection = <T>(name: CollectionName, data: T[]) => {
  const storage = getStorage();
  if (!storage) {
    (memoryStore[name] as T[]) = structuredClone(data);
    return;
  }

  storage.setItem(keyFor(name), JSON.stringify(data));
};

const readProfile = (): CompanyProfile => {
  const storage = getStorage();
  if (!storage) {
    return memoryProfile;
  }

  const raw = storage.getItem(keyFor("profile"));
  if (!raw) {
    storage.setItem(keyFor("profile"), JSON.stringify(profileSeed));
    return structuredClone(profileSeed);
  }

  try {
    return JSON.parse(raw) as CompanyProfile;
  } catch {
    storage.setItem(keyFor("profile"), JSON.stringify(profileSeed));
    return structuredClone(profileSeed);
  }
};

const readEstimatorConfig = (): EstimatorConfig => {
  const storage = getStorage();
  if (!storage) {
    return memoryEstimatorConfig;
  }

  const raw = storage.getItem(keyFor("estimatorConfig"));
  if (!raw) {
    storage.setItem(keyFor("estimatorConfig"), JSON.stringify(estimatorConfigSeed));
    return structuredClone(estimatorConfigSeed);
  }

  try {
    const parsed = JSON.parse(raw) as Partial<EstimatorConfig>;
    return {
      ...estimatorConfigSeed,
      ...parsed,
      earthwork: {
        ...estimatorConfigSeed.earthwork,
        ...(parsed.earthwork ?? {}),
      },
      landPreset: {
        ...estimatorConfigSeed.landPreset,
        ...(parsed.landPreset ?? {}),
      },
    };
  } catch {
    storage.setItem(keyFor("estimatorConfig"), JSON.stringify(estimatorConfigSeed));
    return structuredClone(estimatorConfigSeed);
  }
};

const writeProfile = (profile: CompanyProfile) => {
  const storage = getStorage();
  if (!storage) {
    memoryProfile = structuredClone(profile);
    return;
  }

  storage.setItem(keyFor("profile"), JSON.stringify(profile));
};

const writeEstimatorConfig = (config: EstimatorConfig) => {
  const storage = getStorage();
  if (!storage) {
    memoryEstimatorConfig = structuredClone(config);
    return;
  }

  storage.setItem(keyFor("estimatorConfig"), JSON.stringify(config));
};

export const dataLayer = {
  listSync<T>(name: CollectionName): T[] {
    switch (name) {
      case "projects":
        return readCollection(name, projectSeeds) as T[];
      case "boqItems":
        return readCollection(name, boqSeeds) as T[];
      case "reports":
        return readCollection(name, reportSeeds) as T[];
      case "documents":
        return readCollection(name, documentSeeds) as T[];
      case "contentSections":
        return readCollection(name, contentSeeds) as T[];
      case "materialRates":
        return readCollection(name, materialRateSeeds) as T[];
      case "workLogs":
        return readCollection(name, workLogSeeds) as T[];
      case "inventoryItems":
        return readCollection(name, inventorySeeds) as T[];
      default:
        return [];
    }
  },

  async list<T>(name: CollectionName): Promise<T[]> {
    return this.listSync<T>(name);
  },

  async upsert<T extends { id: string }>(name: CollectionName, item: T): Promise<T[]> {
    const list = await this.list<T>(name);
    const index = list.findIndex((existing) => existing.id === item.id);
    const next = index >= 0 ? list.map((entry) => (entry.id === item.id ? item : entry)) : [item, ...list];
    writeCollection(name, next);
    return next;
  },

  async remove<T extends { id: string }>(name: CollectionName, id: string): Promise<T[]> {
    const list = await this.list<T>(name);
    const next = list.filter((entry) => entry.id !== id);
    writeCollection(name, next);
    return next;
  },

  async getProfile(): Promise<CompanyProfile> {
    return readProfile();
  },

  getProfileSync(): CompanyProfile {
    return readProfile();
  },

  async setProfile(profile: CompanyProfile): Promise<CompanyProfile> {
    writeProfile(profile);
    return profile;
  },

  async getEstimatorConfig(): Promise<EstimatorConfig> {
    return readEstimatorConfig();
  },

  getEstimatorConfigSync(): EstimatorConfig {
    return readEstimatorConfig();
  },

  async setEstimatorConfig(config: EstimatorConfig): Promise<EstimatorConfig> {
    writeEstimatorConfig(config);
    return config;
  },
};

export const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}`;
};
