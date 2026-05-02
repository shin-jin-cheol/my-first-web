export function buildDownloadUrl(fileUrl: string, fileName?: string | null) {
  return `${fileUrl}${fileUrl.includes("?") ? "&" : "?"}download=${encodeURIComponent(fileName ?? "attachment")}`;
}