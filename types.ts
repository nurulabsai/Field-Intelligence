
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number; // Epoch timestamp for age validation
}

/** Farm boundary corner point - GPS verified */
export interface BoundaryCorner {
  lat: number;
  lon: number;
  accuracy?: number;
  timestamp?: string;
  sequence: number;
}

export interface AuditImage {
  id: string;
  auditId?: string;
  dataUrl?: string; // Base64 data (cleared after sync to save space)
  storageUrl?: string; // Remote URL after upload
  timestamp: string;
  analysis?: string;
  label?: string; // e.g., 'wide_shot', 'crop_detail'
  gps?: LocationData;
  originalSize?: number; // in bytes
  compressedSize?: number; // in bytes
  synced?: boolean;
}

export interface Task {
  id: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  assignee: string;
  status: 'Pending' | 'Resolved';
  dueDate?: string;
  createdAt: string;
}

export interface CropData {
  id: string;
  type: string;
  otherType?: string;
  area: string;
  variety?: string;
  seedSource?: string;
  plantingMonth?: string;
  harvestMonth?: string;
  plantingMethod?: string;
  waterSource?: string;
  irrigationMethod?: string;
  yieldLast?: string;
  yieldUnit: string;
  yieldThis?: string;
  yieldTrend?: string;
  productionPurpose: string[];
  percentSold?: string;
  priceLast?: string;
  buyer?: string;
  intercropped?: boolean;
  intercropWith?: string;
  rotation?: boolean;
  rotationPrevious?: string;
  challenges?: string[];
}

export interface LivestockData {
  kept: boolean;
  types: string[]; // Cattle, Goats, etc.
  details: {
    cattle?: { count: string; grazing: string; manure: string };
    goats?: { count: string; grazing?: string };
    sheep?: { count: string };
    poultry?: { count: string; system?: string };
    pigs?: { count: string };
    other?: string;
  };
  cropIntegration: boolean;
}

export interface SoilSample {
  id: string; // Unique Sample ID (e.g. SS-001)
  gps: LocationData | null;
  linkedCrop?: string;
  depth?: string;
  landUseHistory?: string;
  fertilizerHistory?: string;
  erosionStatus?: string;
  vegetationCover?: string;
  waterStatus?: string;
  barcode?: string;
  labDestination?: string;
  
  // Kept for backward compatibility but mapped from new fields
  color: string; // Will map to observed color if collected, or default
  drainage: string; // Will map to water status or default
  
  bagPhoto?: AuditImage; // The context photo
  landscapePhoto?: AuditImage; // Can be same as bagPhoto if only one taken
  notes?: string;
}

export interface FarmAuditData {
  // Section A: Identification & Location
  farmId: string;
  auditorId: string;
  auditDate: string;
  region: string;
  district: string;
  ward: string;
  village: string;
  subvillage: string;
  landmark: string;
  /** GPS-verified boundary corners (4-8 required for farm_audits) */
  boundaryCorners?: BoundaryCorner[];
  
  // Section B: Farmer Profile
  farmerFirstName: string;
  farmerMiddleName?: string;
  farmerLastName: string;
  primaryPhone: string;
  secondaryPhone?: string;
  gender: string;
  ageRange: string;
  householdSize: string;
  childrenCount?: string;
  experienceYears: string;
  education: string;
  farmerType: string;
  primaryOccupation: string;
  otherIncomeSources?: string[];
  govSoilProgram?: string;

  // Section C: Land & Tenure
  farmSize: string;
  farmSizeUnit: 'Acres' | 'Hectares';
  cultivatedArea: string;
  landTenure: string;
  landAcquisitionYear?: string;
  soilType: string; // Farmer knowledge
  soilColor?: string; // Observed
  soilTexture?: string; // Observed
  topography: string;
  landscapePosition?: string;
  agroecologicalZone?: string;
  drainage: string;
  erosionStatus?: string;
  erosionControl?: string[];
  waterSourceMain?: string;
  distWaterSource?: string;
  rainfallPattern?: string;
  distPavedRoad: string;
  distMarket: string;

  // Section D: Crops
  crops: CropData[];

  // Section E: Livestock
  livestock: LivestockData;

  // Section F: Specialized
  specialized: {
    apiary?: { practice: boolean; hives?: string; type?: string[]; production?: string; sellingMethod?: string; price?: string };
    aquaculture?: { practice: boolean; type?: string[]; ponds?: string; area?: string; areaUnit?: string; species?: string[]; production?: string; sellingMethod?: string };
    sericulture?: { practice: boolean; trees?: string; production?: string; buyer?: string };
    other?: string;
  };

  // Section G: Inputs & Soil Health
  soilWater: {
    fertilizerUseEver: boolean;
    fertilizerUseThisSeason: boolean;
    fertilizerTypes: string[];
    fertilizerRate?: string;
    fertilizerCost?: string;
    fertilizerSource?: string;
    fertilizerWhyNot?: string[];
    fertilizerAffordability: string;
    
    pesticideUse: boolean;
    pesticideTypes: string[];
    
    organicMatter: string[];
    soilConservation: string[];
    
    soilTestHistory: string;
    govSoilRef?: string;
    soilRecReceived?: boolean;
    soilRecFollowed?: string;
    soilRecResult?: string;
  };

  // Section H: Soil Samples
  soilSamples: {
    collected: boolean;
    count: string; // "1", "2", "3"
    samples: SoilSample[];
    lab?: string;
    deliveryDate?: string;
  };

  // Section I: Inputs & Labor
  inputs: {
    seedSource: string[];
    improvedSeeds: string;
    seedCost?: string;
    laborType: string[];
    laborCost?: string;
    mechanization: string[];
    tractorCost?: string;
  };

  // Section J: Post-Harvest
  postHarvest: {
    hasStorage: boolean;
    storageType: string[];
    storageCapacity?: string;
    storageUnit?: string;
    storagePesticides?: string;
    losses: string;
    lossCauses: string[];
    processing: string[];
  };

  // Section K: Marketing
  marketing: {
    marketName: string;
    distMarket: string;
    frequency?: string;
    marketInfoSource?: string[];
    negotiationPower?: string;
    transport: string[];
    transportCost?: string;
    sellingTiming: string[];
    priceSetter: string;
    satisfaction: string;
    challenges: string[];
    contractFarming: boolean;
    contractBuyer?: string;
    contractSatisfaction?: string;
    contractType: string[];
    cooperativeMember?: boolean;
    cooperativeName?: string;
    cooperativeBenefits?: string[];
  };

  // Section L: Finance
  finance: {
    hasBankAccount: boolean;
    bankName?: string;
    
    mobileMoneyUse: boolean;
    mobileMoneyFrequency?: string;
    
    creditAccess: boolean;
    creditSource?: string[];
    creditPurpose?: string[];
    creditConstraint?: string;
    
    insurance: boolean;
    insuranceType?: string;
    
    savingsGroup: boolean;
    
    // Legacy / Optional fields
    phoneType?: string;
    useAgriApps?: boolean;
  };

  // Section M: Extension Services
  extension: {
    accessLastYear: boolean;
    source?: string[];
    satisfaction?: string;
    infoSources: string[];
    smartphone: boolean;
    internetAccess?: string;
    digitalInterest: string;
    weatherAccess: boolean;
  };

  // Section N: Challenges & Goals
  challenges: {
    mainChallenges: string[];
    futurePlan: string;
    youthInterest: string;
    climateAwareness: boolean;
    climateAdaptation: string[];
    supportNeeded: string;
    comments: string; // Legacy / General comments
  };

  // Section O: Media
  media: {
    photoWide?: AuditImage;
    photoCrop?: AuditImage;
    photoFarmer?: AuditImage;
    photoSoil?: AuditImage;
    photoInfrastructure?: AuditImage;
    photoContext?: AuditImage;
    extraPhotos: AuditImage[]; 
    voiceInterview?: string;
    voiceObservation?: string;
    photoExterior?: AuditImage;
    photoInterior?: AuditImage;
  };

  // Section P: Final Notes
  finalNotes: {
    observations: string;
    dataQuality: string;
    duration: string;
  };

  // Section Q: Action Items (Tasks)
  tasks?: Task[];

  certification: {
    auditorName: string;
    submissionTime: string;
    consents: {
      data: boolean;
      gps: boolean;
      photos: boolean;
      soil: boolean;
      farmer: boolean;
      phone: boolean;
    };
  };
}

export interface BusinessAuditData {
  // Section A: Identification
  businessId: string;
  auditorId: string;
  auditDate: string;
  region: string;
  district: string;
  ward: string;
  locationDesc: string;

  // Section B: BRELA
  brelaId?: string;
  brelaName?: string;
  matchStatus: string;

  // Section C: Profile
  actualName: string;
  businessType: string;
  ownerName: string;
  primaryPhone: string;
  secondaryPhone?: string;
  email?: string;
  yearsOperating: string;
  employeeCount: string;
  operationalStatus: string;
  operatingMonths: string[];

  // Section D: Products & Services (Dynamic)
  agrovet: {
    products: string[];
    top3: string;
    pricing: { name: string; price: string }[];
    creditTerms: string;
    creditDays?: string;
    seasons: string[];
  };
  processor: {
    type: string;
    capacity: string;
    capacityUnit: string;
    rawMaterials: string;
    sourcingRegions: string;
    products: string;
    distribution: string[];
  };
  trader: {
    commodities: string;
    exportDestinations?: string;
    volumes?: string;
    sourcingMethod: string[];
    qualityStandards?: string;
  };
  retailer: {
    storeType: string;
    categories: string[];
    paymentMethods: string[];
    footTraffic: string;
  };

  // Section E: Sourcing
  sourcing: {
    suppliers: string;
    supplierLocations: string;
    transport: string;
    paymentTerms: string;
  };

  // Section F: Customers
  customers: {
    types: string[];
    reach: string;
    channels: string[];
    paymentMethods: string[];
    creditOffered: string;
    creditDays?: string;
  };

  // Section G: Infrastructure
  infrastructure: {
    buildingType: string;
    utilities: string[];
    storageCapacity?: string;
    storageUnit?: string;
    storagePesticides?: string;
    assets: string[];
  };

  // Section H: Financial
  financial: {
    revenueRange: string;
    challenges: string[];
    expansionPlans: string;
    financingSources: string[];
  };

  // Section I: Competitive
  competition: {
    competitorCount: string;
    landmark: string;
    accessibility: string;
  };

  // Section J: Media
  media: {
    photoExterior?: AuditImage;
    photoInterior?: AuditImage;
    photoContext?: AuditImage;
    photoBrela?: AuditImage; // Added BRELA photo
    extraPhotos: AuditImage[];
  };

  // Section K: Action Items
  tasks?: Task[];

  // Certification
  certification: {
    auditorName: string;
    submissionTime: string;
    consents: {
      data: boolean;
      gps: boolean;
      photos: boolean;
      phone: boolean;
    };
  };
}

export interface ExpertComment {
  comment: string;
  author: string;
  date: string;
  generatedByAI: boolean;
}

export interface AuditRecord {
  id: string;
  businessName: string;
  location: LocationData | null;
  status: 'draft' | 'pending' | 'synced' | 'failed';
  createdAt: string;
  updatedAt?: string;
  images: AuditImage[];
  notes: string;
  aiSummary?: string;
  type: 'farm' | 'business';
  farmData?: FarmAuditData;
  businessData?: BusinessAuditData;
  syncRetryCount?: number;
  lastSyncAttempt?: string;
  isTraining?: boolean; 
  
  // Admin / Quality Control
  reviewStatus?: 'pending' | 'approved' | 'flagged' | 'rejected';
  qualityFlags?: string[];
  adminNotes?: string;
  
  // Specialized Expert Feedback
  expertReview?: ExpertComment;
}

export interface User {
  name: string;
  role: string;
}
