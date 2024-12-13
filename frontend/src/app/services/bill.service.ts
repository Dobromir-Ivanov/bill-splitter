import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Bill, Item, Participant } from '../models/bill.model';

@Injectable({
  providedIn: 'root'
})
export class BillService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  uploadReceipt(file: File): Observable<{ items: Item[] }> {
    const formData = new FormData();
    formData.append('receipt', file);
    return this.http.post<{ items: Item[] }>(`${this.apiUrl}/upload-receipt`, formData);
  }

  createBill(items: Item[]): Observable<Bill> {
    return this.http.post<Bill>(`${this.apiUrl}/bills`, { items });
  }

  getBill(billId: string): Observable<Bill> {
    return this.http.get<Bill>(`${this.apiUrl}/bills/${billId}`);
  }

  addParticipant(billId: string, name: string): Observable<Bill> {
    return this.http.post<Bill>(`${this.apiUrl}/bills/${billId}/participants`, { name });
  }

  updateParticipantItems(billId: string, participantName: string, selectedItems: Item[]): Observable<Bill> {
    return this.http.post<Bill>(`${this.apiUrl}/bills/${billId}/select-items`, {
      participantName,
      selectedItems
    });
  }
}
