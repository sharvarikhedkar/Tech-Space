const { admin, db } = require('../util/admin');

const firebase = require('firebase');
const config = require('../util/config');
firebase.initializeApp(config)

const { validateSignupData, validateLoginData, reduceUserDetails } = require('../util/validators');

exports.signup = (req, res) => {
    const newUser = {
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      handle: req.body.handle,
    };
  
    const { valid, errors } = validateSignupData(newUser);
    
    if(!valid) return res.status(400).json(errors);
     
    const noImg = 'blank-profile-picture.png'; 

    //Validate user handle
    let token, userId;
    db.doc(`/users/${newUser.handle}`)
      .get()
      .then((doc) => {
        if (doc.exists) {
          return res.status(400).json({ handle: "this handle is already taken" });
        } else {
          return firebase
            .auth()
            .createUserWithEmailAndPassword(newUser.email, newUser.password);
        }
      })
      .then((data) => {
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
          imageUrl:  `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
          userId,
        };
        //persist user credentials in users collection
        return db.doc(`/users/${newUser.handle}`).set(userCredentials);
      })
      .then(() => {
        return res.status(201).json({ token });
      })
      .catch((err) => {
        console.error(err);
        if (err.code === "auth/email-already-in-use") {
          return res.status(400).json({ email: "Email is already in use" });
        } else {
          return res.status(500).json({ error: err.code });
        }
      });
  }

  exports.login = (req, res) => {
    const user = {
      email: req.body.email,
      password: req.body.password,
    };

    //destructuring
    const { valid, errors } = validateLoginData(user);
    
    if(!valid) return res.status(400).json(errors);
  
    //on successful user signin, log in the user
    firebase
      .auth()
      .signInWithEmailAndPassword(user.email, user.password)
      .then((data) => {
        return data.user.getIdToken();
      })
      .then((token) => {
        return res.json({ token });
      })
      .catch((err) => {
        console.error(err);
        if (err.code === "auth/wrong-password") {
          return res
            .status(403)
            .json({ general: "Wrong credentials, please try again" });
        } else return res.status(500).json({ error: err.code });
      });
  }

  //Add user details
  exports.addUserDetails = (req, res) => {
    let userDetails = reduceUserDetails(req.body);

    db.doc(`/users/${req.user.handle}`).update(userDetails)
      .then(() => {
        return res.json({ message: 'Details added successfully'});
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ error: err.code });
      })
  }

  //upload a profile image for user
  exports.uploadImage = (req, res) => {
    const BusBoy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');

    const busboy = new BusBoy({ headers: req.headers})

    let imageFileName;
    let imageToBeUploaded = {};
    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      //handle image files
      if(mimetype !== 'image/png' && mimetype !== 'image/jpeg'){
        return res.status(400).json({error: 'Wrong file type submitted'});
      }
      const imageExtension = filename.split('.')[filename.split('.').length - 1];
      imageFileName = `${Math.round(Math.random()*1000000000)}.${imageExtension}`;  
      const filepath = path.join(os.tmpdir(), imageFileName);
      imageToBeUploaded = { filepath, mimetype };
      //create a file using filesystem library
      file.pipe(fs.createWriteStream(filepath));
    });
    busboy.on('finish', () => {
      //upload created file
      admin.storage().bucket().upload(imageToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype
          }
        }
      })
      .then(() => {
        //contructing image url
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
        return db.doc(`/users/${req.user.handle}`).update({ imageUrl });
      })
      .then(() => {
        return res.json({ message: 'Image uploaded successfully '});
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ error:err.code });
      });
    });
    busboy.end(req.rawBody);
  };