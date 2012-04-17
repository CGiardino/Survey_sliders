var express = require('express');
var io = require('socket.io');
var csv = require('ya-csv');
var group=new Array(new Array());
var pages=new Array(new Array());


var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , ObjectId = mongoose.SchemaTypes.ObjectId;

var GroupSchema= new Schema({
      id: String
    , idg: Number
    , idp: Number
    , tit: String
    , ext1: String
    , ext2: String
    , val1: Number
    , val2: Number
    , arr: Number
});

var PageSchema= new Schema({

    id: Number
    , tit: String
});


mongoose.connect(' mongodb://root:a0k4f8mvW8p2i8NZngZm@softwarestartup-cgiardino-tradeoffs-0.dotcloud.com:26255/admin');


var reader = csv.createCsvFileReader('csv/groups.csv', {
    'separator': ',',
    'quote': '"',
    'escape': '"',
    'comment': '#'
});
var reader2 = csv.createCsvFileReader('csv/pages.csv', {
    'separator': ',',
    'quote': '"',
    'escape': '"',
    'comment': '#'
});
var z=0;
var z2=0;

reader.addListener('data', function(data) {

   if(data!=""){
       group[z]=[z,data[0],data[1],data[2],data[3]];

       z++;
   }


});




reader2.addListener('data', function(data) {

    if(data!=""){
        pages[z2]=data;

        z2++;
    }


});
reader2.addListener('end',soc);
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


var Group=mongoose.model('groups', GroupSchema);

function saveGroup(id){


    for( var j=0;j<group.length;j++){



            var group_data={
                id:id
                ,idg:group[j][0]
                ,idp: group[j][1]
                , tit: group[j][2]
                , ext1: group[j][3]
                , ext2: group[j][4]
                ,val1:0
                ,val2:0
                ,arr:-100

            }
            var mongogroup=new Group(group_data);

            mongogroup.save(function(err, mongogroup){
                if(err){
                    throw err;
                    console.log(err);
                }
            });
        }
        console.log(id+" / groups saved")






}



mongoose.model('pages',PageSchema);
var Page=mongoose.model('pages');

function savePage(){
    Page.collection.remove();
    for( var j=0;j<pages.length;j++){

        var page_data={
            id:pages[j][0]
            ,tit:pages[j][1]
        }

        var mongogroup=new Page(page_data);

        mongogroup.save(function(err, mongogroup){
            if(err){
                throw err;
                console.log(err);
            }
        });
    }
    console.log('pages saved!');
}



function soc(){

    savePage();
    io.sockets.on('connection', function (socket) {
        socket.on("init",function(){
            saveGroup(socket.id);
            for(var i=0;i<pages.length;i++){
                socket.emit('step', pages[i]);

            }
            for(var i=0;i<group.length;i++){
                socket.emit('group', group[i]);

            }
        });

        socket.on('addgroup',function(data){



            var group_data={
                id:socket.id
                ,idg: data[0]
                ,idp: data[1]
                , tit: data[2]
                , ext1: data[3]
                , ext2: data[4]
                ,val1:0
                ,val2:0
                ,arr:-100

            }


            var mongogroup=new Group(group_data);

            mongogroup.save(function(err, mongogroup){
                if(err){
                    throw err;
                    console.log(err);
                }else{

                    console.log(socket.id+' /group: '+ data[0]+' saved!');
                }
            });

        });


        socket.on('upgroupI',function(data){
            console.log(socket.id+' /updated slider 1 data: '+ data);
            Group.update({id:socket.id,idg:data[0]}, {val1:data[1]}, {upsert: true},function(err){
                if(err)
                    console.log(err);
            });
        });

        socket.on('upgroupF',function(data){
            console.log(socket.id+' /updated slider 2 data: '+ data);
            Group.update({id:socket.id,idg:data[0]}, {val2:data[1]}, {upsert: true},function(err){
                if(err)
                    console.log(err);
            });
        });

        socket.on('arr',function(data){
            console.log(socket.id+' /updated arrow data: '+ data);
            Group.update({id:socket.id,idg:data[0]}, {arr:data[1]}, {upsert: true},function(err){
                if(err)
                    console.log(err);
            });
        });

        socket.on('delGroup',function(data){
            console.log(socket.id+' /deleted group: '+ data);
            Group.update({id:socket.id,idg:data},{arr:-100,val1:-100,val2:-100}, {upsert: true},function(err){
                if(err)
                    console.log(err);
            });
        });
    });


}

app.get('/', function (req, res) {



    res.render('index');


});

app.listen(8080);
