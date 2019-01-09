import React, {Component} from 'react';
import PropTypes from 'prop-types';
import translate from "../translate/translate";
import {getLocalStorageVar, setLocalStorageVar, showToastInfo} from "../actions/utils";
import {decryptkey, encryptkey} from "../actions/seedCrypt";
import {saveSettingsItem} from "./Settings";

const SETTINGS_ITEM = 'settings';
const MIN_PIN_PASS_LENGTH = 6;

const PasswordInput = ({onChange, name, value, placeholder}) => {

    PasswordInput.propTypes = {
        name: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
        value: PropTypes.string.isRequired,
    };
    return (
        <div className="edit-field-auth">
            <input
                type="password"
                className="form-control-auth"
                name={name}
                placeholder={placeholder}
                onChange={onChange}
                value={value}/>
        </div>
    );
};

const ErrorMessage = ({hasError, message}) => {
    return (hasError ?
        <div className="error-hint margin-top-10"><i className="fa fa-warning"></i> {message}</div> : null)
};

const AUTH_METHOD_STATE = {
    UPDATE_PIN: 0,
    UPDATE_PASSWORD: 1,
    CHANGE_PIN_TO_PASSWORD: 2,
    CHANGE_PASSWORD_TO_PIN: 3
};

class ChangeAuthMethod extends Component {

    constructor(props) {
        super(props);
        let settings = getLocalStorageVar(SETTINGS_ITEM);

        this.state = {
            oldPin: '',
            oldPassword: '',
            newPin: '',
            newPassword: '',
            confirmNewPin: '',
            confirmNewPassword: '',

            oldPinError: false,
            oldPinWrong: false,
            oldPasswordError: false,
            oldPasswordWrong: false,
            newPinError: false,
            newPasswordError: false,
            confirmNewPinError: false,
            confirmNewPasswordError: false,

            mode: settings ? this.selectMode(settings.securityMethod, props.authMethod) : '',
        };
        this.handleOnChange = this.handleOnChange.bind(this)
    }

    selectMode = (currentMethod, newMethod) => {
        let isEquals = currentMethod === newMethod;

        switch (newMethod) {
            case 'pin':
                return isEquals
                    ? AUTH_METHOD_STATE.UPDATE_PIN
                    : AUTH_METHOD_STATE.CHANGE_PASSWORD_TO_PIN;
            case 'pass':
                return isEquals
                    ? AUTH_METHOD_STATE.UPDATE_PASSWORD
                    : AUTH_METHOD_STATE.CHANGE_PIN_TO_PASSWORD;
        }
    };

    getSecurityModeType = () => {
        switch (this.state.mode) {
            case AUTH_METHOD_STATE.UPDATE_PIN:
            case AUTH_METHOD_STATE.CHANGE_PASSWORD_TO_PIN:
                return 'pin';
            case AUTH_METHOD_STATE.UPDATE_PASSWORD:
            case AUTH_METHOD_STATE.CHANGE_PIN_TO_PASSWORD:
                return 'pass';
        }

    };

    handleOnChange(e) {
        if (e.target.name && e.target.name.toLowerCase().indexOf('pin') !== -1 && e.nativeEvent.data && e.target.value.length > 0) {
            let numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
            let v = e.target.value.slice(-1);
            if (numbers.indexOf(v) < 0) {
                return;
            }
        }
        this.setState({
            [e.target.name]: e.target.value,
        })
    };

    reEncryptSeed = (oldKey, newKey, encryptedKey) => {
        let seed = decryptkey(oldKey, encryptedKey.encryptedKey);
        const newEncryptedKey = encryptkey(newKey, seed);
        setLocalStorageVar('seed', {encryptedKey: newEncryptedKey});
        saveSettingsItem('securityMethod', this.getSecurityModeType());
        showToastInfo(translate('SETTINGS.SAVED'));
    };

    handlePasswordUpdate = encryptedKey => {
        const {oldPassword, newPassword, confirmNewPassword} = this.state;

        if (!oldPassword || oldPassword.length < MIN_PIN_PASS_LENGTH) {
            // pass is too small
            this.setState({oldPasswordError: true})
        } else if (!decryptkey(this.state.oldPassword, encryptedKey.encryptedKey)) {
            // wrong pin entered
            this.setState({oldPasswordWrong: true})
        }
        if (!newPassword || newPassword.length < MIN_PIN_PASS_LENGTH || !confirmNewPassword
            || confirmNewPassword.length < MIN_PIN_PASS_LENGTH || newPassword !== confirmNewPassword) {
            // password is empty or too small
            this.setState({confirmNewPasswordError: true})
        } else {
            this.reEncryptSeed(oldPassword, newPassword, encryptedKey);
            this.setState({confirmNewPasswordError: false, oldPasswordError: false, oldPasswordWrong: false},
                () => this.props.backToSettings()
            )
        }
    };

    handlePinToPasswordUpdate = encryptedKey => {
        const {oldPin, newPassword, confirmNewPassword} = this.state;

        if (!oldPin || oldPin.length < MIN_PIN_PASS_LENGTH) {
            // pass is too small
            this.setState({oldPinError: true})
        } else if (!decryptkey(this.state.oldPin, encryptedKey.encryptedKey)) {
            // wrong pass entered
            this.setState({oldPinWrong: true})
        }
        if (!newPassword || newPassword.length < MIN_PIN_PASS_LENGTH || !confirmNewPassword
            || confirmNewPassword.length < MIN_PIN_PASS_LENGTH || newPassword !== confirmNewPassword) {
            // password is empty or too small
            this.setState({confirmNewPasswordError: true})
        } else {
            this.reEncryptSeed(oldPin, newPassword, encryptedKey);
            this.setState({confirmNewPasswordError: false, oldPinError: false, oldPinWrong: false},
                () => this.props.backToSettings()
            )
        }
    };

    handlePasswordToPinUpdate = encryptedKey => {
        const {newPin, confirmNewPin, oldPassword} = this.state;

        if (!oldPassword || oldPassword.length < MIN_PIN_PASS_LENGTH) {
            // pass is too small
            this.setState({oldPasswordError: true})
        } else if (!decryptkey(this.state.oldPassword, encryptedKey.encryptedKey)) {
            // wrong pass entered
            this.setState({oldPasswordWrong: true})
        }
        if (!newPin || newPin.length < MIN_PIN_PASS_LENGTH || !confirmNewPin
            || confirmNewPin.length < MIN_PIN_PASS_LENGTH || newPin !== confirmNewPin) {
            // pin is empty or too small
            this.setState({confirmNewPinError: true})
        } else {
            this.reEncryptSeed(oldPassword, newPin, encryptedKey);
            this.setState({confirmNewPasswordError: false, oldPasswordError: false, oldPasswordWrong: false},
                () => this.props.backToSettings()
            )
        }
    };

    handlePinUpdate = encryptedKey => {
        const {oldPin, newPin, confirmNewPin} = this.state;

        if (!oldPin || oldPin.length < MIN_PIN_PASS_LENGTH) {
            // pin is too small
            this.setState({oldPinError: true})
        } else if (!decryptkey(this.state.oldPin, encryptedKey.encryptedKey)) {
            // wrong pin entered
            this.setState({oldPinWrong: true})
        }
        if (!newPin || newPin.length < MIN_PIN_PASS_LENGTH || !confirmNewPin
            || confirmNewPin.length < MIN_PIN_PASS_LENGTH || newPin !== confirmNewPin) {
            // pin is empty or too small
            this.setState({confirmNewPinError: true})
        } else {
            this.reEncryptSeed(oldPin, newPin, encryptedKey);
            this.setState({confirmNewPinError: false, oldPinError: false, oldPinWrong: false},
                () => this.props.backToSettings()
            )
        }
    };

    handleOnClick = () => {
        const encryptedKey = getLocalStorageVar('seed');
        switch (this.state.mode) {
            case AUTH_METHOD_STATE.UPDATE_PIN:
                this.handlePinUpdate(encryptedKey);
                break;
            case AUTH_METHOD_STATE.CHANGE_PASSWORD_TO_PIN:
                this.handlePasswordToPinUpdate(encryptedKey);
                break;
            case AUTH_METHOD_STATE.UPDATE_PASSWORD: {
                this.handlePasswordUpdate(encryptedKey);
                break;
            }
            case AUTH_METHOD_STATE.CHANGE_PIN_TO_PASSWORD:
                this.handlePinToPasswordUpdate(encryptedKey);
                break;
            default:
                return null;
        }
    };

    renderUpdatePin = () => {
        const {oldPin, oldPinError, oldPinWrong, newPin, newPinError, confirmNewPin, confirmNewPinError} = this.state;

        return (
            <React.Fragment>
                <p className="hint-label-first">{translate('LOGIN.INTRODUCE_OLD_PIN_HINT')}</p>
                <PasswordInput
                    name="oldPin"
                    onChange={this.handleOnChange}
                    value={oldPin}
                    placeholder={translate('LOGIN.ENTER_6_DIGIT_PIN')}
                />
                <ErrorMessage hasError={oldPinError} message={translate('LOGIN.PIN_TOO_SHORT')}/>
                <ErrorMessage hasError={oldPinWrong} message={translate('LOGIN.WRONG_PIN')}/>

                <p className="hint-label">{translate('LOGIN.INTRODUCE_NEW_PIN_HINT')}</p>
                <PasswordInput
                    name="newPin"
                    onChange={this.handleOnChange}
                    value={newPin}
                    placeholder={translate('LOGIN.ENTER_6_DIGIT_PIN')}
                />
                <ErrorMessage hasError={newPinError} message={translate('LOGIN.PINS_DO_NOT_MATCH')}/>

                <p className="hint-label">{translate('LOGIN.CONFIRM_NEW_PIN_HINT')}</p>
                <PasswordInput
                    name="confirmNewPin"
                    onChange={this.handleOnChange}
                    value={confirmNewPin}
                    placeholder={translate('LOGIN.ENTER_6_DIGIT_PIN')}
                />
                <ErrorMessage hasError={confirmNewPinError} message={translate('LOGIN.PINS_DO_NOT_MATCH')}/>
            </React.Fragment>

        );
    };

    renderPasswordToPin = () => {
        const {
            oldPassword, oldPasswordError, oldPasswordWrong, newPin,
            newPinError, confirmNewPin, confirmNewPinError
        } = this.state;

        return (
            <React.Fragment>
                <p className="hint-label-first">{translate('LOGIN.INTRODUCE_OLD_PASSWORD_HINT')}</p>
                <PasswordInput
                    name="oldPassword"
                    onChange={this.handleOnChange}
                    value={oldPassword}
                    placeholder={translate('LOGIN.ENTER_6_CHARS_PASSWORD')}
                />
                <ErrorMessage hasError={oldPasswordError} message={translate('LOGIN.PASSWORD_TOO_SHORT')}/>
                <ErrorMessage hasError={oldPasswordWrong} message={translate('LOGIN.WRONG_PASSWORD')}/>

                <p className="hint-label">{translate('LOGIN.INTRODUCE_NEW_PIN_HINT')}</p>
                <PasswordInput
                    name="newPin"
                    onChange={this.handleOnChange}
                    value={newPin}
                    placeholder={translate('LOGIN.ENTER_6_DIGIT_PIN')}
                />
                <ErrorMessage hasError={newPinError} message={translate('LOGIN.PINS_DO_NOT_MATCH')}/>

                <p className="hint-label">{translate('LOGIN.CONFIRM_NEW_PIN_HINT')}</p>
                <PasswordInput
                    name="confirmNewPin"
                    onChange={this.handleOnChange}
                    value={confirmNewPin}
                    placeholder={translate('LOGIN.ENTER_6_DIGIT_PIN')}
                />
                <ErrorMessage hasError={confirmNewPinError} message={translate('LOGIN.PINS_DO_NOT_MATCH')}/>
            </React.Fragment>

        );
    };
    renderUpdatePassword = () => {
        const {
            oldPassword, oldPasswordError, oldPasswordWrong, newPassword,
            newPasswordError, confirmNewPassword, confirmNewPasswordError
        } = this.state;

        return (
            <React.Fragment>
                <p className="hint-label-first">{translate('LOGIN.INTRODUCE_OLD_PASSWORD_HINT')}</p>
                <PasswordInput
                    name="oldPassword"
                    onChange={this.handleOnChange}
                    value={oldPassword}
                    placeholder={translate('LOGIN.ENTER_6_CHARS_PASSWORD')}
                />
                <ErrorMessage hasError={oldPasswordError} message={translate('LOGIN.PASSWORD_TOO_SHORT')}/>
                <ErrorMessage hasError={oldPasswordWrong} message={translate('LOGIN.WRONG_PASSWORD')}/>

                <p className="hint-label">{translate('LOGIN.INTRODUCE_NEW_PASSWORD_HINT')}</p>
                <PasswordInput
                    name="newPassword"
                    onChange={this.handleOnChange}
                    value={newPassword}
                    placeholder={translate('LOGIN.ENTER_6_CHARS_PASSWORD')}
                />
                <ErrorMessage hasError={newPasswordError} message={translate('LOGIN.PASSWORDS_DO_NOT_MATCH')}/>

                <p className="hint-label">{translate('LOGIN.CONFIRM_NEW_PASSWORD_HINT')}</p>
                <PasswordInput
                    name="confirmNewPassword"
                    onChange={this.handleOnChange}
                    value={confirmNewPassword}
                    placeholder={translate('LOGIN.ENTER_6_CHARS_PASSWORD')}
                />
                <ErrorMessage hasError={confirmNewPasswordError} message={translate('LOGIN.PASSWORDS_DO_NOT_MATCH')}/>
            </React.Fragment>
        );
    };

    renderPinToPassword = () => {
        const {oldPin, oldPinError, oldPinWrong, newPassword, newPasswordError, confirmNewPassword, confirmNewPasswordError} = this.state;

        return (
            <React.Fragment>
                <p className="hint-label-first">{translate('LOGIN.INTRODUCE_OLD_PIN_HINT')}</p>
                <PasswordInput
                    name="oldPin"
                    onChange={this.handleOnChange}
                    value={oldPin}
                    placeholder={translate('LOGIN.ENTER_6_DIGIT_PIN')}
                />
                <ErrorMessage hasError={oldPinError} message={translate('LOGIN.PIN_TOO_SHORT')}/>
                <ErrorMessage hasError={oldPinWrong} message={translate('LOGIN.WRONG_PIN')}/>

                <p className="hint-label">{translate('LOGIN.INTRODUCE_NEW_PASSWORD_HINT')}</p>
                <PasswordInput
                    name="newPassword"
                    onChange={this.handleOnChange}
                    value={newPassword}
                    placeholder={translate('LOGIN.ENTER_6_CHARS_PASSWORD')}
                />
                <ErrorMessage hasError={newPasswordError} message={translate('LOGIN.PASSWORDS_DO_NOT_MATCH')}/>

                <p className="hint-label">{translate('LOGIN.CONFIRM_NEW_PASSWORD_HINT')}</p>
                <PasswordInput
                    name="confirmNewPassword"
                    onChange={this.handleOnChange}
                    value={confirmNewPassword}
                    placeholder={translate('LOGIN.ENTER_6_CHARS_PASSWORD')}
                />
                <ErrorMessage hasError={confirmNewPasswordError} message={translate('LOGIN.PASSWORDS_DO_NOT_MATCH')}/>

            </React.Fragment>
        );
    };

    renderContent = () => {
        switch (this.state.mode) {
            case AUTH_METHOD_STATE.UPDATE_PIN:
                return this.renderUpdatePin();
            case AUTH_METHOD_STATE.CHANGE_PASSWORD_TO_PIN:
                return this.renderPasswordToPin();
            case AUTH_METHOD_STATE.UPDATE_PASSWORD:
                return this.renderUpdatePassword();
            case AUTH_METHOD_STATE.CHANGE_PIN_TO_PASSWORD:
                return this.renderPinToPassword();
            default:
                return null;
        }
    };

    renderControlButtons = () => {
        return (
            <div className="buttons-block">
                <img src={'/images/cancel_icon.svg'} className="button-left"
                     onClick={() => this.props.backToSettings()}/>
                <img src={'/images/ok_icon.svg'} className="button-right" onClick={this.handleOnClick}/>
            </div>
        );
    };

    render() {
        let content = this.renderContent();
        let actionButtons = this.renderControlButtons();

        return (
            <div className="form settings">
                <div className="form-wrap-auth">
                    {content}
                    {actionButtons}
                </div>
            </div>
        );
    }
}

export default ChangeAuthMethod;