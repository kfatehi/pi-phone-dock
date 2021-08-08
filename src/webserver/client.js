// More mess, but once it's done it's a nice experience.
// Took from https://github.com/miami78/webpack5-react-boilerplate
// and looked at https://github.com/css-modules/css-modules
// and https://react-redux.js.org/introduction/getting-started
// some more reference https://dev.to/riyanegi/setting-up-webpack-5-with-react-and-babel-from-scratch-2021-271l

import React from 'react'
import ReactDOM from 'react-dom'

import { Provider } from 'react-redux'

import "core-js/stable";
import "regenerator-runtime/runtime";

import { store } from './store'

import { App } from './App.js'

const rootElement = document.getElementById('root')
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  rootElement
)