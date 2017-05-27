
$(document)
.ready(function() {
    $("#register_error").hide();
   $("#btregister").click(function(){
   var txtEmail = $("#txtemail").val();
   var txtPassword = $("#txtpassword").val();
   var txtConpassword = $("#txtconpassword").val();
   //Check validates 
   if(txtEmail==="" || txtEmail===null){
      $("#register_result").html( "Please enter Email!");
      $("#register_error").show();
    }else if(txtPassword.length <=6){
      $("#register_result").html( "Password request more than 6character!");
      $("#register_error").show();
    }else if(txtPassword==="" || txtPassword===null){
     $("#register_result").html( "Please enter password!");
      $("#register_error").show();
    }else if(txtPassword != txtConpassword){
      $("#register_result").html( "Password not match!");
      $("#register_error").show();    
    }else{
      var auth = firebase.auth();
      var promise = auth.createUserWithEmailAndPassword(txtEmail,txtPassword);
     promise
     .then(function() {
          insertUserData(txtEmail);
      })
     .catch(function(error) {
        $("#register_result").html( error.message);
        $("#register_error").show();
      });
    }

   
    
  });


});


window.onload = function() {
  //Check user auth when have loading this page
    initApp();

};

/**
 * [insertUserData Push user data to firebase(use check user is online or not)] 
 * @param  {[type]} email [email for push data to firebase]
 */
function insertUserData(email) {
  var firebaseRef = firebase.database().ref("User/");
  firebaseRef.push({
    email: email,
    connections: "",
    lastOnline: "",
    photo:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgV7qMrmizS-mkV5kZRcnQuXNJM0zx4TnFV-yYHiiid69B7WHB"

  });
  sendMail();
}

/**
 * [sendMail Send email for confirm user.] 
 */
function sendMail(){
  firebase.auth().currentUser.sendEmailVerification().then(function(){
    signOut();
  });
}

/**
 * [signOut Use for signout ] 
 */
function signOut(){
  firebase.auth().signOut().then(function(){
    $('#regsuccess_modal').modal('show');
  });
}


/**
 * [initApp Use for check user auth.] 
 */
function initApp(){
  firebase.auth().onAuthStateChanged(function(user){
    
    if(user){
      var displayName = user.displayName;
      var email = user.email;
      var emailVerified = user.emailVerified;
      var photoURL = user.photoURL;
      var isAnonymous = user.isAnonymous;
      var uid = user.uid;
      var providerData = user.providerData;
      
      /**
       * [if Check email verified or not.] 
       * @param  {[Boolean]} emailVerified [Status of email verified ] 
       */
      if(emailVerified){
        window.location.href = "index.html";
      }
      
      //console.log(emailVerified);

    }
  });
  
}
