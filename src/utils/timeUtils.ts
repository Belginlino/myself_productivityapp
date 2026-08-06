/**
 * Utility functions for time formatting in 12-hour AM/PM format
 */

/**
 * Extracts 24-hour integer (0-23) from any time string (e.g., "08:00 PM", "20:00", "05:46 PM", "9:00 AM")
 */
export const get24HourFromTimeStr = (timeStr?: string): number | null => {
  if (!timeStr || !timeStr.trim()) return null;
  const trimmed = timeStr.trim();

  // AM/PM format matching (e.g. "08:00 PM", "5:46 pm", "9:00 AM")
  const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampmMatch) {
    let h = parseInt(ampmMatch[1], 10);
    const period = ampmMatch[3].toUpperCase();
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return h;
  }

  // 24-hour format matching (e.g. "20:00", "05:46", "09:00")
  const parts = trimmed.split(':');
  if (parts.length >= 2) {
    const h = parseInt(parts[0], 10);
    if (!isNaN(h) && h >= 0 && h <= 23) {
      return h;
    }
  }

  return null;
};

/**
 * Returns total minutes from midnight (0 - 1439) for sorting time strings chronologically.
 */
export const getTaskMinutesFromMidnight = (timeStr?: string): number | null => {
  if (!timeStr || !timeStr.trim()) return null;
  const trimmed = timeStr.trim();

  const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampmMatch) {
    let h = parseInt(ampmMatch[1], 10);
    const m = parseInt(ampmMatch[2], 10);
    const period = ampmMatch[3].toUpperCase();
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  }

  const parts = trimmed.split(':');
  if (parts.length >= 2) {
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (!isNaN(h) && !isNaN(m) && h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return h * 60 + m;
    }
  }

  return null;
};

/**
 * Converts a 24-hour time string (e.g., "21:00", "09:00", "00:30") or existing time string
 * into a formatted 12-hour string with AM/PM (e.g., "09:00 PM", "09:00 AM", "12:30 AM").
 */
export const format12Hour = (timeStr?: string): string => {
  if (!timeStr) return '';
  const trimmed = timeStr.trim();
  if (!trimmed) return '';

  // Check if string is already formatted with AM/PM (e.g. "09:00 PM" or "9:00 PM")
  const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)$/i);
  if (ampmMatch) {
    const h = parseInt(ampmMatch[1], 10);
    const m = ampmMatch[2];
    const ampm = ampmMatch[3].toUpperCase();
    const formattedHours = h < 10 ? `0${h}` : `${h}`;
    return `${formattedHours}:${m} ${ampm}`;
  }

  // Parse "HH:mm" 24-hour format
  const parts = trimmed.split(':');
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1].substring(0, 2);
    if (isNaN(hours)) return timeStr;

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;

    const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
    return `${formattedHours}:${minutes} ${ampm}`;
  }

  return timeStr;
};

/**
 * Helper to convert 12-hour time components (hour 1-12, minute 0-59, period 'AM'|'PM')
 * into 24-hour string "HH:mm" for internal storage / notifications if needed.
 */
export const to24Hour = (hour12: number, minute: number, period: 'AM' | 'PM'): string => {
  let h24 = hour12;
  if (period === 'PM' && h24 < 12) h24 += 12;
  if (period === 'AM' && h24 === 12) h24 = 0;

  const hStr = h24 < 10 ? `0${h24}` : `${h24}`;
  const mStr = minute < 10 ? `0${minute}` : `${minute}`;
  return `${hStr}:${mStr}`;
};

/**
 * Helper to parse "HH:mm" 24h or "hh:mm AM/PM" into { hour12, minute, period }
 */
export const parseTimeTo12Hour = (timeStr?: string): { hour12: number; minute: number; period: 'AM' | 'PM' } => {
  if (!timeStr) return { hour12: 9, minute: 0, period: 'AM' };

  const formatted = format12Hour(timeStr);
  const match = formatted.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (match) {
    return {
      hour12: parseInt(match[1], 10),
      minute: parseInt(match[2], 10),
      period: match[3] as 'AM' | 'PM',
    };
  }

  return { hour12: 9, minute: 0, period: 'AM' };
};
