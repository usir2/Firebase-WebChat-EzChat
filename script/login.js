
$(document)
.ready(function() {
  $("#login_error").hide();
  $("#btlogin").click(function(){

   signIn();

 });

});
window.onload = function() {
    initApp();

};

function signIn(){
  var txtEmail = $("#txtemail").val();
  var txtPassword = $("#txtpassword").val();
  var auth = firebase.auth();
  var promise = auth.signInWithEmailAndPassword(txtEmail,txtPassword);
  promise
  .catch(function(error) {
    $("#login_result").html( error.message);
    $("#login_error").show();
    //console.log(error.message);
  });
}

function initApp(){
  firebase.auth().onAuthStateChanged(function(user){
    // check user 
    if(user){
      var displayName = user.displayName;
      var email = user.email;
      var emailVerified = user.emailVerified;
      var photoURL = user.photoURL;
      var isAnonymous = user.isAnonymous;
      var uid = user.uid;
      var providerData = user.providerData;
      //get all 
      //console.log(JSON.stringify(user,null,''));
      if(emailVerified){
        window.location.href = "index.html";
      }
      else{
        $("#login_result").html("Please verify your email");
        $("#login_error").show();
        signOut();
      }
      console.log(emailVerified);

    }
  });
  
}

function signOut(){
  firebase.auth().signOut().then(function(){
    //$('#regsuccess_modal').modal('show');
    //console.log("register success");
  });
}


