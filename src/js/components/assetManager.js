var iframeLoader = require('../utils/iframeLoader');
var polyfills = require ('../utils/polyfills');

var queue = [];		//array populated during init, scrapes all classes for 'gv-asset'
var windowWidth = 0;
var windowHeight = 0;

function init(){

	var list = document.querySelectorAll('.gv-asset');
	for(var l = 0; l < list.length; l ++){
		queue.push(list[l]);
	}

	scanAssets();

	window.addEventListener(
		'scroll', 
		debounce(function(){
			scanAssets();
		}, 250)
	);

	window.addEventListener(
		'resize', 
		debounce(function(){
			scanAssets();
		}, 250)
	);



}

function scanAssets() {
	var w = window.innerWidth;
	var h = window.innerHeight;
	var resizeAsset = false;;
	if(w !== windowWidth || h !== windowHeight){
		windowWidth = w;
		windowHeight = h;
		resizeAsset = true;
	}

	for(var a = 0; a < queue.length; a ++){
		var status = loadAsset(queue[a], resizeAsset);
		if(status === 'loaded'){
			queue.splice(a, 1);
			a--;
		}
	}

}

function loadAsset(el, resizeAsset){
	
	var type = el.getAttribute('data-asset-type');
	var rect = el.getBoundingClientRect();
    var almostInView = (rect.top < windowHeight * 2.5 ) ? true : false;
   
	if(type === 'image'){
		if(resizeAsset){
			el.style.height =  (rect.width * el.getAttribute('data-image-ratio')) + 'px';
		}
		if(almostInView){
			loadImage(el, rect);
			return 'loaded';
		}
	} else if (type === 'iframe'){
		if(almostInView){
			loadIframe(el, rect);
			return 'loaded';
		}			
	}

	return 'notloaded';

}

function loadImage(el, bBox){

	var sizes = el.getAttribute('data-image-sizes').split(',');
	var sizeToLoad;
	for(var s = 0; s < sizes.length; s++){
		var w = Number(sizes[s]);
		if( bBox.width < w ){
			sizeToLoad = w;
			break;
		}
		if( s == sizes.length -1 ){
			sizeToLoad = w;
		}
	}
	var path = el.getAttribute('data-url') + '/' + sizeToLoad + '.jpg'
	
	var img = document.createElement('img');
	img.setAttribute('src', path);
	el.appendChild(img);

	el.style.height = 'auto';
	img.classList.add('gv-loaded');
	el.classList.remove('gv-asset');      

}

function loadIframe(el, bBox){
	el.classList.remove('gv-asset'); 
	iframeLoader.boot(el, el.getAttribute('data-url'));	
}

function debounce(func, wait, immediate) {
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





module.exports = {
	init: init
};
