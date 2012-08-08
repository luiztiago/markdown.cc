YUI().use('node', 'event', function (Y) {

	var Node = Y.Node,
		socket = io.connect('http://localhost:3001/'),
		TEXTAREA = Node.one("#markdown"),
		CODE = Node.one("#code"),
		version = Node.one("#version"),
		preview = Node.one("#previewMd section");

	var App = {
		init: function(){
			App.Resize.setup();
			App.Form.setup();
			App.Nav.setup();
		},

		Resize: {
			setup: function(){
				App.Resize.onEvent();
				Y.on('windowresize', function () {
					App.Resize.onEvent();
				});
			},

			onEvent: function(){
				var middle = Node.one('#middle'),
					form = Node.one('#editMd'),
					preview = Node.one('#previewMd'),
					viewport = Node.one(document).get('winHeight'),
					header = parseInt(Node.one('header').getStyle('height'), 10),
					newMiddleHeight = parseInt(viewport, 10) - 50 - header,
					newContentHeight = newMiddleHeight - 30;

				middle.setStyle('height', newMiddleHeight + 'px');

				if (TEXTAREA) {
					TEXTAREA.setStyle('height', newContentHeight + 'px');
				}

				preview.setStyle('height', newContentHeight + 'px');
			}
		},

		Form: {
			setup: function(){
				if (TEXTAREA) {
					App.Form.change();
					TEXTAREA.on('valuechange', function(){
						App.Form.change();
					});
				}
			},

			change: function(){
				var params = App.Form.getParams(),
				converter = new Showdown.converter();

				preview.setHTML(converter.makeHtml(params.md));
			},

			getParams: function(){
				var params = {};

				if (TEXTAREA) params.md = TEXTAREA.get('value');

				if (CODE) params.code = CODE.get('value');

				if (version) params.version = version.get('value');

				return params;
			}
		},

		Nav: {
			setup: function(){
				var nav = Node.one('nav'),
					save = Node.one('.icon-save'),
					share = Node.one('.icon-share'),
					fork = Node.one('.icon-fork'),
					preview = Node.one('.icon-preview');

				if(nav) {
					save.on('click', function(e){
						if(textarea.hasClass('changed')) {
							var params = App.Form.getParams();
							socket.emit('save', params);
						}
						e.preventDefault();
					});

					fork.on('click', function(e){
						var params = App.Form.getParams();
						delete params.code;
						socket.emit('save', params);
						e.preventDefault();
					});

					preview.on('click', function(e){
						var params = App.Form.getParams();
						if(!params.code) {
							if(textarea.hasClass('changed')) {
								socket.emit('save', params);
							}else{
								return false;
							}
						}
						location.href = '/'+params.code+'/'+params.version+'/preview/';
						e.preventDefault();
					});
				}
			}
		}

	};

	// Socket.io Events
	socket.on('saved', function (data) {
		location.href = '/'+data.code+'/'+data.version+'/';
	});

	socket.on('errormsg', function (data) {
		console.log(data);
		alert(data.msg)
	});

	App.init();

});