var ses_email,ses_key,ses_photo;
var friend_key,friend_email,friend_photo;
var key_user_send;

$( document ).ready(function() {
	$('body').on('click','.addFriend',function(){

		 friend_key = $(this).attr('data-value');
		 friend_email = $(this).text();
		 friend_photo =$(this).attr('name');

		 checkIsFriend(friend_key,friend_email,friend_photo);
	});
	$('body').on('click','.acceptFriend',function(){

		 friend_key = $(this).attr('data-value');
		 friend_email = $(this).text();
		 friend_photo =$(this).attr('name');

		$("#friend_photo2").attr('src',friend_photo);
		$("#friend_name2").text(friend_email);
		$('#modal2')
		.modal('setting', 'transition', "vertical flip")
  		.modal('show');



	});
	$('body').on('click','.chat_select',function(){
		$("#chat_box").html('<div class="ui active inverted dimmer">\
		    <div class="ui large text loader">Loading</div>\
		  </div>\
		  <p></p>\
		  <p></p>\
		  <p></p>\
		');
		var key_friend = $(this).attr('value');
		$('#text_message').val("");
		$("#bt_send").addClass('disabled');

		key_user_send = key_friend;
		checkChat(key_friend);
	});

	$("#bt_send").click(function(){
		var message = $("#text_message").val();
		saveSendMessage(key_user_send,message);
	});
	$('#text_message').keyup(function(){
		var message = $(this).val();
		console.log(key_user_send);
		if(message==="" || key_user_send===undefined){
			$("#bt_send").addClass('disabled');
		}else{
			$("#bt_send").removeClass('disabled');
		}
	});

	$('#bt_addfrined').click(function(){
		addFriendToFirebase(friend_key);
	});	

	$('#bt_acceptFriend').click(function(){
		acceptFriendToFirebase(friend_key);
	});
	$("#profile_img").mouseover(function(){
		$("#profile_img").attr('src','images/upload_img.png');
	});

	$("#profile_img").mouseleave(function(){
				$("#profile_img").attr('src',ses_photo);
	});

	$("#profile_img").click(function(){
		fileButton.click();
	});
	
	$('.dropdown').dropdown({
    action: 'hide'
	});
	$("#sidebar_icon").click(function(){
		$('.ui.labeled.icon.sidebar').sidebar('toggle');
	});
	
	$("#bt_logout").click(function(){
		if(firebase.auth().currentUser){
			firebase.auth().signOut().then(function(){
				window.location.href = "login.html";
			});
		}
	});

	//Upload Profile Picture
	$("#fileButton").change(function(e){
		firebase.auth().onAuthStateChanged(function(user){
		//get file
		var file = e.target.files[0];
		//create a storage ref
		var storageRef = firebase.storage().ref(user.email+'/profile/'+file.name);
    	//upload file
    	var task = storageRef.put(file);
    	//update progress bar 
    	task.on('state_changed',
    		function progress(snapshot){
			var percentage = (snapshot.bytesTransferred/snapshot.totalBytes)*100;
				$('#bar_upload').show();
    			$('#bar_upload').progress({

				  percent: percentage
				});
    			$("#lebel_bar_upload").text("Uploading");
    			$("#lebel_bar_upload").css("color","blue");
    			//$("#uploader").val(percentage);
    		},
    		function error(err){

    		},
    		function complete(){
    			//alert("upload complete");
    			//console.log(user.email);
    			getProfileURL(user.email,file.name);
    			$("#lebel_bar_upload").text("Updated");
    			$("#lebel_bar_upload").css("color","green");


				setTimeout(function() {
				$('#bar_upload').hide();
				}, 2000);	
    		}
    		);
    	});
	});
	
});

window.onload = function() {
  	initApp();

};


function initApp(){
	firebase.auth().onAuthStateChanged(function(user){
    // check user 
    if(!user){
    	window.location.href = "login.html";
    }
    else{
    	//console.log(JSON.stringify(user,null,''));
    	$("#email_header").text(user.email);
    	ses_email = user.email;

    	showData(user.email);

    }
});

}

function checkOnlineUser(key_user){
	var myConnectionsRef = firebase.database().ref('User/'+key_user+'/connections');
	var lastOnlineRef = firebase.database().ref('User/'+key_user+'/lastOnline');

	var connectedRef = firebase.database().ref('.info/connected');
	connectedRef.on('value', function(snap) {
		if (snap.val() === true) {
			console.log("online:"+snap.val()+"key:"+key_user);
			var con = myConnectionsRef.push(true);
			con.onDisconnect().remove();
			lastOnlineRef.onDisconnect().set(firebase.database.ServerValue.TIMESTAMP);
		}
	});
}

function showData(email) {
  var firebaseRef = firebase.database().ref("User");
  var key_user;
  firebaseRef.once('value').then(function(dataSnapshot) {
    dataSnapshot.forEach(function(childSnapshot) {
      var childKey = childSnapshot.key;
      var childData = childSnapshot.val();
		//console.log(childData.lastOnline);
      
      if(childData.email==email){
      	key_user=childKey;
      	ses_key=childKey;
      	ses_photo=childData.photo;
      	updateProfileTag(childData.photo);

      }
      else{
      	console.log(childData.photo);
      	addUsertoSearch(childKey,childData.email,childData.photo);
      }
    });
      	checkOnlineUser(key_user);
      	  snapProfilePic(ses_key);
      	  realTimeAdd(ses_key);

  });

}

function addUsertoSearch(key,email,photo_url){

	if(photo_url===""||photo_url===null||photo_url ===undefined ){
		$("#user_list").append('<div class="item addFriend" data-value="'+key+'">'+'<img id="img_short"  class="ui avatar image" src="https://semantic-ui.com/images/avatar/small/matt.jpg">\
'+email+'</div>');


	}else{
	$("#user_list").append('<div class="item addFriend" name="'+photo_url+'"data-value="'+key+'">'+'<img  class="ui avatar image" src="'+photo_url+'">\
'+email+'</div>');
	}
}

function getProfileURL(email,file_name){
	//get image link
	var storageRef = firebase.storage().ref(email+'/profile/'+file_name);
	storageRef.getDownloadURL().then(function(url){
		//console.log(url);
		// updateProfile
		updateProfileFB(url,ses_key);
		   		  

	}).catch(function(error){
		console.log(error);
	});
	//-----------------------------------------------------------------


}

function updateProfileFB(url,key_user){
	var firebaseRef = firebase.database().ref("User/"+key_user+"/photo");
  	firebaseRef.set(url);
  	
}

function updateProfileTag(photo_url){

	$("#profile_img").attr('src',photo_url);
		$("#loader_icon").hide();

	$("#profile_img").show();

}

function Toast(text){
	$.toast({ 
  text : text, 
  showHideTransition : 'slide',  // It can be plain, fade or slide
  bgColor : 'green',              // Background color for toast
  textColor : '#eee',            // text color
  allowToastClose : false,       // Show the close button or not
  hideAfter : 5000,              // `false` to make it sticky or time in miliseconds to hide after
  stack : 5,                     // `fakse` to show one stack at a time count showing the number of toasts that can be shown at once
  textAlign : 'center',            // Alignment of text i.e. left, right, center
  position : 'bottom-center'       // bottom-left or bottom-right or bottom-center or top-left or top-right or top-center or mid-center or an object representing the left, right, top, bottom values to position the toast on page
	});
}

function snapProfilePic(key_user){
		var firebaseRef = firebase.database().ref().child("User");
		var firebaseChildRef = firebaseRef.child(key_user+"/photo");
		firebaseChildRef.on('value', function(snap) {
			$("#profile_img").attr('src',snap.val());
			ses_photo = snap.val();
			
		});
}

function addFriendToFirebase(friend_key){
	var firebaseRef = firebase.database().ref("Friends/"+ses_key+"/"+friend_key);
	firebaseRef.set({
	    request_flag: "request",
	    status: false
	});

	var firebaseRefFriend = firebase.database().ref("Friends/"+friend_key+"/"+ses_key);

	 firebaseRefFriend.set({
	    request_flag: "get",
	    status: false
	});
	 	$('#bt_addfrined').removeClass("green");
		$('#bt_addfrined').removeClass("red");
		$('#bt_addfrined').text("Requested");

	 Toast("Send Request");
}

function checkIsFriend(friend_key,friend_email,friend_photo){
	var status;
	var firebaseRef = firebase.database().ref("Friends/"+ses_key+"/"+friend_key);
		firebaseRef.once('value').then(function(dataSnapshot) {

			var data = dataSnapshot.val();
			if(data!==null){
				if(data.status===false&&data.request_flag=="get"){
				$("#friend_photo2").attr('src',friend_photo);
				$("#friend_name2").text(friend_email);
				$('#modal2')
				.modal('setting', 'transition', "vertical flip")
		  		.modal('show');
		  		}
				else if(data.status===false){
				$('#bt_addfrined').show();
				$('#bt_addfrined').removeClass("green");
				$('#bt_addfrined').addClass("red");
				$('#bt_addfrined').text("Requested");
				$('#bt_addfrined').attr('disabled', 'true');
				$("#friend_photo").attr('src',friend_photo);
				$("#friend_name").text(friend_email);
				$('#modal1')
				.modal('setting', 'transition', "vertical flip")
		  		.modal('show');
			
			}else if(data.status===true){
				$('#bt_addfrined').hide();
				$("#friend_photo").attr('src',friend_photo);
				$("#friend_name").text(friend_email);
				$('#modal1')
				.modal('setting', 'transition', "vertical flip")
		  		.modal('show');
			}else{
				$('#bt_addfrined').show();
				$('#bt_addfrined').removeClass("red");
				$('#bt_addfrined').addClass("green");
				$('#bt_addfrined').text("ADD");
				$("#friend_photo").attr('src',friend_photo);
				$("#friend_name").text(friend_email);
				$('#modal1')
				.modal('setting', 'transition', "vertical flip")
		  		.modal('show');
			}
			
		}else{
				$("#friend_photo").attr('src',friend_photo);
				$("#friend_name").text(friend_email);
				$('#modal1')
				.modal('setting', 'transition', "vertical flip")
		  		.modal('show');
		}
			
			
	});


		

}

function realTimeAdd(ses_key){
	var firebaseRef = firebase.database().ref("Friends/"+ses_key);
	
		firebaseRef.on('value', function(dataSnapshot) {
			var count_alert=0;
			$("#alert_list").html("");
			$("#list_friend").html("");
			dataSnapshot.forEach(function(childSnapshot) {
	      		var childKey = childSnapshot.key;
	      		var childData = childSnapshot.val();
				if(childData.request_flag==="get" && childData.status===false){
					count_alert +=1;
					checkUserDetail(childKey);
				}else if(childData.status===true){
					
                    checkUserDetailFriendList(childKey);

				}
  			});
  			$("#num_alert").text(count_alert);
		});

}


function checkUserDetail(key_user_check) {
  var firebaseRef = firebase.database().ref("User/"+key_user_check);
		firebaseRef.once('value').then(function(dataSnapshot) {
			var data = dataSnapshot.val();
			//console.log(dataSnapshot.key+data.email+data.photo);
			addUserToAcceptTab(dataSnapshot.key,data.email,data.photo);
		});
}
function checkUserDetailFriendList(key_user_check){
	
	var firebaseRef = firebase.database().ref("User/"+key_user_check);
		firebaseRef.once('value').then(function(dataSnapshot) {
			var data = dataSnapshot.val();
			if(data.connections){
				console.log("online");
			}else{
				console.log("offline");
			}
			var res_email = data.email.split("@");

			$("#list_friend").append('<a class="item chat_select" value="'+key_user_check+'">\
            <img class="ui avatar image" src="'+data.photo+'"> '+data.email+'\
            <i id="'+res_email[0]+'_status"></i></a>');

            console.log("ok");
            checkUserConnection(dataSnapshot.key);

		});
}

function addUserToAcceptTab(key,email,photo_url){
	if(photo_url===""||photo_url===null||photo_url ===undefined ){
		$("#alert_list").append('<div class="item acceptFriend" data-value="'+key+'">'+'<img class="ui avatar image" src="https://semantic-ui.com/images/avatar/small/matt.jpg">\
'+email+'</div>');
	}else{
	$("#alert_list").append('<div class="item acceptFriend" name="'+photo_url+'"data-value="'+key+'">'+'<img  class="ui avatar image" src="'+photo_url+'">\
'+email+'</div>');
	}
}

function acceptFriendToFirebase(friend_key){
	var firebaseRefFriend = firebase.database().ref("Friends/"+ses_key+"/"+friend_key);

	 firebaseRefFriend.set({
	 	request_flag: "get",
	    status: true
	});

	 var firebaseRefFriend2 = firebase.database().ref("Friends/"+friend_key+"/"+ses_key);

	 firebaseRefFriend2.set({
	 	request_flag: "request",
	    status: true
	});

	  $("#modal2").modal('hide');
		 Toast("Have New Friend !!");
}

function checkChat(key_friend){
	//console.log(key_friend);
	var firebaseRef = firebase.database().ref("Messages/"+ses_key+"/"+key_friend);
		console.log(key_user_send);
			firebaseRef.on('value', function(dataSnapshot) {
			var count_alert=0;
			var datasnapkey = dataSnapshot.key;
			if(key_user_send === key_friend){
				$("#chat_box").html("");
			}
			dataSnapshot.forEach(function(childSnapshot) {
	      		var childKey = childSnapshot.key;
	      		var childData = childSnapshot.val();
	      		var name = childData.name;
	      		var photo = childData.photo;
	      		var text = childData.text;
	      		//console.log(childKey);
	      		if(name===ses_email && key_user_send === key_friend ){

	      			$("#chat_box").append('<div class="container" style="padding-left:53%;width:100%;">\
                    <div class="ui card" style="display: inline-flex;">\
                        <div class="card">\
                            <div class="content" >\
                                <div class="description compact" style="float:right;">'+text+'\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                     <img class="ui avatar image "  src="'+photo+'">\
                   </div><br>');
	      		}


				else if(name!==ses_email && key_user_send === key_friend ){
					$("#chat_box").append('<div class="container" style="float:left;width:100%;">\
                    <img class="ui avatar image" src="'+photo+'" >\
                    <div class="ui card" style="display: inline-flex">\
                        <div class="card">\
                            <div class="content">\
                                <div class="description">'+text+'\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                    </div><br>');
				}
  			});
  			$("#chat_box").scrollTop($('#chat_box')[0].scrollHeight);
		});

	start=false;
}

function saveSendMessage(key_user_send,message){
 	console.log(ses_email+message+ses_photo);

 	var firebaseRefFriend = firebase.database().ref("Messages/"+ses_key+"/"+key_user_send);

	 firebaseRefFriend.push({
	 	name: ses_email,
	    text: message,
	    photo: ses_photo
	});

	 var firebaseRefFriend2 = firebase.database().ref("Messages/"+key_user_send+"/"+ses_key);

	 firebaseRefFriend2.push({
	 	name: ses_email,
	    text: message,
	    photo: ses_photo
	});
	 $("#text_message").val("");
	 $("#bt_send").addClass('disabled');

}

function checkUserConnection(key_user_check){
	var firebaseRef = firebase.database().ref("User/"+key_user_check);
		firebaseRef.on('value', function(dataSnapshot) {
			var data = dataSnapshot.val();
			var res_email = data.email.split("@");
			if(data.connections){
				$("#"+res_email[0]+"_status").html('<a class="ui green label">ONLINE</a>');
				console.log("online");
			}else{
				$("#"+res_email[0]+"_status").html('<a class="ui red label">OFFLINE</a>');

				console.log("offline");
			}
			console.log(res_email[0]+"_status");
		});
}