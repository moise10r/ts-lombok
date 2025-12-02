import * as ts from 'typescript';
import { DecoratorHandler } from './base-handler';
import { TransformationPlan } from '../transformer/context';
import {
  generateToString,
  generateEquals,
  generateHashCode,
  generateWithMethods,
  generateGetters,
  generateSetters,
  generateBuilder,
  generateSingleton,
  generateLog
} from '../generators/method-generator';

/**
 * Handler for @Record decorator.
 * Creates an immutable data carrier with constructor, readonly properties, freeze, and toString.
 */
export class RecordHandler implements DecoratorHandler {
  readonly decoratorName = 'Record';
  readonly priority = 100;

  modifyPlan(plan: TransformationPlan): void {
    plan.generateConstructor = true;
    plan.constructorType = 'all';
    plan.freezeInstance = true;
    plan.makeReadonly = true;
    plan.generateToString = true;
  }

  generateMembers(factory: ts.NodeFactory, plan: TransformationPlan): ts.ClassElement[] {
    const members: ts.ClassElement[] = [];

    if (plan.generateToString) {
      members.push(generateToString(factory, plan));
    }

    return members;
  }
}

/**
 * Handler for @Value decorator.
 * Alias for @Record - creates immutable value class.
 */
export class ValueHandler implements DecoratorHandler {
  readonly decoratorName = 'Value';
  readonly priority = 100;

  modifyPlan(plan: TransformationPlan): void {
    plan.generateConstructor = true;
    plan.constructorType = 'all';
    plan.freezeInstance = true;
    plan.makeReadonly = true;
    plan.generateToString = true;
  }

  generateMembers(factory: ts.NodeFactory, plan: TransformationPlan): ts.ClassElement[] {
    const members: ts.ClassElement[] = [];

    if (plan.generateToString) {
      members.push(generateToString(factory, plan));
    }

    return members;
  }
}

/**
 * Handler for @Equals decorator.
 * Generates equals() and hashCode() methods.
 */
export class EqualsHandler implements DecoratorHandler {
  readonly decoratorName = 'Equals';
  readonly priority = 70;

  modifyPlan(plan: TransformationPlan): void {
    plan.generateEquals = true;
    plan.generateHashCode = true;
  }

  generateMembers(factory: ts.NodeFactory, plan: TransformationPlan): ts.ClassElement[] {
    const members: ts.ClassElement[] = [];

    if (plan.generateEquals) {
      members.push(generateEquals(factory, plan));
    }

    if (plan.generateHashCode) {
      members.push(generateHashCode(factory, plan));
    }

    return members;
  }
}

/**
 * Handler for @With decorator.
 * Generates withX() methods for immutable updates.
 */
export class WithHandler implements DecoratorHandler {
  readonly decoratorName = 'With';
  readonly priority = 70;

  modifyPlan(plan: TransformationPlan): void {
    plan.generateWithMethods = true;
  }

  generateMembers(factory: ts.NodeFactory, plan: TransformationPlan): ts.ClassElement[] {
    if (plan.generateWithMethods) {
      return generateWithMethods(factory, plan);
    }
    return [];
  }
}

/**
 * Handler for @Getter decorator.
 * Generates getter methods for all properties.
 */
export class GetterHandler implements DecoratorHandler {
  readonly decoratorName = 'Getter';
  readonly priority = 80;

  modifyPlan(plan: TransformationPlan): void {
    plan.generateGetters = true;
  }

  generateMembers(factory: ts.NodeFactory, plan: TransformationPlan): ts.ClassElement[] {
    if (plan.generateGetters) {
      return generateGetters(factory, plan);
    }
    return [];
  }
}

/**
 * Handler for @Setter decorator.
 * Generates setter methods for all properties.
 */
export class SetterHandler implements DecoratorHandler {
  readonly decoratorName = 'Setter';
  readonly priority = 80;

  modifyPlan(plan: TransformationPlan): void {
    plan.generateSetters = true;
  }

  generateMembers(factory: ts.NodeFactory, plan: TransformationPlan): ts.ClassElement[] {
    if (plan.generateSetters) {
      return generateSetters(factory, plan);
    }
    return [];
  }
}

/**
 * Handler for @ToString decorator.
 * Generates toString() method.
 */
export class ToStringHandler implements DecoratorHandler {
  readonly decoratorName = 'ToString';
  readonly priority = 70;

  modifyPlan(plan: TransformationPlan): void {
    plan.generateToString = true;
  }

  generateMembers(factory: ts.NodeFactory, plan: TransformationPlan): ts.ClassElement[] {
    if (plan.generateToString) {
      return [generateToString(factory, plan)];
    }
    return [];
  }
}

/**
 * Handler for @Data decorator.
 * Combines @Getter @Setter @ToString @Equals @AllArgsConstructor.
 */
export class DataHandler implements DecoratorHandler {
  readonly decoratorName = 'Data';
  readonly priority = 100;

  modifyPlan(plan: TransformationPlan): void {
    plan.generateConstructor = true;
    plan.constructorType = 'all';
    plan.generateGetters = true;
    plan.generateSetters = true;
    plan.generateToString = true;
    plan.generateEquals = true;
    plan.generateHashCode = true;
  }

  generateMembers(factory: ts.NodeFactory, plan: TransformationPlan): ts.ClassElement[] {
    const members: ts.ClassElement[] = [];

    if (plan.generateToString) {
      members.push(generateToString(factory, plan));
    }
    if (plan.generateEquals) {
      members.push(generateEquals(factory, plan));
    }
    if (plan.generateHashCode) {
      members.push(generateHashCode(factory, plan));
    }
    if (plan.generateGetters) {
      members.push(...generateGetters(factory, plan));
    }
    if (plan.generateSetters) {
      members.push(...generateSetters(factory, plan));
    }

    return members;
  }
}

/**
 * Handler for @Builder decorator.
 * Generates builder pattern implementation.
 */
export class BuilderHandler implements DecoratorHandler {
  readonly decoratorName = 'Builder';
  readonly priority = 90;

  modifyPlan(plan: TransformationPlan): void {
    plan.generateBuilder = true;
    plan.generateConstructor = true;
    plan.constructorType = 'all';
  }

  generateMembers(factory: ts.NodeFactory, plan: TransformationPlan): ts.ClassElement[] {
    if (plan.generateBuilder) {
      return generateBuilder(factory, plan);
    }
    return [];
  }
}

/**
 * Handler for @NoArgsConstructor decorator.
 * Generates empty constructor.
 */
export class NoArgsConstructorHandler implements DecoratorHandler {
  readonly decoratorName = 'NoArgsConstructor';
  readonly priority = 95;

  modifyPlan(plan: TransformationPlan): void {
    plan.generateConstructor = true;
    plan.constructorType = 'none';
  }

  generateMembers(): ts.ClassElement[] {
    return [];
  }
}

/**
 * Handler for @AllArgsConstructor decorator.
 * Generates constructor with all fields.
 */
export class AllArgsConstructorHandler implements DecoratorHandler {
  readonly decoratorName = 'AllArgsConstructor';
  readonly priority = 95;

  modifyPlan(plan: TransformationPlan): void {
    plan.generateConstructor = true;
    plan.constructorType = 'all';
  }

  generateMembers(): ts.ClassElement[] {
    return [];
  }
}

/**
 * Handler for @RequiredArgsConstructor decorator.
 * Generates constructor with required fields only.
 */
export class RequiredArgsConstructorHandler implements DecoratorHandler {
  readonly decoratorName = 'RequiredArgsConstructor';
  readonly priority = 95;

  modifyPlan(plan: TransformationPlan): void {
    plan.generateConstructor = true;
    plan.constructorType = 'required';
  }

  generateMembers(): ts.ClassElement[] {
    return [];
  }
}

/**
 * Handler for @Log decorator.
 * Generates a logger field.
 */
export class LogHandler implements DecoratorHandler {
  readonly decoratorName = 'Log';
  readonly priority = 60;

  modifyPlan(plan: TransformationPlan): void {
    plan.generateLog = true;
  }

  generateMembers(factory: ts.NodeFactory, plan: TransformationPlan): ts.ClassElement[] {
    if (plan.generateLog) {
      return generateLog(factory, plan);
    }
    return [];
  }
}

/**
 * Handler for @Singleton decorator.
 * Ensures only one instance exists.
 */
export class SingletonHandler implements DecoratorHandler {
  readonly decoratorName = 'Singleton';
  readonly priority = 100;

  modifyPlan(plan: TransformationPlan): void {
    plan.generateSingleton = true;
  }

  generateMembers(factory: ts.NodeFactory, plan: TransformationPlan): ts.ClassElement[] {
    if (plan.generateSingleton) {
      return generateSingleton(factory, plan);
    }
    return [];
  }
}

/**
 * Registry of all decorator handlers.
 */
export class HandlerRegistry {
  private readonly handlers: Map<string, DecoratorHandler> = new Map();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults(): void {
    this.register(new RecordHandler());
    this.register(new ValueHandler());
    this.register(new EqualsHandler());
    this.register(new WithHandler());
    this.register(new GetterHandler());
    this.register(new SetterHandler());
    this.register(new ToStringHandler());
    this.register(new DataHandler());
    this.register(new BuilderHandler());
    this.register(new NoArgsConstructorHandler());
    this.register(new AllArgsConstructorHandler());
    this.register(new RequiredArgsConstructorHandler());
    this.register(new LogHandler());
    this.register(new SingletonHandler());
  }

  register(handler: DecoratorHandler): void {
    this.handlers.set(handler.decoratorName, handler);
  }

  get(decoratorName: string): DecoratorHandler | undefined {
    return this.handlers.get(decoratorName);
  }

  getHandlersForDecorators(decoratorNames: string[]): DecoratorHandler[] {
    const handlers = decoratorNames
      .map(name => this.handlers.get(name))
      .filter((h): h is DecoratorHandler => h !== undefined);

    // Sort by priority (higher priority first)
    return handlers.sort((a, b) => b.priority - a.priority);
  }

  has(decoratorName: string): boolean {
    return this.handlers.has(decoratorName);
  }
}

// Export singleton instance
export const handlerRegistry = new HandlerRegistry();
