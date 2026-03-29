
import { Question } from '../components/QuestionRenderer';

// Helper for generating year options
const years = Array.from({ length: 65 }, (_, i) => String(2025 - i));

export const farmAuditQuestions: Question[] = [
  // ===== SECTION A: IDENTIFICATION & LOCATION =====
  {
    id: 'section_a_info',
    type: 'info',
    label: 'Section A: Identification & Location',
    required: false
  },
  {
    id: 'gps_location',
    type: 'gps',
    label: 'Farm Location (GPS)',
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
      { value: 'Iringa', label: 'Iringa' },
      { value: 'Mbeya', label: 'Mbeya' },
      { value: 'Dodoma', label: 'Dodoma' },
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
    id: 'village',
    type: 'text',
    label: 'Village',
    required: true,
  },
  {
    id: 'subvillage',
    type: 'text',
    label: 'Sub-village / Hamlett',
    required: false,
  },
  {
    id: 'landmark',
    type: 'text',
    label: 'Nearest Landmark',
    placeholder: 'e.g. Near Primary School',
    required: false,
  },
  {
    id: 'boundary_corners',
    type: 'boundary',
    label: 'Farm Boundary (GPS Corners)',
    helpText: 'Walk to each corner and tap "Add Corner" to record. Need 4-8 corners.',
    required: true,
  },

  // ===== SECTION B: FARMER PROFILE =====
  {
    id: 'section_b_info',
    type: 'info',
    label: 'Section B: Farmer Profile',
    required: false
  },
  {
    id: 'farmer_first_name',
    type: 'text',
    label: 'First Name',
    required: true,
  },
  {
    id: 'farmer_last_name',
    type: 'text',
    label: 'Last Name',
    required: true,
  },
  {
    id: 'phone_number',
    type: 'text',
    label: 'Phone Number',
    placeholder: '07XXXXXXXX',
    required: true,
    validation: {
      pattern: /^(?:\+255|0)[67]\d{8}$/,
      message: 'Invalid phone number format'
    }
  },
  {
    id: 'gender',
    type: 'select',
    label: 'Gender',
    required: true,
    options: [
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' },
    ],
  },
  {
    id: 'age_range',
    type: 'select',
    label: 'Age Range',
    required: true,
    options: [
      { value: '18-25', label: '18-25' },
      { value: '26-35', label: '26-35' },
      { value: '36-45', label: '36-45' },
      { value: '46-55', label: '46-55' },
      { value: '56-65', label: '56-65' },
      { value: '65+', label: '65+' },
    ],
  },
  {
    id: 'household_size',
    type: 'number',
    label: 'Household Size',
    required: true,
    validation: { min: 1, max: 50 }
  },
  {
    id: 'education_level',
    type: 'select',
    label: 'Education Level',
    required: false,
    options: [
      { value: 'None', label: 'None' },
      { value: 'Primary', label: 'Primary School' },
      { value: 'Secondary', label: 'Secondary School' },
      { value: 'College', label: 'College/University' },
      { value: 'Vocational', label: 'Vocational Training' },
    ],
  },
  {
    id: 'farming_experience',
    type: 'number',
    label: 'Years of Farming Experience',
    required: false,
  },

  // ===== SECTION C: LAND & TENURE =====
  {
    id: 'section_c_info',
    type: 'info',
    label: 'Section C: Land & Tenure',
    required: false
  },
  {
    id: 'farm_size',
    type: 'number',
    label: 'Total Farm Size',
    required: true,
  },
  {
    id: 'farm_size_unit',
    type: 'select',
    label: 'Unit of Measure',
    required: true,
    options: [
      { value: 'Acres', label: 'Acres' },
      { value: 'Hectares', label: 'Hectares' },
    ],
  },
  {
    id: 'cultivated_area',
    type: 'number',
    label: 'Cultivated Area',
    required: true,
    helpText: 'How much of the land is currently being farmed?'
  },
  {
    id: 'land_tenure',
    type: 'select',
    label: 'Land Ownership Status',
    required: true,
    options: [
      { value: 'Own with title', label: 'Owned (with title deed/CCRO)' },
      { value: 'Own no title', label: 'Owned (customary/no title)' },
      { value: 'Rent/Lease', label: 'Rented / Leased' },
      { value: 'Communal', label: 'Communal / Village Land' },
      { value: 'Family land', label: 'Family land (not subdivided)' },
    ],
  },
  {
    id: 'soil_type',
    type: 'select',
    label: 'Soil Type (Visual Observation)',
    required: true,
    options: [
      { value: 'Clay', label: 'Clay (Sticky, heavy)' },
      { value: 'Loam', label: 'Loam (Dark, crumbly)' },
      { value: 'Sandy', label: 'Sandy (Gritty, loose)' },
      { value: 'Silt', label: 'Silt (Smooth, floury)' },
    ],
  },
  {
    id: 'topography',
    type: 'select',
    label: 'Topography',
    required: false,
    options: [
      { value: 'Flat', label: 'Flat' },
      { value: 'Gentle Slope', label: 'Gentle Slope' },
      { value: 'Steep Slope', label: 'Steep Slope' },
      { value: 'Valley', label: 'Valley / Lowland' },
    ],
  },
  {
    id: 'distance_to_road',
    type: 'number',
    label: 'Distance to nearest main road (km)',
    required: false,
  },

  // ===== SECTION D: CROPS =====
  {
    id: 'section_d_info',
    type: 'info',
    label: 'Section D: Crops',
    required: false
  },
  {
    id: 'main_crops',
    type: 'multiselect',
    label: 'Which crops are grown this season?',
    required: true,
    options: [
      { value: 'Maize', label: 'Maize' },
      { value: 'Rice', label: 'Rice/Paddy' },
      { value: 'Beans', label: 'Beans' },
      { value: 'Sunflower', label: 'Sunflower' },
      { value: 'Coffee', label: 'Coffee' },
      { value: 'Cotton', label: 'Cotton' },
      { value: 'Horticulture', label: 'Vegetables/Fruits' },
      { value: 'Other', label: 'Other' },
    ],
  },
  // Conditional Yield Questions (Simplified Repeater)
  {
    id: 'Maize_area',
    type: 'number',
    label: 'Maize: Area Planted (Acres)',
    required: true,
    condition: { field: 'main_crops', operator: 'contains', value: 'Maize' }
  },
  {
    id: 'Maize_yield',
    type: 'number',
    label: 'Maize: Last Harvest Yield (Total Kg)',
    required: true,
    condition: { field: 'main_crops', operator: 'contains', value: 'Maize' }
  },
  {
    id: 'Rice_area',
    type: 'number',
    label: 'Rice: Area Planted (Acres)',
    required: true,
    condition: { field: 'main_crops', operator: 'contains', value: 'Rice' }
  },
  {
    id: 'Rice_yield',
    type: 'number',
    label: 'Rice: Last Harvest Yield (Total Kg)',
    required: true,
    condition: { field: 'main_crops', operator: 'contains', value: 'Rice' }
  },
  {
    id: 'Beans_area',
    type: 'number',
    label: 'Beans: Area Planted (Acres)',
    required: true,
    condition: { field: 'main_crops', operator: 'contains', value: 'Beans' }
  },
  {
    id: 'Beans_yield',
    type: 'number',
    label: 'Beans: Last Harvest Yield (Total Kg)',
    required: true,
    condition: { field: 'main_crops', operator: 'contains', value: 'Beans' }
  },
  {
    id: 'Sunflower_area',
    type: 'number',
    label: 'Sunflower: Area Planted (Acres)',
    required: true,
    condition: { field: 'main_crops', operator: 'contains', value: 'Sunflower' }
  },
  {
    id: 'Sunflower_yield',
    type: 'number',
    label: 'Sunflower: Last Harvest Yield (Total Kg)',
    required: true,
    condition: { field: 'main_crops', operator: 'contains', value: 'Sunflower' }
  },

  // ===== SECTION E: LIVESTOCK =====
  {
    id: 'section_e_info',
    type: 'info',
    label: 'Section E: Livestock',
    required: false
  },
  {
    id: 'livestock_kept',
    type: 'boolean',
    label: 'Do you keep any livestock?',
    required: true,
  },
  {
    id: 'livestock_types',
    type: 'multiselect',
    label: 'Select livestock kept',
    required: true,
    condition: { field: 'livestock_kept', operator: 'equals', value: true },
    options: [
      { value: 'Cattle', label: 'Cattle (Cows)' },
      { value: 'Goats', label: 'Goats' },
      { value: 'Sheep', label: 'Sheep' },
      { value: 'Poultry', label: 'Chicken/Poultry' },
      { value: 'Pigs', label: 'Pigs' },
    ]
  },
  {
    id: 'Cattle_count',
    type: 'number',
    label: 'Total Cattle Count',
    required: true,
    condition: { field: 'livestock_types', operator: 'contains', value: 'Cattle' },
    validation: { min: 0 }
  },
  {
    id: 'Goats_count',
    type: 'number',
    label: 'Total Goats Count',
    required: true,
    condition: { field: 'livestock_types', operator: 'contains', value: 'Goats' },
    validation: { min: 0 }
  },
  {
    id: 'Sheep_count',
    type: 'number',
    label: 'Total Sheep Count',
    required: true,
    condition: { field: 'livestock_types', operator: 'contains', value: 'Sheep' },
    validation: { min: 0 }
  },
  {
    id: 'Poultry_count',
    type: 'number',
    label: 'Total Poultry Count',
    required: true,
    condition: { field: 'livestock_types', operator: 'contains', value: 'Poultry' },
    validation: { min: 0 }
  },
  {
    id: 'Pigs_count',
    type: 'number',
    label: 'Total Pigs Count',
    required: true,
    condition: { field: 'livestock_types', operator: 'contains', value: 'Pigs' },
    validation: { min: 0 }
  },

  // ===== SECTION G: INPUTS & SOIL HEALTH =====
  {
    id: 'section_g_info',
    type: 'info',
    label: 'Section G: Inputs & Soil Health',
    required: false
  },
  {
    id: 'fertilizer_use',
    type: 'boolean',
    label: 'Have you ever used chemical fertilizer?',
    required: true,
  },
  {
    id: 'fertilizer_use_season',
    type: 'boolean',
    label: 'Did you use fertilizer this season?',
    required: true,
    condition: { field: 'fertilizer_use', operator: 'equals', value: true }
  },
  {
    id: 'fertilizer_types',
    type: 'multiselect',
    label: 'Which types of fertilizer?',
    required: false,
    condition: { field: 'fertilizer_use', operator: 'equals', value: true },
    options: [
      { value: 'DAP', label: 'DAP' },
      { value: 'UREA', label: 'UREA' },
      { value: 'CAN', label: 'CAN' },
      { value: 'NPK', label: 'NPK' },
      { value: 'Minjingu', label: 'Minjingu' },
      { value: 'Booster', label: 'Booster / Foliar' },
    ]
  },
  {
    id: 'pesticide_use',
    type: 'boolean',
    label: 'Do you use pesticides/herbicides?',
    required: true,
  },
  {
    id: 'pesticide_types',
    type: 'multiselect',
    label: 'Which types of pesticides?',
    required: false,
    condition: { field: 'pesticide_use', operator: 'equals', value: true },
    options: [
      { value: 'Insecticides', label: 'Insecticides' },
      { value: 'Herbicides', label: 'Herbicides (Weed killers)' },
      { value: 'Fungicides', label: 'Fungicides' },
      { value: 'Rodenticides', label: 'Rodenticides' }
    ]
  },
  {
    id: 'soil_test_history',
    type: 'select',
    label: 'Have you ever tested your soil?',
    required: true,
    options: [
      { value: 'Never', label: 'Never' },
      { value: 'Last 1 year', label: 'Yes, in the last year' },
      { value: 'Last 5 years', label: 'Yes, 1-5 years ago' },
      { value: '>5 years ago', label: 'Yes, more than 5 years ago' },
    ]
  },

  // ===== SECTION H: SOIL SAMPLES =====
  {
    id: 'section_h_info',
    type: 'info',
    label: 'Section H: Soil Samples',
    required: false
  },
  {
    id: 'soil_samples_collected',
    type: 'boolean',
    label: 'Were soil samples collected during this audit?',
    required: true,
  },
  {
    id: 'soil_sample_count',
    type: 'number',
    label: 'Number of samples collected',
    required: true,
    condition: { field: 'soil_samples_collected', operator: 'equals', value: true },
    validation: { min: 1, max: 20 }
  },

  // ===== SECTION I: INPUTS & LABOR =====
  {
    id: 'section_i_info',
    type: 'info',
    label: 'Section I: Inputs & Labor',
    required: false
  },
  {
    id: 'seed_source',
    type: 'multiselect',
    label: 'Where do you get your seeds?',
    required: true,
    options: [
      { value: 'Saved', label: 'Saved from previous harvest' },
      { value: 'Agrovet', label: 'Agrovet / Shop' },
      { value: 'Government', label: 'Government / Cooperative' },
      { value: 'NGO', label: 'NGO Project' },
      { value: 'Neighbor', label: 'Neighbor / Local market' },
    ]
  },
  {
    id: 'labor_type',
    type: 'multiselect',
    label: 'Who works on the farm?',
    required: true,
    options: [
      { value: 'Family', label: 'Family members only' },
      { value: 'Hired_Seasonal', label: 'Hired casual laborers (seasonal)' },
      { value: 'Hired_Permanent', label: 'Hired permanent workers' },
      { value: 'Group_Labor', label: 'Community labor group (Mshikamano)' },
    ]
  },
  {
    id: 'mechanization',
    type: 'multiselect',
    label: 'What tools/machinery do you use?',
    required: true,
    options: [
      { value: 'Hand hoe', label: 'Hand hoe' },
      { value: 'Oxen', label: 'Oxen / Animal draught' },
      { value: 'Power Tiller', label: 'Power Tiller' },
      { value: 'Tractor', label: 'Tractor' },
    ]
  },

  // ===== SECTION J: POST-HARVEST =====
  {
    id: 'section_j_info',
    type: 'info',
    label: 'Section J: Post-Harvest',
    required: false
  },
  {
    id: 'has_storage',
    type: 'boolean',
    label: 'Do you store your crops after harvest?',
    required: true,
  },
  {
    id: 'storage_type',
    type: 'multiselect',
    label: 'How do you store them?',
    required: true,
    condition: { field: 'has_storage', operator: 'equals', value: true },
    options: [
      { value: 'Sacks in house', label: 'Sacks inside house' },
      { value: 'Granary', label: 'Traditional Granary (Vihenge)' },
      { value: 'PICS Bags', label: 'Hermetic Bags (PICS)' },
      { value: 'Warehouse', label: 'Community Warehouse' },
    ]
  },
  {
    id: 'post_harvest_losses',
    type: 'select',
    label: 'Estimated Post-Harvest Losses',
    required: false,
    options: [
      { value: 'None', label: 'None / Very Little' },
      { value: 'Low', label: 'Low (<10%)' },
      { value: 'Medium', label: 'Medium (10-30%)' },
      { value: 'High', label: 'High (>30%)' },
    ]
  },
  {
    id: 'loss_causes',
    type: 'multiselect',
    label: 'Main causes of loss?',
    required: false,
    options: [
      { value: 'Insects', label: 'Insects/Weevils' },
      { value: 'Rodents', label: 'Rats/Rodents' },
      { value: 'Rot', label: 'Rot/Moisture' },
      { value: 'Theft', label: 'Theft' },
    ]
  },

  // ===== SECTION K: MARKETING =====
  {
    id: 'section_k_info',
    type: 'info',
    label: 'Section K: Marketing',
    required: false
  },
  {
    id: 'market_name',
    type: 'text',
    label: 'Main Market Name',
    placeholder: 'e.g. Kibaigwa Market',
    required: false,
  },
  {
    id: 'distance_to_market',
    type: 'number',
    label: 'Distance to Market (km)',
    required: false,
  },
  {
    id: 'selling_timing',
    type: 'multiselect',
    label: 'When do you usually sell?',
    required: true,
    options: [
      { value: 'At harvest', label: 'Immediately at harvest' },
      { value: 'Few months later', label: '2-3 months after harvest' },
      { value: 'Lean season', label: 'When prices are high (Lean season)' },
    ]
  },
  {
    id: 'price_setter',
    type: 'select',
    label: 'Who determines the price?',
    required: true,
    options: [
      { value: 'Buyer', label: 'Buyer / Middleman' },
      { value: 'Farmer', label: 'I set the price' },
      { value: 'Negotiation', label: 'Negotiation' },
      { value: 'Government', label: 'Government indicative price' },
    ]
  },
  {
    id: 'contract_farming',
    type: 'boolean',
    label: 'Do you have a contract with any buyer?',
    required: true,
  },
  {
    id: 'contract_buyer_name',
    type: 'text',
    label: 'Name of Buyer/Company',
    required: true,
    condition: { field: 'contract_farming', operator: 'equals', value: true }
  },

  // ===== SECTION L: FINANCE =====
  {
    id: 'section_l_info',
    type: 'info',
    label: 'Section L: Finance',
    required: false
  },
  {
    id: 'has_bank_account',
    type: 'boolean',
    label: 'Do you have a formal bank account?',
    required: true,
  },
  {
    id: 'mobile_money_use',
    type: 'boolean',
    label: 'Do you use mobile money (M-Pesa, Tigo Pesa)?',
    required: true,
  },
  {
    id: 'savings_group',
    type: 'boolean',
    label: 'Are you a member of a savings group (VICOBA/VSLA)?',
    required: true,
  },
  {
    id: 'credit_access',
    type: 'boolean',
    label: 'Have you taken a loan for farming in the last 2 years?',
    required: true,
  },
  {
    id: 'credit_source',
    type: 'multiselect',
    label: 'Source of loan?',
    required: true,
    condition: { field: 'credit_access', operator: 'equals', value: true },
    options: [
      { value: 'Bank', label: 'Commercial Bank' },
      { value: 'MFI', label: 'Microfinance Inst.' },
      { value: 'VSLA', label: 'Village Savings Group (VICOBA)' },
      { value: 'Family', label: 'Family/Friends' },
      { value: 'InputSupplier', label: 'Input Supplier' }
    ]
  },
  {
    id: 'insurance',
    type: 'boolean',
    label: 'Do you have crop insurance?',
    required: true,
  },

  // ===== SECTION M: EXTENSION SERVICES =====
  {
    id: 'section_m_info',
    type: 'info',
    label: 'Section M: Extension Services',
    required: false
  },
  {
    id: 'extension_access_last_year',
    type: 'boolean',
    label: 'Have you received extension services in the last 12 months?',
    helpText: 'Extension officer visit, training, demonstration, etc.',
    required: true,
  },
  {
    id: 'extension_source',
    type: 'multiselect',
    label: 'Who provided the extension services?',
    required: false,
    options: [
      { value: 'GOVERNMENT_DISTRICT', label: 'Government district agricultural officer' },
      { value: 'GOVERNMENT_WARD', label: 'Government ward agricultural officer' },
      { value: 'NGO', label: 'NGO/Development project' },
      { value: 'PRIVATE_COMPANY', label: 'Private company (input supplier, buyer)' },
      { value: 'COOPERATIVE', label: 'Through cooperative' },
      { value: 'FARMER_TO_FARMER', label: 'Farmer-to-farmer (lead farmer)' },
    ],
    condition: {
      field: 'extension_access_last_year',
      operator: 'equals',
      value: true,
    },
  },
  {
    id: 'information_sources',
    type: 'multiselect',
    label: 'Where do you get information about farming practices?',
    required: false,
    options: [
      { value: 'EXTENSION_OFFICER', label: 'Extension officer' },
      { value: 'RADIO', label: 'Radio programs' },
      { value: 'MOBILE_PHONE_SMS', label: 'Mobile phone (SMS/apps)' },
      { value: 'OTHER_FARMERS', label: 'Other farmers' },
      { value: 'AGROVET_DEALER', label: 'Agrovet dealer' },
    ],
  },
  {
    id: 'smartphone_ownership',
    type: 'boolean',
    label: 'Do you own a smartphone?',
    required: true,
  },
  {
    id: 'digital_agriculture_interest',
    type: 'select',
    label: 'Would you be interested in using a mobile app for farming advice?',
    required: true,
    options: [
      { value: 'VERY_INTERESTED', label: 'Very interested' },
      { value: 'INTERESTED', label: 'Interested' },
      { value: 'MAYBE', label: 'Maybe' },
      { value: 'NOT_INTERESTED', label: 'Not interested' },
    ],
  },
  {
    id: 'weather_information_access',
    type: 'boolean',
    label: 'Do you receive weather forecast information?',
    required: true,
  },

  // ===== SECTION N: CHALLENGES & GOALS =====
  {
    id: 'section_n_info',
    type: 'info',
    label: 'Section N: Challenges & Goals',
    required: false
  },
  {
    id: 'main_farming_challenges',
    type: 'multiselect',
    label: 'What are your TOP 3 farming challenges?',
    helpText: 'Select up to 3 most serious problems',
    required: true,
    options: [
      { value: 'CLIMATE_DROUGHT', label: 'Climate change/drought' },
      { value: 'PESTS_DISEASES', label: 'Pests and diseases' },
      { value: 'POOR_SOIL_FERTILITY', label: 'Poor soil fertility' },
      { value: 'LACK_INPUTS', label: 'Cannot afford inputs' },
      { value: 'LACK_CREDIT', label: 'Lack of credit' },
      { value: 'LOW_PRICES', label: 'Low market prices' },
      { value: 'NO_MARKET', label: 'No reliable market' },
      { value: 'POST_HARVEST_LOSSES', label: 'Post-harvest losses' },
    ],
  },
  {
    id: 'farming_5_years_plan',
    type: 'select',
    label: 'What are your plans for farming in the next 5 years?',
    required: true,
    options: [
      { value: 'EXPAND', label: 'Expand farm' },
      { value: 'INTENSIFY', label: 'Intensify (same land, higher productivity)' },
      { value: 'DIVERSIFY', label: 'Diversify (new crops/livestock)' },
      { value: 'MAINTAIN_CURRENT', label: 'Maintain current level' },
      { value: 'EXIT_FARMING', label: 'Exit farming' },
    ],
  },
  {
    id: 'youth_involvement',
    type: 'select',
    label: 'Are young people (children) interested in continuing farming?',
    required: true,
    options: [
      { value: 'YES_INTERESTED', label: 'Yes' },
      { value: 'SOME_INTERESTED', label: 'Some' },
      { value: 'NOT_INTERESTED', label: 'No' },
      { value: 'NO_CHILDREN', label: 'No children of age' },
    ],
  },
  {
    id: 'climate_change_awareness',
    type: 'boolean',
    label: 'Have you noticed changes in weather patterns?',
    required: true,
  },
  {
    id: 'climate_adaptation_practices',
    type: 'multiselect',
    label: 'Adaptation strategies?',
    required: false,
    options: [
      { value: 'DROUGHT_TOLERANT_VARIETIES', label: 'Drought-tolerant varieties' },
      { value: 'IRRIGATION', label: 'Irrigation' },
      { value: 'CHANGE_PLANTING_DATES', label: 'Changing planting dates' },
      { value: 'CROP_DIVERSIFICATION', label: 'Diversifying crops' },
      { value: 'NOTHING_YET', label: 'Nothing yet' },
    ],
    condition: {
      field: 'climate_change_awareness',
      operator: 'equals',
      value: true,
    },
  },
  {
    id: 'support_needed_most',
    type: 'select',
    label: 'Most needed support?',
    required: true,
    options: [
      { value: 'CREDIT_ACCESS', label: 'Credit' },
      { value: 'INPUT_SUBSIDIES', label: 'Subsidized inputs' },
      { value: 'IRRIGATION', label: 'Irrigation' },
      { value: 'EQUIPMENT', label: 'Mechanization' },
      { value: 'MARKET_ACCESS', label: 'Market Access' },
    ],
  },

  // ===== SECTION O: MEDIA & CONSENT =====
  {
    id: 'section_o_info',
    type: 'info',
    label: 'Section O: Media & Consent',
    required: false
  },
  {
    id: 'photo_farmer_portrait',
    type: 'photo',
    label: 'Farmer Portrait',
    required: true,
  },
  {
    id: 'photo_farm_wide_shot',
    type: 'photo',
    label: 'Farm Wide Shot',
    required: true,
  },
  {
    id: 'photo_main_crop_closeup',
    type: 'photo',
    label: 'Main Crop Close-up',
    helpText: 'AI will assess crop health and stage.',
    required: true,
  },
  {
    id: 'photo_soil_closeup',
    type: 'photo',
    label: 'Soil Close-up',
    helpText: 'AI will analyze soil type and color.',
    required: true,
  },
  {
    id: 'photo_additional_1',
    type: 'photo',
    label: 'Additional Photo',
    required: false,
  },
  {
    id: 'consent_confirmed',
    type: 'boolean',
    label: 'Consent Confirmed',
    helpText: 'I certify that the farmer has given consent for this audit.',
    required: true,
  },

  // ===== SECTION P: FINAL NOTES =====
  {
    id: 'section_p_info',
    type: 'info',
    label: 'Section P: Final Notes',
    required: false
  },
  {
    id: 'auditor_observations',
    type: 'textarea',
    label: 'Observations',
    helpText: 'Use the AI Copilot to dictate detailed observations.',
    required: false,
  },
  {
    id: 'data_quality_self_assessment',
    type: 'select',
    label: 'Data Quality Assessment',
    required: true,
    options: [
      { value: 'EXCELLENT', label: 'Excellent' },
      { value: 'GOOD', label: 'Good' },
      { value: 'FAIR', label: 'Fair' },
      { value: 'POOR', label: 'Poor' },
    ],
  },
  {
    id: 'audit_duration_minutes',
    type: 'number',
    label: 'Duration (Minutes)',
    required: true,
    validation: { min: 5, max: 240 },
  },
];

export const farmAuditTemplate = {
  id: 'farm_audit',
  name: 'Farm Audit',
  questions: farmAuditQuestions,
};
