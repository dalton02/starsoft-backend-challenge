import { HttpException, HttpStatus } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { AppError } from './app-errors';

enum ENUM_VALIDATION_TYPES {
  'whitelistValidation' = 'whitelistValidation',
  'isNotEmpty' = 'isNotEmpty',
  'isString' = 'isString',
  'isInt' = 'isInt',
  'isNumber' = 'isNumber',
  'isNumberString' = 'isNumberString',
  'isBoolean' = 'isBoolean',
  'isDateString' = 'isDateString',
  'isEmail' = 'isEmail',
  'isStrongPassword' = 'isStrongPassword',
  'isPhoneNumber' = 'isPhoneNumber',
  'IsCPFOrCNPJ' = 'IsCPFOrCNPJ',
}

export function ValidationFactory(
  erros: ValidationError[],
): CustomValidationError {
  return new CustomValidationError(erros);
}

export class CustomValidationError extends AppError {
  private readonly errors: ValidationError[];

  constructor(errors: ValidationError[], message?: string) {
    super(message);
    this.errors = errors;
  }

  private mensagemErro(motivo: ENUM_VALIDATION_TYPES | string): string | null {
    switch (motivo) {
      case ENUM_VALIDATION_TYPES.isNotEmpty:
        return `não deve estar vazia`;
      case ENUM_VALIDATION_TYPES.isString:
        return `deve ser uma string (texto)`;
      case ENUM_VALIDATION_TYPES.isInt:
        return `deve ser um número inteiro`;
      case ENUM_VALIDATION_TYPES.isNumber:
        return `deve ser um número`;
      case ENUM_VALIDATION_TYPES.isNumberString:
        return `deve ser um texto contendo apenas números`;
      case ENUM_VALIDATION_TYPES.isBoolean:
        return `deve ser um booleano (verdadeiro ou falso)`;
      case ENUM_VALIDATION_TYPES.isDateString:
        return `deve ser uma data`;
      case ENUM_VALIDATION_TYPES.isEmail:
        return `deve ser um e-mail`;
      case ENUM_VALIDATION_TYPES.isStrongPassword:
        return `deve ser uma senha forte`;
      case ENUM_VALIDATION_TYPES.whitelistValidation:
        return `não deve existir`;
      case ENUM_VALIDATION_TYPES.isPhoneNumber:
        return `deve ser um número de telefone válido`;
      case ENUM_VALIDATION_TYPES.IsCPFOrCNPJ:
        return `deve ser um CPF ou CNPJ válido`;
      default:
        return null;
    }
  }

  private parseError(
    variable: string,
    reasons: (ENUM_VALIDATION_TYPES | string)[],
  ): string {
    const errors = reasons.map((reason) => {
      const messageError = this.mensagemErro(reason);
      if (messageError) {
        return messageError;
      }
      return `está em um formato inválido`;
    });

    const validErrors = errors.filter((error) => error !== null);
    if (validErrors.length > 0) {
      if (validErrors.length === 1) {
        return `A propriedade "${variable}" ${validErrors[0]}.`;
      }

      const lastError = validErrors.pop();
      const remainingErrors = validErrors.join(', ');
      return `A propriedade "${variable}" ${remainingErrors} e ${lastError}.`;
    }
  }

  private toString(): string {
    return this.errors
      .map((error) => {
        const variable = error.property;
        const reasons = Object.keys(error.constraints || {});
        return this.parseError(variable, reasons);
      })
      .join('\n ');
  }

  toHTTPResponse() {
    return new HttpException(this.toString(), HttpStatus.BAD_REQUEST);
  }
}
