'use strict';

const Subscription = require('egg').Subscription;

class SyncBlock extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      interval: '10s', // 间隔
      type: 'worker', // 每台机器上的每个 worker 都会执行这个定时任务。
      immediate: true // ready 是否后立刻执行
    };
  }

  async subscribe() {
    await this.ctx.service.block.sync();
  }
}

module.exports = SyncBlock;
