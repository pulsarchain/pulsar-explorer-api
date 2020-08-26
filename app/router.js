'use strict';

const Web3 = require('web3');

// /**
//  * @param {Egg.Application} app - egg application
//  */
module.exports = async app => {
  const { router, controller, io } = app;
  const { httpProvider } = app.config;
  const web3 = new Web3(new Web3.providers.HttpProvider(httpProvider));
  app.web3 = web3;

  io.of('/').route('ws', io.controller.ws.index);

  router.prefix('/api/v1');
  router.get('/search', controller.search.search);
  router.get('/overview', controller.block.getOverview);
  router.get('/blocks', controller.block.getBlocks);
  router.get('/blocks/:blockHashOrBlockNumber', controller.block.getBlock);
  router.get('/address/:address', controller.address.getInfo);
  router.get('/transactions', controller.transaction.list);
  router.get('/transactions/transitionRecord', controller.transaction.export);
  router.post('/transactions/inspect', controller.transaction.inspect);
};
