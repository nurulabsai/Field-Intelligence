
/**
 * AI SERVICE
 * 
 * Handles all AI operations using Google Gemini Pro:
 * - Voice transcription (Gemini Flash for speed/audio)
 * - Data extraction (Gemini 3 Pro)
 * - Photo analysis (Gemini 3 Pro)
 * - Validation (Gemini 3 Pro)
 * - Follow-up generation (Gemini 3 Pro)
 */

import { GoogleGenAI, Type } from "@google/genai";
import { Question } from '../components/QuestionRenderer';

// Initialize Google GenAI - lazy initialization to prevent crashes
let ai: GoogleGenAI | null = null;

const getAI = (): GoogleGenAI | null => {
  if (ai) return ai;
  
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  if (!apiKey) {
    console.warn("AI Service: VITE_GEMINI_API_KEY is not set. AI features will be disabled.");
    return null;
  }
  
  try {
    ai = new GoogleGenAI({ apiKey });
    return ai;
  } catch (error) {
    console.error("Failed to initialize AI service:", error);
    return null;
  }
};

// Helper to check if AI is available
const isAIAvailable = (): boolean => {
  return getAI() !== null;
};

// Models - Updated to valid Gemini model names
const MODEL_INTEL = 'gemini-1.5-pro'; // For complex reasoning
const MODEL_VISION = 'gemini-1.5-pro'; // For multimodal analysis
const MODEL_AUDIO = 'gemini-2.0-flash-exp'; // Optimized for audio transcription

// Interfaces
interface ExtractedData {
  primaryAnswer: {
    field: string;
    value: any;
    confidence: number;
    evidence: string;
  };
  additionalData: Array<{
    field: string;
    value: any;
    confidence: number;
    evidence: string;
  }>;
  suggestedFollowUps: string[];
}

interface PhotoAnalysis {
  cropHealth: string;
  soilColor: string;
  soilType: string;
  weedPressure: string;
  cropStage: string;
  visibleInfrastructure: string[];
  observations: string;
  photoQuality: {
    score: number;
    reason: string;
    shouldRetake: boolean;
  };
  autoFillSuggestions: Array<{
    field: string;
    value: string;
    confidence: number;
  }>;
}

interface ValidationResult {
  isValid: boolean;
  severity: "error" | "warning" | "info";
  message: string;
  suggestedFollowUp?: string;
  confidence: number;
}

interface FollowUpQuestion {
  question: string;
  reason: string;
  priority: "high" | "medium" | "low";
  fieldsToCapture: string[];
}

// Helper: Convert Blob to Base64
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * FUNCTION 1: Transcribe Audio
 * Uses Gemini API for robust speech-to-text from audio files/blobs
 */
import { queueAIRequest } from './offlineAIService';

// ... imports

/**
 * FUNCTION 1: Transcribe Audio
 * Uses Gemini API for robust speech-to-text from audio files/blobs
 */
export async function transcribeAudio(
  audioBlob: Blob,
  language: 'sw' | 'en',
  auditId?: string,  // Optional context
  fieldId?: string
): Promise<string> {
  // Offline Check
  if (!navigator.onLine) {
    if (auditId && fieldId) {
      await queueAIRequest('transcribe', audioBlob, auditId, fieldId, { lang: language });
      return " [Pending AI Processing... (Saved to Draft)]";
    } else {
      return " [Offline: Voice note saved but not transcribed]";
    }
  }

  try {
    const aiClient = getAI();
    if (!aiClient) {
      return "[AI not available - API key not configured]";
    }

    const base64Audio = await blobToBase64(audioBlob);

    const prompt = language === 'sw'
      ? "Transcribe this Swahili (or mixed Swahili/English) audio exactly as spoken."
      : "Transcribe this English audio exactly as spoken.";

    const response = await aiClient.models.generateContent({
      model: MODEL_AUDIO,
      contents: {
        parts: [
          { inlineData: { mimeType: audioBlob.type || 'audio/webm', data: base64Audio } },
          { text: prompt }
        ]
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini Transcription Error", error);
    // Fallback to queue if it was a network error
    if (auditId && fieldId) {
      await queueAIRequest('transcribe', audioBlob, auditId, fieldId, { lang: language });
      return " [Pending AI Processing...]";
    }
    throw new Error("Failed to transcribe audio.");
  }
}

/**
 * FUNCTION 2: Extract Structured Data from Transcript
 */
export async function extractDataFromTranscript(
  transcript: string,
  currentQuestion: Question,
  formContext: Record<string, any>
): Promise<ExtractedData> {

  const schema = {
    type: Type.OBJECT,
    properties: {
      primaryAnswer: {
        type: Type.OBJECT,
        properties: {
          field: { type: Type.STRING },
          value: { type: Type.STRING }, // Use string for universal capture, cast later
          confidence: { type: Type.NUMBER },
          evidence: { type: Type.STRING },
        },
        required: ["field", "value", "confidence"]
      },
      additionalData: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            field: { type: Type.STRING },
            value: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            evidence: { type: Type.STRING },
          }
        }
      },
      suggestedFollowUps: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  };

  const prompt = `
    CURRENT QUESTION: ${currentQuestion.label}
    QUESTION ID: ${currentQuestion.id}
    TYPE: ${currentQuestion.type}
    OPTIONS: ${JSON.stringify(currentQuestion.options || [])}

    TRANSCRIPT: "${transcript}"

    CONTEXT: ${JSON.stringify(formContext)}

    Extract the data. 
    - Convert local Swahili crop names to English constants (e.g., "mahindi" -> "MAIZE").
    - Format booleans as "true"/"false".
    - Extract other relevant info mentioned in the transcript into 'additionalData'.
  `;

  try {
    const aiClient = getAI();
    if (!aiClient) {
      return {
        primaryAnswer: { field: currentQuestion.id, value: transcript, confidence: 0, evidence: "AI not available" },
        additionalData: [],
        suggestedFollowUps: []
      };
    }

    const response = await aiClient.models.generateContent({
      model: MODEL_INTEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.1, // Low temp for extraction precision
      },
    });

    const text = response.text || "{}";
    return JSON.parse(text) as ExtractedData;
  } catch (error) {
    console.error("Gemini Extraction Error", error);
    throw error;
  }
}

/**
 * FUNCTION 3: Analyze Photo with Computer Vision
 */
export async function analyzeFieldPhoto(
  photoBase64: string, // Expecting base64 string
  context: {
    questionContext: string;
    farmContext: Record<string, any>;
  },
  auditId?: string,
  fieldId?: string
): Promise<PhotoAnalysis> {

  // Offline Check
  if (!navigator.onLine) {
    if (auditId && fieldId) {
      try {
        // Convert base64 to Blob for efficient storage
        const res = await fetch(photoBase64);
        const blob = await res.blob();

        await queueAIRequest('analyze', blob, auditId, fieldId, context);

        // Return placeholder analysis
        return {
          cropHealth: "Pending...",
          soilColor: "Pending...",
          soilType: "Pending...",
          weedPressure: "Pending...",
          cropStage: "Pending...",
          visibleInfrastructure: [],
          observations: "[Pending AI Analysis (Offline)...]",
          photoQuality: {
            score: 0,
            reason: "Offline - Queued for later",
            shouldRetake: false
          },
          autoFillSuggestions: []
        };
      } catch (e) {
        console.error("Failed to queue offline image", e);
      }
    }
  }

  const schema = {
    type: Type.OBJECT,
    properties: {
      cropHealth: { type: Type.STRING },
      soilColor: { type: Type.STRING },
      soilType: { type: Type.STRING },
      weedPressure: { type: Type.STRING },
      cropStage: { type: Type.STRING },
      visibleInfrastructure: { type: Type.ARRAY, items: { type: Type.STRING } },
      observations: { type: Type.STRING },
      photoQuality: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          reason: { type: Type.STRING },
          shouldRetake: { type: Type.BOOLEAN },
        }
      },
      autoFillSuggestions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            field: { type: Type.STRING },
            value: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
          }
        }
      }
    }
  };

  const prompt = `
    Analyze this agricultural photo.
    Context: ${context.questionContext}
    Farm Info: ${JSON.stringify(context.farmContext)}
    
    Assess crop health, soil, and infrastructure. 
    Check if the photo is blurry or unusable.
  `;

  try {
    const aiClient = getAI();
    if (!aiClient) {
      return {
        cropHealth: "N/A",
        soilColor: "N/A",
        soilType: "N/A",
        weedPressure: "N/A",
        cropStage: "N/A",
        visibleInfrastructure: [],
        observations: "[AI not available - API key not configured]",
        photoQuality: { score: 5, reason: "AI not available", shouldRetake: false },
        autoFillSuggestions: []
      };
    }

    // Strip header if present
    const cleanBase64 = photoBase64.split(',')[1] || photoBase64;

    const response = await aiClient.models.generateContent({
      model: MODEL_VISION,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    return JSON.parse(response.text || "{}") as PhotoAnalysis;
  } catch (error) {
    console.error("Gemini Vision Error", error);
    // Fallback to queue if network error (and context provided)
    if (auditId && fieldId) {
      try {
        const res = await fetch(photoBase64);
        const blob = await res.blob();
        await queueAIRequest('analyze', blob, auditId, fieldId, context);
        return {
          cropHealth: "Pending...",
          soilColor: "Pending...",
          soilType: "Pending...",
          weedPressure: "Pending...",
          cropStage: "Pending...",
          visibleInfrastructure: [],
          observations: "[Pending AI Analysis (Network Error)...]",
          photoQuality: { score: 0, reason: "Queued", shouldRetake: false },
          autoFillSuggestions: []
        };
      } catch (e) {
        console.error("Failed to queue fallback", e);
      }
    }
    throw error;
  }
}

/**
 * FUNCTION 4: Validate Answer Against Historical Data
 */
export async function validateAnswer(
  fieldId: string,
  value: any,
  currentFormState: Record<string, any>,
  historicalData: any[]
): Promise<ValidationResult> {

  const schema = {
    type: Type.OBJECT,
    properties: {
      isValid: { type: Type.BOOLEAN },
      severity: { type: Type.STRING, enum: ["error", "warning", "info"] },
      message: { type: Type.STRING },
      suggestedFollowUp: { type: Type.STRING },
      confidence: { type: Type.NUMBER }
    }
  };

  const prompt = `
    Validate this field entry.
    FIELD: ${fieldId}
    VALUE: ${JSON.stringify(value)}
    CURRENT FORM: ${JSON.stringify(currentFormState)}
    HISTORICAL DATA (Context): ${JSON.stringify(historicalData.slice(0, 5))}

    Rules:
    - Check for logical consistency (e.g. crop area > farm size).
    - Check for outliers vs historical data.
    - If suspicious, return severity 'warning' or 'error'.
  `;

  try {
    const aiClient = getAI();
    if (!aiClient) {
      return {
        isValid: true,
        severity: "info" as const,
        message: "AI validation not available",
        confidence: 0
      };
    }

    const response = await aiClient.models.generateContent({
      model: MODEL_INTEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    return JSON.parse(response.text || "{}") as ValidationResult;
  } catch (error) {
    console.error("Gemini Validation Error", error);
    throw error;
  }
}

/**
 * FUNCTION 5: Generate Smart Follow-Up Questions
 */
export async function generateFollowUpQuestions(
  formState: Record<string, any>,
  currentIndex: number,
  allQuestions: Question[]
): Promise<FollowUpQuestion[]> {

  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING },
        reason: { type: Type.STRING },
        priority: { type: Type.STRING, enum: ["high", "medium", "low"] },
        fieldsToCapture: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    }
  };

  const prompt = `
    Generate 1-3 intelligent follow-up questions.
    
    ANSWERS SO FAR: ${JSON.stringify(formState)}
    CURRENT QUESTION INDEX: ${currentIndex}
    TOTAL QUESTIONS: ${allQuestions.length}

    Goal: Clarify ambiguous answers or explore interesting patterns (e.g., high yield but no fertilizer).
  `;

  try {
    const aiClient = getAI();
    if (!aiClient) {
      return [];
    }

    const response = await aiClient.models.generateContent({
      model: MODEL_INTEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    return JSON.parse(response.text || "[]") as FollowUpQuestion[];
  } catch (error) {
    console.error("Gemini Follow-up Error", error);
    return [];
  }
}
