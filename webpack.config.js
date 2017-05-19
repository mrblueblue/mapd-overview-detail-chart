var path = require("path");
module.exports = {
  entry: {
    app: [
      "script-loader!@mapd/connector/thrift/browser/thrift",
      "script-loader!@mapd/connector/thrift/browser/mapd.thrift",
      "script-loader!@mapd/connector/thrift/browser/mapd_types",
      "script-loader!@mapd/connector/dist/mapd-connector",
      "script-loader!@mapd/crossfilter/dist/mapd-crossfilter",
      "./src/index"
    ]
  },
  output: {
    path: path.resolve(__dirname, "build"),
    publicPath: "/assets/",
    filename: "bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        include: [
          path.resolve(__dirname, "src"),
          path.resolve(__dirname, "node_modules/@mapd/mapdc")
        ]
      },
      {
       test: /\.css$/,
       use: [
         { loader: "style-loader" },
         { loader: "css-loader" }
       ]
     }
    ]
  }
};
