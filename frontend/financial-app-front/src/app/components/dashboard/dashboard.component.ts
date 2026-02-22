import { Component, OnInit, AfterViewInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Chart from 'chart.js/auto';
// import { TransactionService } from '../../services/transaction.service';
import { AuthService } from '../../services/auth.service';
import { DailyExtract, FinancialSummary, Transaction } from '../../models/transaction.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {

  @ViewChild('userMenu') userMenuRef!: ElementRef;
  
  userName: string = '';
  userRole: string = '';
  showUserMenu = false;
  currentDate = new Date();
  isRefreshing = false;

  summaryCards: any[] = [];
  cashFlowPeriod = 'month';
  categoryPeriod = 'receivable';
  cashFlowChart: any;
  categoryChart: any;

  recentTransactions: Transaction[] = [];
  upcomingPayments: Transaction[] = [];
  dailyExtract: DailyExtract | null = null;
  selectedDate = new Date();

  constructor(
    // private transactionService: TransactionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initCharts();
    }, 100);
  }

  private initCharts(): void {
    this.initCashFlowChart();
    this.initCategoryChart();
  }

  loadCashFlowData(): void {
    // Load data based on selected period
    this.initCashFlowChart();
  }
  
  loadCategoryData(): void {
    // Load data based on selected type
    this.initCategoryChart();
  }  

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    const user = this.authService.currentUserValue;
    if (user){
      this.userName = user.name.split(' ')[0]
      this.userRole = user.role === 'admin' ? 'Administrador' : 'Usuário';
    }
  }

  private loadDashboardData(): void {
    this.loadSummary();
    this.loadRecentTransactions();
    this.loadUpcomingPayments();
    this.loadDailyExtract();
  }
  
  private loadSummary(): void {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    // this.transactionService.getSummary(startDate, endDate).subscribe({
    //   next: (summary) => {
        const summary = {
          totalReceivables: 152.0,
          totalPayables: 1562.6,
          balance: 52.6,
          paidReceivables: 52.0,
          paidPayables: 21.0,
          overdueCount: 62.0,          
        }
        this.updateSummaryCards(summary);
    //   },
    //   error: (error) => {
    //     console.error('Error loading summary:', error);
    //   }
    // });
  }

  private loadRecentTransactions(): void {
    // this.transactionService.listTransactions({ limit: 5 }).subscribe({
    //   next: (response) => {
    //     this.recentTransactions = response.data;
    //   },
    //   error: (error) => {
    //     console.error('Error loading recent transactions:', error);
    //   }
    // });

 // Mock data para demonstração
  this.recentTransactions = [
    {
      id: '1',
      userId: '1',
      type: 'receivable',
      description: 'Salário',
      amount: 5000,
      status: 'paid',
      dueDate: new Date(),
      paidAt: new Date(),
      createdAt: new Date(),
      category: 'Salário'
    },
    {
      id: '2',
      userId: '1',
      type: 'payable',
      description: 'Aluguel',
      amount: 1500,
      status: 'pending',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
      createdAt: new Date(),
      category: 'Moradia'
    },
    {
      id: '3',
      userId: '1',
      type: 'payable',
      description: 'Supermercado',
      amount: 350.75,
      status: 'paid',
      dueDate: new Date(new Date().setDate(new Date().getDate() - 2)),
      paidAt: new Date(new Date().setDate(new Date().getDate() - 2)),
      createdAt: new Date(new Date().setDate(new Date().getDate() - 2)),
      category: 'Alimentação'
    },
    {
      id: '4',
      userId: '1',
      type: 'receivable',
      description: 'Freelance',
      amount: 1200,
      status: 'pending',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 10)),
      createdAt: new Date(),
      category: 'Trabalho'
    },
    {
      id: '5',
      userId: '1',
      type: 'payable',
      description: 'Internet',
      amount: 89.90,
      status: 'overdue',
      dueDate: new Date(new Date().setDate(new Date().getDate() - 5)),
      createdAt: new Date(new Date().setDate(new Date().getDate() - 35)),
      category: 'Serviços'
    }
  ];    
  }
  
  private loadUpcomingPayments(): void {
  // Mock data para demonstração
    this.upcomingPayments = [
      {
        id: '1',
        userId: '1',
        type: 'payable',
        description: 'Aluguel',
        amount: 1500,
        status: 'pending',
        dueDate: new Date(new Date().setDate(new Date().getDate() + 2)),
        createdAt: new Date()
      },
      {
        id: '2',
        userId: '1',
        type: 'payable',
        description: 'Internet',
        amount: 120,
        status: 'pending',
        dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
        createdAt: new Date()
      },
      {
        id: '3',
        userId: '1',
        type: 'payable',
        description: 'Energia',
        amount: 280,
        status: 'pending',
        dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
        createdAt: new Date()
      }
    ];
  }
  
  loadDailyExtract(): void {
    // this.transactionService.getDailyExtract(this.selectedDate).subscribe({
    //   next: (extract) => {
    //     this.dailyExtract = extract;
    //   },
    //   error: (error) => {
    //     console.error('Error loading daily extract:', error);
    //   }
    // });

    // Mock data para demonstração
    this.dailyExtract = {
      date: this.selectedDate.toISOString(),
      balance: {
        date: this.selectedDate.toISOString(),
        openingBalance: 5000,
        incoming: 1200,
        outgoing: 800,
        closingBalance: 5400
      },
      transactions: [
        {
          id: '1',
          userId: '1',
          type: 'receivable',
          description: 'Salário',
          amount: 5000,
          status: 'paid',
          dueDate: this.selectedDate,
          paidAt: this.selectedDate,
          createdAt: this.selectedDate
        },
        {
          id: '2',
          userId: '1',
          type: 'payable',
          description: 'Supermercado',
          amount: 350,
          status: 'paid',
          dueDate: this.selectedDate,
          paidAt: this.selectedDate,
          createdAt: this.selectedDate,
          category: 'Alimentação'
        },
        {
          id: '3',
          userId: '1',
          type: 'payable',
          description: 'Farmácia',
          amount: 89.90,
          status: 'paid',
          dueDate: this.selectedDate,
          paidAt: this.selectedDate,
          createdAt: this.selectedDate,
          category: 'Saúde'
        }
      ]
    };    
  }
  
  refreshData(): void {
    this.isRefreshing = true;
    this.loadDashboardData();
    
    setTimeout(() => {
      this.isRefreshing = false;
    }, 1000);
  }
  
  previousDay(): void {
    this.selectedDate = new Date(this.selectedDate.setDate(this.selectedDate.getDate() - 1));
    this.loadDailyExtract();
  }
  
  nextDay(): void {
    this.selectedDate = new Date(this.selectedDate.setDate(this.selectedDate.getDate() + 1));
    this.loadDailyExtract();
  }
  
  isToday(): boolean {
    const today = new Date();
    return this.selectedDate.toDateString() === today.toDateString();
  }
  
  viewFullExtract(): void {
    // Navigate to full extract page
  }
  
  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'pending': 'badge-warning',
      'paid': 'badge-success',
      'overdue': 'badge-danger',
      'cancelled': 'badge-secondary'
    };
    return classes[status] || '';
  }
  
getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'Pendente',
      'paid': 'Pago',
      'overdue': 'Vencido',
      'cancelled': 'Cancelado'
    };
    return labels[status] || status;
  }

  getDaysClass(transaction: Transaction): string {
    const days = this.getDaysUntil(transaction);
    if (days <= 1) return 'days-1';
    if (days <= 3) return 'days-3';
    return 'days-7';
  }

  getDaysUntil(transaction: Transaction): number {
    const today = new Date();
    const dueDate = new Date(transaction.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  
  getUserInitials(): string {
    if (!this.userName) return 'U';
    
    const names = this.userName.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return this.userName.substring(0, 2).toUpperCase();
  }
  
  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  } 

  private updateSummaryCards(summary: FinancialSummary): void {
    this.summaryCards = [
      {
        icon: '💰',
        label: 'Saldo Atual',
        value: summary.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        valueClass: summary.balance > 0 ? 'positive' : summary.balance < 0 ? 'negative' : '',
        change: 12.5,
        bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      },
      {
        icon: '📥',
        label: 'A Receber',
        value: summary.totalReceivables.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        valueClass: 'positive',
        change: 8.2,
        bgColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
      },
      {
        icon: '📤',
        label: 'A Pagar',
        value: summary.totalPayables.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        valueClass: 'negative',
        change: -5.1,
        bgColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
      },
      {
        icon: '⚠️',
        label: 'Vencidos',
        value: summary.overdueCount.toString(),
        valueClass: '',
        change: 0,
        bgColor: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
      }
    ];
  }
  
private initCashFlowChart(): void {
    const ctx = document.getElementById('cashFlowChart') as HTMLCanvasElement;
    if (!ctx) {
      console.error('Elemento cashFlowChart não encontrado');
      return;
    }

    if (this.cashFlowChart) {
      this.cashFlowChart.destroy();
    }

    try {
      this.cashFlowChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
          datasets: [
            {
              label: 'Receitas',
              data: [6500, 7200, 6800, 8100, 7600, 8500, 9200, 8800, 9500, 10100, 9800, 11200],
              borderColor: '#4caf50',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              tension: 0.4,
              fill: true
            },
            {
              label: 'Despesas',
              data: [5200, 5800, 5400, 6300, 5900, 7100, 6800, 7200, 6900, 7800, 7400, 8300],
              borderColor: '#f44336',
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              tension: 0.4,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                boxWidth: 6
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return 'R$ ' + value;
                }
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Erro ao inicializar gráfico de fluxo de caixa:', error);
    }
  }

  private initCategoryChart(): void {
    const ctx = document.getElementById('categoryChart') as HTMLCanvasElement;
    if (!ctx) {
      console.error('Elemento categoryChart não encontrado');
      return;
    }

    if (this.categoryChart) {
      this.categoryChart.destroy();
    }

    try {
      this.categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Lazer', 'Outros'],
          datasets: [{
            data: [35, 15, 25, 10, 8, 7],
            backgroundColor: [
              '#667eea',
              '#764ba2',
              '#4facfe',
              '#f093fb',
              '#fa709a',
              '#43e97b'
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                boxWidth: 6
              }
            }
          },
          cutout: '70%'
        }
      });
    } catch (error) {
      console.error('Erro ao inicializar gráfico de categorias:', error);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.userMenuRef && !this.userMenuRef.nativeElement.contains(event.target)) {
      this.showUserMenu = false;
    }
  }  

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }


}