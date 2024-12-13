import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { BillService } from '../../services/bill.service';
import { Bill, Item, Participant } from '../../models/bill.model';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-bill-details',
    templateUrl: './bill-details.component.html',
    styleUrls: ['./bill-details.component.scss'],
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
        MatCheckboxModule,
        MatTooltipModule
    ],
    providers: [BillService]
})
export class BillDetailsComponent implements OnInit {
    bill: Bill | null = null;
    newParticipantName = '';
    private billId: string | null = null;
    expandedPanels: boolean[] = [];


    constructor(
        private route: ActivatedRoute,
        private billService: BillService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit() {
        this.billId = this.route.snapshot.paramMap.get('id');
        if (this.billId) {
            this.loadBill();
        }
    }

     loadBill() {
        if (!this.billId) return;

        this.billService.getBill(this.billId).subscribe({
            next: (bill) => {
                this.bill = bill;
                this.expandedPanels = new Array(bill.participants.length).fill(false);
            },
            error: (error) => {
                console.error('Error loading bill:', error);
                this.snackBar.open('Error loading bill details', 'OK', { duration: 3000 });
            }
        });
    }


    addParticipant() {
        if (!this.bill || !this.newParticipantName.trim()) return;
    
        if (this.bill.participants.some(p => p.name === this.newParticipantName.trim())) {
          this.snackBar.open(
            'Участник с това име вече съществува',
            'OK',
            { duration: 3000 }
          );
          return;
        }
    
        const newParticipant: Participant = {
            name: this.newParticipantName.trim(),
            selectedItems: [],
            amount: 0,
        };

        this.billService.addParticipant(this.billId!, newParticipant).subscribe({
            next: (updatedBill) => {
                this.bill = updatedBill;
                this.newParticipantName = '';
                this.expandedPanels.push(false);
            },
             error: (error) => {
              console.error('Error adding participant:', error);
                this.snackBar.open('Error adding participant', 'OK', { duration: 3000 });
            }
        })
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


    onItemSelectionChange(participant: Participant, item: Item, isChecked: boolean) {
         if (!this.bill || !this.billId) return;


        const selectedItems = participant.selectedItems.filter(selectedItem => !(selectedItem.name === item.name && selectedItem.price === item.price));

         if(isChecked){
              selectedItems.push(item);
         }
        
       this.billService.updateParticipantItems(this.billId, participant.name, selectedItems).subscribe({
          next: (updatedBill) => {
            this.bill = updatedBill;
            this.snackBar.open(
              `Сумата на ${participant.name} е обновена: ${participant.amount.toFixed(2)} лв.`,
              'OK',
              { duration: 2000 }
            );
            },
            error: (error) => {
                console.error('Error updating bill items:', error);
                this.snackBar.open('Error updating bill items', 'OK', { duration: 3000 });
            }
        })
    }

    getRemainingAmount(): number {
      if (!this.bill) return 0;
      return +(this.bill.totalAmount - this.bill.paidAmount).toFixed(2);
  }
}