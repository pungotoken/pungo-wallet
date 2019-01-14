const bs58check = require('bs58check');

import {Promise} from 'meteor/promise';

import {isKomodoCoin} from './../lib/agama-wallet-lib/build/coin-helpers';
import {getFiatCurrenciesLabels, getLocalStorageVar, getPriceForCurrency, setLocalStorageVar} from './utils';
import {seedToWif, wifToWif,} from './../lib/agama-wallet-lib/build/keys';
import proxyServers from './proxyServers';

import electrumServers from './../conf/electrum-servers';
import getKMDBalance from './getKMDBalance';
import createtx from './createtx';
import listtransactions from './listtransactions';
import listunspent from './listunspent';
import {fromSats, getRandomIntInclusive,} from './../lib/agama-wallet-lib/build/utils';
import electrumJSNetworks from './../lib/agama-wallet-lib/build/bitcoinjs-networks';
import {devlog} from './dev';

let _cache = {};

// runtime cache wrapper functions
const getTransaction = (txid, coin, httpParams) => {
  return new Promise((resolve, reject) => {
    if (!_cache[coin]) {
      _cache[coin] = {};
    }
    if (!_cache[coin].tx) {
      _cache[coin].tx = {};
    }

    if (!_cache[coin].tx[txid]) {
      devlog(`raw input tx ${txid}`);

      HTTP.call('GET', httpParams.url, {
        params: httpParams.params,
      }, (error, result) => {
        const _result = JSON.parse(result.content);

        if (_result.msg !== 'error') {
          _cache[coin].tx[txid] = result;
        }

        resolve(result);
      });
    } else {
      devlog(`cached raw input tx ${txid}`);
      resolve(_cache[coin].tx[txid]);
    }
  });
}

const getBlockheader = (height, coin, httpParams) => {
  return new Promise((resolve, reject) => {
    if (!_cache[coin]) {
      _cache[coin] = {};
    }
    if (!_cache[coin].blockheader) {
      _cache[coin].blockheader = {};
    }

    if (!_cache[coin].blockheader[height]) {
      devlog(`blockheader ${height}`);

      HTTP.call('GET', httpParams.url, {
        params: httpParams.params,
      }, (error, result) => {
        const _result = JSON.parse(result.content);

        if (_result.msg !== 'error') {
          _cache[coin].blockheader[height] = result;
        }

        resolve(result);
      });
    } else {
      devlog(`cached blockheader ${height}`);
      resolve(_cache[coin].blockheader[height]);
    }
  });
}

const cache = {
  getTransaction,
  getBlockheader,
};

let electrumKeys = {};
let proxyServer = {};
// pick a random proxy server

const _getAnotherProxy = () => {
  const _randomServer = proxyServers[getRandomIntInclusive(0, proxyServers.length - 1)];
  proxyServer = {
    ip: _randomServer.ip,
    port: _randomServer.port,
  };

  devlog(`proxy ${proxyServer.ip}:${proxyServer.port}`);
};

const getAnotherProxy = () => {
  return async (dispatch) => {
    _getAnotherProxy();
  };
}

_getAnotherProxy();

const getServersList = () => {
  return async (dispatch) => {
    return new Promise((resolve, reject) => {
      resolve(electrumServers);
    });
  }
}

const setDefaultServer = (network, port, ip, proto) => {
  return async (dispatch) => {
    return new Promise((resolve, reject) => {
      // HTTP.call('GET', `http://${proxyServer.ip}:${proxyServer.port}/api/server/version`, {
      HTTP.call('GET', `https://${proxyServer.ip}/api/server/version`, {
        params: {
          port,
          ip,
          proto,
        },
      }, (error, result) => {
        result = JSON.parse(result.content);

        if (result.msg === 'error') {
          resolve('error');
        } else {
          electrumServers[network].port = port;
          electrumServers[network].ip = ip;
          electrumServers[network].proto = proto;

          resolve(true);
        }
      });
    });
  }
}

const clearKeys = () => {
  return async (dispatch) => {
    return new Promise((resolve, reject) => {
      electrumKeys = {};
      resolve(true);
    });
  }
}

const sendtx = (network, outputAddress, value, verify, push, btcFee) => {
  return async (dispatch) => {
    return new Promise((resolve, reject) => {
      const changeAddress = electrumKeys[network].pub;
      let _electrumServer = getLocalStorageVar('coins')[network].server;
      _electrumServer.serverList = electrumServers[network].serverList;

      console.log(">>>>>>>> 1", network);
      console.log(">>>>>>>> 2", outputAddress);
      console.log(">>>>>>>> 3", value);
      console.log(">>>>>>>> 4", verify);
      console.log(">>>>>>>> 5", push);
      console.log(">>>>>>>> 6", btcFee);
      console.log(">>>>>>>> 7", electrumServers);
      console.log(">>>>>>>> 8", _electrumServer);

      devlog(`sendtx ${network}`);

      let fee = { perbyte: false, value: 0 };

      if(btcFee) {
        fee.perbyte = true;
        fee.value = btcFee;
      } else {
        v = (isKomodoCoin(network) ? electrumServers.kmd.txfee : electrumServers[network].txfee);
        if(v) {
          fee.value = v;
        }
      }

      console.log(">>>>>>>> RESULT", fee, fee.value, value);

      createtx(
        proxyServer,
        _electrumServer,
        outputAddress,
        changeAddress,
        value,
        fee,
        electrumKeys[network].priv,
        network,
        verify,
        push,
        cache
      )
      .then((res) => {
        resolve(res);
      });
    });
  }
}

const transactions = (network, numberOfTransactions) => {
  return async (dispatch) => {
    return new Promise((resolve, reject) => {
      let _electrumServer = getLocalStorageVar('coins')[network].server;

      _electrumServer.serverList = electrumServers[network].serverList;

      // console.log("!!!!!!!!!!!!!!", network)
      // console.log("!!!!!!!!!!!!!!", electrumServers)
      // console.log("!!!!!!!!!!!!!!", _electrumServer, _electrumServer.serverList)

      listtransactions(
        proxyServer,
        _electrumServer,
        electrumKeys[network].pub,
        network,
        true,
        cache,
        numberOfTransactions
      )
      .then((res) => {

        console.log("====== TX list result", res);

        let countHash = {};
        for(let i = 0; i < res.length; i++) {
          if(!countHash[res[i].txid]) {
            countHash[res[i].txid] = [];
          }
          countHash[res[i].txid].push(res[i]);
        }

        console.log("====== TX count hash", countHash);

        let result = [];
        Object.keys(countHash).forEach(function (key, i) { 
          let value = countHash[key];

          if(value.length == 1) {
            
            console.log("====== TX count hash ++++++++++ ", value);

            if(value[0].type == "self") {
              value[0].amount = value[0].outputs[0].value;
            }

            result.push(value[0]);

          } else {

            let IN = null;
            let OUT = null;

            if(value[0].type == 'received') {
              IN = value[0];
              OUT = value[1];
            } else if(value[0].type == 'self') {
              IN = value[0];
              IN.amount = 1;
              OUT = value[1];
              OUT.amount = 5;
            } else {
              IN = value[1];
              OUT = value[0];
            }

            OUT.amount = Number(OUT.amount - IN.amount).toFixed(4);

            result.push(OUT);

          }

        })

        console.log("====== TX final", result);

        resolve(result);
      });
    });
  }
}

const balance = (network) => {
  return async (dispatch) => {
    const address = electrumKeys[network].pub;
    let _electrumServer = getLocalStorageVar('coins')[network].server;
    _electrumServer.serverList = electrumServers[network].serverList;

    console.log("++++ +++++ +++++ get balance action server", getLocalStorageVar('coins'), _electrumServer);

    return new Promise((resolve, reject) => {
      // HTTP.call('GET', `http://${proxyServer.ip}:${proxyServer.port}/api/getbalance`, {
      HTTP.call('GET', `https://${proxyServer.ip}/api/getbalance`, {
        params: {
          port: _electrumServer.port,
          ip: _electrumServer.ip,
          proto: _electrumServer.proto,
          address,
        },
      }, (error, result) => {
        if (!result) {
          resolve('proxy-error');
        } else {
          if (network === 'kmd') {
            getKMDBalance(
              address,
              JSON.parse(result.content).result,
              proxyServer,
              _electrumServer,
              cache
            )
            .then((res) => {
              console.log(">> ballance result IF kmd:", res);
              resolve(res);
            });
          } else {
            const _balance = JSON.parse(result.content).result;

            console.log(">> ballance result ELSE:", _balance);

            resolve({
              balance: Number(fromSats(_balance.confirmed).toFixed(8)),
              unconfirmed: Number(fromSats(_balance.unconfirmed).toFixed(8)),
            });
          }
        }
      });
    });
  }
}

const kmdUnspents = () => {
  return async (dispatch) => {
    let _electrumServer = getLocalStorageVar('coins').kmd.server;
    _electrumServer.serverList = electrumServers.kmd.serverList;

    console.log(">>>>>>>>", network);
    console.log(">>>>>>>>", electrumServers);
    console.log(">>>>>>>>", _electrumServer);

    return new Promise((resolve, reject) => {
      listunspent(
        proxyServer,
        _electrumServer,
        electrumKeys.kmd.pub,
        'kmd',
        true,
        true,
        cache
      )
      .then((res) => {
        resolve(res);
      });
    });
  }
}

const auth = (seed, coins) => {
  return async (dispatch) => {
    return new Promise((resolve, reject) => {
      let _pubKeys = {};

      for (let key in coins) {
        let isWif = false;
        let _seedToWif;

        try {
          bs58check.decode(seed);
          isWif = true;
        } catch (e) {}

        if (isWif) {
          _seedToWif = wifToWif(seed, isKomodoCoin(key) ? electrumJSNetworks.kmd : electrumJSNetworks[key.toLowerCase()]);
        } else {
          _seedToWif = seedToWif(seed, isKomodoCoin(key) ? electrumJSNetworks.kmd : electrumJSNetworks[key.toLowerCase()], true);
        }

        electrumKeys[key] = _seedToWif;
        _pubKeys[key] = _seedToWif.pub;
      }

      resolve(_pubKeys);
    });
  }
}

const addKeyPair = (coin) => {
  console.log("---------- adding coin", coin)

  return async (dispatch) => {
    return new Promise((resolve, reject) => {

      let _wif = null;

      // [!!!] TODO: rewrite this
      _wif = window.__passphrase

      // // const _wif = electrumKeys[Object.keys(electrumKeys)[0]].priv;
      // Object.keys(electrumKeys).forEach((v, k) => {
      //   console.log("+++++++++++", coin, v, coin == v, electrumKeys[v])
      //   if(coin == v) {
      //     _wif = electrumKeys[v];
      //   }
      // });

      let _pubKeys = {};

      // THE ISSUE
      console.log("+++++ THE ISSUE 1", electrumKeys);
      console.log("+++++ THE ISSUE 2", coin, _wif);
      console.log("---------- adding coin data", _wif, electrumKeys)

      let _wifToWif = null;
      _wifToWif = seedToWif(_wif, isKomodoCoin(coin) ? electrumJSNetworks.kmd : electrumJSNetworks[coin], true);
      // _wifToWif = wifToWif(_wif, isKomodoCoin(coin) ? electrumJSNetworks.kmd : electrumJSNetworks[coin]);

      electrumKeys[coin] = _wifToWif;
      _pubKeys[coin] = _wifToWif.pub;

      console.log("+++++ THE ISSUE 3", _pubKeys);

      // console.warn(electrumKeys[coin]);
      resolve(_pubKeys[coin]);
    });
  }
};

const coinsComparator = (a, b) => {
    if (a.coin < b.coin)
        return -1;
    if (a.coin > b.coin)
        return 1;
    return 0;
};

const getOverview = (coins, baseCurrency) => {
  return async (dispatch) => {
    return new Promise((resolve, reject) => {

      let _keys = [];

      for (let key in coins) {
        _keys.push({
          pub: electrumKeys[key].pub,
          coin: key,
        });
      }

      Promise.all(_keys.map((pair, index) => {
        return new Promise((resolve, reject) => {
          const _electrumServer = getLocalStorageVar('coins')[pair.coin].server;

          HTTP.call('GET', `https://${proxyServer.ip}/api/getbalance`, {
            params: {
              port: _electrumServer.port,
              ip: _electrumServer.ip,
              proto: _electrumServer.proto,
              address: pair.pub,
            },
          }, (error, result) => {
            if (!result) {
              resolve('proxy-error');
            } else {
              
              let _balance = 0
              let server_error = false

              try {
                var result_data = JSON.parse(result.content);
                if(result_data.msg == "error" || result_data.result.code == -777) {
                  server_error = true
                } else {
                  _balance = result_data.result;
                }
                console.log("BBBBBBBBBBBBBBB overrview result item", result, result.content, _balance);
              } catch(e) {
                server_error = true
                console.log("---------------------- error getting ballance", e);
              }

              resolve({
                server_error: server_error,
                coin: pair.coin,
                pub: pair.pub,
                balance: Number(fromSats(_balance.confirmed).toFixed(8)),
                unconfirmed: Number(fromSats(_balance.unconfirmed).toFixed(8)),
              });
            }
          });
        });
      }))

      .then(promiseResult => {
        return new Promise((resolve, reject) => {

          const _pricesUrl = [
            'https://price.url',
          ];

          Promise.all(_pricesUrl.map((url, index) => {
            return new Promise((resolve, reject) => {
              HTTP.call('GET', url, {
              }, (error, result) => {
                if (!result) {
                  resolve('prices-error');
                } else {
                  const _prices = JSON.parse(result.content);
                  resolve(_prices);
                }
              });

            });
          }))
          .then(pricesResult => {
            let pricesList = pricesResult[0];
              let fiatCurrenciesLabels = getFiatCurrenciesLabels(pricesList);
              setLocalStorageVar('currencies', fiatCurrenciesLabels);

              let _overviewItems = [];
              for (let i = 0; i < promiseResult.length; i++) {

                let price = getPriceForCurrency(promiseResult[i].coin.toUpperCase(), pricesList);
                let priceForBaseCurrency = getPriceForCurrency(baseCurrency, pricesList);

                _overviewItems.push({
                  server_error: promiseResult[i].server_error,
                  coin: promiseResult[i].coin,
                  balance: promiseResult[i].balance,
                  balanceUSD: promiseResult[i].balance * price,
                  balanceBaseCurrency: promiseResult[i].balance * price / priceForBaseCurrency,
                  usdPricePerItem: price,
                  baseCurrencyPricePerItem: price / priceForBaseCurrency,
                });
              }
              resolve(_overviewItems.sort(coinsComparator));
          });

        })
      })
      .then(pricesResult => {
        resolve(pricesResult);
      });
    });
  }
}

export const convertCurrencies = (from, to, callback) => {
    let bpibberPath = "https://api.bpibber.url/bpir/convert?from=" + from;
    let bpibberPathAfter = "&to=" + to;
    let url = bpibberPath + bpibberPathAfter;
    HTTP.call('GET', url, {
    }, (error, result) => {
        if (!result) {
            callback('error')
        } else {
            callback(JSON.parse(result.content).price);
        }
    });
};

const getBtcFees = () => {
  return async (dispatch) => {
    return new Promise((resolve, reject) => {
      HTTP.call('GET', `https://www.atomicexplorer.com/api/btc/fees`, {
        params: {},
      }, (error, result) => {
        if (!result) {
          resolve('error');
        } else {
          const _btcFees = JSON.parse(result.content).result;

          devlog('btc fees');
          devlog(_btcFees);

          if (_btcFees.recommended &&
              _btcFees.recommended.fastestFee,
              _btcFees.recommended.halfHourFee,
              _btcFees.recommended.hourFee) {
            resolve(_btcFees.recommended);
          } else {
            resolve('error');
          }
        }
      });
    });
  }
}

export default {
  auth,
  getOverview,
  clearKeys,
  balance,
  transactions,
  sendtx,
  getServersList,
  setDefaultServer,
  addKeyPair,
  kmdUnspents,
  getBtcFees,
  getAnotherProxy,
}
