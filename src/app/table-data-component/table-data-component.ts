import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SharedTableComponent } from "../shared-table-component/shared-table-component";
import { ColumnDef, User } from '../../models/table.model';
import { DataService } from '../data-service';

@Component({
  selector: 'app-table-data-component',
  templateUrl: './table-data-component.html',
  styleUrl: './table-data-component.scss',
   standalone: true,
  imports: [CommonModule, SharedTableComponent],
})
export class TableDataComponent {
 users: User[] = [];
  loading = true;

  readonly columns: ColumnDef<User>[] = [
    { key: 'id', label: '#', sortable: true, minWidth: '56px' },
    { key: 'name', label: 'Name', sortable: true, minWidth: '160px' },
    { key: 'email', label: 'Email', sortable: true, minWidth: '200px' },
    { key: 'role', label: 'Role', sortable: true, minWidth: '140px' },
    {key: 'status',label: 'Status',sortable: true,minWidth: '120px'},
    { key: 'joinedAt', label: 'Joined', sortable: true, minWidth: '120px' },
  ];
constructor(private dataService : DataService){}
  ngOnInit(): void {
    setTimeout(() => {
      this.users = this.dataService.generateUsers(100);
      this.loading = false;
    }, 1200);
  }
}
