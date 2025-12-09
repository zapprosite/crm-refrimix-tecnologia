import { describe, it, expect } from 'vitest';
import { maskCPF, maskPhone, maskCEP, formatCurrency } from '@/lib/masks';

describe('Mask Utilities', () => {
    it('should mask CPF correctly', () => {
        expect(maskCPF('12345678901')).toBe('123.456.789-01');
        expect(maskCPF('123')).toBe('123');
    });

    it('should mask Phone correctly', () => {
        expect(maskPhone('11999999999')).toBe('(11) 99999-9999');
        expect(maskPhone('1188888888')).toBe('(11) 8888-8888');
    });

    it('should mask CEP correctly', () => {
        expect(maskCEP('01234567')).toBe('01234-567');
    });

    it('should format Currency correctly', () => {
        // Intl.NumberFormat depends on Node/Browser locale. 
        // We assume pt-BR is supported in jsdom/node environment.
        // Spaces might be non-breaking space (0xa0).
        const result = formatCurrency(1500.50);
        // Normalize space for test
        expect(result.replace(/\s/g, ' ')).toContain('R$ 1.500,50');
    });
});
