const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const dotenv = require("dotenv");

const rootPath = path.resolve(__dirname, ".");

module.exports = () => {
  // replace process.env.*
  const env = dotenv.config().parsed;
  const envKeys = {};
  if (env) {
    Object.keys(env).reduce((prev, next) => {
      prev[`process.env.${next}`] = JSON.stringify(env[next]);
      return prev;
    }, envKeys);
  } else {
    const keys = ["SERVER_URL", "WEBSOCKET_URL", "SKYWAY_KEY"];
    keys.forEach((k) => {
      envKeys[`process.env.${k}`] = JSON.stringify(process.env[k]);
    });
  }

  return {
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
      mainFields: ["main", "module", "browser"],
    },
    entry: path.resolve(rootPath, "src", "index.tsx"),
    target: "web",
    devtool: "source-map",
    module: {
      rules: [
        {
          test: /\.(js|ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
          },
        },
        {
          test: /\.s[ac]ss$/i,
          use: ["style-loader", "css-loader", "sass-loader"],
        },
      ],
    },
    devServer: {
      contentBase: path.join(rootPath, "dist"),
      historyApiFallback: true,
      compress: true,
      hot: true,
      host: "0.0.0.0",
      port: 4000,
      publicPath: "/",
      https: true,
    },
    output: {
      path: path.resolve(rootPath, "dist"),
      filename: "js/[name].[contenthash].js",
      publicPath: "./",
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/index.html",
      }),
      new webpack.DefinePlugin(envKeys),
    ],
  };
};
