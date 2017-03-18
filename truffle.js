module.exports = {
  build: {
    "index.html": "index.html",
    "app.js": [
      "javascripts/app.js"

    ],
     "splitter.js": [
          "javascripts/angular.js",
                    "javascripts/utils.js",

          "javascripts/splitterController.js"
    ],
    "app.css": [
      "stylesheets/app.css"
    ],
    "images/": "images/"
  },
  rpc: {
    host: "localhost",
    port: 8545
  }
};
