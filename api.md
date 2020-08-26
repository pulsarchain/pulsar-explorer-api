## 波霎链浏览器接口文档

### 开发环境：[http://172.16.2.238:7001/api/v1](http://172.16.2.238:7001/api/v1)

#### 搜索接口 `/search`

> Parameters

> `key` : 交易哈希、区块高度、地址

> Returns `Object`

> `type`: `ADDRESS` | `BLOCK` | `HASH`

> `data`: `Object`

#### 数据面板 `/overview`

> Returns `Object`

> `data`: `Object`

#### 区块列表 `/blocks`

> Parameters

> `page` : 页码。默认 `1`

> `size` : 每页数量。默认`25`

> Returns `Array`

> `data` : `Array`

#### 区块详情 `/blocks/:blockHashOrBlockNumber`

> Parameters

> `blockHashOrBlockNumber` : 区块高度或区块哈希

> Returns `Object`

> `data` : `Object`

#### 地址详情 `/address/:address`

> Parameters

> `address` : `from` | `to`
>
> Returns `Object`

> `data` : `Object`

#### 交易列表 `/transactions`

> Parameters

> `page` : 页码。默认 `1`

> `size` : 每页数量。默认`25`

> `key` : 可以是 `from`, `to`, `blockNumber`, `hash`

> Returns `Array`

> `data` : `Array`
