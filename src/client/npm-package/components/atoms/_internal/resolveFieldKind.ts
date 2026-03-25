// Resolves the correct input kind for a Field based on metadata.
// Lives here so the resolution logic is independently readable and testable.

export type InputKind =
  | 'textinput'
  | 'number'
  | 'textarea'
  | 'checkbox'
  | 'choice'
  | 'reference'
  | 'datetime'
  | 'date'
  | 'time';

export function resolveFieldKind(
  type: string,
  isChoiceField: boolean | undefined,
  maxLength: number | undefined,
): InputKind {
  if (isChoiceField) return 'choice';
  switch (type) {
    case 'string':          return maxLength !== undefined && maxLength > 255 ? 'textarea' : 'textinput';
    case 'text':
    case 'html':
    case 'translated_text': return 'textarea';
    case 'integer':
    case 'decimal':
    case 'float':
    case 'currency':        return 'number';
    case 'boolean':         return 'checkbox';
    case 'reference':       return 'reference';
    case 'glide_date_time': return 'datetime';
    case 'glide_date':      return 'date';
    case 'glide_time':      return 'time';
    default:                return 'textinput';
  }
}
