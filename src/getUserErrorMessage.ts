export const getUserErrorMessage = (input?: string): string | undefined =>
  isValidationErrorMessage(input)
    ? extractValidationErrorMessage(extractDetailErrorMessage(input))
    : extractDetailErrorMessage(input);

const extractDetailErrorMessage = (input?: string): string | undefined =>
  input?.split(":").at(-1);

const isValidationErrorMessage = (input?: string): boolean =>
  !!input?.includes("validationError");

const extractValidationErrorMessage = (input?: string): string | undefined => {
  if (!input) return;

  const semicolonIndex = input.indexOf(";");
  if (semicolonIndex !== -1)
    return input.substring(input.indexOf("]") + 2, semicolonIndex).trim();
  else return input.substring(input.indexOf("]") + 2).trim();
};
