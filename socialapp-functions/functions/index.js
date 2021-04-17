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

const db = admin.firestore();

//get documents from firestore
app.get('/screams', (req, res) => {
    db
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

  db
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

  //Validate user handle 
  db.doc(`/users/${newUser.handle}`).get() 
    .then(doc => {
      if(doc.exists){
        return res.status(400).json({ handle: 'this handle is already taken'});
      } else {
        return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
      }

    })
    .then(data => {
      return data.user.getIdToken();
    })
    //return auth token
    .then(token => {
      return res.status(201).json({ token });
    })
    .catch((err) => {
      console.error(err);
      if(err.code === 'auth/email-already-in-use'){
        return res.status(400).json({email: 'Email is already in use'})
      }
      else{
        return res.status(500).json({error: err.code });
      }
      
    });
});

//handle all app routes
exports.api = functions.https.onRequest(app); 