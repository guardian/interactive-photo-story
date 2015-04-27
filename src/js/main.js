define([
    'get',
    'imageQueue',
    'rvc!templates/appTemplate',
    'rvc!templates/block_lead',
    'rvc!templates/block_photo',
    'rvc!templates/block_quote',
    'rvc!templates/shareContainer'
], function(
    get,
    imageQueue,
    AppTemplate,
    blockLeadTemplate,
    blockPhotoTemplate,
    blockQuoteTemplate,
    shareContainerTemplate
) {
   'use strict';
    var dom;
    var base;


    function parseUrl(el){
        
        var urlParams; 
        
        //sample ?key=1H2Tqs-0nZTqxg3_i7Xd5-VHd2JMIRr9xOKe72KK6sj4

        if(el.getAttribute('data-alt')){
            //pull params from alt tag of bootjs
            urlParams = el.getAttribute('data-alt').split('&');
        } else if(urlParams == undefined){
            //if doesn't exist, pull from url param
            urlParams = window.location.search.substring(1).split('&');
        }


        var params = {};
        urlParams.forEach(function(param){
            var pair = param.split('=');
            params[ pair[0] ] = pair[1];
        })
        
        return params;
    }

    function init(el, context, config, mediator) {
        // DEBUG: What we get given on boot

       // console.log(el, context, config, mediator);
        var params = parseUrl(el);
        if(params.key){
            get('http://interactive.guim.co.uk/spreadsheetdata/'+params.key+'.json')
            .then(JSON.parse)
            .then(render);
        } else {
            console.log('Please enter a key in the alt text of the embed or as a param on the url in the format "key="" ')
        }


       dom = el;
        var SPREADSHEET_KEY = '1H2Tqs-0nZTqxg3_i7Xd5-VHd2JMIRr9xOKe72KK6sj4';
            get('http://interactive.guim.co.uk/spreadsheetdata/'+SPREADSHEET_KEY+'.json')
                .then(JSON.parse)
                .then(render);
    }

    function render(json){
        var data = {
            blocks: json.sheets.blocks,
            config: {}
        }
        //convert array of params into a single config object
        json.sheets.config.forEach(function(d){

            if(d.param.search('_sizes') > -1){
                //converts string of sizes into array of numbers
                var a = d.value.split(',');
                a.forEach(function(d,i){
                    a[i] = Number(d);
                })
                data.config[d.param] = a;

            } else {
                //stores params in key value pairs of config object
                data.config[d.param] = d.value;
            }

            
        })


        base = new AppTemplate({
            el: dom,
            data: data,
            components: {
                leadBlock: blockLeadTemplate,
                photoBlock: blockPhotoTemplate,
                quoteBlock: blockQuoteTemplate,
                shareContainer: shareContainerTemplate
            },
            decorators: {
                lazyload: function ( node, options ) {
                    imageQueue.add( node, options.src, options.imgSizes ).then( function (path) {
                        var img = document.createElement("img");
                        img.setAttribute("src", path);
                        node.appendChild(img);
                   
                        node.className = node.className.replace('guLazyLoad','');
                    });

                    return {
                        teardown: function () {}
                    }
                }
            }
        });
        base.on('*.share',shareContent);

    }
    function shareContent(e, platform, url){
        var shareWindow;
        var twitterBaseUrl = "http://twitter.com/share?text=";
        var facebookBaseUrl = "https://www.facebook.com/dialog/feed?display=popup&app_id=741666719251986&link=";
        console.log(e,platform,url);
        var articleUrl = "http://gu.com/p/47pqt"
        var urlsuffix = url.toString() ? "#p" + url : "";
        var shareUrl = articleUrl + urlsuffix;

        var message = "Sharemessage";
        
        var shareImage = "@@assetPath@@/imgs/";
         
        if(platform === "twitter"){
            shareWindow = 
                twitterBaseUrl + 
                encodeURIComponent(message) + 
                "&url=" + 
                encodeURIComponent(shareUrl)   
        }else if(platform === "facebook"){
            shareWindow = 
                facebookBaseUrl + 
                encodeURIComponent(shareUrl) + 
                "&picture=" + 
                encodeURIComponent(shareImage) + 
                "&redirect_uri=http://www.theguardian.com";
        }else if(platform === "mail"){
            shareWindow =
                "mailto:" +
                "?subject=" + message +
                "&body=" + shareUrl 
        }
        window.open(shareWindow, platform + "share", "width=640,height=320");
    }

    return {
        init: init
    };
});
