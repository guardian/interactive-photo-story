define([ 'promise', 'throttle' ], function ( Promise, throttle ) {

	'use strict';
	

	var queue = [];

	var totalPreloaded = 4;
	var loadingCurrent = 0;
	var loadingMax = 4;
	var loadingQueue = [];
	var windowTop = 0;
	var windowHeight = window.innerHeight;

	var imageQueue = {
		add: function ( node, src ) {
			// return a promise

			return new Promise( function ( fulfil, reject ) {
				var el = {
					fulfil: fulfil,
					reject: reject,
					src: src,
					node: node,
					position: node.offsetTop
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
			
			image.onload = function() {
				item.fulfil();
				loadingCurrent --;
				imageQueue.watchLoadingQueue();
			};

			image.onerror = function(err) {
				item.reject( err );
				loadingCurrent --;
				imageQueue.watchLoadingQueue();
			};

			image.src = item.src;
		},
		loadingThrottler: throttle( function(){
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
