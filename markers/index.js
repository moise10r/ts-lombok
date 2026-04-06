"use strict";
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
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
function getProps(target) {
    return Object.keys(new target()).filter(k => typeof target.prototype[k] !== 'function');
}
function Record(target, _context) {
    const props = getProps(target);
    const newClass = class extends target {
        constructor(...args) {
            super();
            props.forEach((name, index) => { this[name] = args[index]; });
            Object.freeze(this);
        }
        toString() {
            return `${target.name}(${props.map(p => `${p}=${this[p]}`).join(', ')})`;
        }
    };
    Object.defineProperty(newClass, 'name', { value: target.name });
    return newClass;
}
exports.Value = Record;
function Equals(target, _context) {
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
function With(target, _context) {
    const proto = target.prototype;
    const props = getProps(target);
    for (const prop of props) {
        const methodName = `with${capitalize(prop)}`;
        if (!(methodName in proto)) {
            proto[methodName] = function (value) {
                const args = props.map(p => (p === prop ? value : this[p]));
                return new this.constructor(...args);
            };
        }
    }
    return target;
}
function Getter(target, propertyKey) {
    if (typeof propertyKey === 'string')
        return;
    const proto = target.prototype;
    const props = getProps(target);
    for (const prop of props) {
        const methodName = `get${capitalize(prop)}`;
        if (!(methodName in proto)) {
            proto[methodName] = function () { return this[prop]; };
        }
    }
    return target;
}
function Setter(target, propertyKey) {
    if (typeof propertyKey === 'string')
        return;
    const proto = target.prototype;
    const props = getProps(target);
    for (const prop of props) {
        const methodName = `set${capitalize(prop)}`;
        if (!(methodName in proto)) {
            proto[methodName] = function (value) { this[prop] = value; };
        }
    }
    return target;
}
function ToString(target, _context) {
    const proto = target.prototype;
    if (!('toString' in proto) || proto.toString === Object.prototype.toString) {
        proto.toString = function () {
            const props = Object.keys(this).filter(k => typeof this[k] !== 'function');
            return `${target.name}(${props.map(p => `${p}=${this[p]}`).join(', ')})`;
        };
    }
    return target;
}
function Data(target, _context) {
    let result = AllArgsConstructor(target);
    result = Getter(result);
    result = Setter(result);
    result = ToString(result);
    result = Equals(result);
    return result;
}
function Builder(target, _context) {
    const props = getProps(target);
    const newClass = class extends target {
        constructor(...args) {
            super();
            props.forEach((name, index) => { this[name] = args[index]; });
        }
    };
    Object.defineProperty(newClass, 'name', { value: target.name });
    class BuilderImpl {
        constructor() {
            this._values = {};
        }
        build() {
            return new newClass(...props.map(p => this._values[p]));
        }
    }
    for (const prop of props) {
        BuilderImpl.prototype[prop] = function (value) {
            this._values[prop] = value;
            return this;
        };
    }
    newClass.builder = () => new BuilderImpl();
    return newClass;
}
function NoArgsConstructor(target, _context) {
    return target;
}
function AllArgsConstructor(target, _context) {
    const props = getProps(target);
    const newClass = class extends target {
        constructor(...args) {
            super();
            props.forEach((name, index) => { this[name] = args[index]; });
        }
    };
    Object.defineProperty(newClass, 'name', { value: target.name });
    return newClass;
}
function RequiredArgsConstructor(target, _context) {
    return AllArgsConstructor(target);
}
const nonNullProperties = new WeakMap();
function NonNull(target, propertyKeyOrContext) {
    if (typeof propertyKeyOrContext !== 'string')
        return;
    const ctor = target.constructor;
    if (!nonNullProperties.has(ctor))
        nonNullProperties.set(ctor, new Set());
    nonNullProperties.get(ctor).add(propertyKeyOrContext);
}
function validateNonNull(instance, props) {
    for (const prop of props) {
        if (instance[prop] == null) {
            throw new Error(`${prop} cannot be null or undefined`);
        }
    }
}
function Log(target, _context) {
    Object.defineProperty(target.prototype, 'log', {
        get() { return console; },
        enumerable: false,
        configurable: true,
    });
    return target;
}
function Singleton(target, _context) {
    let instance = null;
    target.getInstance = function () {
        if (instance === null)
            instance = new target();
        return instance;
    };
    return target;
}
