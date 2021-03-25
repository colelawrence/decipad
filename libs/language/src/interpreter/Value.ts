import * as tf from '@tensorflow/tfjs-core';

export class Value {
  rowCount = null;
  tensor: tf.Scalar;

  constructor(tensor: tf.Scalar | number) {
    if (typeof tensor === 'number') {
      this.tensor = tf.tensor(tensor);
    } else {
      this.tensor = tensor;
    }
  }

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

  constructor(public start: Value, public end: Value) {}

  async getData() {
    return [await this.start.getData(), await this.end.getData()];
  }

  asValue(): Value {
    throw new Error('panic: Range cannot be turned into a single value');
  }

  withRowCount(): Column {
    throw new Error('not implemented TODO');
  }

  getInternalTensor() {
    return tf.tensor([
      this.start.tensor.dataSync()[0],
      this.end.tensor.dataSync()[0],
    ]);
  }
}

export class Column {
  constructor(public tensors: tf.Tensor1D) {}

  static fromValues(values: SimpleValue[]) {
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

export type SimpleValue = Value | Range | Column;
export type AnyValue = SimpleValue | Table;

export const fromTensor = (tensor: tf.Tensor): Value | Column => {
  if (tensor.shape.length === 0) {
    return new Value(tensor as tf.Scalar);
  } else {
    return new Column(tensor as tf.Tensor1D);
  }
};
