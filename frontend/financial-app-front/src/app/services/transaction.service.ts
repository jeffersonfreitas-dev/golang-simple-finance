import { Injectable } from "@angular/core";
import { environment } from "../../environments/environments";
import { HttpClient, HttpParams } from "@angular/common/http";
import { CreateTransactionRequest, FinancialSummary, Transaction, TransactionFilterParams, TransactionListResponse } from "../models/transaction.model";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class TransactionService{
    private apiUrl = `${environment.apiUrl}/transactions`;

    constructor(private http: HttpClient){}

    createTransaction(data: CreateTransactionRequest): Observable<Transaction> {
        return this.http.post<Transaction>(`${this.apiUrl}`, data);
    }

    listTransactions(params?: TransactionFilterParams): Observable<TransactionListResponse>{
        let httpParams = new HttpParams();
        if (params) {
            Object.entries(params).forEach((key, value) => {
                if(value !== undefined && value !== null){
                    httpParams = httpParams.set(key[0], key[1]);
                }
            })
        }
        return this.http.get<TransactionListResponse>(`${this.apiUrl}`, {params: httpParams})
    }

    deleteTransaction(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`)
    }
}