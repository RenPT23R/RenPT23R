// morescript.js
/*
 * morescript.js
 * Copyright (C) 2025 RenPT23
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

const iammorescriptmain = true

const MSorg = {
    interfaces: {},
    types: {},

    func(fn) {
        const curried = (...args) => {
            if (args.length >= fn.length) {
                return fn(...args);
            } else {
                return (...next) => curried(...args, ...next);
            }
        };
        return curried;
    },
    immutable(obj) {
        return new Proxy(obj, {
            set() { throw new Error("Cannot modify top-level properties"); },
            deleteProperty() { throw new Error("Cannot delete top-level properties"); },
            get(target, prop) { return target[prop]; }
        });
    },

    interface(name, shape, extendName) {
        if (extendName) {
            const baseShape = this.interfaces[extendName];
            if (!baseShape) throw new Error(`Interface ${extendName} does not exist`);
            shape = { ...baseShape, ...shape };
        }

        this.interfaces[name] = shape;

        globalThis[name] = (obj = {}) => {
            return new Proxy(obj, {
                set(target, prop, value) {
                    if (!(prop in shape)) {
                        throw new Error(`Property '${prop}' is not allowed on interface ${name}`);
                    }
                    const expectedType = shape[prop];
                    if (expectedType && !MSorg.checkType(value, expectedType)) {
                        throw new Error(`Property '${prop}' should be '${expectedType}', got '${typeof value}'`);
                    }
                    target[prop] = value;
                    return true;
                },
                get(target, prop) {
                    if (!(prop in shape)) {
                        throw new Error(`Property '${prop}' does not exist on interface ${name}`);
                    }
                    return target[prop];
                }
            });
        };
    },
    type(name, definition) {
        this.types[name] = definition;

        globalThis[name] = (value) => {
            return new Proxy({ value }, {
                set(target, prop, newValue) {
                    if (prop !== "value") throw new Error(`Only 'value' property allowed for type ${name}`);
                    if (!MSorg.checkType(newValue, definition)) {
                        throw new Error(`Value should be '${definition}', got '${typeof newValue}'`);
                    }
                    target.value = newValue;
                    return true;
                },
                get(target, prop) {
                    if (prop !== "value") throw new Error(`Only 'value' property allowed for type ${name}`);
                    return target.value;
                }
            });
        };
    },
    checkType(value, type) {
        if (Array.isArray(type)) {
            return type.some(t => MSorg.checkType(value, t));
        }
        if (type === "function") return typeof value === "function";
        if (type === "string") return typeof value === "string";
        if (type === "number") return typeof value === "number";
        if (type === "boolean") return typeof value === "boolean";
        if (type === "object") return typeof value === "object" && value !== null;
        return false;
    }
};

MS = Object.freeze(MSorg);
MSorg.deleteProperty;

// Dictionary
const Interface = Object.freeze(MS.interface);
const Type = Object.freeze(MS.type);
const Immutable = Object.freeze(MS.immutable);
const Func = Object.freeze(MS.func);


