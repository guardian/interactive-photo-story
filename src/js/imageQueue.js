define([ 'promise' ], function ( Promise ) {

	'use strict';
	var queue = [];

	var imageQueue = {
		add: function ( src, priority ) {
			// return a promise

			return new Promise( function ( fulfil, reject ) {
				queue.push({
					fulfil: fulfil,
					reject: reject,
					src: src,
					priority: priority
				});
			})
		},

		start: function () {
			// TODO
			queue.sort( function( a, b ){ return  a.priority - b.priority });

			run();
			run();
			run();
			run();

			function run () {
				var item = queue.shift(), image;

				if ( !item ) {
					// whatevs
					return;
				}

				image = new Image();
				
				image.onload = function() {
					item.fulfil();
					run();
				};

				image.onerror = function(err) {
					item.reject( err );
					run();
				};

				image.src = item.src;
			}
		}
	};

	return imageQueue;

});
