/**
 * Security Validator Service
 * Validación y sanitización de inputs contra inyecciones (SQL, XSS, NoSQL)
 */

import { INJECTION_PATTERNS } from '../utils/injectionPatterns';

/**
 * Validar email según RFC 5322
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email es requerido' };
  }

  const trimmed = email.trim();
  
  // RFC 5322 simplified regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Email inválido' };
  }

  if (trimmed.length > 254) {
    return { valid: false, error: 'Email demasiado largo (máx 254 caracteres)' };
  }

  return { valid: true };
}

/**
 * Validar username: 3-20 caracteres, solo alphanumeric + underscore
 */
export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username || typeof username !== 'string') {
    return { valid: false, error: 'Nombre de usuario es requerido' };
  }

  const trimmed = username.trim();

  if (trimmed.length < 3) {
    return { valid: false, error: 'Nombre de usuario debe tener al menos 3 caracteres' };
  }

  if (trimmed.length > 20) {
    return { valid: false, error: 'Nombre de usuario no puede exceder 20 caracteres' };
  }

  // Solo alphanumeric + underscore
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(trimmed)) {
    return { valid: false, error: 'Nombre de usuario solo puede contener letras, números y guiones bajos' };
  }

  return { valid: true };
}

/**
 * Validar password: min 8 chars, 1 mayúscula, 1 número, 1 especial
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Contraseña es requerida' };
  }

  if (password.length < 8) {
    return { valid: false, error: 'Contraseña debe tener al menos 8 caracteres' };
  }

  if (password.length > 128) {
    return { valid: false, error: 'Contraseña no puede exceder 128 caracteres' };
  }

  // Verificar mayúscula
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Contraseña debe contener al menos una mayúscula' };
  }

  // Verificar número
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Contraseña debe contener al menos un número' };
  }

  // Verificar carácter especial
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, error: 'Contraseña debe contener al menos un carácter especial' };
  }

  return { valid: true };
}

/**
 * Sanitizar string: remover caracteres peligrosos
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input.trim();

  // Remover caracteres de control
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

  // Escapar caracteres HTML especiales
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  return sanitized;
}

/**
 * Detectar intentos de inyección en un string
 */
export function detectInjectionAttempt(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }

  const lowerInput = input.toLowerCase();

  // Verificar contra todos los patrones de inyección
  for (const pattern of INJECTION_PATTERNS.SQL_INJECTION) {
    if (pattern.test(lowerInput)) return true;
  }

  for (const pattern of INJECTION_PATTERNS.XSS_INJECTION) {
    if (pattern.test(lowerInput)) return true;
  }

  for (const pattern of INJECTION_PATTERNS.NOSQL_INJECTION) {
    if (pattern.test(lowerInput)) return true;
  }

  for (const pattern of INJECTION_PATTERNS.COMMAND_INJECTION) {
    if (pattern.test(lowerInput)) return true;
  }

  for (const pattern of INJECTION_PATTERNS.PATH_TRAVERSAL) {
    if (pattern.test(lowerInput)) return true;
  }

  return false;
}

/**
 * Validar datos de formulario completo
 */
export function validateFormData(data: any): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: { form: 'Datos inválidos' } };
  }

  // Validar email si existe
  if (data.email !== undefined) {
    const emailValidation = validateEmail(data.email);
    if (!emailValidation.valid) {
      errors.email = emailValidation.error || 'Email inválido';
    }
  }

  // Validar username si existe
  if (data.username !== undefined) {
    const usernameValidation = validateUsername(data.username);
    if (!usernameValidation.valid) {
      errors.username = usernameValidation.error || 'Nombre de usuario inválido';
    }
  }

  // Validar password si existe
  if (data.password !== undefined) {
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.valid) {
      errors.password = passwordValidation.error || 'Contraseña inválida';
    }
  }

  // Detectar inyecciones en email y username
  if (data.email && detectInjectionAttempt(data.email)) {
    errors.email = 'Entrada sospechosa detectada en email';
  }

  if (data.username && detectInjectionAttempt(data.username)) {
    errors.username = 'Entrada sospechosa detectada en nombre de usuario';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validar y sanitizar un campo específico
 */
export function validateAndSanitize(
  value: string,
  fieldType: 'email' | 'username' | 'text'
): { valid: boolean; sanitized: string; error?: string } {
  if (!value || typeof value !== 'string') {
    return { valid: false, sanitized: '', error: 'Valor requerido' };
  }

  let validation;

  switch (fieldType) {
    case 'email':
      validation = validateEmail(value);
      break;
    case 'username':
      validation = validateUsername(value);
      break;
    case 'text':
      validation = { valid: true };
      break;
    default:
      return { valid: false, sanitized: '', error: 'Tipo de campo desconocido' };
  }

  if (!validation.valid) {
    return { valid: false, sanitized: '', error: validation.error };
  }

  // Detectar inyecciones
  if (detectInjectionAttempt(value)) {
    return { valid: false, sanitized: '', error: 'Entrada sospechosa detectada' };
  }

  // Sanitizar
  const sanitized = sanitizeInput(value);

  return { valid: true, sanitized };
}

/**
 * Obtener información de seguridad sobre un string
 */
export function getSecurityInfo(input: string): {
  length: number;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumbers: boolean;
  hasSpecialChars: boolean;
  hasInjectionPatterns: boolean;
  riskLevel: 'low' | 'medium' | 'high';
} {
  const hasUppercase = /[A-Z]/.test(input);
  const hasLowercase = /[a-z]/.test(input);
  const hasNumbers = /[0-9]/.test(input);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(input);
  const hasInjectionPatterns = detectInjectionAttempt(input);

  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (hasInjectionPatterns) {
    riskLevel = 'high';
  } else if (input.length > 100 || input.includes('<') || input.includes('>')) {
    riskLevel = 'medium';
  }

  return {
    length: input.length,
    hasUppercase,
    hasLowercase,
    hasNumbers,
    hasSpecialChars,
    hasInjectionPatterns,
    riskLevel
  };
}
