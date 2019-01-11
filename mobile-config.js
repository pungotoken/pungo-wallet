App.info({
  id: '...',
  version: '...',
  buildNumber: '...',
  name: '...',
  description: '...',
  author: '...',
  email: '...',
  website: '...'
});

// Set up resources such as icons and launch screens.
App.icons({
  // ios
  'app_store': 'app-assets/icons/app_store.png',
  'iphone': 'app-assets/icons/iphone.png',
  'iphone_2x': 'app-assets/icons/iphone_2x.png',
  'iphone_3x': 'app-assets/icons/iphone_3x.png',
  'ipad': 'app-assets/icons/ipad.png',
  'ipad_2x': 'app-assets/icons/ipad_2x.png',
  'ipad_pro': 'app-assets/icons/ipad_pro.png',
  // android
  'android_mdpi': 'app-assets/icons/48x48.png',
  'android_hdpi': 'app-assets/icons/64x64.png',
  'android_xhdpi': 'app-assets/icons/96x96.png',
  'android_xxhdpi': 'app-assets/icons/128x128.png',
  'android_xxxhdpi': 'app-assets/icons/256x256.png',
});

App.launchScreens({
});

// meteor rules
App.accessRule('https://fonts.gstatic.com');
App.accessRule('https://www.youtube.com');

// youtube image cdns
App.accessRule('https://youtube.com');
App.accessRule('https://i.ytimg.com');
App.accessRule('https://s.ytimg.com');

// electrum endpoints
App.accessRule('...');

// Electrum Proxy Servers
App.accessRule('...');

// atomic explorer
App.accessRule('https://www.atomicexplorer.com');

// coin explorers
// KMD
App.accessRule('https://www.kmdexplorer.io');
App.accessRule('https://kv.kmdexplorer.io');
// UTRUM
App.accessRule('http://explorer.utrum.io');
// Blocnation Token
App.accessRule('http://chain.blocnation.io');
App.accessRule('http://explorer.chainmakers.co');
// GLX coin
App.accessRule('http://glx.info');
// pearl pay
App.accessRule('http://explorer.prlpay.com');
// mshark
App.accessRule('https://mshark.kmdexplorer.io');
// KMD
App.accessRule('https://revs.kmdexplorer.io');
// Supernet
App.accessRule('https://supernet.kmdexplorer.io');
// DEX
App.accessRule('https://dex.kmdexplorer.io');
// pangea
App.accessRule('https://pangea.kmdexplorer.io');
// jumblr
App.accessRule('https://jumblr.kmdexplorer.io');
// bet
App.accessRule('https://bet.kmdexplorer.io');
// crypto
App.accessRule('https://crypto.kmdexplorer.io');
// hodl
App.accessRule('https://hodl.kmdexplorer.io');
// shark
App.accessRule('http://shark.kmdexplorer.ru');
// bots
App.accessRule('https://bots.kmdexplorer.io');
// mgw
App.accessRule('https://mgw.kmdexplorer.io');
// wlc
App.accessRule('https://wlc.kmdexplorer.io');
// chips
App.accessRule('http://chips.explorer.supernet.org');
// coqui
App.accessRule('https://explorer.coqui.cash');
App.accessRule('http://178.62.240.191');
// mnz
App.accessRule('https://mnz.kmdexplorer.io');
// btch
App.accessRule('https://btch.kmdexplorer.io');
App.accessRule('https://blockchain.info');
// myhush
App.accessRule('https://explorer.myhush.org');
// pizza
App.accessRule('http://pizza.komodochainz.info');
// beer
App.accessRule('http://beer.komodochainz.info');
// ninja
App.accessRule('https://ninja.kmdexplorer.io');
App.accessRule('http://88.99.226.252');
// qtum
App.accessRule('https://explorer.qtum.org');
// denarius
App.accessRule('http://denarius.name');
App.accessRule('https://live.blockcypher.com');
App.accessRule('https://bchain.info');
// viacoin
App.accessRule('https://explorer.viacoin.org');
// vertcoin
App.accessRule('http://explorer.vertcoin.info');
// namecha
App.accessRule('https://namecha.in');
App.accessRule('https://digiexplorer.info');
App.accessRule('http://ex.crownlab.eu');
App.accessRule('https://blockexplorer.gamecredits.com');
// Bitcoin Gold
App.accessRule('https://btgexplorer.com');
// bitcoincash
App.accessRule('https://bitcoincash.blockexplorer.com');
// zclmine
App.accessRule('http://explorer.zclmine.pro');
// snowgem
App.accessRule('https://explorer.snowgem.org');
// myriad
App.accessRule('https://myriadexplorer.com');
App.accessRule('http://explorer.bitcore.cc');
// bitcoinz
App.accessRule('https://explorer.bitcoinz.site');
App.accessRule('http://www.fuzzbawls.pw');
// sibcoin
App.accessRule('https://chain.sibcoin.net');
// Zcash
App.accessRule('https://explorer.zcha.in');
App.accessRule('https://explorer.coinpayments.net');
// mining pool
App.accessRule('https://prohashing.com');
// faircoin
App.accessRule('https://chain.fair.to');
App.accessRule('https://explorer.feathercoin.com');
App.accessRule('https://chainz.cryptoid.info');
// GBX coin
App.accessRule('http://explorer.gobyte.network');
// fujicoin
App.accessRule('http://explorer.fujicoin.org');
// zilla coin
App.accessRule('http://zilla.explorer.dexstats.info');
// zcoin
App.accessRule('https://explorer.zcoin.io');

// Set PhoneGap/Cordova preferences.
App.setPreference('BackgroundColor', '0xFFF68D1F'); // 0x45485FFF

// disable splashscreen
App.setPreference('SplashScreenDelay', '0');
App.setPreference('ShowSplashScreen', 'false');

App.setPreference('SplashScreen', 'CDVSplashScreen');

/*App.setPreference('HideKeyboardFormAccessoryBar', true);
App.setPreference('Orientation', 'default');
App.setPreference('Orientation', 'all', 'ios');*/


App.accessRule('data:*');
// App.accessRule('data:*', { type: 'navigation' });






