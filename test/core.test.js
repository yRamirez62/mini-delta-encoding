import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { encode, decode } from '../src/index.js';

describe('encode', () => {
  it('encodes a monotonically increasing sequence', () => {
    assert.deepEqual(encode([10, 11, 12, 13, 14]), [10, 1, 1, 1, 1]);
  });

  it('encodes a strictly decreasing sequence as negative deltas', () => {
    assert.deepEqual(encode([100, 97, 90, 80]), [100, -3, -7, -10]);
  });

  it('encodes a non-monotonic sequence', () => {
    assert.deepEqual(encode([5, 8, 3, 9, 1]), [5, 3, -5, 6, -8]);
  });

  it('returns an empty array for empty input', () => {
    assert.deepEqual(encode([]), []);
  });

  it('encodes a single-element array as itself', () => {
    assert.deepEqual(encode([42]), [42]);
  });

  it('handles a constant sequence with all-zero deltas', () => {
    assert.deepEqual(encode([7, 7, 7, 7]), [7, 0, 0, 0]);
  });

  it('handles negative values and zero crossing', () => {
    assert.deepEqual(encode([-3, -1, 0, 2, 5]), [-3, 2, 1, 2, 3]);
  });

  it('handles the full safe-integer range boundaries', () => {
    const max = Number.MAX_SAFE_INTEGER;
    const min = Number.MIN_SAFE_INTEGER;
    assert.deepEqual(encode([min, 0, max]), [min, -min, max]);
  });

  it('throws TypeError for non-array input', () => {
    assert.throws(() => encode('not an array'), /encode expects an array/);
    assert.throws(() => encode(null), /encode expects an array/);
    assert.throws(() => encode(undefined), /encode expects an array/);
  });

  it('throws TypeError for non-integer elements', () => {
    assert.throws(() => encode([1, 2.5, 3]), /not a safe integer/);
    assert.throws(() => encode([1, 'x', 3]), /not a safe integer/);
    assert.throws(() => encode([1, null, 3]), /not a safe integer/);
    assert.throws(() => encode([1, NaN, 3]), /not a safe integer/);
    assert.throws(() => encode([1, Infinity, 3]), /not a safe integer/);
  });
});

describe('decode', () => {
  it('decodes a simple increasing sequence', () => {
    assert.deepEqual(decode([10, 1, 1, 1, 1]), [10, 11, 12, 13, 14]);
  });

  it('decodes a decreasing sequence', () => {
    assert.deepEqual(decode([100, -3, -7, -10]), [100, 97, 90, 80]);
  });

  it('decodes a non-monotonic sequence', () => {
    assert.deepEqual(decode([5, 3, -5, 6, -8]), [5, 8, 3, 9, 1]);
  });

  it('returns an empty array for empty input', () => {
    assert.deepEqual(decode([]), []);
  });

  it('decodes a single-element array as itself', () => {
    assert.deepEqual(decode([42]), [42]);
  });

  it('decodes all-zero deltas into a constant sequence', () => {
    assert.deepEqual(decode([7, 0, 0, 0]), [7, 7, 7, 7]);
  });

  it('handles negative values and zero crossing', () => {
    assert.deepEqual(decode([-3, 2, 1, 2, 3]), [-3, -1, 0, 2, 5]);
  });

  it('throws TypeError for non-array input', () => {
    assert.throws(() => decode('nope'), /decode expects an array/);
    assert.throws(() => decode(null), /decode expects an array/);
  });

  it('throws TypeError for non-integer elements', () => {
    assert.throws(() => decode([1, 2.5]), /not a safe integer/);
    assert.throws(() => decode([1, 'x']), /not a safe integer/);
    assert.throws(() => decode([1, NaN]), /not a safe integer/);
    assert.throws(() => decode([1, Infinity]), /not a safe integer/);
  });
});

describe('round-trip', () => {
  it('round-trips an empty sequence', () => {
    assert.deepEqual(decode(encode([])), []);
  });

  it('round-trips a single element', () => {
    assert.deepEqual(decode(encode([99])), [99]);
  });

  it('round-trips a varied sequence', () => {
    const original = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5];
    assert.deepEqual(decode(encode(original)), original);
  });

  it('round-trips a decreasing sequence', () => {
    const original = [50, 40, 30, 20, 10, 0];
    assert.deepEqual(decode(encode(original)), original);
  });

  it('round-trips a constant sequence', () => {
    const original = [8, 8, 8, 8, 8];
    assert.deepEqual(decode(encode(original)), original);
  });

  it('round-trips negative and positive boundaries', () => {
    const max = Number.MAX_SAFE_INTEGER;
    const min = Number.MIN_SAFE_INTEGER;
    const original = [min, -1, 0, 1, max];
    assert.deepEqual(decode(encode(original)), original);
  });
});
