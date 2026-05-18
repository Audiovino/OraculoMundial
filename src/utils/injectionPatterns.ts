/**
 * Injection Attack Patterns
 * Patrones de detección para diferentes tipos de inyecciones
 */

export const INJECTION_PATTERNS = {
  /**
   * SQL Injection patterns
   */
  SQL_INJECTION: [
    // Comentarios SQL
    /--\s*$/,
    /\/\*.*?\*\//,
    /;.*?(drop|delete|update|insert|select|exec|execute)/i,
    
    // Palabras clave SQL peligrosas
    /(\bunion\b.*\bselect\b|\bselect\b.*\bfrom\b|\bwhere\b.*\bor\b.*=)/i,
    /(\bor\b\s+['"]?\d+['"]?\s*=\s*['"]?\d+['"]?)/i,
    /(\bor\b\s+['"]?\w+['"]?\s*=\s*['"]?\w+['"]?)/i,
    
    // Procedimientos almacenados peligrosos
    /\b(xp_|sp_)(cmdshell|regread|regwrite|oacreate|ole|adduser|dropuser)/i,
    
    // UNION-based injection
    /\bunion\b.*\bselect\b/i,
    /\bunion\b.*\ball\b.*\bselect\b/i,
    
    // Stacked queries
    /;\s*(drop|delete|update|insert|create|alter|exec|execute)/i,
    
    // Time-based blind
    /\b(sleep|benchmark|waitfor|pg_sleep)\s*\(/i,
    
    // Boolean-based blind
    /\b(and|or)\b\s+\d+\s*=\s*\d+/i,
    /\b(and|or)\b\s+['"][^'"]*['"]\s*=\s*['"][^'"]*['"]/i,
  ],

  /**
   * XSS (Cross-Site Scripting) patterns
   */
  XSS_INJECTION: [
    // Script tags
    /<script[^>]*>.*?<\/script>/i,
    /<script[^>]*>/i,
    
    // Event handlers
    /on\w+\s*=\s*["'][^"']*["']/i,
    /on\w+\s*=\s*[^\s>]*/i,
    
    // JavaScript protocol
    /javascript:/i,
    /vbscript:/i,
    /data:text\/html/i,
    
    // HTML tags que pueden ejecutar JS
    /<iframe[^>]*>/i,
    /<embed[^>]*>/i,
    /<object[^>]*>/i,
    /<img[^>]*on\w+/i,
    /<svg[^>]*on\w+/i,
    
    // Style tags con expresiones
    /<style[^>]*>.*?<\/style>/i,
    /expression\s*\(/i,
    /behavior\s*:/i,
    
    // Encoded XSS
    /&#x?[0-9a-f]+;/i,
    /%3c/i, // <
    /%3e/i, // >
    /%22/i, // "
    /%27/i, // '
  ],

  /**
   * NoSQL Injection patterns
   */
  NOSQL_INJECTION: [
    // MongoDB operators
    /\$where/i,
    /\$ne/i,
    /\$gt/i,
    /\$lt/i,
    /\$regex/i,
    /\$or/i,
    /\$and/i,
    /\$not/i,
    /\$nor/i,
    /\$exists/i,
    /\$type/i,
    /\$in/i,
    /\$nin/i,
    /\$all/i,
    /\$elemMatch/i,
    /\$size/i,
    /\$mod/i,
    /\$text/i,
    /\$where\s*:/i,
    
    // JSON injection patterns
    /[{}\[\]]/,
    /"\s*:\s*\{/,
    /"\s*:\s*\[/,
  ],

  /**
   * Command Injection patterns
   */
  COMMAND_INJECTION: [
    // Shell metacharacters
    /[;&|`$()]/,
    /\$\(/,
    /`.*`/,
    
    // Command separators
    /;\s*(cat|ls|rm|mv|cp|chmod|chown|kill|ps|grep|sed|awk|find|xargs)/i,
    /\|\s*(cat|ls|rm|mv|cp|chmod|chown|kill|ps|grep|sed|awk|find|xargs)/i,
    /&&\s*(cat|ls|rm|mv|cp|chmod|chown|kill|ps|grep|sed|awk|find|xargs)/i,
    /\|\|\s*(cat|ls|rm|mv|cp|chmod|chown|kill|ps|grep|sed|awk|find|xargs)/i,
    
    // Redirection
    /[<>]\s*\/dev\//i,
    />\s*\/dev\/null/i,
    
    // Command substitution
    /\$\(.*\)/,
    /`.*`/,
  ],

  /**
   * Path Traversal patterns
   */
  PATH_TRAVERSAL: [
    // Directory traversal
    /\.\.\//,
    /\.\.\\/,
    /%2e%2e\//i,
    /%2e%2e\\/i,
    /\.\.%2f/i,
    /\.\.%5c/i,
    
    // Absolute paths
    /^\/etc\//i,
    /^\/var\//i,
    /^\/proc\//i,
    /^\/sys\//i,
    /^[a-z]:\\/i, // Windows paths
    
    // Null byte injection
    /\x00/,
    /%00/i,
  ],
};

/**
 * Categorizar el tipo de ataque detectado
 */
export function categorizeAttack(input: string): string[] {
  const attacks: string[] = [];

  if (INJECTION_PATTERNS.SQL_INJECTION.some(p => p.test(input))) {
    attacks.push('SQL_INJECTION');
  }

  if (INJECTION_PATTERNS.XSS_INJECTION.some(p => p.test(input))) {
    attacks.push('XSS_INJECTION');
  }

  if (INJECTION_PATTERNS.NOSQL_INJECTION.some(p => p.test(input))) {
    attacks.push('NOSQL_INJECTION');
  }

  if (INJECTION_PATTERNS.COMMAND_INJECTION.some(p => p.test(input))) {
    attacks.push('COMMAND_INJECTION');
  }

  if (INJECTION_PATTERNS.PATH_TRAVERSAL.some(p => p.test(input))) {
    attacks.push('PATH_TRAVERSAL');
  }

  return attacks;
}

/**
 * Obtener descripción legible del tipo de ataque
 */
export function getAttackDescription(attackType: string): string {
  const descriptions: Record<string, string> = {
    SQL_INJECTION: 'Intento de inyección SQL detectado',
    XSS_INJECTION: 'Intento de XSS (Cross-Site Scripting) detectado',
    NOSQL_INJECTION: 'Intento de inyección NoSQL detectado',
    COMMAND_INJECTION: 'Intento de inyección de comandos detectado',
    PATH_TRAVERSAL: 'Intento de traversal de directorios detectado',
  };

  return descriptions[attackType] || 'Patrón sospechoso detectado';
}
