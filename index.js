// replace this with the credentials of the Lync or Skype for Business account
// that will be used to send the Instant Message.  Change these to your own, as 
// they are not real!
var skype_username = "matthew@contoso.com";
var skype_password = "mypassword";

// this is the recipient to whom we'll send a message - retrieved from the querystring or HTTP POST data
var recipient = "";
// and this is the actual message  - retrieved from the querystring or HTTP POST data
var the_message = "";

// show_logs determines whether logs are sent to the logging_box div. Set to false
// to display logging.  Disabling logs improves performance somewhat.
var show_logs = true;


// function to extend jQuery to easily check for and return a querystring value
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}	
	
function pause(howlongfor){
    log("Pausing for " + howlongfor + "ms");
    var currentTime = new Date().getTime();
    while (currentTime + howlongfor >= new Date().getTime()) {      }
}

function nicetime() {
    var d = new Date();
    return padLeft(d.getHours(), 2) + ":" + padLeft(d.getMinutes(), 2) + ":" + padLeft(d.getSeconds(), 2) + ":" + padLeft(d.getMilliseconds(), 3);
}

function log(texttolog) {    
	if (show_logs){
		$('#logging_box').append(nicetime() + ": " + texttolog + "<br>");
	}
}
function padLeft(nr, n, str) { return Array(n - String(nr).length + 1).join(str || '0') + nr; }

$(function () {
    'use strict';

    var Application
    var client;
    var conversation;

    Skype.initialize({
        apiKey: 'SWX-BUILD-SDK',
    }, function (api) {
        Application = api.application;
        client = new Application();
        log("Client Created");
        
        // Check querystring for required variables - recipient and message

		if (getParameterByName('recipient')!=""){
			recipient = getParameterByName('recipient');
			log("Found Recipient: " + recipient);
		} else {
			log("No recipient found!");
			return;
		}
		
		if (getParameterByName('message')!=""){
			the_message = getParameterByName('message');
			log("Found message: " + the_message);
		} else {
			log("No message found!");
			return;
		}
		
		// Now check for optional variables - username and password
		if (getParameterByName('username')!=""){
			skype_username = getParameterByName('username');
			log("Found skype username: " + skype_username);
		} 
		if (getParameterByName('password')!=""){
			skype_password = getParameterByName('password');
			log("Found password.");
		} 

        log('Signing in ' + $('#address').text());
        client.signInManager.signIn({
            username: skype_username,skype_password
        }).then(function () {
            log('Logged In Successfully');
          
            //create a new conversation
            log("Creating a new Conversation");
            conversation = client.conversationsManager.createConversation();

            log("Starting chatService");
            conversation.chatService.start().then(function () {
                log('chatService started!');

                conversation.addParticipant("sip:" + recipient).then(function () {
                    log(recipient + " added!");

                    pause(1000);
                    log('Sending message: ' + the_message);
                    conversation.chatService.sendMessage(the_message).then(function () {
                        log('Message sent.');

                        pause(1000);

                        conversation.chatService.stop().then(function () {
                            log('chatService stopped.');
                        }).then(null, function (error) {
                            log('Error Stopping chatService:' + error);
                        });

                        log("Signing Out");
                        client.signInManager.signOut().then(
                            function () {
                                log('Signed out');
                            },
                        function (error) {
                            log('Error signing out:' + error);
                        });

                    }).then(null, function (error) {
                        log('Error Sending Message:' + error);
                    });                   
                    

                }).then(null, function (error) {
                    log('Error adding participant:' + error);
                });

            }).then(null, function (error) {
                log('Error starting chatService' + error);
            });                       
            
        }).then(null, function (error) {
            // if either of the operations above fails, tell the user about the problem
            log("Error signing in: "+error );
        });

    }, function (err) {
        log('some error occurred: ' + err);
    });

});
