
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ProgressIndicator } from './ProgressIndicator';
import { QuestionRenderer, Question } from './QuestionRenderer';
import { NavigationButtons } from './NavigationButtons';
import { Save, Sparkles, Loader2, MessageSquare } from 'lucide-react';
import { Language } from '../services/i18n';
import { VoiceInputButton } from './ai/VoiceInputButton';
import { AIAssistantPanel } from './ai/AIAssistantPanel';
import { AIValidationAlert, ValidationAlert } from './ai/AIValidationAlert';
import {
  transcribeAudio,
  extractDataFromTranscript,
  analyzeFieldPhoto,
  validateAnswer
} from '../services/aiService';
import { validateGPS } from '../services/validationService';
import { draftService } from '../services/draftService';
import { BottomNav } from './BottomNav';
import { ScreenLayout } from './ScreenLayout';
import './PagedFormContainer.css';

interface FormTemplate {
  id: string;
  name: string;
  questions: Question[];
}

interface PagedFormContainerProps {
  template: FormTemplate;
  initialValues?: Record<string, any>;
  onSubmit: (data: any, isDraft?: boolean) => void;
  onCancel: () => void;
  onSaveDraft: (data: any) => void;
  lang: Language;
}

export const PagedFormContainer: React.FC<PagedFormContainerProps> = ({
  template,
  initialValues = {},
  onSubmit,
  onCancel,
  onSaveDraft,
  lang,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [formState, setFormState] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI State
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [validationAlert, setValidationAlert] = useState<ValidationAlert | null>(null);

  // Evaluate conditions to filter visible questions
  const visibleQuestions = useMemo(() => {
    return template.questions.filter(q => {
      if (!q.condition) return true;
      const answer = formState[q.condition.field];

      switch (q.condition.operator) {
        case 'equals': return answer === q.condition.value;
        case 'not_equals': return answer !== q.condition.value;
        case 'contains': return Array.isArray(answer) && answer.includes(q.condition.value);
        case 'in': return Array.isArray(q.condition.value) && q.condition.value.includes(answer);
        case 'intersects':
          return Array.isArray(answer) && Array.isArray(q.condition.value) && answer.some((a: any) => q.condition.value.includes(a));
        case 'greater_than': return Number(answer) > q.condition.value;
        case 'less_than': return Number(answer) < q.condition.value;
        default: return true;
      }
    });
  }, [formState, template.questions]);

  // Ensure current index is valid after visibility changes
  useEffect(() => {
    if (currentIndex >= visibleQuestions.length) {
      setCurrentIndex(Math.max(0, visibleQuestions.length - 1));
    }
  }, [visibleQuestions.length]);

  const currentQuestion = visibleQuestions[currentIndex];

  if (!currentQuestion) {
    return <div className="p-8 text-center">Loading questions...</div>;
  }

  const currentValue = formState[currentQuestion.id];

  // Validation Logic
  const isCurrentQuestionValid = () => {
    if (currentQuestion.type === 'info') return true;
    if (!currentQuestion.required && (currentValue === undefined || currentValue === null || currentValue === '')) return true;

    const value = currentValue;

    // Strict validation for GPS type
    if (currentQuestion.type === 'gps' && value) {
      const { valid } = validateGPS(value);
      return valid;
    }

    // Boundary: 4-8 corners required
    if (currentQuestion.type === 'boundary') {
      const corners = Array.isArray(value) ? value : [];
      return corners.length >= 4 && corners.length <= 8;
    }

    if (currentQuestion.type === 'multiselect') {
      return Array.isArray(value) && value.length > 0;
    }
    if (currentQuestion.type === 'boolean') {
      return value === true || value === false;
    }
    if (currentQuestion.type === 'number') {
      if (value === undefined || value === null || value === '') return !currentQuestion.required;
      if (currentQuestion.validation?.min !== undefined && Number(value) < currentQuestion.validation.min) return false;
      if (currentQuestion.validation?.max !== undefined && Number(value) > currentQuestion.validation.max) return false;
      return true;
    }
    return value !== undefined && value !== null && value !== '';
  };

  const canGoNext = isCurrentQuestionValid();
  const canGoBack = currentIndex > 0;
  const isLastQuestion = currentIndex === visibleQuestions.length - 1;

  // AI Logic: Analyze Photo
  const handlePhotoAnalysis = async (photoValue: any) => {
    if (!photoValue || !photoValue.data) return;

    setIsProcessingAI(true);
    const draftId = `draft_${template.id}`;

    try {
      const analysis = await analyzeFieldPhoto(
        photoValue.data,
        {
          questionContext: currentQuestion.label,
          farmContext: formState // Pass simple context
        },
        draftId,
        currentQuestion.id
      );

      // 1. Check Quality
      if (analysis.photoQuality.shouldRetake) {
        setValidationAlert({
          type: 'warning',
          message: `Photo Issue: ${analysis.photoQuality.reason}`,
          suggestedAction: 'Please retake the photo for better results.'
        });
      }

      // 2. Suggestions
      const newSuggestions = analysis.autoFillSuggestions.map(s => ({
        id: crypto.randomUUID(),
        field: s.field,
        suggestedValue: s.value,
        confidence: s.confidence,
        evidence: `Visual analysis: ${analysis.observations}`,
        source: 'photo',
        type: 'data'
      }));

      if (newSuggestions.length > 0) {
        setAiSuggestions(prev => [...newSuggestions, ...prev]);
        setShowAiPanel(true);
      }

      // 3. Info Alert for Analysis
      if (analysis.observations) {
        // Only show if not covered by quality warning
        if (!analysis.photoQuality.shouldRetake) {
          setValidationAlert({
            type: 'info',
            message: 'AI Analysis Complete',
            suggestedAction: analysis.observations.substring(0, 100) + '...'
          });
        }
      }

    } catch (e) {
      console.error("Photo Analysis Failed", e);
    } finally {
      setIsProcessingAI(false);
    }
  };

  // Handlers
  const handleAnswerChange = (value: any) => {
    setFormState((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));

    // Clear field-specific errors
    if (errors[currentQuestion.id]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[currentQuestion.id];
        return newErrors;
      });
    }

    // Trigger AI Photo Analysis
    if (currentQuestion.type === 'photo' && value) {
      handlePhotoAnalysis(value);
    }

    // Dismiss alerts on change
    if (validationAlert) setValidationAlert(null);
  };

  const handleVoiceRecording = async (audioBlob: Blob) => {
    setIsProcessingAI(true);
    const draftId = `draft_${template.id}`;

    try {
      // 1. Transcribe
      const transcript = await transcribeAudio(audioBlob, lang, draftId, currentQuestion.id);

      // If offline placeholder returned, just update the field with it?
      if (transcript.includes('[Pending AI Processing')) {
        setFormState(prev => ({
          ...prev,
          [currentQuestion.id]: (prev[currentQuestion.id] || '') + transcript
        }));
        return;
      }

      // 2. Analyze with Gemini (Only if online/transcription succeeded)
      const extraction = await extractDataFromTranscript(transcript, currentQuestion, formState);

      // 3. Process Result
      const newSuggestions: any[] = [];

      // Primary Answer
      if (extraction.primaryAnswer && extraction.primaryAnswer.value) {
        newSuggestions.push({
          id: crypto.randomUUID(),
          field: extraction.primaryAnswer.field,
          suggestedValue: extraction.primaryAnswer.value,
          confidence: extraction.primaryAnswer.confidence,
          evidence: extraction.primaryAnswer.evidence,
          source: 'voice',
          type: 'data'
        });
      }

      // Additional Data (Contextual fills)
      if (extraction.additionalData && extraction.additionalData.length > 0) {
        extraction.additionalData.forEach(item => {
          // Only suggest if we have a matching question in the template
          const targetQ = template.questions.find(q => q.id === item.field);
          if (targetQ) {
            newSuggestions.push({
              id: crypto.randomUUID(),
              field: item.field,
              suggestedValue: item.value,
              confidence: item.confidence,
              evidence: item.evidence,
              source: 'inference',
              type: 'data'
            });
          }
        });
      }

      // Follow Ups
      if (extraction.suggestedFollowUps && extraction.suggestedFollowUps.length > 0) {
        extraction.suggestedFollowUps.forEach(q => {
          newSuggestions.push({
            id: crypto.randomUUID(),
            field: 'auditor_observations', // Map to notes/observations as a fallback
            suggestedValue: formState['auditor_observations'] ? `${formState['auditor_observations']}\n[AI Follow-up]: ${q}` : `[AI Follow-up]: ${q}`,
            confidence: 0.8,
            evidence: 'Smart Follow-up Question',
            source: 'inference',
            type: 'data'
          });
        });
      }

      if (newSuggestions.length > 0) {
        setAiSuggestions(prev => [...newSuggestions, ...prev]);
        setShowAiPanel(true);
      } else {
        setValidationAlert({
          type: 'info',
          message: 'No structured data extracted.',
          suggestedAction: 'Try speaking clearly about the specific question.'
        });
      }

    } catch (error) {
      console.error("AI Processing Error:", error);
      alert("Could not process audio. Please try again.");
    } finally {
      setIsProcessingAI(false);
    }
  };

  const acceptSuggestion = (suggestion: any) => {
    // Update form state
    setFormState(prev => ({
      ...prev,
      [suggestion.field]: suggestion.suggestedValue
    }));

    // Remove from list
    setAiSuggestions(prev => prev.filter(s => s.id !== suggestion.id));

    // Visual feedback if it affected current question
    if (suggestion.field === currentQuestion.id) {
      setValidationAlert({
        type: 'info',
        message: 'Value updated from AI suggestion.',
      });
      setTimeout(() => setValidationAlert(null), 2000);
    }
  };

  // AI Validation on Next
  const performAIValidation = async () => {
    // Only validate data fields with values
    if (['info', 'photo'].includes(currentQuestion.type)) return true;
    if (!currentValue) return true;

    try {
      // Provide some historical data context (mocked for now)
      const mockHistory = [
        { field: currentQuestion.id, value: currentValue }
      ];

      const validation = await validateAnswer(currentQuestion.id, currentValue, formState, mockHistory);

      if (!validation.isValid || validation.severity === 'warning' || validation.severity === 'error') {
        setValidationAlert({
          type: validation.severity as 'error' | 'warning' | 'info',
          message: validation.message,
          suggestedAction: validation.suggestedFollowUp,
          field: currentQuestion.id
        });

        // If error, block. If warning, allow but show alert.
        if (validation.severity === 'error') return false;
      }
    } catch (e) {
      console.warn("Validation check failed", e);
    }
    return true;
  };

  // Navigation
  const goToNext = async () => {
    if (canGoNext) {
      // Trigger AI validation if not info/photo/gps(handled separately)
      if (!['info', 'photo', 'gps', 'boundary'].includes(currentQuestion.type) && currentValue) {
        setIsSubmitting(true); // Show spinner on button
        const passed = await performAIValidation();
        setIsSubmitting(false);
        if (!passed) return;
      }

      if (currentIndex < visibleQuestions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        window.scrollTo(0, 0);
      }
    }
  };

  const goToPrevious = () => {
    if (canGoBack) {
      setCurrentIndex((prev) => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      const safeFormState = { ...formState };
      Object.keys(safeFormState).forEach((key) => {
        if (safeFormState[key]?.data && safeFormState[key].data?.length > 1000) {
          safeFormState[key] = { ...safeFormState[key], data: null, _isLocalDraft: true };
        }
      });
      await draftService.save(template.id, template.name, safeFormState);
      await onSaveDraft({
        auditType: template.id,
        auditName: template.name,
        submittedAt: new Date().toISOString(),
        data: formState,
      });
    } catch (e) {
      console.error("Failed to save draft", e);
      alert("Failed to save draft. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    // Basic validation check
    const allErrors: Record<string, string> = {};
    visibleQuestions.forEach((question) => {
      if (question.required && question.type !== 'info') {
        const value = formState[question.id];
        let isValid = false;

        // GPS Validation check during submit
        if (question.type === 'gps') {
          if (!value) {
            isValid = false;
            allErrors[question.id] = 'GPS location required';
          } else {
            const { valid, error } = validateGPS(value);
            if (!valid) {
              isValid = false;
              allErrors[question.id] = error || 'Invalid GPS';
            } else {
              isValid = true;
            }
          }
        }
        else if (question.type === 'boundary') {
          const corners = Array.isArray(value) ? value : [];
          isValid = corners.length >= 4 && corners.length <= 8;
          if (!isValid) allErrors[question.id] = 'Need 4-8 boundary corners';
        }
        else if (question.type === 'multiselect') isValid = Array.isArray(value) && value.length > 0;
        else if (question.type === 'boolean') isValid = value === true || value === false;
        else isValid = value !== undefined && value !== null && value !== '';

        if (!isValid && !allErrors[question.id]) allErrors[question.id] = 'Required';
      }
    });

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      alert(`Please fix issues before submitting: ${Object.values(allErrors)[0]}`);
      const firstErrorIndex = visibleQuestions.findIndex((q) => allErrors[q.id]);
      if (firstErrorIndex !== -1) setCurrentIndex(firstErrorIndex);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formState, false);
      await draftService.delete(template.id);
    } catch (error) {
      alert('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load draft from IndexedDB
  useEffect(() => {
    if (Object.keys(initialValues).length > 0) return;
    draftService.get(template.id).then((draft) => {
      if (draft?.formState && Object.keys(draft.formState).length > 0) {
        if (window.confirm(`Resume previous ${template.name}?`)) {
          setFormState(draft.formState as Record<string, any>);
        } else {
          draftService.delete(template.id);
        }
      }
    }).catch((e) => console.error(e));
  }, [template.id, template.name]);

  // Auto-save to IndexedDB every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      const safeFormState = { ...formState };
      Object.keys(safeFormState).forEach((key) => {
        if (safeFormState[key]?.data && safeFormState[key].data?.length > 1000) {
          safeFormState[key] = { ...safeFormState[key], data: null, _isLocalDraft: true };
        }
      });
      draftService.save(template.id, template.name, safeFormState).catch((e) => console.warn('Draft save failed', e));
    }, 30000);
    return () => clearInterval(interval);
  }, [formState, template.id, template.name]);

  return (
    <ScreenLayout className="bg-deepNavy">
        {/* Header */}
        <header className="px-8 pt-12 pb-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 shrink-0 rounded-full bg-white/5 flex items-center justify-center border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                onClick={onCancel}
              >
                <span className="material-symbols-outlined text-neonCyan text-2xl">arrow_back</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-3xl font-light  text-white tracking-tight truncate leading-tight">
                  {template.name}
                </h1>
                <p className="text-[11px] text-gray-500 font-medium tracking-wide mt-0.5 uppercase">
                  {isSubmitting ? 'Saving...' : 'Form In Progress'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 shrink-0">
              <div className="hidden sm:flex flex-col items-end">
                 <button 
                   onClick={handleSaveDraft} 
                   disabled={isSubmitting} 
                   className="flex items-center gap-2 bg-neonLime text-black text-[10px] uppercase font-bold px-4 py-2 rounded-full neon-glow-lime hover:scale-105 transition-transform"
                 >
                   {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin"/> : <Save className="w-3 h-3"/>}
                   DRAFT
                 </button>
              </div>
              
              <div className="relative flex items-center justify-center">
                <svg className="w-14 h-14 progress-ring -rotate-90">
                  <circle className="text-white/5" cx="28" cy="28" fill="transparent" r="24" stroke="currentColor" strokeWidth="3"></circle>
                  <circle 
                    className="text-neonLime transition-all duration-500 ease-out" 
                    cx="28" cy="28" fill="transparent" r="24" stroke="currentColor" 
                    strokeDasharray="150.8" 
                    strokeDashoffset={150.8 - (150.8 * (currentIndex + 1) / visibleQuestions.length)} 
                    strokeLinecap="round" strokeWidth="3"
                  ></circle>
                </svg>
                <span className="absolute text-sm font-light text-neonLime ">
                  {Math.round(((currentIndex + 1) / visibleQuestions.length) * 100)}%
                </span>
              </div>
            </div>
          </div>
          
          <ProgressIndicator 
            currentQuestion={currentIndex + 1} 
            totalQuestions={visibleQuestions.length} 
            sectionName={template.name} 
          />
        </header>

        <main className="flex-1 overflow-y-auto px-4 pb-48 custom-scrollbar">
          <div className="glassmorphism rounded-[32px] p-8 relative">
            <QuestionRenderer
              question={currentQuestion}
              value={currentValue}
              onChange={handleAnswerChange}
              error={errors[currentQuestion.id]}
              lang={lang}
            />

            {/* AI Voice Input Trigger */}
            <div className="mt-8 border-t border-dashed border-white/10 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-neonCyan" />
                <span className="text-[10px] font-bold text-neonCyan uppercase tracking-widest">
                  {navigator.onLine ? 'AI Copilot' : 'AI Processing Offline'}
                </span>
              </div>
              <VoiceInputButton
                onRecordingComplete={handleVoiceRecording}
                language={lang}
              />
              {isProcessingAI && (
                <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase text-neonCyan animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </div>
              )}

              {/* Hint for suggestions */}
              {aiSuggestions.length > 0 && !showAiPanel && (
                <button
                  onClick={() => setShowAiPanel(true)}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-neonCyan/10 text-neonCyan rounded-full text-xs font-bold uppercase tracking-widest border border-neonCyan/20 hover:bg-neonCyan/20 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  {aiSuggestions.length} Suggestions
                </button>
              )}
            </div>
            
            <NavigationButtons
              onPrevious={goToPrevious}
              onNext={goToNext}
              onSubmit={handleSubmit}
              canGoBack={canGoBack}
              canGoNext={canGoNext}
              isLastQuestion={isLastQuestion}
              isSubmitting={isSubmitting}
            />
          </div>
        </main>

        {/* AI Assistant Side Panel (Desktop) or Overlay (Mobile) */}
        {(showAiPanel && aiSuggestions.length > 0) && (
          <div className={`absolute inset-y-0 right-0 w-full sm:w-80 bg-[#161C2A] border-l border-white/5 shadow-2xl transform transition-transform z-40 flex flex-col ${showAiPanel ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/5">
              <h3 className="font-bold flex items-center gap-2 text-neonCyan tracking-wide text-sm uppercase">
                <Sparkles className="w-4 h-4" /> AI Suggestions
              </h3>
              <button onClick={() => setShowAiPanel(false)} className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors">
                 <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <AIAssistantPanel
                suggestions={aiSuggestions}
                onAcceptSuggestion={acceptSuggestion}
                onRejectSuggestion={(s) => setAiSuggestions(prev => prev.filter(x => x.id !== s.id))}
              />
            </div>
          </div>
        )}

        {/* Validation Alert Overlay */}
        {validationAlert && (
          <AIValidationAlert
            alert={validationAlert}
            onDismiss={() => setValidationAlert(null)}
          />
        )}
        
        <BottomNav activeTab="add" />
        
    </ScreenLayout>
  );
};
