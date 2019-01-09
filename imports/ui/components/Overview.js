import React from 'react';

import translate from '../translate/translate';
import {ToastContainer, ToastStore} from "../lib/react-toast";
import {formatBalanceValue, getLocalStorageVar, isUSD, setLocalStorageVar} from "../actions/utils";

class Overview extends React.Component {
    constructor() {
        super();
        this.state = {
            showWalletsWithMoney: getLocalStorageVar('hide_wallets'),
        };
    }

    toggleEmptyWallets = () => {
        this.setState({showWalletsWithMoney: !this.state.showWalletsWithMoney},
            setLocalStorageVar('hide_wallets', !this.state.showWalletsWithMoney)
        );
    };

    renderOverview() {
        const {showWalletsWithMoney} = this.state;
        let {baseCurrency} = this.props;
        if (this.props.overview) {
            const _overview = showWalletsWithMoney
                ? this.props.overview.filter(wallet => (wallet && wallet.balance > 0))
                : this.props.overview;
            console.log('_overview',_overview)
            let _items = [];
            let _totalBaseCurrencyBalance = 0;
            let _totalUSDBalance = 0;

            for (let i = 0; i < _overview.length; i++) {
                _totalBaseCurrencyBalance += !isNaN(_overview[i].balanceBaseCurrency) ? _overview[i].balanceBaseCurrency : 0;
                _totalUSDBalance += !isNaN(_overview[i].balanceUSD) ? _overview[i].balanceUSD : 0;
            }

            for (let i = 0; i < _overview.length; i++) {
                let shouldNotShowUsd = ['TYSLIN'].find(e => {
                    if (_overview[i] && _overview[i].coin && e === _overview[i].coin.toUpperCase()) {
                        return true;
                    } else {
                        return false;
                    }
                });

                let currentCoin = _overview[i] && _overview[i].coin ? _overview[i].coin.toUpperCase() : null;
                if (!currentCoin) {
                    continue;
                }
                let nativeValue = _overview[i].balance;
                let realCurrencyValue = formatBalanceValue(isUSD(baseCurrency) ? _overview[i].balanceUSD : _overview[i].balanceBaseCurrency);

                let usdPricePerItem = _overview[i].usdPricePerItem;
                let selectedCurPricePerItem = _overview[i].baseCurrencyPricePerItem;
                _items.push(
                    <div key={`overview-coins-${_overview[i].coin}`} className="overview-coin"
                         onClick={() => this.props.switchCoin(_overview[i].coin, true)}>
                        <div className="coin-icon">
                            <img src={`/images/cryptologo/${_overview[i].coin}.svg`}/>
                            <span> {currentCoin}</span>
                        </div>
                        <div className="coin-details">
                            <div className="coin-balance">
                                {!isNaN(nativeValue) && nativeValue !== 0.00 ? formatBalanceValue(nativeValue) : 0}
                            </div>
                            {!shouldNotShowUsd
                                ? <div>
                                    <div className="coin-balance-usd">
                                        {realCurrencyValue > 0.00 ? realCurrencyValue : null}
                                        <span> {realCurrencyValue && realCurrencyValue > 0 ? baseCurrency : null}</span>
                                    </div>
                                    <div className="coin-balance-rate">
                                        {isUSD(baseCurrency) && usdPricePerItem > 0
                                            ? formatBalanceValue(usdPricePerItem) : null}
                                        {!isUSD(baseCurrency) && selectedCurPricePerItem > 0
                                            ? formatBalanceValue(selectedCurPricePerItem) : null}
                                        <span> {isUSD(baseCurrency) && usdPricePerItem
                                        || !isUSD(baseCurrency) && selectedCurPricePerItem > 0? baseCurrency : null}</span>
                                    </div>
                                </div>
                                : null}
                        </div>
                    </div>
                );
            }

            return (
                <div>
                    <div className="total-coins">
                        <div className="coins-value">
                            {formatBalanceValue(isUSD(baseCurrency) ? _totalUSDBalance : _totalBaseCurrencyBalance)}
                        <span> {baseCurrency}</span></div>
                    </div>
                    <div className="buttons-block">
                        <img src={'/images/manage_coins_icon.svg'} className="button-left" onClick={() => this.props.changeActiveSection('manage_coins')}/>
                        <img src={!this.state.showWalletsWithMoney ? '/images/hide_balance_icon.svg' : '/images/show_balance_icon.svg'} className="button-right" onClick={() => this.toggleEmptyWallets()}/>
                    </div>
                    <div className="coins-container">
                        {_items}
                    </div>
                </div>
            );
        } else {
            return (
                null
            );
        }
    }

    render() {
        return (
            <div className="overview-ui">
                <div className="home">
                    {this.props.overview === 'error' &&
                    <div className="con-error">
                        <i className="fa fa-warning error"></i> <span
                        className="error">{translate('OVERVIEW.PRICES_ERROR')}</span>
                    </div>
                    }
                    {this.props.overview !== 'error' &&
                    <div className="home-inner">
                        {this.renderOverview()}
                    </div>
                    }
                </div>
                <ToastContainer store={ToastStore} position={ToastContainer.POSITION.BOTTOM_CENTER}
                                className="toast-message"/>
            </div>
        );
    }
}

export default Overview;
