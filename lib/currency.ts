export const formatCurrency = (
  value: number,
  isBlurred: boolean = false,
  options?: Intl.NumberFormatOptions
) => {
  if (isBlurred) {
    return "••••••";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
};
