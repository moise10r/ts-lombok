"use strict";
/**
 * ts-lombok-kit - Runtime decorator implementations with full type safety
 *
 * These decorators work both with and without the compile-time transformer:
 * - With transformer: Code is generated at compile time (zero runtime cost)
 * - Without transformer: Runtime implementation provides the same functionality
 *
 * This ensures full TypeScript type safety with default tsconfig settings.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Value = void 0;
exports.Record = Record;
exports.Equals = Equals;
exports.With = With;
exports.Getter = Getter;
exports.Setter = Setter;
exports.ToString = ToString;
exports.Data = Data;
exports.Builder = Builder;
exports.NoArgsConstructor = NoArgsConstructor;
exports.AllArgsConstructor = AllArgsConstructor;
exports.RequiredArgsConstructor = RequiredArgsConstructor;
exports.NonNull = NonNull;
exports.validateNonNull = validateNonNull;
exports.Log = Log;
exports.Singleton = Singleton;
exports.Memoize = Memoize;
exports.Autobind = Autobind;
// =============================================================================
// Helper Functions
// =============================================================================
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
function getPropertyNames(obj) {
    const props = [];
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key) && typeof obj[key] !== 'function') {
            props.push(key);
        }
    }
    return props;
}
function getClassPropertyNames(cls) {
    // Get property names from class prototype and instance
    const instance = Object.create(cls.prototype);
    const props = [];
    // Check for property declarations in the class
    const descriptors = Object.getOwnPropertyDescriptors(cls.prototype);
    for (const key of Object.keys(descriptors)) {
        if (key !== 'constructor' && typeof descriptors[key].value !== 'function') {
            props.push(key);
        }
    }
    return props;
}
function Record(target) {
    const propNames = Object.getOwnPropertyNames(new target()).filter(p => p !== 'constructor' && typeof target.prototype[p] !== 'function');
    // Create new class with constructor
    const newClass = class extends target {
        constructor(...args) {
            super();
            propNames.forEach((name, index) => {
                this[name] = args[index];
            });
            Object.freeze(this);
        }
        toString() {
            const fields = propNames.map(p => `${p}=${this[p]}`).join(', ');
            return `${target.name}(${fields})`;
        }
    };
    Object.defineProperty(newClass, 'name', { value: target.name });
    return newClass;
}
exports.Value = Record;
function Equals(target) {
    const newClass = class extends target {
        equals(other) {
            if (other == null)
                return false;
            if (this === other)
                return true;
            if (!(other instanceof target))
                return false;
            const props = Object.keys(this).filter(k => typeof this[k] !== 'function');
            return props.every(p => this[p] === other[p]);
        }
        hashCode() {
            const props = Object.keys(this).filter(k => typeof this[k] !== 'function');
            let hash = 0;
            for (const p of props) {
                const val = this[p];
                const valHash = val == null ? 0 : typeof val === 'number' ? val : String(val).length;
                hash = (hash * 31 + valHash) | 0;
            }
            return hash;
        }
    };
    Object.defineProperty(newClass, 'name', { value: target.name });
    return newClass;
}
function With(target) {
    const proto = target.prototype;
    // Add withX methods for each property
    const instance = new target();
    const props = Object.keys(instance).filter(k => typeof instance[k] !== 'function');
    for (const prop of props) {
        const methodName = `with${capitalize(prop)}`;
        if (!(methodName in proto)) {
            proto[methodName] = function (value) {
                const args = props.map(p => (p === prop ? value : this[p]));
                return new target(...args);
            };
        }
    }
    return target;
}
function Getter(target, propertyKey) {
    if (propertyKey)
        return; // Property decorator - handled by transformer
    const proto = target.prototype;
    const instance = new target();
    const props = Object.keys(instance).filter(k => typeof instance[k] !== 'function');
    for (const prop of props) {
        const methodName = `get${capitalize(prop)}`;
        if (!(methodName in proto)) {
            proto[methodName] = function () {
                return this[prop];
            };
        }
    }
    return target;
}
function Setter(target, propertyKey) {
    if (propertyKey)
        return;
    const proto = target.prototype;
    const instance = new target();
    const props = Object.keys(instance).filter(k => typeof instance[k] !== 'function');
    for (const prop of props) {
        const methodName = `set${capitalize(prop)}`;
        if (!(methodName in proto)) {
            proto[methodName] = function (value) {
                this[prop] = value;
            };
        }
    }
    return target;
}
function ToString(target) {
    const proto = target.prototype;
    if (!('toString' in proto) || proto.toString === Object.prototype.toString) {
        proto.toString = function () {
            const props = Object.keys(this).filter(k => typeof this[k] !== 'function');
            const fields = props.map(p => `${p}=${this[p]}`).join(', ');
            return `${target.name}(${fields})`;
        };
    }
    return target;
}
function Data(target) {
    // Apply all component decorators
    let result = AllArgsConstructor(target);
    result = Getter(result);
    result = Setter(result);
    result = ToString(result);
    result = Equals(result);
    return result;
}
function Builder(target) {
    const instance = new target();
    const props = Object.keys(instance).filter(k => typeof instance[k] !== 'function');
    // Build constructor that accepts all args; defined first so BuilderImpl can close over it
    const newClass = class extends target {
        constructor(...args) {
            super();
            props.forEach((name, index) => {
                this[name] = args[index];
            });
        }
    };
    Object.defineProperty(newClass, 'name', { value: target.name });
    // BuilderImpl closes over newClass so build() uses the arg-accepting constructor
    class BuilderImpl {
        constructor() {
            this._values = {};
        }
        build() {
            const args = props.map(p => this._values[p]);
            return new newClass(...args);
        }
    }
    // Add fluent methods for each property
    for (const prop of props) {
        BuilderImpl.prototype[prop] = function (value) {
            this._values[prop] = value;
            return this;
        };
    }
    newClass.builder = function () {
        return new BuilderImpl();
    };
    return newClass;
}
function NoArgsConstructor(target) {
    // Class already has default constructor, just return it
    return target;
}
function AllArgsConstructor(target) {
    const instance = new target();
    const props = Object.keys(instance).filter(k => typeof instance[k] !== 'function');
    const newClass = class extends target {
        constructor(...args) {
            super();
            props.forEach((name, index) => {
                this[name] = args[index];
            });
        }
    };
    Object.defineProperty(newClass, 'name', { value: target.name });
    return newClass;
}
// =============================================================================
// @RequiredArgsConstructor - Constructor with required fields only
// =============================================================================
function RequiredArgsConstructor(target) {
    // At runtime, we can't distinguish required from optional, so same as AllArgs
    // The transformer handles this properly at compile time
    return AllArgsConstructor(target);
}
// =============================================================================
// @NonNull - Null validation (property decorator)
// =============================================================================
const nonNullProperties = new WeakMap();
function NonNull(target, propertyKey) {
    const constructor = target.constructor;
    if (!nonNullProperties.has(constructor)) {
        nonNullProperties.set(constructor, new Set());
    }
    nonNullProperties.get(constructor).add(propertyKey);
}
// Helper to validate NonNull properties (called by generated constructors)
function validateNonNull(instance, props) {
    for (const prop of props) {
        if (instance[prop] == null) {
            throw new Error(`${prop} cannot be null or undefined`);
        }
    }
}
function Log(target) {
    const proto = target.prototype;
    Object.defineProperty(proto, 'log', {
        get() {
            return console;
        },
        enumerable: false,
        configurable: true,
    });
    return target;
}
function Singleton(target) {
    let instance = null;
    target.getInstance = function () {
        if (instance === null) {
            instance = new target();
        }
        return instance;
    };
    return target;
}
// =============================================================================
// @Memoize - Cache method results (stub - implemented by transformer)
// =============================================================================
function Memoize(target, propertyKey, descriptor) {
    return descriptor;
}
// =============================================================================
// @Autobind - Bind method to instance (stub - implemented by transformer)
// =============================================================================
function Autobind(target, propertyKey, descriptor) {
    return descriptor;
}
