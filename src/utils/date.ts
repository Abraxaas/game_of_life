export function getNowIso() {
  return new Date().toISOString();
}

function toDate(value: string | Date) {
  return value instanceof Date ? new Date(value) : new Date(value);
}

export function toDateKey(value: string | Date) {
  const date = toDate(value);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function toMonthKey(value: string | Date) {
  const date = toDate(value);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');

  return `${year}-${month}`;
}

export function toWeekKey(value: string | Date) {
  const date = toDate(value);
  const normalized = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const dayOfWeek = (normalized.getDay() + 6) % 7;
  normalized.setDate(normalized.getDate() - dayOfWeek);

  return toDateKey(normalized);
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

export function isSameWeek(left?: string, right?: string) {
  if (!left || !right) {
    return false;
  }

  return toWeekKey(left) === toWeekKey(right);
}

export function isSameMonth(left?: string, right?: string) {
  if (!left || !right) {
    return false;
  }

  return toMonthKey(left) === toMonthKey(right);
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
