/**
 * Helper functions to create Value types
 *
 * These helpers make it easy to create properly typed values for RoomService data.
 * The SDK handles the conversion automatically, but these helpers are useful
 * when you need explicit type control.
 */

export type Value = {
  stringValue?: string;
  intValue?: number;
  floatValue?: number;
  boolValue?: boolean;
  binaryValue?: Buffer;
  listValue?: { values: Value[] };
  mapValue?: { values: { [key: string]: Value } };
};

/**
 * Create a string value
 */
export function stringValue(value: string): Value {
  return { stringValue: value };
}

/**
 * Create an integer value
 */
export function intValue(value: number): Value {
  return { intValue: Math.floor(value) };
}

/**
 * Create a float value
 */
export function floatValue(value: number): Value {
  return { floatValue: value };
}

/**
 * Create a boolean value
 */
export function boolValue(value: boolean): Value {
  return { boolValue: value };
}

/**
 * Create a binary value
 */
export function binaryValue(value: Buffer): Value {
  return { binaryValue: value };
}

/**
 * Create a list value from an array
 */
export function listValue(values: any[]): Value {
  return {
    listValue: {
      values: values.map(v => toValue(v))
    }
  };
}

/**
 * Create a map value from an object
 */
export function mapValue(values: { [key: string]: any }): Value {
  const result: { [key: string]: Value } = {};
  for (const key in values) {
    result[key] = toValue(values[key]);
  }
  return { mapValue: { values: result } };
}

/**
 * Convert a JavaScript value to a RoomService Value
 * This is used internally by the SDK to handle automatic conversion.
 */
export function toValue(value: any): Value {
  if (value === null || value === undefined) {
    throw new Error('Cannot convert null/undefined to Value');
  }

  if (typeof value === 'string') {
    return stringValue(value);
  }

  if (typeof value === 'number') {
    // Determine if it's an integer or float
    return Number.isInteger(value) ? intValue(value) : floatValue(value);
  }

  if (typeof value === 'boolean') {
    return boolValue(value);
  }

  if (Buffer.isBuffer(value)) {
    return binaryValue(value);
  }

  if (Array.isArray(value)) {
    return listValue(value);
  }

  if (typeof value === 'object') {
    return mapValue(value);
  }

  throw new Error(`Cannot convert ${typeof value} to Value`);
}

/**
 * Convert a RoomService Value back to a JavaScript value
 */
export function fromValue(value: Value): any {
  if (value.stringValue !== undefined) {
    return value.stringValue;
  }

  if (value.intValue !== undefined) {
    return value.intValue;
  }

  if (value.floatValue !== undefined) {
    return value.floatValue;
  }

  if (value.boolValue !== undefined) {
    return value.boolValue;
  }

  if (value.binaryValue !== undefined) {
    return value.binaryValue;
  }

  if (value.listValue !== undefined) {
    return value.listValue.values.map(fromValue);
  }

  if (value.mapValue !== undefined) {
    const result: { [key: string]: any } = {};
    for (const key in value.mapValue.values) {
      result[key] = fromValue(value.mapValue.values[key]);
    }
    return result;
  }

  return undefined;
}
