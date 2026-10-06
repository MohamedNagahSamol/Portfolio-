import i18n from '../i18n/config.js';

/**
 * Robust locale-aware date formatter using Intl.DateTimeFormat.
 * Dynamically switches between 'ar-EG' and 'en-US' based on active locale.
 *
 * @param {string|Date|number} dateInput - Raw date string or Date object
 * @param {Intl.DateTimeFormatOptions} [options] - Intl formatting options
 * @param {string|object} [langOrI18n] - Optional language code ('ar', 'en') or i18n instance
 * @returns {string} Formatted localized date string, or empty string if input is invalid
 */
export function formatDate(dateInput, options = {}, langOrI18n) {
  try {
    if (!dateInput) return '';
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (isNaN(date.getTime())) return '';

    let lang = 'en';
    if (typeof langOrI18n === 'string') {
      lang = langOrI18n;
    } else if (langOrI18n?.language) {
      lang = langOrI18n.language;
    } else if (i18n?.language) {
      lang = i18n.language;
    }

    const locale = lang.startsWith('ar') ? 'ar-EG' : 'en-US';
    return date.toLocaleDateString(locale, options);
  } catch {
    return '';
  }
}

/**
 * Standard Month + Year formatter (e.g. "Mar 2024" / "مارس ٢٠٢٤")
 * Used in Certificates and Experience sections.
 */
export function formatMonthYear(dateInput, langOrI18n) {
  try {
    return formatDate(dateInput, { year: 'numeric', month: 'short' }, langOrI18n);
  } catch {
    return '';
  }
}

/**
 * Standard Full Date formatter (e.g. "Mar 15, 2024" / "١٥ مارس ٢٠٢٤")
 * Used in Blog section.
 */
export function formatFullDate(dateInput, langOrI18n) {
  try {
    return formatDate(dateInput, { year: 'numeric', month: 'short', day: 'numeric' }, langOrI18n);
  } catch {
    return '';
  }
}

/**
 * Standard Full Date + Time formatter (e.g. "Mar 15, 2024, 04:30 PM" / "١٥ مارس ٢٠٢٤، ٠٤:٣٠ م")
 * Used in Admin Messages list.
 */
export function formatDateTime(dateInput, langOrI18n) {
  try {
    return formatDate(
      dateInput,
      { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
      langOrI18n
    );
  } catch {
    return '';
  }
}

export default {
  formatDate,
  formatMonthYear,
  formatFullDate,
  formatDateTime,
};
