import {ToastStore} from "../lib/react-toast";

export const LOCAL_STORAGE_ITEM_SEED = 'seed';
export const LOCAL_STORAGE_ITEM_COINS = 'coins';
export const LOCAL_STORAGE_ITEM_HIDE_WALLETS = 'hide_wallets';

export const maskPubAddress = (pub) => {
    // keep 3 first and 3 last chars unmasked
    let masked = '';

    for (let i = 0; i < pub.length - 3 * 2; i++) {
        masked = masked + '*';
    }

    return pub[0] + pub[1] + pub[2] + masked + pub[pub.length - 3] + pub[pub.length - 2] + pub[pub.length - 1];
}

export const setLocalStorageVar = (name, json) => {
    const _json = JSON.stringify(json);

    localStorage.setItem(name, _json);
}

export function getLocalStorageVar(name) {
    const _var = localStorage.getItem(name);

    if (_var) {
        const _json = JSON.parse(_var);

        return _json;
    } else {
        return null;
    }
}

export const removeLocalStorageItem = (itemName) => {
    localStorage.removeItem(itemName)
};

export const cleanStoredWalletData = () => {
    removeLocalStorageItem(LOCAL_STORAGE_ITEM_SEED);
    removeLocalStorageItem(LOCAL_STORAGE_ITEM_COINS);
    removeLocalStorageItem(LOCAL_STORAGE_ITEM_HIDE_WALLETS);
};

export const convertURIToImageData = (URI) => {
    return new Promise((resolve, reject) => {
        if (URI === null) {
            return reject();
        }

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const image = new Image();

        image.addEventListener('load', () => {
            canvas.width = image.width;
            canvas.height = image.height;
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            resolve(context.getImageData(0, 0, canvas.width, canvas.height));
        }, false);

        image.src = URI;
    });
};

export const coinsList = [

    'PGT',
    'KMD',
    'BTC',

    'BCH',
    'DASH',
    'DOGE',
    'DGB',
    'EQLI',
    'GAME',
    'LTC',
    'OOT',
    'SMART',

    'SUQA',

    'VRSC',
    'VIA',
    'QTUM',
    'ZEC',
    'ZILLA',

    'PPC',
    'TPAY',
    'GRS',
    'PIVX',
    'XVG',

];

export const copyToClipboard = str => {
    const el = document.createElement('textarea');
    el.value = str;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
};

export const isUSD = currency => {
    return currency && currency.toUpperCase() === 'USD';
};

export const getPriceForCurrency = (currency, priceList) => {
    if (priceList.hasOwnProperty(currency)) {
        return priceList[currency].price
    }
    return 0;
};

export const getFiatCurrenciesLabels = priceList => {
    let currencyKeys = Object.keys(priceList);
    let currencyValues = Object.values(priceList);
    let currenciesLabels = [];
    for (let i = 0; i < currencyValues.length; i++) {
        if (currencyValues[i].type === 'fiat') {
            currenciesLabels.push(currencyKeys[i]);
        }
    }
    return currenciesLabels;
};

export const formatBalanceValue = (balanceValue, toFixedNumber = 4) => {
    if (balanceValue) {
        let stringValue = balanceValue.toString();
        let values = stringValue.split('.');
        let length = values && values.length > 1 ? values[1].length : values[0];
        if (length <= 2) {
            return parseFloat(balanceValue);
        }
    }
    return parseFloat(Number(balanceValue ? balanceValue : 0).toFixed(toFixedNumber));
};

const SETTINGS_SAVED_MSG_TIMEOUT = 5000;
let currentDate = +new Date();

export const showToastInfo = (message, timeout = SETTINGS_SAVED_MSG_TIMEOUT) => {
    if (+new Date() > currentDate + timeout) {
        ToastStore.info(message, timeout, "toast-message");
        currentDate = +new Date();
    }
};

