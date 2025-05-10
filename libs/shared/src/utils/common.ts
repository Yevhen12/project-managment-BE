export function stripTime(date: Date): Date {
  return new Date(date.toISOString().split('T')[0]);
}

export function extractKeyFromUrl(url: string): string {
  const urlParts = url.split('/');
  return urlParts.slice(3).join('/');
}
