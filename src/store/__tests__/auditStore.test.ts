import { describe, it, expect, beforeEach } from 'vitest';
import { useAuditStore } from '../index';

beforeEach(() => {
  useAuditStore.setState({
    audits: [],
    currentDraft: null,
    currentStep: 0,
    isLoading: false,
  });
});

describe('useAuditStore — draft management', () => {
  it('starts with null draft and step 0', () => {
    const { currentDraft, currentStep } = useAuditStore.getState();
    expect(currentDraft).toBeNull();
    expect(currentStep).toBe(0);
  });

  it('saves draft data immutably (merges with existing)', () => {
    useAuditStore.getState().saveDraft({ farmer_name: 'Juma' });
    useAuditStore.getState().saveDraft({ region: 'Pwani' } as any);

    const draft = useAuditStore.getState().currentDraft;
    expect(draft).toEqual({ farmer_name: 'Juma', region: 'Pwani' });
  });

  it('setStep updates current step', () => {
    useAuditStore.getState().setStep(3);
    expect(useAuditStore.getState().currentStep).toBe(3);
  });

  it('resetDraft clears draft and resets step to 0', () => {
    useAuditStore.getState().saveDraft({ farmer_name: 'Test' });
    useAuditStore.getState().setStep(4);
    useAuditStore.getState().resetDraft();

    expect(useAuditStore.getState().currentDraft).toBeNull();
    expect(useAuditStore.getState().currentStep).toBe(0);
  });

  it('saveDraft does not mutate previous draft object', () => {
    useAuditStore.getState().saveDraft({ farmer_name: 'A' });
    const firstDraft = useAuditStore.getState().currentDraft;

    useAuditStore.getState().saveDraft({ farmer_name: 'B' });
    const secondDraft = useAuditStore.getState().currentDraft;

    expect(firstDraft).not.toBe(secondDraft);
    expect(firstDraft!.farmer_name).toBe('A');
    expect(secondDraft!.farmer_name).toBe('B');
  });
});
