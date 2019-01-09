import React from 'react';
import jsQR from 'jsqr';
import {convertURIToImageData, getLocalStorageVar, showToastInfo,} from '../actions/utils';
import {decryptkey,} from '../actions/seedCrypt';
import translate from '../translate/translate';
import {config,} from '../actions/dev';
import {ToastContainer, ToastStore} from './../lib/react-toast';
import ProgressBar from "./ProgressBar";
import {SETTINGS_ITEM} from "./Settings";

CREATE_WALLET_PAGE = 'create_wallet';
RECOVER_WALLET_PAGE = 'recover_wallet';
LOGIN_WALLET_PAGE = 'login_wallet';

const maskChar = '⁕';
// allow only 1,2,3,4,5,6,7,8,9,0 and ⁕ special character
const numbersOnlyRegExp = /^[0-9⁕]/;

class Login extends React.Component {
  constructor() {
    super();
    this.state = {
      passphrase: config.preload ? config.preload.seed : null,
      createPin: false,
      pinOverride: config.preload ? config.preload.pin : null,
      pinOverrideTooShort: false,
      pin: config.preload ? config.preload.pin : '',
      hidden_pin: '',
      wrongPin: false,
      qrScanError: false,
      show_actions_block: false,
      page: LOGIN_WALLET_PAGE,
      showLoadingSpinner: false,
      password: '',
      wrongPassword: false,
      passwordTooShort: false,
    };
    this.defaultState = JSON.parse(JSON.stringify(this.state));
    this.updateInput = this.updateInput.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
    this.triggerKey = this.triggerKey.bind(this);
    this.login = this.login.bind(this);
    this.toggleCreatePin = this.toggleCreatePin.bind(this);
    this.scanQR = this.scanQR.bind(this);
  }

  updateInput(e) {
    let newValue = e.target.value;
    let currentPin = this.state.pin;
    let lastNumber = newValue.slice(-1);
    if (!numbersOnlyRegExp.test(lastNumber)) {
        if (newValue.length !== 0) {
            return;
        }
    }
    // new value looks like this: ***4, so we need to ge only the last number
    let add = currentPin + newValue.slice(-1);
    let remove = currentPin.slice(0, -1);

    // allow only numeric values
    if(e.nativeEvent.data && e.target.value.length > 0) {
      let numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
      let v = newValue.slice(-1);
      if(numbers.indexOf(v) < 0) {
        return;
      }
    }

    let changedValue = newValue.length < currentPin.length ? remove : add;
    // replace the actual pin with the hidden one: 12345 -> ⁕⁕⁕⁕⁕
    let hiddenValue = newValue.split('').map(() => (maskChar)).join('');
    this.setState({
      pin: changedValue,
      hidden_pin: hiddenValue,
      wrongPin: false,
      qrScanError: false,
      pinOverrideTooShort: false,
    });
  }

  updatePassword(e) {
    let newValue = e.target.value;

    this.setState({
      password: newValue,
      wrongPin: false,
      passwordTooShort: false,
    });
  }

  scanQR() {
    MeteorCamera.getPicture({
      quality: 100,
    }, (error, data) => {
      if (error) {
        this.setState({
          qrScanError: true,
        });
        setTimeout(() => {
          this.setState({
            qrScanError: false,
          });
        }, 5000);
      } else {
        convertURIToImageData(data)
        .then((imageData) => {
          const decodedQR = jsQR.decodeQRFromImage(
            imageData.data,
            imageData.width,
            imageData.height
          );

          if (!decodedQR) {
            this.setState({
              qrScanError: true,
            });

            setTimeout(() => {
              this.setState({
                qrScanError: false,
              });
            }, 5000);
          } else {
            this.setState({
              qrScanError: false,
              passphrase: decodedQR,
            });
          }
        });
      }
    });
  }

  login(isPinAccess) {
    if (isPinAccess) {
      // decrypt
      const _encryptedKey = getLocalStorageVar('seed');

      if (_encryptedKey &&
          _encryptedKey.encryptedKey &&
          this.state.pin &&
          this.state.pin.length >= 6) {
        const _decryptedKey = decryptkey(this.state.pin, _encryptedKey.encryptedKey);

        if (_decryptedKey) {
          this.props.loginAfterSelectCoin(_decryptedKey);
          this.setState(this.defaultState);
        } else {
          this.setState({
            pinOverrideTooShort: false,
            wrongPin: true,
          });
          showToastInfo(translate('LOGIN.WRONG_PIN'), 2000)
        }
      } else {
        this.setState({
          pinOverrideTooShort: false,
          wrongPin: true,
        });
        showToastInfo(translate('LOGIN.WRONG_PIN'), 2000)
      }
    } else {
        // decrypt
        const _encryptedKey = getLocalStorageVar('seed');

        if (_encryptedKey &&
            _encryptedKey.encryptedKey &&
            this.state.password &&
            this.state.password.length >= 6) {
            const _decryptedKey = decryptkey(this.state.password, _encryptedKey.encryptedKey);

            if (_decryptedKey) {
                this.props.loginAfterSelectCoin(_decryptedKey);
                this.setState(this.defaultState);
            } else {
                this.setState({
                    passwordTooShort: false,
                    wrongPassword: true,
                });
                showToastInfo(translate('LOGIN.WRONG_PASSWORD'), 2000)
            }
        } else {
            this.setState({
                passwordTooShort: false,
                wrongPassword: true,
            });
            showToastInfo(translate('LOGIN.WRONG_PASSWORD'), 2000)
        }
    }
    this.setState({showLoadingSpinner: false})
  }

  toggleCreatePin() {
    this.setState({
      createPin: !this.state.createPin,
    });
  }

  triggerKey(key) {
    if (key === 'back') {
      this.setState({
        pin: this.state.pin.slice(0, -1),
        wrongPin: false,
      });
    } else if (key === 'remove') {
      this.setState({
        pin: '',
        wrongPin: false,
      });
    } else {
      this.setState({
        pin: this.state.pin + key,
        wrongPin: false,
      });
    }
  }

  componentDidMount() {
      this.inputPin && this.inputPin.focus();
      this.inputPassword && this.inputPassword.focus();
  }

  handleKeyPress = e => {
    if (e.key === 'Enter') {
        this.setState({showLoadingSpinner: true})
    }
  };

    closePopUp = () => {
        this.setState({show_actions_block: false, page: ''})
    };

    goToDesiredScreen = () => {
        this.closePopUp();
        let current_page = this.state.page;
        if (current_page === CREATE_WALLET_PAGE) {
            this.props.goToCreateSeedPage()
        } else if (current_page === RECOVER_WALLET_PAGE) {
            this.props.goToCreateRecoverSeedPage()
        }
    };

    showActionsBlock = (page) => {
        const _encryptedKey = getLocalStorageVar('seed');
        if (_encryptedKey) {
            this.setState({show_actions_block: true, page: page});
        } else {
            this.setState({page: page}, () => {
                this.goToDesiredScreen();
            });
        }
    };

    renderActionsBlock = () => {
        let settings = getLocalStorageVar(SETTINGS_ITEM);
        let isPin = settings && settings.securityMethod === 'pin';

        switch (this.state.page) {
            case CREATE_WALLET_PAGE:
            case RECOVER_WALLET_PAGE: {
                return(this.renderWalletBlock())
            }
            default: {
                return(
                    <div className="splash-actions-container">
                        <p className="login-label">{translate(isPin ? 'LOGIN.LOGIN_WITH_PIN_HINT' : 'LOGIN.LOGIN_WITH_PASSWORD_HINT')}</p>
                        {isPin ?
                            <div className="input-wrap">
                                <input
                                    ref={(input) => {this.inputPin = input;}}
                                    type="tel"
                                    className="form-input"
                                    name="pin"
                                    onKeyDown={e => this.handleKeyPress(e)}
                                    onChange={this.updateInput}
                                    placeholder="_____________________"
                                    value={this.state.hidden_pin}
                                />
                            </div>
                            : <div className="input-wrap">
                                <input
                                    ref={(input) => {this.inputPassword = input;}}
                                    type="password"
                                    className="form-input"
                                    name="pass"
                                    onKeyDown={e => this.handleKeyPress(e)}
                                    onChange={this.updatePassword}
                                    placeholder="_____________________"
                                    value={this.state.password}
                                />
                            </div>
                        }
                        <div className="buttons-block">
                            <img className="button-center" src="/images/splash_next_icon.svg" onClick={() => {
                                this.setState({showLoadingSpinner: true})
                            }}/>
                        </div>
                    </div>
                );

            }
        }
    };

    renderWalletBlock = () => {
        const {page, show_actions_block} = this.state;
        const {goToCreateSeedPage, goToCreateRecoverSeedPage} = this.props;
        if (!show_actions_block) {
            return null;
        }
        let text = translate(page === CREATE_WALLET_PAGE ? 'LOGIN.WARNING_CREATE_WALLET_MSG' : 'LOGIN.WARNING_RECOVER_WALLET_MSG');
        let action = page === CREATE_WALLET_PAGE ? () => goToCreateSeedPage() : () => goToCreateRecoverSeedPage();
        return (
            <div className="splash-actions-container">
                <div className="splash-text-label">{text}</div>
                <div className="splash-warning-label">{translate('LOGIN.WARNING_MSG')}</div>
                <div className="splash-warning-label">{translate('LOGIN.WARNING_WIPE_DATA_MSG')}</div>

                <div className="buttons-block">
                    <img className="button-center" src="/images/splash_next_icon.svg" onClick={() => action()}/>
                </div>
            </div>
        )
    };

    componentDidUpdate(prevProps, prevState) {
        if ((this.state.showLoadingSpinner !== prevState.showLoadingSpinner) && this.state.showLoadingSpinner) {
            let settings = getLocalStorageVar(SETTINGS_ITEM);
            let isPin = settings && settings.securityMethod === 'pin';
            setTimeout(() => this.login(isPin), 1000);
        }
    }

    render() {
        const {page} = this.state;
        if (this.props.activeSection === 'login') {
            return (
                <div className="container">
                    {this.state.showLoadingSpinner ? <ProgressBar/> : null}
                    <img className="img_wrap" src={`/images/splash_logo.svg`}/>

                    <div className="buttons-block">
                        <img className="button-left"
                             src={page === LOGIN_WALLET_PAGE ? "/images/splash_wallet_icon_black.svg" : "/images/splash_wallet_icon.svg"}
                             onClick={() => this.showActionsBlock(LOGIN_WALLET_PAGE)}/>
                        <img className="button-center"
                             src={page === RECOVER_WALLET_PAGE ? "/images/splash_recover_icon_black.svg" : "/images/splash_recover_icon.svg"}
                             onClick={() => this.showActionsBlock(RECOVER_WALLET_PAGE)}/>
                        <img className="button-right"
                             src={page === CREATE_WALLET_PAGE ? "/images/splash_new_wallet_icon_black.svg" : "/images/splash_new_wallet_icon.svg"}
                             onClick={() => this.showActionsBlock(CREATE_WALLET_PAGE)}/>
                    </div>
                    {this.renderActionsBlock()}

                    <ToastContainer store={ToastStore} position={ToastContainer.POSITION.BOTTOM_CENTER}
                                    className="toast-message"/>
                </div>
            );
        } else {
            return null;
        }
    }
}

export default Login;