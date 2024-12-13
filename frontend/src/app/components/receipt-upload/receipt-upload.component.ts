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
  template: `
    <div class="upload-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Качване на касова бележка</mat-card-title>
          <mat-card-subtitle>Качете снимка на касовата бележка за да започнете разделянето</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <!-- Drag & Drop зона -->
          <div class="upload-zone" 
               [class.dragover]="isDragOver"
               (dragover)="onDragOver($event)"
               (dragleave)="onDragLeave($event)"
               (drop)="onDrop($event)">
            
            <input type="file" 
                   #fileInput 
                   (change)="onFileSelected($event)"
                   accept="image/*"
                   style="display: none">
            
            <mat-icon class="upload-icon">cloud_upload</mat-icon>
            <p>Провлачете снимка тук или</p>
            <button mat-raised-button color="primary" (click)="fileInput.click()">
              <mat-icon>attach_file</mat-icon>
              Изберете файл
            </button>
            
            <p *ngIf="selectedFile" class="selected-file">
              Избран файл: {{ selectedFile.name }}
            </p>
          </div>

          <!-- Индикатор за зареждане -->
          <div *ngIf="loading" class="loading-container">
            <mat-spinner diameter="48"></mat-spinner>
            <p>Обработка на бележката...</p>
          </div>

          <!-- Списък с разпознати продукти -->
          <div *ngIf="items.length > 0" class="items-container">
            <h3>Разпознати продукти:</h3>
            
            <mat-list>
              <mat-list-item *ngFor="let item of items">
                <mat-icon matListItemIcon>receipt</mat-icon>
                <div matListItemTitle>{{ item.name }}</div>
                <div matListItemLine>{{ item.price | currency:'BGN':'symbol-narrow':'1.2-2' }}</div>
              </mat-list-item>
            </mat-list>

            <div class="total-amount">
              <h3>Обща сума: {{ getTotalAmount() | currency:'BGN':'symbol-narrow':'1.2-2' }}</h3>
            </div>

            <button mat-raised-button 
                    color="accent" 
                    class="create-bill-btn"
                    (click)="createBill()"
                    [disabled]="items.length === 0">
              <mat-icon>group_add</mat-icon>
              Създай нова сметка
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .upload-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .upload-zone {
      border: 2px dashed #ccc;
      border-radius: 4px;
      padding: 40px;
      text-align: center;
      transition: all 0.3s ease;
      background-color: #fafafa;
      margin: 20px 0;

      &.dragover {
        background-color: rgba(63, 81, 181, 0.1);
        border-color: #3f51b5;
      }

      .upload-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #666;
        margin-bottom: 16px;
      }

      p {
        color: #666;
        margin: 8px 0;
      }

      .selected-file {
        margin-top: 16px;
        color: #3f51b5;
        font-weight: 500;
      }
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 40px 0;

      p {
        margin-top: 16px;
        color: #666;
      }
    }

    .items-container {
      margin-top: 30px;

      h3 {
        color: #333;
        margin-bottom: 16px;
      }

      .total-amount {
        text-align: right;
        margin: 20px 0;
        
        h3 {
          color: #3f51b5;
          font-weight: 500;
        }
      }

      .create-bill-btn {
        width: 100%;
        margin-top: 20px;
        padding: 8px;
        
        mat-icon {
          margin-right: 8px;
        }
      }
    }
  `],
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
    const billId = 'bill-' + Date.now();
    this.router.navigate(['/bill', billId]);

    // В реалния проект:
    /*
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
    */
  }
}
