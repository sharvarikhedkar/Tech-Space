//helper function to check empty string
const isEmpty = (string) => {
    if (string.trim() === "") return true;
    else return false;
  };
  
  //helper function to check valid email
  const isEmail = (email) => {
    //using regex that matches a pattern of an email
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  
    if (email.match(regEx)) return true;
    else return false;
  };

  exports.validateSignupData = (data) => {
    let errors = {};
  
    //validate email
    if (isEmpty(data.email)) {
      //set property in errors object
      errors.email = "Must not be empty";
    } else if (!isEmail(data.email)) {
      errors.email = "Must be a valid email address";
    }
  
    //validation for other fields
    if (isEmpty(data.password)) errors.password = "Must not be empty";
    if (data.password !== data.confirmPassword)
      errors.confirmPassword = "Passwords must match";
    if (isEmpty(data.handle)) errors.handle = "Must not be empty";

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false 
    }
  }

  //login route validation
  exports.validateLoginData = (data) => {
      
    let errors = {};
  
    if (isEmpty(user.email)) errors.email = "Must not be empty";
    if (isEmpty(user.password)) errors.password = "Must not be empty";

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false 
    }
  }