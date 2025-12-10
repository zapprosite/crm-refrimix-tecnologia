# Playwright Refactor Plan - Dec 2024

## Current State
- **Monolithic File**: `tests/e2e/crm-e2e.spec.ts` handles Auth, Navigation, Leads, Tasks, Finance, Chatbot.
- **Missing Coverage**: Inventory, Schedule, Quotes, Collaborators, Settings.
- **No Page Objects**: Tests rely on loose locators (`page.getByLabel`, etc.) making maintenance harder.
- **Fixtures**: `tests/e2e/fixtures.ts` provides good mocking foundations but needs to expose Page Objects.

## Proposed Structure

### 1. Core Infrastructure
- `tests/fixtures/auth.fixture.ts`: Enhance to provide pre-logged-in contexts and expose POs.
- `tests/pages/BasePage.ts`: Common methods (toast handling, dialogs).
- `tests/pages/DashboardPage.ts`
- `tests/pages/LeadsPage.ts`
- `tests/pages/TasksPage.ts`
- `tests/pages/FinancePage.ts`
- `tests/pages/InventoryPage.ts`
- `tests/pages/SchedulePage.ts`
- `tests/pages/QuotesPage.ts`
- `tests/pages/CollaboratorsPage.ts`
- `tests/pages/ChatbotPage.ts`

### 2. E2E Test Files (Split)
- `tests/e2e/auth.spec.ts`: Login/Logout flows.
- `tests/e2e/leads.spec.ts`: CRUD + Status + Filters.
- `tests/e2e/tasks.spec.ts`: CRUD + Collaboration.
- `tests/e2e/finance.spec.ts`: Income/Expense + KPIs.
- `tests/e2e/inventory.spec.ts`: Items + Stock adjustments.
- `tests/e2e/schedule.spec.ts`: Calendar events.
- `tests/e2e/quotes.spec.ts`: Creation and Management.
- `tests/e2e/collaborators.spec.ts`: Team management.
- `tests/e2e/chatbot-agent.spec.ts`: AI tools execution verification.

## Implementation Steps
1. Create `tests/pages/` directory.
2. Implement Page Objects inheriting from BasePage.
3. Update `fixtures.ts` to include these POs.
4. Split `crm-e2e.spec.ts` into individual spec files using the new POs.
5. Add missing test cases (Schedule, Inventory, etc.).
