'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var App = function () {
	function App() {
		_classCallCheck(this, App);

		var args = arguments[0];
		this.wrapper = args.wrapper;
		this.post = args.post;
		this.hompage = args.hompage;
		this.states = ['active', 'hideapp', 'done', 'o'];
		this.init();
	}

	_createClass(App, [{
		key: 'init',
		value: function init() {
			this.getData(window.location.hash);
		}
	}, {
		key: 'setState',
		value: function setState() {
			var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
			var html = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

			document.body.className = '';
			if (state) document.body.classList.add(state);
			if (html) this.post.innerHTML = html;
		}
	}, {
		key: 'bind',
		value: function bind(cssSelectors, events, callback) {
			events = events.split(',');
			var elements = this.wrapper.querySelectorAll(cssSelectors) || this;
			elements.forEach(function (element) {
				events.forEach(function (event) {
					element.addEventListener(event, callback);
				});
			});
		}
	}, {
		key: 'renderPost',
		value: function renderPost(data) {
			var _this = this;

			if (data.length < 1) {
				this.setState('hideapp');
				return;
			}

			var html = '';

			if (data.length == 1) {

				html = '<h2 class="post-title">' + data[0].title + '</h2>';
				html += '<div class="post-body">' + data[0].body + '</div>';
			} else {

				[].concat(_toConsumableArray(data)).forEach(function (i) {
					html += '<br><a class="read-more" href="post/' + i.id + '">' + i.title + '</a>';
				});
			}

			this.post.innerHTML = html.replace('<script>', '');

			this.bind('a', 'click', function (e) {
				var href = e.target.getAttribute('href');
				_this.click(href, e);
			});
		}
	}, {
		key: 'click',
		value: function click(href, event) {

			var blank = href.indexOf('http');
			var examples = href.indexOf('examples');
			console.dir(href);

			if (href != '#' && blank < 0 && examples < 0) {
				event.preventDefault();
				window.location.hash = '/' + href;
			} else if (blank > -1 && examples < 0) {
				event.preventDefault();
				event.target.setAttribute('target', '_blank');
			}
		}
	}, {
		key: 'getData',
		value: function getData(url) {
			var _this2 = this;

			var rout = url.split('/').filter(function (i) {
				return i != '#' && i != '/' && i != '';
			});

			if (rout.length < 1) {
				this.setState('hideapp', '');
				return;
			}

			this.setState('active');

			switch (rout.length) {
				case 1:
					url = 'data/' + rout[0] + '.json';break;
				case 2:
					url = 'data/post-' + rout[1] + '.json';break;
				case 3:
					url = 'data/post-' + rout[1] + '-' + rout[2] + '.json';break;
				default:
					break;
			}

			if ('caches' in self) {
				console.clear();
				console.dir('идем в кэш');
				caches.open('myCache').then(function (cache) {
					cache.match(url).then(function (response) {

						console.dir('кэш резолвится c ' + response + ', ' + response.status);

						if (response.status == 200) {
							// don't check {response && response.status == 200

							response.json().then(function (data) {
								_this2.setState('done');
								console.dir('отдали из кэша');
								_this2.renderPost(data);
							}).catch(function (err) {
								console.dir('но с ошибкой');
								_this2.setState('done', '<code>' + err + '</code><br><br>Ошибка парсинга Json объекта</p>');
							});
						}
					}).catch(function () {

						console.dir('нет в кэше, идем в сеть');

						fetch(url).then(function (response) {

							if (response.status == 200) {
								// don't check {response && response.status == 200}
								console.dir('все ок, овтет 200');
								var resClone = response.clone();

								response.json().then(function (data) {
									_this2.done();
									console.dir('отдали из сети');
									_this2.renderPost(data);
								}).catch(function (err) {
									console.dir('Ошибка парсинга Json ответа');
									_this2.srState('done', '<code>' + err + '</code><br><br>Ошибка парсинга Json');
								});

								cache.put(url, resClone).then(function (e) {
									console.dir('И положили в кэш ' + url + ' + ' + resClone);
								});
							} else {
								console.dir(response.status + ' ошибка');
								_this2.setState('done', '<h2>' + response.status + '</h2><br>Bad url: ' + window.location.href + '<h1 style="font-size: 10em;line-height: 1;margin: .67em 0;font-weight: 900;">WE ARE SORRY</h1></p>');
							}
						}).catch(function (err) {
							msg = '<code>' + err + '<br>';
							msg += 'Net type: ' + navigator.connection.effectiveType + '<br>';
							msg += 'RTT: ' + navigator.connection.rtt + '<br>';
							msg += 'You online: ' + navigator.onLine + '</code><br><br>';
							msg += 'Проблема с сетью. Ресурс <u>' + url + '</u> еще не в кэше';
							_this2.setState('done', msg);
						});
					});
				});
			} else {}
		}
	}]);

	return App;
}();

var app = new App({
	wrapper: document.getElementById('posts'),
	post: document.querySelector('.posts-wrapper'),
	hompage: document.querySelector('main')
});

document.querySelectorAll('a').forEach(function (item) {
	item.addEventListener('click', function (e) {
		var href = e.target.getAttribute('href');
		app.click(href, e);
	});
});

window.addEventListener('hashchange', function () {
	app.init();
});

document.body.className = '';