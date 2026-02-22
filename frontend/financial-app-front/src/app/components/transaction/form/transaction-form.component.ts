import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
// import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.css']
})
export class TransactionFormComponent implements OnInit {
  transactionForm!: FormGroup;
  isEditing = false;
  transactionId: string | null = null;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    // private transactionService: TransactionService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  private initForm(): void {
    this.transactionForm = this.fb.group({
      type: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(3)]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      dueDate: ['', Validators.required],
      category: [''],
      status: ['pending'],
      notes: [''],
      paidAt: ['']
    });
  }

  private checkEditMode(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditing = true;
        this.transactionId = params['id'];
        this.loadTransaction();
      }
    });
  }

  private loadTransaction(): void {
    if (!this.transactionId) return;

    // this.transactionService.getTransaction(this.transactionId).subscribe({
    //   next: (transaction) => {
    //     this.transactionForm.patchValue({
    //       type: transaction.type,
    //       description: transaction.description,
    //       amount: transaction.amount,
    //       dueDate: this.formatDate(transaction.dueDate),
    //       category: transaction.category,
    //       status: transaction.status,
    //       notes: transaction.notes,
    //       paidAt: transaction.paidAt ? this.formatDate(transaction.paidAt) : ''
    //     });
    //   },
    //   error: (error) => {
    //     console.error('Error loading transaction:', error);
    //     this.errorMessage = 'Erro ao carregar transação';
    //   }
    // });
  }

  private formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  get type(): FormControl {
    return this.transactionForm.get('type') as FormControl;
  }

  get description(): FormControl {
    return this.transactionForm.get('description') as FormControl;
  }

  get amount(): FormControl {
    return this.transactionForm.get('amount') as FormControl;
  }

  get dueDate(): FormControl {
    return this.transactionForm.get('dueDate') as FormControl;
  }

  get status(): FormControl {
    return this.transactionForm.get('status') as FormControl;
  }

  onSubmit(): void {
    if (this.transactionForm.invalid) {
      this.markFormGroupTouched(this.transactionForm);
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const formData = this.transactionForm.value;

    if (this.isEditing && this.transactionId) {
      // Update existing transaction
    //   this.transactionService.updateTransaction(this.transactionId, formData).subscribe({
    //     next: () => {
    //       this.isSaving = false;
    //       this.successMessage = 'Transação atualizada com sucesso!';
          
    //       setTimeout(() => {
    //         this.router.navigate(['/transactions']);
    //       }, 1500);
    //     },
    //     error: (error) => {
    //       this.isSaving = false;
    //       console.error('Error updating transaction:', error);
    //       this.errorMessage = error.error?.message || 'Erro ao atualizar transação';
    //     }
    //   });
    } else {
      // Create new transaction
    //   this.transactionService.createTransaction(formData).subscribe({
    //     next: () => {
    //       this.isSaving = false;
    //       this.successMessage = 'Transação criada com sucesso!';
          
    //       setTimeout(() => {
    //         this.router.navigate(['/transactions']);
    //       }, 1500);
    //     },
    //     error: (error) => {
    //       this.isSaving = false;
    //       console.error('Error creating transaction:', error);
    //       this.errorMessage = error.error?.message || 'Erro ao criar transação';
    //     }
    //   });
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}