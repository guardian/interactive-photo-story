var bandwidth = require('../utils/bandwidth');
var iframeLoader = require('../utils/iframeLoader');
var polyfills = require ('../utils/polyfills');
var utils = require ('../components/utils');


var MediaPlayer = require ('../components/mediaPlayer');

//array populated during init, scrapes all classes for 'gv-asset'
var queue = [];		
var currentlyPlaying;

//default config data
var windowWidth = 0;
var windowHeight = 0;
var DEFAULT_BITRATE = '488k';
var videoBitRate = DEFAULT_BITRATE;


function init(){
	
	//wait for content to be loaded then detect bitrate
	setTimeout(function() {
        bandwidth.getSpeed(setVideoBitrate);
    }, 2000);

	//determine assets to lazy load or monitor viewport position
	var list = document.querySelectorAll('.gv-asset');
	for(var l = 0; l < list.length; l ++){
		queue.push({
			el: list[l],
			status: 'none'
		});
	}

	//scan the list of managed assets
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

function measureWindow(){
	var w = window.innerWidth;
	windowHeight = window.innerHeight;

	if(w !== windowWidth){
		windowWidth = w;
		return true;
	}
	return false;
}


//scans the list of media elements for loading, initializing, unloading
function scanAssets() {
	resizeAsset = measureWindow();

	for(var a = 0; a < queue.length; a ++){

		if(queue[a].status === 'none'){
			var status = updateAsset(queue[a], queue[a].el, queue[a].el.getAttribute('data-asset-type'), resizeAsset);
			if(status === 'loaded'){
				queue.splice(a, 1);
				a--;
			}
		}

	}

}

function updateAsset(asset, el, type, resizeAsset){
	var position = measureElement(el);
   
	if(type === 'image' || type === 'image-lead'){
		
		if(resizeAsset){
			el.setAttribute('style', 'height: ' + (position.rect.width * el.getAttribute('data-image-ratio')) + 'px');
		}

		if(position.nearViewport){
			loadImage(el, position.rect);
			return 'loaded';
		}

	} else if (type === 'iframe'){

		if(position.nearViewport){
			loadIframe(el);
			return 'loaded';
		}			

	} else if (type === 'audio'){

		if(!asset.player){
			asset.player = new MediaPlayer(el);
			el.classList.remove('gv-asset');
		}

		if(position.nearViewport){
			asset.player.isReady(true);
		}

		return 'active';

	} else if (type === 'video'){

		if(!asset.player){
			asset.player = new MediaPlayer(el);
			el.classList.remove('gv-asset'); 
		}

		if(position.nearViewport){
			asset.player.isReady(true);
			return 'active';
		}

		asset.player.isReady(false);
		return 'active';		
	}

	return 'notloaded';
}

function measureElement(el){

	var rect = el.getBoundingClientRect();

	return {
		inViewport: (rect.top < windowHeight ) ? true : false,
		nearViewport: ( Math.abs(rect.top) < windowHeight * 2 ) ? true : false,
		rect: rect
	}
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

	var image = new Image();
	var path = el.getAttribute('data-url') + '/' + sizeToLoad + '.jpg';
	


	image.onload = function() {
			
			var img = document.createElement('img');
			img.setAttribute('src', path);
			el.appendChild(img);
			

			el.setAttribute('style', 'height: auto;');
       		el.classList.remove('gv-asset'); 
       		el.classList.add('gv-loaded');
	};  

	image.src = path;

}

function loadIframe(el){
	el.classList.remove('gv-asset'); 
	iframeLoader.boot(el, el.getAttribute('data-url'));	
}


function registerPlaying(player){
	if(currentlyPlaying != player){
		if(currentlyPlaying){
			currentlyPlaying.pause();
		}
		
		currentlyPlaying = player;
	} 
	
}

function setVideoBitrate(bitrate) {
	var kbps = bitrate / 1024;
	if (kbps >= 4068) { videoBitRate = '4M'; }
	if (kbps < 4068) { videoBitRate  = '2M'; }
	if (kbps < 2048) { videoBitRate  = '768k'; }
	if (kbps < 1024) { videoBitRate  = '488k'; }
	if (kbps < 512)  { videoBitRate  = '220k'; }
}

module.exports = {
	init: init,
	registerPlaying: registerPlaying,
	videoBitRate: videoBitRate
};
