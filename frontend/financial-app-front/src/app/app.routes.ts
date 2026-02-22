import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '', 
        redirectTo: '/home',
        pathMatch: 'full'
    },
    {
        path: 'home',
        loadComponent: () =>
            import('./components/home/home.component')
                .then(m => m.HomeComponent)
    },
    {
        path: 'login',
        loadComponent: () =>
            import('./components/login/login.component')
                .then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => 
            import('./components/register/register.component')
                .then(m => m.RegisterComponent)
    },
    {
        path: 'dashboard',
        canActivate: [AuthGuard],
        loadComponent: () => 
            import('./components/dashboard/dashboard.component')
                .then(m => m.DashboardComponent)
    },
    {
        path: 'transactions',
        canActivate: [AuthGuard],
        loadComponent: () => 
            import('./components/transaction/list/transaction-list.component')
                .then(m => m.TransactionListComponent)
    },
    {
        path: 'transactions/new',
        canActivate: [AuthGuard],
        loadComponent: () => 
            import('./components/transaction/form/transaction-form.component')
                .then(m => m.TransactionFormComponent)
    },
    {
        path: 'transactions/:id/edit',
        canActivate: [AuthGuard],
        loadComponent: () => 
            import('./components/transaction/form/transaction-form.component')
                .then(m => m.TransactionFormComponent)
    },
    {
        path: '**',
        redirectTo: ''
    }        
];