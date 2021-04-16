const functions = require("firebase-functions");
const admin = require("firebase-admin");
const app = require('express')();
const { database } = require("firebase-admin");
admin.initializeApp();

const config = {
  apiKey: "AIzaSyBl7WfnmvkYH9wjPYefHvT8aKkD65GZBHg",
  authDomain: "socialapp-bc6bd.firebaseapp.com",
  databaseURL: "https://socialapp-bc6bd-default-rtdb.firebaseio.com",
  projectId: "socialapp-bc6bd",
  storageBucket: "socialapp-bc6bd.appspot.com",
  messagingSenderId: "752702007482"
  // appId: "1:752702007482:web:7dfee6cd04ea047503fa83",
  // measurementId: "G-TW8E40PZTW"
};


const firebase = require('firebase');
firebase.initializeApp(config)

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

//Signup route 
app.post('/signup', (req, res) => {
   
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  //TODO Validate data

  //signing up users 
  firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
    .then(data => {
      return res.status(201).json({ message: `user ${data.user.uid} signed up successfully`});
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({error: err.code});
    });
});

//handle all app routes
exports.api = functions.https.onRequest(app); 