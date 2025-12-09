import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LeadForm } from '@/components/forms/LeadForm';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('LeadForm Integration', () => {
    const mockOnSubmit = vi.fn();

    beforeEach(() => {
        mockOnSubmit.mockClear();
        // Mock global fetch for ViaCEP
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should render form fields correctly', () => {
        render(<LeadForm onSubmit={mockOnSubmit} />);
        expect(screen.getByLabelText(/Nome Completo/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Valor/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Salvar Lead/i })).toBeInTheDocument();
    });

    it('should show validation errors for empty required fields', async () => {
        render(<LeadForm onSubmit={mockOnSubmit} />);

        const submitButton = screen.getByRole('button', { name: /Salvar Lead/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            // Check for specific validation messages defined in Zod schema
            // "Nome deve ter pelo menos 2 caracteres"
            expect(screen.getByText(/Nome deve ter pelo menos 2 caracteres/i)).toBeInTheDocument();
            // "Valor é obrigatório"
            expect(screen.getByText(/Valor é obrigatório/i)).toBeInTheDocument();
        });

        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should submit form with valid data', async () => {
        const user = userEvent.setup();
        render(<LeadForm onSubmit={mockOnSubmit} />);

        await user.type(screen.getByLabelText(/Nome Completo/i), 'Test User');
        await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
        await user.type(screen.getByLabelText(/WhatsApp/i), '11999999999'); // gets masked
        await user.type(screen.getByLabelText(/Valor/i), '1500');
        await user.type(screen.getByLabelText(/Número/i), '123');
        await user.type(screen.getByLabelText(/Endereço/i), 'Rua Teste');
        await user.type(screen.getByLabelText(/Cidade/i), 'São Paulo');
        await user.type(screen.getByLabelText(/UF/i), 'SP');
        await user.type(screen.getByLabelText(/CEP/i), '00000000');
        await user.type(screen.getByLabelText(/CPF/i), '12345678901');

        await user.click(screen.getByRole('button', { name: /Salvar Lead/i }));

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalled();
        });

        // Verify onSubmit payload
        const submittedData = mockOnSubmit.mock.calls[0][0];
        expect(submittedData.name).toBe('Test User');
        expect(submittedData.value).toBe(1500); // Converted to number
    });

    it('should fetch CEP and fill address', async () => {
        const user = userEvent.setup();
        const mockAddress = {
            logradouro: 'Praça da Sé',
            localidade: 'São Paulo',
            uf: 'SP',
            erro: false
        };

        (global.fetch as any).mockResolvedValue({
            json: async () => mockAddress,
            ok: true
        });

        render(<LeadForm onSubmit={mockOnSubmit} />);

        const cepInput = screen.getByLabelText(/CEP/i);
        await user.type(cepInput, '01001000'); // 8 digits

        // Trigger blur to fire handleCepBlur
        fireEvent.blur(cepInput);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('01001000'));
        });

        await waitFor(() => {
            expect(screen.getByDisplayValue('Praça da Sé')).toBeInTheDocument();
            expect(screen.getByDisplayValue('São Paulo')).toBeInTheDocument();
        });
    });
});
