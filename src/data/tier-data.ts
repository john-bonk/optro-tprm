import type { Tier, TierInfo } from '../types';

export const tierData: Record<Tier, TierInfo> = {
  1: { label: 'Tier 1', name: 'Critical', confidence: '94% confidence', subtitle: 'Re-evaluated from Data Classification', pillClass: 'pill-critical' },
  2: { label: 'Tier 2', name: 'Standard', confidence: '87% confidence', subtitle: 'Based on 4 policy signals',              pillClass: 'pill-standard' },
  3: { label: 'Tier 3', name: 'Low Risk', confidence: '91% confidence', subtitle: 'Re-evaluated from Data Classification', pillClass: 'pill-low' },
};
