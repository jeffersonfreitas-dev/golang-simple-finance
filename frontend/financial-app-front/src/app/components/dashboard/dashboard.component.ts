import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
// import Chart from 'chart.js/auto';
// import { TransactionService } from '../../services/transaction.service';
import { AuthService } from '../../services/auth.service';
// import { Transaction, DailyExtract, FinancialSummary } from '../../models/transaction.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  userName: string = 'Jeffinho';
  currentDate = new Date();
  isRefreshing = false;

  constructor(private authService: AuthService){}

  ngAfterViewInit(): void {
    console.log("teste")    
  }
  ngOnInit(): void {
    console.log("testing")
  }

  logout(): void {
    this.authService.logout()
  }


}