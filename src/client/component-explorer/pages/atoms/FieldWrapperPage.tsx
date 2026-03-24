import React from 'react';
import { FieldWrapper } from '../../../npm-package/components/atoms/FieldWrapper';
import { useTheme } from '../../../npm-package/context/ThemeContext';
import { PropTable } from '../../components/PropTable';
import { CodeSnippet } from '../../components/CodeSnippet';
import { PageLayout } from '../../components/PageLayout';

export function FieldWrapperPage(): React.ReactElement {
  const theme = useTheme();

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacingLg,
  };

  // Placeholder input to demonstrate the wrapper
  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: theme.inputHeight,
    padding: `0 ${theme.inputPaddingHorizontal}`,
    border: `${theme.borderWidth} solid ${theme.colorBorder}`,
    borderRadius: theme.borderRadius,
    fontFamily: theme.fontFamily,
    fontSize: theme.fontSizeBase,
    backgroundColor: theme.inputBackgroundColor,
    boxSizing: 'border-box',
  };

  return (
    <PageLayout
      title="FieldWrapper"
      description="Structural wrapper used by every field molecule. Handles label rendering, mandatory asterisk, and error border around its children."
      sections={[
        {
          title: 'Preview',
          children: (
            <div style={rowStyle}>
              <FieldWrapper name="field-default" label="Default field" mandatory={false} hasError={false}>
                <input style={inputStyle} id="field-default" placeholder="Normal state" readOnly />
              </FieldWrapper>

              <FieldWrapper name="field-mandatory" label="Mandatory field" mandatory={true} hasError={false}>
                <input style={inputStyle} id="field-mandatory" placeholder="Mandatory — note the asterisk" readOnly />
              </FieldWrapper>

              <FieldWrapper name="field-error" label="Field with error" mandatory={false} hasError={true}>
                <input style={inputStyle} id="field-error" placeholder="Error state — note the red border" readOnly />
              </FieldWrapper>

              <FieldWrapper name="field-both" label="Mandatory with error" mandatory={true} hasError={true}>
                <input style={inputStyle} id="field-both" placeholder="Both mandatory and error" readOnly />
              </FieldWrapper>
            </div>
          ),
        },
        {
          title: 'Props',
          children: (
            <PropTable
              props={[
                { name: 'name', type: 'string', required: true, description: 'Maps to the htmlFor on the label and the id of the child input.' },
                { name: 'label', type: 'string', required: true, description: 'Label text displayed above the field.' },
                { name: 'mandatory', type: 'boolean', required: true, description: 'When true, renders a red asterisk next to the label.' },
                { name: 'hasError', type: 'boolean', required: true, description: 'When true, applies a red border around the input container.' },
                { name: 'children', type: 'React.ReactNode', required: true, description: 'The input element(s) to render inside the wrapper.' },
                { name: 'style', type: 'React.CSSProperties', description: 'Inline style overrides for the outer wrapper.' },
                { name: 'className', type: 'string', description: 'CSS class name override for the outer wrapper.' },
              ]}
            />
          ),
        },
        {
          title: 'Usage',
          children: (
            <CodeSnippet
              code={`import { FieldWrapper } from 'servicenow-sdk-react-component-pack';

<FieldWrapper
  name="first-name"
  label="First Name"
  mandatory={true}
  hasError={false}
>
  <input id="first-name" type="text" />
</FieldWrapper>

// With error state
<FieldWrapper
  name="email"
  label="Email"
  mandatory={true}
  hasError={true}
>
  <input id="email" type="email" />
</FieldWrapper>`}
            />
          ),
        },
      ]}
    />
  );
}
