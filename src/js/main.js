define([
    'libs/get',
    'libs/tabletop',
    'libs/imageQueue',
    'libs/iframeLoader',
    'rvc!templates/appTemplate',
    'rvc!templates/block_lead',
    'rvc!templates/block_photo',
    'rvc!templates/block_quote',
    'rvc!templates/block_text',
    'rvc!templates/block_audio',
    'rvc!templates/block_title',
    'rvc!templates/block_html',
    'rvc!templates/shareContainer'
], function(
    get,
    Tabletop,
    imageQueue,
    iframeLoader,
    AppTemplate,
    blockLeadTemplate,
    blockPhotoTemplate,
    blockQuoteTemplate,
    blockTextTemplate,
    blockAudio,
    blockTitle,
    blockHtml,
    shareContainerTemplate
) {
   'use strict';
    var dom;
    var base;
    var liveLoad = false;
    var showOneStageOnly = false;
    var showAnimation = true;
    var latestRace = 1;

    function isAndroid() {
        return /Android/i.test(navigator.userAgent);
    }
    var isAndroidApp = (isAndroid() && window.location.origin === "file://" ) ? true : false;

    function parseUrl(el){
        var urlParams; 
        //sample ?key=1H2Tqs-0nZTqxg3_i7Xd5-VHd2JMIRr9xOKe72KK6sj4

        if(el.getAttribute('data-alt')){
            //pull params from alt tag of bootjs
            urlParams = el.getAttribute('data-alt').split('&');
        } else if(urlParams == undefined){
            //if doesn't exist, pull from url param
            urlParams = window.location.search.substring(1).split('&');
            liveLoad = true;
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
        dom = el;
       // console.log(el, context, config, mediator);
        var params = parseUrl(el);
        if(params.key){
            loadData(params);
        } else {
            console.log('Please enter a key in the alt text of the embed or as a param on the url in the format "key="" ')
        }
    }
    
    function loadData(params){
        
        var url = sheetURL(params.key);
        
        
        
         get(url)
                .then(JSON.parse)
                .then(function(json){
                    correctData(json.sheets.blocks, json.sheets.config);  
                    render(json.sheets.blocks, json.sheets.config);

                        if(isAndroidApp && window.GuardianJSInterface.registerRelatedCardsTouch){
            var menuEl = document.querySelector('#top-navs');

            menuEl.addEventListener("touchstart", function(){
                window.GuardianJSInterface.registerRelatedCardsTouch(true);
            });
            menuEl.addEventListener("touchend", function(){
                window.GuardianJSInterface.registerRelatedCardsTouch(false);
            });
        }

                });
        
        // if(!liveLoad){
            
        //     get('http://interactive.guim.co.uk/spreadsheetdata/'+params.key+'.json')
        //         .then(JSON.parse)
        //         .then(function(json){
        //             render(json.sheets.blocks, json.sheets.config)
        //         });
        // } else {
        //     Tabletop.init({ 
        //         key: params.key,
        //         callback: function(data, tabletop) { 
        //             render(data.blocks.elements, data.config.elements)
        //         }
        //     });
        // }
        
    }
    
    function correctData(blocks, config) {
        var i;
        
        for (var i = 0; i< blocks.length; i++) {
            blocks[i].bandcolor = blocks[i].band_color;
            blocks[i].blocktype = blocks[i].block_type;
            blocks[i].stageclass = blocks[i].stage_class;
            blocks[i].customstyle = blocks[i].custom_style;
            blocks[i].leadtextposition = blocks[i].lead_text_position;
            blocks[i].photoshape = blocks[i].photo_shape;
            blocks[i].primarytext = blocks[i].primary_text;
            blocks[i].secondarytext = blocks[i].secondary_text;
            blocks[i].textcolor = blocks[i].text_color;
            blocks[i].rowNumber = i+1;
        }
        
    }
    
    function sheetURL(sheetID) {
    var protocol = window.location.protocol.substring(0,4) !== 'http' ? 'https://' : '//';
    return protocol + 'interactive.guim.co.uk/docsdata/' + sheetID + '.json';
}

    // function loadData(params){
    //     alert("yes");
    //     params.key = "1pnRPxPSI2oNYqCnUUValMirUnA53eQMuNyVM5oBbPlI";
    //     if(!liveLoad){
            
    //         get('http://interactive.guim.co.uk/spreadsheetdata/'+params.key+'.json')
    //             .then(JSON.parse)
    //             .then(function(json){
    //                 render(json.sheets.blocks, json.sheets.config)
    //             });
    //     } else {
    //         Tabletop.init({ 
    //             key: params.key,
    //             callback: function(data, tabletop) { 
    //                 render(data.blocks.elements, data.config.elements)
    //             }
    //         });
    //     }
        
    // }

    function render(blocks, config){

        //var elmnt = document.getElementById();
        var w = dom.offsetWidth;

       if ( w < 480 ) { // Is it mobile?
           showOneStageOnly = true;
       }

       if ( w < 980 ) { // Is it smaller device?
           showAnimation = false;
       }
        
        // console.log(blocks);
        // Change firstcoming race to "today:"
        latestRace = 1;
        blocks.map(function(block){
            console.log(block.old);
            block.showAnimation = showAnimation;
             if(block.blocktype === "divider" && block.old === "TRUE"){
           latestRace++;
            }
        })
        
       
        var isOld = blocks.filter(function(block){
            return block.old === "TRUE";
        }).length

        var data = {
            blocks: blocks,
            config: {},
            hideOld: true,
            isOld: isOld
        }

        //convert array of params into a single config object
        config.forEach(function(d){
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

        loadStyles(data.config);

        data.shareMessage = data.config.sharemessage;
        
        base = new AppTemplate({
            el: dom,
            data: data,
            components: {
                leadBlock: blockLeadTemplate,
                photoBlock: blockPhotoTemplate,
                quoteBlock: blockQuoteTemplate,
                textBlock: blockTextTemplate,
                shareContainer: shareContainerTemplate,
                audioBlock: blockAudio,
                htmlBlock: blockHtml,
                titleBlock: blockTitle
            },
            selectNav: function ( elem ) {
               //console.log(elem);
                // get all 'a' elements
    var a = document.getElementsByClassName('nav');
    // loop through all 'a' elements
    for (var i = 0; i < a.length; i++) {
        // Remove the class 'active' if it exists
        a[i].classList.remove('nav-selected');
       
    }
    
    var e = document.getElementById("nav_" + elem);
    // add 'active' classs to the element that was clicked
    e.classList.add('nav-selected');

     if (showOneStageOnly) {

         showSingleStage(elem);
  
     }
                
                
                
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
                },
                loadiframe: function(node,options){
                    iframeLoader.add(node,options.url);

                    return {
                        teardown: function () {}
                    }
                }
            }
        });
        base.on('showOld',function(e){
            this.set('hideOld',false);
            
            //var y = document.getElementsByClassName("hideOld");
            //y[y.length-1].className = y[y.length-1].className.replace(/\bhideOld\b/,'');
            //alert(y[y.length-1].className);
        })
        iframeLoader.init();

        enhancePage();

         if (showOneStageOnly) {
       
         var a = document.getElementsByClassName('interactiveWrapper');
        
        a[0].classList.add('forceOptimisedView');
        showSingleStage(latestRace);
        
        }

        base.selectNav(latestRace);

        document.addEventListener("click", function(e){

            var t=e.target.className;

            switch (t) {

                case "share-facebook" :
                shareApp("facebook");
                break;

                case "share-twitter" :
                 shareApp("twitter");
                break;

                case "share-email" :
                 shareApp("mail");
                break;


            }
  
        });

        function shareApp( platform ) {
           

            var shareWindow;
				        var twitterBaseUrl = "http://twitter.com/share?text=";
				        var facebookBaseUrl = "https://www.facebook.com/dialog/feed?display=popup&app_id=741666719251986&link=";
				        //var articleUrl = "http://www.theguardian.com/politics/ng-interactive/2015/may/07/general-election-2015-voters-voices"
		                // if(this.get('config.url')){
		        		// 	articleUrl = this.get('config.url');
		        		// }else{
		        		// 	articleUrl = "http://www.theguardian.com/politics/ng-interactive/2015/may/07/general-election-2015-voters-voices";
		        		// }
				        // var urlsuffix = url.toString() ? "#p" + url : "";
				        // var shareUrl = articleUrl + urlsuffix;

                        var shareUrl = "https://gu.com/p/4kzga";

				        var message = "Tour de France 2016 stage by stage guide from the Guardian";
				       
				        // var shareImage = "http://media.guim.co.uk/b93f5ac5cb86e8bb1a46ab672ca89ea46ff16fe1/0_0_3543_2362/2000.jpg";

				        // if(this.get('config.shareImage')){
		        		// 	shareImage = this.get('config.shareImage');
		        		// }else{
		        		// 	shareImage = "http://www.theguardian.com/politics/ng-interactive/2015/may/07/general-election-2015-voters-voices";
		        		// }

                        var shareImage = "";
				         
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
				                // "&picture=" + 
				                // encodeURIComponent(shareImage) + 
				                "&redirect_uri=http://www.theguardian.com";
				        }else if(platform === "mail"){
				            shareWindow =
				                "mailto:" +
				                "?subject=" + message +
				                "&body=" + shareUrl 
				        }
				        window.open(shareWindow, platform + "share", "width=640,height=320");     
        }

        
        
    }



    function showSingleStage(elem) {
    var a = document.getElementsByClassName('stage');
    // loop through all 'a' elements
    for (var i = 0; i < a.length; i++) {
        // Remove the class 'active' if it exists
        a[i].classList.remove('force-stage-visible');
       
    }
     a = document.getElementsByClassName('stage-' + elem);
    for (i = 0; i < a.length; i++) {
    a[i].classList.add('force-stage-visible');
    }
    }

    function enhancePage(){
        var footer = document.querySelector('.l-footer');
        if(footer){
            footer.setAttribute('style','display:block;');
        }

        var isImmersive = document.querySelector('.is-immersive');
        
        if(!isImmersive){
            var containers = document.querySelectorAll('.gs-container');
            for(var i=0; i<containers.length; i++){
                var container = containers[i];
                var interactiveContainer = container.getAttribute('data-test-id');
                if(interactiveContainer){
                    container.setAttribute('style','padding-left:0; padding-right:0;')
                }
            }
        }
    }

    function loadStyles(config){
        if(config.customcss){
            var head = document.head || document.getElementsByTagName('head')[0],
                style = document.createElement('style');

            style.type = 'text/css';
            if (style.styleSheet){
              style.styleSheet.cssText = config.customcss;
              console.log('he')
            } else {
              style.appendChild(document.createTextNode(config.customcss));
              console.log('h0')
            }

            head.appendChild(style);
        }
        
    }
    

    return {
        init: init
    };
});

