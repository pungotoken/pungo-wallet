import React from 'react';

import {getLocalStorageVar, showToastInfo} from '../actions/utils';
import {decryptkey} from '../actions/seedCrypt';
import translate from '../translate/translate';
import QRCode from 'qrcode.react';
import {config,} from '../actions/dev';
import {ToastContainer, ToastStore} from './../lib/react-toast';
import {isKomodoCoin} from './../lib/agama-wallet-lib/build/coin-helpers';
import electrumJSNetworks from './../lib/agama-wallet-lib/build/bitcoinjs-networks';
import {seedToWif, wifToWif,} from './../lib/agama-wallet-lib/build/keys';
import {SETTINGS_ITEM} from "./Settings";

const bs58check = require('bs58check');

class Recovery extends React.Component {
  constructor() {
    super();
    this.state = {
      coinsKeys: [],
      passphrase: config.preload ? config.preload.seed : null,
      pin: config.preload ? config.preload.pin : null,
      wrongPin: false,

      password: '',
      wrongPassword: false,
    };
    this.defaultState = JSON.parse(JSON.stringify(this.state));
    this.updateInput = this.updateInput.bind(this);
    this.decodeSeed = this.decodeSeed.bind(this);
    this.copyKey = this.copyKey.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.activeSection !== 'recovery' &&
        this.state.passphrase) {
      this.setState(this.defaultState);
    }
  }

  updateInput(e) {
    // allow only numeric values
    if(e.target.name == "pin" && e.nativeEvent.data && e.target.value.length > 0) {
      let numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
      let v = e.target.value.slice(-1)
      if(numbers.indexOf(v) < 0) {
          return;
      }
    }
    
    this.setState({
      [e.target.name]: e.target.value,
      wrongPin: false,
      wrongPassword: false,
    });
  }

  decodeSeed() {
    const _encryptedKey = getLocalStorageVar('seed');
    let settings = getLocalStorageVar(SETTINGS_ITEM);
    let cipherKey = settings.securityMethod === 'pin' ? this.state.pin : this.state.password;
    const _decryptedKey = decryptkey(cipherKey, _encryptedKey.encryptedKey);

    let coinsKeys = [];

    if (_decryptedKey) {

      // generate private keys for all coins
      let coins = getLocalStorageVar('coins');
      Object.keys(coins).forEach(function (key, i) {
        
        let isWif = false;
        let _seedToWif = null;

        try {
          bs58check.decode(_decryptedKey);
          isWif = true;
        } catch (e) {}

        if (isWif) {
          _seedToWif = wifToWif(_decryptedKey, isKomodoCoin(key) ? electrumJSNetworks.kmd : electrumJSNetworks[key.toLowerCase()]);
        } else {
          _seedToWif = seedToWif(_decryptedKey, isKomodoCoin(key) ? electrumJSNetworks.kmd : electrumJSNetworks[key.toLowerCase()], true);
        }

        coinsKeys.push({coin: key.toUpperCase(), data: _seedToWif});

        // ..

        console.log(key, _seedToWif);
      });

      // ..

      this.setState({
        coinsKeys: coinsKeys,
        wrongPin: false,
        wrongPassword: false,
        pin: null,
        passphrase: _decryptedKey,
      });

    } else {
      this.setState({
        wrongPin: true,
        wrongPassword: true,
      });
    }
  }

  handleKeyPress = e => {
      if (e.key === 'Enter') {
          this.decodeSeed()
      }
  };

  copyKey() {
    var copyText = document.getElementById("seed");
    copyText.select();
    document.execCommand("copy");
    window.getSelection().removeAllRanges();

    showToastInfo(translate('SETTINGS.COPIED_TO_CLIPBOARD'), 2000);
  }

  render() {
      let settings = getLocalStorageVar(SETTINGS_ITEM);
      let isPin = settings.securityMethod === 'pin';
      return (
      <div className="form recovery">
      { !this.state.passphrase &&
        <div>
        <div className="margin-top-45 text-center pin-label">
        { translate(isPin ? 'RECOVERY.PROVIDE_YOUR_PIN' : 'RECOVERY.PROVIDE_YOUR_PASSWORD') }
        </div>
        <div className="margin-bottom-25">
          <div className="edit">
              {isPin ?
                  <input
                      type="password"
                      onKeyDown={e => this.handleKeyPress(e)}
                      className="form-control"
                      name="pin"
                      onChange={this.updateInput}
                      placeholder={translate('LOGIN.ENTER_PIN')}
                      value={this.state.pin || ''}/>
                  :
                  <input
                      type="password"
                      className="form-control"
                      name="password"
                      onChange={this.updateInput}
                      placeholder={translate('LOGIN.ENTER_6_CHARS_PASSWORD')}
                      value={this.state.password || ''}/>
              }
          </div>
          { isPin && this.state.wrongPin &&
            <div className="error margin-top-15 sz350">
              <i className="fa fa-warning"></i> { translate('LOGIN.WRONG_PIN') }
            </div>
          }
          { !isPin && this.state.wrongPassword &&
            <div className="error margin-top-15 sz350">
              <i className="fa fa-warning"></i> { translate('LOGIN.WRONG_PASSWORD') }
            </div>
          }
        </div>
        <div className="buttons-block">
            <div disabled={isPin ? !this.state.pin : !this.state.password }
                 onClick={ this.decodeSeed }
                 className="button-center">
                <img className="button-center" src={'/images/eye_icon.svg'}/>
            </div>
        </div>
        </div>
        }
        { this.state.passphrase &&
                   <div className="margin-top-45">
                    <div className="margin-top-45 text-center pin-label">
                        {translate('RECOVERY.RECOVER_WALLET_HINT')}
                    </div>
                    <div className="textarea-wrap">
                          <textarea className="edit-field" id="seed" name="seed" style={{"height": "80px"}}
                                    onChange={this.updateInput}
                                    value={this.state.passphrase}>
                          </textarea>
                        <div className="buttons-block">
                            <img src={'/images/copy_icon.svg'} className="button-center" onClick={this.copyKey}/>
                        </div>
                    </div>     
                    <div className="text-center margin-top-30">
                                      <QRCode
                                          value={this.state.passphrase}
                                          size={180}/>
                    </div>
                   </div>
        }

        <ToastContainer store={ToastStore} position={ToastContainer.POSITION.BOTTOM_CENTER} className="toast-message" />
      </div>
    );
  }
}

export default Recovery;