/**
 * Delta encoding core for a sequence of integers.
 *
 * The sequence is stored as: [firstValue, delta1, delta2, ...] where
 * delta_i = values[i] - values[i-1]. Reconstructing the original sequence is a
 * running sum starting from firstValue. Delta encoding is attractive when
 * consecutive values are close together, because the deltas tend to be small
 * and thus compact in variable-width transports (varint, zigzag, etc.).
 *
 * This module is pure JavaScript and operates on the number type. All integer
 * values within the safe integer range are supported. The first element is
 * stored verbatim because there is no previous value to subtract from.
 */

/**
 * Encode an array of integers as a delta sequence.
 *
 * The returned array always has the same length as the input. Its first
 * element is the original first element; each subsequent element is the
 * difference between consecutive input values.
 *
 * An empty input produces an empty output. The caller controls what, if
 * anything, an empty sequence means at a higher level.
 *
 * @param {number[]} values - Ordered integers to encode.
 * @returns {number[]} Deltas, with the first value as a prefix anchor.
 * @throws {TypeError} if values is not an array.
 * @throws {TypeError} if any element is not a safe integer.
 */
export function encode(values) {
  if (!Array.isArray(values)) {
    throw new TypeError('encode expects an array of integers');
  }

  if (values.length === 0) {
    return [];
  }

  // Validate up front so we never return a partially encoded array.
  // Encoding is O(n); an upfront scan does not change the asymptotic cost
  // and keeps the contract clear: either the whole input is valid and we
  // return a full result, or we throw without side effects.
  for (let i = 0; i < values.length; i++) {
    if (!Number.isSafeInteger(values[i])) {
      throw new TypeError(`element at index ${i} is not a safe integer`);
    }
  }

  const out = new Array(values.length);
  out[0] = values[0];
  for (let i = 1; i < values.length; i++) {
    out[i] = values[i] - values[i - 1];
  }
  return out;
}

/**
 * Decode a delta sequence back into the original integer array.
 *
 * Reconstructs by running sum: values[i] = values[i-1] + deltas[i]. The
 * first element of the deltas array is the anchor, not a delta, so a
 * single-element input round-trips to itself.
 *
 * @param {number[]} deltas - Output of encode: anchor followed by deltas.
 * @returns {number[]} The original integer sequence.
 * @throws {TypeError} if deltas is not an array.
 * @throws {TypeError} if any element is not a safe integer.
 */
export function decode(deltas) {
  if (!Array.isArray(deltas)) {
    throw new TypeError('decode expects an array of integers');
  }

  if (deltas.length === 0) {
    return [];
  }

  for (let i = 0; i < deltas.length; i++) {
    if (!Number.isSafeInteger(deltas[i])) {
      throw new TypeError(`element at index ${i} is not a safe integer`);
    }
  }

  const out = new Array(deltas.length);
  out[0] = deltas[0];
  for (let i = 1; i < deltas.length; i++) {
    out[i] = out[i - 1] + deltas[i];
  }
  return out;
}
