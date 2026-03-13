import { FormGroup, FormArray, FormControl } from '@angular/forms';

/**
 * Marca todos os campos de um FormGroup como tocados
 * Útil para exibir mensagens de erro após submit
 * @param formGroup - O FormGroup a ser processado
 */
export function markFormGroupTouched(formGroup: FormGroup | FormArray): void {
  Object.values(formGroup.controls).forEach(control => {
    if (control instanceof FormControl) {
      control.markAsTouched();
      control.markAsDirty();
    } else if (control instanceof FormGroup || control instanceof FormArray) {
      markFormGroupTouched(control);
    }
  });
}

/**
 * Reseta o estado de touched de todos os campos de um FormGroup
 * @param formGroup - O FormGroup a ser processado
 */
export function resetFormGroupTouched(formGroup: FormGroup | FormArray): void {
  Object.values(formGroup.controls).forEach(control => {
    if (control instanceof FormControl) {
      control.markAsUntouched();
      control.markAsPristine();
    } else if (control instanceof FormGroup || control instanceof FormArray) {
      resetFormGroupTouched(control);
    }
  });
}

/**
 * Verifica se um FormGroup tem algum campo inválido
 * @param formGroup - O FormGroup a ser verificado
 * @returns boolean - true se houver campos inválidos
 */
export function hasInvalidFields(formGroup: FormGroup | FormArray): boolean {
  let hasInvalid = false;
  
  Object.values(formGroup.controls).forEach(control => {
    if (control instanceof FormControl) {
      if (control.invalid) {
        hasInvalid = true;
      }
    } else if (control instanceof FormGroup || control instanceof FormArray) {
      if (hasInvalidFields(control)) {
        hasInvalid = true;
      }
    }
  });
  
  return hasInvalid;
}

/**
 * Obtém todos os erros de um FormGroup de forma recursiva
 * @param formGroup - O FormGroup a ser processado
 * @returns objeto com todos os erros
 */
export function getFormValidationErrors(formGroup: FormGroup | FormArray): any[] {
  const errors: any[] = [];
  
  Object.keys(formGroup.controls).forEach(key => {
    const control = formGroup.get(key);
    
    if (control instanceof FormControl) {
      if (control.errors) {
        errors.push({
          field: key,
          errors: control.errors,
          value: control.value
        });
      }
    } else if (control instanceof FormGroup || control instanceof FormArray) {
      const childErrors = getFormValidationErrors(control);
      childErrors.forEach((error: any) => {
        errors.push({
          field: `${key}.${error.field}`,
          errors: error.errors,
          value: error.value
        });
      });
    }
  });
  
  return errors;
}

/**
 * Habilita/Desabilita todos os campos de um FormGroup
 * @param formGroup - O FormGroup a ser processado
 * @param disabled - true para desabilitar, false para habilitar
 */
export function setFormGroupDisabled(formGroup: FormGroup | FormArray, disabled: boolean): void {
  if (disabled) {
    formGroup.disable();
  } else {
    formGroup.enable();
  }
}