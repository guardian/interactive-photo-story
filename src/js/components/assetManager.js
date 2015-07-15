var iframeLoader = require('../utils/iframeLoader');
var polyfills = require ('../utils/polyfills');
var utils = require ('../components/utils');

var AudioPlayer = require ('../components/audioPlayer');

var queue = [];		//array populated during init, scrapes all classes for 'gv-asset'
var windowWidth = 0;
var windowHeight = 0;

var currentlyPlaying;

function init(){

	var list = document.querySelectorAll('.gv-asset');
	for(var l = 0; l < list.length; l ++){
		queue.push({
			el: list[l],
			status: 'none'
		});
	}

	scanAssets();

	window.addEventListener(
		'scroll', 
		utils.debounce(function(){
			scanAssets();
		}, 250)
	);

	window.addEventListener(
		'resize', 
		utils.debounce(function(){
			scanAssets();
		}, 250)
	);

}

function scanAssets() {
	var w = window.innerWidth;
	var h = window.innerHeight;
	var resizeAsset = false;
	if(w !== windowWidth || h !== windowHeight){
		windowWidth = w;
		windowHeight = h;
		resizeAsset = true;
	}

	for(var a = 0; a < queue.length; a ++){

		if(queue[a].status === 'none'){
			var status = loadAsset(queue[a].el, resizeAsset);
			if(status === 'loaded'){
				queue.splice(a, 1);
				a--;
			} else if( status === 'active'){
				queue[a].status = 'active';
			}
		} else if(queue[a].status === 'active'){

		}
		
		
	}

}

function loadAsset(el, resizeAsset){
	
	var type = el.getAttribute('data-asset-type');
	var rect = el.getBoundingClientRect();
    var almostInView = (rect.top < windowHeight * 2 ) ? true : false;
   
	if(type === 'image' || type === 'image-lead'){
		if(resizeAsset){
			el.setAttribute('style', 'height: ' + (rect.width * el.getAttribute('data-image-ratio')) + 'px');
			rect = el.getBoundingClientRect();
			almostInView = (rect.top < windowHeight * 2 ) ? true : false;
		}
		if(almostInView){
			loadImage(el, rect);
			return 'loaded';
		}
	} else if (type === 'iframe'){
		if(almostInView){
			loadIframe(el);
			return 'loaded';
		}			
	} else if (type === 'audio'){

		var player = new AudioPlayer(el);

		return 'active';
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
		if( s === sizes.length -1 ){
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

function loadIframe(el){
	el.classList.remove('gv-asset'); 
	iframeLoader.boot(el, el.getAttribute('data-url'));	
}


function registerPlaying(player){
	if(currentlyPlaying){
		currentlyPlaying.pause();
	}
	currentlyPlaying = player;
}

module.exports = {
	init: init,
	registerPlaying: registerPlaying
};
