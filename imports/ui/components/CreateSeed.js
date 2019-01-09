import React from 'react';
import QRCode from 'qrcode.react';

import {copyToClipboard, getLocalStorageVar, setLocalStorageVar, showToastInfo,} from '../actions/utils';
import {encryptkey,} from '../actions/seedCrypt';
import translate from '../translate/translate';
import {config,} from '../actions/dev';
import passphraseGenerator from './../lib/agama-wallet-lib/build/crypto/passphrasegenerator';
import {ToastContainer, ToastStore} from './../lib/react-toast';
import {saveSettingsItem} from "./Settings";

const SETTINGS_ITEM = 'settings';

class CreateSeed extends React.Component {
    constructor() {
        super();
        let settings = getLocalStorageVar(SETTINGS_ITEM);
        this.state = {
            pinValue: config.preload ? config.preload.pin : null,
            pinValueTooShort: false,
            pinValueRepeat: '',
            pinValueRepeatTooShort: false,
            pinsAreNotTheSame: false,

            requirePinOrPassword: settings ? settings.requirePin : false,
            confirmSeedSaved: false,
            seed: passphraseGenerator.generatePassPhrase(256),
            pristine: true,
            isPastedTheSamePhrase: false,

            passwordValue: '',
            passwordValueTooShort: false,
            passwordValueRepeat: '',
            passwordValueRepeatTooShort: false,
            passwordsAreNotTheSame: false,

            securityMethod: settings && settings.securityMethod ? settings.securityMethod : 'pin',
            showQrCode: false,
            isTextAreaDisabled: true,
        };
        this.defaultState = JSON.parse(JSON.stringify(this.state));
        this.updateInput = this.updateInput.bind(this);
        this.login = this.login.bind(this);
        this.toggleConfirmSeed = this.toggleConfirmSeed.bind(this);
        this.generateKey = this.generateKey.bind(this);
        this.copyKey = this.copyKey.bind(this);
        this.reactToPasteAction = this.reactToPasteAction.bind(this);
    }

    componentWillMount() {
        this.setState({
            seed: passphraseGenerator.generatePassPhrase(256),
        });
    }

    updateInput(e) {
        // allow only numeric values
        if ((e.target.name == "pinValue" || e.target.name == "pinValueRepeat") && e.nativeEvent.data && e.target.value.length > 0) {
            let numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
            let v = e.target.value.slice(-1)
            if (numbers.indexOf(v) < 0) {
                return;
            }
        }

        this.setState({
            [e.target.name]: e.target.value,
            pinValueTooShort: false,
            pinValueRepeatTooShort: false,
            passwordValueTooShort: false,
            passwordValueRepeatTooShort: false,
        });
    }

    login() {
        if (!this.state.confirmSeedSaved &&
            this.state.pristine) {
            this.setState({
                pristine: false,
            });
        } else {
            if (this.state.securityMethod === 'pin') {
                if (this.state.pinValue && this.state.pinValue.length >= 6 && this.state.confirmSeedSaved
                    && this.state.pinValueRepeat && this.state.pinValueRepeat.length >= 6
                    && this.state.pinValue === this.state.pinValueRepeat) {
                    const _encryptedKey = encryptkey(this.state.pinValue, this.state.seed);

                    setLocalStorageVar('seed', {encryptedKey: _encryptedKey});
                    saveSettingsItem('securityMethod', this.state.securityMethod);

                    // this should rewritten when we'll have time
                    window.__seed = this.state.seed;

                    this.props.login(this.state.seed);
                    this.setState(this.defaultState);
                } else if (this.state.pinValue !== this.state.pinValueRepeat) {
                    this.setState({
                        pinsAreNotTheSame: true,
                    });
                } else {
                    this.setState({
                        pinValueTooShort: true,
                        pinValueRepeatTooShort: true,
                    });
                }
            } else if (this.state.securityMethod === 'pass') {
                if (this.state.passwordValue && this.state.passwordValue.length >= 6 && this.state.confirmSeedSaved
                    && this.state.passwordValueRepeat && this.state.passwordValueRepeat.length >= 6
                    && this.state.passwordValue === this.state.passwordValueRepeat) {
                    const _encryptedKey = encryptkey(this.state.passwordValue, this.state.seed);

                    setLocalStorageVar('seed', {encryptedKey: _encryptedKey});
                    saveSettingsItem('securityMethod', this.state.securityMethod);

                    // this should rewritten when we'll have time
                    window.__seed = this.state.seed;

                    this.props.login(this.state.seed);
                    this.setState(this.defaultState);
                } else if (this.state.passwordValue !== this.state.passwordValueRepeat) {
                    this.setState({
                        passwordsAreNotTheSame: true,
                    });
                } else {
                    this.setState({
                        passwordValueTooShort: true,
                        passwordValueRepeatTooShort: true,
                    });
                }
            }
        }
    }

    toggleConfirmSeed() {
        this.setState({
            confirmSeedSaved: !this.state.confirmSeedSaved,
        });
    }

    generateKey() {
        this.setState({
            seed: passphraseGenerator.generatePassPhrase(256),
        });
    }

    toggleTextAreaDisable = () => {
        this.setState({isTextAreaDisabled: !this.state.isTextAreaDisabled})
    };

    toggleQrCodeVisibility = () => {
        this.setState({showQrCode: !this.state.showQrCode});
    };

    copyKey() {
        var seedEl = document.getElementById("seed");
        if (seedEl) {
            let value = seedEl.value;
            copyToClipboard(value);
            showToastInfo(translate('SETTINGS.COPIED_TO_CLIPBOARD'), 2000);
        }
    }

    // the idea is to disable the 'Generate' button when pasting an existing passphrase.
    // so, we need to react to pasting from the clipboard and setting isPastedTheSamePhrase to true and disable the button
    reactToPasteAction(event) {
        if (event.type === 'paste' && event.target.name === 'seed') {
            this.setState({isPastedTheSamePhrase: true});
        }
    }

    componentDidMount() {
        document.addEventListener("paste", this.reactToPasteAction);
    }

    componentWillUnmount() {
        document.removeEventListener("paste", this.reactToPasteAction);
    }

    toggleRequireSecurityMethod = () => {
        let pinOrPasswordNewValue = !this.state.requirePinOrPassword;
        this.setState({
            requirePinOrPassword: pinOrPasswordNewValue,
        }, saveSettingsItem('requirePin', pinOrPasswordNewValue));
    };

    render() {
        const {showQrCode, isTextAreaDisabled} = this.state;
        if (this.props.activeSection === 'create-seed') {
            return (
                <div className="form create-seed">
                    <p className="seed-label">{translate('LOGIN.GENERATE_NEW_PASSPHRASE_HINT')}</p>
                    <div className="textarea-wrap">
                        <textarea disabled={isTextAreaDisabled}
                                  className="edit-field" id="seed" name="seed" onChange={this.updateInput}
                                  value={this.state.seed}>
                        </textarea>
                        <div className="action-buttons-block">
                            <img className="button-center" src={'/images/copy_icon.svg'} onClick={this.copyKey}/>
                            <img className="button-center" onClick={this.toggleQrCodeVisibility}
                                 src={showQrCode ? '/images/hide_qr_icon.svg' : '/images/show_qr_icon.svg'}/>
                            <img className="button-center" src={isTextAreaDisabled ? '/images/pencil_icon.svg' : '/images/pencil_no_icon.svg'}
                                 onClick={this.toggleTextAreaDisable}/>
                        </div>
                    </div>
                    {showQrCode ? <div className="text-center margin-top-15">
                        <QRCode
                            value={this.state.seed}
                            size={160}/>
                    </div> : null}
                    <p className="seed-label">{translate('LOGIN.SECURITY_ENCRYPTION_METHOD_HINT')}</p>
                    <div className="select-wrapper margin-top-10">
                        <select
                            className="security-method-select"
                            name="securityMethod"
                            defaultChecked={this.state.securityMethod}
                            value={this.state.securityMethod}
                            onChange={(event) => this.updateInput(event)}
                            autoFocus>
                            <option value="pin" className="select-option">
                                {translate('LOGIN.SECURITY_ENCRYPTION_METHOD_PIN')}</option>
                            <option value="pass">
                                {translate('LOGIN.SECURITY_ENCRYPTION_METHOD_PASSWORD')}</option>
                        </select>
                    </div>

                    <div className="margin-bottom-25 margin-top-25">
                        {this.state.securityMethod === 'pin' &&
                        <div className="edit edit-field">
                            <input
                                type="password"
                                className="form-password"
                                name="pinValue"
                                onChange={this.updateInput}
                                placeholder={translate('LOGIN.ENTER_6_DIGIT_PIN')}
                                value={this.state.pinValue || ''}/>
                        </div>}
                        {this.state.securityMethod === 'pin' &&
                        <div className="edit edit-field">
                            <input
                                type="password"
                                className="form-password"
                                name="pinValueRepeat"
                                onChange={this.updateInput}
                                placeholder={translate('LOGIN.RE_ENTER_6_DIGIT_PIN')}
                                value={this.state.pinValueRepeat || ''}/>
                        </div>}
                        {this.state.pinsAreNotTheSame &&
                        <div className="error margin-top-15 sz350">
                            <i className="fa fa-warning"></i> {translate('LOGIN.PIN_CODES_DONT_MATCH_HINT')}
                        </div>
                        }
                        {this.state.securityMethod === 'pass' &&
                        <div className="edit edit-field">
                            <input
                                type="password"
                                className="form-password"
                                name="passwordValue"
                                onChange={this.updateInput}
                                placeholder={translate('LOGIN.ENTER_6_CHARS_PASSWORD')}
                                value={this.state.passwordValue || ''}/>
                        </div>}
                        {this.state.securityMethod === 'pass' &&
                        <div className="edit edit-field">
                            <input
                                type="password"
                                className="form-password"
                                name="passwordValueRepeat"
                                onChange={this.updateInput}
                                placeholder={translate('LOGIN.RE_ENTER_PASSWORD')}
                                value={this.state.passwordValueRepeat || ''}/>
                        </div>}
                        {this.state.passwordsAreNotTheSame &&
                        <div className="error margin-top-15 sz350">
                            <i className="fa fa-warning"></i> {translate('LOGIN.PASSWORDS_DONT_MATCH_HINT')}
                        </div>
                        }
                        {this.state.securityMethod === 'pin' && this.state.pinValueTooShort &&
                        <div className="error margin-top-15 sz350">
                            <i className="fa fa-warning"></i> {translate('LOGIN.PIN_TOO_SHORT')}
                        </div>}

                        {this.state.securityMethod === 'pass' && this.state.passwordValueTooShort &&
                        <div className="error margin-top-15 sz350">
                            <i className="fa fa-warning"></i> {translate('LOGIN.PASSWORD_TOO_SHORT')}
                        </div>}
                    </div>

                    <div className="confirm_wrapper">
                        <div className={`toggle-label confirm_label ${this.state.confirmSeedSaved ? 'active' : ''}`}
                             onClick={this.toggleConfirmSeed}>
                            {translate('LOGIN.I_CONFIRM_I_SAVED_SEED')}
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                value="on"
                                checked={this.state.confirmSeedSaved}/>
                            <div
                                className="slider"
                                onClick={this.toggleConfirmSeed}></div>
                        </label>
                    </div>
                    {!this.state.confirmSeedSaved &&
                    !this.state.pristine &&
                    <div className="error margin-left-40 margin-bottom-20">
                        <i className="fa fa-warning"></i> {translate('LOGIN.CONFIRMATION_REQUIRED')}
                    </div>}
                    <div className="confirm_wrapper">
                        <div className={`toggle-label confirm_label ${this.state.requirePinOrPassword ? 'active' : ''}`}
                             onClick={this.toggleRequireSecurityMethod}>
                            {translate(this.state.securityMethod === 'pin' ? 'SETTINGS.REQUIRE_PIN_CONFIRM' : 'SETTINGS.REQUIRE_PASSWORD_CONFIRM')}
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                value="on"
                                checked={this.state.requirePinOrPassword}/>
                            <div
                                className="slider"
                                onClick={this.toggleRequireSecurityMethod}></div>
                        </label>
                    </div>

                    <div className="buttons-block">
                        <img src={'/images/ok_icon.svg'} className="button-center" onClick={this.login}/>
                    </div>

                    <ToastContainer store={ToastStore} position={ToastContainer.POSITION.BOTTOM_CENTER}
                                    className="toast-message"/>
                </div>
            );
        } else {
            return null;
        }
    }
}

export default CreateSeed;