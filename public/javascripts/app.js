YUI().use('node', 'event', function (Y) {

	var Node = Y.Node,
		socket = io.connect('http://localhost:3001/'),
		textarea = Node.one("#markdown"),
		code = Node.one("#code"),
		preview = Node.one("#previewMd section");

	// Event
	// textarea.on('valuechange', function(e) {
	// 	var params = {
	// 		md: textarea.get('value'),
	// 		code: code.get('value')
	// 	}
	// 	socket.emit('markinput', params);
	// });

	// Preview
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
					newMiddleHeight = parseInt(viewport, 10) - 125,
					newContentHeight = newMiddleHeight - 30;

				middle.setStyle('height', newMiddleHeight + 'px');
				textarea.setStyle('height', newContentHeight + 'px');
				preview.setStyle('height', newContentHeight + 'px');
			}
		},
		Form: {
			interval: null,
			setup: function(){
				App.Form.change();
				textarea.on('valuechange', function(){
					// App.Form.change();
					clearTimeout(App.Form.interval);
					App.Form.interval = setTimeout(function(){ App.Form.change(); }, 1000)
				});
			},
			change: function(){
				var params = App.Form.getParams();
				socket.emit('markinput', params);
			},
			getParams: function(){
				var params = {
					md: textarea.get('value')
				}
				if(code) {
					params.code = code.get('value');
				}

				return params;
			}
		},
		Nav: {
			setup: function(){
				var save = Node.one('.icon-save'),
					share = Node.one('icon-share'),
					fork = Node.one('icon-fork'),
					preview = Node.one('icon-preview');

				save.on('click', function(e){
					var params = App.Form.getParams();
					socket.emit('save', params);
					e.preventDefault();
				});
			}
		}
	};

	App.init();

});