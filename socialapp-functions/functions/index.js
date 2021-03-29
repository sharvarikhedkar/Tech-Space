const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { database } = require("firebase-admin");

const express = require('express');
const app = express();

//initializing application
admin.initializeApp();

//get documents from firestore
app.get('/screams', (req, res) => {
    admin
    .firestore()
    .collection("screams").get().then((data) => {
      //populating screams with the data created in firestore
      let screams = [];
      data.forEach((doc) => {
        screams.push({
            screamId: doc.id,
            body: doc.data().body,
            userHandle: doc.data().userHandle,
            createdAt: doc.data().createdAt 
        });
      });
      return res.json(screams);
    })
    .catch((err) => console.error(err));
})

//create a document
app.post('/scream',(req, res) => { 
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString()
  };

  admin
    .firestore()
    .collection("screams")
    .add(newScream)
    .then((doc) => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch((err) => {
      res.status(500).json({ error: "something went wrong" });
      console.err(err);
    });
});

//handle all app routes
exports.api = functions.https.onRequest(app); 