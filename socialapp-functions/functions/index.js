const functions = require("firebase-functions");

const app = require("express")();

const { getAllScreams, postOneScream, getScream } = require("./handlers/screams");
const {
  signup,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
} = require("./handlers/users");

const FBAuth = require("./util/fbAuth");

//scream routes
app.get("/screams", getAllScreams);
app.post("/scream", FBAuth, postOneScream);
app.get('/scream/:screamId',getScream);
//TODO: delete scream
//TODO: like a scream
//TODO: unlike a scream
//TODO: comment on scream

//Users routes - Signup and login route
app.post("/signup", signup);
app.post("/login", login);
app.post("/user/image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);
app.get("/user", FBAuth, getAuthenticatedUser);

//handle all app routes
exports.api = functions.https.onRequest(app);
