import * as ts from 'typescript';
import { TransformationContext } from './context';
import { createVisitor } from './visitor';

/**
 * Plugin configuration options.
 */
export interface TransformerConfig {
  /** Enable verbose logging */
  verbose?: boolean;
}

/**
 * Creates the ts-lombok transformer.
 * This is the main entry point for ts-patch integration.
 *
 * @param program The TypeScript program
 * @param config Optional configuration
 * @returns A transformer factory
 */
export function createTransformer(
  program: ts.Program,
  config?: TransformerConfig
): ts.TransformerFactory<ts.SourceFile> {
  const verbose = config?.verbose ?? false;

  return (tsContext: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
    const context = new TransformationContext(program, tsContext.factory);

    return (sourceFile: ts.SourceFile): ts.SourceFile => {
      if (verbose) {
        console.log(`[ts-lombok] Processing: ${sourceFile.fileName}`);
      }

      const visitor = createVisitor(context, tsContext);
      const result = ts.visitNode(sourceFile, visitor) as ts.SourceFile;

      if (verbose && result !== sourceFile) {
        console.log(`[ts-lombok] Transformed: ${sourceFile.fileName}`);
      }

      return result;
    };
  };
}

/**
 * Alternative factory signature for ts-patch compatibility.
 */
export function transform(
  program: ts.Program,
  config?: TransformerConfig
): ts.TransformerFactory<ts.SourceFile> {
  return createTransformer(program, config);
}

/**
 * Plugin entry point for ts-patch.
 * This is called by ts-patch when the plugin is loaded.
 */
export default function (
  program: ts.Program,
  config?: TransformerConfig
): ts.TransformerFactory<ts.SourceFile> {
  return createTransformer(program, config);
}
