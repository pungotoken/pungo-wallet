import React, {Component} from 'react';
import {getLocalStorageVar} from "../actions/utils";
import translate from "../translate/translate";

CREATE_WALLET_PAGE = 'create_wallet';
RECOVER_WALLET_PAGE = 'recover_wallet';

class SplashScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            show_actions_block: false,
            show_popup_install: false,
            popup_install_text: "",
            page: ''
        };
    }

    closePopUp = () => {
        this.setState({show_actions_block: false})
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
        this.setState({show_actions_block: true, page: page});
    };

    renderActionsBlock = () => {
        const encryptedKey = getLocalStorageVar('seed');
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
                {encryptedKey ?
                    <div className="splash-warning-label">{translate('LOGIN.WARNING_MSG')}</div> : null}
                {encryptedKey ?
                    <div className="splash-warning-label">{translate('LOGIN.WARNING_WIPE_DATA_MSG')}</div> : null}
                <div className="buttons-block">
                    <img className="button-center" src="/images/splash_next_icon.svg" onClick={() => action()}/>
                </div>
            </div>
        )
    };

    closeInstallPopUp = () => {
        this.setState({show_popup_install: false})
    };

    renderAppInstall = () => {
        // en_us: {
        //     ios: 'To add this web app to the home screen: tap %icon and then <strong>Add to Home Screen</strong>.',
        //     android: 'To add this web app to the home screen open the browser option menu and tap on <strong>Add to homescreen</strong>. <small>The menu can be accessed by pressing the menu hardware button if your device has one, or by tapping the top right menu icon %icon.</small>'
        // },
        return (
            <div className={`popup-block${this.state.show_popup_install ? ' opened' : ''}`}>
                <div style={{top: "30%", height: "230px"}} className="popup-block-content">
                    <div className="popup-header">
                        Install app
                    </div>
                    <div className="popup-message-block">
                        {this.state.popup_install_text}
                        {/* To add Pungo wallet to your homescreen, tap browser menu icon on the top right and then <strong>"Add to Home Screen"</strong> */}
                    </div>
                    <div className="popup-buttons-container">
                        <img src={'/images/ok_red_icon.svg'} className="close-popup-block center"
                             onClick={() => this.closeInstallPopUp()}/>
                    </div>
                </div>
            </div>
        );
    };

    showPopupInstall = () => {

        // var hs = addToHomescreen({autostart: false});
        // console.log(hs);

        var _ua = window.navigator.userAgent;
        var _nav = window.navigator;
        var ath = {
            appID: 'org.cubiq.addtohome',		// local storage name (no need to change)
            fontSize: 15,				// base font size, used to properly resize the popup based on viewport scale factor
            debug: false,				// override browser checks
            logging: false,				// log reasons for showing or not showing to js console; defaults to true when debug is true
            modal: false,				// prevent further actions until the message is closed
            mandatory: false,			// you can't proceed if you don't add the app to the homescreen
            autostart: true,			// show the message automatically
            skipFirstVisit: false,		// show only to returning visitors (ie: skip the first time you visit)
            startDelay: 1,				// display the message after that many seconds from page load
            lifespan: 15,				// life of the message in seconds
            displayPace: 1440,			// minutes before the message is shown again (0: display every time, default 24 hours)
            maxDisplayCount: 0,			// absolute maximum number of times the message will be shown to the user (0: no limit)
            icon: true,					// add touch icon to the message
            message: '',				// the message can be customized
            validLocation: [],			// list of pages where the message will be shown (array of regexes)
            onInit: null,				// executed on instance creation
            onShow: null,				// executed when the message is shown
            onRemove: null,				// executed when the message is removed
            onAdd: null,				// when the application is launched the first time from the homescreen (guesstimate)
            onPrivate: null,			// executed if user is in private mode
            privateModeOverride: false,	// show the message even in private mode (very rude)
            detectHomescreen: false,		// try to detect if the site has been added to the homescreen (false | true | 'hash' | 'queryString' | 'smartURL')

            // hasToken: document.location.hash == '#ath' || _reSmartURL.test(document.location.href) || _reQueryString.test(document.location.search),
            isRetina: window.devicePixelRatio && window.devicePixelRatio > 1,
            isIDevice: (/iphone|ipod|ipad/i).test(_ua),
            isMobileChrome: _ua.indexOf('Android') > -1 && (/Chrome\/[.0-9]*/).test(_ua) && _ua.indexOf("Version") == -1,
            isMobileIE: _ua.indexOf('Windows Phone') > -1,
            language: _nav.language && _nav.language.toLowerCase().replace('-', '_') || ''
        };

        // falls back to en_us if language is unsupported
        // ath.language = ath.language && ath.language in ath.intl ? ath.language : 'en_us';
        ath.isMobileSafari = ath.isIDevice && _ua.indexOf('Safari') > -1 && _ua.indexOf('CriOS') < 0;
        ath.OS = ath.isIDevice ? 'ios' : ath.isMobileChrome ? 'android' : ath.isMobileIE ? 'windows' : 'unsupported';
        ath.OSVersion = _ua.match(/(OS|Android) (\d+[_\.]\d+)/);
        ath.OSVersion = ath.OSVersion && ath.OSVersion[2] ? +ath.OSVersion[2].replace('_', '.') : 0;
        ath.isStandalone = 'standalone' in window.navigator && window.navigator.standalone;
        ath.isTablet = (ath.isMobileSafari && _ua.indexOf('iPad') > -1) || (ath.isMobileChrome && _ua.indexOf('Mobile') < 0);
        ath.isCompatible = (ath.isMobileSafari && ath.OSVersion >= 6) || ath.isMobileChrome;	// TODO: add winphone

        if (!ath.isCompatible) {
            return;
        }

        let text = "";
        if (ath.isIDevice) {
            text = "Install this application on home screen for easy access. Tap \"SHARE\" then \"Add to home screen\"";
        } else {
            text = "Press Browser menu (top rigth) > Add To Home Screen to add Pungo webapp to your mobile home screen";
        }

        if (!localStorage.getItem("app-install-shown")) {
            console.log(localStorage.getItem("app-install-shown"));
            localStorage.setItem("app-install-shown", true);
            this.setState({
                show_popup_install: true,
                popup_install_text: text,
            });
        }
    };

    render() {
        const {goToLogin} = this.props;
        const {page} = this.state;
        this.showPopupInstall();
        return (
            <div className="container">
                {this.renderAppInstall()}
                <img className="img_wrap" src={`/images/splash_logo.svg`}/>

                <div className="buttons-block">
                    {getLocalStorageVar('seed') ?
                        <img className="button-left" src="/images/splash_wallet_icon.svg"
                             onClick={() => goToLogin()}/> : null}
                    <img className="button-center"
                         src={page === RECOVER_WALLET_PAGE ? "/images/splash_recover_icon_black.svg" : "/images/splash_recover_icon.svg"}
                         onClick={() => this.showActionsBlock(RECOVER_WALLET_PAGE)}/>
                    <img className="button-right"
                         src={page === CREATE_WALLET_PAGE ? "/images/splash_new_wallet_icon_black.svg" : "/images/splash_new_wallet_icon.svg"}
                         onClick={() => this.showActionsBlock(CREATE_WALLET_PAGE)}/>
                </div>
                {this.renderActionsBlock()}
            </div>
        );
    }
}


export default SplashScreen;
