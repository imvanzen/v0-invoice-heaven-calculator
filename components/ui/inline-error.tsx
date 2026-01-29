interface InlineErrorProps {
  message: string;
  className?: string;
}

/**
 * Inline error message component for form field validation errors.
 * Uses destructive color from the palette and should be placed directly below input fields.
 */
export function InlineError({ message, className = "" }: InlineErrorProps) {
  return (
    <p className={`text-xs text-destructive ${className}`}>{message}</p>
  );
}
