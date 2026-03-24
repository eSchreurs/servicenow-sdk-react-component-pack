import React from 'react';
import { FieldWrapper } from '../atoms/FieldWrapper';
import { SelectInput } from '../atoms/SelectInput';
import { BaseFieldProps, ChoiceEntry } from '../../types/index';

export interface ChoiceFieldProps extends BaseFieldProps {
  choices: ChoiceEntry[];
  dependentOnField?: string;
  dependentValue?: string;
}

export function ChoiceField({
  name,
  label,
  value,
  displayValue,
  mandatory,
  readOnly,
  hasError,
  choices,
  dependentValue,
  onChange,
  style,
  className,
}: ChoiceFieldProps): React.ReactElement {
  // Filter visible choices:
  // Show entries where choice.dependentValue matches the current dependentValue prop,
  // plus entries with no dependentValue (i.e. undefined or empty string).
  // Matching uses stored value only — never display value.
  const visibleChoices = choices.filter((c) => {
    if (!c.dependentValue) return true;
    return c.dependentValue === dependentValue;
  });

  // Always include a blank option unless mandatory AND value is non-empty.
  const showBlank = !(mandatory && value !== '');

  const options = visibleChoices.map((c) => ({ value: c.value, label: c.label }));

  function handleChange(selected: string): void {
    const match = visibleChoices.find((c) => c.value === selected);
    const label = match ? match.label : '';
    onChange(name, selected, label);
  }

  // Read-only: SelectInput already renders the display label in read-only mode.
  // Pass all visible choices so it can look up the label.
  return (
    <FieldWrapper
      name={name}
      label={label}
      mandatory={mandatory}
      hasError={hasError}
      style={style}
      className={className}
    >
      <SelectInput
        id={name}
        value={value}
        options={options}
        onChange={handleChange}
        readOnly={readOnly}
        mandatory={mandatory}
        hasError={hasError}
        placeholder={showBlank ? '' : undefined}
      />
    </FieldWrapper>
  );
}
