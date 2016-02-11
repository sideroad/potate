var express = require('express'),
    WebSocketServer = require("ws").Server,
    bodyParser = require('body-parser'),
    app = express(),
    http = require("http"),
    port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

var server = http.createServer(app)
server.listen(port);

var wss = new WebSocketServer({server: server})

function send( ws, id, data){
	var json = JSON.stringify(data);
	ws.send( json);
	console.log("send:" + id + ":" + json );
}

var act = {
	stage : {},
	player : {},
	init : function( ws, id, data ){
		act.stage[id] = [];
		send(ws, id, {
			act:data.act,
		    stage: id
		});
	},
	attend : function( ws, id, data ){
		var attend = {
            act : data.act,
            stage: data.id,
            player: id
		};
		if(!act.stage[data.id]) {
			send(ws, id, {
				act: "reinput"
			});
			return;
		}
		act.stage[data.id].push(id);
		act.player[id] = data.id;
        send(ws, id, attend );
		send(ws, data.id, attend );
	},
	jp : function( ws, id, data ){
		data.id = id;
		send(ws, this.player[id], data);
	}
}

wss.on("connection", function(ws) {
  console.log("connected!"+ws.id);

  ws.addListener("message", function(message){
      var msg = JSON.parse(message);
      console.log(ws.id, msg);
      act[msg.act](ws, ws.id, msg);
  });
  ws.addListener("close", function(){
//		console.log("connection closed:"+arguments);
  });
})
