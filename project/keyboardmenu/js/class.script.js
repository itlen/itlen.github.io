'use strict'

class KeyboardMenu {

	constructor(){

		let args = arguments[0];
		this.viewport = args.viewport || window.innerWidth;
		this.mode = args.mode || 'horizontal';
		if(args.class) this.classPrefix = args.class;
		KeyboardMenu.count +=1;

		this.hideSiblingsWhenItemIsActive = args.hideSiblings || false;
		this.menu = document.querySelector(args.wrapper);
		this.keys = { left: 37, up: 38, right: 39, esc: 27,	down: 40 }
		this.init();	

	}

	init() {

		this.menu.style.opacity = 0;
		this.menu.classList.add(this.classPrefix);
		this.menu.classList.add(this.mode);
		this.menu.setAttribute('role','menubar');

		this.menu.querySelectorAll('ul').forEach((item,index)=>{
			item.setAttribute('role','menu');
			item.setAttribute('id','menu-'+KeyboardMenu.count+'-'+index);
		});

		this.menu.querySelectorAll('li').forEach((item,index)=>{

			item.classList.add('menu-item');
			item.setAttribute('id','menu-item-'+KeyboardMenu.count+'-'+index);

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

		this.bind('a','keydown',(e)=>{

			var p = this.currentItem.parentElement.parentElement.classList.contains('horizontal');
				switch(e.keyCode){			
					case this.keys.up: (p) ? '' : this.setActiveItem(this.prevItem); break;
					case this.keys.right: (p) ? this.setActiveItem(this.nextItem) : this.fadeInCurrentMenuItem(); break;
					case this.keys.down: (p) ? this.fadeInCurrentMenuItem() : this.setActiveItem(this.nextItem); break;
					case this.keys.left: (p) ? this.setActiveItem(this.prevItem) : this.fadeOutCurrentMenuItem(); break;
					case this.keys.esc: this.fadeOutCurrentMenuItem(); break;
			}

		});

		this.bind('a','focus',(e)=>{
			this.setActiveItem(e.target.parentElement);
			e.target.parentElement.classList.add('focus');
			this.parents(null,'nav')[0].firstElementChild.classList.add('in-focus');
		});

		this.bind('a','blur',(e)=>{
			e.target.parentElement.classList.remove('focus');
			this.parents(null,'nav')[0].firstElementChild.classList.remove('in-focus');
		});


		this.bind('.expandable','click',(e)=>{

			e.stopPropagation();
			e.target.firstElementChild.focus();

			e.target.parentElement.querySelectorAll('.open').forEach(item=>{
				if(item != e.target) item.classList.remove('open');
			});

			e.target.parentElement.querySelectorAll('[aria-hidden]').forEach(item=>{
				if(item != e.target) item.setAttribute('aria-hidden',true);
			});

			e.target.parentElement.querySelectorAll('[aria-expanded]').forEach(item=>{
				if(item != e.target) item.setAttribute('aria-expanded',false);
			});

			e.target.classList.toggle('open');
			e.target.setAttribute('aria-expanded',e.target.classList.contains('open'));
			e.target.lastElementChild.setAttribute('aria-hidden',!e.target.classList.contains('open'));

			if( this.mode == 'vertical' && this.hideSiblingsWhenItemIsActive) 
				this.siblingsFor(e.target).map(i=>i.classList.toggle('hidden'));

		});

		this.bind('li','click',(e)=>{
			this.setActiveItem(e.target);
		});

		this.bind('ul','click',(e)=>{
			e.stopPropagation();
		});

		this.menu.style.opacity = 1;
	}

	setActiveItem (li){
		this.currentItem = li;
		let parentUl = li.parentElement;

		this.nextItem = li.nextElementSibling || parentUl.firstElementChild;
		this.prevItem = li.previousElementSibling || parentUl.lastElementChild;

		li.firstElementChild.focus();
	};


	fadeInCurrentMenuItem (el){
		if(!el) el = this.currentItem;
		if(el.getAttribute('aria-haspopup')) {

				el.setAttribute('aria-expanded','true');
				el.classList.add('open');

			let ul = el.lastElementChild;
				ul.setAttribute('aria-hidden','false');

			this.setActiveItem(ul.firstElementChild);

			if( this.mode == 'vertical'  && this.hideSiblingsWhenItemIsActive) 
				this.siblingsFor(el).forEach(i=>i.classList.toggle('hidden'));

				this.siblingsFor(el).forEach(i=>{
					i.classList.remove('open');
				});
		}
	}

	fadeOutCurrentMenuItem (el){
		if(!el) el = this.currentItem;
		let parentUl = el.parentElement
		let parentUlParentLi_open = parentUl.parentElement;
		if (parentUl.tagName.toLowerCase() == 'ul' && parentUlParentLi_open.tagName.toLowerCase() == 'li') {

			parentUlParentLi_open.classList.remove('open');
			parentUlParentLi_open.setAttribute('aria-expanded','false');
			parentUl.setAttribute('aria-hidden','true');
		
			this.setActiveItem(parentUlParentLi_open);
		
			if( this.mode == 'vertical' && this.hideSiblingsWhenItemIsActive ) 
				this.siblingsFor(parentUlParentLi_open).map(i=>i.classList.toggle('hidden'));
		}
	}

	siblingsFor (el){
		return [...el.parentElement.children].filter(i=>{return i!=el});
	}

	bind (cssSelectors,events,callback,debug=false){
		events = events.split(',');
		let elements= this.find(cssSelectors);
		elements.forEach(element=>{
			events.forEach(event=>{
				element.addEventListener(event,callback);
				if (debug) console.dir(element+' listen '+event);
			});
		});
	}


	find (selector){
		return Array.from(this.menu.querySelectorAll(selector)) || this.menu;
	}

	parent (el,cssSelector){
		if(!el) el = this.currentItem;
		let parent = el.parentElement;
		if(!cssSelector) return parent;
		while(parent && parent.tagName.toLowerCase() != 'body') {
			if(parent.matches(cssSelector)) {return parent;}
			parent = parent.parentElement;
		}
		return parent;
	}

	parents (el,cssSelector){
		if(!el) el = this.currentItem;
		if(!cssSelector) cssSelector = '*';
		let parents = [];
		let parent = el.parentElement;
		while(parent && parent.tagName.toLowerCase() != 'body') {
			if(parent.matches(cssSelector)) parents.push(parent);
			parent = parent.parentElement;
		}
		return parents;

	}

	resize (width){
		 if (this.viewport > width) {
		 	this.menu.classList.remove('horizontal');
		 	this.menu.classList.add('vertical');
		 	this.mode = 'vertical';
		 } else {
		 	this.menu.classList.remove('vertical');
		 	this.menu.classList.add('horizontal');
		 	this.mode = 'horizontal';
		 }		 
	}

};
KeyboardMenu.count = 0;


/*************************************************/



const headerMenu = new KeyboardMenu({
	viewport: 640,
	wrapper: "#main-navigation",
	class: 'ololo'
});

const asideMenu = new KeyboardMenu({
	mode: "vertical",
	hideSiblings: true,
	wrapper: "#sec-navigation"
});


function debounce(func, wait, immediate){
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

var resize = debounce(function() {
	headerMenu.resize(this.innerWidth)
}, 500);

window.addEventListener('resize', resize);