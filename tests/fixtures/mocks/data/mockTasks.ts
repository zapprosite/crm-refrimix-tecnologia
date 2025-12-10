export const MOCK_TASKS = [
    {
        id: 'task-1',
        user_id: 'test-user-e2e',
        title: 'Tarefa Teste',
        description: 'Confirmar pedido',
        due_date: new Date().toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '10:00',
        collaborator_name: 'collab-1',
        type: 'Avulsa',
        status: 'Pendente',
        created_at: new Date().toISOString()
    }
];
