/* eslint valid-jsdoc: "off" */

"use strict";

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = (appInfo) => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = (exports = {});

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + "_1572588029608_7985";

  config.middleware = ["errorHandler", "response"];
  // 配置 gzip 中间件的配置
  config.gzip = {
    threshold: 1024, // 小于 1k 的响应体不压缩
  };

  config.mongoose = {
    url: "mongodb://192.168.0.146:27017/bosha_explorer",
    options: {},
  };

  config.cors = {
    origin: "*",
    allowMethods: "GET,HEAD,PUT,POST,DELETE,PATCH",
  };

  config.io = {
    namespace: {
      "/": {
        connectionMiddleware: [],
        packetMiddleware: [],
      },
    },
  };

  config.httpProvider = "http://192.168.0.146:8545/";
  config.noticeUrl = "http://xxxxx";
  config.qaNoticeUrl = "http://xxxxx";

  config.security = {
    csrf: {
      enable: false,
    },
  };

  config.bodyParser = {
    enable: true,
  };

  return config;
};
