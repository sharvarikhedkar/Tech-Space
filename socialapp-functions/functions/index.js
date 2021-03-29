const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { database } = require("firebase-admin");

//initializing application
admin.initializeApp();

//func for fetching screams created in firestore or to get documents from firestore
exports.getScreams = functions.https.onRequest((req, res) => {
  admin
    .firestore()
    .collection("screams")
    .get()
    .then((data) => {
      //populating screams with the data created in firestore
      let screams = [];
      data.forEach((doc) => {
        screams.push(doc.data());
      });
      return res.json(screams);
    })
    .catch((err) => console.error(err));
});