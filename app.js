"use strict";
// @ts-check

const express = require("express");
const fs = require("fs");
const path = require("path");
const NodeCouchDb = require("node-couchdb");
const util = require("util");

const dotenv = require("dotenv").config();

// Connect to Local db
// const couch = new NodeCouchDb({
//     auth:{
//         user:'admin',
//         password:'admin'
//     }
// });

//Connecting to external db
const couch = new NodeCouchDb({
  host: "172.26.132.226",
  protocol: "http",
  port: 5984,
  auth: {
    user: "admin",
    password: "admin",
  },
});

couch.listDatabases().then(function (dbs) {
  console.log(dbs);
});

const app = express();
app.use(express.json());

// CouchDB
const dbName = "twitter_db";

/**
 * The view below has already been set up manually.
 * View 1. ALL tweets
 * http://127.0.0.1:5984/tweet_database2/_design/general1/_view/may6test
 **/

// const viewUrl = '_design/general1/_view/may6test';
// // create first route to index page
// app.get('/', function(req,res){ //takes req and response
//     //res.send('Working...');
//     couch.get(dbName, viewUrl).then(
//         //If success!
//         function(data){
//             console.log(data.data.rows)
//             // console.log(data);
//             res.render('index',{ //render view with res.render
//                 // tweet_database2:data.data.rows //pass along data that was returned.
//                 tweet:data.data.rows
//             });
//         },
//         //error
//         function(err){
//             //if an error, pass through error
//             res.send(err);
//         });
// });

// Below are querying views. Views have all been uploaded through JSON directly into couchdb.

const sendView = (cleanViewName, dbName, view, res) => {
  console.log(`getting View: ${cleanViewName}`);

  couch.get(dbName, view).then(
    (data) => res.send(data),
    (err) => {
      console.log(err);
      res.send(err);
    }
  );
};

//#region Politician data
const politicians = (view) => `_design/numVotesCorr/_view/${view}?group=true`;
const politicianRouter = express.Router();

politicianRouter
  .get("/count", (_req, res) => {
    sendView(
      "Count per username (Politician)",
      dbName,
      politicians`count`,
      res
    );
  })
  .get("/avg-count", (_req, res) => {
    sendView(
      "Average Count per username (Politician)",
      dbName,
      politicians`count_ave`,
      res
    );
  })
  .get("/likes", (_req, res) => {
    sendView(
      "Likes per username (Politician)",
      dbName,
      politicians`likes`,
      res
    );
  })
  .get("/avg-likes", (_req, res) => {
    sendView(
      "Average Likes per username (Politician)",
      dbName,
      politicians`likes_ave`,
      res
    );
  })
  .get("/retweets", (_req, res) => {
    sendView(
      "Retweets per username (Politician)",
      dbName,
      politicians`retweet`,
      res
    );
  })
  .get("/avg-retweets", (_req, res) => {
    sendView(
      "Average Retweets per username (Politician)",
      dbName,
      politicians`retweet_ave`,
      res
    );
  })
  .get("/sentiment", (_req, res) => {
    sendView(
      "Sentiment per username (Politician)",
      dbName,
      politicians`sentiment`,
      res
    );
  })
  .get("/avg-sentiment", (_req, res) => {
    sendView(
      "Average Sentiment per username (Politician)",
      dbName,
      politicians`sentiment_ave`,
      res
    );
  });

//#endregion

//#region Global comparison
const globalRouter = express.Router();
const nonPoli = (s) => `_design/nonPoli/_view/${s}?group=true`;

globalRouter
  .get("/leaders", (_req, res) => {
    sendView("Leaders", dbName, nonPoli`all_groups_values_all_stats`, res);
  })
  .get("/vulgarity", (_req, res) => {
    sendView("Vulgarity", dbName, nonPoli`count_vulgarity`, res);
  })
  .get("/tweets", (_req, res) => {
    sendView("Tweets", dbName, nonPoli`count_total`, res);
  });

//#endregion

//#region Geolocation tweets
const geoLocationRouter = express.Router();
geoLocationRouter.get("/", (_req, res) => {
  sendView("Geolocation", dbName, `_design/geoEnabled/_view/geo_lab_lib`, res);
});
//#endregion
const readFilePromise = util.promisify(fs.readFile);

const loadFileRouter = express.Router();
const loadShapeFile = async () => {
  const data = await readFilePromise(
    path.join(__dirname, "./assets/COM_ELB_region.json")
  );
  const shapeFile = JSON.parse(data);

  loadFileRouter.get("/shapefile", (_req, res) => {
    res.send(shapeFile);
  });
};

const loadVotesByCandidate = async () => {
  const data = await readFilePromise(
    path.join(__dirname, "./assets/VotesByCandidate.csv")
  );

  loadFileRouter.get("/votes-by-candidate.csv", (_req, res) => {
    res.header("Content-Type", "text/csv");
    res.send(data);
  });
};

const loadTwoPartyVotes = async () => {
  const data = await readFilePromise(
    path.join(__dirname, "./assets/TwoPartyVotes.csv")
  );

  loadFileRouter.get("/two-party-votes.csv", (_req, res) => {
    res.header("Content-Type", "text/csv");
    res.send(data);
  });
};

const handleNameMapRouter = express.Router();
const loadHandleUsernameMap = async () => {
  const data = await readFilePromise(
    path.join(__dirname, "./assets/handleNameMap.json")
  );
  const file = JSON.parse(data);

  handleNameMapRouter.get("/", (_req, res) => {
    res.send(file);
  });
};

const apiRouter = express.Router();
apiRouter.use("/politicians", politicianRouter);
apiRouter.use("/general", globalRouter);
apiRouter.use("/handle-name-map", handleNameMapRouter);
apiRouter.use("/geolocation", geoLocationRouter);
apiRouter.use("/load", loadFileRouter);

app.use("/api", apiRouter);

Promise.all([
  loadShapeFile(),
  loadVotesByCandidate(),
  loadTwoPartyVotes(),
  loadHandleUsernameMap(),
]).then(() => {
  // Frontend
  if (process.env.NODE_ENV === "production") {
    const getParent = (pathname) => path.dirname(pathname);
    const frontendBuild = path.join(getParent(__dirname), "frontend", "build");

    app.use(express.static(frontendBuild));

    app.get("/*", (_req, res) => {
      res.sendFile(path.join(frontendBuild, "index.html"));
    });
  }

  // Listen
  app.listen("3001", () => {
    console.log("Server Started on Port 3001");
  });
});
