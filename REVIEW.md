# REVIEW.md — Code Review: `UserList.ts`

## Issues Found

### 1. `users: any[] = []` and `filter: any` — no types at all

**Why it's a problem:** `any` disables TypeScript's type checker entirely. The compiler can't catch passing a `Post` object to a method that expects a `User`, or accessing a property that doesn't exist. You lose autocomplete, refactor safety, and the entire value of TypeScript strict mode.

**Fix:** Define an interface and use it throughout.

```typescript
interface User {
  id: string;
  name: string;
}

class UserList {
  users: User[] = [];
  filter: string | null = null;
}
```

---

### 2. `constructor(data)` — untyped parameter

**Why it's a problem:** `data` has an implicit `any` type, so TypeScript can't verify that the caller passes valid user data. With `strict` mode enabled this is a compile error.

**Fix:**

```typescript
constructor(data: User[]) {
  this.users = data;
}
```

---

### 3. `this.filter == null` — loose equality

**Why it's a problem:** `==` coerces both sides, so `null == undefined` is `true`. While that happens to work here, it's a code-style landmine — future maintainers may not realise `undefined` is included in the guard. `===` makes intent explicit and avoids accidental coercion elsewhere.

**Fix:** Use strict equality: `if (this.filter === null) return this.users;`

---

### 4. `u.name == this.filter` — loose equality again, plus case sensitivity

**Why it's a problem:** Same loose-equality issue as above. Also, string comparison is case-sensitive by default, so `"Alice"` won't match `"alice"`. This is almost certainly not what callers expect from a search/filter.

**Fix:**

```typescript
return this.users.filter(
  (u) => u.name.toLowerCase() === this.filter!.toLowerCase()
);
```

---

### 5. `const data = res.json();` — missing `await`

**Why it's a problem:** `Response.json()` returns a `Promise<unknown>`, not the parsed object. Without `await`, `this.users` is assigned a `Promise` instead of the array, causing every subsequent access to the users list to silently fail or throw at runtime. TypeScript catches this with `strict` + `"noImplicitAny"`, but only if the return type is properly annotated.

**Fix (the most critical bug in the file):**

```typescript
async loadUsers(): Promise<void> {
  const res = await fetch('/api/users');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: User[] = await res.json() as User[];
  this.users = data;
}
```

---

### 6. `loadUsers` has no error handling

**Why it's a problem:** If the network request fails or the server returns a non-2xx status, `fetch` resolves (it only rejects on network error, not HTTP errors) and `res.json()` may throw on a non-JSON response. The class has no way to signal failure to its caller — errors are swallowed silently.

**Fix:** Check `res.ok` and wrap in try/catch or let the promise reject with a meaningful error (shown above in fix for issue 5).

---

### 7. `el.innerHTML = \`${user.name}\`` — XSS vulnerability

**Why it's a problem:** If `user.name` contains characters like `<script>alert(1)</script>`, they are injected into the DOM as raw HTML. This is a cross-site scripting vulnerability — it matters whenever user data originates from untrusted input (i.e. always in a real application).

**Fix:** Use `textContent` for plain text, or sanitise before inserting:

```typescript
renderUser(user: User): HTMLDivElement {
  const el = document.createElement('div');
  el.textContent = user.name; 
  return el;
}
```

---

### 8. `deleteUser` — O(n²) `indexOf` inside `forEach`

**Why it's a problem:** After filtering, the code loops over every remaining user (`forEach`) and inside that loop calls `indexOf(u)`, which itself iterates the array to find the position. This is O(n²) — for 1 000 users that's 1 000 000 comparisons for a single delete. It also mutates `index` on the user objects, creating a side effect that makes objects harder to reason about and breaks referential equality checks.

**Fix:** Use the `forEach` index parameter directly — it's O(n):

```typescript
deleteUser(id: string): void {
  this.users = this.users
    .filter((u) => u.id !== id)
    .map((u, index) => ({ ...u, index })); 
}
```

Or, if you don't actually need `index` persisted on the object, drop the `forEach` entirely.

---

### 9. `renderUser` and `deleteUser` — untyped parameters

**Why it's a problem:** Both accept implicit `any`. Same issue as the constructor — TypeScript can't catch callers passing the wrong shape.

**Fix:**

```typescript
renderUser(user: User): HTMLDivElement { … }
deleteUser(id: string): void { … }
```

---

## Summary — Suggested concrete fixes

| # | Issue | Fix |
|---|-------|-----|
| 5 | Missing `await` on `res.json()` — **runtime data corruption** | Add `await`; add `res.ok` guard |
| 7 | `innerHTML` with user data — **XSS** | Switch to `textContent` |
| 8 | O(n²) `indexOf` in `deleteUser` | Use `forEach` callback index |
