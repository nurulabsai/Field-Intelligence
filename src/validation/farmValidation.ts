import type { FarmProfile, FarmBoundaryDraft, Plot, PlotObservation, AuditFormState }
  from '../types/auditTypes';
import { validateFarmerProfile } from './farmerValidation';

export function validateFarmProfile(v: Partial<FarmProfile>): string[] {
  const e: string[] = [];
  if (!v.farmerLocalId)            e.push('Farm must be linked to a farmer — go back to Step 1');
  if (!v.farmLocalRef?.trim())     e.push('Farm name or reference is required');
  if (!v.region)                   e.push('Region is required');
  if (!v.district)                 e.push('District is required');
  if (!v.ward?.trim())             e.push('Ward is required');
  if (!v.village?.trim())          e.push('Village is required');
  if (!v.totalAreaHa || v.totalAreaHa <= 0)
    e.push('Farm area must be greater than 0');
  if (v.totalAreaHa && v.totalAreaHa > 500)
    e.push('Area exceeds 500ha — please confirm this is correct');
  if (!v.tenureType)               e.push('Land tenure type is required');
  if (!v.farmingSystem)            e.push('Farming system is required');
  return e;
}

export function validateFarmBoundary(v: FarmBoundaryDraft): string[] {
  const e: string[] = [];
  if (v.status === 'not_started')
    e.push('Boundary must be captured or explicitly skipped');
  if (v.status === 'in_progress')
    e.push('Boundary capture is in progress — finish or discard it');
  if ((v.status === 'draft' || v.status === 'complete')
      && (!v.polygon || v.polygon.points.length < 3))
    e.push('Boundary polygon requires at least 3 points');
  if (v.status === 'skipped' && !v.skipReason?.trim())
    e.push('Provide a reason for skipping boundary capture');
  return e;
}

export function validatePlot(plot: Plot, index: number): string[] {
  const n = index + 1;
  const e: string[] = [];
  if (!plot.farmLocalRef)
    e.push(`Plot ${n}: farm reference is missing — data integrity error`);
  if (!plot.plotName.trim())       e.push(`Plot ${n}: name is required`);
  if (plot.areaHa <= 0)           e.push(`Plot ${n}: area must be greater than 0`);
  if (!plot.currentCrop.trim())   e.push(`Plot ${n}: crop is required`);
  if (!plot.growthStage)          e.push(`Plot ${n}: growth stage is required`);
  if (!plot.irrigationStatus)     e.push(`Plot ${n}: irrigation status is required`);
  return e;
}

export function validatePlots(plots: Plot[], farmTotalHa?: number): string[] {
  if (plots.length === 0) return ['At least one plot is required'];
  const errors = plots.flatMap((p, i) => validatePlot(p, i));
  if (farmTotalHa) {
    const totalPlotHa = plots.reduce((sum, p) => sum + p.areaHa, 0);
    if (totalPlotHa > farmTotalHa * 1.1)
      errors.push(
        `Total plot area (${totalPlotHa.toFixed(1)}ha) exceeds farm area ` +
        `(${farmTotalHa.toFixed(1)}ha) — review plot areas`
      );
  }
  return errors;
}

export function validatePlotObservation(
  obs: PlotObservation, plotName: string
): string[] {
  const e: string[] = [];
  if (!obs.plotLocalId)
    e.push(`${plotName}: observation has no plot linkage — data error`);
  if (!obs.farmLocalRef)
    e.push(`${plotName}: observation has no farm linkage — data error`);
  if (obs.cropCondition === null)
    e.push(`${plotName}: crop condition is required`);
  if (obs.pestPresent === null)
    e.push(`${plotName}: pest presence must be Yes or No`);
  if (obs.diseasePresent === null)
    e.push(`${plotName}: disease presence must be Yes or No`);
  if (obs.pestPresent && !obs.pestType?.trim())
    e.push(`${plotName}: pest type is required when pest is present`);
  if (obs.diseasePresent && !obs.diseaseType?.trim())
    e.push(`${plotName}: disease type is required when disease is present`);
  return e;
}

export function validateAllObservations(plots: Plot[]): string[] {
  return plots.flatMap(p =>
    validatePlotObservation(
      p.observation,
      p.plotName || `Plot ${p.localId.slice(0, 6)}`
    )
  );
}

export function validateStepByIndex(
  stepIndex: number,
  state: AuditFormState
): string[] {
  switch (stepIndex) {
    case 1: return state.farmer
      ? validateFarmerProfile(state.farmer)
      : ['Farmer profile is required'];
    case 2: return state.farmProfile
      ? validateFarmProfile(state.farmProfile)
      : ['Farm profile is required'];
    case 3: return state.farmBoundary
      ? validateFarmBoundary(state.farmBoundary)
      : ['Farm boundary step must be completed or skipped'];
    case 4: return validatePlots(state.plots, state.farmProfile?.totalAreaHa);
    case 5: return validateAllObservations(state.plots);
    case 6: return [];
    case 7: return [];
    case 8: return [];
    default: return [];
  }
}
