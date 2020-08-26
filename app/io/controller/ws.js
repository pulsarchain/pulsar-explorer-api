'use strict';

const Controller = require('egg').Controller;

class WSController extends Controller {
  async index() {
    await this.ctx.service.block.pushOverviewAndBlocks();
  }
}

module.exports = WSController;
