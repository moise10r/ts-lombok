# ts-lombok-kit Demo Project

This demo project showcases all decorators provided by **ts-lombok-kit**.

## Setup

```bash
# Install dependencies
npm install

# Patch TypeScript for decorator transformation
npm run prepare

# Build and run the demo
npm run demo
```

## What's Demonstrated

### Immutability
- **@Record** - Creates immutable data carriers with constructor, readonly fields, and Object.freeze()
- **@Value** - Alias for @Record

### Equality
- **@Equals** - Generates `equals()` and `hashCode()` methods for value-based equality

### Immutable Updates
- **@With** - Generates `withX()` methods for creating modified copies

### Accessors
- **@Getter** - Generates `getX()` methods for all properties
- **@Setter** - Generates `setX()` methods for all properties
- **@ToString** - Generates `toString()` method

### All-in-One
- **@Data** - Combines @Getter, @Setter, @ToString, @Equals, @AllArgsConstructor

### Builder Pattern
- **@Builder** - Generates fluent builder with `ClassName.builder().field(value).build()`

### Constructors
- **@NoArgsConstructor** - Empty constructor
- **@AllArgsConstructor** - Constructor with all fields as parameters
- **@RequiredArgsConstructor** - Constructor with only required fields

### Validation
- **@NonNull** - Property decorator that throws if null/undefined in constructor

### Utility
- **@Log** - Injects a `log` property with console-based logger
- **@Singleton** - Makes class a singleton with `getInstance()` method

## How it Works

ts-lombok-kit uses **compile-time AST transformation** via ts-patch. The decorators are
no-op markers at runtime—all the magic happens during TypeScript compilation:

1. TypeScript compiler loads the ts-lombok-kit transformer
2. Transformer identifies classes with decorator markers
3. AST is modified to add generated methods/constructors
4. Compiled JavaScript includes the generated code

**Zero runtime cost!**
