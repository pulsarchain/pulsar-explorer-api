'use strict';

const Service = require('egg').Service;

class ServiceAddress extends Service {
  async find(address, startTime, endTime) {
    const { ctx, app } = this;
    const isAddress = app.web3.utils.isAddress(address);
    let data = {
      status: 500,
      message: `Given input "${address}" is not a valid address.`
    };
    if (isAddress) {
      address = app.web3.utils.toChecksumAddress(address);
      const balance = await app.web3.eth.getBalance(address);
      const code = await app.web3.eth.getCode(address);
      const transaction = await ctx.service.transaction.list(address, undefined, undefined, startTime, endTime);
      data = {
        status: 200,
        code,
        balance: app.web3.utils.fromWei(balance),
        address,
        transactionCount: transaction.total,
        transactions: transaction.data
      };
    }
    return data;
  }
}

module.exports = ServiceAddress;
