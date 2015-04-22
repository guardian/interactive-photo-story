define([
    'get',
    'imageQueue',
    'rvc!templates/appTemplate'
], function(
    get,
    imageQueue,
    AppTemplate
) {
   'use strict';

    var base;

    function init(el, context, config, mediator) {
        // DEBUG: What we get given on boot
        console.log(el, context, config, mediator);

        var SPREADSHEET_KEY = '1H2Tqs-0nZTqxg3_i7Xd5-VHd2JMIRr9xOKe72KK6sj4';
        get('http://interactive.guim.co.uk/spreadsheetdata/'+SPREADSHEET_KEY+'.json')
            .then(JSON.parse)
            .then(render);
    }

    function render(json){
        console.log(json)
        var data = {
            blocks: json.sheets.blocks,
            config: {}
        }

        json.sheets.config.forEach(function(d){
            data.config[d.param] = d.value;
        })


         base = new AppTemplate({
            el: el,
            data: data
        });

    }

    return {
        init: init
    };
});
