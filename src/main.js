var Handlebars = require('handlebars/dist/cjs/handlebars');
var Tabletop = require('./js/utils/tabletop');
//var detect = require('./js/utils/detect');
var reqwest = require('reqwest');
var assetManager = require('./js/components/assetManager');

var PhotoSwipe = require ('photoswipe');

console.log(PhotoSwipe)
var dom;

// Useful detection tool. See js/utils/detect.js for more.
//console.log('Is IOS: ', detect.isIOS());
//console.log('Connection speed: ', detect.getConnectionSpeed());

/**
 * Update app using fetched JSON data.
 * @param {object:json} data - JSON spreedsheet data.
 */

/**
 * Boot the app.
 * @param {object:dom} el - <figure> element on the page. 
 */
function boot(el) {

	dom = el;
 	//parse the parameters from the url or alt field of embed
    
    var params = parseUrl(dom);
    if(params.key){
    	//load data if key is found
        loadData(params);
    } else {
    	//error if key is not found
        dom.innerHTML = '<h1>Please enter a key in the alt text of the embed or as a param on the url in the format "key=""</h1>';
    }

}

function parseUrl(el){
    var urlParams; 
    var params = {};

    if(el.getAttribute('data-alt')){
        //pull params from alt tag of bootjs
        urlParams = el.getAttribute('data-alt').split('&');
    } else if(urlParams === undefined){
        //if doesn't exist, pull from url param
        urlParams = window.location.search.substring(1).split('&');
        //set live load so that data loads directly from google spreadsheets for speedy editing
        params.liveLoad = true;
    }
    
    urlParams.forEach(function(param){
     
        if (param.indexOf('=') === -1) {
	        params[param.trim()] = true;
	    } else {
	    	var pair = param.split('=');
	    	params[ pair[0] ] = pair[1];
	    }
        
    });
    
    return params;
}

function loadData(params){

    if(!params.liveLoad){
    	//load the data via cached files

    	reqwest({
            url: 'https://interactive.guim.co.uk/spreadsheetdata/'+params.key+'.json',
            type: 'json',
            crossOrigin: true
        })
		.then(function(json){
            var config = {};
            json.sheets.config.forEach(function(d){
                config[d.param] = d.value;
            });

		    render(json.sheets.blocks, config);
		});

    } else {
    	//load the data via tabletop for speedy editing (ie no caching layer)
        Tabletop.init({ 
            key: params.key,
            callback: function(data) { 
                render(data.blocks.elements, data.config.elements);
            }
        });
    }
    
}

function render(blocks, config){

    var rowData = [];
    var row;

    blocks.forEach(function(b,i){
        if(b.blocktype === 'row'){

            if(i > 0){
                rowData.push(row);
            }
            row = {
                row: b,
                blocks: []
            };
        } else {
            row.blocks.push(b);

            if(row.blocks.length === 1){
                row.row.layout = (b.layout.search('flex') > -1) ? 'flex' : "full";


            }

            if(i === blocks.length -1){
                rowData.push(row);
            }

        }

    });


        
    var data = {
        rows: rowData,
        config: config,
        media: ['facebook', 'twitter', 'mail']
    };

    Handlebars.registerHelper({
        'if_eq': function(a, b, opts) {
    	    if(a === b){
    	        return opts.fn(this);
    	    }
    	    return opts.inverse(this);
    	},
        'if_not_eq': function(a, b, opts) {
            if(a === b){
                return opts.inverse(this);
            }
            return opts.fn(this);
                
        },
        getImageData: function(){
            var query = this.assetdata;
            query = query.split('&');
            var imgData = {
                cropRatio: 1,
                sizes: []
            };
            query.forEach(function(d){
                var pair = d.split('=');
                if( pair[0] === 'cropRatio' ){
                    var sizes = pair[1].split(',');
                    imgData.cropRatio = Number(sizes[1]) / Number(sizes[0]); 
                } else {
                    imgData[ pair[0] ] = pair[1];
           
                }
            });


            return 'data-image-ratio=' + imgData.cropRatio +' data-image-sizes=' + imgData.size ; 
        },

    });

    Handlebars.registerPartial({
        'row': require('./html/row.html'),
        'block': require('./html/block.html'),
        'titleBlock': require('./html/block_title.html'),
        'audioBlock': require('./html/block_audio.html'),
        'iframeBlock': require('./html/block_iframe.html'),
        'photoBlock': require('./html/block_photo.html'),
        'textBlock': require('./html/block_text.html'),
        'quoteBlock': require('./html/block_quote.html'),
        'videoBlock': require('./html/block_video.html'),
        'shareBlock': require('./html/block_share.html')


    });

  	var content = Handlebars.compile( 
                        require('./html/base.html'), 
                        { 
                            compat: true
                        
                        }
                );
  	
  	dom.innerHTML = content(data);

    assetManager.init();

}

module.exports = { boot: boot };