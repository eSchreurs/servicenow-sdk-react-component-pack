import React from 'react';
import { FieldWrapper } from '../atoms/FieldWrapper';
import { TextInput } from '../atoms/TextInput';
import { BaseFieldProps } from '../../types/index';

export function NumberField({
  name,
  label,
  value,
  mandatory,
  readOnly,
  hasError,
  maxLength,
  onChange,
  style,
  className,
}: BaseFieldProps): React.ReactElement {
  return (
    <FieldWrapper
      name={name}
      label={label}
      mandatory={mandatory}
      hasError={hasError}
      style={style}
      className={className}
    >
      <TextInput
        id={name}
        value={value}
        onChange={(v) => onChange(name, v, v)}
        readOnly={readOnly}
        mandatory={mandatory}
        maxLength={maxLength}
        hasError={hasError}
        inputType="number"
      />
    </FieldWrapper>
  );
}
