export const MOCK_TRANSACTIONS = [
    {
        id: 'trans-1',
        user_id: 'test-user-e2e',
        description: 'Venda de serviço',
        amount: 1500,
        transaction_date: new Date().toISOString().split('T')[0],
        type: 'income',
        category: 'Serviços',
        entity: 'CNPJ'
    }
];
