// ─── Farmer enums ─────────────────────────────────────────────────────────────

export type FarmerGender = 'male' | 'female' | 'prefer_not_to_say';

export type EducationLevel =
  | 'none' | 'primary' | 'secondary' | 'vocational' | 'tertiary';

export type FarmingExperienceRange =
  | 'less_than_2' | '2_to_5' | '5_to_10' | '10_to_20' | 'over_20';

export type IncomePrimary =
  | 'farming_only' | 'farming_and_livestock' | 'farming_and_employment'
  | 'farming_and_business' | 'mixed';

export type MobileMoneyProvider =
  | 'mpesa' | 'tigo_pesa' | 'airtel_money' | 'halopesa' | 'none';

export type PhoneType = 'smartphone' | 'feature_phone' | 'no_phone';

export type LanguagePreference = 'swahili' | 'english' | 'both' | 'local_dialect';

export type AgeRange =
  | 'under_25' | '25_to_35' | '35_to_45' | '45_to_55' | '55_to_65' | 'over_65';

// ─── Farmer profile sections ──────────────────────────────────────────────────

export interface FarmerIdentity {
  phoneNumber: string;
  fullName: string;
  preferredName?: string;
  nationalId?: string;
  gender: FarmerGender;
  ageRange: AgeRange;
  photoUrl?: string;
}

export interface FarmerHousehold {
  householdSize: number;
  dependents: number;
  offFarmIncome: boolean;
  offFarmIncomeSource?: string;
  primaryIncomeSource: IncomePrimary;
  educationLevel: EducationLevel;
}

export interface FarmerExperience {
  yearsFarming: FarmingExperienceRange;
  hasReceivedTraining: boolean;
  trainingTypes?: string[];
  cooperativeMember: boolean;
  cooperativeName?: string;
  farmerGroupMember: boolean;
  farmerGroupName?: string;
  extensionContactFrequency: 'never' | 'rarely' | 'sometimes' | 'regularly';
}

export interface FarmerFinancial {
  hasBankAccount: boolean;
  bankName?: string;
  mobileMoneyUser: boolean;
  mobileMoneyProviders: MobileMoneyProvider[];
  mobileMoneyNumber?: string;
  hasAccessedCredit: boolean;
  creditSources?: string[];
  creditPurpose?: string;
  hasInputCredit: boolean;
  inputCreditSource?: string;
}

export interface FarmerDigital {
  phoneType: PhoneType;
  usesWhatsApp: boolean;
  usesAgriApps: boolean;
  agriAppsUsed?: string[];
  languagePreference: LanguagePreference;
  comfortWithDigitalForms: 'comfortable' | 'needs_help' | 'not_comfortable';
}

export interface FarmerProfile {
  localId: string;
  auditId: string;
  capturedAt: string;
  capturedBy: string;
  identity: FarmerIdentity;
  household: FarmerHousehold;
  experience: FarmerExperience;
  financial: FarmerFinancial;
  digital: FarmerDigital;
  possibleDuplicateId?: string;
  duplicateAcknowledged?: boolean;
}
