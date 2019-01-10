![Pungo Token](https://i.ibb.co/T0cFLpx/token-regular-small.png)

# Pungo Wallet

_This readme is WIP_

Mobile wallet implementation.

## Development Resources

- PungoToken Website: [https://pungotoken.com](https://pungotoken.com/)
- PungoToken Blockexplorer: [https://explorer.pungotoken.build](https://explorer.pungotoken.com)
- PungoToken Telegram: [https://t.me/pungotalk](https://t.me/pungotalk)
- PungoToken Node Addresses:  190.114.254.103, 190.114.254.104
- PungoToken Electrum Servers Addresses: agama.komodo.build:10001 agama2.komodo.build:10001

## On development process

We should limit the number of changes in existing code in `imports` folder to keep general source code in sync with original repository.

Instead we should create and import code in new files.

## Dependencies

Required software:

- install nodejs https://nodejs.org/en/download/package-manager/
- install npm: https://www.npmjs.com/get-npm
- install meteor: https://www.meteor.com/install

Install required packages for linux:

```sh
# install nodejs
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y build-essential

# update npm
npm install npm@latest -g

# install meteor
curl https://install.meteor.com/ | sh
```

## How to setup development environment

### Adding required code

To build an app or to run a web version you should add required information to code:

- add electrum servers to `./imports/ui/conf/electrum-servers.js` file;
- add proxy server for Electrum server to `./imports/ui/actions/proxyServer.js` file;
- add some access rules if needed for your resources for Meteor to `./mobile-config.js` file;
- if you need coin price provider / price converter (for examlpe www.atomicexplorer.com)- add it to `./imports/ui/actions/actions.js`

### Setup for local development of web browser version

Local development for browser version, with live reload on changes.

Setup repository and start live development of web browser version:

```sh
git clone git@github.com:pungotoken/pungo-wallet.git
cd pungo-wallet

meteor update

npm install
meteor run --port=3002
```


---

### Running on Android, building and development

Further reading https://www.meteor.com/tutorials/blaze/running-on-mobile

// install java8, don't install java9 it won't work with meteor 1.6.x

```sh
meteor install-sdk android
meteor add-platform android

# running in the emulator
meteor run android

# running on the device
meteor run android-device
```

---

### Running on iOS, building and development (Mac Only)

Further reading https://www.meteor.com/tutorials/blaze/running-on-mobile

```sh
meteor install-sdk ios
meteor add-platform ios

# running in the emulator
meteor run ios

# running on the device (requires apple developer account)
meteor run ios-device
```

---

## How to build production static web version

..


```
meteor add-platform android

meteor build build --server=localhost

sign apk with your key
```

## How to live debug on android

1. Enable development mode on your android device
2. Connect your device via a usb cable to your machine
3. Connect your device to the same wifi network as your machine

```
meteor run android-device
```

Meteor docs https://guide.meteor.com


## Development workflow: files structure

..


---


```
intall meteor 1.6.x
install npm
install nodejs
install java8, don't install java9 it won't work with meteor 1.6.x

git clone
cd to project's folder
meteor update
npm install

os specific (build):
install android studio
install android sdk 25.x
configure path env
```

## How to run local desktop version
meteor run --port=3002

## How to build an apk
meteor add-platform android

meteor build build --server=localhost

sign apk with your key

## How to debug with hot code push
enable dev mode on your android device

connect your device via a usb cable to your machine
connect your device to the same wifi network as your machine

meteor run android-device

refer to meteor docs https://guide.meteor.com

## How to verify jar/apk signature

```sh
jarsigner -verify -certs -verbose filename.apk
```

## How to sign apk
create signing key

```sh
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 release-unsigned.apk agama-app
```