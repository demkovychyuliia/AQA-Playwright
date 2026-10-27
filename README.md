# AQA-Playwright

UI automation testing project using **Playwright** and **TypeScript**.

## Project Overview

This project contains automated UI tests for the QAuto web application.

The project focuses on testing web application functionality, including:

- User registration and authentication
- Form validation
- Positive and negative test scenarios
- Boundary value testing
- UI elements and user interactions

## Tech Stack

- Playwright Test
- TypeScript
- Node.js and npm

## Prerequisites

- Node.js and npm
- Git
- Valid HTTP Basic Auth credentials for QAuto

## Installation

Clone the repository:

```bash
git clone https://github.com/xxxyuliia/AQA-Playwright.git
cd AQA-Playwright
```

Install dependencies and browsers:

```bash
npm install
npx playwright install
```

## Basic Authentication

The QAuto website is protected by **HTTP Basic Authentication**. Credentials are stored locally and are not committed to Git.

1. Copy `config/auth.example.json` to `config/auth.json`.
2. Replace the placeholders in `config/auth.json` with your Basic Auth credentials:

```json
{
  "username": "YOUR_LOGIN",
  "password": "YOUR_PASSWORD"
}
```

The `playwright.config.ts` file imports these values and passes them to Playwright through `use.httpCredentials`.

The application URL is configured through `use.baseURL`.

> **Security:** Keep `config/auth.json` in `.gitignore`. Never commit real credentials.

## Project Structure

```text
AQA-Playwright/
├── config/
│   ├── auth.example.json
│   └── auth.json              # local only; ignored by Git
├── tests/                    # automated UI tests
├── .gitignore
├── package.json
├── package-lock.json
├── playwright.config.ts
└── README.md
```

## Running Tests

List available tests:

```bash
npx playwright test --list
```

Run all tests:

```bash
npx playwright test
```

Run tests in Chromium:

```bash
npx playwright test --project=chromium
```

Run tests with a visible browser:

```bash
npx playwright test --headed
```

Run Playwright UI mode:

```bash
npx playwright test --ui
```

View the HTML report:

```bash
npx playwright show-report
```

## Test Data

Tests use valid, invalid, and boundary values to verify application behavior.

Where required, unique test data is generated to avoid conflicts between test executions.

Sensitive configuration data and authentication credentials are stored locally and excluded from version control.