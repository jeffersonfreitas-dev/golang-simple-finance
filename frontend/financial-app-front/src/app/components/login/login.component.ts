import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { ToastrService } from "ngx-toastr";

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    loginForm!: FormGroup;
    showPassword = false;
    isLoading = false;
    errorMessage = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private toastr: ToastrService
    ){}
    
    ngOnInit(): void {
        if (this.authService.isAuthenticated()){
            this.router.navigate(['/dashboard'])
        }

        this.initForm();
    }

    private initForm(): void {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            rememberMe: [false]
        })
    }

    get email(): FormControl {
        return this.loginForm.get('email') as FormControl;
    }

    get password(): FormControl {
        return this.loginForm.get('password') as FormControl;
    }

    get rememberMe(): FormControl {
        return this.loginForm.get('rememberMe') as FormControl;
    }

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }

    onSubmit(): void {
        if (this.loginForm.invalid){
            this.markFormGroupTouched(this.loginForm);
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        const credentials = {
            email: this.email.value,
            password: this.password.value
        };

        this.authService.login(credentials).subscribe({
            next: (resp) => {
                console.log(resp)
                this.isLoading = false;
                this.toastr.success("Login realizado com sucesso!", "Bem-vindo!")

                if (this.rememberMe.value){
                    localStorage.setItem('rememberedEmail', this.email.value);
                }else{
                    localStorage.removeItem('rememberedEmail');
                }

                const returnUrl = this.router.parseUrl(this.router.url).queryParams['returnUrl'];
                this.router.navigate([returnUrl || '/dashboard'])
            },
            error: (error) => {
                this.isLoading = false;
                console.log('login error:', error)

                if (error.status === 401) {
                    this.errorMessage = 'E-mail ou senha inválidos';
                } else if (error.status === 403) {
                    this.errorMessage = 'Usuário inativo. Entre em contato com o administrador';
                } else if (error.status === 0) {
                    this.errorMessage = 'Erro de conexão. Verifique sua internet';
                } else {
                    this.errorMessage = error.error?.message || 'Erro ao fazer login. Tente novamente';
                }

                this.toastr.error(this.errorMessage, 'Erro no login');                
            }
        })
    }


    private markFormGroupTouched(formGroup: FormGroup): void {
        Object.values(formGroup.controls).forEach(control => {
            control.markAsTouched();
            if (control instanceof FormGroup){
                this.markFormGroupTouched(control);
            }
        });
    }

    checkRememberedEmail(): void {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if(rememberedEmail){
            this.loginForm.patchValue({
                email: rememberedEmail,
                rememberMe: true
            });
        }
    }

}