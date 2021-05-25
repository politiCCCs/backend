/*
 * COMP90024 Cluster and Cloud Computing
 * Group 5
 * Aleksandar Pasquini (912504)
 * Amelia Fleischer-Boermans (389511)
 * Isaac Daly (1129173)
 * Mahardini Rizky Putri (921790)
 * Richard Yang (1215150)
 */
"use strict";
// @ts-check

const express = require("express");
const fs = require("fs");
const path = require("path");
const NodeCouchDb = require("node-couchdb");
const util = require("util");
require("dotenv").config();

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
