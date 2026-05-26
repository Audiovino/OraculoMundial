import { describe, it, expect } from 'vitest';
import { calculatePredictionScore } from './worldcupApi';

describe('Sistema de Puntos - Oráculo Mundial', () => {
  it('debe otorgar 10 puntos por un resultado exacto', () => {
    const score = calculatePredictionScore(2, 1, 2, 1);
    expect(score).toBe(10);
  });

  it('debe otorgar 5 puntos por acertar el ganador local pero no los goles', () => {
    const score = calculatePredictionScore(3, 0, 1, 0);
    expect(score).toBe(5);
  });

  it('debe otorgar 5 puntos por acertar el ganador visitante pero no los goles', () => {
    const score = calculatePredictionScore(0, 2, 0, 1);
    expect(score).toBe(5);
  });

  it('debe otorgar 5 puntos por acertar un empate pero no los goles exactos', () => {
    const score = calculatePredictionScore(1, 1, 2, 2);
    expect(score).toBe(5);
  });

  it('debe otorgar 0 puntos si no acierta ni ganador ni resultado', () => {
    const score = calculatePredictionScore(2, 0, 0, 1);
    expect(score).toBe(0);
  });

  it('debe manejar correctamente marcadores de cero goles', () => {
    expect(calculatePredictionScore(0, 0, 0, 0)).toBe(10);
  });

  it('debe otorgar 0 puntos si predice empate y gana alguien', () => {
    expect(calculatePredictionScore(1, 1, 2, 0)).toBe(0);
  });
});