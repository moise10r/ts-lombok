import * as ts from 'typescript';
import { TransformationPlan } from '../transformer/context';
import {
  createConstructorParameter,
  createPropertyAssignment
} from '../utils/ast-helpers';
import { generateNonNullValidation } from './method-generator';
import { PropertyInfo } from '../utils/decorator-utils';

/**
 * Gets properties for constructor based on constructor type.
 */
function getConstructorProperties(plan: TransformationPlan): PropertyInfo[] {
  switch (plan.constructorType) {
    case 'none':
      return [];
    case 'required':
      return plan.properties.filter(p => !p.isOptional && !p.hasInitializer);
    case 'all':
    default:
      return plan.properties;
  }
}

/**
 * Generates a constructor declaration based on the transformation plan.
 */
export function generateConstructor(
  factory: ts.NodeFactory,
  plan: TransformationPlan,
  additionalStatements: ts.Statement[] = []
): ts.ConstructorDeclaration {
  const constructorProps = getConstructorProperties(plan);

  // Create parameters from properties
  const parameters = constructorProps.map(prop =>
    createConstructorParameter(factory, prop.name, prop.type)
  );

  // Create validation statements for @NonNull properties
  const validations: ts.Statement[] = [];
  if (plan.validateNonNull) {
    for (const prop of constructorProps) {
      if (prop.isNonNull) {
        validations.push(generateNonNullValidation(factory, prop.name));
      }
    }
  }

  // Create assignment statements: this.x = x;
  const assignments = constructorProps.map(prop =>
    createPropertyAssignment(factory, prop.name)
  );

  // Combine all statements
  const bodyStatements: ts.Statement[] = [
    ...validations,
    ...assignments,
    ...additionalStatements
  ];

  // Create constructor body
  const body = factory.createBlock(bodyStatements, true);

  return factory.createConstructorDeclaration(
    undefined,
    parameters,
    body
  );
}

/**
 * Checks if a constructor needs to be generated.
 */
export function shouldGenerateConstructor(plan: TransformationPlan): boolean {
  if (!plan.generateConstructor) {
    return false;
  }

  // NoArgsConstructor should always generate
  if (plan.constructorType === 'none') {
    return true;
  }

  // For 'all' and 'required', always generate (even if empty)
  return true;
}
