
type Replacer<V> = (oldValue: V) => V;
type ValueOrReplacer<V> = V | Replacer<V>;
type IndexOrSearcher<V> = number | ((val: V) => boolean);
type Mutilator<T> = {
  [P in keyof T]?: ValueOrReplacer<T[P]>;
};

function value<V>(oldVal: V, valueOrReplacer: ValueOrReplacer<V> | undefined) {
  if (valueOrReplacer instanceof Function) {
    return valueOrReplacer(oldVal);
  } else if (valueOrReplacer) {
    return valueOrReplacer;
  } else {
    return undefined;
  }
}

export function assign<T>(indexOrSearcher: IndexOrSearcher<T>, valueOrReplacer: ValueOrReplacer<T>): Replacer<T[]>;
export function assign<T>(mutilator: Mutilator<T>): Replacer<T>;
export function assign<T, P extends keyof T>(original: T, mutilator: Mutilator<T>): T;
export function assign<T>(original: ReadonlyArray<T>, indexOrSearcher: IndexOrSearcher<T>, valueOrReplacer: ValueOrReplacer<T>); // tslint:disable-line max-line-length
export function assign<T>() {
  // Replacer factory for Object
  if (arguments.length === 1) {
    const mutilator = arguments[0] as Mutilator<T>;
    return (p: T) => {
      return assign(p, mutilator);
    };
  }

  // Replacer factory for Array
  if (arguments.length === 2 && (typeof arguments[0] === "number" || arguments[0] instanceof Function)) {
    const indexOrSearcher = arguments[0] as IndexOrSearcher<T>;
    const valueOrReplacer = arguments[1] as ValueOrReplacer<T>;

    return (p: ReadonlyArray<T>) => {
      return assign(p, indexOrSearcher, valueOrReplacer);
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

function objectAssign<T, P extends keyof T>(original: T, mutilator: Mutilator<T>): T {
  const partial: Partial<T> = {} as Partial<T>;
  for (const key in mutilator) {
    if (mutilator.hasOwnProperty(key)) {
      const valueOrReplacer = mutilator[key];
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
