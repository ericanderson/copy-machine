
export type Replacer<V> = (oldValue: V) => V;
export type ValueOrReplacer<V> = V | Replacer<V>;
export type IndexOrSearcher<V> = number | ((val: V) => boolean);
export type Mutator<T> = {
  [P in keyof T]?: ValueOrReplacer<T[P]>;
};

function value<V>(oldVal: V, valueOrReplacer: ValueOrReplacer<V> | undefined) {
  if (valueOrReplacer instanceof Function) {
    return valueOrReplacer(oldVal);
  } else {
    return valueOrReplacer;
  }
}

export function update<T>(indexOrSearcher: IndexOrSearcher<T>, valueOrReplacer: ValueOrReplacer<T>): Replacer<T[]>;
export function update<T>(mutator: Mutator<T>): Replacer<T>;
export function update<T>(original: T, mutator: Mutator<T>): T;
export function update<T>(original: ReadonlyArray<T>, indexOrSearcher: IndexOrSearcher<T>, valueOrReplacer: ValueOrReplacer<T>); // tslint:disable-line max-line-length
export function update<T>() {
  // Replacer factory for Object
  if (arguments.length === 1) {
    const mutator = arguments[0] as Mutator<T>;
    return (p: T) => {
      return update(p, mutator);
    };
  }

  // Replacer factory for Array
  if (arguments.length === 2 && (typeof arguments[0] === "number" || arguments[0] instanceof Function)) {
    const indexOrSearcher = arguments[0] as IndexOrSearcher<T>;
    const valueOrReplacer = arguments[1] as ValueOrReplacer<T>;

    return (p: ReadonlyArray<T>) => {
      return update(p, indexOrSearcher, valueOrReplacer);
    };
  }

  // Array Replace
  if (arguments.length === 3 && arguments[0] instanceof Array) {
    return arrayAssign(arguments[0], arguments[1], arguments[2]) as any as T;
  }

  if (arguments.length === 2) {
    return objectAssign(arguments[0], arguments[1]);
  }

  throw new Error("Unknown options");
}

function objectAssign<T, P extends keyof T>(original: T, mutator: Mutator<T>): T {
  const partial: Partial<T> = {} as Partial<T>;
  for (const key in mutator) {
    if (mutator.hasOwnProperty(key)) {
      const valueOrReplacer = mutator[key];
      let newValue = value(original[key], valueOrReplacer);

      if (newValue !== original[key]) {
        partial[key] = newValue;
      }
    }
  }

  if (Object.keys(partial).length > 0) {
    return Object.assign({}, original, partial);
  } else {
    return original;
  }
}

function arrayAssign<T>(
  original: ReadonlyArray<T>,
  indexOrSearcher: IndexOrSearcher<T>,
  valueOrReplacer: ValueOrReplacer<T>,
): ReadonlyArray<T> {
  let index: number | undefined;
  if (indexOrSearcher instanceof Function) {
    for (let i = 0; i < original.length; i++) {
      if (indexOrSearcher(original[i]) === true) {
        index = i;
        break;
      }
    }
  } else {
    index = indexOrSearcher;
  }

  if (index === undefined || index < 0) {
    return original;
  }

  const newValue = value(original[index], valueOrReplacer);
  if (newValue === original[index] || newValue === undefined) {
    return original;
  }

  return [
    ...original.slice(0, index),
    newValue,
    ...original.slice(index + 1),
  ];
}
