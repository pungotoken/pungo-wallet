import React from 'react';

import {getLocalStorageVar, setLocalStorageVar, showToastInfo,} from '../actions/utils';
import translate, {findLangByCode, findLangCode, langCode, SUPPORTED_LANGUAGES} from '../translate/translate';
import {setApplicationLanguage} from "../../../client/main";

// TODO: reset settings/purge seed and pin

export const SETTINGS_ITEM = 'settings';


export const saveSettingsItem = (varName, varValue) => {
    let settings = getLocalStorageVar(SETTINGS_ITEM);
    if (settings) {
        settings[varName] = varValue;
        setLocalStorageVar(SETTINGS_ITEM, settings);
    } else {
        setLocalStorageVar(SETTINGS_ITEM, {[varName]: varValue});
    }
};

class Settings extends React.Component {
  constructor() {
    super();
      let settings = getLocalStorageVar(SETTINGS_ITEM);

    this.state = {
        autoLockTimeout: settings ? settings.autoLockTimeout : 60000,
        requirePin: settings ? settings.requirePin : false,
        securityMethod: settings ? settings.securityMethod : 'pin',
        isSaved: false,
    };
    this.updateInput = this.updateInput.bind(this);
    this.toggleConfirmPin = this.toggleConfirmPin.bind(this);
  }

  updateInput(e) {
    this.setState({
        [e.target.name]: e.target.value,
    }, saveSettingsItem([e.target.name], e.target.value));
      showToastInfo(translate('SETTINGS.SAVED'))
  }

    updateLanguageSwitch = (e) => {
        let selectedLanguage = e.target.value;
        setApplicationLanguage(selectedLanguage);
        this.props.setLanguage(selectedLanguage);
        showToastInfo(translate('SETTINGS.SAVED'));
    };

    updateBaseCurrencySwitch = (e) => {
        let selectedCurrency = e.target.value;
        saveSettingsItem([e.target.name], e.target.value);
        this.props.setCurrency(selectedCurrency);
        showToastInfo(translate('SETTINGS.SAVED'));
    };

    updateSecurityMethodInput = (e) => {
        let selectedMethod = e.target.value;
        if (selectedMethod !== this.state.securityMethod) {
            this.props.updateAuthMethod(selectedMethod)
        } else {
            // user picked the same option, do nothing
        }
    };

    toggleConfirmPin() {
        let requirePinNewValue = !this.state.requirePin;
        this.setState({
            requirePin: requirePinNewValue,
        }, saveSettingsItem('requirePin', requirePinNewValue));
        showToastInfo(translate('SETTINGS.SAVED'));
    }

    componentDidMount() {
        const settings = getLocalStorageVar(SETTINGS_ITEM);
        if (settings) {
            this.setState({
                autoLockTimeout: settings.autoLockTimeout,
                requirePin: settings.requirePin,
            });
        }
    }

    renderLanguageSwitch = () => {
        let settings = getLocalStorageVar(SETTINGS_ITEM);
        let realLangValue = findLangByCode(settings ? settings.lang : 'en');
        let languages = SUPPORTED_LANGUAGES ? SUPPORTED_LANGUAGES : [{code: 'en', lang: 'English'}];
        let languagesOptions = languages.map(lang => {
            return (<option key={lang.code} value={lang.code}>{lang.lang}</option>);
        });
        let code = realLangValue ? realLangValue.code : 'en';
        return (
            <React.Fragment>
                <div className="select-label">{translate('SETTINGS.CHANGE_LANGUAGE_HINT')}</div>
                <div className="selectWrapper">
                    <select
                        className="form-control form-material"
                        name="lang"
                        value={code}
                        onChange={(event) => this.updateLanguageSwitch(event)}
                        autoFocus>
                        {languagesOptions}
                    </select>
                </div>
            </React.Fragment>
        );
    };

    currenciesOptionsBuilder = () => {
        let currencies = getLocalStorageVar('currencies');
        return currencies.map(currency => (<option key={currency} value={currency}>{currency}</option>));
    };

    renderBaseCurrencySwitch = () => {
        return (
            <React.Fragment>
                <div className="select-label margin-top-20">{translate('SETTINGS.CHANGE_CURRENCY_HINT')}</div>
                <div className="selectWrapper">
                    <select
                        className="form-control form-material"
                        name="baseCurrency"
                        value={this.props.baseCurrency}
                        onChange={(event) => this.updateBaseCurrencySwitch(event)}
                        autoFocus>
                        {this.currenciesOptionsBuilder()}
                    </select>
                </div>
            </React.Fragment>
        );
    };

  render() {
      return (
      <div className="form settings">
        <div className="buttons-block">
            <img src={'/images/change_psw_icon.svg'} className="button-center" onClick={() => this.props.updateAuthMethod(this.state.securityMethod)}/>
            <img src={'/images/backup_key_icon.svg'} className="button-center" onClick={() => this.props.onRecoveryOptions()}/>
            <img src={'/images/logout_icon.svg'} className="button-center" onClick={() => this.props.onLogout()}/>
        </div>
        <div className="margin-top-10 item">
            {this.renderLanguageSwitch()}
            {this.renderBaseCurrencySwitch()}
            <div className="select-label margin-top-20">{translate('SETTINGS.AUTOLOCK_TIMEOUT')}</div>
            <div className="selectWrapper">
                <select
                    className="form-control form-material"
                    name="autoLockTimeout"
                    value={this.state.autoLockTimeout}
                    onChange={(event) => this.updateInput(event)}
                    autoFocus>
                    <option value="600000" className="select-option">10 {translate('SETTINGS.MINUTES')}</option>
                    <option value="1200000">20 {translate('SETTINGS.MINUTES')}</option>
                    <option value="1800000">30 {translate('SETTINGS.MINUTES')}</option>
                </select>
            </div>
            <div className="select-label margin-top-20">{translate('SETTINGS.AUTHORIZATION_METHOD')}</div>
            <div className="selectWrapper">
                <select
                    className="form-control"
                    name="securityMethod"
                    value={this.state.securityMethod}
                    onChange={(event) => this.updateSecurityMethodInput(event)}
                    autoFocus>
                    <option value="pin" className="select-option">
                        {translate('LOGIN.SECURITY_ENCRYPTION_METHOD_PIN')}</option>
                    <option value="pass">
                        {translate('LOGIN.SECURITY_ENCRYPTION_METHOD_PASSWORD')}</option>
                </select>
            </div>
        </div>
        <div className="item confirm_pin_wrapper">
          <div
            className={`toggle-label confirm_pin_label ${this.state.requirePin ? 'active' : ''}`}
            onClick={ this.toggleConfirmPin }>
            { translate('SETTINGS.REQUIRE_AUTH_CONFIRM') }
          </div>
          <label className="switch">
              <input
                  type="checkbox"
                  value="on"
                  checked={ this.state.requirePin } />
              <div
                  className="slider"
                  onClick={ this.toggleConfirmPin }></div>
          </label>
        </div>
      </div>
    );
  }
}

export default Settings;
