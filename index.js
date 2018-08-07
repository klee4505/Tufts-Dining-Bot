var express = require('express')
var bodyParser = require('body-parser');
var https = require('https');
var fb = require('fb-messenger');
var request = require('request');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xhr = new XMLHttpRequest();

var PORT = process.env.PORT || 8888
var app = express();

var verificationController = require('./controllers/verification');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var token = "EAAB46hvOsZBsBAGZAtDTJQpolDQmwLOZBNv3SCqir12X4Ua2KO45SbA3alIDkUqD9qdO4oFmEpVfXuZBW46eFrBtdBmER2Uvt2z0tY6OJ7CTG3lfWkfukiMyqaBIPXnU4JEEIh0aVwa05NV3J9Ej23HURbQ8lzuiyvsNKXB5ommhYiOIbK3B";
/*app.set('port', PORT);
app.use(express.static(__dirname + '/public'));

app.set('views', __dirname + 'views');
app.set('view engine', 'ejs')
*/

// function get_dininghall_data() {
// 	var dining_hall_name = ____;
// 	var url_menu = ____;

// 	https.get(function(request, response) {

// 	})
// }

// // Enable CORS
// app.use(function(request, response, next) {
// 	response.header("Access-Control-Allow-Origin", "*");
// 	response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
// 	next();
// });

var help_aliases = ["help", "helper", "man", "manual", "tutorial", "assistance", "sos", "help me", "im stuck", "i'm stuck", "what"];
var greetings_aliases = ["hello", "hi", "hii", "greetings", "salutations", "hey"];
var how_are_you_aliases = ["how are you", "how are you?", "what's up?", "whats up", "whats good", "what's good", "whats up!"];
var thankyou_aliases = ["thanks", "thank you", "thank you very much", "ty", "thankyou"];

app.use(express.static(__dirname));

function initMenu(hall) {
	var dateObj = new Date();
    var month = dateObj.getMonth() + 1;
    var day = dateObj.getDate();
    var year = dateObj.getFullYear();
    var newDate = day + "/" + month + "/" + year;
    var url = "https://tuftsdiningdata.herokuapp.com/menus/";
    
    if (hall == 'carm')
    	url = url + "carm/" + newDate;
    else if (hall == 'dewick')
    	url = url + "carm/" + newDate;

    var sendInfo;
    var jsonInfo;

    var xhr = new XMLHttpRequest();

    xhr.open('GET', newUrl, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("menu").innerHTML = this.responseText;
            jsonInfo = JSON.parse(xhr.responseText);
            var menu = jsonInfo['data'];
            var lunch = menu.Lunch;
            var dinner = menu.Dinner;
            var breakfast = menu.Breakfast;
            console.log(lunch);
        }
    };
    xhr.send();
    return sendInfo;
}


app.get('/', function(request, response) {
	response.send("Welcome to Tufts Dining Bot!");
});

app.get('/carm', function(request, response) {
	response.sendFile('carm.html', {root: __dirname});
});

app.get('/dewick', function(request, response) {
	response.sendFile('dewick.html', {root: __dirname});
});


app.get('/webhook', verificationController);

app.post('/webhook', function(request, response) {
	var messaging_events = request.body.entry[0].messaging;
	console.log(JSON.stringify(messaging_events));
	for (let i = 0; i < messaging_events.length; i++) {
		let event = messaging_events[i];
		let sender = event.sender.id;
		if (event.message && event.message.text) {
			let text = event.message.text;
			console.log('text:' + text);
			if (text.substring(0,4).toLowerCase() == "menu") {
				sendMenu(sender, text.substring(5,100));
			}
			else if (text.substring(0,11).toLowerCase() == "ingredients") {
				sendIngredients(sender, text.substring(12,100));
			}
			else {
				sendText(sender, text.substring(0,100));
			}
		}
		response.sendStatus(200);
	}

});

function sendMenu(sender, text) {
	var messageData;
	if (text.toLowerCase() == "carm" || text.toLowerCase() == "carmichael")
		messageData = {text: "Here is your menu for Carmichael Dining Hall: https://tufts-dining-bot.herokuapp.com/carm"};
	else if (text.toLowerCase() == "dewick")
		messageData = {text: "Here is your menu for Dewick Dining Hall: https://tufts-dining-bot.herokuapp.com/dewick"};
	else
		messageData = {text: "Sorry I didn't get that. Try 'help' for more options!"};
	request({
		url: "https://graph.facebook.com/v2.6/me/messages",
		qs: {access_token: token},
		method: "POST",
		json: {
			recipient: {id: sender},
			message: messageData
		}
	}, function(error, response, body) {
		if (error)
			console.log('error in sending text');
		else if (response.body.error)
			console.log('response body error');
	})
}

function sendIngredients(sender, text) {
	console.log(text);
	var messageData;
	var ingredientsData = "";
	var jsonInfo;
    var url = "https://tuftsdiningdata.herokuapp.com/ingredients/"

    xhr.open('GET', url + text, false);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            jsonInfo = JSON.parse(xhr.responseText);
            if (jsonInfo['error'] == 'Food not found.') {
            	messageData = {text: "Sorry, no food item found."}
            }
            else {
            	ingredientsData = "Name: " + JSON.stringify(jsonInfo.name) + " (calories: " + JSON.stringify(jsonInfo.calories) + ")";
            	for(var i = 0; i < jsonInfo["ingredients"].length; i++) {
            		console.log(jsonInfo["ingredients"][i]);
                	ingredientsData = ingredientsData + "\u000A   - " + JSON.stringify(jsonInfo["ingredients"][i]);
               	}
	            messageData = {text: ingredientsData};
        	}
        	// else {
         //    	ingredientsData = "Name: " + JSON.stringify(jsonInfo.name) + " (calories: " + JSON.stringify(jsonInfo.calories) + ")";
         //    	for(var i = 0; i < jsonInfo["ingredients"].length; i++) {
         //    		console.log(JSON.stringify(jsonInfo["ingredients"][i]).substring(2,6));
         //    		console.log(JSON.stringify(jsonInfo["ingredients"][i]).substring(8,JSON.stringify(jsonInfo["ingredients"][i]).indexOf(" ")))
         //    		if (JSON.stringify(jsonInfo["ingredients"][i]).substring(2,6) == "name")
         //        		ingredientsData = ingredientsData + "\u000A   - " + JSON.stringify(jsonInfo["ingredients"][i]).substring(8,JSON.stringify(jsonInfo["ingredients"][i]).indexOf(" "));
         //        	if (JSON.stringify(jsonInfo["ingredients"][i]).substring(2,16) == "subingredients") {
         //        		ingredientsData = ingredientsData + "\u000ASubingredients:";
         //        		for (var j = 0; j < jsonInfo["ingredients"]["subingredients"].length; j++) {
         //        			ingredientsData = ingredientsData + "\u000A   - " + JSON.stringify(jsonInfo["ingredients"]["subingredients"][j]).substring(8,JSON.stringify(jsonInfo["ingredients"]["subingredients"][j]).indexOf(" "));
         //        		}
         //        	}

         //       	}
	        //     messageData = {text: ingredientsData};
        	// }
        }
    };
    xhr.send();

	request({
		url: "https://graph.facebook.com/v2.6/me/messages",
		qs: {access_token: token},
		method: "POST",
		json: {
			recipient: {id: sender},
			message: messageData
		}
	}, function(error, response, body) {
		if (error)
			console.log('error in sending text');
		else if (response.body.error)
			console.log('response body error');
	})
}

function sendText(sender, text) {
	var messageData;
	if (help_aliases.includes(text.toLowerCase())) {
		messageData = {text: "Here are your list of commands:\u000A\u000A   - 'Menu [carm/dewick]'\u000A   - 'Ingredients [foodtype]'\u000A   - 'Help'"};
	}
	else if (greetings_aliases.includes(text.toLowerCase())) {
		messageData = {text: "Hello, how may I help you?"}
	}
	else if (thankyou_aliases.includes(text.toLowerCase())) {
		messageData = {text: "You're very welcome!"}
	}
	else if (how_are_you_aliases.includes(text.toLowerCase())) {
		messageData = {text: "I'm good thank you!"}
	}
	else
		messageData = {text: "Sorry I didn't get that. Try 'help' for more options!"};
	request({
		url: "https://graph.facebook.com/v2.6/me/messages",
		qs: {access_token: token},
		method: "POST",
		json: {
			recipient: {id: sender},
			message: messageData
		}
	}, function(error, response, body) {
		if (error)
			console.log('error in sending text');
		else if (response.body.error)
			console.log('response body error');
	})
}



// var bot = new BootBot({
// 	accessToken: process.env.ACCESS_TOKEN,
// 	verifyToken: process.env.VERIFY_TOKEN,
// 	appSecret: process.env.APP_SECRET
// });

// bot.setGreetingText("Hello, I'll be your guide to making dining decisions... MORE GREETING CODE... SET COMMANDS")

// function sendHTTP() {
// 	var diningJSON;
// 	var xhr = new XMLHttpRequest();
// 	var url = "https://tuftsdiningdata.herokuapp.com/menus/" + hall + "/" + day + "/" + month + "/" + year;
	
// 	xhr.open("GET", url, true);
// 	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

// 	xhr.onreadystatechange = function() {
// 	    if(xhr.readyState == 4 && xhr.status == 200) {
// 	        diningJSON = JSON.parse(xhr.responseText);
// 	        diningJSON.
// 	    }
// 	}
// 	xhr.send(sendInfo);		
// }

app.listen(PORT);
