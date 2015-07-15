var utils = require('./utils');

function audioPlayer(el){

	var player;
	var srcSet = false;
	var assetManager = require('./assetManager');

	function init(){

		player = el.getElementsByTagName('audio')[0];

		player.addEventListener("play", function () {
			assetManager.registerPlaying(player);
			el.classList.add("gv-state-playing");
			el.classList.remove("gv-state-paused");
		}, false);

		player.addEventListener("pause", function () {
			el.classList.add("gv-state-paused");
			el.classList.remove("gv-state-playing");
		}, false);

		player.addEventListener("timeupdate", utils.debounce(function(){ updateProgress(); }, 250), false);

		el.addEventListener('click', function(){
			if(!player.paused){
				pause();
			} else {
				play();
			}
		})



		//updateVisualProgress( percentPlayed, 50, 40, 0 )
	
	}

	function pause(){
		player.pause();
	}

	function play(){
		if(!srcSet){
			setSource();
		}
		player.play();
	}

	function setSource(){
		var sourceEl = document.createElement('source');
			sourceEl.setAttribute('type', 'audio/mpeg');
			sourceEl.setAttribute('src', el.getAttribute('data-url'));
			player.appendChild(sourceEl);
	}

	function updateProgress(){
		if(player.duration && player.currentTime){
			el.querySelector('.audio-progress-circle').setAttribute( 'points',  updateVisualProgress( player.currentTime / player.duration, 50, 40, 0 ) );
		}
	}

	function updateVisualProgress ( pct, innerRadius, outerRadius, c ) {
		// get an SVG points list for the segment
		var points = [], i, angle, start, end, getPoint;
		start = 0;
		end = 2 * (Math.PI)  * pct;
		getPoint = function ( angle, radius ) {
		return ( ( radius * Math.sin( angle ) ).toFixed( 2 ) + ',' + ( radius * -Math.cos( angle ) ).toFixed( 2 ) );
		};
		// get points along the outer edge of the segment
		for ( angle = start; angle < end; angle += 0.05 ) {
		points[ points.length ] = getPoint( angle, outerRadius );
		}
		points[ points.length ] = getPoint( end, outerRadius );
		// get points along the inner edge of the segment
		for ( angle = end; angle > start; angle -= 0.05 ) {
		points[ points.length ] = getPoint( angle, innerRadius );
		}
		points[ points.length ] = getPoint( start, innerRadius );
		// join them up as an SVG points list
		return points.join( ' ' );
	}

	init();

	return player;
}


module.exports = audioPlayer;