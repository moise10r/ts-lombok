import { describe, it, expect } from 'vitest';
import * as ts from 'typescript';
import {
  hasDecorator,
  getDecoratorName,
  isKnownDecorator,
  getKnownDecorators,
  getClassProperties,
  hasConstructor,
  hasMethod
} from '../../src/utils/decorator-utils';

describe('decorator-utils', () => {
  function parseClass(code: string): ts.ClassDeclaration {
    const sourceFile = ts.createSourceFile(
      'test.ts',
      code,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS
    );

    let classDecl: ts.ClassDeclaration | undefined;
    ts.forEachChild(sourceFile, node => {
      if (ts.isClassDeclaration(node)) {
        classDecl = node;
      }
    });

    if (!classDecl) {
      throw new Error('No class found in code');
    }

    return classDecl;
  }

  describe('hasDecorator', () => {
    it('returns true when class has specified decorator', () => {
      const cls = parseClass(`
        @Record
        class User {
          id: number;
        }
      `);

      expect(hasDecorator(cls, 'Record')).toBe(true);
    });

    it('returns false when class does not have specified decorator', () => {
      const cls = parseClass(`
        @Other
        class User {
          id: number;
        }
      `);

      expect(hasDecorator(cls, 'Record')).toBe(false);
    });

    it('returns false for class with no decorators', () => {
      const cls = parseClass(`
        class User {
          id: number;
        }
      `);

      expect(hasDecorator(cls, 'Record')).toBe(false);
    });
  });

  describe('getDecoratorName', () => {
    it('gets name from identifier decorator', () => {
      const cls = parseClass(`
        @Record
        class User {}
      `);

      const decorators = ts.getDecorators(cls) || [];
      expect(decorators.length).toBe(1);
      expect(getDecoratorName(decorators[0])).toBe('Record');
    });

    it('gets name from call expression decorator', () => {
      const cls = parseClass(`
        @Record()
        class User {}
      `);

      const decorators = ts.getDecorators(cls) || [];
      expect(decorators.length).toBe(1);
      expect(getDecoratorName(decorators[0])).toBe('Record');
    });
  });

  describe('isKnownDecorator', () => {
    it('returns true for known decorators', () => {
      const knownDecorators = ['Record', 'Value', 'Equals', 'With'];

      for (const name of knownDecorators) {
        const cls = parseClass(`
          @${name}
          class Test {}
        `);
        const decorators = ts.getDecorators(cls) || [];
        expect(isKnownDecorator(decorators[0])).toBe(true);
      }
    });

    it('returns false for unknown decorators', () => {
      const cls = parseClass(`
        @Unknown
        class Test {}
      `);
      const decorators = ts.getDecorators(cls) || [];
      expect(isKnownDecorator(decorators[0])).toBe(false);
    });
  });

  describe('getKnownDecorators', () => {
    it('returns all known decorators on a class', () => {
      const cls = parseClass(`
        @Record
        @Equals
        @With
        class User {
          id: number;
        }
      `);

      const known = getKnownDecorators(cls);
      expect(known).toContain('Record');
      expect(known).toContain('Equals');
      expect(known).toContain('With');
      expect(known.length).toBe(3);
    });

    it('filters out unknown decorators', () => {
      const cls = parseClass(`
        @Record
        @Unknown
        @Equals
        class User {}
      `);

      const known = getKnownDecorators(cls);
      expect(known).toContain('Record');
      expect(known).toContain('Equals');
      expect(known).not.toContain('Unknown');
      expect(known.length).toBe(2);
    });
  });

  describe('getClassProperties', () => {
    it('extracts property information', () => {
      const cls = parseClass(`
        class User {
          id: number;
          name: string;
        }
      `);

      const properties = getClassProperties(cls);
      expect(properties.length).toBe(2);
      expect(properties[0].name).toBe('id');
      expect(properties[1].name).toBe('name');
    });

    it('identifies optional properties', () => {
      const cls = parseClass(`
        class User {
          id: number;
          nickname?: string;
        }
      `);

      const properties = getClassProperties(cls);
      expect(properties[0].isOptional).toBe(false);
      expect(properties[1].isOptional).toBe(true);
    });

    it('identifies readonly properties', () => {
      const cls = parseClass(`
        class User {
          readonly id: number;
          name: string;
        }
      `);

      const properties = getClassProperties(cls);
      expect(properties[0].isReadonly).toBe(true);
      expect(properties[1].isReadonly).toBe(false);
    });

    it('skips static properties', () => {
      const cls = parseClass(`
        class User {
          static counter: number;
          id: number;
        }
      `);

      const properties = getClassProperties(cls);
      expect(properties.length).toBe(1);
      expect(properties[0].name).toBe('id');
    });
  });

  describe('hasConstructor', () => {
    it('returns true when class has constructor', () => {
      const cls = parseClass(`
        class User {
          constructor(id: number) {}
        }
      `);

      expect(hasConstructor(cls)).toBe(true);
    });

    it('returns false when class has no constructor', () => {
      const cls = parseClass(`
        class User {
          id: number;
        }
      `);

      expect(hasConstructor(cls)).toBe(false);
    });
  });

  describe('hasMethod', () => {
    it('returns true when class has method', () => {
      const cls = parseClass(`
        class User {
          toString() { return ''; }
        }
      `);

      expect(hasMethod(cls, 'toString')).toBe(true);
    });

    it('returns false when class does not have method', () => {
      const cls = parseClass(`
        class User {
          id: number;
        }
      `);

      expect(hasMethod(cls, 'toString')).toBe(false);
    });
  });
});
