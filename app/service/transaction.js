'use strict';

const Service = require('egg').Service;
const math = require('mathjs');

function formatTransaction(app, transaction) {
  const eth = app.web3.utils.fromWei(transaction.value);
  transaction.value = math.format(math.bignumber(eth), {
    notation: 'fixed',
    precision: 8
  });
  // const gasFee = math.bignumber(transaction.gas).mul(transaction.gasPrice);
  const gasFee = math.multiply(transaction.gas, transaction.gasPrice).toString();
  transaction.gasFee = app.web3.utils.fromWei(gasFee);
  return transaction;
}

class TransactionService extends Service {
  async find(query = {}) {
    let data = await this.ctx.model.Transaction.findOne(query);
    if (data) {
      const block = await this.ctx.model.Block.findOne().sort({ number: -1 });
      const receipt = await this.app.web3.eth.getTransactionReceipt(data.hash);
      if (receipt) {
        data.gasUsed = receipt.gasUsed;
      }
      data = formatTransaction(this.app, data);
      data.confirmationBlocks = block.number - data.blockNumber;
      data.status = data.confirmationBlocks >= 12;
      console.log('data', data);
    }
    return data;
  }

  /**
   *
   * @param {*} key 字符串匹配 from, to, blockNumber, hash 字段。
   * @param {*} page 页码
   * @param {*} size 每页数量 默认 25
   * @param {*} startTime 开始时间
   * @param {*} endTime 结束时间
   */
  async list(key, page = 1, size = 25, startTime = 0, endTime) {
    const timestamp = { $gte: startTime / 1000 };
    if (endTime) {
      timestamp.$lte = endTime / 1000;
    }
    const q =
      key || key === 0
        ? {
          $or: [{ from: key }, { to: key }, { blockNumber: key }, { hash: key }],
          timestamp
        }
        : { timestamp };
    page = parseInt(page);
    size = parseInt(size);
    const data = await this.ctx.model.Transaction.find(q)
      .skip((page - 1) * size)
      .limit(size)
      .sort({ timestamp: -1 });
    data.map(item => formatTransaction(this.app, item));
    const total = await this.ctx.model.Transaction.find(q).countDocuments();
    return { data, page, size, total };
  }

  async save(transaction) {
    const { ctx } = this;
    const data = await this.find({ hash: transaction.hash });
    if (!data) {
      return await ctx.model.Transaction.create(transaction);
    }
  }
}

module.exports = TransactionService;
