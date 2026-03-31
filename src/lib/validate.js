/**
 * Input Validation & Sanitization Library
 *
 * Guards all API routes against:
 *   - XSS / script injection
 *   - Oversized payloads
 *   - Missing required fields
 *   - Invalid URLs / file types
 *   - Injection via Razorpay ID format
 *
 * Also provides standardized success/error response shapes.
 */

// ─── TEXT SANITIZATION ───────────────────────────────────────────────────────

/**
 * Strips all HTML and dangerous patterns from plain-text user input.
 * Enforces a maximum length AFTER stripping to prevent bypass via padding.
 *
 * @param {string} input
 * @param {number} [maxLength=10000]
 * @returns {string}
 */
export function sanitizeText(input, maxLength = 10_000) {
  if (typeof input !== 'string') return '';

  return input
    // 1. Hard cap the raw input first (DoS protection)
    .substring(0, maxLength * 3)
    // 2. Remove complete <script> blocks
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    // 3. Strip all remaining HTML tags
    .replace(/<[^>]*>/g, '')
    // 4. Block javascript: URI scheme
    .replace(/javascript\s*:/gi, '')
    // 5. Block inline event handlers (onclick=, onload=, etc.)
    .replace(/on[a-z]+\s*=/gi, '')
    // 6. Remove null bytes
    .replace(/\0/g, '')
    .trim()
    // 7. Final length cap AFTER stripping (key fix vs. original)
    .substring(0, maxLength);
}

/**
 * Sanitizes rich HTML (from TipTap editor).
 * Removes dangerous elements while allowing safe formatting tags.
 *
 * @param {string} html
 * @param {number} [maxLength=50000]
 * @returns {string}
 */
export function sanitizeHtml(html, maxLength = 50_000) {
  if (typeof html !== 'string') return '';
  return html
    .substring(0, maxLength * 2)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
    .replace(/on[a-z]+\s*=/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/\0/g, '')
    .trim()
    .substring(0, maxLength);
}

// ─── URL VALIDATION ──────────────────────────────────────────────────────────

/**
 * Validates a LinkedIn profile URL.
 * Accepts: https://www.linkedin.com/in/username
 *
 * @param {string} url
 * @returns {{ valid: boolean, url?: string, error?: string }}
 */
export function validateLinkedInUrl(url) {
  if (typeof url !== 'string' || url.trim().length === 0) {
    return { valid: false, error: 'URL is required' };
  }

  const trimmed = url.trim();

  if (trimmed.length > 500) {
    return { valid: false, error: 'URL is too long (max 500 characters)' };
  }

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, error: 'Invalid URL format. Please paste the full LinkedIn profile URL.' };
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return { valid: false, error: 'URL must start with https://' };
  }

  // Allow linkedin.com and any subdomain (www., in., etc.)
  if (!parsed.hostname.endsWith('linkedin.com')) {
    return { valid: false, error: 'Please enter a valid LinkedIn profile URL (linkedin.com/in/...)' };
  }

  if (!parsed.pathname.toLowerCase().includes('/in/')) {
    return { valid: false, error: 'URL must be a LinkedIn profile URL. Example: linkedin.com/in/yourname' };
  }

  // Basic path segment length check (username must be present)
  const segments = parsed.pathname.split('/').filter(Boolean);
  const inIndex = segments.findIndex(s => s.toLowerCase() === 'in');
  if (inIndex === -1 || !segments[inIndex + 1] || segments[inIndex + 1].length < 2) {
    return { valid: false, error: 'LinkedIn profile URL must include a username (e.g., linkedin.com/in/yourname)' };
  }

  return { valid: true, url: trimmed };
}

// ─── API INPUT VALIDATORS ────────────────────────────────────────────────────

/**
 * Validates cover letter generation payload.
 */
export function validateCoverLetterInput(body) {
  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }

  const errors = [];

  if (!body.resumeData || typeof body.resumeData !== 'object' || Array.isArray(body.resumeData)) {
    errors.push('resumeData must be an object');
  }

  if (typeof body.jobDescription !== 'string') {
    errors.push('jobDescription must be a string');
  } else if (body.jobDescription.trim().length < 20) {
    errors.push('jobDescription is too short (minimum 20 characters)');
  } else if (body.jobDescription.length > 8_000) {
    errors.push('jobDescription is too long (maximum 8,000 characters)');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates bullet point enhancement payload.
 */
export function validateEnhanceBulletsInput(body) {
  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }

  const errors = [];

  if (typeof body.description !== 'string') {
    errors.push('description must be a string');
  } else if (body.description.trim().length < 10) {
    errors.push('description is too short (minimum 10 characters)');
  } else if (body.description.length > 5_000) {
    errors.push('description is too long (maximum 5,000 characters)');
  }

  // Optional fields just need to be strings if provided
  if (body.company !== undefined && typeof body.company !== 'string') {
    errors.push('company must be a string');
  }
  if (body.title !== undefined && typeof body.title !== 'string') {
    errors.push('title must be a string');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates skill suggestion payload.
 */
export function validateSuggestSkillsInput(body) {
  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }

  const errors = [];

  if (body.jobTitle !== undefined) {
    if (typeof body.jobTitle !== 'string') errors.push('jobTitle must be a string');
    else if (body.jobTitle.length > 200) errors.push('jobTitle must not exceed 200 characters');
  }

  if (body.summary !== undefined) {
    if (typeof body.summary !== 'string') errors.push('summary must be a string');
    else if (body.summary.length > 3_000) errors.push('summary must not exceed 3,000 characters');
  }

  if (body.experience !== undefined && !Array.isArray(body.experience)) {
    errors.push('experience must be an array');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates Razorpay order creation payload.
 */
export function validateOrderInput(body) {
  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }

  const errors = [];
  const VALID_PLANS = [
    'single_download',
    'monthly_subscription',
    'quarterly_subscription',
    'annual_subscription',
  ];

  if (body.amount === undefined || body.amount === null) {
    errors.push('amount is required');
  } else if (typeof body.amount !== 'number' || !isFinite(body.amount)) {
    errors.push('amount must be a finite number');
  } else if (body.amount <= 0) {
    errors.push('amount must be greater than 0');
  } else if (body.amount > 100_000) {
    errors.push('amount must not exceed ₹1,00,000');
  }

  if (body.planId !== undefined && !VALID_PLANS.includes(body.planId)) {
    errors.push(`planId must be one of: ${VALID_PLANS.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates Razorpay payment verification payload.
 */
export function validateVerifyInput(body) {
  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }

  const errors = [];

  if (!body.razorpay_order_id)   errors.push('razorpay_order_id is required');
  if (!body.razorpay_payment_id) errors.push('razorpay_payment_id is required');
  if (!body.razorpay_signature)  errors.push('razorpay_signature is required');
  if (!body.userId)              errors.push('userId is required');
  if (!body.planId)              errors.push('planId is required');

  // Format guards catch injection / malformed IDs before HMAC comparison
  if (body.razorpay_order_id && !/^order_[A-Za-z0-9]{14,}$/.test(body.razorpay_order_id)) {
    errors.push('razorpay_order_id format is invalid');
  }
  if (body.razorpay_payment_id && !/^pay_[A-Za-z0-9]{14,}$/.test(body.razorpay_payment_id)) {
    errors.push('razorpay_payment_id format is invalid');
  }
  // Signature is a 64-char hex string
  if (body.razorpay_signature && !/^[a-f0-9]{64}$/.test(body.razorpay_signature)) {
    errors.push('razorpay_signature format is invalid');
  }

  return { valid: errors.length === 0, errors };
}

// ─── FILE VALIDATION ─────────────────────────────────────────────────────────

/** Maximum allowed PDF upload size: 10 MB */
export const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * Validates an uploaded PDF file from FormData.
 * @param {File} file
 * @returns {{ valid: boolean, error?: string }}
 */
export function validatePdfFile(file) {
  if (!file || typeof file.size !== 'number') {
    return { valid: false, error: 'No file was provided' };
  }
  if (file.size === 0) {
    return { valid: false, error: 'The uploaded file is empty' };
  }
  if (file.type !== 'application/pdf') {
    return { valid: false, error: `Only PDF files are accepted (received: ${file.type || 'unknown type'})` };
  }
  if (file.size > MAX_PDF_SIZE_BYTES) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(1);
    return { valid: false, error: `File is too large (${sizeMB} MB). Maximum allowed size is 10 MB` };
  }
  return { valid: true };
}

// ─── RESPONSE HELPERS ────────────────────────────────────────────────────────

/**
 * Standard error response shape.
 * Use for every 4xx / 5xx response across all API routes.
 *
 * @param {string} message   — Human-readable error description
 * @param {string} requestId — Correlation ID for support tracing
 * @param {Record<string,unknown>} [extra] — Additional fields (e.g. { code: 'RATE_LIMITED' })
 */
export function errorResponse(message, requestId, extra = {}) {
  return {
    success: false,
    error: message,
    requestId,
    timestamp: new Date().toISOString(),
    ...extra,
  };
}

/**
 * Standard success response shape.
 * Spreads data fields at the top level alongside metadata.
 *
 * @param {Record<string,unknown>} data
 * @param {string} requestId
 */
export function successResponse(data, requestId) {
  return {
    success: true,
    ...data,
    requestId,
    timestamp: new Date().toISOString(),
  };
}
