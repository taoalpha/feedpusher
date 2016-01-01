var exclude = /^https?:\/\/(www\.)?zzgary\.info\/allfeed\/singleview/;
if (!exclude.test(location.href)) {
    $('body').prepend('<div id=netcollect class=collect></div>');
    $('body').prepend("<div id=hintpart></div>");

    port = chrome.runtime.connect({name: "allfeed"});
    port.postMessage({word: "collect",action:"check"});
    port.onMessage.addListener(function(msg) {
            if(msg.backword == "alreadyhave"){
                $('#netcollect').addClass('alreadyc')
            }
    });
    $('#netcollect').on('click',function(){
         // console.log("dddd");
        port = chrome.runtime.connect({name: "allfeed"});
        if($(this).hasClass('alreadyc')){
           port.postMessage({word: "collect",action:"cancel"});
        }else{
           port.postMessage({word: "collect",action:"add"});
        }
            // chrome.runtime.connect().postMessage("collect");
        port.onMessage.addListener(function(msg) {
            if(msg.backword == "collected"){
                $('#hintpart').fadeIn(200).html("Collected!!").fadeOut(1000);
                $('#netcollect').addClass('alreadyc')
            }else if(msg.backword == "canceled"){
                $('#hintpart').fadeIn(200).html("Removed!!").fadeOut(1000);
                $('#netcollect').removeClass('alreadyc')
            }
        });
    });
}
