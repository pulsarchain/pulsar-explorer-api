'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const TransactionSchema = new Schema({
    blockHash: { type: String, index: true },
    blockNumber: { type: String, index: true },
    from: { type: String, index: true },
    gas: Number,
    gasPrice: String,
    gasAvg: Number,
    gasAvgUnit: String,
    gasFee: String,
    hash: { type: String, index: true, unique: true },
    input: String,
    nonce: Number,
    r: String,
    s: String,
    to: { type: String, index: true },
    transactionIndex: Number,
    v: String,
    value: String,
    status: Boolean,
    timestamp: Number,
    confirmationBlocks: Number,
    gasUsed: Number
  });
  return mongoose.model('Transaction', TransactionSchema);
};
