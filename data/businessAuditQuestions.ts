
import { Question } from '../components/QuestionRenderer';

export const businessAuditQuestions: Question[] = [
  // SECTION A: IDENTIFICATION
  {
    id: 'section_a_info',
    type: 'info',
    label: 'Section A: Identification',
    required: false
  },
  {
    id: 'business_id',
    type: 'text',
    label: 'Business Unique ID',
    required: true,
    placeholder: 'BUS-REG-001',
  },
  {
    id: 'auditor_id',
    type: 'text',
    label: 'Auditor ID',
    required: true,
  },
  {
    id: 'audit_date',
    type: 'date',
    label: 'Date of Visit',
    required: true,
  },
  {
    id: 'gps_location',
    type: 'gps',
    label: 'Business Geotag (GPS)',
    required: true,
  },
  {
    id: 'region',
    type: 'select',
    label: 'Region',
    required: true,
    options: [
      { value: 'Morogoro', label: 'Morogoro' },
      { value: 'Ruvuma', label: 'Ruvuma' },
      { value: 'Pwani', label: 'Pwani' },
      { value: 'Dar es Salaam', label: 'Dar es Salaam' },
    ],
  },
  {
    id: 'district',
    type: 'text',
    label: 'District',
    required: true,
  },
  {
    id: 'ward',
    type: 'text',
    label: 'Ward',
    required: true,
  },
  {
    id: 'location_desc',
    type: 'textarea',
    label: 'Location Description / Landmarks',
    required: true,
    placeholder: 'e.g. Opposite the main bus stand',
    helpText: 'Use AI voice dictation to describe nearby landmarks.'
  },

  // SECTION B: PROFILE & BRELA
  {
    id: 'section_b_info',
    type: 'info',
    label: 'Section B: Profile & Registration',
    required: false
  },
  {
    id: 'business_name',
    type: 'text',
    label: 'Business Name',
    helpText: 'As displayed on signage',
    required: true,
  },
  {
    id: 'business_type',
    type: 'select',
    label: 'Business Type',
    required: true,
    options: [
      { value: 'Agrovet', label: 'Agrovet (Inputs)' },
      { value: 'Processor', label: 'Processor/Mill' },
      { value: 'Trader', label: 'Trader/Aggregator' },
      { value: 'Retailer', label: 'Retailer (Food/Duka)' },
      { value: 'Warehouse', label: 'Warehouse/Storage' },
    ],
  },
  {
    id: 'is_registered',
    type: 'boolean',
    label: 'Is the business formally registered?',
    required: true,
  },
  {
    id: 'brela_id',
    type: 'text',
    label: 'BRELA Registration Number',
    required: true,
    condition: { field: 'is_registered', operator: 'equals', value: true }
  },
  {
    id: 'owner_name',
    type: 'text',
    label: 'Owner Name',
    required: true,
  },
  {
    id: 'primary_phone',
    type: 'text',
    label: 'Contact Phone',
    required: true,
    validation: {
      pattern: /^(?:\+255|0)[67]\d{8}$/,
      message: 'Invalid phone number'
    }
  },
  {
    id: 'email',
    type: 'text',
    label: 'Email Address',
    required: false,
  },
  {
    id: 'years_operating',
    type: 'select',
    label: 'Years Operating',
    required: true,
    options: [
      { value: '<1', label: 'Less than 1 year' },
      { value: '1-3', label: '1-3 years' },
      { value: '3-5', label: '3-5 years' },
      { value: '5-10', label: '5-10 years' },
      { value: '10+', label: '10+ years' },
    ],
  },
  {
    id: 'employee_count',
    type: 'number',
    label: 'Number of Employees',
    required: false,
  },

  // SECTION C: BUSINESS SPECIFICS (Conditional)
  {
    id: 'section_c_info',
    type: 'info',
    label: 'Section C: Operations',
    required: false
  },

  // Agrovet Specifics
  {
    id: 'agrovet_products',
    type: 'multiselect',
    label: 'Product Categories Sold',
    required: true,
    condition: { field: 'business_type', operator: 'equals', value: 'Agrovet' },
    options: [
      { value: 'Seeds', label: 'Seeds' },
      { value: 'Fertilizer', label: 'Fertilizer' },
      { value: 'Pesticides', label: 'Pesticides' },
      { value: 'Tools', label: 'Farm Tools' },
      { value: 'Vet_Drugs', label: 'Veterinary Drugs' },
    ]
  },

  // Processor Specifics
  {
    id: 'processor_capacity',
    type: 'number',
    label: 'Processing Capacity (Tonnes/Day)',
    required: true,
    condition: { field: 'business_type', operator: 'equals', value: 'Processor' }
  },
  {
    id: 'raw_materials',
    type: 'text',
    label: 'Main Raw Materials Sourced',
    required: true,
    condition: { field: 'business_type', operator: 'equals', value: 'Processor' }
  },

  // Trader Specifics
  {
    id: 'commodities_traded',
    type: 'multiselect',
    label: 'Main Commodities Traded',
    required: true,
    condition: { field: 'business_type', operator: 'equals', value: 'Trader' },
    options: [
      { value: 'Maize', label: 'Maize' },
      { value: 'Rice', label: 'Rice' },
      { value: 'Beans', label: 'Beans' },
      { value: 'Cashew', label: 'Cashew' },
      { value: 'Coffee', label: 'Coffee' }
    ]
  },

  // SECTION G: INFRASTRUCTURE
  {
    id: 'section_g_info',
    type: 'info',
    label: 'Section G: Infrastructure',
    required: false
  },
  {
    id: 'building_type',
    type: 'select',
    label: 'Building Structure',
    required: true,
    options: [
      { value: 'Permanent', label: 'Permanent (Brick/Concrete)' },
      { value: 'Semi-permanent', label: 'Semi-permanent' },
      { value: 'Temporary', label: 'Temporary' },
      { value: 'Kiosk/Stall', label: 'Kiosk/Stall' },
    ],
  },
  {
    id: 'storage_capacity',
    type: 'text',
    label: 'Storage Capacity (estimate)',
    required: false,
  },

  // SECTION H: FINANCIAL
  {
    id: 'section_h_info',
    type: 'info',
    label: 'Section H: Financial',
    required: false
  },
  {
    id: 'revenue_range',
    type: 'select',
    label: 'Estimated Monthly Revenue (TZS)',
    required: false,
    options: [
      { value: '<500k', label: 'Less than 500,000' },
      { value: '500k-2M', label: '500,000 - 2 Million' },
      { value: '2M-10M', label: '2 Million - 10 Million' },
      { value: '10M+', label: 'Over 10 Million' },
    ]
  },
  {
    id: 'business_challenges',
    type: 'multiselect',
    label: 'Main Business Challenges',
    required: true,
    options: [
      { value: 'Capital', label: 'Access to Capital' },
      { value: 'Supply', label: 'Unreliable Supply' },
      { value: 'Demand', label: 'Low Customer Demand' },
      { value: 'Power', label: 'Power/Electricity' },
      { value: 'Taxes', label: 'Taxes/Regulations' },
      { value: 'Competition', label: 'High Competition' },
    ]
  },

  // SECTION I: COMPETITION
  {
    id: 'competitor_count',
    type: 'select',
    label: 'Number of nearby competitors',
    required: false,
    options: [
      { value: 'None', label: 'None' },
      { value: '1-3', label: '1-3 nearby' },
      { value: '4+', label: '4 or more' }
    ]
  },

  // SECTION J: MEDIA
  {
    id: 'section_j_info',
    type: 'info',
    label: 'Section J: Media & Verification',
    required: false
  },
  {
    id: 'photo_exterior',
    type: 'photo',
    label: 'Exterior / Signage',
    required: true,
    helpText: 'Capture business name. AI will verify match with profile.',
  },
  {
    id: 'photo_interior',
    type: 'photo',
    label: 'Interior / Stock',
    required: true,
    helpText: 'Capture products. AI will analyze stock levels.',
  },
  {
    id: 'photo_license',
    type: 'photo',
    label: 'Business License / BRELA',
    required: false,
  },

  // SECTION K: CONCLUSION
  {
    id: 'section_k_info',
    type: 'info',
    label: 'Section K: Conclusion',
    required: false
  },
  {
    id: 'comments',
    type: 'textarea',
    label: 'Auditor Notes',
    required: false,
  },
  {
    id: 'tasks',
    type: 'task_list',
    label: 'Assign Tasks / Action Items',
    required: false,
    helpText: 'Assign tasks to ensure compliance and resolve issues.',
  },
  {
    id: 'consent_data',
    type: 'boolean',
    label: 'Owner Consent Obtained',
    required: true,
    helpText: 'I certify the owner has agreed to this audit.',
  },
];

export const businessAuditTemplate = {
  id: 'business_audit',
  name: 'Business Audit',
  questions: businessAuditQuestions,
};
