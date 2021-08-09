// Here's a webserver with websockets and webpack
// It implements the realtime interface into the system to toggle features and such
// Started off by using this, stripping out the typescript BS
// https://medium.com/factory-mind/websocket-node-js-express-step-by-step-using-typescript-725114ad5fe4
// Then I integrated https://github.com/webpack/webpack-dev-middleware so client-side dev can be more flexible
// and of course HTML index page generation plugin https://github.com/jantimon/html-webpack-plugin

const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const webpack = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");
const HtmlWebpackPlugin = require('html-webpack-plugin')
const compiler = webpack({
    entry: __dirname + '/client.js',
    output: {
        path: __dirname + '/dist',
        filename: 'bundle.js'
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "Pi Phone Dock",
            template: __dirname + '/index.ejs'
        })
    ],
    mode: 'development',
    module: {
        rules: [
            // JavaScript: Use Babel to transpile JavaScript files
            { test: /\.(js|jsx)$/, exclude: /node_modules/, use: ["babel-loader"] },

            // Styles: Inject CSS into the head with source maps
            {
                test: /\.(scss|css)$/,
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        options: { sourceMap: true, importLoaders: 1 },
                    }
                ],
            },

            // Images: Copy image files to build folder
            { test: /\.(?:ico|gif|png|jpg|jpeg)$/i, type: "asset/resource" },

            // Fonts and SVGs: Inline files
            { test: /\.(woff(2)?|eot|ttf|otf|svg|)$/, type: "asset/inline" },
        ],
    }
});

app.use(webpackDevMiddleware(compiler));

const { getInfo, getPairedDeviceList, connectPairedDevice, disconnectPairedDevice, getControllerInfo,
    getOrCreateBluetoothScanInstance,
    destroyBluetoothScanInstance, pairDevice
  }  = require('./bluetooth-helpers');

const { trackClient } = require('./global-socketry');

const { getPulseConfig, setPulseConfig, getPulseChoices } = require('./pulseaudio-helpers');

wss.on('connection', (ws) => {
    function sendEvent(name, data = {}) {
        let payload = { name, ...data };
        console.log('>>', payload);
        ws.send(JSON.stringify(payload));
    }

    trackClient(ws);

    //connection is up, let's add a simple simple event
    ws.on('message', (raw) => {
        try {
            let payload = JSON.parse(raw);
            console.log('<<', payload);
            switch (payload.name) {
                case "ping": {
                    sendEvent("pong")
                } break;
                case 'get-everything': {
                    // sendEvent("pulse-sinks", { sinks: [] });
                    // sendEvent("pulse-sources", { sources: [] });
                    // sendEvent("apps", {
                    //     apps: [{
                    //         name: 'consecutive-interpreter',
                    //         configSchema: {
                    //             partnerLanguage: [{ id: "fa", label: "Farsi (Persian)" }],
                    //             userLanguage: [{ id: "en", label: "English" }],
                    //         }
                    //     }]
                    // });
                    // sendEvent("consecutive-interpreter", { state: "off", userLanguage: 'en', partnerLanguage: 'fa' });
                } break;
                case 'get-bluetooth-paired-devices': {
                    getPairedDeviceList(sendEvent);
                } break;
                case 'get-bluetooth-device-info':{
                    getInfo(sendEvent)(payload.macAddress);
                } break;
                case 'bluetooth-connect-paired-device':{
                    connectPairedDevice(sendEvent)(payload.macAddress);
                } break;
                case 'bluetooth-disconnect-paired-device':{
                    disconnectPairedDevice(sendEvent)(payload.macAddress);
                } break;
                case 'get-bluetooth-controller-info':{
                    getControllerInfo(sendEvent);
                } break;
                case 'bluetooth-scan-on':{
                    getOrCreateBluetoothScanInstance();
                } break;
                case 'bluetooth-scan-off':{
                    destroyBluetoothScanInstance();
                } break;
                case 'get-pulse-choices':{
                    getPulseChoices();
                } break;
                case 'get-pulse-config':{
                    getPulseConfig();
                } break;
                case 'set-pulse-config':{
                    setPulseConfig(payload.key, payload.value);
                } break; 
                default: {
                    console.log('unhandled payload:', payload);
                }
            }
        } catch (err) {
            console.error(err.stack)
        }
    });
});


//start our server
server.listen(process.env.PORT || 3000, () => {
    console.log(`Server started on port ${server.address().port} :)`);
});