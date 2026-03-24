import React from 'react';
import { FieldWrapper } from '../atoms/FieldWrapper';
import { TextArea } from '../atoms/TextArea';
import { BaseFieldProps } from '../../types/index';

export function TextAreaField({
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
      <TextArea
        id={name}
        value={value}
        onChange={(v) => onChange(name, v, v)}
        readOnly={readOnly}
        mandatory={mandatory}
        maxLength={maxLength}
        hasError={hasError}
      />
    </FieldWrapper>
  );
}
