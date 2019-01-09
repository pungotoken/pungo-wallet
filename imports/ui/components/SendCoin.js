import React from 'react';
import translate from '../translate/translate';
import {convertURIToImageData, formatBalanceValue, getLocalStorageVar, showToastInfo,} from '../actions/utils';
import {decryptkey} from '../actions/seedCrypt';
import jsQR from 'jsqr';
import {config, devlog,} from '../actions/dev';
import {fromSats, isNumber, toSats,} from './../lib/agama-wallet-lib/build/utils';
import {explorerList, isKomodoCoin,} from './../lib/agama-wallet-lib/build/coin-helpers';
import {addressVersionCheck} from './../lib/agama-wallet-lib/build/keys';
import electrumServers from './../conf/electrum-servers';

import electrumJSNetworks from './../lib/agama-wallet-lib/build/bitcoinjs-networks';
import {convertCurrencies} from "../actions/actions";

import {ToastContainer, ToastStore} from './../lib/react-toast';
import {SETTINGS_ITEM} from "./Settings";

const maskChar = '⁕';
// allow only 1,2,3,4,5,6,7,8,9,0 and ⁕ special character
const numbersOnlyRegExp = /^[0-9⁕]/;

class SendCoin extends React.Component {
    constructor() {
        super();
        let settings = getLocalStorageVar(SETTINGS_ITEM);

        this.state = {
            sendAmount: config.preload ? config.preload.send.amount : 0,
            convertAmount: 0,
            sendTo: config.preload ? config.preload.send.address : '',
            sendCurrentStep: 0,
            sendResult: {},
            spvVerificationWarning: false,
            spvPreflightSendInProgress: false,
            spvPreflightResult: null,
            validNan: false,
            validTooMuch: false,
            validIncorrectAddress: false,
            qrScanError: false,
            wrongPin: false,
            pin: config.preload ? config.preload.pin : '',
            hidden_pin: '',
            processing: false,
            btcFee: 'halfHourFee',
            fee: null,
            price: '0.00',

            passwordValue: '',
            wrongPasswordValue: false,
            passwordValueTooShort: false,
            securityMethod: settings ? settings.securityMethod : 'pin'
        };
        this.defaultState = JSON.parse(JSON.stringify(this.state));
        this.changeSendCoinStep = this.changeSendCoinStep.bind(this);
        this.updateInput = this.updateInput.bind(this);
        this.updatePinInput = this.updatePinInput.bind(this);
        this.updatePasswordInput = this.updatePasswordInput.bind(this);
        this.updateSendAmountInput = this.updateSendAmountInput.bind(this);
        this.updateConvertInput = this.updateConvertInput.bind(this);
        this.scanQR = this.scanQR.bind(this);
        this.validate = this.validate.bind(this);
        this.decodeSeed = this.decodeSeed.bind(this);
        this.openExternalURL = this.openExternalURL.bind(this);
        this.goToDashboard = this.goToDashboard.bind(this);
        this.setMaxAmount = this.setMaxAmount.bind(this);

        this.txSendResultDate = this.txSendResultDate.bind(this);
    }

    txSendResultDate() {
        // secondsToString(this.state.sendResult.result.timestamp).toUpperCase()
        return "just now";
    }

    goToDashboard() {
        this.props.goToDashboard();
    }

    renderTxID() {
        const _txid1 = this.state.sendResult.result.txid.substr(0, 31);
        const _txid2 = this.state.sendResult.result.txid.substr(31, 64);

        return (
            <div>
                <div>{_txid1}</div>
                <div>{_txid2}</div>
            </div>
        );
    }

    decodeSeed() {
        const _encryptedKey = getLocalStorageVar('seed');
        if (this.state.securityMethod === 'pin') {
            const _decryptedKey = decryptkey(this.state.pin, _encryptedKey.encryptedKey);

            if (_decryptedKey) {
                this.setState({
                    wrongPin: false,
                });

                return true;
            } else {
                this.setState({
                    wrongPin: true,
                });

                return false;
            }

        } else {
            const _decryptedKey = decryptkey(this.state.passwordValue, _encryptedKey.encryptedKey);
            if (_decryptedKey) {
                this.setState({
                    wrongPasswordValue: false,
                });

                return true;
            } else {
                this.setState({
                    wrongPasswordValue: true,
                });

                return false;
            }
        }
    }

    openExternalURL(url) {
        window.open(url, '_system');
    }

    scanQR() {
        const width = 480;
        const height = 640;

        MeteorCamera.getPicture({quality: 100}, (error, data) => {
            if (error) {
                devlog(error);

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
                        devlog(imageData.data);
                        devlog(imageData.height);
                        devlog(imageData.width);

                        const decodedQR = jsQR.decodeQRFromImage(
                            imageData.data,
                            imageData.width,
                            imageData.height
                        );

                        devlog(decodedQR);

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
                                sendTo: decodedQR,
                            });
                        }
                    });
            }
        });
    }

    componentWillReceiveProps(props) {
        if (props &&
            (props.activeSection !== 'send' || this.props.coin !== props.coin)) {
            // reset form state
            this.setState(this.defaultState);
        }
    }

    componentDidMount() {
        const {coin, baseCurrency} = this.props;
        convertCurrencies(coin, baseCurrency, price => {
            this.setState({price: price});
        });
    }

    updateConvertInput(e) {
        const {price} = this.state;
        let convertedValue = formatBalanceValue(this.convertCurrency(e.target.name, price, e.target.value));
        let convertAmount = this.state.convertAmount;
        let value = e.target.value;
        if (!value && convertAmount.length > 1) {
            if (convertAmount.startsWith('.')) {
                this.setState({
                    [e.target.name]: 0,
                    sendAmount: 0
                })
            }
        } else if (!value && convertAmount.length === 1) {
            this.setState({
                [e.target.name]: 0,
                sendAmount: 0
            })
        } else {
            this.setState({
                [e.target.name]: value,
                sendAmount: convertedValue
            })
        }
    }

    convertCurrency = (convertType, price, value) => {
        switch (convertType) {
            case 'sendAmount': {
                return price * value;
            }
            case 'convertAmount': {
                return value / price;
            }
            default:
                return value
        }
    };

    updateInput(e) {
        this.setState({
            [e.target.name]: e.target.value,
            spvVerificationWarning: false,
            spvPreflightSendInProgress: false,
            validNan: false,
            validTooMuch: false,
            validIncorrectAddress: false,
            qrScanError: false,
            wrongPin: false,
            wrongPasswordValue: false,
            wrongAddress: false,
            fee: null,
        });
    }

    updatePinInput(e) {
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

        let changedValue = newValue.length < currentPin.length ? remove : add;
        // replace the actual pin with the hidden one: 12345 -> ⁕⁕⁕⁕⁕
        let hiddenValue = newValue.split('').map(() => (maskChar)).join('');
        this.setState({
            pin: changedValue,
            hidden_pin: hiddenValue,
            wrongPin: false,
            qrScanError: false,
        });
    }

    updatePasswordInput(e) {
        this.setState({
            passwordValue: e.target.value,
            passwordValueTooShort: false,
            wrongPasswordValue: false
        });
    }

    updateSendAmountInput(e) {
        const {price} = this.state;
        let convertedValue = formatBalanceValue(this.convertCurrency(e.target.name, price, e.target.value));
        let sendAmount = this.state.sendAmount;
        let value = e.target.value;

        if (!value && sendAmount.length > 1) {
            if (sendAmount.startsWith('.')) {
                this.setState({
                    [e.target.name]: 0,
                    convertAmount: 0
                })
            }
        } else if (!value && sendAmount.length === 1) {
            this.setState({
                [e.target.name]: 0,
                convertAmount: 0
            })
        } else {
            this.setState({
                [e.target.name]: value,
                convertAmount: convertedValue
            })
        }

        this.setState({
            spvVerificationWarning: false,
            spvPreflightSendInProgress: false,
            validNan: false,
            validTooMuch: false,
            validIncorrectAddress: false,
            qrScanError: false,
            wrongPin: false,
            wrongPasswordValue: false,
            wrongAddress: false,
            fee: null,
        });
    }

    validate() {
        let _isFailed = false;
        let validTooMuch = false;
        let validIncorrectAddress = false;
        let validNan = false;

        if (this.state.sendAmount > this.props.balance.balance) {
            validTooMuch = true;
            _isFailed = true;
        }

        if (!addressVersionCheck(electrumJSNetworks[isKomodoCoin(this.props.coin) ? 'kmd' : this.props.coin], this.state.sendTo) ||
            addressVersionCheck(electrumJSNetworks[isKomodoCoin(this.props.coin) ? 'kmd' : this.props.coin], this.state.sendTo) === 'Invalid pub address') {
            validIncorrectAddress = true;
            _isFailed = true;
        }

        if (!isNumber(this.state.sendAmount)) {
            validNan = true;
            _isFailed = true;
        }

        if (this.state.sendCurrentStep === 1 &&
            ((getLocalStorageVar('settings') && getLocalStorageVar('settings').requirePin) ||
                (config.preload && config.enablePinConfirm)) &&
            !this.decodeSeed()) {
            _isFailed = true;
        }

        this.setState({
            validTooMuch,
            validIncorrectAddress,
            validNan,
        });

        return _isFailed;
    }

    changeSendCoinStep(step, back) {
        if (step === 0 &&
            this.props.coin === 'btc') {
            this.props.getBtcFees();
            this.setState({
                btcFee: 'halfHourFee',
            });
        }

        if (back) {
            this.setState({
                sendCurrentStep: step,
                validIncorrectAddress: false,
                validTooMuch: false,
                validNan: false,
                pin: '',
                wrongPin: false,
                wrongPasswordValue: false,
                fee: null,
            });
        } else {
            if (!this.validate()) {
                switch (step) {
                    case 0:
                        this.setState(this.defaultState);
                        break;
                    case 1:
                        this.setState({
                            spvPreflightSendInProgress: true,
                            currentStep: step,
                        }, this.props.toggleProgressBar(true));

                        // spv pre tx push request
                        this.props.sendtx(
                            this.props.coin,
                            this.state.sendTo,
                            Math.abs(toSats(this.state.sendAmount)),
                            true,
                            false,
                            this.props.coin === 'btc' ? this.props.btcFees[this.state.btcFee] : null
                        )
                            .then((sendPreflight) => {

                                console.log("::::::::::::::::::::::::::::::::::::::::::::::::::::");
                                console.log("::::::::::::::::::::::::::::::::::::::::::::::::::::");
                                console.log(":::::::::::::::::::::::::::::::::::::::::::::::::::: TX PREFLIGHT", sendPreflight);

                                if (sendPreflight &&
                                    sendPreflight.msg === 'success') {
                                    this.setState({
                                        spvVerificationWarning: !sendPreflight.result.utxoVerified,
                                        spvPreflightSendInProgress: false,
                                        spvPreflightResult: sendPreflight,
                                    }, this.props.toggleProgressBar(false));
                                } else {
                                    this.setState({
                                        spvPreflightSendInProgress: false,
                                        spvPreflightResult: sendPreflight,
                                    }, this.props.toggleProgressBar(false));
                                }
                            });

                        this.setState({
                            sendCurrentStep: 1,
                        });
                        break;
                    case 2:
                        this.setState({
                            sendCurrentStep: 2,
                            processing: true,
                        }, this.props.toggleProgressBar(true));

                        this.props.sendtx(
                            this.props.coin,
                            this.state.sendTo,
                            Math.abs(toSats(this.state.sendAmount)),
                            null,
                            true,
                            this.props.coin === 'btc' ? this.props.btcFees[this.state.btcFee] : null
                        )
                            .then((res) => {
                                devlog('sendtx result');
                                devlog(res);

                                this.setState({
                                    sendResult: res,
                                    processing: false,
                                }, this.props.toggleProgressBar(false));
                            });
                        break;
                }
            }
        }
    }

    setMaxAmount = props => {
        let currentWallet = this.getCurrentWallet(props.overview, props.coin);

        let coin = this.props.coin;
        let fee = 0;
        let __this = this;
        
        if(coin === 'btc') {

            this.props.sendtx(
                this.props.coin,
                this.state.sendTo,
                Math.abs(toSats(0)),
                true,
                false,
                this.props.coin === 'btc' ? this.props.btcFees[this.state.btcFee] : null
            )
            .then((sendPreflight) => {
                console.log("sendPreflight: >>>>>>>>>>>", sendPreflight);
                console.log("sendPreflight: >>>>>>>>>>>", sendPreflight.result.change, sendPreflight.result.fee);

                fee = sendPreflight.result.fee;
                let feeUnit = fromSats(fee)

                console.log("---- current active fee", fee, feeUnit);
        
                let maxAmount = currentWallet.balance;

                let formattedAmount = formatBalanceValue(maxAmount - feeUnit);
                __this.setState({sendAmount: formattedAmount,
                    convertAmount: __this.convertCurrency('sendAmount', __this.state.price, maxAmount - feeUnit)})
                
                if(sendPreflight.result.change <= 0) {
                    showToastInfo(translate('SEND.COINS_AMOUNT_INFO_MSG'));
                }

            });

            // fee = this.props.btcFees[this.state.btcFee];
            // window.BTCFeeLock = fee
            
            // statically count an avarage 2250 bytes Tx
            
            // fee = sendPreflight.result.fee
            // fee = fee * 250

            // ..

        } else {
            fee = (isKomodoCoin(coin) ? electrumServers.kmd.txfee : electrumServers[coin].txfee);

            let feeUnit = fromSats(fee)

            console.log("---- current active fee", fee, feeUnit);
    
            let maxAmount = currentWallet.balance;
            let formattedAmount = formatBalanceValue(maxAmount - feeUnit);
            this.setState({sendAmount: formattedAmount,
                convertAmount: formatBalanceValue(this.convertCurrency('sendAmount', this.state.price, maxAmount - feeUnit))})

        }
    };

    getCurrentWallet = (overview, coin) => {
        return overview && overview.find(item => item.coin === coin)
    };

    sendFormRender() {
        const {baseCurrency} = this.props;
        const {sendAmount, convertAmount} = this.state;

        let baseCurrencyLabel = baseCurrency ? baseCurrency : '';
        let currentCoinLabel = this.props.coin.toUpperCase();

        let isSendAmountExists = sendAmount && (sendAmount !== 0 || sendAmount !== '');
        let isConvertAmountExists = convertAmount && (convertAmount !== 0 || convertAmount !== '');
        return (
            <React.Fragment>
                <div className="margin-top-40">
                    <div className="receiver-details">
                        <input type="text" className="form-control" name="sendTo" onChange={this.updateInput} value={this.state.sendTo} id="kmdWalletSendTo" placeholder={translate('SEND.ENTER_AN_ADDRESS')}
                               autoComplete="off" required/>
                    </div>
                    {this.state.validIncorrectAddress &&
                    <div className="error">
                        <i className="fa fa-warning"></i> {translate('SEND.ADDRESS_IS_INCORECT')}
                    </div>
                    }
                    {this.state.qrScanError &&
                    <div className="error">
                        <i className="fa fa-warning"></i> {translate('SEND.QR_SCAN_ERR')}
                    </div>
                    }
                </div>

                <div className="margin-top-40">
                    <div className="transaction-amount">
                        <div className="converter-wrapper">
                            <input type="number"
                                   className="form-control"
                                   name="sendAmount"
                                   value={this.state.sendAmount ? this.state.sendAmount : ''}
                                   onChange={this.updateSendAmountInput}
                                   id="kmdWalletAmount"
                                   placeholder={'0.00 ' + currentCoinLabel}
                                   autoComplete="off"/>
                            {isSendAmountExists ? <span className="current-coin-label">{currentCoinLabel}</span> : null}
                            <input type="number"
                                   className="form-control-usd"
                                   name="convertAmount"
                                   value={this.state.convertAmount ? this.state.convertAmount : ''}
                                   onChange={this.updateConvertInput}
                                   placeholder={'0.00 ' + baseCurrencyLabel} autoComplete="off"/>
                            {isConvertAmountExists ? <span className="base-coin-label">{baseCurrencyLabel}</span> : null}
                        </div>
                    </div>
                    {this.state.validNan &&
                    <div className="error">
                        <i className="fa fa-warning"></i> {translate('SEND.NAN')}
                    </div>
                    }
                    {this.state.validTooMuch &&
                    <div className="error">
                        <i className="fa fa-warning"></i> {translate('SEND.TOO_MUCH', `${this.props.balance.balance} ${this.props.coin.toUpperCase()}`)}
                    </div>
                    }
                </div>

                {this.props.coin === 'btc' &&
                this.props.btcFees &&
                this.props.btcFee !== 'error' &&
                <div className="margin-top-20">
                    <div className="btc-transaction-fee">
                        <select
                            className="fee-select"
                            name="btcFee"
                            id="btcTransactionFee"
                            value={this.state.btcFee}
                            onChange={(event) => this.updateInput(event)}>
                            <option value="fastestFee">{translate('SEND.BTC_FEE_FAST')}</option>
                            <option value="halfHourFee">{translate('SEND.BTC_FEE_AVG')}</option>
                            <option value="hourFee">{translate('SEND.BTC_FEE_SLOW')}</option>
                        </select>
                    </div>
                </div>
                }
                {this.props.coin === 'btc' &&
                !this.props.btcFees &&
                <div className="margin-top-40 text-center">{translate('SEND.BTC_FEES_FETCHING')}</div>
                }
                {this.props.coin === 'btc' &&
                this.props.btcFees &&
                this.props.btcFees === 'error' &&
                <div className="error">{translate('SEND.BTC_FEES_FETCHING_FAILED')}</div>
                }

                <div className="buttons-block">
                    <img src={'/images/scan_qr_icon.svg'} className="button-center" onClick={this.scanQR}/>
                    <img className="button-center" src={'/images/all_icon.svg'} onClick={() => this.setMaxAmount(this.props)}/>
                    <div disabled={
                        !this.state.sendTo ||
                        !this.state.sendAmount ||
                        (this.props.coin === 'btc' && (!this.props.btcFees || this.props.btcFees === 'error'))
                    }
                         onClick={() => this.changeSendCoinStep(1)}
                         className="button-center">
                        <img className="button-center" style={{marginTop: 4}} src={'/images/forward_button.svg'}/>
                    </div>
                </div>
            </React.Fragment>
        );
    }

    render() {
        let settings = getLocalStorageVar(SETTINGS_ITEM);

        if (this.props.activeSection === 'send') {
            return (
                <div className="send-ui">
                    <div className="steps-container">
                        <img src={`/images/template/transactions/progress${this.state.sendCurrentStep + 1}_icon.svg`}/>
                    </div>
                    <div className="form send">
                        <div className={'send-step' + (this.state.sendCurrentStep === 0 ? '' : ' hide')}>
                            <div className="send-step1">
                                {this.sendFormRender()}
                            </div>
                        </div>
                        <div className={'send-step' + (this.state.sendCurrentStep === 1 ? '' : ' hide')}>
                            <div className="send-step2">
                                <div className="section-label margin-top-40">{translate('SEND.TO')}</div>
                                <div className="receiver-address margin-bottom-25">
                                    {this.state.sendTo}
                                </div>
                                {this.state.spvPreflightResult &&
                                this.state.spvPreflightResult.msg === 'success' &&
                                <div className="transaction-total margin-bottom-80">
                                    <strong>{formatBalanceValue(
                                        fromSats(this.state.spvPreflightResult.result.value)
                                        + fromSats(this.state.spvPreflightResult.result.fee))} </strong> {this.props.coin.toUpperCase()}
                                </div>}
                                <div className="section-label margin-top-40">{translate('SEND.AMOUNT')}</div>
                                <div className="send-amount margin-bottom-25">
                                    <strong>{formatBalanceValue(this.state.sendAmount)} </strong> {this.props.coin.toUpperCase()}
                                </div>
                                {this.state.spvPreflightResult &&
                                this.state.spvPreflightResult.msg === 'success' &&
                                <div>
                                    <div className="section-label">{translate('SEND.FEE')}</div>
                                    <div className="transaction-fee margin-bottom-25">
                                        <strong> {this.state.spvPreflightResult.result.fee} ({formatBalanceValue(fromSats(this.state.spvPreflightResult.result.fee))}) </strong> {this.props.coin.toUpperCase()}
                                    </div>
                                </div>}
                                {settings && settings.requirePin && this.state.securityMethod === 'pin' &&
                                <div className="pin-confirm">
                                    <input
                                        type="tel"
                                        className="form-control"
                                        name="pin"
                                        value={this.state.hidden_pin}
                                        onChange={this.updatePinInput}
                                        placeholder={translate('SEND.ENTER_YOUR_PIN')}
                                        autoComplete="off"/>
                                    {this.state.wrongPin &&
                                    <div className="error">
                                        <i className="fa fa-warning"></i> {translate('LOGIN.WRONG_PIN')}
                                    </div>
                                    }
                                </div>}
                                {settings && settings.requirePin && this.state.securityMethod === 'pass' &&
                                <div className="pin-confirm">
                                    <input
                                        type="password"
                                        className="form-control"
                                        name="password"
                                        value={this.state.passwordValue}
                                        onChange={this.updatePasswordInput}
                                        placeholder={translate('SEND.ENTER_YOUR_PASSWORD')}
                                        autoComplete="off"/>
                                    {this.state.wrongPasswordValue &&
                                    <div className="error">
                                        <i className="fa fa-warning"></i> {translate('LOGIN.WRONG_PASSWORD')}
                                    </div>
                                    }
                                </div>}

                                {this.state.spvPreflightSendInProgress &&
                                <div className="padding-top-20 fs14 text-center">{translate('SEND.SPV_VERIFYING')}...</div>
                                }
                                {/*this.state.spvVerificationWarning &&
                                <div className="padding-top-20 fs14 lh25">
                                    <i className="fa fa-warning warning"></i> <strong className="warning">{translate('SEND.WARNING')}:</strong> {translate('SEND.WARNING_SPV_P1')}<br/>
                                    {translate('SEND.WARNING_SPV_P2')}
                                </div>
                                */}
                                <div className="buttons-block">
                                    <img className="button-center" src={'/images/back_button.svg'} onClick={() => this.changeSendCoinStep(0, true)}/>
                                    <div disabled={this.state.spvPreflightSendInProgress} onClick={() => {this.props.toggleProgressBar(true); this.changeSendCoinStep(2)}} className="button-center">
                                        <img className="button-center" style={{marginTop: 4}} src={'/images/send_red_icon.svg'}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={'send-step' + (this.state.sendCurrentStep === 2 ? '' : ' hide')}>
                            <div className="send-step3">
                                <div className="send-result">
                                    <div className="section-label margin-top-40">{translate('SEND.TO')}</div>
                                    <div className="receiver-address margin-bottom-25">
                                        {this.state.sendTo}
                                    </div>
                                    {this.state.spvPreflightResult &&
                                    this.state.spvPreflightResult.msg === 'success' &&
                                    <div className="margin-bottom-40">
                                        <div className="transaction-total">
                                            <strong>{formatBalanceValue(
                                                fromSats(this.state.spvPreflightResult.result.value)
                                                + fromSats(this.state.spvPreflightResult.result.fee))} </strong> {this.props.coin.toUpperCase()}
                                        </div>
                                        {/*{this.state.spvPreflightResult.result.fee > 0 ?
                                            <div className="send-amount">
                                            <strong>{formatBalanceValue(this.state.sendAmount)} </strong> {this.props.coin.toUpperCase()}
                                        </div> : null}*/}
                                        {this.state.spvPreflightResult.result.fee > 0 ?
                                            <div className="transaction-fee margin-bottom-25">
                                                <strong>{formatBalanceValue(fromSats(this.state.spvPreflightResult.result.fee))} </strong> {this.props.coin.toUpperCase()}
                                            </div> : null}
                                    </div>}

                                    {this.state.sendResult &&
                                    this.state.sendResult.result &&
                                    this.state.sendResult.result.txid &&
                                    <div className="transactions-list">
                                        <div className="section-label success">{translate('SEND.SUCCESS')}</div>
                                        <div onClick={() => this.openExternalURL(`${explorerList[this.props.coin.toUpperCase()]}/tx/${this.state.sendResult.result.txid}`)}
                                            className="item sent">
                                            <div className="direction">
                                                <div className="transaction-direction">
                                                    <img className="transaction-arrow" src="/images/template/transactions/out_icon.svg"/>
                                                    {translate('TRANSACTIONS.OUT').toUpperCase()}
                                                </div>
                                            </div>
                                            <div className="date">{this.txSendResultDate()}</div>
                                            <div className="amount-native">{formatBalanceValue(this.state.sendAmount)}</div>
                                            <div className="right-arrow">
                                                <img src="/images/template/transactions/rightarrow_icon.svg"/>
                                            </div>
                                        </div>
                                    </div>
                                    }
                                    {/*<div className="edit success">*/}
                                    {/*{translate('SEND.SUCCESS')} <i className="fa fa-check"></i>*/}
                                    {/*</div>*/}
                                    {/*<div className="edit">*/}
                                    {/*{translate('SEND.FROM')}*/}
                                    {/*<div className="shade margin-top-5">{this.props.address}</div>*/}
                                    {/*</div>*/}
                                    {/*<div className="edit">*/}
                                    {/*{translate('SEND.TO')}*/}
                                    {/*<div className="shade margin-top-5">{this.state.sendTo}</div>*/}
                                    {/*</div>*/}
                                    {/*<div className="edit">*/}
                                    {/*{translate('SEND.AMOUNT')}*/}
                                    {/*<div className="shade margin-top-5">{this.state.sendAmount} {this.props.coin.toUpperCase()}</div>*/}
                                    {/*</div>*/}
                                    {/*<div className="edit">*/}
                                    {/*{translate('SEND.TXID')}*/}
                                    {/*<div*/}
                                    {/*className="shade margin-top-5">{this.state.sendResult && this.state.sendResult.result && this.state.sendResult.result.txid ? this.renderTxID() : translate('SEND.PROCESSING_SM')}</div>*/}
                                    {/*</div>*/}
                                    {/*{this.state.sendResult &&*/}
                                    {/*this.state.sendResult.result &&*/}
                                    {/*this.state.sendResult.result.txid &&*/}
                                    {/*<div className="edit">*/}
                                    {/*<span onClick={() => this.openExternalURL(`${explorerList[this.props.coin.toUpperCase()]}/tx/${this.state.sendResult.result.txid}`)}>*/}
                                    {/*{translate('SEND.OPEN_IN_EXPLORER')}<i className="fa fa-external-link margin-left-10"></i>*/}
                                    {/*</span>*/}
                                    {/*</div>*/}
                                    {/*}*/}
                                </div>

                                {(!this.state.sendResult || this.state.processing) &&
                                <div className="send-result">
                                    {translate('SEND.PROCESSING_TX')}
                                </div>
                                }
                                {this.state.sendResult &&
                                this.state.sendResult.msg &&
                                this.state.sendResult.msg === 'error' &&
                                <div className="send-result">
                                    <div className="error">
                                        {translate('SEND.ERROR')} <i className="fa fa-close"></i>
                                    </div>
                                    <div className="padding-bottom-15">
                                        <div className="shade">{this.state.sendResult.result}</div>
                                        {this.state.sendResult.raw &&
                                        this.state.sendResult.raw.txid &&
                                        <div className="shade">{this.state.sendResult.raw.txid.replace(/\[.*\]/, '')}</div>
                                        }
                                    </div>
                                </div>
                                }
                                <div className="buttons-block">
                                    <div disabled={!this.state.sendResult || this.state.processing}
                                        onClick={() => this.goToDashboard()}
                                        className="button-center">
                                        <img className="button-center"style={{marginTop: 4}} src={'/images/ok_green_icon.svg'}/>
                                    </div>
                                </div>


                                {/*<div*/}
                                {/*disabled={*/}
                                {/*!this.state.sendResult ||*/}
                                {/*this.state.processing*/}
                                {/*}*/}
                                {/*onClick={() => this.changeSendCoinStep(0)}*/}
                                {/*className="group3 margin-top-50">*/}
                                {/*<div className="btn-inner">*/}
                                {/*<div className="btn">{translate('SEND.MAKE_ANOTHER_TX')}</div>*/}
                                {/*<div className="group2">*/}
                                {/*<div className="rectangle8copy"></div>*/}
                                {/*<img*/}
                                {/*className="path6"*/}
                                {/*src="/images/template/login/reset-password-path-6.png"/>*/}
                                {/*</div>*/}
                                {/*</div>*/}
                                {/*</div>*/}
                            </div>
                        </div>
                    </div>
                    <ToastContainer store={ToastStore} position={ToastContainer.POSITION.BOTTOM_CENTER} className="toast-message" />
                </div>
            );
        } else {
            return null;
        }
    }
}

export default SendCoin;
