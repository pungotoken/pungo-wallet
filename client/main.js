import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux'
import {applyMiddleware, compose, createStore} from 'redux';
import thunk from 'redux-thunk';

import './main.html';

import appReducer from '../imports/ui/reducers';
import App from '../imports/ui/App';
import {getLocalStorageVar} from "../imports/ui/actions/utils";
import {saveSettingsItem, SETTINGS_ITEM} from "../imports/ui/components/Settings";

const initialState = {
  foo: {
  }
};

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  appReducer,
  initialState,
  composeEnhancers(
    applyMiddleware(thunk)
  )
);

// this proxy is used for minimizing the number of requests to the local storage 'language item'
let settings = getLocalStorageVar(SETTINGS_ITEM);
export let applicationLanguage = settings && settings.lang ? settings.lang : '';

if (!applicationLanguage) {
    let systemLanguage = navigator.languages
        ? navigator.languages[0]
        : navigator.language;
    saveSettingsItem('lang', systemLanguage);
    applicationLanguage = systemLanguage
}

export const setApplicationLanguage = lang => {
    applicationLanguage = lang;
    saveSettingsItem('lang', lang)
};

Meteor.startup(() => {
  render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('app')
  );
});
