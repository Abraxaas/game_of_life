export function getNowIso() {
  return new Date().toISOString();
}

export function toDateKey(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function isToday(value?: string) {
  if (!value) {
    return false;
  }

  return toDateKey(value) === toDateKey(new Date());
}

export function addDaysToDateKey(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);

  return toDateKey(date);
}

export function isSameDay(left?: string, right?: string) {
  if (!left || !right) {
    return false;
  }

  return toDateKey(left) === toDateKey(right);
}

export function formatDateTime(value?: string) {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function formatDate(value?: string) {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

export function formatRelativeBackupTime(value?: string) {
  if (!value) {
    return 'Резервная копия еще не создавалась';
  }

  return `Последний экспорт: ${formatDateTime(value)}`;
}
