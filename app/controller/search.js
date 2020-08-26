'use strict';
const Controller = require('egg').Controller;
const toNumber = require('lodash/toNumber');

class SearchController extends Controller {
  async search() {
    const { ctx, app } = this;
    const { query } = ctx;
    const { key, startTime, endTime } = query;
    if (key) {
      const isAddress = app.web3.utils.isAddress(key);
      let data = null;
      if (isAddress) {
        const res = await ctx.service.address.find(key, startTime, endTime);
        if (res) {
          delete res.status;
          data = { data: res, type: 'ADDRESS' };
        }
      } else if (!app.web3.utils.isHexStrict(key)) {
        const res = await ctx.service.block.getBlock(toNumber(key));
        if (res) {
          data = { data: res, type: 'BLOCK' };
        }
      } else {
        const block = await ctx.service.block.getBlock(key);
        if (block) {
          data = { data: block, type: 'BLOCK' };
        } else {
          const res = await ctx.service.transaction.find({ hash: key });
          if (res) {
            data = { data: res, type: 'HASH' };
          }
        }
      }
      ctx.body = data;
    }
  }
}

module.exports = SearchController;
