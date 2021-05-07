"use strict";

// @ts-check

const express = require("express");

// CouchDB
const nano = require("nano")("http://admin:admin@127.0.0.1:5984");

// Constants
const DATABASE = "test";
const LANG_JS = "javascript";

// const EXAMPLE_ID = "_design/example";
// const EXAMPLE_VIEWNAME = "emit_all";

// const SENTIMENT_ID = "_design/sentiment";
// const SENTIMENT_VIEWNAME = "sentiment_by_isleader";

// const VULGARITY_ID = "_design/vulgarity";
// const VULGARITY_VIEWNAME = "bydate";

const NodeCouchDb = require("node-couchdb"); // npm install express body-parser ejs node-couchdb --save

// async function initMapReduce() {
//   console.log("Initialising map reduce");
//   const db = nano.use(DATABASE);

  // // Example view
  // const exampleDdoc = {
  //   _id: EXAMPLE_ID,
  //   views: {
  //     [retweet]: {
  //       map: function (doc) {

  //         emit([doc.full_tweet.user.screen_name], doc.retweet_count);

  //       }.toString(),
  //     },
  //   },
  //   language: LANG_JS,
  // };
  // await db.insert(exampleDdoc);
  // console.log("Inserted example view");


async function main() {
  // try {
  //   await initMapReduce();
  // } catch (error) {
  //   console.error(error);
  // }

  console.log("Initialising Express");
  const app = express();
  app.use(express.json());

  const dbName = 'tweets_database_6%2F7%2F2021';

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


  app.get('/', function(req,res){ //takes req and response
    //res.send('Working...');
    couch.get(dbName, '_design/query-demo/_view/full-name').then(
        //If success!
        function(data, headers, status){ 
            console.log(data.data.rows)
            // console.log(data);
            res.render('index',{ //render view with res.render
                // tweet_database2:data.data.rows //pass along data that was returned.
                tweet:data.data.rows
            });
        },
        //error
        function(err){
            //if an error, pass through error
            console.log(err)
            res.send(err);
        });
});

  app.listen(3003, () => {
    console.log("Listening on port 3000");
  });
}

main().catch((err) => {
  console.error(err);
});
