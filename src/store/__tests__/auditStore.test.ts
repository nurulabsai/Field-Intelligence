import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../lib/offlineDb', () => ({
  saveDraftToDb: vi.fn().mockResolvedValue('2020-01-01T00:00:00.000Z'),
  loadDraftFromDb: vi.fn().mockResolvedValue(undefined),
  clearDraftFromDb: vi.fn().mockResolvedValue(undefined),
}));

import { useAuditStore } from '../index';

beforeEach(() => {
  useAuditStore.setState({
    audits: [],
    currentDraft: null,
    currentStep: 0,
    isLoading: false,
    draftRestored: false,
    activeWizardKind: null,
    draftUpdatedAt: null,
  });
});

describe('useAuditStore — draft management', () => {
  it('starts with null draft and step 0', () => {
    const { currentDraft, currentStep } = useAuditStore.getState();
    expect(currentDraft).toBeNull();
    expect(currentStep).toBe(0);
  });

  it('saves draft data immutably (merges with existing)', async () => {
    await useAuditStore.getState().saveDraft({ farmer_name: 'Juma' });
    await useAuditStore.getState().saveDraft({ region: 'Pwani' } as any);

    const draft = useAuditStore.getState().currentDraft;
    expect(draft).toEqual({ farmer_name: 'Juma', region: 'Pwani' });
  });

  it('setStep updates current step', () => {
    useAuditStore.getState().setStep(3);
    expect(useAuditStore.getState().currentStep).toBe(3);
  });

  it('resetDraft clears draft and resets step to 0', async () => {
    await useAuditStore.getState().saveDraft({ farmer_name: 'Test' });
    useAuditStore.getState().setStep(4);
    useAuditStore.getState().resetDraft();

    expect(useAuditStore.getState().currentDraft).toBeNull();
    expect(useAuditStore.getState().currentStep).toBe(0);
  });

  it('saveDraft does not mutate previous draft object', async () => {
    await useAuditStore.getState().saveDraft({ farmer_name: 'A' });
    const firstDraft = useAuditStore.getState().currentDraft;

    await useAuditStore.getState().saveDraft({ farmer_name: 'B' });
    const secondDraft = useAuditStore.getState().currentDraft;

    expect(firstDraft).not.toBe(secondDraft);
    expect(firstDraft!.farmer_name).toBe('A');
    expect(secondDraft!.farmer_name).toBe('B');
  });
});
