
	Object.prototype.on = function(f,c){return Array.from(this,(i)=>i.addEventListener(f,c));}
	Object.prototype.find = function(s){return this.querySelectorAll(s);}
	Object.prototype.first = function(s){if(!s) return this.firstElementChild;return this.querySelector(s);}
	Object.prototype.next = function(){return this.nextElementSibling;};
	Object.prototype.prev = function(){return this.previousElementSibling;};
	Object.prototype.last = function(){return this.lastElementChild;};
	Object.prototype.parents = function(cssSelectors){
		if(!cssSelectors) return this.parentElement;
		cssSelectors = cssSelectors.split(',');
		const a=[];
		for(let i=0;i<=cssSelectors.length;i++) {
			var p=this.parentElement;
			while(p){
				if (p.matches(cssSelectors[i])) {
					a.push(p);
				}
				p=p.parentElement;
			}
		}
		
		return a;
	};
	Object.prototype.bind = function(cssSelectors,events,callback,debug=false){
		events = events.split(',');
		elements= this.find(cssSelectors)||this;
		elements.forEach(element=>{
			events.forEach(event=>{
				element.addEventListener(event,callback);
				if (debug) console.dir(element+' listen '+event);
			});
		});
	}

	Object.prototype.toggleClass = function(className){
		try { this.classList.toggle(className);}
		catch {Array.from(this, (i)=>i.classList.toggle(className));}
		finally {return this;}
	}
	
	Object.prototype.addClass = function(className){
		try { this.classList.add(className);}
		catch {Array.from(this, (i)=>i.classList.add(className));}
		finally {return this;}
	}
	
	Object.prototype.removeClass = function(className){
		try { this.classList.remove(className);}
		catch {Array.from(this, (i)=>i.classList.remove(className));}
		finally {return this;}
	}

	Object.prototype.returnContext = function(obj){return obj;}
	Object.prototype.siblings = function(cssSelectors){
		s = cssSelectors || '*';
		return Array.from(this.parentElement.childNodes).filter(i=>i.nodeName != '#text' && i != this && i.matches(s));
	};

	// document.bind('.col','click',function(e){
	// 	if(this.classList.contains('modal')) return;
	// 	this.addClass('modal')
	// 		.parents('.row, body')
	// 		.addClass('modal')
	// 		.returnContext(this)
	// 		.siblings('.bio')
	// 		.addClass('hidden')
	// 		.on('click',function(e){});
	// });	

	// document.find('.close-control').on('click',function(){
	// 	document.find('.modal').removeClass('modal');
	// 	document.find('.hidden').removeClass('hidden');
	// });

	document.bind('a','click',function(e){
		e.preventDefault();
		let href = this.getAttribute('href');
		if (href != '#') {
			window.location.hash = '/'+href;
		}
	})

	window.addEventListener('hashchange',()=>{
		var h = this.location.hash.split('/');
		switch(h[1]){
			case 'posts':getDataFromUrl('posts');break;
			case 'post': getDataFromUrl(h[2]);break;
			default: renderData(); break;
		}
	});

	var h = this.location.hash.split('/');
	switch(h[1]){
		case 'posts': getDataFromUrl('posts'); break;
		case 'post': getDataFromUrl(h[2]); break;
		default: document.body.first('.posts').removeClass('active').innerHTML = ''; break;
	}

function renderPostsList(data){

	let post_wrapper = document.body.first('.posts');
	post_wrapper.removeClass('active').innerHTML = '';

	let ul = document.createElement('ul');
	ul.addClass('posts-list');

	data.forEach(item=>{
		let li = document.createElement('li');
			li.addClass('posts-list-item');

		let h2 = document.createElement('h2');
			h2.innerText = item.title;

		let a = document.createElement('a');
			a.setAttribute('href','post/'+item.id);
			a.innerText = 'read more';
			a.addEventListener('click',function(e){
				e.preventDefault();
				window.location.hash = '/'+this.getAttribute('href');
			});

		let div = document.createElement('div');
			div.addClass('post-spoiler');
			div.innerHTML = item.body;

		li.appendChild(h2);
		li.appendChild(div);
		li.appendChild(a);

		ul.appendChild(li);
	});

	// window.location.hash = '/posts';
	document.first('main').addClass('hidden');
	post_wrapper.addClass('active').appendChild(ul);
}

function renderPost(data){

	let post_wrapper = document.body.first('.posts');
	post_wrapper.removeClass('active').innerHTML = '';

	let h2 = document.createElement('h2');
		h2.addClass('post-header');
		h2.innerText = data[0].title;
	
	post_wrapper.appendChild(h2);
	
	let div = document.createElement('div');
		div.addClass('post-body');
		div.innerHTML = data[0].body;
		
	// window.location.hash = '/post/'+data[0].id;
	document.first('main').addClass('hidden');
	post_wrapper.addClass('active').appendChild(div);

}

function renderData(data) {
	if(window.location.hash == '') {
		document.first('main').removeClass('hidden');
		return;
	}
	if(data.length>1) {renderPostsList(data); return;}
	else {renderPost(data); return;}
}

function getDataFromUrl(url){
	if (url != 'posts') url = 'post-'+url;
	url += '.json';

	let p = fetch('data/'+url)
		.then(response => {
			if(response.status === 200) {
				response.json().then(d=>{
					renderData(d);
				})
			} else {
				error404();
			}
		}).catch((err)=>console.log(err));	
	return false;
}

function error404(){
	document.body.first('.posts').addClass('active').innerHTML = '<h2>404</1>';
}










