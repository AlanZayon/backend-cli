# 🚀 Backend Project Generator CLI

A powerful command-line tool to scaffold production-ready backend projects using Node.js or NestJS with JavaScript or TypeScript, supporting multiple architectural patterns.

## ✨ Features

- **Multiple Architecture Options**:
  - 🏗️ Layer-based (Traditional MVC)
  - 🧩 Modular (Feature-based)
  - 🏰 DDD (Domain-Driven Design)

- **Technology Choices**:
  - ✅ Express.js (JavaScript / TypeScript)
  - ✅ NestJS (JavaScript / TypeScript)

- **Complete Project Setup**:
  - ✅ Docker & Docker Compose ready
  - ✅ Pre-configured:
    - Winston logging
    - ESLint + Prettier
    - Jest testing
    - Git hooks (Husky)
    - Environment variables

## 📦 Installation

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

## ⚙️ Usage

```bash
npx create-backend-ultimate@latest
```

Then follow the interactive prompts to:

- Enter project name  
- Choose backend framework (Node.js or NestJS)  
- Choose language (JavaScript or TypeScript)  
- Select architecture pattern  
- Choose additional features  

## 📁 What's Generated

A complete backend project with:

```
project-name/
├── src/
│   ├── config/         # Environment and logger configs
│   ├── controllers/    # Business logic handlers
│   ├── routes/         # API endpoints (Express)
│   └── main.ts         # App entry point (Express or NestJS)
├── test/               # Test suites
├── .env                # Environment variables
├── Dockerfile          # Production container setup
└── docker-compose.yml  # Local development stack
```

## 🏛️ Supported Architectures

### 1. Layer-Based (MVC)

```
src/
├── controllers/
├── services/
├── repositories/
├── models/
└── routes/
```

### 2. Modular (Feature-based)

```
src/
└── modules/
    ├── user/
    │   ├── user.controller.ts
    │   └── user.service.ts
    └── product/
```

### 3. Domain-Driven Design (DDD)

```
src/
├── domain/
├── application/
├── infrastructure/
└── interfaces/
```

## 🛠️ Development Setup for Contributors

1. Fork the repository  
2. Install dependencies:

```bash
npm install
```

3. Run tests:

```bash
npm test
```

4. Make your changes following our Contribution Guidelines

## 💡 Why Use This Generator?

- ⏱️ Saves 10+ hours of initial project setup  
- 🛡️ Production-ready best practices out of the box  
- 🔄 Consistent architecture across team projects  
- 🔍 Testable structure from day one  

## 🗺️ Roadmap

- ✅ Add NestJS option (JavaScript & TypeScript)
- 🔜 Support for GraphQL  
- 🔜 Database ORM integration  
- 🔜 Authentication templates  

## 📜 License

MIT © Alan Zayon da Silva Mac