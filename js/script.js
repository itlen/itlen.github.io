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

function Wrapper (w,m){

	this.init = function(html){
		this.active(html);
		w.bind('a','click',function(e){
			e.preventDefault();
			let href = '/'+this.getAttribute('href')
			if ( href != '/#') {
				window.location.hash = href;
			}		
		});
	}

	this.active = function(html){
		m.addClass('hidden');
		w.addClass('active')
			.first('.posts-wrapper')
			.innerHTML = html;
		w.addClass('done');
	}
	
	this.passive = function(){
		m.removeClass('hidden');
		w.removeClass('active')
			.removeClass('error')
			.removeClass('done')
			.first('.posts-wrapper')
			.innerHTML = "";
	}
	
	this.prepare = function(){
		this.passive();
		w.addClass('active');
	}
}

var wrapper = new Wrapper(document.first('.posts'),document.first('main'));




function Post (data) {
	this.html = '<ul class="posts-list">';
	data.forEach(i=>{
		this.html += '<li class="posts-list-item"><h2>'+i.title+'</h2><div class="post-spoiler">'+i.body+'</div>';
		if (data.length>1) this.html += '<a href="post/'+i.id+'">read more</a>';
		this.html += `</li>`;
	});
	this.html += '</ul>';
	this.render = function () {
		if(!this.html) {
			wrapper.passive();
			return;
		}
		wrapper.init(this.html);
	}
}







var router = function (url) {

	let rout = url.split('/').filter(i=>i!='#'&&i!='');

	if(rout.length<1) {
		wrapper.passive();
		return;
	}

	switch(rout.length){
		case 1: getDataFromUrl(rout[0]);break;
		case 2: getDataFromUrl('post-'+rout[1]);break;
		case 3: getDataFromUrl(rout[2]);break;
		default:break;
	}

	async function getDataFromUrl(url){
		if(url)
			await fetch('data/'+url+'.json')
				.then(res => {
					if(res.status === 200) {
						res.json().then(data=>{
							new Post(data).render();
						})
					} else {
						wrapper.active('<h2>'+res.status+'</h2><p class="font-16">Bad url: '+window.location.href+'</p>');
					}
				}).catch((err)=>console.log(err));	
		return false;
	}
}


//******************************************************//

	document.bind('a','click',function(e){
		e.preventDefault();
		let href = '/'+this.getAttribute('href')
		if ( href != '/#') {
			window.location.hash = href;
		}		
	});

	document.body.removeClass('hidden');
	document.body.removeClass('2');
	router(window.location.hash);

	window.addEventListener('hashchange',()=>{
		router(window.location.hash);
	});

















