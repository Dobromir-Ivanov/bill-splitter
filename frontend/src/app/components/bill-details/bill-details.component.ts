import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule, MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { BillService } from '../../services/bill.service';
import { Bill, Item, Participant } from '../../models/bill.model';

@Component({
  selector: 'app-bill-details',
  template: `
    <div class="bill-details-container">
      <mat-card class="main-card">
        <mat-card-header>
          <mat-card-title>Детайли на сметката</mat-card-title>
          <mat-card-subtitle>
            Създадена на: {{ bill?.createdAt | date:'medium' }}
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div class="content-grid">
            <!-- Секция за участници -->
            <div class="participants-section">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Добавяне на участник</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <form (ngSubmit)="addParticipant()" class="add-participant-form">
                    <mat-form-field appearance="outline">
                      <mat-label>Име на участник</mat-label>
                      <input matInput [(ngModel)]="newParticipantName" 
                             name="participantName" 
                             required>
                      <mat-icon matSuffix>person_add</mat-icon>
                    </mat-form-field>
                    <button mat-raised-button 
                            color="primary"
                            type="submit"
                            [disabled]="!newParticipantName">
                      Добави
                    </button>
                  </form>
                </mat-card-content>
              </mat-card>

              <!-- Списък с участници -->
              <div class="participants-list">
                <mat-accordion>
                  <mat-expansion-panel *ngFor="let participant of bill?.participants">
                    <mat-expansion-panel-header>
                      <mat-panel-title>
                        <mat-icon>person</mat-icon>
                        {{ participant.name }}
                      </mat-panel-title>
                      <mat-panel-description>
                        {{ participant.amount | currency:'BGN':'symbol-narrow':'1.2-2' }}
                      </mat-panel-description>
                    </mat-expansion-panel-header>

                    <mat-selection-list #itemsList 
                                      (selectionChange)="onItemSelection($event, participant)">
                      <mat-list-option *ngFor="let item of bill?.items"
                                     [value]="item"
                                     [selected]="isItemSelected(participant, item)"
                                     [disabled]="isItemSelectedByOthers(participant, item)"
                                     checkboxPosition="before">
                        <div class="item-option">
                          <span class="item-name">{{ item.name }}</span>
                          <div class="item-details">
                            <span class="item-price">
                              {{ item.price | currency:'BGN':'symbol-narrow':'1.2-2' }}
                            </span>
                            <span *ngIf="isItemSelectedByOthers(participant, item)" 
                                  class="item-owner">
                              (Избрано от {{ getItemOwner(item) }})
                            </span>
                          </div>
                        </div>
                      </mat-list-option>
                    </mat-selection-list>

                    <div class="participant-total">
                      <strong>Общо за {{ participant.name }}:</strong>
                      <span>{{ participant.amount | currency:'BGN':'symbol-narrow':'1.2-2' }}</span>
                    </div>
                  </mat-expansion-panel>
                </mat-accordion>
              </div>
            </div>

            <!-- Обобщение на сметката -->
            <div class="summary-section">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Обобщение</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="summary-item">
                    <span>Обща сума:</span>
                    <span>{{ bill?.totalAmount | currency:'BGN':'symbol-narrow':'1.2-2' }}</span>
                  </div>
                  <div class="summary-item">
                    <span>Платени:</span>
                    <span>{{ bill?.paidAmount | currency:'BGN':'symbol-narrow':'1.2-2' }}</span>
                  </div>
                  <mat-divider></mat-divider>
                  <div class="summary-item remaining">
                    <span>Остатък:</span>
                    <span>{{ getRemainingAmount() | currency:'BGN':'symbol-narrow':'1.2-2' }}</span>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .bill-details-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 20px;
      margin-top: 20px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .participants-section {
      .add-participant-form {
        display: flex;
        gap: 16px;
        align-items: flex-start;
        margin-bottom: 20px;

        mat-form-field {
          flex: 1;
        }
      }

      .participants-list {
        margin-top: 20px;

        mat-expansion-panel-header {
          mat-panel-title {
            align-items: center;
            
            mat-icon {
              margin-right: 8px;
            }
          }
        }

        .item-option {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          min-height: 48px;
          padding-right: 16px;

          .item-name {
            flex: 1;
            margin-right: 16px;
            white-space: normal;
            word-wrap: break-word;
          }

          .item-details {
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: fit-content;
            margin-left: auto;

            .item-price {
              color: rgba(0, 0, 0, 0.6);
              white-space: nowrap;
            }

            .item-owner {
              font-size: 0.85em;
              color: rgba(0, 0, 0, 0.5);
              font-style: italic;
              white-space: nowrap;
            }
          }
        }

        .participant-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          margin-top: 16px;
          background: rgba(0, 0, 0, 0.04);
          border-radius: 4px;

          strong {
            color: #3f51b5;
          }
        }

        ::ng-deep .mat-mdc-list-option {
          .mdc-list-item__content {
            overflow: visible !important;
          }
        }
      }
    }

    .summary-section {
      .summary-item {
        display: flex;
        justify-content: space-between;
        margin: 12px 0;
        font-size: 16px;

        &.remaining {
          margin-top: 16px;
          font-weight: 500;
          color: #3f51b5;
        }
      }

      mat-divider {
        margin: 16px 0;
      }
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatSnackBarModule,
    MatDividerModule,
    MatCheckboxModule
  ],
  providers: [BillService]
})
export class BillDetailsComponent implements OnInit {
  @ViewChild('itemsList') itemsList!: MatSelectionList;
  
  bill: Bill | null = null;
  newParticipantName = '';

  constructor(
    private route: ActivatedRoute,
    private billService: BillService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    const billId = this.route.snapshot.paramMap.get('id');
    if (billId) {
      this.loadBill(billId);
    }
  }

  loadBill(billId: string) {
    this.billService.getBill(billId).subscribe((response: Bill) => {
      this.bill = response;
    }, error => {
      console.error('Error loading bill:', error);
    });
  }

  addParticipant() {
    if (!this.bill || !this.newParticipantName.trim()) return;

    // Проверка за дублирани имена
    if (this.bill.participants.some(p => p.name === this.newParticipantName.trim())) {
      this.snackBar.open(
        'Участник с това име вече съществува',
        'OK',
        { duration: 3000 }
      );
      return;
    }

    // Добавяме нов участник
    this.bill.participants.push({
      name: this.newParticipantName.trim(),
      selectedItems: [],
      amount: 0
    });

    this.newParticipantName = '';
  }

  isItemSelected(participant: Participant, item: Item): boolean {
    return participant.selectedItems.some(
      selectedItem => selectedItem.name === item.name && selectedItem.price === item.price
    );
  }

  isItemSelectedByOthers(currentParticipant: Participant, item: Item): boolean {
    if (!this.bill) return false;
    
    return this.bill.participants.some(participant => 
      participant.name !== currentParticipant.name && 
      participant.selectedItems.some(
        selectedItem => selectedItem.name === item.name && selectedItem.price === item.price
      )
    );
  }

  getItemOwner(item: Item): string {
    if (!this.bill) return '';
    
    const owner = this.bill.participants.find(participant => 
      participant.selectedItems.some(
        selectedItem => selectedItem.name === item.name && selectedItem.price === item.price
      )
    );
    
    return owner ? owner.name : '';
  }

  onItemSelection(event: MatSelectionListChange, participant: Participant) {
    console.log('Selection event:', event);
    console.log('Before update - participant:', participant);

    if (!this.bill) return;

    // Получаваме всички селектирани опции
    const selectedOptions = event.source.selectedOptions.selected;
    const selectedItems = selectedOptions.map(option => option.value as Item);

    console.log('Selected items:', selectedItems);

    // Обновяваме данните на участника
    participant.selectedItems = selectedItems;
    
    // Преизчисляваме сумата на участника
    participant.amount = selectedItems.reduce((sum, item) => sum + item.price, 0);
    
    // Преизчисляваме общата платена сума
    this.bill.paidAmount = this.bill.participants.reduce(
      (total, p) => total + p.amount,
      0
    );

    console.log('After update - participant:', participant);
    console.log('Bill total paid:', this.bill.paidAmount);

    // Показваме съобщение за успешно обновяване
    this.snackBar.open(
      `Сумата на ${participant.name} е обновена: ${participant.amount.toFixed(2)} лв.`,
      'OK',
      { duration: 2000 }
    );
  }

  getRemainingAmount(): number {
    if (!this.bill) return 0;
    return +(this.bill.totalAmount - this.bill.paidAmount).toFixed(2);
  }
}
