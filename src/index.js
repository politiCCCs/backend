"use strict";

// @ts-check

const express = require("express");

// CouchDB
const nano = require("nano")("http://admin:admin@127.0.0.1:5984");

// Constants
const DATABASE = "tweet_database";
const LANG_JS = "javascript";

const EXAMPLE_ID = "_design/example";
const EXAMPLE_VIEWNAME = "emit_all";

const SENTIMENT_ID = "_design/sentiment";
const SENTIMENT_VIEWNAME = "sentiment_by_isleader";

const VULGARITY_ID = "_design/vulgarity";
const VULGARITY_VIEWNAME = "bydate";

async function initMapReduce() {
  console.log("Initialising map reduce");
  const db = nano.use(DATABASE);

  // Example view
  const exampleDdoc = {
    _id: EXAMPLE_ID,
    views: {
      [EXAMPLE_VIEWNAME]: {
        map: function (doc) {
          emit(doc._id, 1);
        }.toString(),
      },
    },
    language: LANG_JS,
  };
  await db.insert(exampleDdoc);
  console.log("Inserted example view");

  // Average sentiment score for political leaders vs. non-leaders
  await db.insert({
    _id: SENTIMENT_ID,
    views: {
      [SENTIMENT_VIEWNAME]: {
        map: function (keys, values, rereduce) {
          if (rereduce) {
            return sum(values);
          } else {
            return values.length;
          }
        }.toString(),
      },
    },
    language: LANG_JS,
  });
  console.log("Inserted sentiment score view");

  // Vulgarity by leader or not
  await db.insert({
    _id: VULGARITY_ID,
    views: {
      [VULGARITY_VIEWNAME]: {
        reduce: "_count",
        map: function (doc) {
          emit(doc.is_leader, +doc.vulgarity);
        }.toString(),
      },
    },
    language: LANG_JS,
  });
  console.log("Inserted vulgarity by leader view");
}

async function main() {
  try {
    await initMapReduce();
  } catch (error) {
    console.error(error);
  }

  console.log("Initialising Express");
  const app = express();
  app.use(express.json());

  app.get("/", async (_req, res) => {
    const db = nano.use(DATABASE);

    try {
      const body = await db.view(EXAMPLE_ID, EXAMPLE_VIEWNAME);

      res.send("success");
      return;
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
      return;
    }
  });

  app.get("/sentiment", async (_req, res) => {
    console.log("getting sentiment");
    const db = nano.use(DATABASE);

    try {
      const body = await db.view(SENTIMENT_ID, SENTIMENT_VIEWNAME);
      console.log("acquired body");
      const shape = body.rows.map((doc) => doc.value);

      res.json(shape);
      return;
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
      return;
    }
  });

  app.get("/vulgarity", async (_req, res) => {
    const db = nano.use(DATABASE);

    const body = await db.view(VULGARITY_ID, VULGARITY_VIEWNAME);
    // TODO

    res.send("todo");
    return;
  });

  app.listen(3000, () => {
    console.log("Listening on port 3000");
  });
}

main().catch((err) => {
  console.error(err);
});
