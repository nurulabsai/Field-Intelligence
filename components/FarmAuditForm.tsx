import React from 'react';
import { FarmAuditData, User, AuditRecord, AuditImage } from '../types';
import { PagedFormContainer } from './PagedFormContainer';
import { farmAuditTemplate } from '../data/farmAuditQuestions';
import { Language } from '../services/i18n';

interface FarmAuditFormProps {
  user: User;
  onSave: (audit: AuditRecord) => void;
  onCancel: () => void;
  initialLocation: any;
  lang: Language;
  isHighContrast?: boolean;
  isTraining?: boolean;
}

/**
 * Helper: coerce a raw photo value (from QuestionRenderer) into an AuditImage.
 * QuestionRenderer now returns the correct AuditImage shape, but we guard
 * against legacy `{data, filename, size}` objects that may exist in drafts.
 */
const toAuditImage = (raw: any, label: string): AuditImage | null => {
  if (!raw) return null;
  // Already a proper AuditImage (has id + dataUrl)
  if (raw.id && (raw.dataUrl || raw.storageUrl)) {
    return { ...raw, label: raw.label || label };
  }
  // Legacy format from old QuestionRenderer
  if (raw.data) {
    return {
      id: crypto.randomUUID(),
      dataUrl: raw.data,
      label,
      timestamp: raw.timestamp || new Date().toISOString(),
      originalSize: raw.size,
      synced: false,
    };
  }
  return null;
};

const FarmAuditForm: React.FC<FarmAuditFormProps> = ({
  user,
  onSave,
  onCancel,
  initialLocation,
  lang,
}) => {

  /** Transform flat form data → structured FarmAuditData + AuditRecord */
  const mapToAuditRecord = (flatData: any, isDraft: boolean): AuditRecord => {

    const farmData: FarmAuditData = {
      farmId: flatData.farmId || crypto.randomUUID(),
      auditorId: user.name,
      auditDate: flatData.audit_date || new Date().toISOString(),

      // ── Section A: Location ──────────────────────────────────────────
      region: flatData.region || '',
      district: flatData.district || '',
      ward: flatData.ward || '',
      village: flatData.village || '',
      subvillage: flatData.subvillage || '',
      landmark: flatData.landmark || '',
      boundaryCorners: Array.isArray(flatData.boundary_corners)
        ? flatData.boundary_corners
        : undefined,

      // ── Section B: Farmer Profile ────────────────────────────────────
      farmerFirstName: flatData.farmer_first_name || '',
      farmerLastName: flatData.farmer_last_name || '',
      primaryPhone: flatData.phone_number || '',
      gender: flatData.gender || '',
      ageRange: flatData.age_range || '',
      householdSize: flatData.household_size ? String(flatData.household_size) : '',
      experienceYears: flatData.farming_experience ? String(flatData.farming_experience) : '',
      education: flatData.education_level || '',
      farmerType: flatData.farmer_type || 'Smallholder',
      primaryOccupation: flatData.primary_occupation || 'Farming',
      otherIncomeSources: flatData.other_income_sources || [],

      // ── Section C: Land ──────────────────────────────────────────────
      farmSize: flatData.farm_size ? String(flatData.farm_size) : '',
      farmSizeUnit: flatData.farm_size_unit || 'Acres',
      cultivatedArea: flatData.cultivated_area ? String(flatData.cultivated_area) : '',
      landTenure: flatData.land_tenure || '',
      soilType: flatData.soil_type || '',
      topography: flatData.topography || '',
      drainage: flatData.drainage || '',
      distPavedRoad: flatData.distance_to_road ? String(flatData.distance_to_road) : '',
      distMarket: flatData.distance_to_market ? String(flatData.distance_to_market) : '',
      waterSourceMain: flatData.water_source_main || '',
      rainfallPattern: flatData.rainfall_pattern || '',
      erosionStatus: flatData.erosion_status || '',
      erosionControl: flatData.erosion_control || [],

      // ── Section D: Crops ─────────────────────────────────────────────
      crops: (flatData.main_crops || []).map((cropType: string) => ({
        id: crypto.randomUUID(),
        type: cropType,
        variety: flatData[`${cropType}_variety`] || '',
        area: flatData[`${cropType}_area`] ? String(flatData[`${cropType}_area`]) : '',
        yieldLast: flatData[`${cropType}_yield`] ? String(flatData[`${cropType}_yield`]) : '',
        yieldUnit: flatData[`${cropType}_yield_unit`] || 'kg',
        seedSource: flatData[`${cropType}_seed_source`] || '',
        waterSource: flatData[`${cropType}_water_source`] || 'Rain-fed',
        productionPurpose: flatData[`${cropType}_production_purpose`] || [],
        challenges: flatData[`${cropType}_challenges`] || [],
      })),

      // ── Section E: Livestock ─────────────────────────────────────────
      livestock: {
        kept: flatData.livestock_kept === true,
        types: flatData.livestock_types || [],
        details: {
          cattle: (flatData.livestock_types || []).includes('Cattle')
            ? { count: String(flatData.cattle_count || 0), grazing: flatData.cattle_grazing || 'Unknown', manure: flatData.cattle_manure || 'Unknown' }
            : undefined,
          goats: (flatData.livestock_types || []).includes('Goats')
            ? { count: String(flatData.goats_count || 0) }
            : undefined,
          sheep: (flatData.livestock_types || []).includes('Sheep')
            ? { count: String(flatData.sheep_count || 0) }
            : undefined,
          poultry: (flatData.livestock_types || []).includes('Poultry')
            ? { count: String(flatData.poultry_count || 0), system: flatData.poultry_system || 'Free range' }
            : undefined,
          pigs: (flatData.livestock_types || []).includes('Pigs')
            ? { count: String(flatData.pigs_count || 0) }
            : undefined,
          other: flatData.livestock_other || undefined,
        },
        cropIntegration: flatData.livestock_crop_integration === true,
      },

      // ── Section F: Specialized ───────────────────────────────────────
      specialized: {
        other: flatData.specialized_other || '',
        apiary: flatData.apiary_practice === true
          ? { practice: true, hives: String(flatData.apiary_hives || ''), type: flatData.apiary_type || [], production: flatData.apiary_production || '' }
          : undefined,
        aquaculture: flatData.aquaculture_practice === true
          ? { practice: true, type: flatData.aquaculture_type || [], ponds: String(flatData.aquaculture_ponds || ''), area: flatData.aquaculture_area || '', areaUnit: 'sqm', species: flatData.aquaculture_species || [], production: flatData.aquaculture_production || '', sellingMethod: '', distribution: [] }
          : undefined,
      },

      // ── Section G: Inputs & Soil Health ─────────────────────────────
      soilWater: {
        fertilizerUseEver: flatData.fertilizer_use === true,
        fertilizerUseThisSeason: flatData.fertilizer_use_season === true,
        fertilizerTypes: flatData.fertilizer_types || [],
        fertilizerAffordability: flatData.fertilizer_affordability || '',
        fertilizerRate: flatData.fertilizer_rate || '',
        fertilizerSource: flatData.fertilizer_source || '',
        fertilizerWhyNot: flatData.fertilizer_why_not || [],
        pesticideUse: flatData.pesticide_use === true,
        pesticideTypes: flatData.pesticide_types || [],
        organicMatter: flatData.organic_matter || [],
        soilConservation: flatData.soil_conservation || [],
        soilTestHistory: flatData.soil_test_history || 'Never',
        govSoilRef: flatData.gov_soil_ref || '',
        soilRecReceived: flatData.soil_rec_received === true,
        soilRecFollowed: flatData.soil_rec_followed || '',
      },

      // ── Section H: Soil Samples ──────────────────────────────────────
      soilSamples: {
        collected: flatData.soil_samples_collected === true,
        count: flatData.soil_sample_count ? String(flatData.soil_sample_count) : '0',
        samples: [],
        lab: flatData.soil_lab || '',
      },

      // ── Section I: Inputs & Labor ────────────────────────────────────
      inputs: {
        seedSource: flatData.seed_source || [],
        improvedSeeds: flatData.improved_seeds || '',
        laborType: flatData.labor_type || [],
        mechanization: flatData.mechanization || [],
      },

      // ── Section J: Post-Harvest ──────────────────────────────────────
      postHarvest: {
        hasStorage: flatData.has_storage === true,
        storageType: flatData.storage_type || [],
        losses: flatData.post_harvest_losses ? String(flatData.post_harvest_losses) : '',
        lossCauses: flatData.loss_causes || [],
        processing: flatData.processing || [],
      },

      // ── Section K: Marketing ─────────────────────────────────────────
      marketing: {
        marketName: flatData.market_name || '',
        distMarket: flatData.distance_to_market ? String(flatData.distance_to_market) : '',
        transport: flatData.transport || [],
        sellingTiming: flatData.selling_timing || [],
        priceSetter: flatData.price_setter || '',
        satisfaction: flatData.market_satisfaction || '',
        challenges: flatData.marketing_challenges || [],
        contractFarming: flatData.contract_farming === true,
        contractBuyer: flatData.contract_buyer_name || '',
        contractType: flatData.contract_type || [],
      },

      // ── Section L: Finance ───────────────────────────────────────────
      finance: {
        hasBankAccount: flatData.bank_account === true,
        mobileMoneyUse: flatData.mobile_money === true,
        creditAccess: flatData.credit_access === true,
        creditSource: flatData.credit_source || [],
        insurance: flatData.insurance === true,
        savingsGroup: flatData.savings_group === true,
      },

      // ── Section M: Extension & Digital ──────────────────────────────
      extension: {
        accessLastYear: flatData.extension_access_last_year === true,
        source: flatData.extension_source || [],
        infoSources: flatData.information_sources || [],
        smartphone: flatData.smartphone_ownership === true,
        digitalInterest: flatData.digital_agriculture_interest || '',
        weatherAccess: flatData.weather_information_access === true,
      },

      // ── Section N: Challenges & Future ──────────────────────────────
      challenges: {
        mainChallenges: flatData.main_farming_challenges || [],
        futurePlan: flatData.farming_5_years_plan || '',
        youthInterest: flatData.youth_involvement || '',
        climateAwareness: flatData.climate_change_awareness === true,
        climateAdaptation: flatData.climate_adaptation_practices || [],
        supportNeeded: flatData.support_needed_most || '',
        comments: flatData.auditor_observations || '',
      },

      // ── Section O: Media ─────────────────────────────────────────────
      media: {
        photoWide: toAuditImage(flatData.photo_farm_wide_shot, 'Farm Wide Shot') || undefined,
        photoCrop: toAuditImage(flatData.photo_main_crop_closeup, 'Main Crop Close-up') || undefined,
        photoFarmer: toAuditImage(flatData.photo_farmer_portrait, 'Farmer Portrait') || undefined,
        extraPhotos: [
          toAuditImage(flatData.photo_additional_1, 'Additional Photo 1'),
          toAuditImage(flatData.photo_additional_2, 'Additional Photo 2'),
        ].filter((p): p is AuditImage => p !== null),
      },

      // ── Section P: Final Notes ───────────────────────────────────────
      finalNotes: {
        observations: flatData.auditor_observations || '',
        dataQuality: flatData.data_quality_self_assessment || '',
        duration: flatData.audit_duration_minutes ? String(flatData.audit_duration_minutes) : '',
      },

      // ── Section Q: Certification ─────────────────────────────────────
      certification: {
        auditorName: user.name,
        submissionTime: new Date().toISOString(),
        consents: {
          data: flatData.consent_confirmed === true,
          gps: true,
          photos: true,
          soil: true,
          farmer: true,
          phone: true,
        },
      },
    };

    // ── Collect all images for top-level AuditRecord ──────────────────
    const images: AuditImage[] = [];
    if (farmData.media.photoWide) images.push({ ...farmData.media.photoWide, auditId: farmData.farmId });
    if (farmData.media.photoCrop) images.push({ ...farmData.media.photoCrop, auditId: farmData.farmId });
    if (farmData.media.photoFarmer) images.push({ ...farmData.media.photoFarmer, auditId: farmData.farmId });
    if (farmData.media.extraPhotos) {
      farmData.media.extraPhotos.forEach(p => images.push({ ...p, auditId: farmData.farmId }));
    }
    // Also collect soil sample photos
    farmData.soilSamples.samples.forEach(s => {
      if (s.bagPhoto) images.push({ ...s.bagPhoto, auditId: farmData.farmId });
    });

    const farmerName = [farmData.farmerFirstName, farmData.farmerLastName].filter(Boolean).join(' ').trim();

    return {
      id: farmData.farmId,
      businessName: farmerName ? `${farmerName}'s Farm` : `Farm Audit ${new Date().toLocaleDateString()}`,
      location: initialLocation || (flatData.gps_location as any),
      status: isDraft ? 'draft' : 'pending',
      createdAt: new Date().toISOString(),
      images,
      notes: farmData.finalNotes.observations,
      type: 'farm',
      farmData,
    };
  };

  const handleSubmit = (data: any, isDraft = false) => {
    const record = mapToAuditRecord(data, isDraft);
    onSave(record);
  };

  return (
    <PagedFormContainer
      template={farmAuditTemplate}
      initialValues={{ gps_location: initialLocation }}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      onSaveDraft={(d) => handleSubmit(d.data, true)}
      lang={lang}
    />
  );
};

export default FarmAuditForm;
