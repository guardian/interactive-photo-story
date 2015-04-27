define([ 'promise', 'throttle' ], function ( Promise, throttle ) {

	'use strict';
	

	var queue = [];

	var totalPreloaded = 3;
	var loadingCurrent = 0;
	var loadingMax = 4;
	var loadingQueue = [];
	var windowTop = 0;
	var windowHeight = window.innerHeight;
	var windowWidth = window.innerWidth;

	var imageQueue = {
		add: function ( node, src, imgSizes ) {
			// return a promise

			return new Promise( function ( fulfil, reject ) {
				var el = {
					fulfil: fulfil,
					reject: reject,
					src: src.replace('https://', '').replace('http://', '').replace(/\/$/, ''),
					node: node,
					position: node.offsetTop,
					imgSizes: imgSizes
				};

				if( totalPreloaded > 0){
					totalPreloaded --;
					imageQueue.fetchPhoto(el);
				} else {
					queue.unshift(el);
				}
				
			})


		},
		lazyLoad: function(){
			windowTop  = window.pageYOffset || document.documentElement.scrollTop;
			
			var i = queue.length;
	
			while (i--) {
			    if(queue[i].node.offsetTop <= windowTop + windowHeight*2 ){
					loadingQueue.push(queue.pop());
				}

			}

			imageQueue.watchLoadingQueue();

			

			
		},
		watchLoadingQueue: function(){
			if(loadingCurrent < loadingMax && loadingQueue.length > 0){
				loadingCurrent ++;
	
				var item = loadingQueue.shift()
				imageQueue.fetchPhoto(item);
			}
		},

		fetchPhoto: function(item){
			
			var image = new Image();

			var imgSize;
			if(windowWidth < 640){
				//load smallest image to fit small screen
				imgSize = item.imgSizes[0];
			} else if( windowWidth < 760 ) {
				//load medium image to fit vertical iPad layout 
				imgSize = item.imgSizes[1];
			} else {
				//load determine image to load by size of position for desktop layout
				var elWidth = item.node.offsetWidth;
				if(elWidth <= item.imgSizes[0]){
					imgSize = item.imgSizes[0];
				} else if(elWidth <= item.imgSizes[1] ){
					imgSize = item.imgSizes[1];
				} else {
					imgSize = item.imgSizes[2];
				}
			};
			var path = 'http://' + item.src + '/' + imgSize + '.jpg';
			
			image.onload = function() {
				item.fulfil(path);
				loadingCurrent --;
				imageQueue.watchLoadingQueue();
			};

			image.onerror = function(err) {
				item.reject( err );
				loadingCurrent --;
				imageQueue.watchLoadingQueue();
			};

			//determine size to load
			
			

			//load image
			image.src = path;
		},
		loadingThrottler: throttle( function(){
			windowHeight = window.innerHeight;
			windowWidth = window.innerWidth;
			imageQueue.lazyLoad()
		}),
		init: function(){
			window.addEventListener("resize", imageQueue.loadingThrottler, false );
			window.addEventListener("scroll", imageQueue.loadingThrottler, false );
		}


	};


	imageQueue.init();


	return imageQueue;

});
