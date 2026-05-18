/**
 * Supabase Monitor Service
 * Monitoreo de uso del tier gratuito de Supabase
 */

import { mundialSupabase } from './mundialSupabaseClient';

/**
 * Límites del Supabase Free Tier
 */
export const SUPABASE_LIMITS = {
  STORAGE_MB: 500,
  BANDWIDTH_GB: 1,
  ROWS_PER_TABLE: 50000,
  CONCURRENT_CONNECTIONS: 100,
  REQUESTS_PER_SECOND: 200,
  WARNING_THRESHOLD: 0.8, // 80%
  CRITICAL_THRESHOLD: 0.95, // 95%
};

/**
 * Interfaz de métricas de Supabase
 */
export interface SupabaseMetrics {
  storageUsed: number; // en MB
  bandwidthUsed: number; // en GB
  rowsUsed: Record<string, number>; // tabla -> cantidad de filas
  connectionsActive: number;
  requestsThisSecond: number;
  lastUpdated: Date;
  timestamp: string;
}

/**
 * Clase para monitorear Supabase
 */
export class SupabaseMonitor {
  private metricsHistory: SupabaseMetrics[] = [];
  private usageLog: Array<{ operation: string; bytes: number; timestamp: Date }> = [];

  /**
   * Obtener métricas actuales
   */
  async getMetrics(): Promise<SupabaseMetrics> {
    try {
      const metrics: SupabaseMetrics = {
        storageUsed: 0,
        bandwidthUsed: 0,
        rowsUsed: {},
        connectionsActive: 0,
        requestsThisSecond: 0,
        lastUpdated: new Date(),
        timestamp: new Date().toISOString(),
      };

      // Obtener cantidad de filas por tabla
      const tables = ['mundial_users', 'mundial_predictions', 'mundial_rankings'];

      for (const table of tables) {
        try {
          const { count, error } = await mundialSupabase
            .from(table)
            .select('*', { count: 'exact', head: true });

          if (!error && count !== null) {
            metrics.rowsUsed[table] = count;
          }
        } catch (err) {
          console.warn(`Error contando filas en ${table}:`, err);
        }
      }

      // Estimar storage basado en uso de logs
      metrics.storageUsed = this.estimateStorageUsage();

      // Estimar bandwidth basado en logs
      metrics.bandwidthUsed = this.estimateBandwidthUsage();

      // Guardar en historial
      this.metricsHistory.push(metrics);

      // Mantener solo últimas 100 métricas
      if (this.metricsHistory.length > 100) {
        this.metricsHistory = this.metricsHistory.slice(-100);
      }

      return metrics;
    } catch (error) {
      console.error('Error obteniendo métricas de Supabase:', error);
      throw error;
    }
  }

  /**
   * Verificar límites y generar alertas
   */
  async checkLimits(): Promise<{ status: 'ok' | 'warning' | 'critical'; alerts: string[] }> {
    try {
      const metrics = await this.getMetrics();
      const alerts: string[] = [];
      let status: 'ok' | 'warning' | 'critical' = 'ok';

      // Verificar storage
      const storagePercent = metrics.storageUsed / SUPABASE_LIMITS.STORAGE_MB;
      if (storagePercent > SUPABASE_LIMITS.CRITICAL_THRESHOLD) {
        alerts.push(`🔴 CRÍTICO: Almacenamiento al ${(storagePercent * 100).toFixed(1)}% (${metrics.storageUsed}MB/${SUPABASE_LIMITS.STORAGE_MB}MB)`);
        status = 'critical';
      } else if (storagePercent > SUPABASE_LIMITS.WARNING_THRESHOLD) {
        alerts.push(`⚠️ Acercándose a límite de almacenamiento: ${(storagePercent * 100).toFixed(1)}% (${metrics.storageUsed}MB/${SUPABASE_LIMITS.STORAGE_MB}MB)`);
        if (status === 'ok') status = 'warning';
      }

      // Verificar bandwidth
      const bandwidthPercent = metrics.bandwidthUsed / SUPABASE_LIMITS.BANDWIDTH_GB;
      if (bandwidthPercent > SUPABASE_LIMITS.CRITICAL_THRESHOLD) {
        alerts.push(`🔴 CRÍTICO: Ancho de banda al ${(bandwidthPercent * 100).toFixed(1)}% (${metrics.bandwidthUsed.toFixed(2)}GB/${SUPABASE_LIMITS.BANDWIDTH_GB}GB)`);
        status = 'critical';
      } else if (bandwidthPercent > SUPABASE_LIMITS.WARNING_THRESHOLD) {
        alerts.push(`⚠️ Consumo de ancho de banda alto: ${(bandwidthPercent * 100).toFixed(1)}% (${metrics.bandwidthUsed.toFixed(2)}GB/${SUPABASE_LIMITS.BANDWIDTH_GB}GB)`);
        if (status === 'ok') status = 'warning';
      }

      // Verificar filas por tabla
      for (const [table, rows] of Object.entries(metrics.rowsUsed)) {
        const rowsPercent = rows / SUPABASE_LIMITS.ROWS_PER_TABLE;
        if (rowsPercent > SUPABASE_LIMITS.CRITICAL_THRESHOLD) {
          alerts.push(`🔴 CRÍTICO: Tabla '${table}' al ${(rowsPercent * 100).toFixed(1)}% de filas (${rows}/${SUPABASE_LIMITS.ROWS_PER_TABLE})`);
          status = 'critical';
        } else if (rowsPercent > SUPABASE_LIMITS.WARNING_THRESHOLD) {
          alerts.push(`⚠️ Tabla '${table}' acercándose a límite: ${(rowsPercent * 100).toFixed(1)}% (${rows}/${SUPABASE_LIMITS.ROWS_PER_TABLE})`);
          if (status === 'ok') status = 'warning';
        }
      }

      return { status, alerts };
    } catch (error) {
      console.error('Error verificando límites:', error);
      return {
        status: 'critical',
        alerts: ['Error al verificar límites de Supabase']
      };
    }
  }

  /**
   * Registrar uso de operación
   */
  async logUsage(operation: string, bytes: number): Promise<void> {
    this.usageLog.push({
      operation,
      bytes,
      timestamp: new Date(),
    });

    // Mantener solo últimas 1000 operaciones
    if (this.usageLog.length > 1000) {
      this.usageLog = this.usageLog.slice(-1000);
    }
  }

  /**
   * Generar reporte de uso
   */
  async generateReport(): Promise<string> {
    try {
      const metrics = await this.getMetrics();
      const { status, alerts } = await this.checkLimits();

      let report = `
╔════════════════════════════════════════════════════════════════╗
║           REPORTE DE USO - SUPABASE MUNDIAL GAME              ║
╚════════════════════════════════════════════════════════════════╝

📊 ESTADO GENERAL: ${status === 'critical' ? '🔴 CRÍTICO' : status === 'warning' ? '⚠️ ADVERTENCIA' : '✅ OK'}

📅 Fecha: ${metrics.timestamp}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💾 ALMACENAMIENTO
  Usado: ${metrics.storageUsed}MB / ${SUPABASE_LIMITS.STORAGE_MB}MB
  Porcentaje: ${((metrics.storageUsed / SUPABASE_LIMITS.STORAGE_MB) * 100).toFixed(1)}%
  Disponible: ${(SUPABASE_LIMITS.STORAGE_MB - metrics.storageUsed).toFixed(1)}MB

📡 ANCHO DE BANDA
  Usado: ${metrics.bandwidthUsed.toFixed(2)}GB / ${SUPABASE_LIMITS.BANDWIDTH_GB}GB
  Porcentaje: ${((metrics.bandwidthUsed / SUPABASE_LIMITS.BANDWIDTH_GB) * 100).toFixed(1)}%
  Disponible: ${(SUPABASE_LIMITS.BANDWIDTH_GB - metrics.bandwidthUsed).toFixed(2)}GB

📋 FILAS POR TABLA
${Object.entries(metrics.rowsUsed)
  .map(([table, rows]) => {
    const percent = ((rows / SUPABASE_LIMITS.ROWS_PER_TABLE) * 100).toFixed(1);
    return `  ${table}: ${rows} / ${SUPABASE_LIMITS.ROWS_PER_TABLE} (${percent}%)`;
  })
  .join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${alerts.length > 0 ? `⚠️ ALERTAS:\n${alerts.map(a => `  ${a}`).join('\n')}\n\n` : ''}

📈 ESTADÍSTICAS DE USO
  Total de operaciones registradas: ${this.usageLog.length}
  Bytes totales transferidos: ${this.getTotalBytesTransferred().toLocaleString()}
  Operación más frecuente: ${this.getMostFrequentOperation()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 RECOMENDACIONES:
${this.getRecommendations(metrics, alerts)}

╚════════════════════════════════════════════════════════════════╝
`;

      return report;
    } catch (error) {
      console.error('Error generando reporte:', error);
      return 'Error al generar reporte';
    }
  }

  /**
   * Verificar si una métrica está cerca del límite
   */
  isNearLimit(metric: keyof SupabaseMetrics, threshold: number = SUPABASE_LIMITS.WARNING_THRESHOLD): boolean {
    if (this.metricsHistory.length === 0) return false;

    const latestMetrics = this.metricsHistory[this.metricsHistory.length - 1];
    const value = latestMetrics[metric];

    if (typeof value === 'number') {
      let limit = 0;
      switch (metric) {
        case 'storageUsed':
          limit = SUPABASE_LIMITS.STORAGE_MB;
          break;
        case 'bandwidthUsed':
          limit = SUPABASE_LIMITS.BANDWIDTH_GB;
          break;
        case 'connectionsActive':
          limit = SUPABASE_LIMITS.CONCURRENT_CONNECTIONS;
          break;
        case 'requestsThisSecond':
          limit = SUPABASE_LIMITS.REQUESTS_PER_SECOND;
          break;
      }

      return (value / limit) > threshold;
    }

    return false;
  }

  /**
   * Obtener historial de métricas
   */
  getMetricsHistory(): SupabaseMetrics[] {
    return [...this.metricsHistory];
  }

  /**
   * Limpiar historial
   */
  clearHistory(): void {
    this.metricsHistory = [];
    this.usageLog = [];
  }

  // ============ MÉTODOS PRIVADOS ============

  private estimateStorageUsage(): number {
    // Estimar basado en logs de uso
    const totalBytes = this.usageLog.reduce((sum, log) => sum + log.bytes, 0);
    return totalBytes / (1024 * 1024); // Convertir a MB
  }

  private estimateBandwidthUsage(): number {
    // Estimar basado en logs de uso (simplificado)
    const totalBytes = this.usageLog.reduce((sum, log) => sum + log.bytes, 0);
    return totalBytes / (1024 * 1024 * 1024); // Convertir a GB
  }

  private getTotalBytesTransferred(): number {
    return this.usageLog.reduce((sum, log) => sum + log.bytes, 0);
  }

  private getMostFrequentOperation(): string {
    const operations = this.usageLog.reduce((acc, log) => {
      acc[log.operation] = (acc[log.operation] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sorted = Object.entries(operations).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : 'N/A';
  }

  private getRecommendations(metrics: SupabaseMetrics, alerts: string[]): string {
    const recommendations: string[] = [];

    if (alerts.length === 0) {
      recommendations.push('  ✅ Todo está dentro de los límites. Continúa monitoreando.');
    } else {
      if (alerts.some(a => a.includes('Almacenamiento'))) {
        recommendations.push('  • Considera eliminar datos antiguos o archivos innecesarios');
        recommendations.push('  • Revisa si hay registros duplicados que puedan limpiarse');
      }

      if (alerts.some(a => a.includes('ancho de banda'))) {
        recommendations.push('  • Optimiza las consultas para reducir transferencia de datos');
        recommendations.push('  • Implementa paginación en listados');
        recommendations.push('  • Considera cachear datos en el cliente');
      }

      if (alerts.some(a => a.includes('filas'))) {
        recommendations.push('  • Archiva datos antiguos en una tabla separada');
        recommendations.push('  • Implementa políticas de retención de datos');
      }
    }

    return recommendations.join('\n');
  }
}

// Instancia global del monitor
export const supabaseMonitor = new SupabaseMonitor();
