import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FinancialSummary, Transaction } from '../../../models/transaction.model';
// import { TransactionService } from '../../services/transaction.service';


@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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

  constructor() {}

  ngOnInit(): void {
    this.loadTransactions();
    this.loadSummary();
  }

  loadTransactions(): void {
    this.isLoading = true;
    
    // const params: any = {
    //   page: this.currentPage,
    //   limit: this.itemsPerPage
    // };

    // if (this.filters.type) params.type = this.filters.type;
    // if (this.filters.status) params.status = this.filters.status;
    // if (this.filters.startDate) params.startDate = new Date(this.filters.startDate).toISOString();
    // if (this.filters.endDate) params.endDate = new Date(this.filters.endDate).toISOString();
    // if (this.filters.search) params.search = this.filters.search;

    // this.transactionService.listTransactions(params).subscribe({
    //   next: (response) => {
    //     this.transactions = response.data;
    //     this.totalItems = response.total;
    //     this.totalPages = response.totalPages;
    //     this.isLoading = false;
    //   },
    //   error: (error) => {
    //     console.error('Error loading transactions:', error);
    //     this.isLoading = false;
    //   }
    // });

// Simula um delay de rede
    setTimeout(() => {
      // Mock data
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          userId: '1',
          type: 'receivable',
          description: 'Salário - Empresa XYZ',
          amount: 5200.00,
          status: 'paid',
          dueDate: new Date(2024, 1, 5),
          paidAt: new Date(2024, 1, 5),
          createdAt: new Date(2024, 1, 1),
          category: 'Salário',
          notes: 'Salário mensal'
        },
        {
          id: '2',
          userId: '1',
          type: 'payable',
          description: 'Aluguel',
          amount: 1800.00,
          status: 'paid',
          dueDate: new Date(2024, 1, 10),
          paidAt: new Date(2024, 1, 8),
          createdAt: new Date(2024, 1, 1),
          category: 'Moradia',
          notes: 'Aluguel apartamento'
        },
        {
          id: '3',
          userId: '1',
          type: 'payable',
          description: 'Energia Elétrica',
          amount: 245.80,
          status: 'pending',
          dueDate: new Date(2024, 2, 15),
          createdAt: new Date(2024, 2, 1),
          category: 'Utilidades',
          notes: 'Conta de luz - março'
        },
        {
          id: '4',
          userId: '1',
          type: 'payable',
          description: 'Internet',
          amount: 120.00,
          status: 'pending',
          dueDate: new Date(2024, 2, 20),
          createdAt: new Date(2024, 2, 1),
          category: 'Serviços',
          notes: 'Internet fibra'
        },
        {
          id: '5',
          userId: '1',
          type: 'receivable',
          description: 'Freelance - Site',
          amount: 2500.00,
          status: 'pending',
          dueDate: new Date(2024, 2, 25),
          createdAt: new Date(2024, 2, 10),
          category: 'Freelance',
          notes: 'Desenvolvimento de site'
        },
        {
          id: '6',
          userId: '1',
          type: 'payable',
          description: 'Cartão de Crédito',
          amount: 1250.50,
          status: 'pending',
          dueDate: new Date(2024, 2, 12),
          createdAt: new Date(2024, 2, 1),
          category: 'Cartão',
          notes: 'Fatura fevereiro'
        },
        {
          id: '7',
          userId: '1',
          type: 'payable',
          description: 'Água',
          amount: 89.30,
          status: 'overdue',
          dueDate: new Date(2024, 1, 28),
          createdAt: new Date(2024, 1, 15),
          category: 'Utilidades',
          notes: 'Conta de água - vencida'
        },
        {
          id: '8',
          userId: '1',
          type: 'receivable',
          description: 'Investimentos',
          amount: 350.00,
          status: 'paid',
          dueDate: new Date(2024, 1, 20),
          paidAt: new Date(2024, 1, 20),
          createdAt: new Date(2024, 1, 15),
          category: 'Investimentos',
          notes: 'Dividendos'
        },
        {
          id: '9',
          userId: '1',
          type: 'payable',
          description: 'Academia',
          amount: 99.90,
          status: 'cancelled',
          dueDate: new Date(2024, 1, 5),
          createdAt: new Date(2024, 1, 1),
          category: 'Saúde',
          notes: 'Cancelado - mudança de plano'
        },
        {
          id: '10',
          userId: '1',
          type: 'payable',
          description: 'Supermercado',
          amount: 435.70,
          status: 'paid',
          dueDate: new Date(2024, 1, 3),
          paidAt: new Date(2024, 1, 3),
          createdAt: new Date(2024, 1, 1),
          category: 'Alimentação',
          notes: 'Compras do mês'
        },
        {
          id: '11',
          userId: '1',
          type: 'receivable',
          description: 'Bônus',
          amount: 1000.00,
          status: 'paid',
          dueDate: new Date(2024, 1, 15),
          paidAt: new Date(2024, 1, 15),
          createdAt: new Date(2024, 1, 10),
          category: 'Bônus',
          notes: 'Bônus de performance'
        },
        {
          id: '12',
          userId: '1',
          type: 'payable',
          description: 'Streaming',
          amount: 45.90,
          status: 'pending',
          dueDate: new Date(2024, 2, 10),
          createdAt: new Date(2024, 2, 1),
          category: 'Entretenimento',
          notes: 'Netflix'
        }
      ];

      // Aplicar filtros
      let filteredTransactions = [...mockTransactions];

      if (this.filters.type) {
        filteredTransactions = filteredTransactions.filter(t => t.type === this.filters.type);
      }

      if (this.filters.status) {
        filteredTransactions = filteredTransactions.filter(t => t.status === this.filters.status);
      }

      if (this.filters.startDate) {
        const start = new Date(this.filters.startDate);
        filteredTransactions = filteredTransactions.filter(t => new Date(t.dueDate) >= start);
      }

      if (this.filters.endDate) {
        const end = new Date(this.filters.endDate);
        filteredTransactions = filteredTransactions.filter(t => new Date(t.dueDate) <= end);
      }

      if (this.filters.search) {
        const searchLower = this.filters.search.toLowerCase();
        filteredTransactions = filteredTransactions.filter(t => 
          t.description.toLowerCase().includes(searchLower) ||
          (t.category && t.category.toLowerCase().includes(searchLower)) ||
          (t.notes && t.notes.toLowerCase().includes(searchLower))
        );
      }

      // Ordenar por data (mais recentes primeiro)
      filteredTransactions.sort((a, b) => 
        new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
      );

      // Calcular totais para paginação
      this.totalItems = filteredTransactions.length;
      this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

      // Aplicar paginação
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      this.transactions = filteredTransactions.slice(startIndex, endIndex);

      this.isLoading = false;
    }, 500); // Delay de 500ms para simular rede    
  }

  loadSummary(): void {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    // this.transactionService.getSummary(startDate, endDate).subscribe({
    //   next: (summary) => {
    //     this.summary = summary;
    //   },
    //   error: (error) => {
    //     console.error('Error loading summary:', error);
    //   }
    // });

    // Mock summary data
    this.summary = {
      totalReceivables: 9050.00,
      totalPayables: 4687.10,
      balance: 4362.90,
      paidReceivables: 6550.00,
      paidPayables: 2775.40,
      overdueCount: 1
    };    
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

  viewTransaction(transaction: Transaction): void {
    // Navigate to transaction detail
  }

  editTransaction(transaction: Transaction): void {
    // Navigate to edit form
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
    
    // this.transactionService.deleteTransaction(this.selectedTransaction.id).subscribe({
    //   next: () => {
    //     this.isDeleting = false;
    //     this.closeDeleteModal();
    //     this.loadTransactions();
    //     this.loadSummary();
    //   },
    //   error: (error) => {
    //     console.error('Error deleting transaction:', error);
    //     this.isDeleting = false;
    //   }
    // });
  }
}