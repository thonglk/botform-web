// server.js
// where your node app starts

var firebase = require("firebase-admin");
var axios = require("axios")
var cors = require("cors")
// init project
var express = require('express');
var app = express();


// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
app.use(cors());

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
    response.sendFile(__dirname + '/views/index.html');
});


// listen for requests :)
var port = process.env.PORT || 1234
var listener = app.listen(port, function () {
    console.log('Your app is listening on port ' + listener.address().port);
});


app.get('/viewResponse', ({query}, res) => {
    axios.get('https://jobo-chat.herokuapp.com/viewResponse', {params: query})
        .then(result => res.send(result.data))
        .catch(err => res.status(500).json(err))
});
app.get('/getchat', function (req, res) {
    var params = req.query
    axios.get('https://jobo-chat.herokuapp.com/getchat', {params})
        .then(result => res.send(JSON.stringify(result.data, circular()))
        )
        .catch(err => res.send(err))
});

