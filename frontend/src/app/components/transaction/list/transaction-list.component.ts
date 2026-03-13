import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FinancialSummary, Transaction } from '../../../models/transaction.model';
import { MenuComponent } from '../../menu/menu.component';
import { TransactionService } from '../../../services/transaction.service';
import { ReportService } from '../../../services/reports.service';


@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MenuComponent],
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.css']
})
export class TransactionListComponent implements OnInit {
  transactions: Transaction[] = [];
  summary: FinancialSummary | null = null;
  
  // Filters
  filters = {
    type: '',
    status: '',
    startDate: '',
    endDate: '',
    search: ''
  };
  
  quickFilter = '';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;
  
  // Loading states
  isLoading = false;
  isDeleting = false;
  
  // Modal
  showDeleteModal = false;
  selectedTransaction: Transaction | null = null;

  constructor(
      private transactionService: TransactionService, 
      private reportService: ReportService) {}

  ngOnInit(): void {
    this.loadTransactions();
    this.loadSummary();
  }

  loadTransactions(): void {
    this.isLoading = true;
    
    const params: any = {
      page: this.currentPage,
      limit: this.itemsPerPage
    };

    if (this.filters.type) params.type = this.filters.type;
    if (this.filters.status) params.status = this.filters.status;
    if (this.filters.startDate) params.startDate = new Date(this.filters.startDate).toISOString();
    if (this.filters.endDate) params.endDate = new Date(this.filters.endDate).toISOString();
    if (this.filters.search) params.search = this.filters.search;

    this.transactionService.listTransactions(params).subscribe({
      next: (response) => {
        this.transactions = response.data;
        this.totalItems = response.total;
        this.totalPages = response.totalPages;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.isLoading = false;
      }
    });  
  }

  loadSummary(): void {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    this.reportService.getSummary(startDate, endDate).subscribe({
      next: (summary) => {
        this.summary = summary;
      },
      error: (error) => {
        console.error('Error loading summary:', error);
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadTransactions();
  }

  clearFilters(): void {
    this.filters = {
      type: '',
      status: '',
      startDate: '',
      endDate: '',
      search: ''
    };
    this.quickFilter = '';
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return Object.values(this.filters).some(value => value !== '');
  }

  setQuickFilter(filter: string): void {
    this.quickFilter = filter;
    const today = new Date();
    
    switch (filter) {
      case 'today':
        this.filters.startDate = today.toISOString().split('T')[0];
        this.filters.endDate = today.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(today);
        weekEnd.setDate(weekStart.getDate() + 6);
        this.filters.startDate = weekStart.toISOString().split('T')[0];
        this.filters.endDate = weekEnd.toISOString().split('T')[0];
        break;
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        this.filters.startDate = monthStart.toISOString().split('T')[0];
        this.filters.endDate = monthEnd.toISOString().split('T')[0];
        break;
      case 'overdue':
        this.filters.status = 'overdue';
        break;
    }
    
    this.applyFilters();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadTransactions();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    
    let start = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let end = Math.min(this.totalPages, start + maxPages - 1);
    
    if (end - start + 1 < maxPages) {
      start = Math.max(1, end - maxPages + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  isOverdue(transaction: Transaction): boolean {
    return transaction.status === 'pending' && new Date(transaction.dueDate) < new Date();
  }

  getStatusClass(status: string): string {
    const classes = {
      'pending': 'badge-warning',
      'paid': 'badge-success',
      'overdue': 'badge-danger',
      'cancelled': 'badge-secondary'
    };
    return classes[status as keyof typeof classes] || '';
  }

  getStatusLabel(status: string): string {
    const labels = {
      'pending': 'Pendente',
      'paid': 'Pago',
      'overdue': 'Vencido',
      'cancelled': 'Cancelado'
    };
    return labels[status as keyof typeof labels] || status;
  }

  confirmDelete(transaction: Transaction): void {
    this.selectedTransaction = transaction;
    this.showDeleteModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedTransaction = null;
    document.body.style.overflow = 'auto';
  }

  deleteTransaction(): void {
    if (!this.selectedTransaction) return;

    this.isDeleting = true;
    
    this.transactionService.deleteTransaction(this.selectedTransaction.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.closeDeleteModal();
        this.loadTransactions();
        this.loadSummary();
      },
      error: (error) => {
        console.error('Error deleting transaction:', error);
        this.isDeleting = false;
      }
    });
  }
}