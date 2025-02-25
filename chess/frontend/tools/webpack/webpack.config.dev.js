module.exports = {
  mode: "development",
  entry: ["./src/main.tsx"],
  module: {
    rules: require("./webpack.rules"),
  },
  output: {
    filename: "[name].js",
    chunkFilename: "[name].chunk.js",
  },
  plugins: require("./webpack.plugins"),
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css"],
    alias: require("./webpack.aliases"),
  },
  stats: "errors-warnings",
  devtool: "eval-source-map",
  devServer: {
    open: true,
    historyApiFallback: true,
    client: {
      overlay: { errors: true, warnings: false },
    },
  },
  optimization: {
    splitChunks: {
      chunks: "all",
    },
  },
  performance: {
    hints: false,
  },
};
