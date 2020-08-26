'use strict';

const dayjs = require('dayjs');
const Controller = require('egg').Controller;
const { exportXlsx } = require('../utils/index');
class TransactionController extends Controller {
  async list() {
    const { ctx } = this;
    const { query, service } = ctx;
    const { page, size, key, startTime, endTime } = query;
    ctx.body = await service.transaction.list(
      key,
      page,
      size,
      startTime,
      endTime
    );
  }
  async export() {
    const { ctx } = this;
    const { query, service } = ctx;
    const {
      key,
      page = 1,
      size = 10000,
      startTime,
      endTime,
      language = 'zh-CN'
    } = query;
    const exportData = await service.transaction.list(
      key,
      page,
      size,
      startTime,
      endTime
    );
    const exportDataXlsx = exportXlsx(language, exportData);
    ctx.set(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    ctx.body = exportDataXlsx;
  }
  async inspect() {
    const { ctx, app } = this;
    const BN = app.web3.utils.BN;
    const { request } = ctx;
    const { body } = request;
    const { address, startTime, endTime } = body;
    if (address) {
      const addressList = address.split(',');
      const end = dayjs(endTime || undefined)
        .hour(0)
        .minute(0)
        .second(0);
      const start =
        startTime && endTime ? dayjs(startTime) : end.subtract(100, 'day');

      const timestamp = { $gte: start.unix(), $lte: end.unix() };
      const data = await this.ctx.model.Transaction.aggregate()
        .sort({ timestamp: -1 })
        .match({
          $or: [{ from: { $in: addressList } }, { to: { $in: addressList } }],
          timestamp
        })
        .project({
          _id: 0,
          from: 1,
          to: 1,
          value: 1,
          timestamp: 1,
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: {
                $add: [
                  new Date(0),
                  28800000,
                  { $multiply: ['$timestamp', 1000] }
                ]
              }
            }
          }
        });

      const newData = {};
      addressList.forEach(key => {
        if (!key) return;
        const items = [];
        const temp = [];
        let amount = '0';
        data.forEach(n => {
          if (key === n.from || key === n.to) {
            items.push(n);
            temp.push(n.date);
            amount = new BN(amount).add(new BN(n.value)).toString();
          }
        });
        const days = [...new Set(temp)];
        newData[key] = {
          count: items.length,
          days: days.length,
          amount: app.web3.utils.fromWei(amount)
        };
      });
      ctx.body = newData;
    }
  }
}
module.exports = TransactionController;
