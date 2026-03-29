import React, { useState } from 'react';
import { LocationPicker } from './LocationPicker';
import { BoundarySection } from './BoundarySection';
import { Language } from '../services/i18n';
import { BoundaryCorner } from '../types';
import './QuestionRenderer.css';

const CustomSelect = ({ question, value, onChange, error }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = question.options?.find((o: any) => o.value === value);

  return (
    <div className="relative font-sans">
      {/* Click Away Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Trigger Button */}
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative z-20 w-full bg-[#0B0F19] border ${error ? 'border-red-500' : (isOpen ? 'border-neonCyan/40 neon-glow-cyan' : 'border-white/10')} rounded-[16px] px-5 py-4 text-left flex justify-between items-center text-sm transition-all`}
      >
        <span className={value ? "text-white/90 font-medium" : "text-white/50 font-medium"}>
          {selectedOption ? selectedOption.label : (question.placeholder || "Select your option")}
        </span>
        <span className="material-symbols-outlined text-neonCyan">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0B0F19] border border-white/10 rounded-[16px] shadow-2xl z-30 overflow-hidden">
          {question.options?.map((option: any) => {
            const isSelected = value === option.value;
            return (
              <div 
                key={option.value}
                onClick={() => { onChange(option.value); setIsOpen(false); }}
                className={`px-5 py-4 text-sm cursor-pointer border-b border-white/5 last:border-0 relative flex items-center justify-between transition-colors
                  ${isSelected ? 'text-white font-bold bg-neonCyan/10 border-neonCyan/30' : 'text-gray-400 hover:bg-white/5'}`}
              >
                {option.label}
                {isSelected && (
                  <span className="material-symbols-outlined text-neonCyan text-lg">check</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export interface Question {
  id: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'multiselect' | 'boolean' | 'date' | 'gps' | 'boundary' | 'photo' | 'task_list' | 'info';
  label: string;
  helpText?: string;
  required: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    message?: string;
  };
  condition?: {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'intersects';
    value: any;
  };
}

interface QuestionRendererProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  lang: Language;
}

const getGPSStatus = (accuracy: number, lang: Language) => {
    const isSw = lang === 'sw';
    if (accuracy <= 10) return { color: 'text-green-600', text: isSw ? 'Ishara Bora (Sahihi)' : 'Excellent Signal (High Accuracy)' };
    if (accuracy <= 20) return { color: 'text-teal-600', text: isSw ? 'Ishara Nzuri' : 'Good Signal' };
    if (accuracy <= 100) return { color: 'text-yellow-600', text: isSw ? 'Ishara ya Wastani' : 'Fair Signal (Acceptable)' };
    return { 
        color: 'text-red-600', 
        text: isSw 
            ? 'Ishara Dhaifu. Usahihi mdogo (>100m).' 
            : 'Weak Signal. Accuracy too low (>100m).' 
    };
};

const TaskInput: React.FC<{ onAdd: (task: any) => void }> = ({ onAdd }) => {
    const [desc, setDesc] = useState('');
    const [assignee, setAssignee] = useState('');
    const [priority, setPriority] = useState('Medium');

    const handleAdd = () => {
        if (!desc) return;
        onAdd({
            id: crypto.randomUUID(),
            description: desc,
            assignee: assignee || 'Unassigned',
            priority,
            status: 'Pending',
            createdAt: new Date().toISOString()
        });
        setDesc('');
        setAssignee('');
        setPriority('Medium');
    };

    return (
        <div className="task-form">
            <input 
                className="form-input" 
                placeholder="What needs to be done?" 
                value={desc} 
                onChange={e => setDesc(e.target.value)} 
            />
            <div className="task-form-row">
                <select 
                    className="form-select" 
                    value={priority} 
                    onChange={e => setPriority(e.target.value)}
                >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                </select>
                <input 
                    className="form-input" 
                    placeholder="Assign to..." 
                    value={assignee} 
                    onChange={e => setAssignee(e.target.value)} 
                />
            </div>
            <button type="button" className="btn btn-primary btn-block" onClick={handleAdd}>
                + Add Task
            </button>
        </div>
    );
};

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  value,
  onChange,
  error,
  lang,
}) => {
  const renderInput = () => {
    switch (question.type) {
      case 'info':
        return null; // Just displays label/help text

      case 'text':
        return (
          <input
            type="text"
            className={`w-full bg-white/5 border ${error ? 'border-red-500' : 'border-white/5'} rounded-full px-6 py-4 text-white text-sm font-sans focus:outline-none focus:border-neonCyan/30 transition-all placeholder:text-white/30`}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder || "Enter answer"}
            autoComplete="off"
          />
        );

      case 'textarea':
        return (
          <textarea
            className={`w-full bg-white/5 border ${error ? 'border-red-500' : 'border-white/5'} rounded-[24px] p-6 text-sm text-white focus:outline-none focus:border-neonCyan/30 placeholder:text-gray-500 placeholder:italic min-h-[120px] leading-relaxed transition-all`}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder || "Provide any details..."}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            className={`w-full bg-white/5 border ${error ? 'border-red-500' : 'border-white/5'} rounded-full px-6 py-4 text-white text-sm font-sans focus:outline-none focus:border-neonCyan/30 transition-all placeholder:text-white/30`}
            value={value || ''}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
            placeholder={question.placeholder || "0"}
            min={question.validation?.min}
            max={question.validation?.max}
            inputMode="decimal"
          />
        );

      case 'select':
        return <CustomSelect question={question} value={value} onChange={onChange} error={error} />;

      case 'multiselect':
        return (
          <div className="space-y-6 pt-4 font-sans">
            {question.options?.map((option) => {
              const checked = value?.includes(option.value) || false;
              return (
                <label key={option.value} className="flex items-center gap-4 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={checked}
                    onChange={(e) => {
                      const currentValues = value || [];
                      if (e.target.checked) {
                        onChange([...currentValues, option.value]);
                      } else {
                        onChange(currentValues.filter((v: string) => v !== option.value));
                      }
                    }}
                  />
                  {checked ? (
                    <div className="w-6 h-6 rounded-full bg-neonLime flex items-center justify-center neon-glow-lime shrink-0">
                      <span className="material-symbols-outlined text-black text-lg font-bold">check</span>
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-white/10 bg-white/5 flex items-center justify-center transition-all group-hover:border-white/30 shrink-0"></div>
                  )}
                  <span className={`text-sm ${checked ? 'font-bold text-neonLime' : 'font-medium text-gray-500 group-hover:text-white transition-colors'}`}>
                    {option.label}
                  </span>
                </label>
              );
            })}
          </div>
        );

      case 'boolean':
        return (
          <div className="flex gap-10 px-1 font-sans pt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
               <input type="radio" className="hidden" name={question.id} checked={value === true} onChange={() => onChange(true)} />
               {value === true ? (
                 <div className="w-6 h-6 rounded-full border border-neonLime flex items-center justify-center bg-neonLime/5 shrink-0">
                    <div className="w-2.5 h-2.5 bg-neonLime rounded-full neon-glow-lime"></div>
                 </div>
               ) : (
                 <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center bg-white/5 group-hover:border-white/30 transition-all shrink-0"></div>
               )}
               <span className={`text-sm ${value === true ? 'font-bold text-white' : 'font-medium text-gray-500 group-hover:text-gray-300'}`}>Yes</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
               <input type="radio" className="hidden" name={question.id} checked={value === false} onChange={() => onChange(false)} />
               {value === false ? (
                 <div className="w-6 h-6 rounded-full border border-neonLime flex items-center justify-center bg-neonLime/5 shrink-0">
                    <div className="w-2.5 h-2.5 bg-neonLime rounded-full neon-glow-lime"></div>
                 </div>
               ) : (
                 <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center bg-white/5 group-hover:border-white/30 transition-all shrink-0"></div>
               )}
               <span className={`text-sm ${value === false ? 'font-bold text-white' : 'font-medium text-gray-500 group-hover:text-gray-300'}`}>No</span>
            </label>
          </div>
        );

      case 'date':
        return (
          <div className="relative">
            <input
              type="date"
              className={`w-full bg-white/[0.03] border ${error ? 'border-[#FF4B4B]' : 'border-white/5'} rounded-2xl py-4 px-5 text-sm font-medium text-white/90 focus:outline-none focus:ring-0 focus:border-[#67E8F9]/30 font-sans transition-all`}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              onClick={(e) => {
                if ('showPicker' in e.currentTarget) {
                  try {
                    (e.currentTarget as any).showPicker();
                  } catch (err) {}
                }
              }}
            />
            <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-white/20 text-lg pointer-events-none">calendar_today</span>
          </div>
        );

      case 'boundary':
        return (
          <BoundarySection
            corners={(value || []) as BoundaryCorner[]}
            onChange={(corners) => onChange(corners)}
            targetDistrict={undefined}
          />
        );

      case 'gps':
        const gpsStatus = value?.accuracy !== undefined ? getGPSStatus(value.accuracy, lang) : null;
        return (
          <div className="gps-input">
            <LocationPicker 
              value={value} 
              onChange={onChange} 
            />
            {value ? (
                 gpsStatus && (
                     <p className={`text-sm font-bold mt-2 text-center ${gpsStatus.color}`}>
                         {gpsStatus.text}
                     </p>
                 )
            ) : (
                <p className="text-sm text-slate-500 mt-2 text-center">
                    {lang === 'sw' 
                        ? 'Tumia kitufe cha ramani au thibitisha majira hapo juu.' 
                        : 'Use the map button or verify coordinates above.'
                    }
                </p>
            )}
          </div>
        );

      case 'photo':
        return (
          <div className="space-y-4">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              id={`photo-${question.id}`}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    onChange({
                      id: crypto.randomUUID(),
                      dataUrl: reader.result as string,
                      label: question.label,
                      timestamp: new Date().toISOString(),
                      originalSize: file.size,
                      synced: false,
                    });
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />

            {value ? (
              <div className="space-y-4">
                {/* File indicator pill */}
                <div className={`flex items-center justify-between ${error ? 'bg-[#FF4B4B]/5 border border-[#FF4B4B]/20' : 'bg-white/[0.03] border border-white/5'} rounded-full py-4 px-6`}>
                  <span className="text-sm font-medium text-white/90 font-sans truncate">
                    {value.label || 'Captured photo'}
                  </span>
                  <button type="button" onClick={() => onChange(null)}>
                    <span className={`material-symbols-outlined ${error ? 'text-[#FF4B4B]' : 'text-white/40'} cursor-pointer text-xl`}>cancel</span>
                  </button>
                </div>

                {/* Error banner */}
                {error && (
                  <div className="flex items-start space-x-3 bg-[#FF4B4B]/10 p-5 rounded-3xl">
                    <span className="material-symbols-outlined text-[#FF4B4B] text-lg mt-0.5">error</span>
                    <p className="text-[11px] leading-relaxed text-[#FF4B4B] font-medium font-sans">
                      {error}
                    </p>
                  </div>
                )}

                {/* Preview card */}
                <div className="flex items-center bg-white/[0.03] p-5 rounded-3xl border border-white/5">
                  <div className="w-12 h-12 bg-white/5 rounded-xl overflow-hidden flex-shrink-0 border border-white/5">
                    <img
                      alt="Preview"
                      className={`w-full h-full object-cover ${error ? 'opacity-40' : 'opacity-90'}`}
                      src={value.dataUrl || value.storageUrl}
                    />
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-white/80 font-sans truncate">{value.label || 'photo'}</span>
                      <span className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded-md font-bold text-white/40 uppercase tracking-tighter">img</span>
                    </div>
                    <p className="text-[10px] text-white/20 font-medium mt-0.5 font-sans">
                      {new Date(value.timestamp || Date.now()).toLocaleDateString()} • {value.originalSize ? `${(value.originalSize / 1024).toFixed(0)}KB` : ''}
                    </p>
                    {error && (
                      <div className="flex items-center space-x-1 text-[#FF4B4B]/60 mt-1">
                        <span className="text-[8px] font-bold uppercase tracking-widest font-sans">Declined</span>
                        <span className="material-symbols-outlined text-[10px]">warning</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <label
                htmlFor={`photo-${question.id}`}
                className="w-full cursor-pointer flex items-center justify-center gap-3 bg-white/[0.03] border border-dashed border-white/10 rounded-3xl py-8 text-white/50 hover:text-white/80 hover:border-white/20 transition-all font-sans text-sm"
              >
                <span className="material-symbols-outlined text-2xl">add_a_photo</span>
                Tap to capture photo
              </label>
            )}
          </div>
        );

      case 'task_list':
        return (
            <div className="task-list-wrapper">
                {value && value.length > 0 ? (
                    <div className="task-list">
                        {value.map((task: any, idx: number) => (
                            <div key={task.id || idx} className="task-card">
                                <div className="task-card-header">
                                    <span className={`task-badge ${task.priority.toLowerCase()}`}>{task.priority}</span>
                                    <button 
                                        type="button"
                                        className="task-remove"
                                        onClick={() => {
                                            const newVal = [...value];
                                            newVal.splice(idx, 1);
                                            onChange(newVal);
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                                <p className="task-desc">{task.description}</p>
                                <div className="task-meta">
                                    <span>👤 {task.assignee}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-tasks">No tasks assigned yet.</div>
                )}
                <TaskInput onAdd={(task) => onChange([...(value || []), task])} />
            </div>
        );

      default:
        return <div>Unsupported question type: {question.type}</div>;
    }
  };

  return (
    <div className="question-renderer animate-[questionEnter_200ms_ease-out]">
      <div className="flex flex-col gap-2 relative">
        {/* Question Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-light text-2xl  text-white tracking-tight leading-tight max-w-[85%]">{question.label}</h2>
          {question.required && (
            <div className="flex items-center gap-1.5 text-[10px] text-orange-400/80 font-bold uppercase font-sans tracking-wider shrink-0 mt-2 self-start">
              Required <span className="material-symbols-outlined text-sm">warning</span>
            </div>
          )}
        </div>

        {/* Help Text */}
        {question.helpText && (
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-4 font-sans px-2">
            {question.helpText}
          </p>
        )}

        {/* Input */}
        <div className="mt-2 w-full">
          {renderInput()}
        </div>

        {/* Error Message (skip for photo type since it handles errors inline) */}
        {error && question.type !== 'photo' && (
          <div className="flex items-start space-x-3 bg-[#FF4B4B]/10 p-4 rounded-2xl mt-3">
            <span className="material-symbols-outlined text-[#FF4B4B] text-base mt-0.5">error</span>
            <p className="text-[11px] leading-relaxed text-[#FF4B4B] font-medium font-sans">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};
