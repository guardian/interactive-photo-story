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
			queue.sort( ( a, b ) => a.priority - b.priority );

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
				
				image.onload = () => {
					item.fulfil();
					run();
				};

				image.onerror = err => {
					item.reject( err );
					run();
				};

				image.src = item.src;
			}
		}
	};

	return imageQueue;

});
