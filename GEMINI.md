# Project Analysis: nine-e2e

## Overview
The `nine-e2e` project is a comprehensive automated testing suite built with **Playwright** and **TypeScript**. It supports multiple testing layers, including End-to-End (E2E) UI testing and API testing, with a strong emphasis on multi-role authentication and environment-specific configuration.

## Tech Stack
- **Testing Framework:** [Playwright](https://playwright.dev/)
- **Language:** TypeScript
- **Test Data Generation:** [@faker-js/faker](https://fakerjs.dev/)
- **Environment Management:** AWS SDK (`@aws-sdk/client-ssm`) for fetching secrets.
- **CI/CD Integration:** Supports standard Junit and HTML reporting.

## Project Structure
```text
nine-e2e/
├── src/
│   ├── api/             # API clients (BaseClient, etc.)
│   ├── fixtures/        # Playwright custom fixtures (POM injection)
│   ├── helpers/         # Auth, Environment, and AWS utilities
│   ├── pages/           # Page Object Models (POM)
│   ├── test-data/       # Data factories
│   └── types/           # TypeScript interfaces and types
├── tests/
│   ├── api/             # API-level test specs
│   ├── e2e/             # End-to-end UI test specs
│   └── smoke/           # Fast feedback smoke tests
├── global-setup.ts      # Multi-role authentication & state management
└── playwright.config.ts # Core Playwright configuration
```

## Key Architectural Patterns

### 1. Page Object Model (POM)
The project uses the POM pattern to abstract UI interactions. Pages are located in `src/pages/` (e.g., `LoginPage`, `ProfilePage`).

### 2. Custom Fixtures
Instead of manual instantiation, page objects are injected into tests via custom fixtures defined in `src/fixtures/index.ts`. This allows tests to use clean syntax like:
```typescript
test('example', async ({ loginPage, profilePage }) => {
  await loginPage.login(...);
});
```

### 3. Multi-Role Authentication
Authentication is handled centrally in `global-setup.ts`. It authenticates multiple user roles (Admin, Publisher, Agency, Advertiser) through Cognito and the application's core login, then saves the storage state to `.auth/*.json` files. These states are reused in E2E tests to skip repetitive login steps.

### 4. Dynamic Secret Management
The project fetches environment variables and credentials dynamically from AWS Secrets Manager using `getAwsParameters.ts`. This ensures security and allows for easy configuration across different environments.

## Testing Projects
The configuration defines three main projects:
- **chromium-e2e:** Runs UI tests matched by `tests/e2e/**/*.spec.ts` using stored authentication state.
- **api:** Runs API tests matched by `tests/api/**/*.spec.ts`.
- **smoke:** Runs smoke tests matched by `tests/smoke/**/*.spec.ts` (generally faster and might not depend on pre-authentication).

## How to Run Tests
Common scripts defined in `package.json`:
- `npm test`: Run all tests.
- `npm run test:e2e`: Run E2E tests (Chromium).
- `npm run test:api`: Run API tests.
- `npm run test:smoke`: Run smoke tests.
- `npm run test:ui`: Open Playwright UI mode.
- `npm run report`: Show the HTML test report.

## Reporting
The project generates several types of reports:
- **List:** Console output.
- **HTML:** Interactive browser report.
- **JUnit:** XML report for CI tools (stored in `reports/junit/results.xml`).
