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
            template: __dirname+'/index.ejs'
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

    //connection is up, let's add a simple simple event
    ws.on('message', (message) => {

        //log the received message and send it back to the client
        console.log('received: %s', message);
        ws.send(`Hello, you sent -> ${message}`);
    });

    //send immediatly a feedback to the incoming connection    
    ws.send('Hi there, I am a WebSocket server');
});


//start our server
server.listen(process.env.PORT || 3000, () => {
    console.log(`Server started on port ${server.address().port} :)`);
});