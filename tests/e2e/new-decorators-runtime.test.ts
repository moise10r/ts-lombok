import { describe, it, expect } from 'vitest';
import * as ts from 'typescript';
import * as vm from 'vm';
import { createTransformer } from '../../src/transformer/transformer-factory';

describe('new decorators e2e runtime tests', () => {
  function compileAndRun<T>(sourceCode: string, evalCode: string): T {
    const fileName = 'test.ts';

    const compilerOptions: ts.CompilerOptions = {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      experimentalDecorators: true,
      noEmit: false,
      declaration: false
    };

    const sourceFiles: Record<string, string> = {
      [fileName]: sourceCode
    };

    let emittedCode = '';

    const compilerHost: ts.CompilerHost = {
      getSourceFile: (name, languageVersion) => {
        if (sourceFiles[name]) {
          return ts.createSourceFile(name, sourceFiles[name], languageVersion, true);
        }
        return undefined;
      },
      getDefaultLibFileName: () => 'lib.d.ts',
      writeFile: (name, text) => {
        if (name.endsWith('.js')) {
          emittedCode = text;
        }
      },
      getCurrentDirectory: () => '/',
      getCanonicalFileName: (f) => f,
      useCaseSensitiveFileNames: () => true,
      getNewLine: () => '\n',
      fileExists: (name) => name in sourceFiles || name === 'lib.d.ts',
      readFile: (name) => sourceFiles[name] || ''
    };

    const program = ts.createProgram([fileName], compilerOptions, compilerHost);
    const transformer = createTransformer(program);

    program.emit(undefined, undefined, undefined, false, {
      before: [transformer]
    });

    if (!emittedCode) {
      throw new Error('No JavaScript code was emitted');
    }

    const context = vm.createContext({ console, Object, String, Error });
    vm.runInContext(emittedCode, context);
    return vm.runInContext(evalCode, context);
  }

  describe('@Getter runtime', () => {
    it('getter methods return correct values', () => {
      const source = `
        @Getter
        @AllArgsConstructor
        class User {
          id: number;
          name: string;
        }
      `;

      const result = compileAndRun<{ id: number; name: string }>(source, `
        const user = new User(42, 'John');
        ({ id: user.getId(), name: user.getName() });
      `);

      expect(result.id).toBe(42);
      expect(result.name).toBe('John');
    });
  });

  describe('@Setter runtime', () => {
    it('setter methods modify values', () => {
      const source = `
        @Getter
        @Setter
        @NoArgsConstructor
        class User {
          id: number;
          name: string;
        }
      `;

      const result = compileAndRun<{ id: number; name: string }>(source, `
        const user = new User();
        user.setId(123);
        user.setName('Jane');
        ({ id: user.getId(), name: user.getName() });
      `);

      expect(result.id).toBe(123);
      expect(result.name).toBe('Jane');
    });
  });

  describe('@Data runtime', () => {
    it('provides full functionality', () => {
      const source = `
        @Data
        class Person {
          id: number;
          name: string;
        }
      `;

      const result = compileAndRun<{
        getId: number;
        getName: string;
        toString: string;
        equals: boolean;
        hashMatch: boolean;
      }>(source, `
        const p1 = new Person(1, 'Alice');
        const p2 = new Person(1, 'Alice');
        p1.setName('Bob');
        ({
          getId: p1.getId(),
          getName: p1.getName(),
          toString: p1.toString(),
          equals: p1.equals(p2),
          hashMatch: p1.hashCode() === p2.hashCode()
        });
      `);

      expect(result.getId).toBe(1);
      expect(result.getName).toBe('Bob');
      expect(result.toString).toContain('Person(');
      expect(result.equals).toBe(false); // name changed
      expect(result.hashMatch).toBe(false);
    });
  });

  describe('@NoArgsConstructor runtime', () => {
    it('creates instance with no arguments', () => {
      const source = `
        @NoArgsConstructor
        class Config {
          host: string;
          port: number;
        }
      `;

      const result = compileAndRun<boolean>(source, `
        const config = new Config();
        config !== undefined;
      `);

      expect(result).toBe(true);
    });
  });

  describe('@AllArgsConstructor runtime', () => {
    it('creates instance with all arguments', () => {
      const source = `
        @AllArgsConstructor
        class Point {
          x: number;
          y: number;
          z: number;
        }
      `;

      const result = compileAndRun<{ x: number; y: number; z: number }>(source, `
        const p = new Point(1, 2, 3);
        ({ x: p.x, y: p.y, z: p.z });
      `);

      expect(result.x).toBe(1);
      expect(result.y).toBe(2);
      expect(result.z).toBe(3);
    });
  });

  describe('@RequiredArgsConstructor runtime', () => {
    it('only requires non-initialized fields', () => {
      const source = `
        @RequiredArgsConstructor
        class User {
          id: number;
          name: string;
          active: boolean = true;
        }
      `;

      const result = compileAndRun<{ id: number; name: string; active: boolean }>(source, `
        const user = new User(1, 'Test');
        ({ id: user.id, name: user.name, active: user.active });
      `);

      expect(result.id).toBe(1);
      expect(result.name).toBe('Test');
      expect(result.active).toBe(true);
    });
  });

  describe('@Singleton runtime', () => {
    it('returns same instance', () => {
      const source = `
        @Singleton
        @NoArgsConstructor
        class AppConfig {
          version: string;
        }
      `;

      const result = compileAndRun<boolean>(source, `
        const c1 = AppConfig.getInstance();
        const c2 = AppConfig.getInstance();
        c1.version = 'v1.0';
        c1 === c2 && c2.version === 'v1.0';
      `);

      expect(result).toBe(true);
    });
  });

  describe('@Log runtime', () => {
    it('provides console logger', () => {
      const source = `
        @Log
        @NoArgsConstructor
        class Service {
          doWork() {
            return typeof this.log.info === 'function';
          }
        }
      `;

      const result = compileAndRun<boolean>(source, `
        const svc = new Service();
        typeof svc.log === 'object' && typeof svc.log.log === 'function';
      `);

      expect(result).toBe(true);
    });
  });

  describe('@NonNull runtime', () => {
    it('throws error for null values', () => {
      const source = `
        @AllArgsConstructor
        class User {
          @NonNull
          id: number;
          name: string;
        }
      `;

      const throwsError = compileAndRun<boolean>(source, `
        let threw = false;
        try {
          new User(null, 'Test');
        } catch (e) {
          threw = e.message.includes('cannot be null');
        }
        threw;
      `);

      expect(throwsError).toBe(true);
    });

    it('allows valid values', () => {
      const source = `
        @AllArgsConstructor
        class User {
          @NonNull
          id: number;
          name: string;
        }
      `;

      const result = compileAndRun<number>(source, `
        const user = new User(42, 'Test');
        user.id;
      `);

      expect(result).toBe(42);
    });
  });

  describe('combined decorators runtime', () => {
    it('@Record @With @Equals all work together', () => {
      const source = `
        @Record
        @With
        @Equals
        class Product {
          id: number;
          name: string;
          price: number;
        }
      `;

      const result = compileAndRun<{
        frozen: boolean;
        toString: string;
        withWorked: boolean;
        equalsWorked: boolean;
      }>(source, `
        const p1 = new Product(1, 'Widget', 9.99);
        const p2 = p1.withPrice(19.99);
        const p3 = new Product(1, 'Widget', 9.99);
        ({
          frozen: Object.isFrozen(p1),
          toString: p1.toString(),
          withWorked: p2.price === 19.99 && p2.name === 'Widget',
          equalsWorked: p1.equals(p3) && !p1.equals(p2)
        });
      `);

      expect(result.frozen).toBe(true);
      expect(result.toString).toContain('Product(');
      expect(result.withWorked).toBe(true);
      expect(result.equalsWorked).toBe(true);
    });
  });
});
