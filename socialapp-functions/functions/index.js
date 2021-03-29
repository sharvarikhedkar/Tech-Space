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

//function to create a document
exports.createScream = functions.https.onRequest((req, res) => { 
  if(req.method !== 'POST'){
      return res.status(400).json({ error: 'Method not allowed'});
  }
const newScream = {
  body: req.body.body,
  userHandle: req.body.userHandle,
  createdAt: admin.firestore.Timestamp.fromDate(new Date()),
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