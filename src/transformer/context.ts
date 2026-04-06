import * as ts from 'typescript';
import { PropertyInfo } from '../utils/decorator-utils';

export type ConstructorType = 'none' | 'all' | 'required';

export interface TransformationPlan {
  classDeclaration: ts.ClassDeclaration;
  className: string;
  properties: PropertyInfo[];
  decorators: string[];
  generateConstructor: boolean;
  constructorType: ConstructorType;
  freezeInstance: boolean;
  makeReadonly: boolean;
  generateToString: boolean;
  generateEquals: boolean;
  generateHashCode: boolean;
  generateWithMethods: boolean;
  generateGetters: boolean;
  generateSetters: boolean;
  generateBuilder: boolean;
  generateLog: boolean;
  generateSingleton: boolean;
  validateNonNull: boolean;
  additionalMembers: ts.ClassElement[];
}

export function createDefaultPlan(
  classDeclaration: ts.ClassDeclaration,
  properties: PropertyInfo[]
): TransformationPlan {
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
    validateNonNull: properties.some(p => p.isNonNull),
    additionalMembers: [],
  };
}

export class TransformationContext {
  readonly factory: ts.NodeFactory;

  constructor(_program: ts.Program, factory: ts.NodeFactory) {
    this.factory = factory;
  }

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
