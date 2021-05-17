const fs = require("fs");
const util = require("util");
const express = require("express");
const NodeCouchDb = require("node-couchdb");

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

//#region Politician data
const politicians = (view) => `_design/numVotesCorr/_view/${view}?group=true`;
const politicianRouter = express.Router();

politicianRouter
  .get("/count", (_req, res) => {
    console.log("getting View: Count per username (Politician)");
    couch.get(dbName, politicians`count`).then(
      (data) => res.send(data),
      (err) => {
        console.log(err);
        res.send(err);
      }
    );
  })
  .get("/avg-count", (_req, res) => {
    console.log("getting View: Average Count per username (Politician)");
    couch.get(dbName, politicians`count_ave`).then(
      (data) => res.send(data),
      (err) => {
        console.log(err);
        res.send(err);
      }
    );
  })
  .get("/likes", (_req, res) => {
    console.log("getting View: Likes per username (Politician)");
    couch.get(dbName, politicians`likes`).then(
      (data) => res.send(data),
      (err) => {
        console.log(err);
        res.send(err);
      }
    );
  })
  .get("/avg-likes", (_req, res) => {
    console.log("getting View: Average Likes per username (Politician)");
    couch.get(dbName, politicians`likes_ave`).then(
      (data) => res.send(data),
      (err) => {
        console.log(err);
        res.send(err);
      }
    );
  })
  .get("/retweets", (_req, res) => {
    console.log("getting View: Retweets per username (Politician)");
    couch.get(dbName, politicians`retweet`).then(
      (data) => res.send(data),
      (err) => {
        console.log(err);
        res.send(err);
      }
    );
  })
  .get("/avg-retweets", (_req, res) => {
    console.log("getting View: Average Retweets per username (Politician)");
    couch.get(dbName, politicians`retweet_ave`).then(
      (data) => res.send(data),
      (err) => {
        console.log(err);
        res.send(err);
      }
    );
  })
  .get("/sentiment", (_req, res) => {
    console.log("getting View: Sentiment per username (Politician)");
    couch.get(dbName, politicians`sentiment`).then(
      (data) => res.send(data),
      (err) => {
        console.log(err);
        res.send(err);
      }
    );
  })
  .get("/avg-sentiment", (_req, res) => {
    console.log("getting View: Average Sentiment per username (Politician)");
    couch.get(dbName, politicians`sentiment_ave`).then(
      (data) => res.send(data),
      (err) => {
        console.log(err);
        res.send(err);
      }
    );
  });

app.use("/politicians", politicianRouter);
//#endregion

//#region Global comparison
const globalRouter = express.Router();

globalRouter
  .get("/leaders", (_req, res) => {
    console.log("getting View: Leaders");
    couch.get(dbName, "_design/nonPoli/_view/all_groups_values_all_stats?group=true").then(
      (data) => res.send(data),
      (err) => {
        console.log(err);
        res.send(err);
      }
    );
  })

app.use("/global", globalRouter);
//#endregion

const readFilePromise = util.promisify(fs.readFile);

const loadShapeFile = async () => {
  const data = await readFilePromise("./assets/COM_ELB_region.json");
  const shapeFile = JSON.parse(data);

  app.get("/shapefile", (_req, res) => {
    res.send(shapeFile);
  });
};

const loadVotesByCandidate = async () => {
  const data = await readFilePromise("./assets/VotesByCandidate.csv");

  app.get("/votes-by-candidate.csv", (_req, res) => {
    res.header("Content-Type", "text/csv");
    res.send(data);
  });
};

const loadTwoPartyVotes = async () => {
  const data = await readFilePromise("./assets/TwoPartyVotes.csv");

  app.get("/two-party-votes.csv", (_req, res) => {
    res.header("Content-Type", "text/csv");
    res.send(data);
  });
};

const loadHandleUsernameMap = async () => {
  const data = await readFilePromise("./assets/handleNameMap.json");
  const file = JSON.parse(data);

  app.get("/handle-name-map", (_req, res) => {
    res.send(file);
  });
};

Promise.all([
  loadShapeFile(),
  loadVotesByCandidate(),
  loadTwoPartyVotes(),
  loadHandleUsernameMap(),
]).then(() => {
  app.listen("3001", () => {
    console.log("Server Started on Port 3001");
  });
});
