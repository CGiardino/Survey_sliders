var express = require('express');
var io = require('socket.io');
var csv = require('ya-csv');
var group=new Array(new Array());
var reader = csv.createCsvFileReader('csv/extremes.csv', {
    'separator': ',',
    'quote': '"',
    'escape': '"',
    'comment': '#'
});
var z=0;
reader.addListener('data', function(data) {


        group[z]=data;

    z++;

});
reader.addListener('end',soc);

var app = express.createServer(
    express.bodyParser()
    , express.static(__dirname + "/public")
    , express.cookieParser()
    , express.session({ secret:'desrever'})
),io = io.listen(app);
io.set('log level', 1);

app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.register('.html', require('jade'));
    app.use(express.compiler({ src:__dirname + '/views', enable:['less'] }));
});


function soc(){

    io.sockets.on('connection', function (socket) {


        for(var i=0;i<group.length;i++)
            socket.emit('group', group[i]);

        socket.on('addgroup',function(data){
            console.log(data[0],data[1],data[2]);
        })




    });


}

app.get('/', function (req, res) {



    res.render('index');


});

app.listen(3000);
