import { SubscriptionTier } from '../types';

export const FREE_TIER_NOTE_LIMIT = 50;
export const FREE_TIER_DAILY_GEMINI_LIMIT = 25;

export interface NoteLimitStatus {
  allowed: boolean;
  current: number;
  max: number;
  isUnlimited: boolean;
}

export function checkNoteCreationLimit(
  tier: SubscriptionTier | undefined,
  currentCount: number
): NoteLimitStatus {
  const currentTier = tier || 'free';
  if (currentTier === 'pro' || currentTier === 'enterprise') {
    return {
      allowed: true,
      current: currentCount,
      max: Infinity,
      isUnlimited: true,
    };
  }

  const allowed = currentCount < FREE_TIER_NOTE_LIMIT;
  return {
    allowed,
    current: currentCount,
    max: FREE_TIER_NOTE_LIMIT,
    isUnlimited: false,
  };
}

export interface GeminiLimitStatus {
  allowed: boolean;
  count: number;
  max: number;
  remaining: number;
  isUnlimited: boolean;
}

export function getDailyGeminiLimitStatus(
  userId: string,
  tier: SubscriptionTier | undefined
): GeminiLimitStatus {
  const currentTier = tier || 'free';
  if (currentTier === 'pro' || currentTier === 'enterprise') {
    return {
      allowed: true,
      count: 0,
      max: Infinity,
      remaining: Infinity,
      isUnlimited: true,
    };
  }

  const todayKey = `fiat_gemini_usage_${userId || 'guest'}_${new Date().toISOString().slice(0, 10)}`;
  const stored = localStorage.getItem(todayKey);
  const count = stored ? parseInt(stored, 10) || 0 : 0;
  const remaining = Math.max(0, FREE_TIER_DAILY_GEMINI_LIMIT - count);

  return {
    allowed: count < FREE_TIER_DAILY_GEMINI_LIMIT,
    count,
    max: FREE_TIER_DAILY_GEMINI_LIMIT,
    remaining,
    isUnlimited: false,
  };
}

export function recordGeminiCall(userId: string): number {
  const todayKey = `fiat_gemini_usage_${userId || 'guest'}_${new Date().toISOString().slice(0, 10)}`;
  const stored = localStorage.getItem(todayKey);
  const count = (stored ? parseInt(stored, 10) || 0 : 0) + 1;
  localStorage.setItem(todayKey, count.toString());
  return count;
}

export function canAccessCollaboratorSharing(tier: SubscriptionTier | undefined): boolean {
  return tier === 'pro' || tier === 'enterprise';
}

export function canAccessRichExports(tier: SubscriptionTier | undefined): boolean {
  return tier === 'pro' || tier === 'enterprise';
}
