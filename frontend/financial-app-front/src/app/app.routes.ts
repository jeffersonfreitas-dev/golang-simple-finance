import { Routes } from '@angular/router';
import { AppComponent } from './app.component';

export const routes: Routes = [
    {
        path: '',
        component: AppComponent // Carrega o AppComponent diretamente na raiz
    },
    {
        path: 'login',
        loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
    },
    // {
    //     path: 'register',
    //     loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent)
    // }
];