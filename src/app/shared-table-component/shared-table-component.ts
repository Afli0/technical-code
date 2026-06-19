import { Component, Input, SimpleChanges } from "@angular/core";
import { ColumnDef, PaginationState, SortState, TableConfig } from "../../models/table.model";
import { DataService } from "../data-service";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";


@Component({
  selector: 'app-shared-table-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './shared-table-component.html',
  styleUrl: './shared-table-component.scss',
})
export class SharedTableComponent<T extends object>  {
  @Input() rows: T[] = [];
  @Input() columns: ColumnDef<T>[] = [];
  @Input() loading = false;
  @Input() config: TableConfig = { pageSizeOptions: [10, 25, 50] };

  searchQuery = '';
  sort: SortState<T> = { column: null, direction: null };
  pagination: PaginationState = { page: 1, pageSize: 10 };

  filteredRows: T[] = [];
  pagedRows: T[] = [];
  totalPages = 1;
  constructor(private dataService :DataService) {}
  get columnKeys(): (keyof T)[] {
    return this.columns.map((c) => c.key);
  }

  get startRow(): number {
    if (this.filteredRows.length === 0) return 0;
    return (this.pagination.page - 1) * this.pagination.pageSize + 1;
  }

  get endRow(): number {
    return Math.min(
      this.pagination.page * this.pagination.pageSize,
      this.filteredRows.length,
    );
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    const current = this.pagination.page;
    const delta = 2;
    const pages: number[] = [];

    for (
      let i = Math.max(1, current - delta);
      i <= Math.min(total, current + delta);
      i++
    ) {
      pages.push(i);
    }

    if (pages[0] > 2) pages.unshift(-1);
    if (pages[0] > 1) pages.unshift(1);
    if (pages[pages.length - 1] < total - 1) pages.push(-1);
    if (pages[pages.length - 1] < total) pages.push(total);

    return pages;
  }



  ngOnInit(): void {
    this.pagination.pageSize = this.config.pageSizeOptions[0];
    this.recompute();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rows'] || changes['columns']) {
      this.recompute();
    }
  }

  onSearchChange(): void {
    this.pagination.page = 1;
    this.recompute();
  }

  onSort(column: ColumnDef<T>): void {
    if (!column.sortable) return;

    if (this.sort.column === column.key) {
      if (this.sort.direction === 'asc') this.sort.direction = 'desc';
      else if (this.sort.direction === 'desc') {
        this.sort.column = null;
        this.sort.direction = null;
      }
    } else {
      this.sort.column = column.key;
      this.sort.direction = 'asc';
    }

    this.pagination.page = 1;
    this.recompute();
  }

  onPageSizeChange(size: number): void {
    this.pagination.pageSize = Number(size);
    this.pagination.page = 1;
    this.recompute();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.pagination.page = page;
    this.recompute();
  }

   recompute(): void {
    let result = [...this.rows];

    //  Filter
    result = result.filter((row) =>
      this.dataService.rowMatchesSearch(row, this.columnKeys, this.searchQuery),
    );

    //  Sort
    if (this.sort.column !== null && this.sort.direction !== null) {
      const col = this.sort.column;
      const dir = this.sort.direction;
      result = result.sort((a, b) => this.dataService.compareValues(a[col], b[col], dir));
    }

    this.filteredRows = result;
    this.totalPages = Math.max(
      1,
      Math.ceil(result.length / this.pagination.pageSize),
    );

    // Paginate
    if (this.pagination.page > this.totalPages) {
      this.pagination.page = this.totalPages;
    }

    this.pagedRows = this.dataService.paginate(
      result,
      this.pagination.page,
      this.pagination.pageSize,
    );
  }

}
