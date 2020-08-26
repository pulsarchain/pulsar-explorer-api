"use strict";

const Service = require("egg").Service;
const isNaN = require("lodash/isNaN");
const toNumber = require("lodash/toNumber");
const math = require("mathjs");

const { formatDifficulty, formatSize } = require("../utils");

function formatBlock(app, block) {
  block.difficulty = formatDifficulty(block.difficulty);
  block.extraDataText = app.web3.utils.isHex(block.extraData)
    ? app.web3.utils.hexToAscii(block.extraData)
    : block.extraData;
  return block;
}

class BlockService extends Service {
  async getBlock(blockHashOrBlockNumber, returnTransactionObjects = true) {
    const { ctx, app } = this;
    const isHex = app.web3.utils.isHexStrict(blockHashOrBlockNumber);
    const query =
      isHex || isNaN(toNumber(blockHashOrBlockNumber))
        ? { hash: blockHashOrBlockNumber }
        : { number: toNumber(blockHashOrBlockNumber) };
    let block = await ctx.model.Block.findOne(query);
    if (block) {
      const latestBlock = await this.ctx.model.Block.findOne().sort({
        number: -1,
      });
      block.confirmationBlocks = latestBlock.number - block.number;
      block = formatBlock(app, block);
      if (returnTransactionObjects) {
        const transaction = await ctx.service.transaction.list(block.number);
        block.transactions = transaction.data;
      }
    }
    return block;
  }

  async getOverview() {
    const { ctx, app } = this;
    const hashRate = await app.web3.eth.getHashrate();
    const size = 1000;
    const list = await ctx.model.Block.find().sort({ number: -1 }).limit(2);

    const firstTime = list[0].timestamp;
    const lastTime = list[1].timestamp;

    const blockTime = firstTime - lastTime;

    const data = await ctx.model.Block.aggregate()
      .sort({ number: -1 })
      .limit(size)
      .group({
        _id: null,
        transactionCount: { $sum: "$transactionCount" },
        blockNumber: { $first: "$number" },
        difficulty: { $first: "$difficulty" },
        firstTimestamp: { $first: "$timestamp" },
        lastTimestamp: { $last: "$timestamp" },
      });
    const {
      difficulty,
      firstTimestamp,
      lastTimestamp,
      transactionCount,
      blockNumber,
    } = data[0];
    const diffTimestamp = firstTimestamp - lastTimestamp;
    const tps = transactionCount / diffTimestamp;
    return {
      difficulty: formatDifficulty(difficulty),
      hashRate,
      blockTime,
      tps: math.format(tps, { notation: "fixed", precision: tps < 1 ? 4 : 2 }),
      blockNumber,
    };
  }

  /**
   *
   * @param {*} page 页码
   * @param {*} size 每页数量
   */

  async getBlocks(page = 1, size = 25) {
    page = parseInt(page);
    size = parseInt(size);
    const data = await this.ctx.model.Block.find()
      .skip((page - 1) * size)
      .limit(size)
      .sort({ number: -1 });
    data.map((block) => formatBlock(this.app, block));
    const total = await this.ctx.model.Block.find().estimatedDocumentCount();
    return { data, page, size, total };
  }

  /**
   *
   * @param {*} count 一次同步多少个区块
   */
  async sync(count = 100) {
    // 链上最新区块号
    const blockNumber = await this.app.web3.eth.getBlockNumber();
    // 数据库最新区块号
    const block = await this.ctx.model.Block.findOne().sort({ number: -1 });
    const latestBlock = block ? block.number + 1 : 0;
    const realLatestBlock = latestBlock - 1;
    // 往前同步5个区块，获取打包延迟的交易记录
    const startBlockNumber = latestBlock > 5 ? latestBlock - 5 : latestBlock;
    // console.log(
    //   "链上最新区块:",
    //   blockNumber,
    //   "数据库最新区块:",
    //   realLatestBlock
    // );
    if (realLatestBlock >= blockNumber) {
      // console.log('此', realLatestBlock, '区块已最大');
      return false;
    }
    const diff = blockNumber - latestBlock;
    const loopNumber = count;
    const maxNumber = latestBlock + (diff > loopNumber ? loopNumber : diff);
    // console.log(`从 ${startBlockNumber} 同步至 ${maxNumber} 区块`);
    for (let i = startBlockNumber; i <= maxNumber; i++) {
      try {
        await this.writeBlock(i);
      } catch (error) {
        this.ctx.logger.error(
          `区块 ${i} 同步出错！error: ${error.message}`,
          error
        );
        break;
      }
    }
    await this.pushOverviewAndBlocks();
  }

  async writeBlock(blockNumber) {
    const { ctx, app } = this;
    const block = await app.web3.eth.getBlock(blockNumber, true);

    const { transactions = [], ...params } = block;
    const transactionCount = transactions.length;

    const avg = params.gasUsed
      ? parseInt(params.gasUsed / transactionCount)
      : 0;
    params.gasAvg = avg;
    params.gasAvgUnit = `${app.web3.utils.fromWei(
      math.bignumber(avg).toString(),
      "Gwei"
    )} Gwei`;
    params.sizeUnit = formatSize(params.size);

    for (let i = 0; i < transactionCount; i++) {
      const transaction = transactions[i];
      transaction.timestamp = params.timestamp;
      transaction.gasAvg = params.gasAvg;
      transaction.gasAvgUnit = params.gasAvgUnit;
      await ctx.service.transaction.save(transaction);
    }

    const dbBlock = await this.getBlock(blockNumber, false);
    if (!dbBlock) {
      await this.ctx.model.Block.create({ ...params, transactionCount });
      if (transactionCount) {
        const noticeUrl = `${app.config.noticeUrl}/api/user/notice/`;
        const qaNoticeUrl = `${app.config.qaNoticeUrl}/api/user/notice/`;
        const noticeBody = { blockNumber: block.number, transactions };
        const body = {
          method: "POST",
          contentType: "json",
          data: noticeBody,
          dataType: "json",
        };
        await ctx.curl(noticeUrl, body);
        if (app.config.qaNoticeUrl) {
          await ctx.curl(qaNoticeUrl, body);
        }
      }
      // this.ctx.logger.info(
      //   `区块 ${blockNumber} 同步完成, 有 ${transactionCount} 条交易记录。`
      // );
    }
  }

  async pushOverviewAndBlocks() {
    const nsp = this.ctx.app.io.of("/");
    const overview = await this.getOverview();
    const { data: blocks } = await this.getBlocks(1, 10);
    if (blocks && blocks.length && overview.blockNumber !== blocks[0].number) {
      overview.blockNumber = blocks[0].number;
    }
    const data = { overview, blocks };
    nsp.emit("message", data);
  }
}

module.exports = BlockService;
