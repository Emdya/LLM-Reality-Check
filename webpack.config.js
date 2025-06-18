const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const CopyWebpackPlugin = require("copy-webpack-plugin")

module.exports = {
  entry: {
    popup: "./src/popup/index.tsx",
    content: "./src/content/content.ts",
    background: "./src/background/background.ts",
  },
  output: {
    path: path.resolve(__dirname, "./"),
    filename: "[name].js",
    clean: false,
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-typescript", ["@babel/preset-react", { runtime: "automatic" }]],
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/popup/popup.html",
      filename: "popup.html",
      chunks: ["popup"],
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "./src/content/content.css",
          to: "content.css",
        },
      ],
    }),
  ],
}
