var Nav = function(){

	let args = arguments[0];
	this.viewport = args.viewport || window.innerWidth;
	this.mode = args.mode || 'horizontal';
	this.count = args.count || 0;
	this.hideSiblingsWhenItemIsActive = args.hideSiblings || false;
	this.menu = document.querySelector(args.wrapper);
	this.keys = { left: 37, up: 38, right: 39, esc: 27,	down: 40 }
	this.init();

};


Nav.prototype.setActiveLink = function(element){
	
	this.currentLink = element;
	this.currentLink.focus();

	try { 
		if(this.currentLink.parentElement.className.indexOf('open') > -1) {
			this.nextLink = this.currentLink.parentElement.lastElementChild.firstElementChild.firstElementChild;
		} else {
			this.nextLink = this.currentLink.parentElement.nextElementSibling.firstElementChild;
		}
	}
	catch (err) { this.nextLink = this.currentLink.parentElement.parentElement.firstElementChild.firstElementChild; }

	try { this.prevLink = this.currentLink.parentElement.previousElementSibling.firstElementChild;}
	catch (err) { this.prevLink = this.currentLink.parentElement.parentElement.lastElementChild.firstElementChild; }

};


Nav.prototype.init = function(cssSelector){
	
	this.menu.style.opacity = 0;
	this.menu.classList.add(this.mode);
	this.menu.setAttribute('role','menubar');

	this.menu.querySelectorAll('ul').forEach((item,index)=>{
		item.setAttribute('role','menu');
		item.setAttribute('id','menu-'+this.count+'-'+index);
	});

	this.menu.querySelectorAll('li').forEach((item,index)=>{

		item.classList.add('menu-item');
		item.setAttribute('id','menu-item-'+this.count+'-'+index);

		item.firstElementChild.classList.add('menu-item-link');
		item.firstElementChild.setAttribute('role','menuitem');
		
		if(item.lastElementChild.tagName.toLowerCase() == 'ul') {
			item.classList.add('expandable');
			item.setAttribute('aria-haspopup','true');
			item.setAttribute('aria-expanded','false');

			item.firstElementChild.setAttribute('aria-controls','menu-item-'+this.count+'-'+index);

			item.lastElementChild.classList.add('submenu');
			item.lastElementChild.setAttribute('aria-hidden','true');
		}
	
	});

	this.bind('.horizontal .menu>li>a','keydown',(e)=>{

		switch(e.keyCode){			
			case this.keys.up:break;
			case this.keys.right: this.setActiveLink(this.nextLink);break;
			case this.keys.down: this.fadeInCurrentMenuItem();break;
			case this.keys.left: this.setActiveLink(this.prevLink);break;
			case this.keys.esc: break;
		}

	});

	this.bind('.vertical .menu>li>a, .submenu a','keydown',(e)=>{

		switch(e.keyCode){			
			case this.keys.up:this.setActiveLink(this.prevLink);break;
			case this.keys.right: this.fadeInCurrentMenuItem();break;
			case this.keys.down: this.setActiveLink(this.nextLink);break;
			case this.keys.left:
			case this.keys.esc: this.fadeOutCurrentMenuItem();break;
		}

	});

	this.bind('a','focus',(e)=>{
		this.setActiveLink(e.target);
		e.target.parentElement.parentElement.classList.add('in-focus');
		e.target.parentElement.classList.add('focus');
	});

	this.bind('a','blur',(e)=>{
		e.target.parentElement.classList.remove('focus');
	});


	this.bind('.expandable','click',(e)=>{

		e.stopPropagation();
		e.target.firstElementChild.focus();
		e.target.classList.toggle('open');
		e.target.setAttribute('aria-expanded',e.target.classList.contains('open'));
		
		this.siblingsFor(e.target).forEach(i=>{
			i.classList.remove('open');
			i.setAttribute('aria-expanded','false');	
		});

		e.target.querySelectorAll('.open').forEach(i=>{
			i.classList.remove('open');
			i.setAttribute('aria-expanded','false');			
		});

		if( this.mode == 'vertical'  && this.hideSiblingsWhenItemIsActive) 
			this.siblingsFor(e.target).map(i=>i.classList.toggle('hidden'));

	});

	this.bind('ul','click',(e)=>{
		e.stopPropagation();
	});

	this.menu.style.opacity = 1;

}


Nav.prototype.fadeInCurrentMenuItem = function(el){
	if(!el) el = this.currentLink;
	if(el.parentElement.getAttribute('aria-haspopup')) {

		let parentLi = el.parentElement;
			parentLi.setAttribute('aria-expanded','true');
			parentLi.classList.add('open');

		let nextUl = el.nextElementSibling;
			nextUl.setAttribute('aria-hidden','false');

		this.setActiveLink(nextUl.firstElementChild.firstElementChild);

		if( this.mode == 'vertical'  && this.hideSiblingsWhenItemIsActive) 
			this.siblingsFor(parentLi).map(i=>i.classList.toggle('hidden'));

			this.siblingsFor(parentLi).map(i=>{
				i.classList.remove('open');
			});
		
	}
}

Nav.prototype.fadeOutCurrentMenuItem = function(el){
	if(!el) el = this.currentLink;
	let parentUl = this.parent(null,'ul');

		parentUl.setAttribute('aria-hidden','true');

	let parentUlParentLi_open = parentUl.parentElement;
		parentUlParentLi_open.classList.remove('open');
		parentUlParentLi_open.setAttribute('aria-expanded','false');

	if(parentUlParentLi_open.tagName.toLowerCase() == 'li') {
		if( this.mode == 'vertical' ) this.siblingsFor(parentUlParentLi_open).map(i=>i.classList.toggle('hidden'));
		this.setActiveLink(parentUlParentLi_open.firstElementChild);
	}
}

Nav.prototype.siblingsFor = function(el){
	return [...el.parentElement.children].filter(i=>{return i!=el});
}

Nav.prototype.bind = function(cssSelectors,events,callback,debug=false){
	events = events.split(',');
	elements= this.find(cssSelectors);
	elements.forEach(element=>{
		events.forEach(event=>{
			element.addEventListener(event,callback);
			if (debug) console.dir(element+' listen '+event);
		});
	});
}

Nav.prototype.find = function(selector){
	return Array.from(this.menu.querySelectorAll(selector)) || this.menu;
}

Nav.prototype.parent = function(el,cssSelector){
	
	if(!el) el = this.currentLink;
	let counter = 0;
	if(!cssSelector) cssSelector = '*';
	let parent = el.parentElement;

	while(parent && parent.tagName.toLowerCase() != 'body') {
		if(parent.matches(cssSelector) || ++counter > 10) {return parent;}
		parent = parent.parentElement;
	}
	return parent;

}

Nav.prototype.parents = function(el,cssSelector){
	
	if(!el) el = this.currentLink;
	if(!cssSelector) cssSelector = '*';
	let parents = [];
	let parent = el.parentElement;
	while(parent && parent.tagName.toLowerCase() != 'body') {
		if(parent.matches(cssSelector)) parents.push(parent);
		parent = parent.parentElement;
	}
	console.dir('---------------');
	console.dir(parents);
	return parents;

}

Nav.prototype.resize = function(width){

	 if (this.viewport > width) {
	 	this.menu.classList.remove('horizontal');
	 	this.menu.classList.add('vertical');
	 	this.mode = 'vertical';
	 	this.init();
	 } else {
	 	this.menu.classList.remove('vertical');
	 	this.menu.classList.add('horizontal');
	 	this.mode = 'horizontal';
	 	this.init();
	 }
	 
}


const Menu = function(params){ Nav.apply(this,arguments); }
Menu.prototype = Object.create(Nav.prototype);
Menu.prototype.constructor = Menu;

/*************************************************/

const headerMenu = new Menu({
	viewport: 640,
	wrapper: "#main-navigation"
});

const asideMenu = new Menu({
	count: 1,
	mode: "vertical",
	hideSiblings: true,
	wrapper: "#sec-navigation"
});


window.addEventListener('resize', function(){
	headerMenu.resize(this.innerWidth);
});
