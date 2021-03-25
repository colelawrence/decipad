import * as tf from '@tensorflow/tfjs-core';

export class Value {
  rowCount = null;

  constructor(public tensor: tf.Scalar) {}

  withRowCount(rowCount: number) {
    const tiled: tf.Tensor1D = tf.tile(tf.reshape(this.tensor, [1]), [
      rowCount,
    ]);

    return new Column(tiled);
  }

  asValue() {
    return this;
  }

  getInternalTensor() {
    return this.tensor;
  }

  async getData() {
    return (await this.tensor.data())[0];
  }
}

export class Range {
  rowCount = null;

  constructor(public start: tf.Scalar, public end: tf.Scalar) {}

  async getData() {
    return [(await this.start.data())[0], (await this.end.data())[0]];
  }
}

export class Column {
  constructor(public tensors: tf.Tensor1D) {}

  static fromValues(values: (Value | Column)[]) {
    const items: tf.Tensor1D[] = values.map((v) =>
      tf.reshape(v.asValue().tensor, [1])
    );
    return new Column(tf.concat(items));
  }

  get rowCount() {
    return this.tensors.shape[0];
  }

  withRowCount(rowCount: number) {
    if (rowCount === this.rowCount) {
      return this;
    } else {
      throw new Error(
        'panic: bad column shape ' +
          JSON.stringify(this.tensors.shape) +
          ' incompatible with desired row count ' +
          rowCount
      );
    }
  }

  getInternalTensor() {
    return this.tensors;
  }

  async getData() {
    return [...(await this.tensors.data())];
  }

  asValue() {
    if (this.rowCount === 1) {
      return new Value(tf.reshape(this.tensors, []));
    } else {
      throw new Error('panic: expected scalar value');
    }
  }
}

export class Table {
  constructor(public columns: Map<string, Column> = new Map()) {}
}

export const fromTensor = (tensor: tf.Tensor): Value | Column => {
  if (tensor.shape.length === 0) {
    return new Value(tensor as tf.Scalar);
  } else {
    return new Column(tensor as tf.Tensor1D);
  }
};
