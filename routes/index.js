
/*
 * GET home page.
 */

exports.index = function(req, res){
	res.render('index', { title: 'mdpub.cc'});
};

exports.load = function(req, res, params){
	var version = (params.version) ? params.version : 1;
	res.render('index', { title: 'mdpub.cc', code: req.params[0], version: params.version, markdown: params.markdown, preview: params.preview });
};

exports.preview = function(req, res, params){
	var version = (params.version) ? params.version : 1;
	res.render('preview', { title: 'mdpub.cc', code: req.params[0], version: params.version, markdown: params.markdown, preview: params.preview });
};