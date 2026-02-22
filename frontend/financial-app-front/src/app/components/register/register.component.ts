import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { markFormGroupTouched } from '../../shared/utils/form-utils';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
    registerForm!: FormGroup;
    currentStep = 1;
    showPassword = false;
    showConfirmPassword = false;
    isLoading = false;
    errorMessage = '';
    successMessage = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {}    

    ngOnInit(): void {
        if (this.authService.isAuthenticated()) {
        this.router.navigate(['/dashboard']);
        }
        this.initForm();
    }

    private initForm() : void {
        this.registerForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.required, Validators.email]], 

            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]],

            phone: [''],
            referral: [''],
            terms: [false, Validators.requiredTrue],
            newsletter: [false]            
        }), { validators: this.passwordMatchValidator };
    }

    passwordMatchValidator(control: AbstractControl) {
        const password = control.get('password');
        const confirmPassword = control.get('confirmPassword');

        if (password?.value !== confirmPassword?.value) {
            confirmPassword?.setErrors({passwordMismatch: true});
        }else {
            confirmPassword?.setErrors(null);
        }
        return null;
    }

    get name(): FormControl {
        return this.registerForm.get('name') as FormControl;
    }

    get email(): FormControl {
        return this.registerForm.get('email') as FormControl;
    }

    get password(): FormControl {
        return this.registerForm.get('password') as FormControl;
    }

    get confirmPassword(): FormControl {
        return this.registerForm.get('confirmPassword') as FormControl;
    }

    get phone(): FormControl {
        return this.registerForm.get('phone') as FormControl;
    }

    get referral(): FormControl {
        return this.registerForm.get('referral') as FormControl;
    }

    get terms(): FormControl {
        return this.registerForm.get('terms') as FormControl;
    }

    get newsletter(): FormControl {
        return this.registerForm.get('newsletter') as FormControl;
    }

    get progressWidth(): number {
        return (this.currentStep / 3) * 100;
    }

    get passwordStrength(): number {
        const password = this.password.value || '';
        let strength = 0;
        
        if (password.length >= 6) strength += 25;
        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        if (/[^A-Za-z0-9]/.test(password)) strength += 25;
        
        return Math.min(strength, 100);
    }

    get strengthClass(): string {
        const strength = this.passwordStrength;
        if (strength < 40) return 'weak';
        if (strength < 70) return 'medium';
        return 'strong';
    }

    get strengthText(): string {
        const strength = this.passwordStrength;
        if (strength < 40) return 'Fraca';
        if (strength < 70) return 'Média';
        return 'Forte';
    }

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }

    isCurrentStepValid(): boolean {
        switch (this.currentStep) {
        case 1:
            return this.name.valid && this.email.valid;
        case 2:
            return this.password.valid && this.confirmPassword.valid;
        case 3:
            return this.terms.valid;
        default:
            return false;
        }
    }

    nextStep(): void {
        if (this.isCurrentStepValid() && this.currentStep < 3) {
        this.currentStep++;
        }
    }

    previousStep(): void {
        if (this.currentStep > 1) {
        this.currentStep--;
        }
    }

    onSubmit(): void {
        if (this.registerForm.invalid){
            markFormGroupTouched(this.registerForm);
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        const userData = {
            name : this.name.value,
            email : this.email. value,
            password : this.password.value,
            phone: this.phone.value,
            referral : this.referral.value,
            newsletter : this.newsletter.value
        };

        this.authService.register(userData).subscribe({
            next: (resp) => {
                this.isLoading = false;
                this.successMessage = 'Cadastro realizado com sucesso';

                setTimeout(() => {
                    this.router.navigate(['/dashboard']);
                }, 2000);
            },
            error: (err) => {
                this.isLoading = false;
                console.log('Register error:', err);

                if (err.status == 409){
                    this.errorMessage = 'E-mail já cadastrado';
                }else {
                    this.errorMessage = err.error?.message || 'Erro ao fazer cadastro. Tente novamente';
                }
            }
        });
    }
     
    
}