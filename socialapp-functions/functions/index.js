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
const { json } = require("express");
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

//helper function to check empty string 
const isEmpty = (string) => {
  if(string.trim() === '') return true;
  else return false
}

//helper function to check valid email 
const isEmail = (email) => {

  //using regex that matches a pattern of an email 
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  if (email.match(regEx)) return true;
  else return false;
}

//Signup route 
app.post('/signup', (req, res) => {
   
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  let errors = {};

  //validate email
  if (isEmpty(newUser.email)){
    //set property in errors object
    errors.email = 'Must not be empty'
  } else if(!isEmail(newUser.email)){
    errors.email = 'Must be a valid email address';
  } 

  //validation for other fields
  if(isEmpty(newUser.password)) errors.password = 'Must not be empty';
  if(newUser.password !== newUser.confirmPassword) errors.confirmPassword = 'Passwords must match';
  if(isEmpty(newUser.handle)) errors.handle = 'Must not be empty';

  if(Object.keys(errors).length > 0) return res.status(400).json(errors); 

  //Validate user handle 
  let token, userId;
  db.doc(`/users/${newUser.handle}`).get() 
    .then(doc => {
      if(doc.exists){
        return res.status(400).json({ handle: 'this handle is already taken'});
      } else {
        return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
      }

    })
    .then(data => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    //return user credentials
    .then((idToken) => {
      token = idToken;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId
      };
      //persist user credentials in users collection 
      return db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
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

//login route 
app.post('/login', (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };

  //login route validation
  let errors = {};

  if(isEmpty(user.email)) errors.email = 'Must not be empty';
  if(isEmpty(user.password)) errors.password = 'Must not be empty';

  if(Object.keys(errors).length > 0) return res.status(400).json(errors);

  //on successful user signin, log in the user 
  firebase.auth().signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return res.json({token});
    })
    .catch((err) => {
      console.error(err);
      if(err.code === 'auth/wrong-password'){
        return res.status(403).json({general: 'Wrong credentials, please try again'});
      } else return res.status(500).json({error: err.code})
    }) 

})

//handle all app routes
exports.api = functions.https.onRequest(app); 