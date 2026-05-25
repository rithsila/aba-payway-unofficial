export function generateTransactionId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `EA${timestamp}${random}`.substring(0, 20);
}

export function getABATimestamp(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds())
  );
}

export function formatPhoneForABA(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/[\s-]/g, "");
  if (cleaned.startsWith("+855")) return "0" + cleaned.slice(4);
  if (cleaned.startsWith("855")) return "0" + cleaned.slice(3);
  return cleaned;
}

export function getQRExpiration(): Date {
  return new Date(Date.now() + 15 * 60 * 1000);
}
