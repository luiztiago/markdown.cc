YUI().use('node', 'event', function (Y) {

	var Node = Y.Node,
		socket = io.connect('http://localhost:3001/'),
		textarea = Node.one("#markdown"),
		code = Node.one("#code"),
		preview = Node.one("#previewMd section");

	socket.on('markpreview', function (data) {
		preview.setHTML(data.html);
	});

	socket.on('saved', function (data) {
		// console.log(data);
		location.href = '/'+data.code+'/v/'+data.version;
	});

	socket.on('errormsg', function (data) {
		// console.log(data);
		console.log(data);
		alert(data.msg)
	});

	var App = {
		init: function(){
			App.Resize.setup();
			App.Form.setup();
			App.Nav.setup();
		},
		Resize: {
			setup: function(){
				Y.on('windowresize', function(){
					App.Resize.onEvent();
				})
				App.Resize.onEvent();
			},
			onEvent: function(){
				var middle = Y.one('#middle'),
					form = Y.one('#editMd'),
					preview = Y.one('#previewMd'),
					viewport = Y.one(document).get('winHeight'),
					header = parseInt(Y.one('header').getStyle('height'), 10),
					newMiddleHeight = parseInt(viewport, 10) - 50 - header,
					newContentHeight = newMiddleHeight - 30;

				middle.setStyle('height', newMiddleHeight + 'px');
				if(textarea){
					textarea.setStyle('height', newContentHeight + 'px');
				}
				preview.setStyle('height', newContentHeight + 'px');
			}
		},
		Form: {
			interval: null,
			setup: function(){
				if(textarea) {
					App.Form.change();
					textarea.on('valuechange', function(){
						// App.Form.change();
						clearTimeout(App.Form.interval);
						App.Form.interval = setTimeout(function(){ App.Form.change(); }, 1000)
					});
				}
			},
			change: function(){
				var params = App.Form.getParams();
				socket.emit('markinput', params);
			},
			getParams: function(){
				var params;
				if(textarea) {
					var params = {
						md: textarea.get('value')
					}
				}
				if(code) {
					params.code = code.get('value');
				}

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
						var params = App.Form.getParams();
						socket.emit('save', params);
						e.preventDefault();
					});

					fork.on('click', function(e){
						var params = App.Form.getParams();
						delete params.code;
						socket.emit('save', params);
						e.preventDefault();
					});
				}
			}
		}
	};

	App.init();

});