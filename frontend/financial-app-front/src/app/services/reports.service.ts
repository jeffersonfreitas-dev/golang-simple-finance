import { Injectable } from "@angular/core";
import { environment } from "../../environments/environments";
import { HttpClient, HttpParams } from "@angular/common/http";
import { DailyExtract, FinancialSummary } from "../models/transaction.model";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ReportService{
        private apiUrl = `${environment.apiUrl}/reports`;
    
        constructor(private http: HttpClient){}

    getSummary(starDate: Date, endDate: Date): Observable<FinancialSummary> {
        const params = new HttpParams()
            .set('startDate', starDate.toISOString())
            .set('endDate', endDate.toISOString());
        
        return this.http.get<FinancialSummary>(`${this.apiUrl}/summary`, {params});
    }        


    getDailyExtract(date?: Date): Observable<DailyExtract> {
        let params = new HttpParams();
        if (date) {
            params = params.set('date', date.toISOString());
        }
        return this.http.get<DailyExtract>(`${this.apiUrl}/daily-extract`, { params });
    }    
}