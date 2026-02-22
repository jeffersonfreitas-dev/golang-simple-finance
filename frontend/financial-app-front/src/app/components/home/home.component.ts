import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'home-root',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
 isScrolled = false;
  mobileMenuOpen = false;
  showDemoModal = false;

  features = [
    {
      icon: '💰',
      title: 'Contas a Pagar/Receber',
      description: 'Controle todas suas transações financeiras em um só lugar com categorização inteligente.',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      icon: '📊',
      title: 'Dashboard Interativo',
      description: 'Visualize seus dados com gráficos dinâmicos e relatórios detalhados em tempo real.',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      icon: '📱',
      title: 'App Mobile',
      description: 'Acompanhe suas finanças de qualquer lugar com nosso aplicativo para iOS e Android.',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      icon: '🔔',
      title: 'Alertas e Notificações',
      description: 'Receba lembretes de contas a vencer e notificações de movimentações importantes.',
      color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    },
    {
      icon: '📈',
      title: 'Relatórios Avançados',
      description: 'Gere relatórios detalhados para análise de gastos e projeções financeiras.',
      color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    },
    {
      icon: '🎯',
      title: 'Metas Financeiras',
      description: 'Defina e acompanhe metas de economia e investimentos para alcançar seus objetivos.',
      color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
    }
  ];

  steps = [
    {
      icon: '📝',
      title: 'Crie sua conta',
      description: 'Cadastre-se gratuitamente em menos de 2 minutos'
    },
    {
      icon: '💰',
      title: 'Adicione transações',
      description: 'Registre suas receitas e despesas de forma simples'
    },
    {
      icon: '📊',
      title: 'Acompanhe resultados',
      description: 'Visualize relatórios e tome melhores decisões'
    }
  ];

  pricingPlans = [
    {
      name: 'Básico',
      price: '0',
      features: [
        'Até 50 transações/mês',
        'Dashboard básico',
        'Controle de contas',
        'Suporte por email'
      ],
      popular: false
    },
    {
      name: 'Profissional',
      price: '29,90',
      features: [
        'Transações ilimitadas',
        'Dashboard avançado',
        'Relatórios detalhados',
        'Exportação de dados',
        'Suporte prioritário',
        'Metas financeiras'
      ],
      popular: true
    },
    {
      name: 'Empresarial',
      price: '99,90',
      features: [
        'Tudo do plano Profissional',
        'Múltiplos usuários',
        'API dedicada',
        'Treinamento online',
        'Suporte 24/7',
        'Personalização'
      ],
      popular: false
    }
  ];

  testimonials = [
    {
      text: 'O FinancialApp transformou minha relação com o dinheiro. Agora consigo planejar meus gastos e economizar para meus objetivos.',
      name: 'Ana Silva',
      role: 'Empreendedora',
      avatar: '👩'
    },
    {
      text: 'Finalmente um app que realmente entende as necessidades de quem precisa controlar finanças pessoais e profissionais.',
      name: 'Carlos Santos',
      role: 'Contador',
      avatar: '👨'
    },
    {
      text: 'A interface é intuitiva e os relatórios são incríveis. Recomendo para todos que querem organizar suas finanças.',
      name: 'Mariana Costa',
      role: 'Analista Financeiro',
      avatar: '👩'
    }
  ];

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  scrollTo(elementId: string, event: Event): void {
    event.preventDefault();
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.mobileMenuOpen = false;
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  showDemo(): void {
    this.showDemoModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeDemo(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal')) {
      this.showDemoModal = false;
      document.body.style.overflow = 'auto';
    }
  }
}