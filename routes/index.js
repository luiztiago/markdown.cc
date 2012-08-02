
/*
 * GET home page.
 */

exports.index = function(req, res){
	res.render('index', { title: 'mdpub.cc'});
};

exports.load = function(req, res, params){
	res.render('index', { title: 'mdpub.cc', code: req.params.code, markdown: params.markdown, preview: params.preview });
};