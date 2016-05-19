define(['libs/throttle'], function (throttle) {
    var targets = [];
    var iframeLoader = {
        createIframe: function(el, link){
            var iframe;

            function _postMessage(message) {
                iframe.contentWindow.postMessage(JSON.stringify(message), '*');
            }

            if (link) {
                iframe = document.createElement('iframe');
                iframe.style.width = '100%';
                iframe.style.border = 'none';
                iframe.height = '500'; // default height
                iframe.src = link;

                // Listen for requests from the window
                window.addEventListener('message', function(event) {
                    if (event.source !== iframe.contentWindow) {
                        return;
                    }

                    // IE 8 + 9 only support strings
                    var message = JSON.parse(event.data);

                    // Actions
                    switch (message.type) {
                        case 'set-height':
                            iframe.height = message.value;
                            break;
                        case 'navigate':
                            document.location.href = message.value;
                            break;
                        case 'scroll-to':
                            window.scrollTo(message.x, message.y);
                            break;
                        case 'get-location':
                            _postMessage({
                                'id':       message.id,
                                'type':     message.type,
                                'hash':     window.location.hash,
                                'host':     window.location.host,
                                'hostname': window.location.hostname,
                                'href':     window.location.href,
                                'origin':   window.location.origin,
                                'pathname': window.location.pathname,
                                'port':     window.location.port,
                                'protocol': window.location.protocol,
                                'search':   window.location.search
                            }, message.id);
                            break;
                        case 'get-position':
                            _postMessage({
                                'id':           message.id,
                                'type':         message.type,
                                'iframeTop':    iframe.getBoundingClientRect().top,
                                'innerHeight':  window.innerHeight,
                                'innerWidth':   window.innerWidth,
                                'pageYOffset':  window.pageYOffset
                            });
                            break;
                        default:
                           //console.error('Received unknown action from iframe: ', message);
                    }
                }, false);

                // Replace link with iframe
                // Note: link is assumed to be a direct child
                el.appendChild(iframe);
            }
        },
        add: function (el, link) {
            targets.push({
                el:el,
                link:link,
                position:el.offsetTop
            })
        },
        lazyLoad: function(){
            var windowTop  = window.pageYOffset || document.documentElement.scrollTop;
            var i = targets.length;
            console.log(i)
            while (i--) {
                if(targets[i].position <= windowTop + windowHeight*2 ){
                    iframeLoader.createIframe(targets[i].el,targets[i].link)
                    targets.splice(i,1)
                }
            }
        },
        init: function(){
            var loadingThrottler = throttle(function(){
                windowHeight = window.innerHeight;
                windowWidth = window.innerWidth;
                iframeLoader.lazyLoad()
            });

            window.addEventListener("resize", loadingThrottler, false );
            window.addEventListener("scroll", loadingThrottler, false );
            loadingThrottler();
        }
    };
        return iframeLoader
});
