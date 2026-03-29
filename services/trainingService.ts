import { AuditRecord, FarmAuditData, User } from "../types";

export const getSampleFarmData = (user: User): FarmAuditData => {
  return {
    farmId: crypto.randomUUID(),
    auditorId: user.name,
    auditDate: new Date().toISOString().split('T')[0],
    region: 'Morogoro',
    district: 'Mvomero',
    ward: 'Mlali',
    village: 'Kipera',
    subvillage: 'Bondeni',
    landmark: 'Near the primary school',
    
    farmerFirstName: 'Maria',
    farmerLastName: 'Kimaro',
    primaryPhone: '0755123456',
    gender: 'Female',
    ageRange: '36-45',
    householdSize: '5',
    experienceYears: '12',
    education: 'Primary',
    farmerType: 'Smallholder',
    primaryOccupation: 'Farming',

    farmSize: '4',
    farmSizeUnit: 'Acres',
    cultivatedArea: '3.5',
    landTenure: 'Own no title',
    soilType: 'Loam',
    topography: 'Flat',
    drainage: 'Good',
    distPavedRoad: '5',
    distMarket: '12',

    crops: [
      {
        id: crypto.randomUUID(),
        type: 'Maize',
        area: '2',
        plantingMonth: 'Dec',
        harvestMonth: 'May',
        waterSource: 'Rainfed',
        yieldLast: '1800', // kg
        yieldUnit: 'kg',
        yieldThis: '',
        yieldTrend: 'STABLE',
        productionPurpose: ['Sale', 'Consumption'],
        percentSold: '70',
        priceLast: '600',
        buyer: 'Local trader'
      },
      {
        id: crypto.randomUUID(),
        type: 'Rice',
        area: '1.5',
        plantingMonth: 'Jan',
        harvestMonth: 'Jun',
        waterSource: 'River',
        yieldLast: '2000',
        yieldUnit: 'kg',
        yieldThis: '',
        yieldTrend: 'INCREASING',
        productionPurpose: ['Sale'],
        percentSold: '90',
        priceLast: '1400',
        buyer: 'Cooperative'
      }
    ],

    livestock: {
      kept: true,
      types: ['Poultry'],
      details: {
        poultry: { count: '15' }
      },
      cropIntegration: true
    },

    specialized: { other: '' },
    soilWater: {
      fertilizerUseEver: true,
      fertilizerUseThisSeason: true,
      fertilizerTypes: ['DAP', 'Urea'],
      fertilizerSource: 'Agrovet',
      fertilizerAffordability: 'YES_CASH',
      fertilizerWhyNot: [],
      pesticideUse: false,
      pesticideTypes: [],
      organicMatter: ['Crop residues'],
      soilConservation: ['Crop rotation'],
      soilTestHistory: 'Never tested'
    },

    soilSamples: { collected: false, count: "1", samples: [] },
    inputs: { seedSource: ['Saved'], improvedSeeds: 'No', laborType: ['Family'], mechanization: ['Hand hoe'] },
    postHarvest: { hasStorage: true, storageType: ['Sacks in house'], losses: 'Low 5%', lossCauses: ['Insects'], processing: [] },
    marketing: { marketName: 'Mlali Market', distMarket: '5', transport: ['Motorcycle'], sellingTiming: ['At harvest'], priceSetter: 'Buyer', satisfaction: 'Medium', challenges: ['Low prices'], contractFarming: false, contractType: [] },
    finance: { hasBankAccount: false, mobileMoneyUse: true, mobileMoneyFrequency: 'WEEKLY', creditAccess: false, creditSource: [], creditPurpose: [], creditConstraint: 'MINOR_CONSTRAINT', insurance: false, savingsGroup: true, phoneType: 'Feature phone', useAgriApps: false },
    extension: { accessLastYear: true, source: ['GOVERNMENT_WARD', 'NGO'], satisfaction: 'SATISFIED', infoSources: ['EXTENSION_OFFICER', 'RADIO'], smartphone: true, internetAccess: 'WEEKLY', digitalInterest: 'INTERESTED', weatherAccess: true },
    challenges: { 
        mainChallenges: ['CLIMATE_DROUGHT', 'LACK_INPUTS'], 
        futurePlan: 'EXPAND', 
        youthInterest: 'SOME_INTERESTED',
        climateAwareness: true,
        climateAdaptation: ['DROUGHT_TOLERANT_VARIETIES', 'CROP_DIVERSIFICATION'],
        supportNeeded: 'INPUT_SUBSIDIES',
        comments: 'Farmer is interested in soil testing for next season.' 
    },
    media: { extraPhotos: [] },
    finalNotes: {
        observations: 'Farm looks well managed but needs better inputs.',
        dataQuality: 'GOOD',
        duration: '45'
    },
    certification: { auditorName: user.name, submissionTime: '', consents: { data: true, gps: true, photos: true, soil: true, farmer: true, phone: true } }
  };
};

export const getFieldGuide = (fieldKey: string, lang: 'en'|'sw' = 'en') => {
  const guides: Record<string, {en: string, sw: string}> = {
    'crop_type': {
      en: "Identify based on leaf shape and growth habit. Maize has long broad leaves. Rice grows in clumps, often in wet soil. Cassava has palm-like leaves.",
      sw: "Tambua kwa kuangalia majani. Mahindi yana majani mapana marefu. Mpunga huota kwenye matope/maji. Muhogo una majani kama kiganja."
    },
    'soil_type': {
      en: "Rub soil between fingers. Sandy is gritty. Clay is sticky/shiny when wet. Loam feels smooth and floury.",
      sw: "Sugua udongo vidoleni. Kichanga ni kigumu/kinakwaruza. Tufae (Clay) inata na kung'aa ikilowa. Tifutifu ni laini."
    },
    'farm_size': {
      en: "1 Acre ≈ 70x70 walking steps (meters). 1 Hectare ≈ 100x100 steps (2.5 Acres). Ask farmer how many 'lines' or 'task' they hoe.",
      sw: "Ekari 1 ≈ hatua 70x70. Hekta 1 ≈ hatua 100x100 (Ekari 2.5). Muulize mkulima analima 'tasiki' ngapi."
    },
    'yield': {
      en: "Ask for bag counts. Standard bag is ~90-100kg. Bucket/Debe is ~18-20kg. Calculate total: Bags x Weight.",
      sw: "Uliza idadi ya magunia. Gunia la kawaida ni kilo 90-100. Ndoo/Debe ni kilo 18-20. Kokotoa: Magunia x Kilo."
    }
  };
  return guides[fieldKey]?.[lang];
};

export const calculateStats = (audits: AuditRecord[]) => {
  const completed = audits.filter(a => a.status !== 'draft');
  const avgAccuracy = completed.reduce((acc, curr) => acc + (curr.location?.accuracy || 0), 0) / (completed.length || 1);
  
  // Simple "Quality Score" based on filling out optional fields (photos, comments)
  const qualityScore = completed.reduce((acc, curr) => {
    let score = 100;
    if (!curr.images || curr.images.length < 3) score -= 20;
    if (!curr.notes || curr.notes.length < 10) score -= 10;
    if (!curr.location?.accuracy || curr.location.accuracy > 20) score -= 10;
    return acc + score;
  }, 0) / (completed.length || 1);

  return {
    total: completed.length,
    drafts: audits.filter(a => a.status === 'draft').length,
    avgAccuracy: Math.round(avgAccuracy),
    qualityScore: Math.round(qualityScore),
    trainingCount: audits.filter(a => a.isTraining).length,
    realCount: audits.filter(a => !a.isTraining).length
  };
};

export const exportAuditsToCSV = (audits: AuditRecord[]) => {
  if (audits.length === 0) return;

  const trainingAudits = audits.filter(a => a.isTraining);
  if (trainingAudits.length === 0) {
      alert("No training audits to export.");
      return;
  }

  // Flatten structure for CSV
  const rows = trainingAudits.map(a => {
    const fd = a.farmData;
    return {
      AuditID: a.id,
      Date: a.createdAt,
      Auditor: fd?.auditorId,
      Farmer: `${fd?.farmerFirstName} ${fd?.farmerLastName}`,
      Region: fd?.region,
      Crop1: fd?.crops[0]?.type,
      Crop1_Yield: fd?.crops[0]?.yieldLast,
      GPS_Lat: a.location?.latitude,
      GPS_Lon: a.location?.longitude,
      GPS_Acc: a.location?.accuracy,
      Quality_Notes: a.notes,
      Images_Count: a.images.length
    };
  });

  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row => headers.map(header => JSON.stringify((row as any)[header])).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `training_export_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};