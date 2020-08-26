'use strict';
const math = require('mathjs');
const xlsx = require('node-xlsx').default;
const dayjs = require('dayjs');
function formatDifficulty(difficulty, precision = 2) {
  return math.format(math.unit(difficulty, 'Hz'), { notation: 'fixed', precision });
}

function formatSize(size, precision = 2) {
  return math.format(math.unit(size, 'B'), { notation: 'fixed', precision });
}


function exportXlsx(language, data) {
  const tableHeader = {
    'en-US': [
      {
        label: 'Tx Hash',
        key: 'hash'
      }, {
        label: 'Block #',
        key: 'blockNumber'
      }, {
        label: 'Time',
        key: 'timestamp'
      }, {
        label: 'From',
        key: 'from'
      }, {
        label: 'To',
        key: 'to'
      }, {
        label: 'Transaction Number',
        key: 'value'
      }, {
        label: 'Transaction Fee',
        key: 'gasFee'
      }, {
        label: 'Gas Used',
        key: 'gasAvg'
      }
    ],
    'zh-CN': [{
      label: '交易哈希',
      key: 'hash'
    }, {
      label: '区块高度',
      key: 'blockNumber'
    }, {
      label: '时间',
      key: 'timestamp'
    }, {
      label: '发送方',
      key: 'from'
    }, {
      label: '接收方',
      key: 'to'
    }, {
      label: '交易数量',
      key: 'value'
    }, {
      label: '手续费',
      key: 'gasFee'
    }, {
      label: '燃料消耗',
      key: 'gasAvg'
    }]
  };
  const header = tableHeader[language].map(item => item.label);
  const excel = [header];
  const d = data.data.map(itemData => {
    return tableHeader[language].map(item => item.key).map(key => {
      if (key === 'timestamp' && itemData[key]) {
        return dayjs(itemData[key] * 1000).format('YYYY/MM/DD hh:mm:ss');
      }
      return itemData[key];
    });
  });
  excel.push(...d);
  const options = { '!cols': [{ wch: 20 }, { wch: 10 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }] };
  const buffer = xlsx.build([{ name: 'transitionRecord', data: excel }], options);
  return buffer;
}

module.exports = { formatDifficulty, formatSize, exportXlsx };
