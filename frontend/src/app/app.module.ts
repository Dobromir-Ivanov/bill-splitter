import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { ReceiptUploadComponent } from './components/receipt-upload/receipt-upload.component';
import { BillDetailsComponent } from './components/bill-details/bill-details.component';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot([
      { path: '', redirectTo: '/upload', pathMatch: 'full' },
      { path: 'upload', component: ReceiptUploadComponent },
      { path: 'bills', component: BillDetailsComponent },
      { path: 'bill/:id', component: BillDetailsComponent },
      { path: '**', redirectTo: '/upload' }
    ]),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
