import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import electrumServers from './conf/electrum-servers';
import actions from './actions/actions';
import {cleanStoredWalletData, getLocalStorageVar, setLocalStorageVar,} from './actions/utils';
import translate from './translate/translate';
import {config, devlog,} from './actions/dev';
import {getRandomIntInclusive, sort,} from './lib/agama-wallet-lib/build/utils';

import SendCoin from './components/SendCoin';
import AddCoin from './components/AddCoin';
import Transactions from './components/Transactions';
import ServerSelect from './components/ServerSelect';
import CreateSeed from './components/CreateSeed';
import CreateRecoverSeed from './components/CreateRecoverSeed';
import Pin from './components/Pin';
import Recovery from './components/Recovery';
import RecoveryKeys from './components/RecoveryKeys';
import Overview from './components/Overview';
import Settings, {SETTINGS_ITEM} from './components/Settings';
import SplashScreen from "./components/SplashScreen";
import Login from "./components/Login";
import ManageCoins from "./components/ManageCoins";

import Peer2Cash from "./components/Peer2Cash";
import Peer2Card from "./components/Peer2Card";

import About from "./components/About";
import * as Swipe from "./components/Swipe";
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import ProgressBar from "./components/ProgressBar";
import {ToastContainer, ToastStore} from "./lib/react-toast";
import ChangeAuthMethod from "./components/ChangeAuthMethod";
import RecoveryOptions from "./components/RecoveryOptions";
import SupportScreen from "./components/Support";

const DASHBOARD_UPDATE_INTERVAL = 120000; // 2m
const DEFAULT_LOCK_INACTIVE_INTERVAL = getLocalStorageVar('settings') && getLocalStorageVar('settings').autoLockTimeout ? getLocalStorageVar('settings').autoLockTimeout : 600000; // 10m

// import addToHomescreen from './lib/add-homescreen/add-homescreen';

class App extends React.Component {
    constructor() {
        super();
        let settings = getLocalStorageVar(SETTINGS_ITEM);
        this.state = {
            address: null,
            balance: null,
            transactions: null,
            utxo: null,
            errors: null,
            displayMenu: false,
            coin: null,
            coins: {},
            pubKeys: {},
            activeSection: 'splash',
            saveSeed: null,
            auth: false,
            updateInterval: null,
            conError: false,
            proxyError: false,
            overview: null,
            history: null,
            btcFees: null,
            show_coins_panel: false,
            baseCurrency: settings && settings.baseCurrency ? settings.baseCurrency : 'USD',
            showProgressBar: false,
            numberOfTransactions: 10,
            authMethod: null,
            lang: settings && settings.lang ? settings.lang : 'en'
        };
        this.defaultState = JSON.parse(JSON.stringify(this.state));

        this.login = this.login.bind(this);
        this.loginAfterSelectCoin = this.loginAfterSelectCoin.bind(this);

        this.logout = this.logout.bind(this);
        this.lock = this.lock.bind(this);
        this.getBalance = this.getBalance.bind(this);
        this.getTransactions = this.getTransactions.bind(this);
        this.toggleMenu = this.toggleMenu.bind(this);
        this.dashboardRefresh = this.dashboardRefresh.bind(this);
        this.switchCoin = this.switchCoin.bind(this);

        this.addCoin = this.addCoin.bind(this);

        this.changeActiveSection = this.changeActiveSection.bind(this);
        this.toggleAutoRefresh = this.toggleAutoRefresh.bind(this);
        this.toggleOverview = this.toggleOverview.bind(this);
        this.toggleMenuOption = this.toggleMenuOption.bind(this);
        this.globalClick = this.globalClick.bind(this);
        this.globalClickTimeout = null;
        this.overviewInterval = null;
        this.historyBack = this.historyBack.bind(this);
        this.scrollToTop = this.scrollToTop.bind(this);
        this.getBtcFees = this.getBtcFees.bind(this);
        this.retryProxy = this.retryProxy.bind(this);

        this.goToLoginPage = this.goToLoginPage.bind(this);
        this.goToDashboard = this.goToDashboard.bind(this);
        this.goToAddCoinPage = this.goToAddCoinPage.bind(this);
        this.goToCreateSeedPage = this.goToCreateSeedPage.bind(this);
        this.goToCreateRecoverSeedPage = this.goToCreateRecoverSeedPage.bind(this);
        this.updateApplicationStyle = this.updateApplicationStyle.bind(this);
        this.addCoins = this.addCoins.bind(this);

        this.coinSwitchServer = this.coinSwitchServer.bind(this);
        this.coinSwitchServerProgress = {};
    }

    componentWillMount() {
        const {actions} = this.props;
        const _localStorageCoins = getLocalStorageVar('coins');

        if (_localStorageCoins) {
            this.setState({
                coins: _localStorageCoins,
            });
        }

        actions.getOverview(this.state.coins, this.state.baseCurrency)
            .then((res) => {
                this.setState({
                    overview: res,
                });
            });

        // temporary android back button fix
        let __this = this;
        document.addEventListener("backbutton", function onBackButtonDown(event) {
            __this.historyBack();
        }, false);

        // show popup to add to homescreen if this is not android
        // if this is android - message with link to playstore
        // addToHomescreen();
    }

    setLanguage = lang => {
        this.setState({lang: lang})
    };

    setCurrency = currency => {
        this.setState({baseCurrency: currency}, () => this.getOverviewRequest())
    };

    isTop = (el) => {
        let client = el.getBoundingClientRect();
        return (client.height === client.bottom) && client.top === 0;
    };

    trackScrolling = () => {
        return this.isTop(document.querySelector('.app-container'));
    };

    handleSwipe = code => {
        if (code === Swipe.RIGHT_SWIPE && !this.state.displayMenu) {
            this.setState({displayMenu: true})
        } else if (code === Swipe.LEFT_SWIPE && this.state.displayMenu) {
            this.setState({displayMenu: false})
        } else if (code === Swipe.TOP_SWIPE) {
            let scrolling = this.trackScrolling();
            if (scrolling) {
                this.dashboardRefresh()
            }
        }
    };

    addSwipeListener = () => {
        if (this.state.activeSection === 'dashboard') {
            // the Dashboard screen has a horizontal scroll in the coins panel.
            // That overlaps the left swipe to open the main menu, so on the 'Dashboard' screen
            // we need to add swipe listener on all the components but not over the 'Coins panel' component
            let logoContainer = document.querySelector('.app-logo');
            if (logoContainer) {
                Swipe.add(logoContainer, this.handleSwipe);
            }
            let transactionsContainer = document.querySelector('.transactions-ui');
            if (transactionsContainer) {
                Swipe.add(transactionsContainer, this.handleSwipe);
            }
        } else {
            // otherwise just add the swiping to the parent container
            let appContainer = document.querySelector('.app-container');
            if (appContainer) {
                Swipe.add(appContainer, this.handleSwipe);
            }
        }
    };


    componentDidMount() {
        this.addSwipeListener();
        document.addEventListener('scroll', this.trackScrolling);
    }

    removeSwipeListeners = () => {
        let logoContainer = document.querySelector('.app-logo');
        let transactionsContainer = document.querySelector('.transactions-ui');
        let appContainer = document.querySelector('.app-container');

        if (logoContainer) {
            Swipe.remove(logoContainer);
        }
        if (transactionsContainer) {
            Swipe.remove(transactionsContainer);
        }
        if (appContainer) {
            Swipe.remove(appContainer);
        }
    };

    componentWillUnmount() {
        this.removeSwipeListeners();
        document.removeEventListener('scroll', this.trackScrolling);
    }

    retryProxy() {
        const {actions} = this.props;

        actions.getAnotherProxy();
        this.dashboardRefresh();
    }

    getBtcFees() {
        const {actions} = this.props;

        this.setState({
            btcFees: null,
        });

        actions.getBtcFees()
            .then((res) => {
                this.setState({
                    btcFees: res,
                });

                if (res === 'error') {
                    setTimeout(() => {
                        this.getBtcFees();
                    }, 5000);
                }
            });
    }

    historyBack() {
        if(this.state.history && this.state.history != "") {
            this.setState({
                activeSection: this.state.history,
                history: null,
                numberOfTransactions: 10
            });
        }
        else if (!this.state.history) {
            // if history is empty, the system should minimize the app
            navigator.app.exitApp();
        }
    }

    scrollToTop() {
        window.scrollTo(0, 0);
    }

    globalClick() {
        if (this.state.auth) {
            if (this.globalClickTimeout) {
                clearTimeout(this.globalClickTimeout);
            }

            if (config.dev &&
                config.preload &&
                !config.preload.disableAutoLock) {
                this.globalClickTimeout = setTimeout(() => {
                    devlog(`logout after ${DEFAULT_LOCK_INACTIVE_INTERVAL}ms inactivity`);
                    this.lock();
                }, DEFAULT_LOCK_INACTIVE_INTERVAL);
            }

        }
    }

    coinSwitchServer(coin, after) {
        let coin_servers = electrumServers[coin];
        let coins = this.state.coins;
        let current_server = coins[coin].server;
        let current_server_string = current_server.ip + ":" + current_server.port + ":" + current_server.proto;
        let new_server = null;
        let new_server_data = {};
        let __this = this;

        console.log("+++++++ switching electrum server");

        // coin switch in progress
        if(this.coinSwitchServerProgress[coin] === true) {
            console.log("+++++++ coin server switch is in progress", coin);
            return
        }
        this.coinSwitchServerProgress[coin] = true;

        // pick next server on the list after current one (if there is one)
        if (coin_servers.serverList && coin_servers.serverList.length > 0) {

            for(var i = 0; i < coin_servers.serverList.length; i++) {
                if(current_server_string == coin_servers.serverList[i]) {
                    if(coin_servers.serverList.length > i+1) {
                        new_server = coin_servers.serverList[i+1];
                    } else {
                        new_server = coin_servers.serverList[0];
                    }
                    break;
                }
            }

            console.log("+++++++ prev electrum server", current_server_string);
            console.log("+++++++ new electrum server", new_server);

            const serverDetails = new_server.split(':');
            if (serverDetails.length === 3) {
                new_server_data = {
                    ip: serverDetails[0],
                    port: serverDetails[1],
                    proto: serverDetails[2],
                };
            }

        }

        coins[coin].server = new_server_data;

        this.setState({
            coins,
        }, after);
        setLocalStorageVar('coins', this.state.coins);

        console.log("+++++++++=============== check coins server switch", getLocalStorageVar('coins'));

        // this.coinSwitchServerProgress = false;
        setTimeout(function() {
            __this.coinSwitchServerProgress[coin] = false;
        }, 1000);
    }

    addCoin(coin) {
        let server = electrumServers[coin];
        let coins = this.state.coins;
        let _this = this;

        // pick first server on the list
        if (server.serverList && server.serverList.length > 0) {

            // const randomServerId = getRandomIntInclusive(0, server.serverList.length - 1);
            // const randomServer = server.serverList[randomServerId];

            const serverId = 0;
            const serverData = server.serverList[serverId];
            const serverDetails = serverData.split(':');

            if (serverDetails.length === 3) {
                server = {
                    ip: serverDetails[0],
                    port: serverDetails[1],
                    proto: serverDetails[2],
                };
            }
        }

        coins[coin] = {
            server,
        };

        setLocalStorageVar('coins', this.state.coins);

        if (!this.state.auth) {
            this.setState({
                coins,
                history: null,
                activeSection: 'login',
            });
        } else {
            const {actions} = this.props;

            actions.addKeyPair(coin)
                .then((res) => {
                    let pubKeys = this.state.pubKeys;
                    pubKeys[coin] = res;

                    this.setState({
                        pubKeys,
                        coins,
                        history: null,
                        activeSection: 'dashboard',
                        coin,
                        address: res,
                        transactions: this.state.coins[coin] ? this.state.coins[coin].transactions : null,
                        balance: this.state.coins[coin] ? this.state.coins[coin].balance : null,
                    }, () => {
                        this.scrollToTop();
                        this.dashboardRefresh();
                    });
                });
        }
    }

    addCoins(newCoins) {
        let stateCoins = this.state.coins;
        let pubKeys = this.state.pubKeys;

        if (newCoins.length === 0 ){

            this.setState({
                coins: {},
                history: null,
                activeSection: 'overview'
            }, () => this.getOverviewRequest());

        }

        // sift through the coins and leave the selected ones
        let temp = {};
        newCoins.forEach(function (value, i) {
            for (let coin in stateCoins) {
                if (value === coin) {
                    temp[coin] = stateCoins[coin]
                }
            }
        });

        let activeCoin = "";
        let activeCoinKey = "";

        for (let i = 0; i < newCoins.length; i++) {
            let currentCoin = newCoins[i];
            let server = electrumServers[currentCoin];

            if (i == newCoins.length - 1) {
                activeCoin = currentCoin;
            }

            // pick a random server to communicate with
            if (server.serverList &&
                server.serverList.length > 0) {
                const randomServerId = getRandomIntInclusive(0, server.serverList.length - 1);
                const randomServer = server.serverList[randomServerId];
                const serverDetails = randomServer.split(':');

                if (serverDetails.length === 3) {
                    server = {
                        ip: serverDetails[0],
                        port: serverDetails[1],
                        proto: serverDetails[2],
                    };
                }
            }

            temp[currentCoin] = {
                server,
            };

            setLocalStorageVar('coins', temp);

            if (!this.state.auth) {
                this.setState({
                    coins: temp,
                    history: null,
                    activeSection: 'login',
                });
            } else {
                const {actions} = this.props;

                console.log("-------- GENERATING KEYS", currentCoin);
                actions.addKeyPair(currentCoin)
                    .then((res) => {
                        pubKeys[currentCoin] = res;

                        if (i == newCoins.length - 1) {
                            activeCoinKey = res;

                            this.setState({
                                pubKeys,
                                coins: temp,
                                history: null,
                                activeSection: 'overview',
                                coin: activeCoin,
                                address: activeCoinKey,
                                transactions: this.state.coins[activeCoin] ? this.state.coins[activeCoin].transactions : null,
                                balance: this.state.coins[activeCoin] ? this.state.coins[activeCoin].balance : null,
                            }, () => {
                                this.scrollToTop();
                                this.dashboardRefresh();
                            });

                            actions.getOverview(temp, this.state.baseCurrency)
                                .then((res) => {
                                    this.setState({
                                        overview: res,
                                    });
                                });
                        }
                    });
            }
        }

    }

    changeActiveSection(section, toggleMenu) {
        if (toggleMenu) {
            this.setState({
                displayMenu: false,
                history: this.state.activeSection,
                activeSection: section,
            });
        } else {
            this.setState({
                history: this.state.activeSection,
                activeSection: section,
            });
        }

        if (this.state.coin === 'btc' &&
            section === 'send') {
            this.getBtcFees();
        }

        this.scrollToTop();
    }

    switchCoin(coin, disableMenuToggle) {
        console.log("==== pubkeys", this.state.pubKeys);
        console.log("==== old status", this.state);

        this.setState({
            coin: coin,
            address: this.state.pubKeys[coin],
            history: this.state.activeSection,
            activeSection: 'dashboard',
            // activeSection: this.state.activeSection !== 'send' ? 'dashboard' : 'send',
            transactions: this.state.coins[coin] ? this.state.coins[coin].transactions : null,
            balance: this.state.coins[coin] ? this.state.coins[coin].balance : null,
            numberOfTransactions: 10
        },  () => {
            // toggle refresh and update in-mem coins cache obj
            if(!disableMenuToggle) {
                this.toggleMenu();
            }
            this.dashboardRefresh();
            this.scrollToTop();

            console.log("==== new status", this.state);
        });
    }

    toggleAutoRefresh(disable) {
        if (disable) {
            clearInterval(this.state.updateInterval);
            clearInterval(this.state.overviewInterval);

            this.setState({
                updateInterval: null,
            });
        } else {
            const _updateInterval = setInterval(() => {
                if (this.state.activeSection === 'dashboard') {
                    this.dashboardRefresh();
                }
            }, DASHBOARD_UPDATE_INTERVAL);

            this.setState({
                updateInterval: _updateInterval,
            });
        }
    }

    loadMoreTransactions = () => {
        let newNumberOfTransactions = this.state.numberOfTransactions + 10;
        this.setState({numberOfTransactions: newNumberOfTransactions},
            this.getTransactions(newNumberOfTransactions)
        );
        setTimeout(()=> this.toggleProgressBar(false), 1500)
    };

    dashboardRefresh(retryCount) {
        this.toggleProgressBar(true);
        const {actions} = this.props;
        let __this = this;
        let loadOverview = true;

        this.setState({
            // balance: 0,
            // transactions: null,
        }, () => {
            this.getBalance();
            this.getTransactions(this.state.numberOfTransactions);

            if(loadOverview) {
                actions.getOverview(__this.state.coins, this.state.baseCurrency)
                    .then((res) => {
                        console.log("AAAAAAAAAAAAA overview result", res);
                        var needReload = false;
                        res.forEach(function(el) {
                            if(el.server_error) {
                                needReload = true;
                                __this.coinSwitchServer(el.coin);
                            }
                        });

                        if(needReload) {
                            if(!retryCount) {
                                retryCount = 0;
                            }
                            if(retryCount < 2) {
                                retryCount++;
                                setTimeout(function() {
                                    __this.dashboardRefresh(retryCount);
                                }, 300);
                            }
                        }

                        __this.setState({
                            overview: res,
                        });
                    })
                    .then(()=> {this.toggleProgressBar(false)})
            }
        });
    }


    getBalance(retryCount) {
        const {actions} = this.props;
        let __this = this;

        actions.balance(this.state.coin)
            .then((res) => {

                console.log("::::::::::: get balance result", res);

                // .. !!!

                if (res &&
                    res === 'proxy-error') {
                    this.setState({
                        proxyError: true,
                    });

                    // .. !!!

                } else {
                    if (res &&

                        !res.hasOwnProperty('balance') &&
                        res.indexOf('error') > -1) {

                        console.log("++++++++++++++++++++++++++++ proxy error trigger (getBalance)");

                        if(!retryCount) {
                            retryCount = 0;
                        }
                        if(retryCount < 2) {

                            console.log("++++++++++++++++++++++++++++ retrying", retryCount);
                            retryCount++;
                            this.coinSwitchServer(this.state.coin, function() {
                                setTimeout(function() {
                                    console.log("++++++++++++++++++++++++++++ retry callback");
                                    __this.getBalance(retryCount);
                                }, 500);
                            });

                        } else {

                            this.setState({
                                balance: null,
                                transactions: null,
                                conError: true,
                            });
                            console.log(">>>>>>>>>> no more retries");

                        }

                    } else {

                        console.log(">> balance result: ", res);

                        this.setState({
                            balance: res,
                            conError: false,
                            proxyError: false,
                        });
                    }
                }
            })
    }

    getTransactions(numberOfTransactions = 10) {
        const {actions} = this.props;
        actions.transactions(this.state.coin, numberOfTransactions)
            .then((res) => {
                if (res &&
                    res.indexOf('error') > -1) {

                    console.log("++++++++++++++++++++++++++++ proxy error trigger here 111111111");
                    this.coinSwitchServer(this.state.coin);

                    this.setState({
                        balance: null,
                        transactions: null,
                        conError: true,
                    });
                } else {
                    res = sort(res, 'timestamp', true);

                    this.setState({
                        transactions: res,
                        conError: false,
                        proxyError: false,
                    });

                    console.log("==== IPDATE TX", this.state, res);
                }
            });
    }

    // purge keys and added coins
    logout() {
        const {actions} = this.props;

        actions.clearKeys()
            .then((res) => {
                this.toggleAutoRefresh(true);
                // setLocalStorageVar('coins', {});

                setTimeout(() => {
                    this.toggleMenu();
                }, 10);
                setTimeout(() => {
                    this.setState(this.defaultState);
                }, 20);
                this.scrollToTop();
            });
    }

    // lock is logout when list of added coins is persistent
    lock() {
        const {actions} = this.props;

        actions.clearKeys()
            .then((res) => {
                const lockState = Object.assign({}, this.defaultState);
                lockState.coins = this.state.coins;

                this.toggleAutoRefresh(true);
                setTimeout(() => {
                    this.toggleMenu();
                }, 10);
                setTimeout(() => {
                    this.setState(lockState);
                }, 20);
                this.scrollToTop();
            });
    }

    login(passphrase) {
        const {actions} = this.props;

        // [!!!] TODO: rewrite
        window.__passphrase = passphrase;

        actions.auth(passphrase, this.state.coins)
            .then((res) => {
                // select a coin and an address
                let coin;
                let address;

                if (this.state.coins.kmd) {
                    coin = 'kmd';
                    address = res.kmd;
                } else {
                    coin = Object.keys(this.state.coins)[0];
                    address = res[coin];
                }

                if (config.preload &&
                    config.preload.activeCoin) {
                    coin = config.preload.activeCoin;
                    address = res[coin];
                }

                this.setState({
                    auth: true,
                    pubKeys: res,
                    coin,
                    address,
                    history: null,
                    activeSection: 'addcoin',
                    // activeSection: 'dashboard',
                });

                this.dashboardRefresh();
                this.toggleAutoRefresh();
                this.globalClick();
                this.scrollToTop();
            });
    }

    loginAfterSelectCoin(passphrase) {
        const {actions} = this.props;

        // [!!!] TODO: rewrite
        window.__passphrase = passphrase;
        if(!this.state.coins || !this.state.coins.length) {
            this.state.coins = getLocalStorageVar("coins")
        }

        actions.auth(passphrase, this.state.coins)
            .then((res) => {
                // select a coin and an address
                let coin;
                let address;

                if (this.state.coins.pgt) {
                    coin = 'pgt';
                    address = res.pgt;
                } else {
                    coin = Object.keys(this.state.coins)[0];
                    address = res[coin];
                }

                console.log("=========== login coin", res, coin, address)

                this.setState({
                    auth: true,
                    pubKeys: res,
                    coin,
                    address,
                    history: null,
                    activeSection: 'overview',
                });

                actions.getOverview(this.state.coins, this.state.baseCurrency)
                    .then((res) => {
                        this.setState({
                            overview: res,
                        });
                    });

                this.dashboardRefresh();
                this.toggleAutoRefresh();
                this.globalClick();
                this.scrollToTop();

            });
    }

    toggleMenu() {
        this.setState({
            displayMenu: !this.state.displayMenu,
        });
    }

    getOverviewRequest = () => {
        this.props.actions.getOverview(this.state.coins, this.state.baseCurrency)
            .then((res) => {
                this.setState({overview: res});
            });
    };

    toggleOverview() {
        const {actions} = this.props;

        console.log("------------ toggle overview");

        actions.getOverview(this.state.coins, this.state.baseCurrency)
            .then((res) => {
                console.log("-- overview done", res);

                this.setState({
                    overview: res,
                });
            });

        if (!this.state.overviewInterval) {
            const _updateInterval = setInterval(() => {
                if (this.state.activeSection === 'overview') {
                    actions.getOverview(this.state.coins, this.state.baseCurrency)
                        .then((res) => {
                            this.setState({
                                overview: res,
                            });
                        });
                }
            }, DASHBOARD_UPDATE_INTERVAL);

            this.setState({
                overviewInterval: _updateInterval,
            });
        }

        this.toggleMenuOption('overview');
    }

    toggleMenuOption(optionName) {
        setTimeout(() => {
            this.toggleMenu();
        }, 10);

        this.setState({
            history: this.state.activeSection,
            activeSection: optionName,
        });
        this.scrollToTop();
    }

    renderActiveCoins() {
        let _items = [];
        let {coins} = this.state;
        let coinsArray = coins ? App.findSelectedCoins(this.state.coins).sort(App.coinsComparator) : [];

        if (coins && coins.pgt) {
            _items.push(
                <div
                    onClick={() => this.switchCoin('pgt')}
                    key={`active-coins-pgt`}
                    className={`active-coins ${(this.state.coin === "pgt" && this.state.activeSection == 'dashboard') ? "current-coin" : ""}`}>
                    <img src="/images/cryptologo/pgt.svg"/> PGT
                </div>
            );
        }

        for (let k = 0; k < coinsArray.length; k++) {
            if (coinsArray[k] !== 'pgt') {
                let key = coinsArray[k];
                _items.push(
                    <div
                        onClick={() => this.switchCoin(key)}
                        key={`active-coins-${key}`}
                        className={`active-coins ${(this.state.coin === key && this.state.activeSection == 'dashboard') ? "current-coin" : ""}`}>
                        <img src={`/images/cryptologo/${key}.svg`}/> {key.toUpperCase()}
                    </div>
                );
            }
        }

        return _items;
    }

    renderMenu() {
        return (
            <div className={`menu-ui ${this.state.displayMenu ? 'menu-opened' : ''}`}>
                <div className="menu-items">
                    <div className="buttons-block">
                        <img className="button-center" src="/images/menu_grey_icon.svg" onClick={() => this.toggleMenu()}/>
                        <img className="button-center" src="/images/overview_home_icon.svg" onClick={() => this.toggleOverview('overview')}/>
                        <img className="button-center" src="/images/krd_icon.svg" onClick={() => window.open("https://krd.pungo.app/reload", '_system')}/>
                        <img className="button-center" src="/images/manage_coins_icon.svg" onClick={() => this.toggleMenuOption('manage_coins')}/>
                        <img className="button-center" src="/images/settings_icon.svg" onClick={() => this.toggleMenuOption('settings')}/>
                        {/*<img className="button-center" src="/images/support_icon.svg" onClick={() => this.toggleMenuOption('support')}/>*/}
                        <img className="button-center" src="/images/lock_icon.svg" onClick={() => this.logout()}/>
                    </div>
                    <div className="menu-logo" onClick={() => this.toggleMenuOption('about')}>
                        <img src="/images/menu_logo.svg"/>
                    </div>
                </div>
            </div>
        );
    }

    static findSelectedCoins(coinObjects) {
        let coinsArray = [];
        let keys = Object.keys(coinObjects);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const coin = key.toLowerCase();
            coinsArray.push(coin);
        }
        return coinsArray;
    };

    setCoinsPanelVisibility = (visibility) => {
        this.setState({show_coins_panel: visibility})
    };

    renderCoinIconBlock() {
        return (
            !this.state.show_coins_panel ?
                <div className="title-arrow-wrapper">
                    <div onClick={() => this.setCoinsPanelVisibility(!this.state.show_coins_panel)}>
                    <img className="title-coin-icon" src={`/images/cryptologo/${this.state.coin}.svg`}/>
                    {/* @andrii - leave all icons as KMD.svg (NOT KMD_icon.svg) */}
                        <div className="current-coin-label">
                            {translate("COINS." + this.state.coin.toUpperCase())}
                        </div>
                    </div>
                    <img className="title-arrow_down-icon" src={`/images/arrow_down.svg`}
                         onClick={() => this.setCoinsPanelVisibility(!this.state.show_coins_panel)}/>
                </div> : null
        )

    }

    renderCoinsPanel(items) {
        return(
            this.state.show_coins_panel ?
                <ReactCSSTransitionGroup
                    transitionName="anim"
                    transitionAppear={true}
                    transitionAppearTimeout={500}
                    transitionEnter={false}
                    transitionLeave={false}
                >
                    <div className="overview-wrapper">
                        <div className="overview-panel-coins">
                            {items}
                        </div>
                    </div>
            </ReactCSSTransitionGroup> : null
        )
    }

    renderCoinsPanelOverlay() {
        return (
            this.state.show_coins_panel ?
                <div onClick={() => this.setCoinsPanelVisibility(false)} className="overlay-coins-panel"></div> : null
        )
    }

    static coinsComparator = (a, b) => {
        if (a < b)
            return -1;
        if (a > b)
            return 1;
        return 0;
    };

    renderApplicationHeader = () => {
        let {coin} = this.state;
        let coinsArray = App.findSelectedCoins(this.state.coins).sort(App.coinsComparator);
        let _items = [];

        for (let i = 0; i < coinsArray.length; i++) {
            const key = coinsArray[i];

            const _coin = key.toLowerCase();
            _items.push(
                <div
                    onClick={() => {this.setCoinsPanelVisibility(!this.state.show_coins_panel); this.switchCoin(_coin, true)}}
                    key={`overview-coins-${_coin}`}
                    className='overview-panel-coin'>
                    <div className={`btc`}>
                        <img
                            className="oval4"
                            src={`/images/cryptologo/${_coin}.svg`}/>
                    </div>
                    <div className={`panel-bitcoin${coin && coin.toLowerCase() === _coin ? ' selected' : ''}`}>
                        {key ? key.toUpperCase() : ''}
                    </div>
                </div>
            );
        }

        return (
            <div>
                <div className={'app-header' + (this.state.activeSection === 'dashboard' ? ' title-with-image' : '')}>
                    {this.state.activeSection === 'recovery_options' &&
                    <img onClick={() => this.setState({activeSection: 'settings', history: null})}
                         className="menu-back" src="/images/back_button.svg"/>}
                    {this.state.activeSection === 'dashboard' &&
                    <img onClick={() => this.setState({activeSection: 'overview', history: null})}
                         className="menu-back" src="/images/back_button.svg"/>}
                    {this.state.history &&
                    !this.state.displayMenu &&
                    ((this.state.auth && this.state.history !== 'login' && this.state.history !== 'create-seed') || !this.state.auth) &&
                    this.state.history !== this.state.activeSection &&
                    !this.state.proxyError &&
                    <img
                        onClick={this.historyBack}
                        className="menu-back"
                        src="/images/back_button.svg"/>
                    }
                    <div className="app-logo" onClick={() => this.setCoinsPanelVisibility(false)}>
                        <img className="header-logo" src="/images/header_logo.svg"/>
                    </div>
                    {this.state.activeSection != 'create-seed' && this.state.activeSection != 'create-recover-seed' && this.state.activeSection != 'addcoin' &&
                    <img
                        onClick={this.toggleMenu}
                        onClick={this.toggleMenu}
                        className="menu-icon"
                        src="/images/menu_white_icon.svg"/>
                    }
                    {this.state.showProgressBar ? <ProgressBar/> : null}
                    {(this.state.activeSection != 'peer2cash' && this.state.activeSection != 'peer2card') &&
                    <div className={`${this.state.showProgressBar ? 'ui-title-without-black-bg' : 'ui-title'}`}>
                        {this.state.activeSection === 'dashboard'
                            ? this.renderCoinIconBlock()
                            : translate('APP_TITLE.' + this.state.activeSection.toUpperCase())
                        }
                        {this.state.activeSection === 'dashboard'
                            ? this.renderCoinsPanel(_items)
                            : null
                        }
                        {this.state.activeSection === 'dashboard'
                            ? this.renderCoinsPanelOverlay()
                            : null
                        }
                    </div>
                    }

                    {(this.state.activeSection == 'peer2cash' || this.state.activeSection == 'peer2card') &&
                    <div>
                        <div className="ui-title-background">&nbsp;</div>
                    </div>
                    }

                </div>
                {
                <div className="app-main">
                    {this.renderMenu()}
                    {this.state.displayMenu ? <div className="overlay-menu" onClick={this.toggleMenu}></div> : null}
                </div>
                }
            </div>
        )
    };

    toggleProgressBar = isVisible => {
        if ((isVisible !== null) && (isVisible !== undefined)) {
            this.setState({showProgressBar: isVisible})
        } else {
            this.setState({showProgressBar: !this.state.showProgressBar})
        }
    };

    goToLoginPage() {
        this.setState({
            history: this.state.activeSection,
            activeSection: 'login'
        })
    }

    goToDashboard() {
        this.setState({
            displayMenu: false,
            history: 'dashboard',
            activeSection: 'dashboard',
        }, () => {
            this.dashboardRefresh();
            this.scrollToTop();
        });
    }

    goToAddCoinPage() {
        this.setState({
            history: this.state.activeSection,
            activeSection: 'addcoin'
        })
    }

    goToCreateSeedPage() {
        this.setState({
            history: this.state.activeSection,
            activeSection: 'create-seed',
            coins: {},
        }, () => {cleanStoredWalletData(); })
    }

    goToCreateRecoverSeedPage() {
        this.setState({
            history: this.state.activeSection,
            activeSection: 'create-recover-seed',
            coins: {},
        }, () => {cleanStoredWalletData()})
    }

    updateApplicationStyle() {
        let classList = document.querySelector('body').classList;
        if (!this.state || !this.state.activeSection || this.state.activeSection === '' || this.state.activeSection === ' ' || this.state.activeSection === 'splash' || this.state.activeSection === 'login') {
            classList.remove('application-pages');
            classList.add('login-splash-pages')
        } else {
            classList.remove('login-splash-pages');
            classList.add('application-pages')
        }
    }

    updateSwipeListeners = () => {
        // remove listeners from previous DOM version
        this.removeSwipeListeners();
        this.addSwipeListener();
    };

    handleAuthMethodUpdate = newAuthMethod => {
        this.setState({authMethod: newAuthMethod},
            this.changeActiveSection('change_auth_method')
        );
    };

    render() {
        console.log('App', this.state.coins);
        console.log('App state', this.state);
        this.updateApplicationStyle();
        this.updateSwipeListeners();
        return (
            <div
                className="app-container"
                onClick={this.globalClick}>
                {this.state.activeSection === 'login' || this.state.activeSection === 'splash' ? null : this.renderApplicationHeader()}
                {this.state.proxyError && <div className="app-main">
                    <div className="con-error">
                        <i className="fa fa-warning error"></i> <span
                        className="error">{translate('DASHBOARD.PROXY_ERROR')}</span>
                    </div>
                    <div className="form proxy">
                        <div
                            onClick={this.retryProxy}
                            className="group-retry">
                            <img src="/images/antenna.svg" className="img-connection-retry"/>
                            <div className="warning-title-retry">{translate('API.NETWORK_ERROR_TITLE')}</div>
                            <div className="warning-description-retry">{translate('API.NETWORK_ERROR_MSG')}</div>
                            <div className="btn-inner-retry">
                                <button type="button" className="sync-btn-retry">
                                    <img className="sync-image-retry" src="/images/template/transactions/sync_icon.svg"/>{translate('DASHBOARD.RETRY').toUpperCase()}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>}
                {!this.state.proxyError &&
                <div className={'app-main' + (this.state.activeSection === 'dashboard' ? ' title-with-image' : '')}>
                    {this.state.activeSection === 'splash' &&
                    <SplashScreen {...this.state}
                        goToLogin={this.goToLoginPage}
                        goToCreateSeedPage={this.goToCreateSeedPage}
                        goToCreateRecoverSeedPage={this.goToCreateRecoverSeedPage}
                        goToAddCoin={this.goToAddCoinPage}
                    />
                    }
                    {this.state.activeSection === 'login' && (this.state.activeSection !== 'pin' || this.state.activeSection !== 'offlinesig') &&
                    <Login
                        {...this.state}
                        loginAfterSelectCoin={this.loginAfterSelectCoin}
                        goToCreateSeedPage={this.goToCreateSeedPage}
                        goToCreateRecoverSeedPage={this.goToCreateRecoverSeedPage}
                        goToAddCoin={this.goToAddCoinPage}/>
                    }
                    {this.state.activeSection === 'create-recover-seed' &&
                    <CreateRecoverSeed
                        {...this.state}
                        login={this.login}
                        changeActiveSection={this.changeActiveSection}/>
                    }
                    {this.state.activeSection === 'create-seed' &&
                    <CreateSeed
                        {...this.state}
                        login={this.login}
                        changeActiveSection={this.changeActiveSection}/>
                    }
                    {this.state.activeSection === 'send' &&
                    <SendCoin
                        {...this.state}
                        sendtx={this.props.actions.sendtx}
                        goToDashboard={this.goToDashboard}
                        dashboardRefresh={this.dashboardRefresh}
                        scrollToTop={this.scrollToTop}
                        changeActiveSection={this.changeActiveSection}
                        toggleProgressBar={this.toggleProgressBar}
                        getBtcFees={this.getBtcFees}/>
                    }
                    {this.state.activeSection === 'addcoin' &&
                    <AddCoin
                        {...this.state}
                        addCoin={this.addCoin}
                        login={this.loginAfterSelectCoin}
                        changeActiveSection={this.changeActiveSection}/>
                    }
                    {this.state.activeSection === 'manage_coins' &&
                    <ManageCoins
                        {...this.state}
                        addCoins={this.addCoins}
                        changeActiveSection={this.changeActiveSection}/>
                    }
                    {this.state.conError && this.state.activeSection === 'dashboard' &&
                    <ServerSelect
                        {...this.state}
                        dashboardRefresh={this.dashboardRefresh}
                        getServersList={this.props.actions.getServersList}
                        setDefaultServer={this.props.actions.setDefaultServer}/>
                    }
                    {this.state.auth &&
                    this.state.activeSection === 'dashboard' &&
                    !this.state.proxyError &&
                    <Transactions
                        {...this.state}
                        toggleProgressBar={this.toggleProgressBar}
                        loadMoreTransactions={this.loadMoreTransactions}
                        dashboardRefresh={this.dashboardRefresh}
                        changeActiveSection={this.changeActiveSection}/>
                    }
                    {!this.state.auth &&
                    this.state.activeSection === 'pin' &&
                    <Pin changeActiveSection={this.changeActiveSection}/>
                    }
                    {this.state.auth &&
                    this.state.activeSection === 'recovery' &&
                    <Recovery {...this.state} />
                    }
                    {this.state.auth &&
                    this.state.activeSection === 'recovery-keys' &&
                    <RecoveryKeys {...this.state} />
                    }
                    {this.state.auth &&
                    this.state.activeSection === 'overview' &&
                    <Overview
                        {...this.state}
                        overview={this.state.overview}
                        dashboardRefresh={this.dashboardRefresh}
                        switchCoin={this.switchCoin}
                        changeActiveSection={this.changeActiveSection}
                        toggleMenuOption={this.toggleMenuOption}/>
                    }

                    {this.state.auth &&
                    this.state.activeSection === 'peer2cash' &&
                    <Peer2Cash
                        {...this.state}
                        overview={this.state.overview}
                        switchCoin={this.switchCoin}
                        changeActiveSection={this.changeActiveSection}
                        toggleMenuOption={this.toggleMenuOption}/>
                    }
                    {this.state.auth &&
                    this.state.activeSection === 'peer2card' &&
                    <Peer2Card
                        {...this.state}
                        overview={this.state.overview}
                        switchCoin={this.switchCoin}
                        changeActiveSection={this.changeActiveSection}
                        toggleMenuOption={this.toggleMenuOption}/>
                    }

                    {this.state.activeSection === 'settings' &&
                    <Settings
                        {...this.state}
                        setLanguage={this.setLanguage}
                        setCurrency={this.setCurrency}
                        onLogout={this.logout}
                        onRecoveryOptions={() => this.changeActiveSection('recovery_options')}
                        updateAuthMethod={this.handleAuthMethodUpdate}
                    />
                    }
                    {this.state.auth &&
                    this.state.activeSection === 'about' &&
                    <About
                        {...this.state}
                        overview={this.state.overview}
                        switchCoin={this.switchCoin}
                        changeActiveSection={this.changeActiveSection}
                        toggleMenuOption={this.toggleMenuOption}/>
                    }
                    {this.state.auth && this.state.activeSection === 'change_auth_method' &&
                    <ChangeAuthMethod
                        {...this.state}
                        authMethod={this.state.authMethod}
                        backToSettings={() => {this.setState({activeSection: 'settings', history: null})}}
                    />
                    }
                    {this.state.auth && this.state.activeSection === 'recovery_options' &&
                    <RecoveryOptions
                        {...this.state}
                        changeActiveSection={this.changeActiveSection}
                    />
                    }

                    {this.state.auth && this.state.activeSection === 'support' &&
                    <SupportScreen
                        {...this.state}
                        changeActiveSection={this.changeActiveSection}
                    />
                    }
                </div>
                }
                <ToastContainer store={ToastStore} position={ToastContainer.POSITION.BOTTOM_CENTER} className="toast-message" />
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        keys: state.keys,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch),
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(App);
