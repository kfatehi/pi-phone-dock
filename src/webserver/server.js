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

// app.use(express.static('/', 'public'));

wss.on('connection', (ws) => {
    function sendEvent(name, data = {}) {
        ws.send(JSON.stringify({ name, ...data }));
    }

    //connection is up, let's add a simple simple event
    ws.on('message', (raw) => {
        try {
            let event = JSON.parse(raw);
            switch (event.name) {
                case "ping": {
                    sendEvent("pong")
                } break;
                case 'get-everything': {
                    sendEvent("pulse-sinks", { sinks: [] });
                    sendEvent("pulse-sources", { sources: [] });
                    sendEvent("bluetooth-devices", { devices: [] });
                    sendEvent("apps", {
                        apps: [{
                            name: 'consecutive-interpreter',
                            configSchema: {
                                partnerLanguage: [{ id: "fa", label: "Farsi (Persian)" }],
                                userLanguage: [{ id: "en", label: "English" }],
                            }
                        }]
                    });
                    sendEvent("consecutive-interpreter", { state: "off", userLanguage: 'en', partnerLanguage: 'fa' });
                } break;
                default: {
                    console.log('unhandled event:', event);
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