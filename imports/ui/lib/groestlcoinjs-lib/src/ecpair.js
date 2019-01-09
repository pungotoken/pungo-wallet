const baddress = require('./address')
const bcrypto = require('./crypto')
const ecc = require('tiny-secp256k1')
const randomBytes = require('randombytes')
const typeforce = require('typeforce')
const types = require('./types')
const wif = require('wifgrs')
const ecdsa = require('./ecdsa')
const secp256k1 = ecdsa.__curve

const NETWORKS = require('./networks')
const isOptions = typeforce.maybe(typeforce.compile({
  compressed: types.maybe(types.Boolean),
  network: types.maybe(types.Network)
}))

function ECPair (d, Q, options) {
  options = options || {}

  this.compressed = options.compressed === undefined ? true : options.compressed
  this.network = options.network || NETWORKS.bitcoin

  this.__d = d || null
  this.__Q = null
  if (Q) this.__Q = ecc.pointCompress(Q, this.compressed)
}

Object.defineProperty(ECPair.prototype, 'privateKey', {
  enumerable: false,
  get: function () { return this.__d }
})

Object.defineProperty(ECPair.prototype, 'publicKey', { get: function () {
  if (!this.__Q) this.__Q = ecc.pointFromScalar(this.__d, this.compressed)
  return this.__Q
}})

Object.defineProperty(ECPair.prototype, 'Q', {
  get: function () {
    console.log("before get Q", this.__Q, this.__d);
    if (!this.__Q && this.__d) {
      this.__Q = secp256k1.G.multiply(this.__d)
    }
    console.log("get Q", this.__Q);

    return this.__Q
  }
})

ECPair.prototype.toWIF = function () {
  if (!this.__d) throw new Error('Missing private key')
  
  console.log("GRS WIF verify:", this.network.wif, this.__d, this.__d.length, this.compressed)
  
  return wif.encode(this.network.wif, this.__d.toBuffer(32), this.compressed)
  // return wif.encode(this.network.wif, this.__d, this.compressed)
}

ECPair.prototype.sign = function (hash) {
  if (!this.__d) throw new Error('Missing private key')
  return ecc.sign(hash, this.__d)
}

ECPair.prototype.verify = function (hash, signature) {
  return ecc.verify(hash, this.publicKey, signature)
}


ECPair.prototype.getAddress = function () {
  return baddress.toBase58GrsCheck(bcrypto.hash160(this.getPublicKeyBuffer()), this.getNetwork().pubKeyHash)
}

ECPair.prototype.getNetwork = function () {
  return this.network
}

ECPair.prototype.getPublicKeyBuffer = function () {
  return this.Q.getEncoded(this.compressed)
}


function fromPrivateKey (buffer, options) {
  typeforce(types.Buffer256bit, buffer)
  if (!ecc.isPrivate(buffer)) throw new TypeError('Private key not in range [1, n)')
  typeforce(isOptions, options)

  return new ECPair(buffer, null, options)
}

function fromPublicKey (buffer, options) {
  typeforce(ecc.isPoint, buffer)
  typeforce(isOptions, options)
  return new ECPair(null, buffer, options)
}

function fromWIF (string, network) {
  const decoded = wif.decode(string)
  const version = decoded.version

  // list of networks?
  if (types.Array(network)) {
    network = network.filter(function (x) {
      return version === x.wif
    }).pop()

    if (!network) throw new Error('Unknown network version')

  // otherwise, assume a network object (or default to bitcoin)
  } else {
    network = network || NETWORKS.bitcoin

    if (version !== network.wif) throw new Error('Invalid network version')
  }

  return fromPrivateKey(decoded.privateKey, {
    compressed: decoded.compressed,
    network: network
  })
}

function makeRandom (options) {
  typeforce(isOptions, options)
  options = options || {}
  const rng = options.rng || randomBytes

  let d
  do {
    d = rng(32)
    typeforce(types.Buffer256bit, d)
  } while (!ecc.isPrivate(d))

  return fromPrivateKey(d, options)
}

module.exports = {
  ECPair,
  makeRandom,
  fromPrivateKey,
  fromPublicKey,
  fromWIF
}
