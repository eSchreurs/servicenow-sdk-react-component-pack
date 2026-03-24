// Pure date/time conversion helpers for ServiceNow ↔ browser input formats.
// No React or component dependencies — safe to import anywhere.

export type DateMode = 'datetime' | 'date' | 'time';

// ---------------------------------------------------------------------------
// SN stored value → browser <input> value
// ---------------------------------------------------------------------------

export function snToInput(sn: string, mode: DateMode): string {
  if (!sn) return '';
  if (mode === 'datetime') {
    const match = sn.match(/^(\d{4}-\d{2}-\d{2})\s(\d{2}:\d{2})/);
    if (match) return `${match[1]}T${match[2]}`;
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(sn)) return sn.slice(0, 16);
    return sn;
  }
  if (mode === 'date') {
    const match = sn.match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : sn;
  }
  // time
  const match = sn.match(/^(\d{2}:\d{2})/);
  return match ? match[1] : sn;
}

// ---------------------------------------------------------------------------
// Browser <input> value → SN stored value
// ---------------------------------------------------------------------------

export function inputToSn(input: string, mode: DateMode): string {
  if (!input) return '';
  if (mode === 'datetime') {
    const match = input.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
    return match ? `${match[1]} ${match[2]}:00` : input;
  }
  if (mode === 'date') return input;
  // time
  return /^\d{2}:\d{2}$/.test(input) ? `${input}:00` : input;
}

// ---------------------------------------------------------------------------
// SN stored value → human-readable read-only display string
// ---------------------------------------------------------------------------

export function formatReadOnly(sn: string, mode: DateMode): string {
  if (!sn) return '';
  if (mode === 'datetime') {
    const match = sn.match(/^(\d{4})-(\d{2})-(\d{2})[\sT](\d{2}):(\d{2})/);
    if (match) {
      const [, yyyy, mm, dd, hh, min] = match;
      return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
    }
    return sn;
  }
  if (mode === 'date') {
    const match = sn.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, yyyy, mm, dd] = match;
      return `${dd}/${mm}/${yyyy}`;
    }
    return sn;
  }
  // time
  const match = sn.match(/^(\d{2}:\d{2})/);
  return match ? match[1] : sn;
}
