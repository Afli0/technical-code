# DECISIONS.md

## Q1 — Component Structure & Folder Organization

The component is organized around a single responsibility principle: each file does exactly one thing, and related concerns live next to each other rather than sorted by type. Rather than a flat `components/` dump, I grouped by feature — so the data table and everything belonging to it (its template, styles, types, and spec) sit in their own folder under `src/app/data-table/`. Public-facing contracts (input/output types, column definition interfaces) live in a `models/` subfolder within the feature, so a consumer can import just the interface without pulling in the component itself.

I kept the component class thin deliberately. Data transformation logic — sorting, filtering, pagination math — lives in a dedicated service (`data-table.service.ts`) rather than inside the component. This made unit testing straightforward: I could test transformation logic without standing up a component at all. The template focuses purely on projection and event binding; it contains no business logic.

I chose a standalone component (`standalone: true`) over an NgModule for the same reason I'd reach for a small function over a class: it carries less ceremony and makes the dependency graph explicit at the declaration site. Any consumer can import it directly without registering a module.

---

## Q2 — Trade-offs & What I Would Do Differently

The most deliberate trade-off was between flexibility and simplicity in the column definition API. I chose a declarative configuration object (`ColumnDef[]`) rather than content-projected `<ng-template>` slots because it produces cleaner consumer code for the common case. The cost is that highly custom cell rendering requires an escape hatch — I added an optional `cellTemplate` reference, but it is not as ergonomic as a slot-based API would be.

I also made pagination client-side only. This was the right call for a self-contained assessment component, but it means the component owns the full dataset in memory. In production I would invert this: the component would emit page/sort/filter events and accept a `totalCount` input, letting the parent or a backend handle the actual data slice.

With more time I would add proper virtual scrolling from `@angular/cdk/scrolling`, replace the hand-rolled sort logic with a more robust comparator that handles `null`, `undefined`, and locale-aware string comparison, and audit the change detection strategy — switching to `OnPush` throughout and ensuring all inputs are immutable.

---

## Q3 — Failure Points at Scale

At 10,000 rows, client-side filtering and sorting become the first bottleneck. Both operations run synchronously on every change, blocking the main thread. The fix is to move them into a Web Worker or, better, treat the component as a pure view layer that receives pre-filtered, pre-sorted pages from a server.

Dynamic column definitions introduce a second class of problems. If column definitions change at runtime (columns added or removed), Angular's `*ngFor` will re-render the entire header and all cells unless columns are tracked by a stable identity. Without `trackBy`, this causes noticeable repaints even at modest row counts.

Server-side rendering (SSR with Angular Universal) breaks any code that touches `document` or `window` directly — for example, measuring column widths for auto-sizing. I guarded those paths with `isPlatformBrowser`, but a full SSR-safe implementation would also need to defer scroll listeners and intersection observers until the browser context is confirmed.

Finally, accessibility degrades at scale: a table with 10,000 rows and no row virtualization will produce a DOM that screen readers struggle to traverse. Proper `aria-rowcount` / `aria-rowindex` attributes and virtual rendering are both required to keep the component usable.

---

## Q4 — Supporting Both Angular and React

The cleanest path is to extract all logic into a framework-agnostic core — a plain TypeScript module that handles sorting, filtering, and pagination — and then write thin framework adapters on top. The Angular adapter wraps the core in a service and a standalone component; the React adapter wraps it in a custom hook and a functional component.

The build output would need to ship separate entry points: `dist/angular/` and `dist/react/`, each with their own `package.json` exports field pointing to the correct bundle. Consumers import from `my-table/angular` or `my-table/react` respectively, so tree-shaking drops the unused adapter.

The column definition API should be pure data — no Angular `TemplateRef`, no React `ReactNode` — at the core level. Framework-specific rendering is handled in the adapter layer through each framework's native projection mechanism (`ng-template` in Angular, render props or `ReactNode` in React). This keeps the public API consistent while letting each adapter feel native to its ecosystem.

---

## Q5 — Bug Encountered: Stale Sort State After Input Data Replacement

When the parent component replaced the entire `rows` input reference (a common pattern after a data fetch), the displayed sort indicator and the actual row order fell out of sync. The table visually showed column A as sorted ascending, but the new data was rendered in its original, unsorted order.

The root cause was that the sort state was held inside the component and applied reactively, but the input change triggered a full re-render of the row array before the sort pipe had a chance to run on the new data. The sort was being applied to the previous reference, which was already gone.

The fix was to stop storing raw rows in local state and instead derive the displayed rows through a single computed signal that combines `rows`, `activeSortColumn`, and `sortDirection` as inputs. Whenever any of the three changes, the derived value recomputes atomically. There is no intermediate state that can go stale because there is no intermediate state at all — just one transformation from inputs to output.