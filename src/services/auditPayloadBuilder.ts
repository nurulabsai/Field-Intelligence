import type { AuditFormState } from '../types/auditTypes';
import { polygonToGeoJSON, pointToGeoJSON, calculateAccuracySummary }
  from '../utils/geoUtils';

export interface AuditSyncPayload {
  audit: {
    id: string;
    type: string;
    started_at: string;
    auditor_id: string;
  };
  farmer: Record<string, unknown>;
  farm: Record<string, unknown>;
  farm_boundary: Record<string, unknown> | null;
  plots: Record<string, unknown>[];
}

export function buildAuditPayload(state: AuditFormState): AuditSyncPayload {
  const { farmer, farmProfile, farmBoundary, plots, auditId, auditorId } = state;

  if (!farmer)      throw new Error('Farmer profile is required before submitting');
  if (!farmProfile) throw new Error('Farm profile is required before submitting');
  if (!farmProfile.farmerLocalId)
    throw new Error('Farm profile is missing farmer linkage — data integrity error');

  const accSummary = farmBoundary?.polygon?.points
    ? calculateAccuracySummary(farmBoundary.polygon.points)
    : null;

  return {
    audit: {
      id: auditId,
      type: state.auditType,
      started_at: state.startedAt,
      auditor_id: auditorId,
    },

    farmer: {
      local_id: farmer.localId,
      phone_number: farmer.identity.phoneNumber,
      full_name: farmer.identity.fullName,
      preferred_name: farmer.identity.preferredName,
      ...(farmer.identity.nationalId ? { national_id: farmer.identity.nationalId } : {}),
      gender: farmer.identity.gender,
      age_range: farmer.identity.ageRange,
      photo_url: farmer.identity.photoUrl,
      household_size: farmer.household.householdSize,
      dependents: farmer.household.dependents,
      off_farm_income: farmer.household.offFarmIncome,
      off_farm_income_source: farmer.household.offFarmIncomeSource,
      primary_income_source: farmer.household.primaryIncomeSource,
      education_level: farmer.household.educationLevel,
      years_farming: farmer.experience.yearsFarming,
      has_received_training: farmer.experience.hasReceivedTraining,
      training_types: farmer.experience.trainingTypes,
      cooperative_member: farmer.experience.cooperativeMember,
      cooperative_name: farmer.experience.cooperativeName,
      farmer_group_member: farmer.experience.farmerGroupMember,
      farmer_group_name: farmer.experience.farmerGroupName,
      extension_contact_freq: farmer.experience.extensionContactFrequency,
      has_bank_account: farmer.financial.hasBankAccount,
      bank_name: farmer.financial.bankName,
      mobile_money_user: farmer.financial.mobileMoneyUser,
      mobile_money_providers: farmer.financial.mobileMoneyProviders,
      mobile_money_number: farmer.financial.mobileMoneyNumber,
      has_accessed_credit: farmer.financial.hasAccessedCredit,
      credit_sources: farmer.financial.creditSources,
      credit_purpose: farmer.financial.creditPurpose,
      has_input_credit: farmer.financial.hasInputCredit,
      input_credit_source: farmer.financial.inputCreditSource,
      phone_type: farmer.digital.phoneType,
      uses_whatsapp: farmer.digital.usesWhatsApp,
      uses_agri_apps: farmer.digital.usesAgriApps,
      agri_apps_used: farmer.digital.agriAppsUsed,
      language_preference: farmer.digital.languagePreference,
      comfort_digital_forms: farmer.digital.comfortWithDigitalForms,
      captured_at: farmer.capturedAt,
      captured_by: farmer.capturedBy,
      source_audit_id: auditId,
    },

    farm: {
      farmer_local_id: farmProfile.farmerLocalId,
      local_ref: farmProfile.farmLocalRef,
      farmer_name: farmProfile.farmerName,
      farmer_contact: farmProfile.farmerContact,
      region: farmProfile.region,
      district: farmProfile.district,
      ward: farmProfile.ward,
      village: farmProfile.village,
      total_area_ha: farmProfile.totalAreaHa,
      tenure_type: farmProfile.tenureType,
      farming_system: farmProfile.farmingSystem,
      water_source: farmProfile.waterSource,
      notes: farmProfile.notes,
      captured_at: farmProfile.capturedAt,
      captured_by: farmProfile.capturedBy,
    },

    farm_boundary: farmBoundary ? {
      farm_local_ref: farmBoundary.farmLocalRef,
      method: farmBoundary.method,
      status: farmBoundary.status,
      boundary_geojson: farmBoundary.polygon
        ? polygonToGeoJSON(farmBoundary.polygon) : null,
      point_count: farmBoundary.polygon?.points.length ?? null,
      area_ha: farmBoundary.polygon?.area ?? null,
      gps_accuracy_min: accSummary?.min ?? null,
      gps_accuracy_max: accSummary?.max ?? null,
      gps_accuracy_avg: accSummary?.avg ?? null,
      confidence_score: farmBoundary.confidenceScore,
      skip_reason: farmBoundary.skipReason,
      notes: farmBoundary.notes,
      captured_at: farmBoundary.capturedAt,
      captured_by: farmBoundary.capturedBy,
    } : null,

    plots: plots.map(plot => {
      if (!plot.farmLocalRef)
        throw new Error(`Plot ${plot.localId}: missing farmLocalRef — data integrity error`);
      if (!plot.observation.plotLocalId)
        throw new Error(`Plot ${plot.localId}: observation missing plotLocalId`);

      return {
        local_id: plot.localId,
        farm_local_ref: plot.farmLocalRef,
        plot_name: plot.plotName,
        area_ha: plot.areaHa,
        status: plot.status,
        current_crop: plot.currentCrop,
        variety: plot.variety,
        growth_stage: plot.growthStage,
        irrigation_status: plot.irrigationStatus,
        planting_month: plot.plantingMonth,
        center_point_geojson: plot.centerPoint
          ? pointToGeoJSON(plot.centerPoint) : null,
        center_accuracy_m: plot.centerPoint?.accuracy ?? null,
        photo_url: plot.photoUrl,
        notes: plot.notes,
        captured_by: auditorId,
        observation: {
          plot_local_id: plot.observation.plotLocalId,
          farm_local_ref: plot.observation.farmLocalRef,
          audit_id: auditId,
          crop_condition: plot.observation.cropCondition,
          pest_present: plot.observation.pestPresent,
          disease_present: plot.observation.diseasePresent,
          pest_type: plot.observation.pestType,
          pest_severity: plot.observation.pestSeverity,
          disease_type: plot.observation.diseaseType,
          disease_severity: plot.observation.diseaseSeverity,
          visible_stress_level: plot.observation.visibleStressLevel,
          soil_moisture_impression: plot.observation.soilMoistureImpression,
          weed_pressure: plot.observation.weedPressure,
          plant_vigor: plot.observation.plantVigor,
          yield_outlook: plot.observation.yieldOutlook,
          photo_url: plot.observation.photoUrl,
          voice_note_url: plot.observation.voiceNoteUrl,
          ai_analysis_summary: plot.observation.aiAnalysisSummary,
          notes: plot.observation.notes,
          captured_by: auditorId,
        },
      };
    }),
  };
}
