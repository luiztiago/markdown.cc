
/**
 * Module dependencies.
 */

var express = require('express'),
	routes = require('./routes'),
	c = require('./config.js').config,
	http = require('http'),
	path = require('path'),
	httpProxy = require('http-proxy'),
	io = require('socket.io').listen(3001),
	pg = require('pg'),
	markdownParser = require('node-markdown').Markdown,
	conString = "tcp://"+c.user+":"+c.password+"@"+c.host+"/"+c.database+"",
	app = express();

httpProxy.createServer(3000, 'markdown.cc').listen(80);

var conquery = function(query, params, callback){
	pg.connect(conString, function(err, client) {
		client.query(query, params, function(err, result) {
			if(result) {
				callback(err, result);
			}else{
				console.log(err);
			}
		});
	});
}

app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser('markdownpubcc'));
	app.use(express.session());
	app.use(app.router);
	app.use(require('stylus').middleware(__dirname + '/public'));
	app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get(/^\/([a-z0-9]+)\/?$/, function(req, res){
	conquery("SELECT * FROM registers WHERE code = $1 AND version = 1;", [req.params[0]], function(err, result) {
		var params = {};

		if(result.rows.length) {
			params.markdown = result.rows[0].markdown;
			params.preview = result.rows[0].preview;
			params.version = result.rows[0].version;
		}

		routes.load(req, res, params);
	});
});

app.get(/^\/([a-z0-9]+)\/last\/?$/, function(req, res){
	conquery("SELECT * FROM registers WHERE code = $1 AND version = (SELECT MAX(version) FROM registers WHERE code = $1)", [req.params[0]], function(err, result) {
	//conquery("SELECT * FROM registers WHERE code = $1 AND version = 1;", [req.params[0]], function(err, result) {
		var params = {};

		if(result.rows.length) {
			params.markdown = result.rows[0].markdown;
			params.preview = result.rows[0].preview;
			params.version = result.rows[0].version;
		}

		console.log(params);

		routes.load(req, res, params);
	});
});

app.get(/^\/([a-z0-9]+)\/([0-9]+)\/?$/, function(req, res){
	conquery("SELECT * FROM registers WHERE code = $1 AND version = $2", [req.params[0], req.params[1]], function(err, result) {
		var params = {};
		console.log(err);
		if(result.rows.length) {
			params.markdown = result.rows[0].markdown;
			params.preview = result.rows[0].preview;
			params.version = result.rows[0].version;
		}

		routes.load(req, res, params);
	});
});

app.get(/^\/([a-z0-9]+)\/([0-9]+)\/?$/, function(req, res){
	res.send('Teste');
});

app.get(/^\/([a-z0-9]+)\/([0-9]+)\/preview\/?$/, function(req, res){
	conquery("SELECT * FROM registers WHERE code = $1 AND version = $2", [req.params[0], req.params[1]], function(err, result) {
		var params = {};
		console.log(err);
		if(result.rows.length) {
			params.markdown = result.rows[0].markdown;
			params.preview = result.rows[0].preview;
			params.version = result.rows[0].version;

			var preview = params.preview;
			params.preview = preview.replace('<','&lt;'); // anti-injection
		}

		console.log(params.preview);
		routes.preview(req, res, params);
	});
});

http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
	// console.log(conString);
});

io.sockets.on('connection', function (socket) {
	socket.on('save', function (data) {
		// console.log(data);
		// markdown = data.md;
		// data.md = markdown.replace('<','&lt;');
		// console.log(data);
		var preview = markdownParser(data.md);
		if(data.code) {
			// try {
			conquery("SELECT MAX(version)+1 as version FROM registers WHERE code = $1;", [data.code], function(err, result){
				var version = (result.rows[0].version != null) ? result.rows[0].version : 1;
				conquery("INSERT INTO registers (code, version, markdown, preview, created_at) VALUES ($1, $2, $3, $4, current_timestamp);", [data.code, version, data.md, preview], function(err, result){
					console.log(result);
					socket.emit('saved', {code: data.code, version: version});
				});
			});
			// }catch(err){
			// 	socket.emit('errormsg', {msg: 'Erro ao fazer a atualização desta marcação'});
			// }
			
		}else{
			conquery("SELECT substr(md5(random()::text),1,5) as code;", function(err, result){
				var code = result.rows[0].code;
				console.log(code);
				conquery("INSERT INTO registers (code, version, markdown, preview, created_at) VALUES ($1, 1, $2, $3, current_timestamp);", [code, data.md, preview], function(err, result){
					console.log(err);
					console.log(result);
					socket.emit('saved', {code: code, version: 1});
				});
			});
		}
	});
});