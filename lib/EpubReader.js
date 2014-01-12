
define(['jquery', 'bootstrap', 'URIjs', 'Readium', 'storage/Settings', 'i18n/Strings', 'ReaderSettingsDialog', 'hgn!templates/about-dialog.html', 'hgn!templates/reader-navbar.html', 'hgn!templates/reader-body.html'], function ($, bootstrap, URI, Readium, Settings, Strings, SettingsDialog, AboutDialog, ReaderNavbar, ReaderBody) {

    var readium, 
        embedded,
        el = document.documentElement,
        currentDocument,
        requestFullScreen = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullScreen, 
        cancelFullScreen = document.cancelFullScreen || document.webkitCancelFullScreen || document.mozCancelFullScreen;

    var installHookFunc = function(){
         window.addEventListener('mousemove', function(){
            parent.postMessage('mousemove', parent.location.origin);
        });
    }

    var receiveHook = function(){
        $(window).on('message', function(e){
            if (e.originalEvent.data == 'mousemove'){
                hideLoop();
            }
        });
    }
    
    // This function will retrieve a package document and load an EPUB
    var loadEbook = function (packageDocumentURL) {

        readium.openPackageDocument(packageDocumentURL, function(packageDocument){
            currentDocument = packageDocument;
            currentDocument.generateTocListDOM(function(dom){
                loadToc(dom)
                loadComments();
            });
            $('iframe').on('load', function(){
                frames[0].window.eval('(' + installHookFunc.toString() + ')()');
            });
            receiveHook();
        });
    };



    var loadToc = function(dom){
        $('script', dom).remove();

        var tocNav;

        var $navs = $('nav', dom);
        Array.prototype.every.call($navs, function(nav){
            if (nav.getAttributeNS('http://www.idpf.org/2007/ops', 'type') == 'toc'){
                tocNav = nav;
                return false;
            }
            return true;
        });

        
        var toc = (tocNav && $(tocNav).html()) || $('body', dom).html() || $(dom).html();
        var tocUrl = currentDocument.getToc();

        $('#readium-toc-body').html(toc);
        $('#readium-toc-body').on('click', 'a', function(e){
            var href = $(this).attr('href');
            href = tocUrl ? new URI(href).absoluteTo(tocUrl).toString() : href; 

            readium.reader.openContentUrl(href);
            if (embedded){
                $('.toc-visible').removeClass('toc-visible');
                $(document.body).removeClass('hide-ui');
            }
            return false;
        });
        $('#readium-toc-body').prepend('<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>');
        $('#readium-toc-body button.close').on('click', function(){
            $('#app-container').removeClass('toc-visible');
            if (embedded){
                $(document.body).removeClass('hide-ui');
            }
            return false;
        });
    }

    var loadComments = function(){
        var comments = window.localStorage.getItem("comments");
        if(comments){
            comments = JSON.parse(comments);
            for(var i=0; i<comments.length; i++){
                var comment = comments[i];
                $('#sidebar').append("<div>"+comment.name+": "+comment.comment+" ("+comment.cfi.cfi+")</div>");
            }
        }
    }

    var highlightComments = function(){
        var comments = window.localStorage.getItem("comments");
        if(comments){
            comments = JSON.parse(comments);
            for(var i=0; i<comments.length; i++){
                var comment = comments[i];
                readium.reader.addHighlight(comment.cfi.idref, comment.cfi.cfi, Math.floor((Math.random()*1000000)), "highlight");
            }
        }
    }

    var toggleFullScreen = function(){
        if ((document.fullScreenElement && document.fullScreenElement !== null) || 
            (!document.mozFullScreen && !document.webkitIsFullScreen)) {
            requestFullScreen.call(document.documentElement);
        }
        else{
            cancelFullScreen.call(document);
        }
    }

    var hideUI = function(){
        hideTimeoutId = null;
        $(document.body).addClass('hide-ui');
    }

    var hideTimeoutId;

    var hideLoop = function(e, immediate){
        if (!embedded){
            return;
        }
        if (hideTimeoutId){
            window.clearTimeout(hideTimeoutId);
            hideTimeoutId = null;
        }
        if (!$('#app-container').hasClass('toc-visible') && $(document.body).hasClass('hide-ui')){
            $(document.body).removeClass('hide-ui');
        }
        if (immediate){
            hideUI();
        }
        else{
            hideTimeoutId = window.setTimeout(hideUI, 4000);
        }
    }

    var nextPage = function () {
        readium.reader.openPageRight();
        return false;
    }

    var prevPage = function () {
        readium.reader.openPageLeft();
        return false;
    }

    var installReaderEventHandlers = function(){
        // Set handlers for click events
        $(".icon-annotations").on("click", function () {
            var $appContainer = $('#app-container'),
                hide = $appContainer.hasClass('sidebar-visible');
            if (hide){
                $appContainer.removeClass('sidebar-visible');
            }
            else{
                $appContainer.addClass('sidebar-visible');
            }

            if(embedded){
                hideLoop(null, true);
            }else{
                readium.reader.handleViewportResize();
            }
        });

        $('#send_comment').on('click', function(){
            var comment = {
                name: $('#name').val(),
                comment: $('#comment').val(),
                role: $('input[name="role"]:checked').val(),
                cfi: readium.reader.getCurrentSelectionCfi()
            };
            if(!comment.cfi) return false;
            var comments = window.localStorage.getItem("comments");
            if(!comments) comments = [comment];
            else{
                comments = JSON.parse(comments);
                comments.push(comment);
            }
            window.localStorage.setItem("comments",JSON.stringify(comments));

            $('#sidebar').append("<div>"+comment.name+": "+comment.comment+" ("+comment.cfi.cfi+")</div>");
            readium.reader.addHighlight(comment.cfi.idref, comment.cfi.cfi, Math.floor((Math.random()*1000000)), "highlight");
            //readium.reader.addHighlight(comment.cfi.idref, comment.cfi.cfi, Math.floor((Math.random()*1000000)), "highlight");
            // var req = new XMLHttpRequest();
            // http_test.request = function(path,method){
            //     var url = "http://localhost:3000/" + path + ".json";
            //     req.onreadystatechange = function(){
            //         if(req.readyState == 4){
            //             alert(req.responseText);
            //         }
            //     }
            //     req.open(method, path, true);
            //     req.send("");
            // }
            return false;
        });

        $("#previous-page-btn").unbind("click");
        $("#previous-page-btn").on("click", prevPage);

        $("#next-page-btn").unbind("click");
        $("#next-page-btn").on("click", nextPage);

        $(window).on('keydown', function(e){
            switch (e.keyCode){
                case 37:
                    prevPage();
                    break;
                case 39 :
                    nextPage();
                    break;
            }
        })

        $('.icon-full-screen').on('click', toggleFullScreen);

        $('.icon-library').on('click', function(){
            $(window).trigger('loadlibrary');
            return false;
        });

        $('.icon-toc').on('click', function(){
            var $appContainer = $('#app-container'),
                hide = $appContainer.hasClass('toc-visible');
            if (hide){
                $appContainer.removeClass('toc-visible');
            }
            else{
                $appContainer.addClass('toc-visible');
            }

            if(embedded){
                hideLoop(null, true);
            }else{
                readium.reader.handleViewportResize();
            }
            
        });

        $('.icon-show-hide').on('click', function(){
            var $nav = $('nav');
            if ($nav.hasClass('user-displayed')){
                $nav.removeClass('user-displayed');
            }
            else{
                $nav.addClass('user-displayed');
            }
        });

        var setTocSize = function(){
            var appHeight = $(document.body).height() - $('#app-container')[0].offsetTop;
            $('#app-container').height(appHeight);
            $('#readium-toc-body').height(appHeight);
        }

        $(window).on('mousemove', hideLoop);
        $(window).on('resize', setTocSize);
        setTocSize();
        hideLoop();

        // captures all clicks on the document on the capture phase. Not sure if it's possible with jquery
        // so I'm using DOM api directly
        document.addEventListener('click', hideLoop, true);
    };

   

    var loadReaderUIPrivate = function(){
        $('.modal-backdrop').remove();
        var $appContainer = $('#app-container');
        $appContainer.empty();
        $appContainer.append(ReaderBody({}));
        $appContainer.append(AboutDialog({strings: Strings}));
        $('nav').empty();
        $('nav').append(ReaderNavbar({}));
        installReaderEventHandlers();

    }
    
    var loadReaderUI = function (data) {
        var url = data.epub;
        
        embedded = data.embedded;

        if (embedded){
            $(document.body).addClass('embedded');
            currLayoutIsSynthetic = false;
        }
        else{
            currLayoutIsSynthetic = true;
        }
        loadReaderUIPrivate();

        //because we reinitialize the reader we have to unsubscribe to all events for the previews reader instance
        if(readium && readium.reader) {
            readium.reader.off();
        }

        readium = new Readium("#epub-reader-container", './lib/thirdparty/');
        window.navigator.epubReadingSystem.name = "epub-js-viewer";
        window.navigator.epubReadingSystem.version = "0.0.1";

        SettingsDialog.initDialog(readium.reader);
        
        Settings.get('reader', function(readerSettings){
            if (!embedded){
                readerSettings = readerSettings || SettingsDialog.defaultSettings;
                SettingsDialog.updateReader(readium.reader, readerSettings);
            }
            else{
                readium.reader.updateSettings({
                    isSyntheticSpread: false
                });
            }  
            loadEbook(url);
        });

        readium.reader.on("annotationClicked", function(type, idref, cfi, id) {
            readium.reader.removeHighlight(id);
        });

    }


    var unloadReaderUI = function(){
        $(window).off('resize');
        $(window).off('mousemove');
        $(document.body).removeClass('embedded');
        document.removeEventListener('click', hideLoop);
    }

    return {
        loadUI : loadReaderUI,
        unloadUI : unloadReaderUI
    };
    
});
