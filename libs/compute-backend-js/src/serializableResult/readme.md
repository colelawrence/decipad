# How Serialization Works

The serialization format is complicated enough to need its own explainer, so here it is.

The TypeScript type for serialized data is:

```TypeScript
type SerializedResult = {
  type: BigUint64Array;
  data: Uint8Array;
};
```

The raw data is laid out sequentially in `data`, with no annotation. The type describes the shape of the data, so that it can be read correctly. There are two types of type annotation: uncompressed, and compressed. It's much easier to understand uncompressed type annotations, so we'll start with those first.

## Uncompressed Type Annotations

For a single atomic value (like a string, fraction, or boolean), a type has the form `[kind] [offset] [length]`, which we represent with three unsigned, 64-bit integers. The kind integer is self explanatory, it describes the kind of the data, which could also be called the type ordinarily, but I'm using "kind" in this case, to avoid confusion with the full kind/offset/length type description. The kind uses the encoding:

```
0 = Boolean
1 = Fraction
2 = Float
3 = String
4 = Column
```

We can divide these kinds into atomic (boolean, fraciton, float, string) and compound (column), depending on whether they are made up of other data kinds or not. There is more to this integer, but we won't discuss that until we look at compressed type annotations.

The middle integer in the type description is the offset integer. The meaning of this varies depending on whether the type has an atomic or compound type. In the case of an atomic kind, the offset represents the offset of the value's data in the data array. In the case of a compound kind (a column) the offset refers to the first value in the column, as an offset in the type array. It's important to note that this offset is measured in types, not bytes or integers. As a type is made up of three 64-bit integers, you have to multiply the type offset by 3 to get the offset in the integer array.

The final type integer gives the length of the type, and again, its meaning depends on whether the type has an atomic or compound kind. For an atomic kind, the length integer is the length of the value's data in the data array, in bytes. For a compound kind, the length integer is the number of direct children the column contains.

With that in mind, here's how you would represent the boolean value `true`:

```
value = true

type: [0][0][1]
data: [1]
```

While a string would look like this:

```
value = "Hello"

type: [3][0][5]
data: [H][e][l][l][o]
```

For the time being, `Column` is our only collection type. A column type is represented by the kind column, followed by the type description, or type descriptions, for its contents. So a column of strings would look like this:

```
value = ["hi", "bye"]

type: [4][1][2] [3][0][2] [3][2][3] # spacing added for clarity
data: [h][i][b][y][e]
```

The type here is a bit more complicated, so let's break it down. `[4][1][2]` represents the column (`4`), which has two children (`2`), whose type descriptions start at index 3 in the type array, this offset index is represented by the number `1` because it's actually desctiption 1 when you zero index. `[3][0][2]` represents the string `"hi"`, whose data starts at `0`, and has a length of `2`. `[3][2][3]` represents the second value in the column, the string `"bye"`, again its data starts at index `2`, and has length `3`. Now how about a column of columns of strings:

```
value = [["a", "b"], ["c", "d"]]

type: [4][1][2] [4][3][2] [4][5][2] [3][0][1] [3][1][1] [3][2][1] [3][3][1]
data: [a][b][c][d]
```

The first type description, `[4][1][2]`, represents the outer column. It must then be followed by its immediate children, `[4][3][2]` and `[4][4][2]`, both also arrays. The string contents of these inner arrays then come next: `[3][0][1] [3][1][1] [3][2][1] [3][3][1]`. Laying the data out in this way ensures that the type descriptions for the direct children of a column are always next to each other, and in order. This means we can use the column's type description to:

- Index into the column's contents: the type for the ith element of the column starts at index `column_offset + i * 3` in the type array, where `column_offset` is the second integer in the type description.
- Iterate over the column's contents: we can write a for loop `for (let i = column_offset; i < column_offset + column_length * 3; i+= 3) { /* ... */}` so that `i` represents the index in the type array of the type integer of each child. `i + 1` is therefore the offset integer of that type, and `i + 2` the length integer.

You may notice, in this serialization, the length of the whole type (21 bytes) has already exceeded the length of the data (4 bytes). Because the bottom-level type in this example is a string, a variable length type, there's not much we can do about that. Each string's offset and length has to be noted, or we've no way of making sense of the data. But we don't always have to labour under such conditions. Sometimes we can use...

## Compressed Type Anontations

**EDIT:** this is an only maybe-worthwhile optimisation that's currently only implemented for deserialization, but not serialization. This shouldn't cause any problems, it just means the deserializer will never encounter a compresed type as we don't have a way of serializing them.

When the leaf nodes of a nested data structure have a known length, we can start to be clever about how we represent them. For example, three consecutive booleans can naively be annotated with `[0][0][1] [0][1][1] [0][2][1]`, or we could represent them with a single type `[0'][3][1]` where `0'` (zero prime) represents a boolean that's been annotated to show that it's the compressed form of a boolean kind, `3` is the "count" of instances of the type, and `1` is the size of the type. In general this has the form `[kind'][count][size]`.

You might be wondering how a type is marked as a compressed type, and the answer is that we set the first bit of the type integer to 1. This halves the size of our possible type space from 2^64 to 2^63, but we can cope with that. We can encode and decode our compression marker with the following operations:

```TypeScript
const encode = n => n | (1n << 63n)
const decode_compression_bit = n => (n >> 63n) & 1
const decode_type_int = n => n & 0x7FFFFFFFFFFFFFFF
```

Once we know that a type is compressed, we can decompress it with a loop that progresses along the data array `count` times, deserializing `size`-sized chunks.

Note that there are two limitations to how compressed type annotations can be used. Firstly, a compressed type annotation can't be the first type in a type description. A serialized result represents one single result, while compressed type annotations imply more than one result, so compressed type annotations can only ever appear as the sub-type of a collection type, like a column. So `[bool'][3][1]` on its own is meaningless, but `[column][0][3] [bool'][3][1]` is valid.

Secondly, a compressed type annotation can only be followed by more compressed type annotations, or else by nothing. For example, in a column of columns of booleans, the columns of booleans can both be compressed, but a column of columns of strings will have to be entirely uncompressed, because strings don't have a fixed size. Another way of looking at this, is that the data must be rectangular, cuboidal, or hyperrectangular, e.g. when visualised in n-dimensions, the data should have flat sides. So:

```
[1][1][1]
[1][1][1]
```

can be compressed. But:

```
[1][1][1]
[1][1][1][1]
```

can't be.

## Why Length _and_ Offset?

You might have noticed one or the other of length or offset is redundant in uncompressed data types. You could either have just offsets, and read in the data between two consecutive offsets, or you could have just lengths, and read in consectuive chunks of data according to their lengths. Right now we basically gain no advantage from doing having both length and offset, because we deserialize the type all in one go, and turn it into a Rust value. But in the future, we could leave the data as it is, and implement traits for iteration and random access.

The iteration trait could, again, work just as well with a length or an offset value, but random access requires an offset to work, and an offset and a length to work without having to peek ahead at the next type's offset.
