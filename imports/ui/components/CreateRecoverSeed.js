import React from 'react';

import {convertURIToImageData, getLocalStorageVar, setLocalStorageVar, showToastInfo,} from '../actions/utils';
import {encryptkey,} from '../actions/seedCrypt';
import translate from '../translate/translate';
import {config, devlog,} from '../actions/dev';
import {saveSettingsItem, SETTINGS_ITEM} from "./Settings";
import jsQR from "jsqr";

class CreateRecoverSeed extends React.Component {
    constructor() {
        super();
        let settings = getLocalStorageVar(SETTINGS_ITEM);

        this.state = {
            pinOverride: config.preload ? config.preload.pin : null,
            pinOverrideTooShort: false,
            pinOverrideRepeat: '',
            pinOverrideRepeatTooShort: false,
            pinsAreNotTheSame: false,

            pin: config.preload ? config.preload.pin : '',
            pinConfirm: false,
            confirmSeedSaved: false,
            seed: "",
            // seed: passphraseGenerator.generatePassPhrase(256),
            pristine: true,
            showQrCode: false,
            isPastedTheSamePhrase: false,

            passwordValue: '',
            passwordValueTooShort: false,
            passwordValueRepeat: '',
            passwordValueRepeatTooShort: false,
            passwordsAreNotTheSame: false,

            securityMethod: settings && settings.securityMethod ? settings.securityMethod : 'pin',
            isTextAreaDisabled: true,
            qrScanError: false,
        };
        this.defaultState = JSON.parse(JSON.stringify(this.state));
        this.updateInput = this.updateInput.bind(this);
        this.login = this.login.bind(this);
        this.toggleConfirmSeed = this.toggleConfirmSeed.bind(this);
        this.pasteKey = this.pasteKey.bind(this);
        this.copyKey = this.copyKey.bind(this);
        this.reactToPasteAction = this.reactToPasteAction.bind(this);
    }

    componentWillMount() {
        this.setState({
            seed: "",
        });
    }

    updateInput(e) {
        // allow only numeric values
        if ((e.target.name == "pinOverride" || e.target.name == "pinOverrideRepeat") && e.nativeEvent.data && e.target.value.length > 0) {
            let numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
            let v = e.target.value.slice(-1)
            if (numbers.indexOf(v) < 0) {
                return;
            }
        }

        this.setState({
            [e.target.name]: e.target.value,
            pinOverrideTooShort: false,
            pinOverrideRepeatTooShort: false,
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
                if (this.state.pinOverride && this.state.pinOverride.length >= 6
                    && this.state.confirmSeedSaved
                    && this.state.pinOverrideRepeat && this.state.pinOverrideRepeat.length >= 6
                    && this.state.pinOverride === this.state.pinOverrideRepeat && this.state.seed) {
                    const _encryptedKey = encryptkey(this.state.pinOverride, this.state.seed);

                    setLocalStorageVar('seed', {encryptedKey: _encryptedKey});
                    saveSettingsItem('securityMethod', this.state.securityMethod);

                    // this should rewritten when we'll have time
                    window.__seed = this.state.seed;

                    this.props.login(this.state.seed);
                    this.setState(this.defaultState);
                } else if (this.state.pinOverride !== this.state.pinOverrideRepeat) {
                    this.setState({
                        pinsAreNotTheSame: true,
                    });
                } else {
                    this.setState({
                        pinOverrideTooShort: true,
                        pinOverrideRepeatTooShort: true,
                    });
                }
            } else if (this.state.securityMethod === 'pass') {
                if (this.state.passwordValue && this.state.passwordValue.length >= 6 && this.state.confirmSeedSaved
                    && this.state.passwordValueRepeat && this.state.passwordValueRepeat.length >= 6
                    && this.state.passwordValue === this.state.passwordValueRepeat && this.state.seed) {
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

    pasteKey() {
        // console.log('-- paste key');
    }

    copyKey() {
        var copyText = document.getElementById("seed");
        copyText.select();
        document.execCommand("copy");
        // document.execCommand("paste");
        window.getSelection().removeAllRanges();

        showToastInfo(translate('SETTINGS.COPIED_TO_CLIPBOARD'), 2000)
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

    toggleTextAreaDisable = () => {
        this.setState({isTextAreaDisabled: !this.state.isTextAreaDisabled})
    };

    scanQR = () => {
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
                                seed: decodedQR,
                                isTextAreaDisabled: true,
                            });
                        }
                    });
            }
        });
    }

    render() {
        const {isTextAreaDisabled} = this.state;
        console.log('Create recover Seed');
        if (this.props.activeSection === 'create-recover-seed') {
            return (
                <div className="form create-seed">
                    <p className="seed-label">{translate('LOGIN.PASSPHRASE_HINT')}</p>
                    <div className="buttons-block">
                        {/*<img className="button-center" src={'/images/copy_icon.svg'} onClick={this.pasteKey}/>*/}
                        <img className="button-center" src={'/images/show_qr_icon.svg'} onClick={this.scanQR}/>
                        <img className="button-center" onClick={this.toggleTextAreaDisable}
                             src={isTextAreaDisabled ? '/images/pencil_icon.svg' : '/images/pencil_no_icon.svg'}/>
                    </div>
                    <div className="textarea-wrap edit">
                        <textarea disabled={isTextAreaDisabled} value={this.state.seed}
                                  className="edit-field recover" id="seed" name="seed" onChange={this.updateInput}
                                  placeholder="_______________________">
                        </textarea>
                    </div>
                    {this.state.qrScanError &&
                    <div className="error" style={{marginLeft: 15}}>
                        <i className="fa fa-warning"></i> {translate('SEND.QR_SCAN_ERR')}
                    </div>
                    }
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
                    <div className="margin-bottom-25 margin-top-20">
                        <p className="seed-label">{translate(this.state.securityMethod === 'pin' ? 'LOGIN.NEW_PIN_HINT' : 'LOGIN.NEW_PASSWORD_HINT')}</p>
                        {this.state.securityMethod === 'pin' &&
                        <div className="edit edit-field">
                            <input
                                type="password"
                                className="form-password"
                                name="pinOverride"
                                onChange={this.updateInput}
                                placeholder={translate('LOGIN.ENTER_6_DIGIT_PIN')}
                                value={this.state.pinOverride || ''}/>
                        </div>}
                        {this.state.securityMethod === 'pin' &&
                        <div className="edit edit-field">
                            <input
                                type="password"
                                className="form-password"
                                name="pinOverrideRepeat"
                                onChange={this.updateInput}
                                placeholder={translate('LOGIN.RE_ENTER_6_DIGIT_PIN')}
                                value={this.state.pinOverrideRepeat || ''}/>
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
                        {this.state.securityMethod === 'pin' && this.state.pinOverrideTooShort &&
                        <div className="error margin-top-15 sz350">
                            <i className="fa fa-warning"></i> {translate('LOGIN.PIN_TOO_SHORT')}
                        </div>}

                        {this.state.securityMethod === 'pass' && this.state.passwordValueTooShort &&
                        <div className="error margin-top-15 sz350">
                            <i className="fa fa-warning"></i> {translate('LOGIN.PASSWORD_TOO_SHORT')}
                        </div>}
                    </div>

                    <div className="margin-top-30 margin-bottom-25 sz350">
                        <label className="switch">
                            <input
                                type="checkbox"
                                value="on"
                                checked={this.state.confirmSeedSaved}/>
                            <div
                                className="slider"
                                onClick={this.toggleConfirmSeed}></div>
                        </label>
                        <div
                            className={`toggle-label pointer ${this.state.confirmSeedSaved ? 'active' : ''}`}
                            onClick={this.toggleConfirmSeed}>
                            {translate('LOGIN.I_CONFIRM_I_SAVED_SEED')}
                        </div>
                        {!this.state.confirmSeedSaved &&
                        !this.state.pristine &&
                        <div className="error margin-top-15">
                            <i className="fa fa-warning"></i> {translate('LOGIN.CONFIRMATION_REQUIRED')}
                        </div>
                        }
                    </div>
                    <div className="buttons-block">
                        <img src={'/images/ok_icon.svg'} className="button-center" onClick={this.login}/>
                    </div>
                </div>
            );
        } else {
            return null;
        }
    }
}

export default CreateRecoverSeed;
