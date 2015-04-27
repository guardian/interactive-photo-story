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

    var base;

    function init(el, context, config, mediator) {
        // DEBUG: What we get given on boot

       // console.log(el, context, config, mediator);


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
            el: el,
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

    }

    return {
        init: init
    };
});
