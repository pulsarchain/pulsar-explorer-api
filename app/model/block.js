'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const BlockSchema = new Schema({
    difficulty: String,
    extraData: String,
    extraDataText: String,
    gasLimit: Number,
    gasUsed: Number,
    gasAvg: Number,
    gasAvgUnit: String,
    hash: { type: String, index: true, unique: true },
    logsBloom: String,
    miner: String,
    mixHash: String,
    nonce: String,
    number: { type: Number, index: true },
    parentHash: String,
    receiptsRoot: String,
    sha3Uncles: String,
    size: Number,
    stateRoot: String,
    timestamp: Number,
    totalDifficulty: String,
    transactionsRoot: String,
    uncles: Array,
    transactions: Array,
    transactionCount: Number,
    sizeUnit: String,
    confirmationBlocks: Number
  });
  return mongoose.model('Block', BlockSchema);
};
