import React from 'react';

import {coinsList} from '../actions/utils';
import translate from '../translate/translate';

class ManageCoins extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            coinsArray: [],
        };
        console.log('props.coins', props.coins);

        this.addCoin = this.addCoin.bind(this);
        this.saveCoins = this.saveCoins.bind(this);
    }

    componentWillMount() {
        this.setState({
            coinsArray: ManageCoins.findSelectedCoins(this.props.coins),
        })
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

    saveCoins() {
        let coinsArray = this.state.coinsArray;
        this.props.addCoins(coinsArray);

        if (Object.keys(this.props.coins).length) {
            this.props.changeActiveSection(this.props.auth ? 'overview' : 'create-seed');
        } else {
            this.props.changeActiveSection(this.props.auth ? 'overview' : 'login');
        }
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

    renderCoins() {
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
                    className='overview-coin'>
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

    render() {
        if (this.props.activeSection !== 'create-seed' &&
            this.props.activeSection !== 'pin' &&
            this.props.activeSection !== 'offlinesig') {
            return (
                <div className="addcoin-ui">
                    <div className="home">
                        <div className="home-inner">
                            <p className="addcoin-label">{translate('SETTINGS.ACTIVATE_WALLETS_HINT')}</p>
                            <div className="overview-coins">{this.renderCoins()}</div>
                            <div className="buttons-block">
                                <img src={'/images/ok_icon.svg'} className="button-center" onClick={() => this.saveCoins()}/>
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

export default ManageCoins;