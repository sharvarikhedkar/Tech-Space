const { admin, db } = require('./admin');


//Authentication middleware
module.exports = (req, res, next) => {
    let idToken;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      console.log;
      //extract idToken
      idToken = req.headers.authorization.split("Bearer ")[1];
    } else {
      console.error("No token found");
      return res.status(403).json({ error: "Unauthorized" });
    }
  
    admin
      .auth()
      .verifyIdToken(idToken)
      .then((decodedToken) => {
        req.user = decodedToken;
        
        return (
          db
            .collection("users")
            .where("userId", "==", req.user.uid)
            //limits results to just one document
            .limit(1)
            .get()
        );
      })
      .then((data) => {
        //.data() extracts data from this document
        req.user.handle = data.docs[0].data().handle;
        req.user.imageUrl = data.docs[0].data().imageURL;
        return next();
      })
      .catch((err) => {
        console.error("Error while verifying the token", err);
        return res.status(403).json(err);
      });
  };
  