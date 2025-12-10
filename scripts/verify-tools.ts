
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ToolRegistry } from '../src/lib/ai/tool-registry';

// 1. Polyfill import.meta.env
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};

envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        envVars[key.trim()] = value.trim();
    }
});

// @ts-ignore
global.import = { // Mimic Vite's import.meta.env
    meta: {
        env: envVars
    }
};

async function run() {
    console.log("Initializing ToolRegistry...");
    const registry = new ToolRegistry();

    // --- SYSTEM ---
    console.log("\n--- TEST: navigate ---");
    console.log(await registry.execute('navigate', { path: '/finance' }));

    console.log("\n--- TEST: get_user_info ---");
    console.log(await registry.execute('get_user_info', {}));

    // --- TASKS ---
    console.log("\n--- TEST: add_task ---");
    console.log(await registry.execute('add_task', {
        title: "Test Task via Script",
        due_date: "2025-12-25",
        description: "Created by automated verification",
        collaborator_name: "Test Bot"
    }));

    console.log("\n--- TEST: list_tasks ---");
    console.log(await registry.execute('list_tasks', { limit: 2 }));

    // --- FINANCE ---
    console.log("\n--- TEST: get_financial_kpis ---");
    console.log(await registry.execute('get_financial_kpis', {}));

    console.log("\n--- TEST: add_transaction ---");
    console.log(await registry.execute('add_transaction', {
        description: "Test Expense Script",
        amount: 50.00,
        type: "expense",
        category: "Test"
    }));

    // --- INVENTORY ---
    console.log("\n--- TEST: check_inventory ---");
    console.log(await registry.execute('check_inventory', { query: '' })); // should list all

    // --- COLLABORATORS ---
    console.log("\n--- TEST: list_collaborators ---");
    console.log(await registry.execute('list_collaborators', {}));

    // --- QUOTES ---
    console.log("\n--- TEST: list_quotes ---");
    console.log(await registry.execute('list_quotes', {}));

    // --- SCHEDULE ---
    console.log("\n--- TEST: list_schedule ---");
    console.log(await registry.execute('list_schedule', { date: '2025-12-10' }));
}

run();
