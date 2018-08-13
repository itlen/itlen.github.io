var App = function(elementId){
	this.wrapper = document.getElementById(elementId);
	this.post = this.wrapper.querySelector('.posts-wrapper');
	this.hompage = document.querySelector('main');
}

App.prototype.setState = function(state){
	document.body.className = '';
	document.body.classList.add(state);
}

App.prototype.active = function(){
	this.setState('active');
}

App.prototype.done = function(){
	this.setState('done');
}

App.prototype.hide = function(){
	this.setState('hideapp');
	this.post.innerHTML = '';
}

App.prototype.error = function(html){
	this.setState('done');
	this.post.innerHTML = html;
}

App.prototype.bind = function(cssSelectors,events,callback,debug=false){
	events = events.split(',');
	elements= this.wrapper.querySelectorAll(cssSelectors)||this;
	elements.forEach(element=>{
		events.forEach(event=>{
			element.addEventListener(event,callback);
			if (debug) console.dir(element+' listen '+event);
		});
	});
}

App.prototype.renderPost = function (data) {

	if(data.length<1) {
		this.hide();
		return;
	}

	var html;

	if (data.length == 1) {

		html = '<h2 class="post-title">'+data[0].title+'</h2>';
		html += '<div class="post-body">'+data[0].body+'</div>';

	} else {

		html = '<ul class="posts-list">';
		data.forEach(i=>{
			html += '<li class="posts-list_item">';
			html += '<h2 class="post-title">'+i.title+'</h2>';
			html += '<div class="post-body">'+i.body+'</div>';
			html += '<br><a class="read-more" href="post/'+i.id+'">read more</a>';
			html += '</li>';
		});
		html += '</ul>';
	}


	
	this.post.innerHTML = html;

	this.bind('a','click',(e)=>{
		e.preventDefault();
		let href = e.target.getAttribute('href');
		if ( href != '#') {
			window.location.hash = '/'+href;
		}
	});
}

App.prototype.getData = function(url){

	let rout = url.split('/').filter(i=>i!='#'&&i!='/'&&i!='');

	if(rout.length<1) {
		this.hide();
		return;
	}

	switch(rout.length){
		case 1: url='data/'+rout[0]+'.json';break;
		case 2: url='data/post-'+rout[1]+'.json';break;
		case 3: url='data/post-'+rout[1]+'-'+rout[2]+'.json';break;
		default:break;
	}

	this.active();

	fetch(url)
		.then(response => {
			if(response.status == 200) {

				response.json().then(data=>{
					this.done();
					console.dir('отдали из сети');
					this.renderPost(data);
				})

			} else {
				console.dir(response.status+' ошибка');
				this.error('<h2>'+response.status+'</h2><br>Bad url: '+window.location.href);
			}
		}).catch((err)=>{
			msg = '<code>'+err+'<br>';
			msg += 'Net type: '+navigator.connection.effectiveType+'<br>';
			msg += 'RTT: '+navigator.connection.rtt+'<br>';
			msg += 'You online: '+navigator.onLine+'</code><br><br>';
			msg += 'Проблема с сетью. Ресурс <u>'+url+'</u> еще не в кэше';
			this.error(msg);
		});				

}

const app = new App('posts');
/*************************************************************************/

	app.getData(window.location.hash);
	
	window.addEventListener('hashchange',()=>{
		app.getData(window.location.hash);
	});

	document.querySelectorAll('a').forEach((item)=>{
		item.addEventListener('click',function(e){
			let href = this.getAttribute('href');
			if ( href != '#' && href.indexOf('data') < 0) {
				e.preventDefault();
				window.location.hash = '/'+href;
			} else {
				console.dir('data');
			}
		});
	});
	
	document.body.className = '';

















