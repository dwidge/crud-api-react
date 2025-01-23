export const getUserErrorMessage = (input?: string): string | undefined => {
  if (isValidationErrorMessage(input))
    return extractValidationErrorMessage(extractDetailErrorMessage(input));
};

const extractDetailErrorMessage = (input?: string): string | undefined => {
  if (!input) return;

  const m = input.split(":");
  return m[m.length - 1];
};

const isValidationErrorMessage = (input?: string): boolean =>
  !!input?.includes("validationError");

const extractValidationErrorMessage = (input?: string): string | undefined => {
  if (!input) return;

  const semicolonIndex = input.indexOf(";");
  if (semicolonIndex !== -1)
    return input.substring(input.indexOf("]") + 2, semicolonIndex).trim();
  else return input.substring(input.indexOf("]") + 2).trim();
};
