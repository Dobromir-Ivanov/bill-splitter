import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Bill, Item, Participant } from '../models/bill.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BillService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getBill(id: string): Observable<Bill> {
    return this.http.get<Bill>(`${this.apiUrl}/bills/${id}`);
  }

  uploadReceipt(file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('receipt', file, file.name);
    return this.http.post(`${this.apiUrl}/upload-receipt`, formData);
  }

  createBill(items: Item[]): Observable<{ id: string }> {
      return this.http.post<{ id: string }>(`${this.apiUrl}/bills`, { items });
  }

  addParticipant(billId: string, participant: Participant): Observable<Bill> {
      return this.http.post<Bill>(`${this.apiUrl}/bills/${billId}/participants`, participant);
  }

  updateParticipantItems(billId: string, participantName: string, selectedItems: Item[]): Observable<Bill> {
    return this.http.put<Bill>(`${this.apiUrl}/bills/${billId}/participants/${participantName}`, {selectedItems});
  }
}
