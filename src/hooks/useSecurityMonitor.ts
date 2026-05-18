/**
 * useSecurityMonitor Hook
 * Hook personalizado para monitoreo de seguridad y Supabase
 */

import { useEffect, useState, useCallback } from 'react';
import { SupabaseMetrics, supabaseMonitor } from '../services/supabaseMonitor';
import { detectInjectionAttempt, validateFormData } from '../services/securityValidator';

interface SecurityMonitorState {
  metrics: SupabaseMetrics | null;
  alerts: string[];
  isMonitoring: boolean;
  status: 'ok' | 'warning' | 'critical';
  lastUpdated: Date | null;
}

interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/**
 * Hook para monitoreo de seguridad
 * - Ejecuta validaciones automáticamente
 * - Monitorea Supabase cada 5 minutos
 * - Muestra alertas cuando sea necesario
 * - Previene envío de formularios inválidos
 */
export function useSecurityMonitor(autoMonitor: boolean = true) {
  const [state, setState] = useState<SecurityMonitorState>({
    metrics: null,
    alerts: [],
    isMonitoring: false,
    status: 'ok',
    lastUpdated: null,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  /**
   * Ejecutar monitoreo de Supabase
   */
  const runMonitoring = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isMonitoring: true }));

      const metrics = await supabaseMonitor.getMetrics();
      const { status, alerts } = await supabaseMonitor.checkLimits();

      setState(prev => ({
        ...prev,
        metrics,
        alerts,
        status,
        lastUpdated: new Date(),
        isMonitoring: false,
      }));

      // Log de alertas críticas
      if (status === 'critical') {
        console.error('🔴 ALERTA CRÍTICA DE SUPABASE:', alerts);
      } else if (status === 'warning') {
        console.warn('⚠️ ADVERTENCIA DE SUPABASE:', alerts);
      }
    } catch (error) {
      console.error('Error en monitoreo de Supabase:', error);
      setState(prev => ({
        ...prev,
        isMonitoring: false,
        status: 'critical',
        alerts: ['Error al conectar con Supabase'],
      }));
    }
  }, []);

  /**
   * Validar datos de formulario
   */
  const validateForm = useCallback((data: any): ValidationResult => {
    const result = validateFormData(data);

    if (!result.valid) {
      setValidationErrors(result.errors);
    } else {
      setValidationErrors({});
    }

    return result;
  }, []);

  /**
   * Validar campo individual
   */
  const validateField = useCallback((fieldName: string, value: string): boolean => {
    // Detectar inyecciones
    if (detectInjectionAttempt(value)) {
      setValidationErrors(prev => ({
        ...prev,
        [fieldName]: 'Entrada sospechosa detectada',
      }));
      return false;
    }

    // Limpiar error si es válido
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });

    return true;
  }, []);

  /**
   * Registrar operación de Supabase
   */
  const logOperation = useCallback(async (operation: string, bytes: number = 0) => {
    try {
      await supabaseMonitor.logUsage(operation, bytes);
    } catch (error) {
      console.error('Error registrando operación:', error);
    }
  }, []);

  /**
   * Obtener reporte de seguridad
   */
  const getSecurityReport = useCallback(async (): Promise<string> => {
    try {
      return await supabaseMonitor.generateReport();
    } catch (error) {
      console.error('Error generando reporte:', error);
      return 'Error al generar reporte de seguridad';
    }
  }, []);

  /**
   * Limpiar alertas
   */
  const clearAlerts = useCallback(() => {
    setState(prev => ({
      ...prev,
      alerts: [],
    }));
  }, []);

  /**
   * Limpiar errores de validación
   */
  const clearValidationErrors = useCallback(() => {
    setValidationErrors({});
  }, []);

  /**
   * Obtener estado de seguridad general
   */
  const getSecurityStatus = useCallback((): {
    isSecure: boolean;
    hasValidationErrors: boolean;
    hasSupabaseAlerts: boolean;
    overallStatus: 'secure' | 'warning' | 'critical';
  } => {
    const hasValidationErrors = Object.keys(validationErrors).length > 0;
    const hasSupabaseAlerts = state.alerts.length > 0;

    let overallStatus: 'secure' | 'warning' | 'critical' = 'secure';
    if (state.status === 'critical' || (hasValidationErrors && hasSupabaseAlerts)) {
      overallStatus = 'critical';
    } else if (state.status === 'warning' || hasValidationErrors || hasSupabaseAlerts) {
      overallStatus = 'warning';
    }

    return {
      isSecure: overallStatus === 'secure',
      hasValidationErrors,
      hasSupabaseAlerts,
      overallStatus,
    };
  }, [validationErrors, state.status, state.alerts]);

  /**
   * Efecto: Monitoreo automático cada 5 minutos
   */
  useEffect(() => {
    if (!autoMonitor) return;

    // Ejecutar monitoreo inmediatamente
    runMonitoring();

    // Configurar intervalo de 5 minutos
    const interval = setInterval(() => {
      runMonitoring();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [autoMonitor, runMonitoring]);

  /**
   * Efecto: Limpiar errores de validación después de 5 segundos
   */
  useEffect(() => {
    if (Object.keys(validationErrors).length === 0) return;

    const timer = setTimeout(() => {
      // No limpiar automáticamente, dejar que el usuario lo haga
    }, 5000);

    return () => clearTimeout(timer);
  }, [validationErrors]);

  return {
    // Estado
    metrics: state.metrics,
    alerts: state.alerts,
    isMonitoring: state.isMonitoring,
    status: state.status,
    lastUpdated: state.lastUpdated,
    validationErrors,

    // Funciones
    runMonitoring,
    validateForm,
    validateField,
    logOperation,
    getSecurityReport,
    clearAlerts,
    clearValidationErrors,
    getSecurityStatus,
  };
}

/**
 * Hook para validación de formularios con seguridad
 */
export function useSecureForm(initialData: any = {}) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { validateForm, validateField } = useSecurityMonitor(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Validar campo individual
    const isValid = validateField(name, value);

    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));

    if (!isValid) {
      setErrors((prev: any) => ({
        ...prev,
        [name]: 'Entrada sospechosa detectada',
      }));
    } else {
      setErrors((prev: any) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [validateField]);

  const handleSubmit = useCallback((callback: (data: any) => void) => {
    return (e: React.FormEvent) => {
      e.preventDefault();

      const validation = validateForm(formData);

      if (validation.valid) {
        setErrors({});
        callback(formData);
      } else {
        setErrors(validation.errors);
      }
    };
  }, [formData, validateForm]);

  const reset = useCallback(() => {
    setFormData(initialData);
    setErrors({});
  }, [initialData]);

  return {
    formData,
    errors,
    handleChange,
    handleSubmit,
    reset,
    setFormData,
    setErrors,
  };
}
