import { supabase } from './supabase';

export const PLANS = {
  FREE: 'free',
  SINGLE_DOWNLOAD: 'single_download',
  MONTHLY: 'monthly_subscription',
  QUARTERLY: 'quarterly_subscription',
  ANNUAL: 'annual_subscription'
};

/**
 * Normalizes the user profile into a Plan Context that respects expirations.
 * @param {Object} profile The raw user profile from the database
 * @returns {Object} normalized plan context
 */
export function getUserPlanContext(profile) {
  if (!profile) return { tier: PLANS.FREE, isExpired: false, downloadsUsed: 0 };
  
  let tier = profile.subscription_tier || PLANS.FREE;
  let isExpired = false;
  const downloadsUsed = profile.downloads_used || 0;

  // Check expiration for recurring plans
  if (tier === PLANS.MONTHLY || tier === PLANS.QUARTERLY || tier === PLANS.ANNUAL) {
    if (profile.plan_expires_at) {
      const expiresAt = new Date(profile.plan_expires_at);
      if (new Date() > expiresAt) {
        tier = PLANS.FREE;
        isExpired = true;
      }
    }
  }

  return { tier, isExpired, downloadsUsed, rawExpiresAt: profile.plan_expires_at };
}

/**
 * Determines if the user is allowed to initiate a download of a PDF.
 */
export function canDownloadPdf(planContext) {
  if (planContext.tier === PLANS.SINGLE_DOWNLOAD) {
    if (planContext.downloadsUsed >= 1) return false;
    return true;
  }
  return true;
}

/**
 * Validates if the user is allowed to download a SPECIFIC template.
 */
export function canDownloadTemplate(planContext, isPremiumTemplate) {
  if (planContext.tier === PLANS.FREE) {
    if (isPremiumTemplate) return false;
    return true;
  }
  
  // Single download and active subscriptions can download any template
  return true;
}

/**
 * Validates if the user is allowed to download a PDF WITHOUT a watermark.
 */
export function hasNoWatermark(planContext) {
  if (planContext.tier === PLANS.FREE) return false;
  return true;
}

/**
 * Validates if the user can use multi-page functionality
 */
export function canUseMultiPage(planContext) {
  if (planContext.tier === PLANS.FREE) return false;
  if (planContext.tier === PLANS.SINGLE_DOWNLOAD && planContext.downloadsUsed >= 1) return false;
  return true;
}

export function getBlockedMessage(planContext) {
  if (planContext.tier === PLANS.SINGLE_DOWNLOAD && planContext.downloadsUsed >= 1) {
    return 'You have used your single download. Upgrade to Monthly for unlimited downloads';
  }
  if (planContext.isExpired) {
    return 'Your plan has expired. Please renew to continue'; 
  }
  return 'Upgrade your plan to access this feature';
}

/**
 * Records an access log in the database (Server-Side)
 */
export async function logAccessAttempt(adminSupabase, userId, feature, status, message) {
  try {
    await adminSupabase.from('access_logs').insert([{
      user_id: userId,
      feature,
      status, // 'granted' or 'blocked'
      message
    }]);
  } catch (error) {
    console.error('Failed to log access attempt:', error);
  }
}
