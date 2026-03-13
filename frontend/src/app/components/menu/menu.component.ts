import { Component, OnInit, AfterViewInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  @ViewChild('userMenu') userMenuRef!: ElementRef;
  
  userName: string = '';
  userRole: string = '';
  showUserMenu = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}


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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}