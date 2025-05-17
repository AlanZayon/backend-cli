import fs from 'fs';
import path from 'path';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import {
  createFolderRecursive,
  packageJsonContent,
  tsconfigContent,
  appTsContent,
  initializeGitRepo,
  installDependencies
} from '../bin/create-backend.js';  // Adjust the path as needed

// Mock das funções do fs e child_process
vi.mock('fs');
vi.mock('child_process');
vi.mock('prompts', () => ({
  default: vi.fn().mockImplementation((questions) => {
    const responses = {
      projectName: 'test-project',
      structure: 'layer',
      installDeps: true,
      fixIssues: false
    };
    return Promise.resolve(
      questions.reduce((acc, question) => {
        acc[question.name] = responses[question.name];
        return acc;
      }, {})
    );
  })
}));

describe('Project Generator CLI', () => {
  const mockProjectPath = path.join(process.cwd(), 'test-project');
  
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Mock fs.existsSync para simular que a pasta não existe
    fs.existsSync.mockImplementation((path) => {
      if (path === mockProjectPath) return false;
      return false;
    });
    
    // Mock para outras funções do fs
    fs.mkdirSync.mockImplementation(() => {});
    fs.writeFileSync.mockImplementation(() => {});
    
    // Mock para execSync
    execSync.mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createFolderRecursive', () => {
    it('should create folder structure correctly', () => {
      const mockStructure = {
        folder1: {
          subfolder1: {},
          'file1.txt': 'content'
        },
        folder2: {}
      };
      
      const basePath = '/test';
      createFolderRecursive(basePath, mockStructure);
      
      // Verifica se mkdirSync foi chamado para cada pasta
      expect(fs.mkdirSync).toHaveBeenCalledWith(path.join(basePath, 'folder1'));
      expect(fs.mkdirSync).toHaveBeenCalledWith(path.join(basePath, 'folder1', 'subfolder1'));
      expect(fs.mkdirSync).toHaveBeenCalledWith(path.join(basePath, 'folder2'));
      
      // Verifica se writeFileSync foi chamado para o arquivo
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(basePath, 'folder1', 'file1.txt'),
        'content'
      );
    });
  });

  describe('packageJsonContent', () => {
    it('should generate correct package.json content', () => {
      const projectName = 'test-project';
      const content = packageJsonContent(projectName);
      
      expect(content).toContain(`"name": "${projectName}"`);
      expect(content).toContain('"express": "^4.18.2"');
      expect(content).toContain('"typescript": "^5.4.5"');
      expect(content).toContain('"start": "node dist/app.js"');
    });
  });

  describe('tsconfigContent', () => {
    it('should generate correct tsconfig.json content', () => {
      const content = tsconfigContent();
      
      expect(content).toContain('"target": "ES2022"');
      expect(content).toContain('"outDir": "./dist"');
      expect(content).toContain('"rootDir": "./src"');
    });
  });

  describe('appTsContent', () => {
    it('should generate correct app.ts content', () => {
      const content = appTsContent();
      
      expect(content).toContain('import express from');
      expect(content).toContain('app.use(cors());');
      expect(content).toContain('app.listen(port, () => {');
    });
  });

  describe('initializeGitRepo', () => {
    it('should initialize git repository successfully', async () => {
      execSync.mockImplementation(() => true);
      
      const result = await initializeGitRepo(mockProjectPath);
      expect(result).toBe(true);
      expect(execSync).toHaveBeenCalledWith('git init', {
        cwd: mockProjectPath,
        stdio: 'inherit',
        shell: true
      });
    });

    it('should handle git init failure', async () => {
      execSync.mockImplementation(() => {
        throw new Error('Git init failed');
      });
      
      const result = await initializeGitRepo(mockProjectPath);
      expect(result).toBe(false);
    });
  });

  describe('installDependencies', () => {
    it('should install dependencies successfully', async () => {
      await installDependencies(mockProjectPath);
      
      expect(execSync).toHaveBeenCalledWith('npm install --package-lock-only', {
        cwd: mockProjectPath,
        stdio: 'inherit',
        shell: true
      });
      
      expect(execSync).toHaveBeenCalledWith('npm install', {
        cwd: mockProjectPath,
        stdio: 'inherit',
        shell: true
      });
    });

    it('should handle node version check', async () => {
      const originalVersion = process.versions.node;
      Object.defineProperty(process.versions, 'node', { value: '12.0.0' });
      
      await expect(installDependencies(mockProjectPath)).rejects.toThrow();
      
      // Restore original version
      Object.defineProperty(process.versions, 'node', { value: originalVersion });
    });
  });

});