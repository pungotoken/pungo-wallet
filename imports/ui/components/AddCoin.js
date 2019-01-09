import React from 'react';

import {coinsList} from '../actions/utils';
import translate from '../translate/translate';

class AddCoin extends React.Component {
    constructor() {
        super();
        this.state = {
            multiSelect: {},
            coinsArray: []
        };
        this.addCoin = this.addCoin.bind(this);
        this.addCoins = this.addCoins.bind(this);
        this.toggleMultiSelectCoin = this.toggleMultiSelectCoin.bind(this);
    }

    toggleMultiSelectCoin(coin) {
        let multiSelect = this.state.multiSelect;

        if (multiSelect[coin]) {
            delete multiSelect[coin];
        } else {
            multiSelect[coin] = true;
        }

        this.setState({
            multiSelect,
        });
    }

    addCoin(coin) {
        let coinsArray = this.state.coinsArray;
        if (!coinsArray.includes(coin)) {
            this.setState({
                coinsArray: [...coinsArray, coin]
            })
        } else {
            this.setState({
                coinsArray: coinsArray.filter(c => c !== coin)
            })
        }
    }

    addCoins() {
        let coinsArray = this.state.coinsArray;
        for (let key in coinsArray) {
            this.props.addCoin(coinsArray[key])
        }

        if (Object.keys(this.props.coins).length) {
            // let seed = getLocalStorageVar('seed')

            // this should be rewritten when we'll have time
            this.props.login(window.__seed);
            window.__seed = null;

            // this.props.changeActiveSection('dashboard');
            // this.props.changeActiveSection(this.props.auth ? 'dashboard' : 'create-seed');
        } else {
            // no action if no coins are selected
            // this.props.changeActiveSection(this.props.auth ? 'dashboard' : 'login');
        }
    }

    _addCoin(coin) {
        if (coin === 'multi') {
            for (let key in this.state.multiSelect) {
                this.props.addCoin(key);
            }
        } else if (coin === 'kmd+chips') {
            this.props.addCoin('kmd');
            this.props.addCoin('chips');
        } else if (coin === 'kmd+revs+jumblr') {
            this.props.addCoin('kmd');
            this.props.addCoin('revs');
            this.props.addCoin('jumblr');
        } else if (coin === 'all') {
            for (let i = 0; i < coinsList.length; i++) {
                const key = coinsList[i];
                this.props.addCoin(key.toLowerCase());
            }
        } else {
            this.props.addCoin(coin);
        }

        if (Object.keys(this.props.coins).length) {
            this.props.changeActiveSection(this.props.auth ? 'overview' : 'create-seed');
        } else {
            this.props.changeActiveSection(this.props.auth ? 'overview' : 'login');
        }

        this.setState({
            multiSelect: {},
        });
    }

    renderCoins(singleSelect) {
        const isCoinSelected = (coin) => {
            return coinsArray.includes(coin) ? ' selected' : '';
        };

        let coinsArray = this.state.coinsArray;
        let _coins = this.props.coins;
        let _items = [];

        for (let i = 0; i < coinsList.length; i++) {
            const key = coinsList[i];

            const _coin = key.toLowerCase();

            _items.push(
                <div
                    onClick={() => this.addCoin(_coin)}
                    key={`overview-coins-${_coin}`}
                    className={'overview-coin' + (_coins[_coin] ? '' : '')}>
                    <div className={`btc ` + isCoinSelected(_coin)}>
                        <img
                            className="oval4"
                            src={`/images/cryptologo/${_coin}.svg`}/>
                    </div>
                    <div
                        className={`bitcoin ` + isCoinSelected(_coin)}>{key ? key.toUpperCase() : ''}</div>
                </div>
            );
        }

        return _items;
    }

    renderCoinShortcuts() {
        let _coins = this.props.coins;

        return (
            <div className="coins-list-shortcuts">
                <div
                    onClick={() => this.addCoin('kmd+chips')}
                    className="combination margin-left-25">
                    <img
                        className={_coins.kmd ? 'disabled' : ''}
                        src="/images/cryptologo/kmd.png"/>
                    <i className="fa fa-plus margin-left-15 margin-right-15"></i>
                    <img
                        className={_coins.chips ? 'disabled' : ''}
                        src="/images/cryptologo/chips.png"/>
                </div>
                <div
                    onClick={() => this.addCoin('kmd+revs+jumblr')}
                    className="combination margin-left-25">
                    <img
                        className={_coins.kmd ? 'disabled' : ''}
                        src="/images/cryptologo/kmd.png"/>
                    <i className="fa fa-plus margin-left-15 margin-right-15"></i>
                    <img
                        className={_coins.revs ? 'disabled' : ''}
                        src="/images/cryptologo/revs.png"/>
                    <i
                        className={_coins.jumblr ? 'disabled' : ''}
                        className="fa fa-plus margin-left-15 margin-right-15"></i>
                    <img src="/images/cryptologo/jumblr.png"/>
                </div>
                <div className="combination">
                    <button
                        className="btn btn-lg btn-primary btn-block ladda-button"
                        onClick={() => this.addCoin('all')}>
            <span className="ladda-label">
            {translate('ADD_COIN.ADD_ALL_COINS')}
            </span>
                    </button>
                </div>
            </div>
        );
    }

    render() {
        console.log('AddCoin', !Object.keys(this.props.coins).length);
        if (this.props.activeSection !== 'create-seed' &&
            this.props.activeSection !== 'pin' &&
            this.props.activeSection !== 'offlinesig') {
            return (
                <div className="addcoin-ui">
                    <div className="home">
                        <div className="home-inner">
                            {/* <h4 className="addcoin-header">{translate('LOGIN.CREATE_RECOVER_WALLET')}</h4> */}
                            <p className="addcoin-label">{translate('ADD_COIN.SELECT_WALLETS')}</p>
                            <div className="overview-coins">{this.renderCoins()}</div>

                            <div className="buttons-block">
                                <img src={'/images/ok_icon.svg'} className="button-center"
                                     onClick={() => this.addCoins()}/>
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else {
            return null;
        }
    }
}

export default AddCoin;