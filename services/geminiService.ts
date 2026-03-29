
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
    throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY in .env.local');
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeGeneralImage = async (base64Image: string): Promise<string | null> => {
  const ai = getAI();
  const model = 'gemini-2.0-flash-exp'; // Updated to valid model

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
          { text: "Analyze this image in detail. Identify key agricultural or business elements, potential issues, quality indicators, and any other relevant observations for a field audit." }
        ]
      }
    });
    return response.text || null;
  } catch (e) {
    console.error("General Analysis failed", e);
    return null;
  }
};

export const analyzeAuditImage = async (base64Image: string) => {
  const ai = getAI();
  const model = 'gemini-1.5-flash'; // Updated to valid model

  const prompt = `Analyze this field audit photo. 
  Identify:
  1. Compliance status (Good/Warning/Critical)
  2. Potential hazards or maintenance issues
  3. Key observations
  Provide a professional, concise summary suitable for a business report.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
          { text: prompt }
        ]
      },
      config: {
        temperature: 0.4,
        topP: 0.8,
        topK: 40
      }
    });

    return response.text;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return "Analysis unavailable at this time.";
  }
};

export const identifyCropFromImage = async (base64Image: string): Promise<string | null> => {
  const ai = getAI();
  const model = 'gemini-1.5-flash'; // Updated to valid model

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
          { text: "Identify the main agricultural crop in this photo. Return ONLY the crop name (e.g., 'Maize', 'Sunflower'). If unsure, return 'Unknown'." }
        ]
      }
    });
    const text = response.text?.trim();
    return text && text !== 'Unknown' ? text.replace(/\.$/, '') : null;
  } catch (e) {
    console.error("Crop ID failed", e);
    return null;
  }
};

export const readSeedBagLabel = async (base64Image: string): Promise<string | null> => {
  const ai = getAI();
  const model = 'gemini-1.5-flash'; // Updated to valid model

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
          { text: "Read the text on this seed bag. Extract specifically the Variety Name or Brand (e.g. 'DK 8031', 'Pioneer'). Return ONLY the variety name." }
        ]
      }
    });
    return response.text?.trim() || null;
  } catch (e) {
    console.error("OCR failed", e);
    return null;
  }
};

export const transcribeAudio = async (base64Audio: string): Promise<string | null> => {
  const ai = getAI();
  const model = 'gemini-2.0-flash-exp'; // Updated to valid model

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { data: base64Audio, mimeType: 'audio/webm' } },
          { text: "Transcribe this audio recording accurately. The speaker is likely a Tanzanian agricultural auditor. The language may be Swahili, English, or a mix of both (Code-switching). Return the transcription in the language spoken." }
        ]
      }
    });
    return response.text?.trim() || null;
  } catch (e) {
    console.error("Transcription failed", e);
    return null;
  }
};

export const generateAuditSummary = async (auditData: any) => {
  const ai = getAI();
  const model = 'gemini-2.0-flash-exp'; // Updated to valid model with grounding support
  const typeLabel = auditData.type === 'farm' ? 'Farm' : 'Business';
  let context = '';

  if (auditData.type === 'farm' && auditData.farmData) {
    const fd = auditData.farmData;
    context = `
      FARM DETAILS:
      Farmer: ${fd.farmerFirstName} ${fd.farmerLastName}
      Location: ${fd.village}, ${fd.district}
      Farm Size: ${fd.farmSize} ${fd.farmSizeUnit}
      Crops: ${fd.crops?.map((c: any) => c.type).join(', ') || 'None'}
      Challenges: ${fd.challenges?.mainChallenges?.slice(0, 2).join(', ') || 'None'}
      Soil/Water: Fertilizer ${fd.soilWater?.fertilizerUseEver ? 'Yes' : 'No'}, Pesticides ${fd.soilWater?.pesticideUse ? 'Yes' : 'No'}
      `;
  } else if (auditData.type === 'business' && auditData.businessData) {
    const bd = auditData.businessData;
    context = `
      BUSINESS DETAILS:
      Name: ${bd.actualName}
      Type: ${bd.businessType}
      Owner: ${bd.ownerName}
      Years Operating: ${bd.yearsOperating}
      Operational Status: ${bd.operationalStatus}
      Infrastructure: ${bd.infrastructure?.buildingType || 'Unknown'}
      `;
  }

  const imagesAnalysis = auditData.images?.map((img: any) => img.analysis).filter(Boolean).join('; ') || 'No image analysis available';

  const prompt = `Generate a comprehensive final report summary for the following ${auditData.type || 'field'} audit:
  ${typeLabel} Name: ${auditData.businessName}
  Audit Type: ${typeLabel} Audit
  Observations: ${auditData.notes || 'None'}
  ${context}
  Images Analysis: ${imagesAnalysis}
  
  Using Google Maps grounding, provide up-to-date context about nearby markets, infrastructure, weather conditions, or environmental features relevant to this specific location.
  
  Format the output as a professional summary focusing on action items relevant to a ${typeLabel.toLowerCase()} setting.
  For farms, focus on yield improvement and sustainability.
  For businesses, focus on operational efficiency and compliance.`;

  // Construct location config for Maps Grounding
  let tools: any[] = [];
  let toolConfig: any = undefined;

  if (auditData.location) {
    tools = [{ googleMaps: {} }];
    toolConfig = {
      retrievalConfig: {
        latLng: {
          latitude: auditData.location.latitude,
          longitude: auditData.location.longitude
        }
      }
    };
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools,
        toolConfig
      }
    });

    let summaryText = response.text || "Summary unavailable";

    // Enhanced Grounding Extraction
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    if (groundingChunks && groundingChunks.length > 0) {
      const sources: string[] = [];

      groundingChunks.forEach((chunk: any) => {
        // Google Maps Sources
        if (chunk.maps) {
          const title = chunk.maps.title || 'Google Maps Location';
          const uri = chunk.maps.uri;

          if (uri) {
            sources.push(`📍 ${title}: ${uri}`);
          }
        }

        // Web Sources (if any mixed in, though googleMaps tool primarily returns maps)
        if (chunk.web && chunk.web.uri) {
          sources.push(`🌐 ${chunk.web.title || 'Web Source'}: ${chunk.web.uri}`);
        }
      });

      if (sources.length > 0) {
        summaryText += "\n\n**Verified Sources:**\n" + sources.join('\n');
      }
    }

    return summaryText;
  } catch (error) {
    console.error("AI Summary generation failed:", error);
    return "Summary generation failed. (Check API Key permissions)";
  }
};

export const generateExpertAnalysis = async (auditData: any): Promise<string> => {
  const ai = getAI();
  const model = 'gemini-1.5-pro'; // Updated to valid model for deeper reasoning

  const isFarm = auditData.type === 'farm';
  let details = '';

  if (isFarm && auditData.farmData) {
    const fd = auditData.farmData;
    const cropDetails = fd.crops?.map((c: any) => `${c.type}: ${c.yieldLast}${c.yieldUnit}`).join(', ') || 'No crops listed';
    const inputs = `Fertilizer ${fd.soilWater?.fertilizerUseEver}, Pesticide ${fd.soilWater?.pesticideUse}, Seeds ${fd.inputs?.seedSource?.join(',') || 'Unknown'}`;

    details = `
      FARM DATA:
      Region: ${fd.region}, ${fd.district}
      Soil Type: ${fd.soilType}
      Crops: ${cropDetails}
      Yields: ${cropDetails}
      Inputs: ${inputs}
      Challenges: ${fd.challenges?.mainChallenges?.join(', ') || 'None'}
      Auditor Notes: ${auditData.notes || ''}
      `;
  } else if (!isFarm && auditData.businessData) {
    const bd = auditData.businessData;
    details = `
      BUSINESS DATA:
      Type: ${bd.businessType}
      Operating: ${bd.yearsOperating} years
      Financial Challenges: ${bd.financial?.challenges?.join(', ') || 'None'}
      Auditor Notes: ${auditData.notes || ''}
      `;
  }

  const prompt = `You are a Senior Agro-Expert and Business Consultant for Tanzanian agriculture. 
  Review the following field audit data and provide a "Specialized Expert Comment".
  
  ${details}

  Your output must be structured as follows:
  1. **Ground-Level Assessment**: Briefly evaluate the current performance based on regional standards (e.g., is the yield low for this region? is the soil type appropriate?).
  2. **Critical Issues**: Identify the top 2 risks or inefficiencies.
  3. **Expert Recommendations**: Provide 3 specific, actionable steps the farmer/business owner can take immediately to improve productivity or profitability. Be specific (e.g., recommend specific spacing, fertilizer types based on soil, or market linkages).

  Tone: Professional, authoritative, yet encouraging. Keep it concise (under 250 words).`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature: 0.3, // Lower temp for more analytical output
      }
    });
    return response.text || "Expert analysis unavailable.";
  } catch (error) {
    console.error("Expert Analysis failed:", error);
    return "Could not generate expert analysis.";
  }
};
