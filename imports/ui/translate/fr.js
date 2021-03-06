const lang = {
    EN: {
        API: {
            NO_UTXO_ERR: 'UTXO(s) indisponible ou erreur de connexion',
            CANT_BROADCAST_TX_ERR: 'La transaction ne peut pas être transmise',
            BAD_TX_INPUTS_SPENT_ERR: 'Des entrées de transaction incorrectes ont été utilisées',
            CON_ERROR: 'Erreur de connexion Veuillez réessayer.',
            NETWORK_ERROR_TITLE: 'Ops!',
            NETWORK_ERROR_MSG: 'Il semble y avoir des problèmes de réseau. Assurez-vous de disposer de la connexion Internet et réessayez.',
        },
        SETTINGS: {
            SAVED: 'Les paramètres ont été sauvegardés',
            AUTOLOCK_TIMEOUT: 'temps de attente pour le auto-verrouillage',
            MINUTES: 'Minutes',
            SAVE: 'Sauvegarder',
            RECOVER: 'Récupérer le mot de passe',
            RECOVER_PRIVATE_KEYS: 'RÉCUPÉRER CLÉS PRIVÉES',
            LOGOUT: 'déconnecter',
            REQUIRE_PIN_CONFIRM: 'Un code PIN est requis pour confirmer la transaction.',
            ACTIVATE_WALLETS_HINT: 'Sélectionnez les bourses que vous souhaitez activer',
            COPIED_TO_CLIPBOARD: 'Copié dans le presse-papier',
            REQUIRE_PASSWORD_CONFIRM: 'Demandez un mot de passe pour confirmer la transaction',
            AUTHORIZATION_METHOD: 'Méthode autorisation',
            CHANGE_PASSWORD_HINT: 'Changer le mot de passe',
            CHANGE_PIN_HINT: 'Changer PIN',
            CHANGE_LANGUAGE_HINT: 'Langue',
            CHANGE_CURRENCY_HINT: 'Devise préférée',
            REQUIRE_AUTH_CONFIRM: 'Demandez autorization pour confirmer transactions',
            DISCLAIMER_MSG_ABOUT: 'Note: all FIAT quantities are approximated using external price feed sources',
        },
        RECOVERY: {
            PROVIDE_YOUR_PIN: 'Entrez votre code PIN à déverrouiller',
            PROVIDE_YOUR_PASSWORD: 'Entrez votre mot de passe pour déverrouiller',
            PROVIDE_YOUR_PIN_KEYS: 'Entrez votre PIN pour déverrouiller',
            PROVIDE_YOUR_PASSWORD_KEYS: 'Introduce tu contraseña para desbloquear',
            SHOW: 'Montre',
            RECOVER_WALLET_HINT: 'Utilisez cette liste secrète de mots pour récupérer le portefeuille Pungo sur des autres appareils',
        },
        PIN: {
            SAVE: 'Sauvegarder',
            SEED_IS_ENCRYPTED: 'La liste de 24 mots est cryptée avec le code PIN. Utilisez le code PIN pour entrer ou signer une transaction.',
            PROVIDE_A_PASSPHRASE: 'Fournir votre mot de passe',
            PROVIDE_A_SEED: 'Fournissez un mot de passe et entrez le code PIN à 6 chiffres dans le formulaire ci-dessous.',
        },
        OVERVIEW: {
            PRICES_ERROR: "l'information sur les prix n'est pas disponible",
            TOTAL_VALUE: 'Valeur Totale',
            PER_COIN: 'par devise',
            YOUR_COINS: 'Vos Devises',
            MANAGE_COINS_BTN: 'gérer les devises',
        },
        OFFLINE: {
            TX_SIG_FAIL: "n'a pas signé la transaction",
            CONFIRM: 'Confirmer',
            TX_PIN_CONFIRM: 'Pour confirmer la transaction, entrez le code PIN et appuyez sur le bouton ci-dessous.',
            OFFLINE_TX_SIG: 'Signature de la Transaction Hors ligne',
            SEND_FROM: 'Envoyer de',
            SEND_TO: 'Envoyer à',
            AMOUNT: 'Montant',
        },
        LOGIN: {
            OR_WIF: 'o WIF',
            CREATE_A_PIN: 'Créez une épingle pour le registre.',
            SIGN_IN_TO_YOUR_ACC: 'Enregistrez votre compte Pungo',
            SIGN_IN: "S'inscrire",
            DONE: 'Fait',
            GENERATE: 'Générer',
            PASTE: 'Coller',
            PIN_ACCESS: 'Accès PIN',
            WRONG_PIN: '¡PIN incorrect!',
            LOGIN: 'Entrer',
            PASSPHRASE_ACCESS: "Mot de passe d'accès",
            ENTER_PASSPHRASE: 'Entrez un mot de passe',
            OVERRIDE_PIN: 'Créer / Annuler un code PIN',
            ENTER_6_DIGIT_PIN: 'Entrez un code PIN (6 chiffres minimum)',
            ENTER_PIN: 'Entrez un code PIN',
            PIN_TOO_SHORT: 'Le code PIN est trop court!',
            I_CONFIRM_I_SAVED_SEED: "Je confirme que j'ai sauvegardé la graine",
            PLEASE_MAKE_SURE_TO: "Assurez-vous de l'écrire et de le conserver dans un endroit sûr!",
            THIS_IS_YOUR_NEW_SEED: 'Ceci est votre nouvelle graine',
            CREATE_RECOVER_WALLET: 'Créer / Récupérer un Portefeuille',
            CONFIRMATION_REQUIRED: 'Confirmation requise',
            CREATE_WALLET: 'Créer un Portefeuille',
            RECOVER_WALLET: 'Récupérer Portefeuille',
            PASSPHRASE_HINT: 'Coller un mot de passe existant ou WIF',
            NEW_PIN_HINT: 'Entrez un nouveau code PIN pour accéder à votre portefeuille',
            GENERATE_NEW_PASSPHRASE_HINT: 'Générer un nouveau mot de passe',
            POPUP_WARNING_MSG: 'Avis',
            POPUP_WARNING_WIPE_WALLET: 'Si vous continuez, votre portefeuille actuelle sera supprimée. Tu es sûr?',
            WIPE_WALLET_ACTION_YES: 'Oui',
            WIPE_WALLET_ACTION_NO: 'Non',
            LOGIN_WITH_PIN_HINT: 'Entrez votre code PIN',
            SECURITY_ENCRYPTION_METHOD_PIN: 'PIN',
            SECURITY_ENCRYPTION_METHOD_PASSWORD: 'Mot de passe',
            SECURITY_ENCRYPTION_METHOD_HINT: 'Méthode de cryptage de sécurité',
            ENTER_6_CHARS_PASSWORD: 'Mot de passe (min. 6 car)',
            PASSWORD_TOO_SHORT: 'Mot de passe trop court',
            NEW_PASSWORD_HINT: 'Définir un nouveau mot de passe pour accéder à votre portefeuille',
            INTRODUCE_OLD_PIN_HINT: 'Introduire vieux PIN',
            INTRODUCE_NEW_PIN_HINT: 'Introduire nouveau PIN',
            CONFIRM_NEW_PIN_HINT: 'Confirmer noveuau PIN',
            INTRODUCE_OLD_PASSWORD_HINT: 'Introduire vieux mot de passe',
            INTRODUCE_NEW_PASSWORD_HINT: 'Definir noveuau mot de passe',
            CONFIRM_NEW_PASSWORD_HINT: 'Confirmer noveueu mot de passe',
            CONFIRM_HINT: 'Confirmer',
            CANCEL_HINT: 'Annuler',
            PASSWORDS_DO_NOT_MATCH: 'Les mots de passe ne correspondent pas',
            PINS_DO_NOT_MATCH: 'Les PINs ne correspondent pas',
            WRONG_PASSWORD: 'Mot de passe incorrect',
            ENTER_PASSWORD: 'Introduire mot de passe',
            LOGIN_WITH_PASSWORD_HINT: 'Connexion avec mot de passe',
            PIN_CODES_DONT_MATCH_HINT: 'Les codes PIN ne correspondent pas',
            RE_ENTER_6_DIGIT_PIN: 'Confirmer le PIN',
            PASSWORDS_DONT_MATCH_HINT: 'Les mots de passe ne correspondent pas',
            RE_ENTER_PASSWORD: 'Confirmer le mot de passe',
            OPEN_WALLET: 'Ouvrir le portefeuille',
            WARNING_CREATE_WALLET_MSG: 'Créer un nouveau portefeuille en générant une nouvelle liste de 24 mots',
            WARNING_RECOVER_WALLET_MSG: 'Récupérez votre portefeuille en insérant votre liste de 24 mots',
            WARNING_MSG: 'ATTENTION',
            WARNING_WIPE_DATA_MSG: 'Cela effacera toutes les données précédentes',
        },
        SEND: {
            TOTAL: 'Total',
            FEE: 'Commission',
            BTC_FEE_SLOW: 'Lente (60 min)',
            BTC_FEE_AVG: 'Moyenne (30 min)',
            BTC_FEE_FAST: 'Rapide (<30 min)',
            BTC_FEES_FETCHING: 'Extraction des données de commission btc ...',
            BTC_FEES_FETCHING_FAILED: 'Échec de récupération des données de commission btc. Réessayer dans 5s ...',
            SUCCESS: 'Le succès',
            TXID: 'ID de transaction',
            OPEN_IN_EXPLORER: 'Ouvrir dans le navigateur',
            ENTER_YOUR_PIN: 'Entrez votre code PIN',
            SEND: 'Envoyer',
            NEXT: 'Suivant',
            BACK: 'Derrière',
            SEND_FROM: 'Origine',
            SEND_TO: 'Envoyer à',
            SEND_ALL: 'Envoyer tout',
            ENTER_AN_ADDRESS: 'Entrez une adresse',
            AMOUNT: 'Montant',
            FILL_IN_DETAILS: 'Remplissez les détails',
            CONFIRM: 'Confirmer',
            TO: 'Envoyer à',
            WALLET_BALANCE: 'Balance de portefeuille',
            FROM: 'Origine',
            BALANCE: 'Balance',
            WARNING: 'Avis',
            WARNING_SPV_P1: 'Vos données de portefeuille ne sont vérifiées que par un seul serveur!',
            WARNING_SPV_P2: 'Si vous voulez toujours continuer, appuyez sur "Envoyer".',
            SPV_VERIFYING: 'Vérification des données de transaction',
            TX_RESULT: 'Résultat de la transaction',
            KEY: 'Mot de passe',
            INFO: 'Info',
            RESULT: 'Résultat',
            SUCCESS: 'réussi',
            PROCESSING_SM: 'traitement ...',
            PROCESSING_TX: 'Traitement de la transaction ...',
            ERROR: 'Erreur',
            MAKE_ANOTHER_TX: 'Envoyer un autre',
            NAN: "Ce n'est pas un nombre",
            TOO_MUCH: 'Le nombre est trop grand. Le montant Max. disponible est @template@',
            ADDRESS_IS_INCORECT: "L'adresse est incorrecte",
            QR_SCAN_ERR: "Impossible de déchiffrer l'image QR. Veuillez réessayer.",
            SCAN_QR: 'Scannez le code QR',
            COINS_AMOUNT_INFO_MSG: 'Le montant des pièces est inférieur aux frais de transaction',
            ENTER_YOUR_PASSWORD: 'Introduire mot de passe',
        },
        ADD_COIN: {
            ADD_ALL_COINS: 'Ajouter toutes les pièces',
            SHORTCUTS: 'Raccourcis',
            MULTI_SELECT: 'Multi-sélection',
            ADD_SELECTED_COINS: 'Ajouter les pièces sélectionnées',
            NEXT: 'Suivant',
            SELECT_WALLETS: 'Sélectionnez les portefeuilles que vous souhaitez activer',
        },
        BALANCE: {
            BALANCE: 'Balance',
            INTEREST: 'Récompenses',
        },
        DASHBOARD: {
            MY: 'Mon',
            ADDRESS: 'adresse',
            TRANSACTIONS: 'Transactions',
            BACK: 'Derrière',
            LOGOUT: 'Déconnecter',
            LOGIN: 'Entrer',
            LOCK: 'Bloquer',
            DASHBOARD: 'Panneau',
            SEND: 'Envoyer',
            RECEIVE: 'Recevoir',
            ADD_COIN: 'Ajouter monnaie',
            CREATE_SEED: 'Créer une liste de 24 mots',
            CON_ERROR: "Erreur de connexion. S'il vous plaît, essayez un autre serveur @template@.",
            SWITCH_SERVER: 'Changer',
            ERROR_TESTING_SERVER: 'Erreur: ¡le serveur @ template @ est inaccessible!',
            CONNECTING_TO_NEW_SERVER: 'Connexion à un nouveau serveur ...',
            PROXY_ERROR: '¡Le service Proxy est inaccessible!',
            CLAIM: 'Réclamer',
            RETRY: 'Réessayer',
            SYNC: 'Synchroniser',
            HIDE_EMPTY_WALLETS: 'Masquer les portefeuilles vides',
            SHOW_EMPTY_WALLETS: 'Afficher les portefeuilles vides',
        },
        TRANSACTIONS: {
            LAST_TX: 'Transactions',
            LOADING_HISTORY: "Chargement de l'historique des transactions",
            OUT: 'Envoyé',
            IN: "Reçu",
            MINE: 'moi',
            IMMATURE: 'immature',
            UNKNOWN: 'inconnu',
            NO_HISTORY: "Pas d'histoire",
            DIRECTION: 'adresse',
            CONFIRMATIONS: 'Les confirmations',
            INTEREST: 'Récompenses',
            TX_HASH: 'Hash Tx',
            AMOUNT: 'Montant',
            TIME: 'Le temps',
            COIN_ADDRESS: 'adresse',
        },
        CLAIM: {
            WARNING: 'Avis',
            WARNING_SPV_P1: 'Vos données de portefeuille ne sont vérifiées que par un seul serveur!',
            WARNING_SPV_P2: 'Si vous voulez toujours continuer, appuyez sur "Confirmer".',
            SPV_VERIFYING: 'Vérification des données de transaction',
            CONFIRM: 'Confirmer',
            CANCEL: 'Annuler',
            FAILED_TO_CLAIM_INTEREST: 'Défaut de réclamer des récompenses! Veuillez réessayer.',
            YOU_SUCCESFULLY_CLAIMED: 'Vous avez récupéré avec succès',
            AMOUNT: 'Montant',
            INTEREST: 'Récompenses',
            INTEREST_SM: 'les récompenses',
            LIST_SM: 'liste',
            REQ_TO_CLAIM_P1: 'Accumuler des récompenses',
            REQ_TO_CLAIM_P2: 'la transaction de dépense a été effectuée il y a au moins 1 heure, le champ de blocage par heure a été configuré et le montant est supérieur à 10 KMD',
            CLAIM: 'Réclamer',
        },
        APP_TITLE: {
            MENU: 'Menu',
            PIN: 'Annuler code PIN',
            LOGIN: "Entrer",
            DASHBOARD: 'Panneau',
            OVERVIEW: 'Vue générale',
            SETTINGS: 'Configurations',
            RECOVERY: 'Récupérer 24 mots liste ',
            'RECOVERY-KEYS': 'Récupérer clés privées',
            SEND: 'Envoyer',
            OFFLINESIG: 'Inscription hors ligne',
            ADDCOIN: 'Ajouter une devise',
            COINSALE: 'Vente Pungo token',
            'CREATE-SEED': 'Créer portefeuille',
            'CREATE-RECOVER-SEED': 'Récupérer portefeuille',
            'RECOVER-SEED': 'Récupérer portefeuille',
            ABOUT: 'À propos de',
            CLAIM: 'Réclamer récompenses',
            MANAGE_COINS: 'Gérer devises',
            LIST_OF_WALLETS: 'Liste portefeuilles',
            PAGE_EXCHANGE: 'Échanger',
            CHANGE_AUTH_METHOD: 'Changer authentification',
            RECOVERY_OPTIONS: 'Options récupération',
        },
        COINS: {
            //supported in pungo
            PGT: 'Pungo Token',
            SMART: 'SmartCash',
            VRSC: 'Verus',
            EQLI: 'Equaliser',
            PPC: 'Peercoin',
            TPAY: 'TokenPay',
            GRS: 'Groestlcoin',
            PIVX: 'PIVX',
            XVG: 'Verge',
            OOT: 'Utrum',
            ZILLA: 'Chainzilla',
            BCH: 'BitcoinCash',
            GAME: 'GameCredits',
            XVG: 'Verge',
            SMART: 'Smartcash',
            BTC: 'Bitcoin',
            DASH: 'Dash',
            VIA: 'Viacoin',                    
            DOGE: 'Dogecoin',
            ZEC: 'Zcash',
            GRS: 'Groestlcoin',
            QTUM: 'Qtum',
            KMD: 'Komodo',
            SUQA: 'SUQA',
            PIVX: 'Pivx',
            DGB: 'DigiByte',
            EQL: 'Equaliser',
            
            // asset chains
            BET: 'BET',
            BOTS: 'BOTS',
            CEAL: 'CEAL NET',
            COQUI: 'COQUI',
            CHAIN: 'Chainmakers',
            GLXT: 'GLXToken',            
            CRYPTO: 'CRYPTO',
            HODL: 'HODL',
            DEX: 'DEX',
            JUMBLR: 'JUMBLR',
            KV: 'KV',
            MGW: 'MultiGateway',
            MVP: 'MVP Lineup',
            MNZ: 'Monaize',
            PANGEA: 'PANGEA',
            REVS: 'REVS',
            MSHARK: 'MSHARK',
            SHARK: 'SHARK',
            MESH: 'SpaceMesh',
            SUPERNET: 'SUPERNET',
            WLC: 'WIRELESS',
            AXO: 'AXO',
            ETOMIC: 'ETOMIC',
            BTCH: 'BTCH',
            BEER: 'BEER (Test coin)',
            PIZZA: 'PIZZA (Test coin)',
            VOTE2018: 'VOTE2018 (Notary Elections)',
            NINJA: 'NINJA',
            GLXT: 'GLXToken',
            BNTN: 'Blocnation',
            PRLPAY: 'Pearl Pay',
            
            // crypto
            CRW: 'Crown',
            STRAT: 'Stratis',
            TOA: 'TOA',
            USC: 'UltimateSecureCash',
            VPN: 'VpnCoin',
            WC: 'WinCoin',
            NRG: 'Energi',
            ABY: 'ArtByte',
            VOT: 'VoteCoin',
            BDL: 'Bitdeal',
            BTCP: 'BitcoinPrivate',
            MAC: 'Machinecoin',
            XWC: 'Whitecoin',
            XVC: 'Vcash',
            CRAVE: 'Crave',
            ACC: 'AdCoin',
            AC: 'AsiaCoin',
            AUR: 'Auroracoin',
            BCA: 'Bitcoin Atom',
            CLAM: 'Clams',
            CLUB: 'ClubCoin',
            DMD: 'Diamond',
            EXCL: 'ExclusiveCoin',
            FTC: 'FeatherCoin',
            FLASH: 'Flash',
            NLG: 'Gulden',
            LCC: 'Litecoin Cash',
            MNX: 'MinexCoin',
            NAV: 'NavCoin',
            NEOS: 'NeosCoin',
            OK: 'OKCash',
            OMNI: 'OmniLayer',            
            RDD: 'Reddcoin',
            UNO: 'Unobtanium',            
            VIVO: 'VIVO',
            EFL: 'E-Gulden',
            GBX: 'GoByte',
            BSD: 'Bitsend',
            LBC: 'LBRY Credits',
            ERC: 'Europecoin',
            BATA: 'Bata',
            EMC2: 'Einsteinium',
            SYS: 'Syscoin',
            IOP: 'Internet of People',
            ZEN: 'Zencash',
            XZC: 'Zcoin',
            FJC: 'Fujicoin',            
            BCBC: 'Bitcoin CBC',
            BTG: 'BitcoinGold',           
            DNR: 'Denarius',            
            FAIR: 'Faircoin',
            ARG: 'Argentum',
            LTC: 'Litecoin',
            MONA: 'Monacoin',
            NMC: 'Namecoin',
            VTC: 'Vertcoin',
            SIB: 'Sibcoin',
            BLK: 'Blackcoin',
            HUSH: 'Hush',
            SNG: 'SnowGem',
            ZCL: 'Zclassic',
            XMY: 'Myriad',
            HODLC: 'Hodl coin',
            BTX: 'Bitcore',            
            BTCZ: 'BitcoinZ',
            CHIPS: 'Chips',
            MZC: 'Mazacoin',
            ZET: 'Zetacoin',
            SLR: 'Solarcoin',
            SMLY: 'Smileycoin',            
            RBY: 'Rubycoin',
            VOX: 'RevolutionVR',
            PUT: 'PutinCoin',
            POT: 'Potcoin',
            POSW: 'Poswcoin',
            PINK: 'Pinkcoin',
            PSB: 'Pesobit',
            NSR: 'NuShares',
            NVC: 'Novacoin',
            NYC: 'NewYorkCoin',
            NRO: 'Neuro',
            LYNX: 'Lynx',
            LINX: 'Linx',
            LDCN: 'Landcoin',
            KOBO: 'Kobocoin',
            IXC: 'Ixcoin',
            INSN: 'InsaneCoin',
            THC: 'Hempcoin',
            HNC: 'Helleniccoin',
            GRC: 'Gridcoin',
            GCR: 'Global Currency Reserve',
            FRST: 'FirstCoin',
            ERC: 'Europecoin',
            EDRC: 'EDRcoin',
            ECN: 'eCoin',
            DGC: 'Digitalcoin',
            DEFC: 'Defcoin',
            CMP: 'CompCoin',
            CCN: 'Cannacoin',
            CDN: 'Canada eCoin',
            BRIT: 'BritCoin',
            XBC: 'BitcoinPlus',
            BELA: 'BelaCoin',
            USNBT: 'NuBits',
            ONX: 'Onixcoin',
            ZET: 'Zetacoin',
            JBS: 'Jumbucks',
            SLM: 'Slimcoin',
            AXE: 'Axe',            
            MZC: 'Mazacoin',
            SDC: 'ShadowCash',

        },
    },
};

export default lang;

