import en from './en';
import cat from './cat';
import es from './es';
import fr from './fr';
import it from './it';
import pt from './pt';
import rus from './rus';
import tk from './tk';
import {applicationLanguage} from "../../../client/main";

let defaultLang = en;
let defaultLanguageCode = 'EN';

export const SUPPORTED_LANGUAGES = [
    {code: 'en', lang: 'English'},
    {code: 'cat', lang: 'Catalan'},
    {code: 'es', lang: 'Spanish'},
    {code: 'fr', lang: 'French'},
    {code: 'it', lang: 'Italian'},
    {code: 'pt', lang: 'Portuguese'},
    {code: 'rus', lang: 'Russian'},
 //   {code: 'tk', lang: 'Turkish'}
];

export const findLangByCode = settingsLang => {
    if (!settingsLang) {
        settingsLang = 'en';
    }
    return SUPPORTED_LANGUAGES.find(l => {return (settingsLang.indexOf(l.code) > -1)});

};

const getDictionary = (language) => {
    let systemLanguage = language ? language.toLowerCase() : '';
    if (systemLanguage.indexOf('en') > -1) {
        return en;
    } else if (systemLanguage.indexOf('cat') > -1) {
        return cat;
    } else if (systemLanguage.indexOf('es') > -1) {
        return es;
    } else if (systemLanguage.indexOf('fr') > -1) {
        return fr;
    } else if (systemLanguage.indexOf('it') > -1) {
        return it;
    } else if (systemLanguage.indexOf('pt') > -1) {
        return pt;
    } else if (systemLanguage.indexOf('rus') > -1) {
        return rus;
    //} else if (systemLanguage.indexOf('tk') > -1) {
        return tk;        
    }
    else {
        return en;
    }
};

const getLanguageCode = dictionary => {
    let dictionaryKeys = Object.keys(dictionary);
    return dictionary && dictionaryKeys && dictionaryKeys[0] ? dictionaryKeys[0] : defaultLanguageCode;
};

const getCurrentLanguage = dictionary => {
    let languageCode = getLanguageCode(dictionary);
    return dictionary[languageCode];
};

const translate = (langID, interpolateStr) => {
    let storedLang = applicationLanguage;
    let langDictionary = storedLang ? getDictionary(storedLang) : defaultLang;
    let currentLanguage = getCurrentLanguage(langDictionary);
    let languageCode = getLanguageCode(langDictionary);
    if (langID && langID.indexOf('.') > -1) {
        let langIDComponents = langID.split('.');
        if (langDictionary && langIDComponents && currentLanguage[langIDComponents[0]][langIDComponents[1]]) {
            if (interpolateStr) {
                return currentLanguage[langIDComponents[0]][langIDComponents[1]].replace('@template@', interpolateStr);
            } else {
                return currentLanguage[langIDComponents[0]][langIDComponents[1]];
            }
        } else {
            console.warn(`Missing translation ${langID} in js/${languageCode.toLowerCase()}.js`);
            return `--> ${langID} <--`;
        }
    } else {
        if (langID.length) {
            console.warn(`Missing translation ${langID} in js/${languageCode.toLowerCase()}.js`);
            return `--> ${langID} <--`;
        }
    }
};

export default translate;