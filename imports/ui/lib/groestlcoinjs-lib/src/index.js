var script = require('./script')

var templates = require('./templates')
for (var key in templates) {
  script[key] = templates[key]
}

module.exports = {
  Block: require('./block'),
  ECPair: require('./ecpair'),
  Transaction: require('./transaction'),
  TransactionBuilder: require('./transaction_builder'),

  address: require('./address'),
  bip32: require('bip32grs'),
  crypto: require('./crypto'),
  networks: require('./networks'),
  opcodes: require('bitcoin-ops'),
  payments: require('./payments'),
  templates: templates,
  script: script
}
