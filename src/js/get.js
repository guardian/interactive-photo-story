define([ 'promise' ], function ( Promise ) {

	'use strict';
	var options = {};

	return function ( url, onsuccess, onerror ) {
			
		return new Promise( function ( fulfil, reject ) {
			var xdr, xhr;

			if ( window.XDomainRequest ) {
				xdr = new XDomainRequest();
				xdr.onerror = reject;
				xdr.ontimeout = function () {};
				xdr.onprogress = function () {};
				xdr.onload = function() {
					fulfil( xdr.responseText );
				};
				xdr.timeout = 5000;
				xdr.open( 'get', url );
				xdr.send();
			}
			else {
				xhr = new XMLHttpRequest();

				xhr.open( 'GET', url );

				if ( options.responseType ) {
					xhr.responseType = options.responseType;
				}

				xhr.onload = function () {
					fulfil( options.responseType ? xhr.response : xhr.responseText );
				};

				xhr.onerror = reject;

				xhr.send();
			}
		});

	
	};

});
