//сервер

var express = require ('express');
var bodyParser = require ("body-parser"); // Автоматический разбор тела (body) и запроса для основных методов HTTP
var formidable = require('formidable'); // для загрузки файлов на сервер
var mysql = require('mysql'); // подключение mysql
var fs = require('fs'); //работа с файлами
var app = express(); // создаем сервер

var urlencodedParser = bodyParser.urlencoded({extended: false}); // выбираем одну ф-ю

var connection = mysql.createConnection({
    host    :   "localhost",
    user    :   "root",
    password:   "root",
    database:   "forlab",
   // insecureAuth : true
});

connection.connect(function(err){
    if (err) throw err;
    console.log("connected with database");
});

app.set('view engine', 'ejs'); // подключение шаблонизатора

app.get('/', function(req, res){res.render('menu');});

app.post('/', urlencodedParser, function(req, res){

    var form = new formidable.IncomingForm();
    form.parse(req);

    var fname = '';
    form.on('fileBegin', function (name, file){
        file.path = __dirname + '/files/' + file.name; //   указали путь для хранения файла
    });

    form.on('file', function (name, file){

        connection.query('INSERT INTO base SET filename = ?, mark = ?, comment = ?',
            [file.name, '0',' was uploaded'],
            function (err, res) {
                if (err) {
                    console.log(err);
                }
               // console.log(res);
            });
        console.log( file.name + 'was uploaded');
    });

    res.render('menu');
});

app.get('/marks', function(req, res){

    /*connection.query('DELETE FROM base WHERE id = 8', 0, function(err, result){
        if (err){ console.log(err); return; }
        console.log(result);
    });*/

        connection.query('SELECT filename, COUNT(filename) FROM base GROUP BY filename ORDER BY COUNT(filename) ASC',
            function (err, result){
                if (err) {
                    console.log(err);
                    return;
                }
                console.log(result);
                res.render('marks', {show: {src1: result[0].filename, src2: result[1].filename, src3: result[2].filename}});
            });

});

app.post('/marks', urlencodedParser,function(req,res){

  /*  console.log(req.body.mark); */
    console.log(req.body.hid);

  console.log(req.body.hid);
    connection.query('INSERT INTO base SET filename = ?, mark = ?, comment = ?',
        [req.body.hid, req.body.mark, req.body.comm],
        function (err, res) {
            if (err) {
                console.log(err);
                return;
            }
            console.log(res);

        });

        connection.query('SELECT filename, COUNT(filename) FROM base GROUP BY filename ORDER BY COUNT(filename) ASC',
            function (err, result){
                if (err) {
                    console.log(err);
                    return;
                }
                //console.log(result);
                res.render('marks', {show: {src1: result[0].filename, src2: result[1].filename, src3: result[2].filename}});
            });


});

app.get('/dir/:myfile', function(req, res) {
    res.sendFile(__dirname + '/files/' + req.params.myfile);
});

app.get('/valuations', function(req, res){

    connection.query('SELECT * FROM base', function(err, result) {
        //connection.end();
        if (err) throw err;
        console.log("Data displayed");
        res.render("valuations", { result: result});
    });

});

app.listen(3000);