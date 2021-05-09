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

app.get("/", function (_req, res) {
  //takes req and response
  console.log("getting View: Count per username (Politician)");
  couch.get(dbName, "_design/numVotesCorr/_view/count?group=true").then(
    //If success!
    function (data) {
      console.log(data.data.rows);
      // console.log(data);
      // res.render('index',{ //render view with res.render
      //     // tweet_database2:data.data.rows //pass along data that was returned.
      //     tweetv2:data.data.rows
      // });
    },
    //error
    function (err) {
      //if an error, pass through error
      console.log(err);
      res.send(err);
    }
  );
});

app.get("/", function (_req, res) {
  //takes req and response
  console.log("getting View: Average Count per username (Politician)");
  couch.get(dbName, "_design/numVotesCorr/_view/count_ave?group=true").then(
    //If success!
    function (data) {
      console.log(data.data.rows);
      // console.log(data);
      // res.render('index',{ //render view with res.render
      //     // tweet_database2:data.data.rows //pass along data that was returned.
      //     tweetv2:data.data.rows
      // });
    },
    //error
    function (err) {
      //if an error, pass through error
      console.log(err);
      res.send(err);
    }
  );
});

app.get("/", function (_req, res) {
  //takes req and response
  console.log("getting View: Likes per username (Politician)");
  couch.get(dbName, "_design/numVotesCorr/_view/likes?group=true").then(
    //If success!
    function (data) {
      console.log(data.data.rows);
      // console.log(data);
      // res.render('index',{ //render view with res.render
      //     // tweet_database2:data.data.rows //pass along data that was returned.
      //     tweetv2:data.data.rows
      // });
    },
    //error
    function (err) {
      //if an error, pass through error
      console.log(err);
      res.send(err);
    }
  );
});

app.get("/", function (_req, res) {
  //takes req and response
  console.log("getting View: Average Likes per username (Politician)");
  couch.get(dbName, "_design/numVotesCorr/_view/likes_ave?group=true").then(
    //If success!
    function (data) {
      console.log(data.data.rows);
      // console.log(data);
      // res.render('index',{ //render view with res.render
      //     // tweet_database2:data.data.rows //pass along data that was returned.
      //     tweetv2:data.data.rows
      // });
    },
    //error
    function (err) {
      //if an error, pass through error
      console.log(err);
      res.send(err);
    }
  );
});

app.get("/", function (_req, res) {
  //takes req and response
  console.log("getting View: Retweets per username (Politician)");
  couch.get(dbName, "_design/numVotesCorr/_view/retweet?group=true").then(
    //If success!
    function (data) {
      console.log(data.data.rows);
      // console.log(data);
      // res.render('index',{ //render view with res.render
      //     // tweet_database2:data.data.rows //pass along data that was returned.
      //     tweetv2:data.data.rows
      // });
    },
    //error
    function (err) {
      //if an error, pass through error
      console.log(err);
      res.send(err);
    }
  );
});

app.get("/", function (_req, res) {
  //takes req and response
  console.log("getting View: Average Retweets per username (Politician)");
  couch.get(dbName, "_design/numVotesCorr/_view/retweet_ave?group=true").then(
    //If success!
    function (data) {
      console.log(data.data.rows);
      // console.log(data);
      // res.render('index',{ //render view with res.render
      //     // tweet_database2:data.data.rows //pass along data that was returned.
      //     tweetv2:data.data.rows
      // });
    },
    //error
    function (err) {
      //if an error, pass through error
      console.log(err);
      res.send(err);
    }
  );
});

app.get("/", function (_req, res) {
  //takes req and response
  console.log("getting View: Sentiment per username (Politician)");
  couch.get(dbName, "_design/numVotesCorr/_view/sentiment?group=true").then(
    //If success!
    function (data) {
      console.log(data.data.rows);
      // console.log(data);
      // res.render('index',{ //render view with res.render
      //     // tweet_database2:data.data.rows //pass along data that was returned.
      //     tweetv2:data.data.rows
      // });
    },
    //error
    function (err) {
      //if an error, pass through error
      console.log(err);
      res.send(err);
    }
  );
});

app.get("/", function (_req, res) {
  //takes req and response
  console.log("getting View: Average Sentiment per username (Politician)");
  couch.get(dbName, "_design/numVotesCorr/_view/sentiment_ave?group=true").then(
    //If success!
    function (data) {
      console.log(data.data.rows);
      // console.log(data);
      // res.render('index',{ //render view with res.render
      //     // tweet_database2:data.data.rows //pass along data that was returned.
      //     tweetv2:data.data.rows
      // });
    },
    //error
    function (err) {
      //if an error, pass through error
      console.log(err);
      res.send(err);
    }
  );
});

app.listen("3001", () => {
  console.log("Server Started on Port 3001");
});
