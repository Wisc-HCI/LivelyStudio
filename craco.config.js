const path = require("path");
// const HtmlWebpackPlugin = require("html-webpack-plugin");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const webpack = require("webpack");

module.exports = {
  webpack: {
    entry: path.resolve(__dirname, "./src/index.js"),
    target: "web",
    devServer: {
      static: path.join(__dirname, "dist"),
      compress: true,
      port: 8080,
      hot: true,
    },
    output: {
      publicPath: "auto",
    },
    node: {
      fs: 'empty'
    },
    resolve: {
      extensions: [".js", ".jsx"]
    },
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.svg$/,
          use: ["@svgr/webpack", "url-loader"],
        },
        // {
        //   test: /\.(js|jsx)$/,
        //   use: ["babel-loader"],
        // },
        {
          test: /\.(glb|gltf)$/,
          use: { loader: "file-loader" },
        },
      ],
    },
    plugins: [
      // new webpack.HotModuleReplacementPlugin(),
      // new HtmlWebpackPlugin({
      //   manifest: "./public/manifest.json",
      //   favicon: "./public/favicon.ico",
      //   template: "./public/index.html",
      // }),
      new NodePolyfillPlugin(),
      new webpack.ContextReplacementPlugin(/@people_and_robots/),
    ],
    experiments: {
      asyncWebAssembly: true,
      syncWebAssembly: true,
      topLevelAwait: true,
    },
  },
};
