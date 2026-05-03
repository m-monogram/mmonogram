// Input validation utilities for security

/**
 * Validates a phone number against international format
 * Allows +, digits, spaces, parentheses, and hyphens
 */
export const validatePhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/[\s()\-]/g, '');
  // Must start with optional + followed by 1-15 digits
  return /^\+?[1-9]\d{1,14}$/.test(cleanPhone);
};

/**
 * Sanitizes a phone number for use in URLs
 * Removes all non-digit characters except leading +
 */
export const sanitizePhone = (phone: string): string => {
  const hasPlus = phone.trim().startsWith('+');
  const digits = phone.replace(/[^\d]/g, '');
  return hasPlus ? `+${digits}` : digits;
};

/**
 * Sanitizes text input by trimming and limiting length
 */
export const sanitizeText = (text: string, maxLength: number = 500): string => {
  return text.trim().slice(0, maxLength);
};

/**
 * Validates that a URL starts with an allowed protocol
 */
export const validateWhatsAppUrl = (url: string): boolean => {
  return url.startsWith('https://wa.me/');
};

/**
 * Validates that a URL is a valid tel: link
 */
export const validateTelUrl = (url: string): boolean => {
  return url.startsWith('tel:+') || /^tel:\d/.test(url);
};

/**
 * Safely constructs a WhatsApp URL with validated inputs
 */
export const buildWhatsAppUrl = (phone: string, message: string): string | null => {
  const cleanPhone = sanitizePhone(phone);
  
  if (!validatePhone(cleanPhone)) {
    console.error('Invalid phone number format');
    return null;
  }
  
  const sanitizedMessage = sanitizeText(message, 1000);
  const url = `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(sanitizedMessage)}`;
  
  if (!validateWhatsAppUrl(url)) {
    console.error('Invalid WhatsApp URL generated');
    return null;
  }
  
  return url;
};

/**
 * Safely opens a URL in a new tab with security attributes
 */
export const safeOpenUrl = (url: string, allowedPrefixes: string[]): void => {
  const isAllowed = allowedPrefixes.some(prefix => url.startsWith(prefix));
  
  if (!isAllowed) {
    console.error('URL prefix not in allowlist');
    return;
  }
  
  window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * Safely initiates a phone call
 */
export const safeCall = (phone: string): void => {
  const cleanPhone = sanitizePhone(phone);
  
  if (!validatePhone(cleanPhone)) {
    console.error('Invalid phone number');
    return;
  }
  
  const telUrl = `tel:${cleanPhone}`;
  
  if (!validateTelUrl(telUrl)) {
    console.error('Invalid tel URL');
    return;
  }
  
  window.location.href = telUrl;
};
