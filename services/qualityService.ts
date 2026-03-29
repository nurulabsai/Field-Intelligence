import { AuditRecord } from '../types';

export const checkAuditQuality = (audit: AuditRecord): string[] => {
  const flags: string[] = [];
  
  // Basic checks
  if (!audit.location) flags.push("Missing GPS location");
  if ((audit.location?.accuracy || 100) > 20) flags.push("Low GPS accuracy");
  if (audit.images.length < 3) flags.push("Insufficient photos (<3)");

  // 3. Farm Specific Logic
  if (audit.type === 'farm' && audit.farmData) {
    const fd = audit.farmData;
    
    // Self-reported Quality Check
    if (fd.finalNotes?.dataQuality === 'POOR') {
        flags.push("Auditor self-reported POOR data quality");
    }
    
    // Yield Logic Checks
    fd.crops.forEach((crop: any) => {
      const yieldVal = Number(crop.yieldLast);
      const areaVal = Number(crop.area);
      
      if (!isNaN(yieldVal) && !isNaN(areaVal) && areaVal > 0) {
        // Convert area to acres for standardization
        const acres = fd.farmSizeUnit === 'Hectares' ? areaVal * 2.47 : areaVal;
        const yieldPerAcre = yieldVal / acres;
        
        // Suspiciously high yields (Example: Maize > 3000kg/acre is rare for smallholder)
        if (crop.type === 'Maize' && yieldPerAcre > 4000) {
          flags.push(`Suspicious Yield: ${crop.type} (${Math.round(yieldPerAcre)}kg/acre)`);
        }
      }
    });

    // Age Check
    if (fd.farmSize && Number(fd.farmSize) > 1000) {
       flags.push(`Suspicious Farm Size (>1000 ${fd.farmSizeUnit})`);
    }
  }
  
  return flags;
};