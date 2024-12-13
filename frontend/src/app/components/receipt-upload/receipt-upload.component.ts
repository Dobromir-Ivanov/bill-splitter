import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BillService } from '../../services/bill.service';
import { Item } from '../../models/bill.model';

@Component({
  selector: 'app-receipt-upload',
  templateUrl: './receipt-upload.component.html',
  styleUrl: './receipt-upload.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ]
})
export class ReceiptUploadComponent {
  selectedFile: File | null = null;
  loading = false;
  items: Item[] = [];
  isDragOver = false;

  constructor(
    private billService: BillService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  private handleFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.snackBar.open('Моля, изберете изображение', 'OK', { duration: 3000 });
      return;
    }

    this.selectedFile = file;
    this.uploadReceipt();
  }

  uploadReceipt(): void {
    if (!this.selectedFile) return;

    this.loading = true;
    this.items = [];


    // В реалния проект тук ще извикваме backend API

    this.billService.uploadReceipt(this.selectedFile).subscribe({
      next: (response) => {
        this.items = response.items;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error uploading receipt:', error);
        this.loading = false;
        this.snackBar.open(
          'Грешка при обработката на бележката. Моля, опитайте отново.',
          'OK',
          { duration: 3000 }
        );
      }
    });
 
  }

  getTotalAmount(): number {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }

  createBill(): void {
    if (this.items.length === 0) return;

    // Симулираме създаване на сметка
    /*
    const billId = 'bill-' + Date.now();
    this.router.navigate(['/bill', billId], { state: { items: this.items } });
    */
    // В реалния проект:
 
    this.billService.createBill(this.items).subscribe({
      next: (response) => {
        this.router.navigate(['/bill', response.id]);
      },
      error: (error) => {
        console.error('Error creating bill:', error);
        this.snackBar.open(
          'Грешка при създаването на сметката. Моля, опитайте отново.',
          'OK',
          { duration: 3000 }
        );
      }
    });
  }
}
