import * as ts from 'typescript';
import { createTransformer } from './transformer-factory';
import { KNOWN_CLASS_DECORATORS } from '../utils/decorator-utils';

const LOMBOK_RE = new RegExp(`@(${KNOWN_CLASS_DECORATORS.join('|')})\\b`);

/**
 * ts-patch program-level transformer.
 *
 * Configured in tsconfig.json as:
 *   { "transform": "ts-lombok-kit", "transformProgram": true, "import": "programTransformer" }
 *
 * Intercepts getSourceFile during createProgram() — before the type checker runs —
 * and returns transformed source (decorators replaced by generated constructor/methods).
 * TypeScript then type-checks the clean output, giving zero errors in both CLI and editor.
 */
export default function programTransformer(
  program: ts.Program,
  host: ts.CompilerHost | undefined,
  _config: object,
  extras: { ts: typeof ts },
): ts.Program {
  const _ts = extras?.ts ?? ts;

  if (!host) host = _ts.createCompilerHost(program.getCompilerOptions());

  const options = program.getCompilerOptions();
  const originalGetSourceFile = host.getSourceFile.bind(host);

  host.getSourceFile = (
    fileName: string,
    languageVersionOrOptions: ts.ScriptTarget | ts.CreateSourceFileOptions,
    onError?: (message: string) => void,
    shouldCreateNew?: boolean,
  ): ts.SourceFile | undefined => {
    const original = originalGetSourceFile(fileName, languageVersionOrOptions, onError, shouldCreateNew);
    if (!original) return original;
    if (fileName.endsWith('.d.ts') || fileName.includes('node_modules')) return original;
    if (!LOMBOK_RE.test(original.text)) return original;

    const result = _ts.transform(original, [createTransformer(program)], options);
    const transformed = result.transformed[0];
    result.dispose();
    if (transformed === original) return original;

    const printer = _ts.createPrinter({ newLine: _ts.NewLineKind.LineFeed, removeComments: false });
    const newText = printer.printFile(transformed as ts.SourceFile);
    const lv: ts.ScriptTarget =
      typeof languageVersionOrOptions === 'number'
        ? languageVersionOrOptions
        : (languageVersionOrOptions as ts.CreateSourceFileOptions).languageVersion;

    return _ts.createSourceFile(fileName, newText, lv, true);
  };

  return _ts.createProgram({ rootNames: program.getRootFileNames() as string[], options, host });
}
