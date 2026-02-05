# Contributing to ts-lombok-kit

Thank you for your interest in contributing to ts-lombok-kit!

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/ts-lombok.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature`

## Development

### Building

```bash
npm run build
```

### Running Tests

```bash
npm test           # Run all tests
npm run test:watch # Watch mode
```

### Project Structure

```
ts-lombok/
├── src/
│   ├── index.ts                    # Main entry point
│   ├── transformer/                # AST transformation logic
│   ├── handlers/                   # Decorator handlers
│   ├── generators/                 # Code generators
│   └── utils/                      # Utilities
├── markers/                        # Runtime decorator stubs
└── tests/
    ├── unit/                       # Unit tests
    ├── integration/                # Integration tests
    └── e2e/                        # End-to-end tests
```

## Adding a New Decorator

1. Add the marker stub in `markers/index.ts`
2. Update `markers/index.d.ts` and `markers/index.js`
3. Add decorator name to `KNOWN_DECORATORS` in `src/utils/decorator-utils.ts`
4. Create a handler in `src/handlers/index.ts`
5. Add any required generators in `src/generators/`
6. Register the handler in `HandlerRegistry`
7. Add tests in `tests/`

## Pull Request Guidelines

- Keep PRs focused on a single feature/fix
- Add tests for new functionality
- Update documentation as needed
- Follow existing code style
- Make sure all tests pass

## Reporting Issues

When reporting issues, please include:
- ts-lombok-kit version
- TypeScript version
- Node.js version
- Minimal reproduction code
- Expected vs actual behavior

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
