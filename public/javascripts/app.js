YUI().use('node', 'event', function (Y) {

	var Node = Y.Node,
	SOCKET = io.connect('http://markdown.cc:3001/'),
	TEXTAREA = Node.one("#markdown"),
	CODE = Node.one("#code"),
	VERSION = Node.one("#version"),
	PREVIEW_CONTAINER = Node.one("#previewMd"),
	PREVIEW = PREVIEW_CONTAINER.one("section"),
	NAV = Node.one('nav'),
	NAV_SAVE_BUTTON = Node.one('.icon-save'),
	NAV_SHARE_BUTTON = Node.one('.icon-share'),
	NAV_FORK_BUTTON = Node.one('.icon-fork'),
	NAV_PREVIEW_BUTTON = Node.one('.icon-preview');

	var App = {
		init: function(){
			App.Resize.setup();
			App.Form.setup();
			App.Nav.setup();
			App.SocketListeners();
		},

		Resize: {
			setup: function(){
				App.Resize.onEvent();
				Y.on('windowresize', function () {
					App.Resize.onEvent();
				});
			},

			onEvent: function(){
				var viewport = Node.one(document).get('winHeight'),
					header = parseInt(Node.one('header').getStyle('height'), 10),
					newMiddleHeight = parseInt(viewport, 10) - 50 - header,
					newContentHeight = newMiddleHeight - 30;

				Node.one("#middle").setStyle('height', newMiddleHeight + 'px');

				if (TEXTAREA) {
					TEXTAREA.setStyle('height', newContentHeight + 'px');
				}

				PREVIEW_CONTAINER.setStyle('height', newContentHeight + 'px');
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

				TEXTAREA.addClass('changed');
				PREVIEW.setHTML(converter.makeHtml(params.md));
			},

			getParams: function(){
				var params = {};

				params.md = (TEXTAREA) ? TEXTAREA.get('value') : null;
				params.code = (CODE) ? CODE.get('value') : null;
				params.version = (VERSION) ? VERSION.get('value') : null;

				return params;
			}
		},

		Nav: {
			setup: function(){
				if (NAV) {
					NAV_SAVE_BUTTON.on('click', function(e){
						if(TEXTAREA.hasClass('changed')) {
							var params = App.Form.getParams();
							SOCKET.emit('save', params);
						}
						e.preventDefault();
					});

					NAV_FORK_BUTTON.on('click', function(e){
						var params = App.Form.getParams();
						delete params.code;
						SOCKET.emit('save', params);
						e.preventDefault();
					});

					NAV_PREVIEW_BUTTON.on('click', function(e){
						var params = App.Form.getParams();

						if (!params.code) {
							if (TEXTAREA.hasClass('changed')) {
								SOCKET.emit('save', params);
							} else {
								return false;
							}
						}

						location.href = '/' + params.code + '/' + params.version + '/preview/';
						e.preventDefault();
					});
				}
			}
		},

		SocketListeners: function() {
			SOCKET.on('saved', function (data) {
				location.href = '/' + data.code + '/' + data.version + '/';
			});

			SOCKET.on('errormsg', function (data) {
				console.log(data);
				alert(data.msg)
			});

		}
	};

	App.init();

});