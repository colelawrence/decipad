import * as tf from "@tensorflow/tfjs-core";

export interface Table {
  [colName: string]: tf.Tensor
}

export const isTable = (table: Table | tf.Tensor): table is Table => {
  return !(table instanceof tf.Tensor)
}
