'use strict';

const Controller = require('egg').Controller;

class AddressController extends Controller {
  async getInfo() {
    const { ctx } = this;
    const { address, startTime, endTime } = ctx.params;
    const data = await ctx.service.address.find(address, startTime, endTime);
    const { status, ...body } = data;
    ctx.status = status;
    ctx.body = body;
  }
}

module.exports = AddressController;
