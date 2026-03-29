import React from 'react';
import { BusinessAuditData, User, AuditRecord, AuditImage } from '../types';
import { PagedFormContainer } from './PagedFormContainer';
import { businessAuditTemplate } from '../data/businessAuditQuestions';
import { Language } from '../services/i18n';

interface BusinessAuditFormProps {
  user: User;
  onSave: (audit: AuditRecord) => void;
  onCancel: () => void;
  initialLocation: any;
  lang?: Language;
  isHighContrast?: boolean;
  isTraining?: boolean;
}

/**
 * Coerce a raw photo value (from QuestionRenderer) into an AuditImage.
 * Handles new format (AuditImage with id + dataUrl) and legacy ({data, filename, size}).
 */
const toAuditImage = (raw: any, label: string): AuditImage | null => {
  if (!raw) return null;
  if (raw.id && (raw.dataUrl || raw.storageUrl)) {
    return { ...raw, label: raw.label || label };
  }
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

const BusinessAuditForm: React.FC<BusinessAuditFormProps> = ({
  user,
  onSave,
  onCancel,
  initialLocation,
  lang = 'en',
}) => {

  const mapToAuditRecord = (flatData: any, isDraft: boolean): AuditRecord => {

    const businessData: BusinessAuditData = {
      businessId: flatData.business_id || crypto.randomUUID(),
      auditorId: user.name,
      auditDate: flatData.audit_date || new Date().toISOString(),

      // ── Section A: Location ──────────────────────────────────────────
      region: flatData.region || '',
      district: flatData.district || '',
      ward: flatData.ward || '',
      locationDesc: flatData.location_desc || '',

      // ── Section B: Profile & BRELA ───────────────────────────────────
      brelaId: flatData.brela_id || undefined,
      brelaName: flatData.brela_name || '',
      matchStatus: flatData.brela_match_status || 'Pending',

      actualName: flatData.business_name || '',
      businessType: flatData.business_type || '',
      ownerName: flatData.owner_name || '',
      primaryPhone: flatData.primary_phone || '',
      email: flatData.email || '',
      secondaryPhone: flatData.secondary_phone || '',

      yearsOperating: flatData.years_operating ? String(flatData.years_operating) : '',
      employeeCount: flatData.employee_count ? String(flatData.employee_count) : '',
      operatingMonths: flatData.operating_months || [],
      operationalStatus: flatData.operational_status || 'Active',

      // ── Section C: Agrovet Products ──────────────────────────────────
      agrovet: {
        products: flatData.agrovet_products || [],
        top3: flatData.agrovet_top3 || '',
        pricing: flatData.agrovet_pricing || [],
        creditTerms: flatData.agrovet_credit_terms || '',
        seasons: flatData.agrovet_seasons || [],
      },

      // ── Section D: Processor ─────────────────────────────────────────
      processor: {
        type: flatData.processor_type || '',
        capacity: flatData.processor_capacity ? String(flatData.processor_capacity) : '',
        capacityUnit: flatData.processor_capacity_unit || 'kg/day',
        rawMaterials: flatData.processor_raw_materials || '',
        sourcingRegions: flatData.processor_sourcing_regions || '',
        products: flatData.processor_products || '',
        distribution: flatData.processor_distribution || [],
      },

      // ── Section E: Trader ────────────────────────────────────────────
      trader: {
        commodities: flatData.trader_commodities || '',
        sourcingMethod: flatData.trader_sourcing_method || [],
      },

      // ── Section F: Retailer ──────────────────────────────────────────
      retailer: {
        storeType: flatData.retailer_store_type || '',
        categories: flatData.retailer_categories || [],
        paymentMethods: flatData.retailer_payment_methods || [],
        footTraffic: flatData.retailer_foot_traffic || '',
      },

      // ── Section G: Sourcing ──────────────────────────────────────────
      sourcing: {
        suppliers: flatData.sourcing_suppliers || '',
        supplierLocations: flatData.sourcing_supplier_locations || '',
        transport: flatData.sourcing_transport || '',
        paymentTerms: flatData.sourcing_payment_terms || '',
      },

      // ── Section H: Customers ─────────────────────────────────────────
      customers: {
        types: flatData.customer_types || [],
        reach: flatData.customer_reach || '',
        channels: flatData.customer_channels || [],
        paymentMethods: flatData.customer_payment_methods || [],
        creditOffered: flatData.customer_credit_offered || 'No',
      },

      // ── Section I: Infrastructure ────────────────────────────────────
      infrastructure: {
        buildingType: flatData.building_type || '',
        utilities: flatData.utilities || [],
        assets: flatData.assets || [],
      },

      // ── Section J: Financial ─────────────────────────────────────────
      financial: {
        revenueRange: flatData.revenue_range || '',
        challenges: flatData.financial_challenges || [],
        expansionPlans: flatData.expansion_plans || '',
        financingSources: flatData.financing_sources || [],
      },

      // ── Section K: Competition ───────────────────────────────────────
      competition: {
        competitorCount: flatData.competitor_count ? String(flatData.competitor_count) : '',
        landmark: flatData.competition_landmark || '',
        accessibility: flatData.competition_accessibility || '',
      },

      // ── Section L: Media ─────────────────────────────────────────────
      media: {
        photoExterior: toAuditImage(flatData.photo_exterior, 'Business Exterior') || undefined,
        photoInterior: toAuditImage(flatData.photo_interior, 'Business Interior') || undefined,
        photoBrela: toAuditImage(flatData.photo_license, 'BRELA / License') || undefined,
        extraPhotos: [
          toAuditImage(flatData.photo_additional_1, 'Additional Photo 1'),
          toAuditImage(flatData.photo_additional_2, 'Additional Photo 2'),
        ].filter((p): p is AuditImage => p !== null),
      },

      // ── Certification ────────────────────────────────────────────────
      certification: {
        auditorName: user.name,
        submissionTime: new Date().toISOString(),
        consents: {
          data: flatData.consent_data === true,
          gps: true,
          photos: true,
          phone: true,
        },
      },

      tasks: flatData.tasks || [],
    };

    // ── Collect all images ──────────────────────────────────────────────
    const images: AuditImage[] = [];
    const addImg = (img: AuditImage | undefined) => {
      if (img) images.push({ ...img, auditId: businessData.businessId });
    };
    addImg(businessData.media.photoExterior);
    addImg(businessData.media.photoInterior);
    addImg(businessData.media.photoBrela);
    businessData.media.extraPhotos?.forEach(addImg);

    const businessTitle =
      businessData.actualName || `Business Audit ${new Date().toLocaleDateString()}`;

    return {
      id: businessData.businessId,
      businessName: businessTitle,
      location: initialLocation || (flatData.gps_location as any),
      status: isDraft ? 'draft' : 'pending',
      createdAt: new Date().toISOString(),
      images,
      notes: flatData.comments || '',
      type: 'business',
      businessData,
    };
  };

  const handleSubmit = (data: any, isDraft = false) => {
    const record = mapToAuditRecord(data, isDraft);
    onSave(record);
  };

  return (
    <PagedFormContainer
      template={businessAuditTemplate}
      initialValues={{
        gps_location: initialLocation,
        audit_date: new Date().toISOString().split('T')[0],
        auditor_id: user.name,
      }}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      onSaveDraft={(d) => handleSubmit(d.data, true)}
      lang={lang}
    />
  );
};

export default BusinessAuditForm;
