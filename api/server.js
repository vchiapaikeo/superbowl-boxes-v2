const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");

// TODO: Upgrade to Express 5 once it is out of alpha and remove this wrapper.
// Express 4.x does not support automatic asynchronous error handling and each route needs
// to handle rejected promises on their own. This middleware catches rejected promises for
// every route in the overridden methods to format a 500 response and json error message.
const asyncHandler = (fn) => (req, res, next) => {
  // default next handler sends back a webpage
  return Promise.resolve(fn(req, res, next)).catch((error) => {
    const errorCode = error.status || 500;
    console.error(`AsyncRouteHandlingError: ${error.name} - ${error.message}`);
    console.error(error);
    res.status(errorCode).send({ error: error.message });
  });
};

const asyncOverrideMethods = ["get", "post", "delete"];

function toAsyncRouter(router) {
  for (let key in router) {
    if (asyncOverrideMethods.includes(key)) {
      let method = router[key];
      router[key] = (path, ...callbacks) => method.call(router, path, ...callbacks.map((cb) => asyncHandler(cb)));
    }
  }
  return router;
}

const app = toAsyncRouter(express());
const jsonParser = bodyParser.json();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cache = {};
const NAMES_CACHE_KEY = "api/v1/names";

// Helper functions
// From https://stackoverflow.com/a/2450976/5249973
function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
}

// API routes
app.get("/api/v1/names", async (req, res) => {
  if (cache[NAMES_CACHE_KEY] !== undefined) {
    res.send(cache[NAMES_CACHE_KEY]);
    return;
  }

  const includeBlanks = req.query.includeBlanks;
  const names = ["Victor", "Tue", "Apiram", "Buranawong", "Sangchai", "Supaporn", "Marc", "Wendy", "Kathy", "Jason", "Louise"]
  let nonshuffled = [];
  const numArraysNeeded = parseInt(100 / names.length, 10);
  for (let i = 0; i < numArraysNeeded; i++) {
    nonshuffled = nonshuffled.concat(names);
  }

  const need = 100 - nonshuffled.length;
  if (includeBlanks === true || includeBlanks === "true") {
    for (let i = 0; i < need; i++) {
      nonshuffled.push("-");
    }
  } else {
    const shuffledNames = shuffle(names);
    for (let i = 0; i < need; i++) {
      nonshuffled.push(shuffledNames[i]);
    }
  }

  const shuffled = shuffle(nonshuffled);

  res.send({ names: shuffled, saved: false });
});

app.post("/api/v1/clear", async (req, res) => {
  console.log("Clearing cache");
  delete cache[NAMES_CACHE_KEY];
  res.status(200).json({ success: true });
});

app.post("/api/v1/names/save", async (req, res) => {
  const names = req.body;
  names["saved"] = true;
  cache[NAMES_CACHE_KEY] = names;
  res.status(200).json({ success: true });
});

app.get("/api/v1/readiness_check", async (req, res) => {
  res.sendStatus(200);
});

app.get("/api/v1/liveness_check", async (req, res) => {
  res.sendStatus(200);
});

if (process.env.NODE_ENV === "production") {
  // Serve any static files
  app.use(express.static(path.join(__dirname, "client/build")));

  // Handle React routing, return all requests to React app
  app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  });
}

module.exports = app;
