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

        var SPREADSHEET_KEY = '19ftM9AI6WngBiZHQwKXxRcN9nFZUWx2Guq-UOuSd5yU';
        get('http://interactive.guim.co.uk/spreadsheetdata/'+SPREADSHEET_KEY+'.json')
            .then(JSON.parse)
            .then(render);
    }

    function render(json){
         var base = new AppTemplate({
            el: el
        });
    }

    return {
        init: init
    };
});
