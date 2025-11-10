import * as ts from 'typescript';
import { PropertyInfo } from '../utils/decorator-utils';

/**
 * Constructor generation type.
 */
export type ConstructorType = 'none' | 'all' | 'required';

/**
 * Represents a planned transformation for a class.
 */
export interface TransformationPlan {
  /** The original class declaration */
  classDeclaration: ts.ClassDeclaration;

  /** Class name */
  className: string;

  /** Properties to include in transformation */
  properties: PropertyInfo[];

  /** Decorators found on the class */
  decorators: string[];

  /** Whether to generate a constructor */
  generateConstructor: boolean;

  /** Type of constructor to generate */
  constructorType: ConstructorType;

  /** Whether to freeze the instance */
  freezeInstance: boolean;

  /** Whether to make properties readonly */
  makeReadonly: boolean;

  /** Whether to generate toString() */
  generateToString: boolean;

  /** Whether to generate equals() */
  generateEquals: boolean;

  /** Whether to generate hashCode() */
  generateHashCode: boolean;

  /** Whether to generate withX() methods */
  generateWithMethods: boolean;

  /** Whether to generate getter methods */
  generateGetters: boolean;

  /** Whether to generate setter methods */
  generateSetters: boolean;

  /** Whether to generate builder pattern */
  generateBuilder: boolean;

  /** Whether to generate logger field */
  generateLog: boolean;

  /** Whether to implement singleton pattern */
  generateSingleton: boolean;

  /** Whether to validate @NonNull properties */
  validateNonNull: boolean;

  /** Additional members to add */
  additionalMembers: ts.ClassElement[];
}

/**
 * Creates a default transformation plan.
 */
export function createDefaultPlan(
  classDeclaration: ts.ClassDeclaration,
  properties: PropertyInfo[]
): TransformationPlan {
  // Check if any property has @NonNull
  const hasNonNull = properties.some(p => p.isNonNull);

  return {
    classDeclaration,
    className: classDeclaration.name?.text || 'Anonymous',
    properties,
    decorators: [],
    generateConstructor: false,
    constructorType: 'all',
    freezeInstance: false,
    makeReadonly: false,
    generateToString: false,
    generateEquals: false,
    generateHashCode: false,
    generateWithMethods: false,
    generateGetters: false,
    generateSetters: false,
    generateBuilder: false,
    generateLog: false,
    generateSingleton: false,
    validateNonNull: hasNonNull,
    additionalMembers: []
  };
}

/**
 * Transformation context that holds state during transformation.
 */
export class TransformationContext {
  private readonly _program: ts.Program;
  private readonly _factory: ts.NodeFactory;
  private readonly _typeChecker: ts.TypeChecker;

  constructor(program: ts.Program, factory: ts.NodeFactory) {
    this._program = program;
    this._factory = factory;
    this._typeChecker = program.getTypeChecker();
  }

  get program(): ts.Program {
    return this._program;
  }

  get factory(): ts.NodeFactory {
    return this._factory;
  }

  get typeChecker(): ts.TypeChecker {
    return this._typeChecker;
  }

  /**
   * Creates a transformation plan based on decorators.
   */
  createPlan(
    classDeclaration: ts.ClassDeclaration,
    properties: PropertyInfo[],
    decorators: string[]
  ): TransformationPlan {
    const plan = createDefaultPlan(classDeclaration, properties);
    plan.decorators = decorators;
    return plan;
  }
}
