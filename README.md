# 🚀 Backend Project Generator CLI

A powerful command-line tool to scaffold production-ready Node.js/TypeScript backend projects with different architectural patterns.

## Features

- **Multiple Architecture Options**:
  - 🏗️ Layer-based (Traditional MVC)
  - 🧩 Modular (Feature-based)
  - 🏰 DDD (Domain-Driven Design)

- **Complete Project Setup**:
  - ✅ Express.js with TypeScript
  - ✅ Docker & Docker Compose ready
  - ✅ Pre-configured:
    - Winston logging
    - ESLint + Prettier
    - Jest testing
    - Git hooks (Husky)
    - Environment variables

## Installation

### As Global CLI Tool
```bash
npm i -g create-backend-ultimate
```

### For Development
```bash
git clone https://github.com/AlanZayon/backend-cli.git
cd backend-cli
npm install
npm link  # Makes the CLI available globally during development
```

## Usage

```bash
npx create-backend-ultimate@latest
```

Then follow the interactive prompts to:

- Enter project name  
- Select architecture pattern  
- Choose additional options  

## What's Generated

A complete backend project with:

```
project-name/
├── src/
│   ├── config/       # Environment and logger configs
│   ├── controllers/  # Business logic handlers
│   ├── routes/       # API endpoints
│   └── app.ts        # Express application setup
├── test/            # Test suites
├── .env             # Environment variables
├── Dockerfile       # Production container setup
└── docker-compose.yml # Local development stack
```

## Supported Architectures

1. **Layer-Based**
```
src/
├── controllers/
├── services/
├── repositories/
├── models/
└── routes/
```

2. **Modular**
```
src/
└── modules/
    ├── user/
    │   ├── user.controller.ts
    │   └── user.service.ts
    └── product/
```

3. **DDD (Domain-Driven Design)**
```
src/
├── domain/
├── application/
├── infrastructure/
└── interfaces/
```

## Development Setup for Contributors

- Fork the repository  
- Install dependencies:

```bash
npm install
```

- Run tests:

```bash
npm test
```

- Make your changes following our Contribution Guidelines

## Why Use This Generator?

- ⏱️ Saves 10+ hours of initial project setup  
- 🛡️ Production-ready best practices out of the box  
- 🔄 Consistent architecture across team projects  
- 🔍 Testable structure from day one  

## Roadmap

- Add Nest.js option  
- Support for GraphQL  
- Database ORM integration  
- Authentication templates  

## License

MIT © Alan Zayon da Silva Maciel
