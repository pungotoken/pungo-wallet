import React from 'react';
import {secondsToString} from './../lib/agama-wallet-lib/build/time';
import {explorerList,} from './../lib/agama-wallet-lib/build/coin-helpers';
import translate from '../translate/translate';
import QRCode from 'qrcode.react';
import {ToastContainer, ToastStore} from './../lib/react-toast';
import {copyToClipboard, formatBalanceValue, isUSD, showToastInfo} from "../actions/utils";

class Transactions extends React.Component {
    constructor() {
        super();
        this.state = {
            toggledTxDetails: null,
            showQR: false,
        };
        this.toggleTxDetails = this.toggleTxDetails.bind(this);
        this.openExternalURL = this.openExternalURL.bind(this);
        this.isInterestDefined = this.isInterestDefined.bind(this);
        this.toggleQR = this.toggleQR.bind(this);
        this.toggleHome = this.toggleHome.bind(this);
        this.showClaimButton = this.showClaimButton.bind(this);

        this.copyKey = this.copyKey.bind(this);
    }

    copyKey() {
        var copyText = this.props.address;
        copyToClipboard(copyText);

        showToastInfo(translate('SETTINGS.COPIED_TO_CLIPBOARD'), 2000);
    }

    toggleHome() {
        this.setState({
            showQR: false,
        });
        this.props.dashboardRefresh();
    }

    toggleQR() {
        this.setState({
            showQR: !this.state.showQR,
        });
    }

    showClaimButton() {
        if (this.props.coin === 'kmd' &&
            this.props.balance &&
            this.props.balance.interest &&
            this.props.balance.interest > 0) {
            return true;
        }
    }

    showSendButton() {
        if (this.props.balance &&
            this.props.balance.balance &&
            this.props.balance.balance > 0) {
            return true;
        }
    }

    isInterestDefined() {
        if (this.props.balance &&
            this.props.balance.interest &&
            this.props.balance.interest > 0) {
            return true;
        }
    }

    componentWillReceiveProps(props) {
        if (props.coin !== this.props.coin) {
            this.setState({
                toggledTxDetails: null,
                showQR: false
            });
        }
    }

    toggleTxDetails(index) {
        this.setState({
            toggledTxDetails: index === this.state.toggledTxDetails ? null : index,
        });
    }

    openExternalURL(url) {
        window.open(url, '_system');
    }

    renderTxAmount(tx, amountOnly) {
        let _amountNegative;

        if ((tx.category === 'send' ||
            tx.category === 'sent') ||
            (tx.type === 'send' ||
                tx.type === 'sent')) {
            _amountNegative = -1;
        } else {
            _amountNegative = 1;
        }

        if (Number(tx.interest) === Number(tx.amount)) {
            _amountNegative = -1;
        }

        let number = tx.amount * _amountNegative;
        return (
            <span>
        {Number(tx.interest) === Number(tx.amount) &&
        <span>+</span>
        }
                {formatBalanceValue(number) || translate('TRANSACTIONS.UNKNOWN')}
                {/*{Number(tx.amount) === 0 ? '' : ''}*/}
                {tx.interest &&
                !amountOnly &&
                (Number(tx.interest) !== Number(tx.amount)) &&
                <div className="tx-interest">+{Number(Math.abs(tx.interest)).toFixed(4)}</div>
                }
      </span>
        );
    };

    getCurrentWallet = (overview, coin) => {
        return overview && overview.find(item => item.coin === coin)
    };

    renderSendReceiveBtn() {
        return (
            <div className='send-receive-block'>
                <div className="buttons-block">
                    <button disabled={!this.showSendButton()}  type="button" onClick={() => this.props.changeActiveSection('send')}>
                        <img src={'/images/send_icon.svg'} className="button-center"/>
                    </button>
                    <button type="button"  onClick={this.toggleQR}>
                        <img src={'/images/receive_icon.svg'} className="button-center"/>
                    </button>
                    <button type="button" onClick={this.toggleHome} >
                        <img src={'/images/sync_icon.svg'} className="button-center"/>
                    </button>
                    <button type="button" onClick={this.copyKey} >
                        <img src={'/images/copy_icon.svg'} className="button-center"/>
                    </button>
                </div>
                {this.state.showQR &&
                <div className="qr-code-container">
                    <div className="address-name">{this.props.address}</div>
                    <div className="receive-qr">
                        {this.props.address &&
                        <div>
                            <QRCode value={this.props.address} size={198}/>
                        </div>
                        }
                    </div>
                </div>
                }
            </div>
        );
    }

    loadMoreTransactions = () => {
        const {loadMoreTransactions, toggleProgressBar} = this.props;
        toggleProgressBar(true);
        loadMoreTransactions();
    };

    shouldShowLoadMoreTransactionsButton = () => {
        const {transactions} = this.props;
        return transactions
            && transactions.length > 0
            && transactions.length % 10 === 0
    };

    render() {
        if (this.props.activeSection === 'dashboard') {
            const _transactions = this.props.transactions;
            let _items = [];

            console.log(this.props);

            console.log("---- ++++ transactions: ", _transactions);

            if (_transactions) {
                for (let i = 0; i < _transactions.length; i++) {
                    _items.push(
                        <div
                            onClick={ () => this.openExternalURL(`${explorerList[this.props.coin.toUpperCase()]}/tx/${_transactions[i].txid}`) }
                            className={`item ${_transactions[i].confirmations == 0 ? 'unconfirmed' : ''} ${_transactions[i].interest && Math.abs(_transactions[i].interest) > 0 || _transactions[i].type == "self" ? 'received' : _transactions[i].type}`} key={`transaction-${i}`}>
                            <div className="direction">
                                <div className="transaction-direction">
                                    <img className="transaction-arrow" src={`/images/template/transactions/${_transactions[i].type === 'received' || _transactions[i].type === 'self' ? 'in' : 'out'}_icon.svg`}/>
                                </div>
                            </div>
                            <div className="date">{secondsToString(_transactions[i].timestamp).toUpperCase()}</div>
                            <div className="amount-native">{this.renderTxAmount(_transactions[i])}</div>
                            <div className="right-arrow">
                                <img src="/images/template/transactions/rightarrow_icon.svg"/>
                            </div>
                        </div>
                    );
                }
            }

            const {coin, overview, baseCurrency} = this.props;
            let neededCoin = this.getCurrentWallet(overview, coin);
            let balanceUSD = neededCoin ? neededCoin.balanceUSD : 0;
            let balanceBaseCurrency = neededCoin ? neededCoin.balanceBaseCurrency : 0;
            let balance = neededCoin ? neededCoin.balance: 0;

            return (
                <div className="transactions-ui">
                    <div className="individualportfolio">
                        <div className="individualportfolio-inner">
                            <div className="coin-balance-container">
                                <div className="transaction-coin-details">
                                    <div className="transaction-coin-balance">
                                        {formatBalanceValue(balance)} <span> {this.props.coin.toUpperCase()}</span>
                                    </div>
                                    <div className="transaction-coin-balance-usd">
                                        {formatBalanceValue(isUSD(baseCurrency) ? balanceUSD : balanceBaseCurrency, 2)}
                                        <span> {baseCurrency}</span>
                                    </div>
                                </div>
                            </div>
                            {this.renderSendReceiveBtn()}
                            {!this.state.showQR &&
                            <div className="latest-transactions-container">
                                {this.props.loading &&
                                !this.props.transactions &&
                                !this.state.showQR &&
                                <div className="section-label">{translate('TRANSACTIONS.LOADING_HISTORY')}...</div>
                                }
                                {(_items && _items.length > 0 && !this.state.showQR) &&
                                <div className="transactions-list">
                                    {_items}
                                </div>
                                }
                                {this.shouldShowLoadMoreTransactionsButton()
                                    ? <div className="load-more-transactions" onClick={() => this.loadMoreTransactions()}>
                                        <img src="/images/load_more_transactions_icon.svg"/>
                                    </div>
                                    : null
                                }
                            </div>
                            }
                        </div>
                    </div>
                    
                    <ToastContainer store={ToastStore} position={ToastContainer.POSITION.BOTTOM_CENTER} className="toast-message" />
                </div>
            );
        }
    }
}

export default Transactions;
