# Technical Assessment Project

An Angular application scaffolded with [Angular CLI](https://github.com/angular/angular-cli) version 20.3.12, using Angular 20 with strict TypeScript configuration.

## Tech Stack

- **Framework:** Angular 20
- **Language:** TypeScript 5.9
- **Build Tool:** Angular CLI / `@angular/build`
- **Testing:** Karma + Jasmine
- **Styling:** SCSS
- **Module System:** ES2022 / `preserve` modules
- **Reactive:** RxJS 7.8

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [Angular CLI](https://angular.dev/tools/cli) — install globally:

```bash
npm install -g @angular/cli
```

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
ng serve
```

Navigate to `http://localhost:4200/` in your browser. The app reloads automatically on file changes.

## Project Structure

```
technical-assessment-project/
├── src/
│   ├── app/          # Application components, services, modules
│   ├── main.ts       # Application entry point
│   └── styles.css    # Global styles
├── public/           # Static assets
├── angular.json      # Angular CLI workspace configuration
├── tsconfig.json     # Base TypeScript configuration
├── tsconfig.app.json # TypeScript config for the app build
├── tsconfig.spec.json# TypeScript config for tests
└── package.json      # Dependencies and scripts
```

## Available Scripts

| Command           | Description                                      |
|-------------------|--------------------------------------------------|
| `npm start`       | Start the development server (`ng serve`)        |
| `npm run build`   | Build for production (`dist/`)                   |
| `npm run watch`   | Build in watch mode (development configuration)  |
| `npm test`        | Run unit tests via Karma                         |

## Building

Build the project for production:

```bash
ng build
```

Output artifacts are placed in the `dist/` directory. The production build optimizes the application for performance (output hashing, budgets enforced).

**Build budgets:**
- Initial bundle: warning at 500 kB, error at 1 MB
- Component styles: warning at 4 kB, error at 8 kB

## Running Tests

Execute unit tests with the Karma test runner:

```bash
ng test
```

## Code Scaffolding

Generate a new component:

```bash
ng generate component component-name
```

List all available schematics:

```bash
ng generate --help
```

## TypeScript Configuration

This project uses strict TypeScript settings:

- `strict: true`
- `noImplicitOverride`
- `noPropertyAccessFromIndexSignature`
- `noImplicitReturns`
- `noFallthroughCasesInSwitch`
- Angular strict templates and strict injection parameters

## Code Style

This project uses [Prettier](https://prettier.io/) for code formatting with the following configuration:

- Print width: 100 characters
- Single quotes
- Angular HTML parser for `.html` files

## Additional Resources

- [Angular Documentation](https://angular.dev/)
- [Angular CLI Reference](https://angular.dev/tools/cli)
- [RxJS Documentation](https://rxjs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
