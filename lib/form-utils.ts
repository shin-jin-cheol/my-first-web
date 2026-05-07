export function getFormString(
  formData: FormData,
  key: string,
  defaultValue = "",
): string {
  return String(formData.get(key) ?? defaultValue).trim();
}

export function getFormNumber(formData: FormData, key: string): number {
  return Number(formData.get(key) ?? 0);
}
