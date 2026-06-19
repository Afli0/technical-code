import { Injectable } from '@angular/core';
import { FIRST, LAST, ROLES, SortDirection, STATUSES, User } from '../models/table.model';

@Injectable({
  providedIn: 'root',
})
export class DataService {

compareValues(a: unknown, b: unknown, direction: SortDirection): number {
  if (direction === null) return 0;

  let result = 0;

  if (typeof a === 'number' && typeof b === 'number') {
    result = a - b;
  } else if (typeof a === 'string' && typeof b === 'string') {
    const da = Date.parse(a);
    const db = Date.parse(b);
    if (!isNaN(da) && !isNaN(db)) {
      result = da - db;
    } else {
      result = a.localeCompare(b);
    }
  } else {
    result = String(a).localeCompare(String(b));
  }

  return direction === 'asc' ? result : -result;
}


  rowMatchesSearch<T extends object>(
  row: T,
  keys: (keyof T)[],
  search: string,
): boolean {
  if (!search.trim()) return true;
  const needle = search.toLowerCase();
  return keys.some((key) =>
    String(row[key] ?? '').toLowerCase().includes(needle),
  );
}
paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}


rand(max: number): number {  
  return Math.floor(Math.random() * max);
}

 randDate(daysBack = 730): string {
  const d = new Date()
  
  d.setDate(d.getDate() - this.rand(daysBack));
  return d.toISOString().split('T')[0];
}

 generateUsers(count: number): User[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `${FIRST[this.rand(FIRST.length)]} ${LAST[this.rand(LAST.length)]}`,
    email: `user${i + 1}@example.com`,
    role: ROLES[this.rand(ROLES.length)],
    status: STATUSES[this.rand(STATUSES.length)],
    joinedAt: this.randDate(),
  }));
}

}
