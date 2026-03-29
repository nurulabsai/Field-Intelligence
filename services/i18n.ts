
export type Language = 'en' | 'sw';

export const translations = {
  en: {
    // Global
    app_name: "NuruOS",
    app_subtitle: "Field Intelligence",
    save_draft: "Save Draft",
    submit: "Submit",
    cancel: "Cancel",
    loading: "Loading...",
    saving: "Saving...",
    offline_mode: "OFFLINE MODE",
    offline_desc: "Data will sync when online",
    local_storage: "Local Storage",
    training_mode: "TRAINING MODE",
    training_on: "Training Mode On",
    stats: "My Stats",
    
    // Auth & Dashboard
    inspector_name: "Inspector Name",
    start_session: "Start Session",
    dashboard: "Dashboard",
    new_audit: "New Audit",
    total_audits: "Total audits",
    no_audits: "No Audits Found",
    start_now: "Start Audit Now",
    farm_audit: "Farm Audit",
    business_audit: "Business Audit",
    new_inspection: "New Inspection",
    
    // Form General
    required: "Required",
    capture_gps: "Capture GPS",
    accuracy: "Accuracy",
    gps_coordinates: "GPS Coordinates",
    next_section: "Next Section",
    progress: "Progress",
    time_left: "min left",
    missing_fields: "Missing fields",
    unit: "MEASUREMENT UNIT",
    calculator: "Calculator",
    use_val: "Use",
    load_example: "Load Example Farm",
    skip_validation: "Skip validation (Training)",
    
    // Sections
    sec_A: "Identification & Geo",
    sec_B: "Farmer Profile",
    sec_C: "Land & Tenure",
    sec_D: "Crop Production",
    sec_N: "Photos & Consent",
    
    // Fields
    auditor_id: "Auditor ID",
    audit_date: "Audit Date",
    region: "Region",
    district: "District",
    ward: "Ward",
    village: "Village",
    farmer_first: "First Name",
    farmer_last: "Last Name",
    phone: "Phone Number",
    gender: "Gender",
    age_range: "Age Range",
    farm_size: "Total Farm Size",
    cultivated: "Cultivated Area",
    land_tenure: "Land Tenure",
    crop_type: "Crop Type",
    acres: "Acres",
    hectares: "Hectares",
    yield_last: "Yield (Last Season)",
    planting_month: "Planting Month",
    harvest_month: "Harvest Month",
    price: "Selling Price (TZS/kg)",
    add_crop: "Add Another Crop",
    
    // Photos & Media
    photo_wide: "Wide Farm Shot",
    photo_crop: "Crop Close-up",
    photo_farmer: "Farmer Portrait",
    tap_capture: "Tap to Capture",
    comments: "Additional Comments",
    voice_note: "Type or record voice note...",
    consent: "I certify that the farmer has given consent for this audit and photos.",
    consent_warning: "Please ensure you have consent from the farmer before taking their portrait.",
    
    // AI
    analyzing: "Analyzing with Gemini AI...",
    identify_ai: "Identify with AI",

    // Training / Help
    field_guide: "Field Guide",
    export_training: "Export Training Data",
    
    // Dropdown Maps (Values match DB, Keys match display)
    "Male": "Male",
    "Female": "Female",
    "Own with title": "Own with title",
    "Own no title": "Own no title",
    "Rent/Lease": "Rent/Lease",
    "Communal": "Communal",
    "Family land": "Family land",
    "Maize": "Maize",
    "Rice": "Rice",
    "Beans": "Beans",
    "Sunflower": "Sunflower",
    "Cotton": "Cotton",
    "Coffee": "Coffee",
    "Other": "Other"
  },
  sw: {
    // Global
    app_name: "NuruOS",
    app_subtitle: "Field Intelligence",
    save_draft: "Hifadhi Rasimu",
    submit: "Wasilisha",
    cancel: "Ghairi",
    loading: "Inapakia...",
    saving: "Inahifadhi...",
    offline_mode: "NJE YA MTANDAO",
    offline_desc: "Itasawazishwa mtandaoni",
    local_storage: "Hifadhi ya Simu",
    training_mode: "HALI YA MAFUNZO",
    training_on: "Mafunzo Imewashwa",
    stats: "Takwimu Zangu",

    // Auth & Dashboard
    inspector_name: "Jina la Mkaguzi",
    start_session: "Anza Kipindi",
    dashboard: "Dashibodi",
    new_audit: "Ukaguzi Mpya",
    total_audits: "Jumla ya ukaguzi",
    no_audits: "Hakuna Ukaguzi",
    start_now: "Anza Sasa",
    farm_audit: "Ukaguzi wa Shamba",
    business_audit: "Ukaguzi wa Biashara",
    new_inspection: "Ukaguzi Mpya",

    // Form General
    required: "Lazima",
    capture_gps: "Nasa GPS",
    accuracy: "Usahihi",
    gps_coordinates: "Majira ya GPS",
    next_section: "Sehemu Inayofuata",
    progress: "Maendeleo",
    time_left: "dak zimebaki",
    missing_fields: "Sehemu zinakosekana",
    unit: "KIPIMO",
    calculator: "Kikokotoo",
    use_val: "Tumia",
    load_example: "Weka Mfano wa Shamba",
    skip_validation: "Ruka Uthibitishaji (Mafunzo)",

    // Sections
    sec_A: "Utambulisho & Eneo",
    sec_B: "Wasifu wa Mkulima",
    sec_C: "Ardhi & Umiliki",
    sec_D: "Uzalishaji wa Mazao",
    sec_N: "Picha & Ridhaa",

    // Fields
    auditor_id: "Kitambulisho",
    audit_date: "Tarehe",
    region: "Mkoa",
    district: "Wilaya",
    ward: "Kata",
    village: "Kijiji",
    farmer_first: "Jina la Kwanza",
    farmer_last: "Jina la Ukoo",
    phone: "Namba ya Simu",
    gender: "Jinsia",
    age_range: "Umri",
    farm_size: "Ukubwa wa Shamba",
    cultivated: "Eneo Lililolimwa",
    land_tenure: "Umiliki wa Ardhi",
    crop_type: "Aina ya Zao",
    acres: "Ekari",
    hectares: "Hekta",
    yield_last: "Mavuno (Msimu Uliopita)",
    planting_month: "Mwezi wa Kupanda",
    harvest_month: "Mwezi wa Kuvuna",
    price: "Bei ya Kuuza (TZS/kg)",
    add_crop: "Ongeza Zao Lingine",

    // Photos & Media
    photo_wide: "Picha ya Shamba (Pana)",
    photo_crop: "Picha ya Zao (Karibu)",
    photo_farmer: "Picha ya Mkulima",
    tap_capture: "Gusa Kupiga Picha",
    comments: "Maoni ya Ziada",
    voice_note: "Andika au rekodi sauti...",
    consent: "Ninathibitisha kuwa mkulima ametoa ridhaa kwa ukaguzi na picha hizi.",
    consent_warning: "Tafadhali hakikisha una ridhaa ya mkulima kabla ya kumpiga picha.",

    // AI
    analyzing: "Inachambuliwa na Gemini AI...",
    identify_ai: "Tambua kwa AI",

    // Training / Help
    field_guide: "Mwongozo wa Uwandani",
    export_training: "Pakua Data ya Mafunzo",

    // Dropdown Maps
    "Male": "Mwanaume",
    "Female": "Mwanamke",
    "Own with title": "Mmiliki (Hati)",
    "Own no title": "Mmiliki (Bila Hati)",
    "Rent/Lease": "Kukodi",
    "Communal": "Ardhi ya Kijiji",
    "Family land": "Ardhi ya Familia",
    "Maize": "Mahindi",
    "Rice": "Mpunga",
    "Beans": "Maharage",
    "Sunflower": "Alizeti",
    "Cotton": "Pamba",
    "Coffee": "Kahawa",
    "Other": "Nyingine"
  }
};

export const getLabel = (lang: Language, key: string): string => {
    // @ts-ignore
    return translations[lang][key] || key;
}
