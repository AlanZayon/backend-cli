#!/usr/bin/env node

import fs from "fs";
import path from "path";
import prompts from "prompts";
import { execSync } from "child_process";

const layerBasedStructure = {
  controllers: {},
  services: {},
  repositories: {},
  models: {},
  routes: {},
  middlewares: {},
  config: {},
  utils: {},
  tests: {
    unit: {},
    integration: {},
    e2e: {},
  },
};

const modularStructure = {
  modules: {
    user: {
      "user.controller.ts": "",
      "user.service.ts": "",
      "user.repository.ts": "",
      "user.routes.ts": "",
      "user.spec.ts": "",
    },
    auth: {},
    product: {},
  },
  shared: {
    middlewares: {},
    utils: {},
    config: {},
    tests: {
      unit: {},
      integration: {},
      e2e: {},
    },
  },
};

const dddStructure = {
  domain: {
    user: {
      entities: {},
      repositories: {},
      services: {},
      tests: {},
    },
    product: {},
  },
  application: {
    user: {},
    product: {},
  },
  infrastructure: {
    repositories: {},
    orm: {},
    services: {},
  },
  interfaces: {
    controllers: {},
    routes: {},
    middlewares: {},
  },
  shared: {
    utils: {},
    tests: {
      unit: {},
      integration: {},
      e2e: {},
    },
  },
};

function createFolderRecursive(basePath, structure) {
  for (const key in structure) {
    const newPath = path.join(basePath, key);
    if (!fs.existsSync(newPath)) {
      if (key.includes(".")) {
        // It's a file
        fs.writeFileSync(newPath, structure[key]);
      } else {
        // It's a directory
        fs.mkdirSync(newPath);
      }
    }
    if (typeof structure[key] === "object" && !key.includes(".")) {
      createFolderRecursive(newPath, structure[key]);
    }
  }
}

function createFileWithContent(filePath, content) {
  fs.writeFileSync(filePath, content);
}

function packageJsonContent(projectName) {
  return `{
  "name": "${projectName}",
  "version": "1.0.0",
  "main": "dist/app.js",
  "type": "module",
  "scripts": {
    "start": "node dist/app.js",
    "build": "tsc",
    "dev": "ts-node src/app.ts",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint . --ext .ts",
    "lint:fix": "eslint . --ext .ts --fix",
    "format": "prettier --write .",
    "prepare": "node -e \\"try { require.resolve('husky') && require('child_process').execSync('npx husky install') } catch(e) { console.log('Husky not installed, skipping hooks setup') }\\"",
    "audit:fix": "npm audit fix",
    "audit:prod": "npm audit --omit=dev"
  },
  "dependencies": {
    "express": "^4.18.2",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "winston": "^3.11.0",
    "superagent": "^9.0.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/morgan": "^1.9.9",
    "@types/jest": "^29.5.12",
    "@types/node": "^20.12.7",
    "@types/supertest": "^2.0.12",
    "eslint": "^9.3.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-prettier": "^5.1.3",
    "jest": "^29.7.0",
    "prettier": "^3.2.5",
    "supertest": "^6.3.4",
    "ts-jest": "^29.1.2",
    "ts-node": "^10.9.2",
    "typescript": "^5.4.5",
    "husky": "^9.0.11",
    "lint-staged": "^15.2.5",
    "rimraf": "^5.0.5",
    "glob": "^10.3.10",
    "lru-cache": "^10.1.0"
  },
  "overrides": {
  "superagent": "^9.0.0" ,
    "inflight": "^1.0.6",
    "glob": "^10.3.10",
    "rimraf": "^5.0.5"
  }
}`;
}

function tsconfigContent() {
  return `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "types": ["node", "jest"],
    "allowJs": true,
    "checkJs": true,
    "noEmit": false,
    "sourceMap": true,
    "declaration": true,
    "removeComments": false,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src/**/*"],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.spec.ts",
    "**/*.test.ts",
    "**/__tests__/**"
  ]
}`;
}

function appTsContent() {
  return `import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import logger from './config/logger';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
interface HealthStatus {
  status: string;
}

app.get('/health', (req: express.Request, res: express.Response<HealthStatus>) => {
  const response: HealthStatus = { status: 'OK' };
  res.status(200).json(response);
});

// Root endpoint
app.get('/', (req: express.Request, res: express.Response) => {
  res.send('Hello World!');
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
  logger.info(\`Server running at http://localhost:\${port}\`);
});

export default app;
`;
}

function dockerfileContent() {
  return `# Use official Node.js LTS image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy app source code
COPY . .

# Build the app
RUN npm run build

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
`;
}

function dockerComposeContent() {
  return `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - PORT=3000
    volumes:
      - ./:/usr/src/app
      - /usr/src/app/node_modules
    restart: unless-stopped
`;
}

function eslintConfigContent() {
  return `{
  "env": {
    "node": true,
    "es2020": true,
    "jest": true
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint", "prettier"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ],
  "rules": {
    "prettier/prettier": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off"
  },
  "ignorePatterns": ["dist/**", "node_modules/**", "**/*.spec.ts", "**/*.test.ts"]
}
`;
}

function prettierConfigContent() {
  return `{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "trailingComma": "all",
  "bracketSpacing": true,
  "arrowParens": "always"
}
`;
}

function eslintIgnoreContent() {
  return `node_modules
dist
coverage
.env
`;
}

function prettierIgnoreContent() {
  return `node_modules
dist
coverage
.env
`;
}

function envContent() {
  return `# Server configuration
PORT=3000
NODE_ENV=development

# Database configuration (example)
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASSWORD=postgres
# DB_NAME=myapp

# JWT configuration (example)
# JWT_SECRET=your_jwt_secret
# JWT_EXPIRES_IN=1d

# Logging level (error, warn, info, verbose, debug, silly)
LOG_LEVEL=info
`;
}

function jestConfigContent() {
  return `module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/app.ts',
    '!src/config/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  verbose: true
};
`;
}

function loggerConfigContent() {
  return `import winston from 'winston';
import dotenv from 'dotenv';

dotenv.config();

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

export default logger;
`;
}

function huskyConfigContent() {
  return `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
`;
}

function lintStagedConfigContent() {
  return `{
  "*.ts": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{js,json,md}": [
    "prettier --write"
  ]
}
`;
}

async function initializeGitRepo(projectPath) {
  try {
    execSync("git init", {
      cwd: projectPath,
      stdio: "inherit",
      shell: true,
    });
    console.log("✅ Git repository initialized");
    return true;
  } catch (error) {
    console.error("❌ Failed to initialize Git repository:", error.message);
    return false;
  }
}

function checkNodeVersion() {
  const [major, minor] = process.versions.node.split('.').map(Number);
  if (major < 14 || (major === 14 && minor < 18)) {
    console.error('❌ Node.js 14.18.0 ou superior é necessário para superagent@9');
    console.log('Versão atual:', process.versions.node);
    process.exit(1);
  }
}

// Modifique a função installDependencies para:
async function installDependencies(projectPath) {
  console.log('📦 Installing dependencies...');
  checkNodeVersion();
  
  try {
    // Cria a estrutura do husky antecipadamente
    const huskyDir = path.join(projectPath, '.husky');
    if (!fs.existsSync(huskyDir)) {
      fs.mkdirSync(huskyDir, { recursive: true });
    }

      // Create package-lock.json first
      execSync("npm install --package-lock-only", {
        cwd: projectPath,
        stdio: "inherit",
        shell: true,
      });

      // Install all dependencies
      execSync("npm install", {
        cwd: projectPath,
        stdio: "inherit",
        shell: true,
      });

    // Configuração pós-instalação segura
    try {
      execSync('npx husky install', {
        cwd: projectPath,
        stdio: 'ignore'
      });
    } catch {
      console.log('⚠️ Husky setup skipped (not available)');
    }

    console.log('✅ Dependencies installed successfully!');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
}



async function postInstallCheck(projectPath) {
  try {
    console.log('🔍 Running post-install checks...');
    
    // Create lockfile if missing
    if (!fs.existsSync(path.join(projectPath, 'package-lock.json'))) {
      execSync('npm install --package-lock-only', {
        cwd: projectPath,
        stdio: 'inherit',
        shell: true
      });
    }

    // Run audit
    execSync('npm audit', {
      cwd: projectPath,
      stdio: 'inherit',
      shell: true
    });

    console.log('✅ All checks passed!');
  } catch (error) {
    console.log('⚠️ Found potential issues. Run "npm audit fix" to address them.');
  }
}
async function main() {
console.log(`
  🔥 Welcome to BACKEND ULTIMATE CLI
Version 2.0 - Professional Template
`);

  const response = await prompts([
    {
      type: "text",
      name: "projectName",
      message: "Project name:",
      validate: (name) => (name ? true : "Project name is required"),
    },
    {
      type: "select",
      name: "structure",
      message: "Choose the project structure:",
      choices: [
        { title: "Layer Based", value: "layer" },
        { title: "Modular", value: "modular" },
        { title: "DDD", value: "ddd" },
      ],
    },
  ]);

  if (!response.projectName) {
    console.log("Aborted: Project name is required.");
    process.exit(1);
  }

  const rootPath = path.resolve(process.cwd(), response.projectName);

  if (fs.existsSync(rootPath)) {
    console.log(
      `Folder ${response.projectName} already exists. Choose another name or delete the folder.`
    );
    process.exit(1);
  }

  // Create root directory and all necessary subdirectories
  fs.mkdirSync(rootPath);
  fs.mkdirSync(path.join(rootPath, "src"));
  fs.mkdirSync(path.join(rootPath, "src", "config"));
  fs.mkdirSync(path.join(rootPath, "logs"));
  fs.mkdirSync(path.join(rootPath, ".husky"), { recursive: true }); // Create .husky directory

  // Create structure folders and files
  switch (response.structure) {
    case "layer":
      createFolderRecursive(path.join(rootPath, "src"), layerBasedStructure);
      break;
    case "modular":
      createFolderRecursive(path.join(rootPath, "src"), modularStructure);
      break;
    case "ddd":
      createFolderRecursive(path.join(rootPath, "src"), dddStructure);
      break;
    default:
      break;
  }

  // Create common files
  createFileWithContent(
    path.join(rootPath, "package.json"),
    packageJsonContent(response.projectName)
  );
  createFileWithContent(
    path.join(rootPath, "tsconfig.json"),
    tsconfigContent()
  );
  createFileWithContent(path.join(rootPath, "src", "app.ts"), appTsContent());
  createFileWithContent(
    path.join(rootPath, "src", "config", "logger.ts"),
    loggerConfigContent()
  );
  createFileWithContent(
    path.join(rootPath, "README.md"),
    `# ${response.projectName}\n\nGenerated by backend project generator CLI.`
  );
  createFileWithContent(path.join(rootPath, "Dockerfile"), dockerfileContent());
  createFileWithContent(
    path.join(rootPath, "docker-compose.yml"),
    dockerComposeContent()
  );
  createFileWithContent(path.join(rootPath, ".env"), envContent());
  createFileWithContent(
    path.join(rootPath, ".eslintrc.json"),
    eslintConfigContent()
  );
  createFileWithContent(
    path.join(rootPath, ".eslintignore"),
    eslintIgnoreContent()
  );
  createFileWithContent(
    path.join(rootPath, ".prettierrc"),
    prettierConfigContent()
  );
  createFileWithContent(
    path.join(rootPath, ".prettierignore"),
    prettierIgnoreContent()
  );
  createFileWithContent(
    path.join(rootPath, "jest.config.js"),
    jestConfigContent()
  );
  createFileWithContent(
    path.join(rootPath, ".husky", "pre-commit"),
    huskyConfigContent()
  );
  createFileWithContent(
    path.join(rootPath, ".lintstagedrc.json"),
    lintStagedConfigContent()
  );

  console.log(
    `\n✅ Project "${response.projectName}" created successfully with complete setup!`
  );
  // Pergunta se deseja instalar as dependências
  try {
    const { installDeps } = await prompts({
      type: "confirm",
      name: "installDeps",
      message: "Do you want to install dependencies now?",
      initial: true,
    });

    if (installDeps) {
      await installDependencies(rootPath);
      await postInstallCheck(rootPath);

      // Opcional: oferecer para corrigir automaticamente
      const { fixIssues } = await prompts({
        type: "confirm",
        name: "fixIssues",
        message: "Would you like to try fixing potential issues automatically?",
        initial: false,
      });

      if (fixIssues) {
        execSync("npm audit fix", {
          cwd: rootPath,
          stdio: "inherit",
          shell: true,
        });
      }
    }
  } catch (error) {
    console.error("Installation error:", error.message);
  }
  console.log("To get started:\n");
  console.log(`  cd ${response.projectName}`);
  console.log("  npm install");
  console.log("  npm run dev");
  console.log("  npm test");
  console.log("  npm run lint");
  console.log("  npm run format");
  console.log("\nFor Docker:\n");
  console.log("  docker-compose build");
  console.log("  docker-compose up\n");
  console.log("The project includes:");
  console.log("- Express with TypeScript");
  console.log("- Environment variables (.env)");
  console.log("- Jest testing setup");
  console.log("- ESLint + Prettier");
  console.log("- Winston logging");
  console.log("- Docker support");
  console.log("- Husky git hooks");
  console.log("- Security middleware (helmet, cors)");
}

export {
  createFolderRecursive,
  packageJsonContent,
  tsconfigContent,
  appTsContent,
  initializeGitRepo,
  installDependencies,
  checkNodeVersion,
  postInstallCheck,
  createFileWithContent,
  layerBasedStructure,
  modularStructure,
  dddStructure
};

main();

