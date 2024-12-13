import { Routes } from '@angular/router';
import { ReceiptUploadComponent } from './components/receipt-upload/receipt-upload.component';
import { BillDetailsComponent } from './components/bill-details/bill-details.component';

export const routes: Routes = [
  { path: '', redirectTo: '/upload', pathMatch: 'full' },
  { path: 'upload', component: ReceiptUploadComponent },
  { path: 'bills', component: BillDetailsComponent },
  { path: 'bill/:id', component: BillDetailsComponent },
  { path: '**', redirectTo: '/upload' }
];
