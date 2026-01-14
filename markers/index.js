"use strict";
/**
 * Runtime marker stubs for ts-lombok decorators.
 * These are no-op functions that serve as markers for the compile-time transformer.
 */
Object.defineProperty(exports, "__esModule", { value: true });

// Class decorators
exports.Record = Record;
exports.Value = Value;
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
exports.Log = Log;
exports.Singleton = Singleton;

// Property decorators
exports.NonNull = NonNull;

// Method decorators
exports.Memoize = Memoize;
exports.Autobind = Autobind;

function Record(target) { return target; }
function Value(target) { return target; }
function Equals(target) { return target; }
function With(target) { return target; }
function Getter(target, propertyKey) { return propertyKey ? undefined : target; }
function Setter(target, propertyKey) { return propertyKey ? undefined : target; }
function ToString(target) { return target; }
function Data(target) { return target; }
function Builder(target) { return target; }
function NoArgsConstructor(target) { return target; }
function AllArgsConstructor(target) { return target; }
function RequiredArgsConstructor(target) { return target; }
function NonNull(target, propertyKey) { }
function Log(target) { return target; }
function Singleton(target) { return target; }
function Memoize(target, propertyKey, descriptor) { return descriptor; }
function Autobind(target, propertyKey, descriptor) { return descriptor; }
