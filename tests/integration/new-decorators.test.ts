import { describe, it, expect } from 'vitest';
import * as ts from 'typescript';
import { createTransformer } from '../../src/transformer/transformer-factory';

describe('new decorators integration', () => {
  function transform(sourceCode: string): string {
    const fileName = 'test.ts';
    const sourceFile = ts.createSourceFile(
      fileName,
      sourceCode,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS
    );

    const compilerHost: ts.CompilerHost = {
      getSourceFile: (name) => (name === fileName ? sourceFile : undefined),
      getDefaultLibFileName: () => 'lib.d.ts',
      writeFile: () => {},
      getCurrentDirectory: () => '/',
      getCanonicalFileName: (f) => f,
      useCaseSensitiveFileNames: () => true,
      getNewLine: () => '\n',
      fileExists: (name) => name === fileName,
      readFile: () => undefined
    };

    const program = ts.createProgram([fileName], {
      target: ts.ScriptTarget.Latest,
      module: ts.ModuleKind.CommonJS,
      experimentalDecorators: true
    }, compilerHost);

    const transformer = createTransformer(program);
    const result = ts.transform(sourceFile, [transformer]);
    const transformedSourceFile = result.transformed[0];

    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const output = printer.printFile(transformedSourceFile);

    result.dispose();
    return output;
  }

  describe('@Getter', () => {
    it('generates getter methods for all properties', () => {
      const input = `
        @Getter
        class User {
          id: number;
          name: string;
        }
      `;

      const output = transform(input);

      expect(output).toContain('getId()');
      expect(output).toContain('getName()');
      expect(output).toContain('return this.id');
      expect(output).toContain('return this.name');
    });
  });

  describe('@Setter', () => {
    it('generates setter methods for all properties', () => {
      const input = `
        @Setter
        class User {
          id: number;
          name: string;
        }
      `;

      const output = transform(input);

      expect(output).toContain('setId(id: number)');
      expect(output).toContain('setName(name: string)');
      expect(output).toContain('this.id = id');
      expect(output).toContain('this.name = name');
    });
  });

  describe('@ToString', () => {
    it('generates toString method', () => {
      const input = `
        @ToString
        class User {
          id: number;
          name: string;
        }
      `;

      const output = transform(input);

      expect(output).toContain('toString()');
      expect(output).toContain('User(id=');
    });
  });

  describe('@Data', () => {
    it('combines multiple decorators functionality', () => {
      const input = `
        @Data
        class User {
          id: number;
          name: string;
        }
      `;

      const output = transform(input);

      // Should have constructor
      expect(output).toContain('constructor(id: number, name: string)');

      // Should have getters
      expect(output).toContain('getId()');
      expect(output).toContain('getName()');

      // Should have setters
      expect(output).toContain('setId(');
      expect(output).toContain('setName(');

      // Should have toString
      expect(output).toContain('toString()');

      // Should have equals
      expect(output).toContain('equals(other: User)');

      // Should have hashCode
      expect(output).toContain('hashCode()');
    });
  });

  describe('@Builder', () => {
    it('generates static builder method', () => {
      const input = `
        @Builder
        class User {
          id: number;
          name: string;
        }
      `;

      const output = transform(input);

      expect(output).toContain('static builder()');
      expect(output).toContain('UserBuilder');
    });
  });

  describe('@NoArgsConstructor', () => {
    it('generates empty constructor', () => {
      const input = `
        @NoArgsConstructor
        class User {
          id: number;
          name: string;
        }
      `;

      const output = transform(input);

      expect(output).toContain('constructor()');
      expect(output).not.toContain('constructor(id');
    });
  });

  describe('@AllArgsConstructor', () => {
    it('generates constructor with all fields', () => {
      const input = `
        @AllArgsConstructor
        class User {
          id: number;
          name: string;
        }
      `;

      const output = transform(input);

      expect(output).toContain('constructor(id: number, name: string)');
    });
  });

  describe('@RequiredArgsConstructor', () => {
    it('generates constructor with required fields only', () => {
      const input = `
        @RequiredArgsConstructor
        class User {
          id: number;
          name: string;
          active: boolean = true;
        }
      `;

      const output = transform(input);

      // Should have id and name but not active (has initializer)
      expect(output).toContain('constructor(id: number, name: string)');
      expect(output).not.toContain('active: boolean)');
    });
  });

  describe('@Singleton', () => {
    it('generates singleton pattern', () => {
      const input = `
        @Singleton
        class Config {
          apiUrl: string;
        }
      `;

      const output = transform(input);

      expect(output).toContain('private static instance');
      expect(output).toContain('static getInstance()');
      expect(output).toContain('Config.instance');
    });
  });

  describe('@Log', () => {
    it('generates logger field', () => {
      const input = `
        @Log
        class UserService {
          doSomething() {}
        }
      `;

      const output = transform(input);

      expect(output).toContain('protected readonly log');
      expect(output).toContain('console');
    });
  });

  describe('@NonNull property decorator', () => {
    it('generates null validation in constructor', () => {
      const input = `
        @AllArgsConstructor
        class User {
          @NonNull
          id: number;
          name: string;
        }
      `;

      const output = transform(input);

      expect(output).toContain('if (id == null)');
      expect(output).toContain('throw new Error');
      expect(output).toContain('cannot be null or undefined');
    });
  });

  describe('combined new decorators', () => {
    it('@Getter @Setter @AllArgsConstructor work together', () => {
      const input = `
        @Getter
        @Setter
        @AllArgsConstructor
        class User {
          id: number;
          name: string;
        }
      `;

      const output = transform(input);

      expect(output).toContain('constructor(id: number, name: string)');
      expect(output).toContain('getId()');
      expect(output).toContain('setId(');
      expect(output).toContain('getName()');
      expect(output).toContain('setName(');
    });
  });
});
