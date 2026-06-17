import dayjs from 'dayjs';

export function formatTime(time: string, format: string = 'YYYY-MM-DD HH:mm'): string {
  return dayjs(time).format(format);
}

export function formatDate(time: string): string {
  return dayjs(time).format('YYYY-MM-DD');
}

export function generateOrderNo(): string {
  const now = dayjs();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `XD${now.format('YYYYMMDDHHmm')}${random}`;
}

export function generateBatchNo(): string {
  const now = dayjs();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `PC${now.format('YYYYMMDDHHmm')}${random}`;
}

export function getExpiryDays(expiryDate: string): number {
  return dayjs(expiryDate).diff(dayjs(), 'day');
}

export function isExpiringSoon(expiryDate: string, threshold: number = 7): boolean {
  const days = getExpiryDays(expiryDate);
  return days > 0 && days <= threshold;
}

export function isExpired(expiryDate: string): boolean {
  return getExpiryDays(expiryDate) <= 0;
}
