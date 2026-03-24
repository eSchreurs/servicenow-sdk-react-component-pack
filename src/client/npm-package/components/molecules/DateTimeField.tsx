import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FieldWrapper } from '../atoms/FieldWrapper';
import { BaseFieldProps } from '../../types/index';

export interface DateTimeFieldProps extends BaseFieldProps {
  mode: 'datetime' | 'date' | 'time';
}

// ---------------------------------------------------------------------------
// Format helpers
// ---------------------------------------------------------------------------

// ServiceNow stores datetimes as 'YYYY-MM-DD HH:mm:ss'.
// Browser datetime-local inputs require 'YYYY-MM-DDTHH:mm'.
function snToInputDatetime(sn: string): string {
  if (!sn) return '';
  // Replace the space between date and time with 'T', drop seconds.
  const match = sn.match(/^(\d{4}-\d{2}-\d{2})\s(\d{2}:\d{2})/);
  if (match) return `${match[1]}T${match[2]}`;
  // If it's already in ISO format, return as-is (truncated to minutes).
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(sn)) return sn.slice(0, 16);
  return sn;
}

// Browser date input requires 'YYYY-MM-DD' — ServiceNow uses the same format.
function snToInputDate(sn: string): string {
  if (!sn) return '';
  const match = sn.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : sn;
}

// ServiceNow time is 'HH:mm:ss'. Browser time input uses 'HH:mm'.
function snToInputTime(sn: string): string {
  if (!sn) return '';
  const match = sn.match(/^(\d{2}:\d{2})/);
  return match ? match[1] : sn;
}

// Browser datetime-local → ServiceNow: 'YYYY-MM-DDTHH:mm' → 'YYYY-MM-DD HH:mm:00'
function inputDatetimeToSn(input: string): string {
  if (!input) return '';
  const match = input.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
  if (match) return `${match[1]} ${match[2]}:00`;
  return input;
}

// Browser date → ServiceNow: same format 'YYYY-MM-DD'
function inputDateToSn(input: string): string {
  return input;
}

// Browser time → ServiceNow: 'HH:mm' → 'HH:mm:00'
function inputTimeToSn(input: string): string {
  if (!input) return '';
  if (/^\d{2}:\d{2}$/.test(input)) return `${input}:00`;
  return input;
}

// ---------------------------------------------------------------------------
// Read-only display helpers
// ---------------------------------------------------------------------------

function formatDatetimeReadOnly(sn: string): string {
  if (!sn) return '';
  // Parse YYYY-MM-DD HH:mm[:ss] or YYYY-MM-DDTHH:mm[:ss]
  const match = sn.match(/^(\d{4})-(\d{2})-(\d{2})[\sT](\d{2}):(\d{2})/);
  if (match) {
    const [, yyyy, mm, dd, hh, min] = match;
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  }
  return sn;
}

function formatDateReadOnly(sn: string): string {
  if (!sn) return '';
  const match = sn.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, yyyy, mm, dd] = match;
    return `${dd}/${mm}/${yyyy}`;
  }
  return sn;
}

function formatTimeReadOnly(sn: string): string {
  if (!sn) return '';
  const match = sn.match(/^(\d{2}:\d{2})/);
  return match ? match[1] : sn;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DateTimeField({
  name,
  label,
  value,
  mandatory,
  readOnly,
  hasError,
  mode,
  onChange,
  style,
  className,
}: DateTimeFieldProps): React.ReactElement {
  const theme = useTheme();

  // Convert stored value → input format
  let inputValue: string;
  if (mode === 'datetime') inputValue = snToInputDatetime(value);
  else if (mode === 'date') inputValue = snToInputDate(value);
  else inputValue = snToInputTime(value);

  // Read-only: render humanised display text
  if (readOnly) {
    let displayText: string;
    if (mode === 'datetime') displayText = formatDatetimeReadOnly(value);
    else if (mode === 'date') displayText = formatDateReadOnly(value);
    else displayText = formatTimeReadOnly(value);

    const readOnlyStyle: React.CSSProperties = {
      display: 'block',
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSizeBase,
      color: theme.colorText,
      lineHeight: theme.lineHeightBase,
      minHeight: theme.inputHeight,
      padding: `0 ${theme.inputPaddingHorizontal}`,
      alignContent: 'center',
    };

    return (
      <FieldWrapper
        name={name}
        label={label}
        mandatory={mandatory}
        hasError={hasError}
        style={style}
        className={className}
      >
        <span id={name} style={readOnlyStyle}>{displayText}</span>
      </FieldWrapper>
    );
  }

  const inputType = mode === 'datetime' ? 'datetime-local' : mode;

  const inputStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    height: theme.inputHeight,
    padding: `0 ${theme.inputPaddingHorizontal}`,
    fontFamily: theme.fontFamily,
    fontSize: theme.fontSizeBase,
    color: theme.colorText,
    backgroundColor: theme.inputBackgroundColor,
    border: `${theme.borderWidth} solid ${hasError ? theme.colorDanger : theme.colorBorder}`,
    borderRadius: theme.borderRadius,
    boxSizing: 'border-box',
    outline: 'none',
    transition: `border-color ${theme.transitionSpeed}`,
  };

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const raw = e.target.value;
    let snValue: string;
    if (mode === 'datetime') snValue = inputDatetimeToSn(raw);
    else if (mode === 'date') snValue = inputDateToSn(raw);
    else snValue = inputTimeToSn(raw);
    onChange(name, snValue, snValue);
  }

  return (
    <FieldWrapper
      name={name}
      label={label}
      mandatory={mandatory}
      hasError={hasError}
      style={style}
      className={className}
    >
      <input
        id={name}
        type={inputType}
        value={inputValue}
        onChange={handleChange}
        required={mandatory}
        style={inputStyle}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = theme.colorBorderFocus;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = hasError ? theme.colorDanger : theme.colorBorder;
        }}
      />
    </FieldWrapper>
  );
}
