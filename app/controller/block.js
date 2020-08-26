'use strict';

const Controller = require('egg').Controller;

class BlockController extends Controller {
  async getBlock() {
    const { ctx } = this;
    const { blockHashOrBlockNumber } = ctx.params;
    const block = await ctx.service.block.getBlock(blockHashOrBlockNumber);
    ctx.body = block;
  }

  async getBlocks() {
    const { ctx } = this;
    const { query } = ctx;
    ctx.body = await ctx.service.block.getBlocks(query.page, query.size);
  }

  async getOverview() {
    this.ctx.body = await this.ctx.service.block.getOverview();
  }
}

module.exports = BlockController;
