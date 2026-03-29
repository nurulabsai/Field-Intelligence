import type { FarmerProfile, FarmerIdentity, FarmerHousehold,
  FarmerExperience, FarmerFinancial, FarmerDigital } from '../types/farmerTypes';

const TZ_PHONE_RE = /^\+?255[0-9]{9}$/;

export function validateFarmerIdentity(v: Partial<FarmerIdentity>): string[] {
  const e: string[] = [];
  if (!v.phoneNumber?.trim())
    e.push('Phone number is required');
  else if (!TZ_PHONE_RE.test(v.phoneNumber.replace(/\s/g, '')))
    e.push('Phone must be a valid Tanzanian number (+255 XXX XXX XXX)');
  if (!v.fullName?.trim())         e.push('Full name is required');
  if (!v.gender)                   e.push('Gender is required');
  if (!v.ageRange)                 e.push('Age range is required');
  return e;
}

export function validateFarmerHousehold(v: Partial<FarmerHousehold>): string[] {
  const e: string[] = [];
  if (!v.householdSize || v.householdSize < 1)
    e.push('Household size must be at least 1');
  if (v.dependents === undefined || v.dependents < 0)
    e.push('Dependents is required (enter 0 if none)');
  if (v.dependents !== undefined && v.householdSize !== undefined
      && v.dependents > v.householdSize)
    e.push('Dependents cannot exceed household size');
  if (!v.primaryIncomeSource)      e.push('Primary income source is required');
  if (!v.educationLevel)           e.push('Education level is required');
  if (v.offFarmIncome === undefined) e.push('Off-farm income is required');
  return e;
}

export function validateFarmerExperience(v: Partial<FarmerExperience>): string[] {
  const e: string[] = [];
  if (!v.yearsFarming)             e.push('Years farming is required');
  if (v.hasReceivedTraining === undefined) e.push('Training field is required');
  if (v.cooperativeMember === undefined)   e.push('Cooperative member is required');
  if (v.cooperativeMember && !v.cooperativeName?.trim())
    e.push('Cooperative name is required when member is Yes');
  if (!v.extensionContactFrequency) e.push('Extension contact frequency is required');
  return e;
}

export function validateFarmerFinancial(v: Partial<FarmerFinancial>): string[] {
  const e: string[] = [];
  if (v.hasBankAccount === undefined)      e.push('Bank account is required');
  if (v.mobileMoneyUser === undefined)     e.push('Mobile money is required');
  if (v.mobileMoneyUser && !v.mobileMoneyProviders?.length)
    e.push('Select at least one mobile money provider');
  if (v.hasAccessedCredit === undefined)   e.push('Credit access is required');
  if (v.hasInputCredit === undefined)      e.push('Input credit is required');
  return e;
}

export function validateFarmerDigital(v: Partial<FarmerDigital>): string[] {
  const e: string[] = [];
  if (!v.phoneType)                        e.push('Phone type is required');
  if (v.usesWhatsApp === undefined)        e.push('WhatsApp usage is required');
  if (!v.languagePreference)              e.push('Language preference is required');
  if (!v.comfortWithDigitalForms)         e.push('Digital comfort level is required');
  return e;
}

export function validateFarmerProfile(f: Partial<FarmerProfile>): string[] {
  return [
    ...validateFarmerIdentity(f.identity ?? {}),
    ...validateFarmerHousehold(f.household ?? {}),
    ...validateFarmerExperience(f.experience ?? {}),
    ...validateFarmerFinancial(f.financial ?? {}),
    ...validateFarmerDigital(f.digital ?? {}),
  ];
}
