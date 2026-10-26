# mini-delta-encoding

Encodes and decodes a sequence of integers as the differences between consecutive values, storing the first value verbatim as an anchor.

## Usage

```js
import { encode, decode } from 'mini-delta-encoding';

const values = [100, 102, 101, 105, 105];
const deltas = encode(values); // [100, 2, -1, 4, 0]
const restored = decode(deltas); // [100, 102, 101, 105, 105]
```

## Why

Delta encoding shrinks the storage footprint of an ordered integer series when adjacent values are close — timestamps, monotonically-increasing counters, sensor samples, and similar telemetry. The trade-off is that you must store or transmit the first value as an anchor, and random access into the middle of the sequence requires a partial running sum from the nearest preceding anchor. This library handles only the encode/decode transform; it leaves framing, compression, and chunking to the caller so the dependency surface stays at zero.

## Edge cases

- An empty input round-trips to an empty output.
- A single-element input encodes to itself; there is no delta to compute.
- `Number.MAX_SAFE_INTEGER` and `Number.MIN_SAFE_INTEGER` are accepted. However, a delta can land outside the safe-integer range if a value near the maximum is followed by a value near the minimum (or vice versa). In that extreme, the arithmetic still produces a correct double, but `Number.isSafeInteger` will return false for the delta and `decode` will reject it. This is intentional: silent precision loss is worse than a throw.

## Tests

```sh
node --test
```
