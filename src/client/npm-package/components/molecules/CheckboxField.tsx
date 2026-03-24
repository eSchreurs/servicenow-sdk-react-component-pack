import React from 'react';
import { FieldWrapper } from '../atoms/FieldWrapper';
import { Checkbox } from '../atoms/Checkbox';
import { BaseFieldProps } from '../../types/index';

// value and displayValue are both 'true' or 'false' string literals.
// onChange is called with 'true' or 'false' for both value and displayValue.

export function CheckboxField({
  name,
  label,
  value,
  mandatory,
  readOnly,
  hasError,
  onChange,
  style,
  className,
}: BaseFieldProps): React.ReactElement {
  const boolValue = value === 'true';

  return (
    <FieldWrapper
      name={name}
      label={label}
      mandatory={mandatory}
      hasError={hasError}
      style={style}
      className={className}
    >
      <Checkbox
        id={name}
        value={boolValue}
        onChange={(checked) => {
          const str = checked ? 'true' : 'false';
          onChange(name, str, str);
        }}
        readOnly={readOnly}
        hasError={hasError}
      />
    </FieldWrapper>
  );
}
