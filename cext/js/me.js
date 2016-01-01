if(!window.localStorage){
    alert('因为浏览器不支持LocalStorage， 所以无法保存记录！')
};
function unicode(value){
  var preStr='\\u';
  var cnReg=/[\u0391-\uFFE5]/gm;
  if(cnReg.test(value)){
    var ret=value.replace(cnReg,function(str){
      return preStr+str.charCodeAt(0).toString(16)
    });
    return ret;
  }else{
    return escape(value);
  }
}
chrome.runtime.onConnect.addListener(function(port) {
    console.assert(port.name == "allfeed");
    var tab = port.sender.tab;
    // This will get called by the content script we execute in
    // the tab as a result of the user pressing the browser action.
    port.onMessage.addListener(function(msg) {
        if(msg.word == "collect"){
            chrome.tabs.getSelected(function(tab){
                // alert(tab.url);
                curl = tab.url;
                favicon = tab.favIconUrl;
                oldtitle = unicode(tab.title);
                title = "\"" + oldtitle.replace(/\\/g,"\\\\") + "\"";
                usingdata = JSON.parse(window.localStorage.getItem("usingdata"));
                usingdata['itemc'] = curl;
                usingdata['itemtype'] = title;
                collectdata = JSON.parse(window.localStorage.getItem("collectdata"));
                var nowtotal = Object.keys(collectdata).length;
                if(msg.action == 'check'){
                    $.each(collectdata,function(i,j){
                      if(j['link']==curl){
                          port.postMessage({backword: "alreadyhave"});
                      }
                    })
                }else if(msg.action == 'add'){
                    usingdata['flag'] = 'collectlink';
                    $.post('http://fun.zzgary.info/feedpusher/receiver.php',usingdata,function(data){
                        collectdata[nowtotal]={};
                        collectdata[nowtotal]['link']=curl;
                        collectdata[nowtotal]['title']=title;
                        $.localStorage.set('collectdata',collectdata);
                        port.postMessage({backword: "collected"});
                    });
                }else if(msg.action == 'cancel'){
                    usingdata['flag'] = 'deleteClink';
                    $.post('http://fun.zzgary.info/feedpusher/receiver.php',usingdata,function(data){
                        // var tid = collectionurl.indexOf(curl);
                        $.each(collectdata,function(i,j){
                          if(j['link']==curl){
                            collectdata.splice(i,1);
                          }
                        })
                        $.localStorage.set('collectdata',collectdata);
                        port.postMessage({backword: "canceled"});
                    });
                }
            });
        }
    });
});
$.feedpusher({platform:"chromeext"});
