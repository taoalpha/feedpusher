/*
* feedpusher.js
* @version      0.0.2
* @copyright    ZzGary(http://zzgary.info)
* @description  Common part for feedpusher among app/web/extension
* @author:
//   .----------------.  .----------------.  .----------------.  .----------------.  .----------------.  .----------------. 
//  | .--------------. || .--------------. || .--------------. || .--------------. || .--------------. || .--------------. |
//  | |   ________   | || |   ________   | || |    ______    | || |      __      | || |  _______     | || |  ____  ____  | |
//  | |  |  __   _|  | || |  |  __   _|  | || |  .' ___  |   | || |     /  \     | || | |_   __ \    | || | |_  _||_  _| | |
//  | |  |_/  / /    | || |  |_/  / /    | || | / .'   \_|   | || |    / /\ \    | || |   | |__) |   | || |   \ \  / /   | |
//  | |     .'.' _   | || |     .'.' _   | || | | |    ____  | || |   / ____ \   | || |   |  __ /    | || |    \ \/ /    | |
//  | |   _/ /__/ |  | || |   _/ /__/ |  | || | \ `.___]  _| | || | _/ /    \ \_ | || |  _| |  \ \_  | || |    _|  |_    | |
//  | |  |________|  | || |  |________|  | || |  `._____.'   | || ||____|  |____|| || | |____| |___| | || |   |______|   | |
//  | |              | || |              | || |              | || |              | || |              | || |              | |
//  | '--------------' || '--------------' || '--------------' || '--------------' || '--------------' || '--------------' |
//   '----------------'  '----------------'  '----------------'  '----------------'  '----------------'  '----------------' 
*/
// check for X-Frame-Options---only for web version.
function checkForCross()
{
  var isrc = $('#webv').attr('src');
  var url = "http://fun.zzgary.info/feedpusher/transmission.php?url="+isrc;
  $.get(url,function(data){
    if(data=="YES"){
      $('#hintone a.gosource').attr("href",isrc);
      $('#bgbg,#hintone').show();
    }else{
      return true
    }
  })
}
// Main part
;(function($) {

  // Receive the parameter and set the initial constant
  $.feedpusher = function(options) {
    if ($.feedtree == null) {
      $.feedtree = { options: [] };
      $.feedtree.options.push(options);
    }
    else {
      $.feedtree.options = [];
      $.feedtree.options.push(options);
    }
    $(document).ready(function() {
      for (var i=0; i<$.feedtree.options.length; i++) {
        startFeed($.feedtree.options[i]);
      }
    });
  }


  // Main functions

  function startFeed(options){
    var settings = {
      platform: options['platform'] || 'chromeapp',
      // value: chromeapp,chromeext, web, mobile
      // default to chromeapp which is best of all platform.
      startState: options['startState'] || 'closed' // value: closed | open,
      // default to closed; sets whether the timeline is
      // initially collapsed or fully expanded
    };

    // Only for touch in Mobile.
    var myScroll,pullDownEl, pullDownOffset,generatedCount = 0;

    // add same judge to the head in the html page in web version--speed the change
    if(settings.platform =="web"){
      if($( window ).width()<960){
          // Change to mobile version
          window.location.href = "http://fun.zzgary.info/sfeedpusher";
      }
    }

    // unify storage name of different platforms.
    if(settings.platform =="web" || settings.platform =="mobile"|| settings.platform =="chromeext"){
      storage = $.localStorage;
    }else if(settings.platform =="chromeapp"){
      storage = chrome.storage.local;
    }
    function pullDownAction () {
      // reload data from the server
      location.reload(true);
      //FIXME: multiple binding.....
      // var userdata = storage.get("usingdata");
      // feed.getdatas(userdata);
    }
    function loaded() {
      pullDownEl = document.getElementById('pullDown');
      pullDownOffset = pullDownEl.offsetHeight;

      myScroll = new iScroll('wrapper', {
        useTransition: true,
        topOffset: pullDownOffset,
        onRefresh: function () {
            if (pullDownEl.className.match('loading')) {
                pullDownEl.className = '';
                pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Pull down to refresh...';
            }
        },
        onScrollMove: function () {
            if (this.y > 5 && !pullDownEl.className.match('flip')) {
                pullDownEl.className = 'flip';
                pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Release to refresh...';
                this.minScrollY = 0;
            } else if (this.y < 5 && pullDownEl.className.match('flip')) {
                pullDownEl.className = '';
                pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Pull down to refresh...';
                this.minScrollY = -pullDownOffset;
            }
        },
        onScrollEnd: function () {
            if (pullDownEl.className.match('flip')) {
                pullDownEl.className = 'loading';
                pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Loading...';
                pullDownAction();   // Execute custom function (ajax call?)
            }
        }
      });
      setTimeout(function () { document.getElementById('wrapper').style.left = '0'; }, 800);
    };

    // Refresh the layout after the window size changed
    function autosi(){
      var wid = 315;
      var wh = $( window ).height();
      var ww = $( window ).width();
      if(settings.platform=="mobile"){
        $('span.nonzero').css('right',ww-40);
        $('div.loader').css({
          'top':(wh-50)/2,
          'left':(ww-175)/2
        });
        $('div.login').css({
          // 'left':Math.max((ww-350)/2,0),
          'top':(wh-180)/2
        });
      }else{
        $('span.nonzero').css('right',wid);
        $('div.loader').css({
          'top':(wh-50)/2,
          'left':(ww-175)/2
        });
        $('div.login').css({
          'left':(ww-350)/2,
          'top':(wh-180)/2
        });
      }
      $('div.saving').css('height',wh);
      $('div#wrapper').css('height',wh-60);
      // for chromeapp and web version:
      if(settings.platform=="chromeapp"||settings.platform=="web"){
        $('body').css('height',wh);
        $('div.wrap').css('height',wh-60);
        $('div.searchwrap').css('height',wh-10);
        $('div.prev').css('top',(wh-41)/2);
        $('div.next').css('top',(wh-41)/2);
        $('div.rightbar').css({
          'width':(ww-350),
          'height':wh,
          'background-size':'auto '+wh
        });
        $('div.rightbar img').css('height',wh);
        $('div.loading').css({
          'top':(wh-10)/2,
          'left':(ww-410)/2
        });
        $('div.leftbar').css('height',wh);
        $("body").css('background-size','auto '+wh);
      }
    }

    // show or hide the previous button or next button in the side tools
    function checkpagen(){
      if(cur.closest('li').next().length>0){
        $('i.sprite-next').show();
      }else{
        $('i.sprite-next').hide();
      }
      if(cur.closest('li').prev().length>0){
        $('i.sprite-prev').show();
      }else{
        $('i.sprite-prev').hide();
      }
    }

    // move the unread items ahead of the item list
    function shuffle(){
      var highitem = $('b');
      $.each(highitem,function(index,object){
        var highlight = $(this).closest('li')
        highlight.prependTo($(this).closest('ul'))
        // move highlight items to the front.
      })
      var unreaditem = $('span.nonzero');
      $.each(unreaditem,function(index,object){
        var unreadnovel = $(this).closest('div.novel')
        unreadnovel.prependTo($('div#content'))
        // move nonzero unread items to the front.
      })
    }

    // Add new item to the feed
    function addnewitem(star,click,link,title,posid,news,ff){
      try{
        if(ff=="all"){
          title = $.parseJSON(title);
        }else{
          title = $.parseJSON(unescape(title));
        }
        if(star && click){
          $('.novelupdate').eq(posid).append("<li><a href="+link+" target=_blank title=\"" +title+" \">"+title+"</a><span class='starit starit2'></span></li>");
        }else if(star && !click){
          $('.novelupdate').eq(posid).append("<li><a href="+link+" target=_blank title=\"" +title+" \"><b>"+title+"</b></a><span class='starit starit2'></span></li>");
          news ++;
        }else if(!star && click){
          $('.novelupdate').eq(posid).append("<li><a href="+link+" target=_blank title=\"" +title+" \">"+title+"</a><span class='starit'></span></li>");
        }else if(!star && !click){
          $('.novelupdate').eq(posid).append("<li><a href="+link+" target=_blank title=\"" +title+" \"><b>"+title+"</b></a><span class='starit'></span></li>");
          news ++;
        }
      }
      catch(err){
        console.log(err.message);
        console.log("Wrong item name:"+link);
        var wrongmess = err.message + "\nWrong item link:\t"+ link +"\tWrong title:\t"+title+"\n";
        $.post("http://fun.zzgary.info/feedpusher/php/save.php",{"content":wrongmess},function(data){console.log(data)})
      }
      finally{
        return news
      }

      // FIXME: ignore some errors or report/log errors to me.
    }

    // Unicode Parse
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

    // Show random wallpaper from wordsmotivate
    function randomwall(fs){
      var ranyear = Math.floor((Math.random()*3)+2010);
      if(ranyear == 2010){
        var ranmonth = Math.floor((Math.random()*7)+6);
        var randay = Math.floor((Math.random()*11)+20);
        pngdate = ranyear + "." + ranmonth;
        pngdatetime = ranyear + "." + ranmonth+"."+randay;
      }else{
        var ranmonth = Math.floor((Math.random()*12)+1);
        var randay = Math.floor((Math.random()*12)+1);
        pngdate = ranyear + "." + ranmonth;
        pngdatetime = ranyear + "." + ranmonth+"."+randay;
      }
      if(fs=="fullscreen"){
        makelink = "http://img.wordsmotivate.me/"+pngdate+"/"+pngdatetime+"_1920x1200.jpg";
      }else{
        makelink = "http://img.wordsmotivate.me/"+pngdate+"/"+pngdatetime+"_1600x1200.jpg";
      }
      if(settings.platform==="web"){
        if(fs=="fullscreen"){
          $('body').css({
            'background-image':'url('+makelink+')',
            'background-repeat':'no-repeat'
          });
        }else{
          $("img#bgbg").attr('src',makelink);
          $('div.loading').hide();
        }
        // for fault-tolerant -- if image broken then retry it
        var img = new Image();
        img.onerror = function() {
            randomwall(fs);
        }
        img.src = makelink;
      }else{
        var loadImage = function(uri, callback) {
          var xhr = new XMLHttpRequest();
          xhr.responseType = 'blob';
          xhr.onload = function() {
            callback(window.URL.createObjectURL(xhr.response), uri);
          }
          xhr.open('GET', uri, true);
          xhr.onreadystatechange = function() {
            if (xhr.readyState != 4)  { return; }
            if (xhr.status != 200)  {
              randomwall(fs);
              console.log("not good");
              return;
            }
          };
          xhr.send();
        }
        loadImage(makelink, function(blob_uri, requested_uri) {
          console.log(blob_uri);
          // $("div.rightbar").css('background-image','url('+blob_uri+')');
          if(fs=="fullscreen"){
            $('body').css({
              'background-image':'url('+blob_uri+')',
              'background-repeat':'no-repeat'
            });
          }else{
            $("img#bgbg").attr('src',blob_uri);
            $('div.loading').hide();
            if($('#bgbg').is(":visible")){
              $('a.saveas').show();
            }
          }
        });
      }
    }

    // Save the wallpaper to local
    function saveFile(url) {
      // Get file name from url.
      console.log(url);
      // var filename = url.substring(url.lastIndexOf("/") + 1).split("?")[0];
      var filename = "WordsMotivate."+url.substring(url.lastIndexOf(".") + 1);
      var xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = function() {
        var a = document.createElement('a');
        a.href = window.URL.createObjectURL(xhr.response); // xhr.response is a blob
        a.download = filename; // Set the file name.
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        delete a;
      };
      xhr.open('GET', url);
      xhr.send();
      $('div.loading').hide();
    }

    // Get the title of the current page -- used in chrome app version
    function execScripts(wv) {
      // execute script
      wv.executeScript({
        code:
            "window.addEventListener('message', function(e){"
          + "  console.log('Received command:', e.data.command);"
          + "  if(e.data.command == 'getTitle'){"
          + "    console.log('Sending title...');"
          + "    e.source.postMessage({ title: document.title }, e.origin);"
          + "  }"
          + "});"
      });
    }

    // whether the current url has been collected or not.
    function judgecollection(name,flag){
      if(settings.platform=="chromeapp"){
        storage.get("collectdata", function(data){
          var collectdata = data.collectdata;
          $('span.markcollect').removeClass('collectit2');
          $('span.markcollect').addClass('collectit');
          $.each(collectdata,function(index,value){
            if(value['link'] == name){
              console.log(value);
              $('span.markcollect').addClass('collectit2');
              $('span.markcollect').removeClass('collectit');
            }
          });
        });
      }
    }

    // recommendation for new users
    function showpushmes(mess){
      var mes = {
        "message":mess,
        "pushCount":pushCount,
        "username":usingdata.username
      }
      $.post('http://fun.zzgary.info/feedpusher/push.php',mes,function(data){
        if(data){
          var datas = JSON.parse(data);
          console.log(data);
          var pushmes = "<div id='FP_pushmes'>"+datas.outHint+"<a href="+datas.outItem+">"+$.parseJSON(datas.outName)+"</a> (Click to add)</div>";
          $('div.rightbar').append(pushmes).find('div#FP_pushmes').fadeOut(10000);
        }
      });
    }

    // some common functions and events.
    // removed -- use the placeholder instead
    // $('input').on('click',function(){
    //   $(this).val("");
    // })

    // DONE: Add a share part for web and chromeapp!
    if(settings.platform=="chromeapp" || settings.platform=="web"){
      new Share(".sprite-share", {
        ui: {
            flyout: "bottom vertical left",
            button_text: ""
        },
        networks: {
          facebook: {
            before: function() {
              this.url   = $('#webv').attr('src');
              this.title  = $('title').text().replace('FeedPusher-')+"Provided by: Feedpusher";
              return this
            },
            after: function() {
              console.log("User shared:", this.url);
            }
          },
          twitter: {
            before: function() {
              this.url   = $('#webv').attr('src');
              this.title  = $('title').text().replace('FeedPusher-')+"Provided by: Feedpusher";
              return this
            },
            after: function() {
              console.log("User shared:", this.url);
            }
          },
          renren: {
            before: function() {
              this.url   = $('#webv').attr('src');
              this.title  = $('title').text().replace('FeedPusher-')+"\tProvided by: Feedpusher";
              this.description = this.title;
              this.image = "";
              return this
            },
            after: function() {
              console.log("User shared:", this.url);
            }
          },
          weibo: {
            before: function() {
              this.url   = $('#webv').attr('src');
              this.title  = $('title').text().replace('FeedPusher-')+"\tProvided by: Feedpusher";
              this.description = this.title;
              this.image = "";
              return this
            },
            after: function() {
              console.log("User shared:", this.url);
            }
          },
          google_plus: {
            before: function() {
              this.url   = $('#webv').attr('src');
              this.title  = $('title').text().replace('FeedPusher-')+"\tProvided by: Feedpusher";
              return this
            },
            after: function() {
              console.log("User shared:", this.url);
            }
          },
          pinterest: {
            before: function() {
              this.url   = $('#webv').attr('src');
              this.title  = $('title').text().replace('FeedPusher-')+"\tProvided by: Feedpusher";
              return this
            },
            after: function() {
              console.log("User shared:", this.url);
            }
          },
          email: {
            before: function() {
              this.url   = $('#webv').attr('src');
              this.description  = $('title').text().replace('FeedPusher-') + "\n source link: " + this.url+"\nProvided by: Feedpusher";
              return this
            },
            after: function() {
              console.log("User shared:", this.url);
            }
          }
        }
      })
    };
    autosi();// auto postion all elements according to the window width and height.
    notclick = 0;// a indicator for two different kinds of elements we click
    usingdata = "";// save user profile
    collectdata = ""; // save user collections
    isloadershow = 1; // show loader for the first loading.
    isFirstPush = 1; // show loader for the first loading.
    pushCount = 0; // show loader for the first loading.

    if(settings.platform==='chromeapp'){
      // set the webview events for chrome app

      webview = document.getElementById("webv")

      // hide loading animation and change wallpaper after finish loading
      webview.addEventListener("loadstop", function(){
        if($('img#bgbg').is(":visible")){
          $('div.loading,img#bgbg,a.saveas').hide();
          $('div.prev,div.next,div.pagen').show();
        }
      })

      webview.addEventListener("loadstart", function(){
        var link = $(webview).attr('src');
        judgecollection(link,'url');
      })

      // hide loading animation and change wallpaper when abort from loading
      webview.addEventListener("loadabort", function(){
        if($('img#bgbg').is(":visible")){
          $('div.loading,img#bgbg,a.saveas').hide();
          $('div.prev,div.next,div.pagen').show();
        }
      })

      // allow new window for the webview.
      webview.addEventListener('newwindow', function(e) {
        // Keep the consistent for internal link in frame or webview.
        $('div.loading').show();
        // hide the hint
        $('#hintone').hide();
        if(!$('img#bgbg').is(":visible")){
          $('div.loading,a.saveas,img#bgbg').show();
          $('div.prev,div.next,div.pagen').hide();
        }
        $('div.rightbar webview').attr('src',e.targetUrl).attr('data-titlename','');
      })

      // get page title of the webview.
      webview.addEventListener('contentload', function() {
        execScripts(webview);
        // postMessage to webview
        webview.contentWindow.postMessage({
          command: 'getTitle'
        }, '*');
      })

      // onMessage from webview
      window.addEventListener('message', function(e){
        console.log("Received title:", e.data.title);
        $(webview).attr('data-titlename',e.data.title);
      })
    }

    // common part of feed class.
    var feed = {
      hh:0,
      novelhtml:"<div class=novel><div class=name><span class=notis>0</span><a href= target='_blank'></a><span class=del></span></div><div class=chapters><ul class=novelupdate></ul></div></div>",
      getdatas:function(usingdata){
        if(!usingdata){
          $('div.leftbar,div.rightbar,div.saving,div.loader,div.add,div#wrapper').hide();
          $('div.login').show();
          if(settings.platform==='chromeapp' || settings.platform==='web'){
            randomwall("fullscreen");
          }
        }else{
          if(isloadershow){
            $('div.loader').show();
            isloadershow = 0;
          }
          $('div.login,div.searchwrap,div.moreitem').hide();
          $('div.wrap,div.add,div#wrapper').show();
          //$('input#auto').focus();
          if(settings.platform==='chromeapp' || settings.platform==='web'){
            randomwall();
          }
          $.post('http://fun.zzgary.info/feedpusher/sender.php',usingdata,function(data){
            if(data=="no user"){
              $('div.saving').html("User Doesn't Exist ...")
              $('div.saving').fadeIn(100).fadeOut(2000);
              $('div.login').show();
              $('div.loader').hide();
            }else if(data=="Connect Failed"){
              $('div.saving').html("Server is a little busy...Retry later~")
              $('div.saving').fadeIn(100).fadeOut(2000);
              $('div.login').show();
              $('div.loader').hide();
            }else{
              alldatas = data;
              feed.saveuser(usingdata);
              // save user information to local and auto log in next time.
              $('div.saving,div.login').hide();
              $('div.add,div.leftbar,div.rightbar').show();
              //$('input#auto').focus();
              if(alldatas!="null"){
                feed.getuser("showdata",alldatas);
              }else{
                $('div#content').hide();
                $('div.help').show();
              }
            }
          }).fail(function(){
            console.log("failed to connect!");
            feed.getdatas(usingdata);
          })
        }
      },
      saveuser:function(data){
        if(settings.platform ==="chromeapp"){
          storage.set({"usingdata":data}, function() {
            console.log("Saved userdata.")
          });
        }
        if(['web','chromeext','mobile'].indexOf(settings.platform)>-1){
          storage.set('usingdata',data);
        }
      },
      setcollection:function(data){
        if(settings.platform ==="chromeapp"){
          storage.set({"collectdata":data}, function(){
            console.log("Update collected!")
          });
        }
        if(['web','chromeext','mobile'].indexOf(settings.platform)>-1){
          storage.set('collectdata',data);
        }
      },
      getuser:function(para1,para2,para3){
        //para1 : next step
        //para2.. : next function paras
        if(settings.platform ==="chromeapp"){
          storage.get("usingdata", function(data){
            usingdata=data.usingdata;
            feed.distribute(para1,para2,para3);
          })
        }
        if(['web','chromeext','mobile'].indexOf(settings.platform)>-1){
          usingdata = storage.get('usingdata');
          feed.distribute(para1,para2,para3);
        }
      },
      distribute:function(para1,para2,para3){
        switch (true)
        {
        case para1=="showdata":
          feed.showalldata(para2);
          // show all data
          break;
        case para1=="add":
          feed.add(para2,para3);
          //add function
          break;
        case para1=="getdatas":
          feed.getdatas(usingdata);
          break;
        case para1=="delete":
          feed.deletele(para2);
          break;
        case para1=="star":
          feed.starele(para2);
          break;
        case para1=="getcollect":
          feed.getcollect(para2,para3);
          break;
        case para1=="clicklink":
          feed.clickl(para2);
          break;
        case para1=="getmoredata":
          feed.getmoredata();
          break;
        case para1=="collect":
          feed.collect(para2,para3);
          break;
        }
      },
      getcollect:function(para1,para2){
        if(settings.platform==="chromeapp"){
          storage.get("collectdata", function(data){
            collectdata = data.collectdata;
            feed.distributec(para1,para2,para3);
          })
        }
        if(['web','chromeext','mobile'].indexOf(settings.platform)>-1){
          usingdata = storage.get('collectdata');
          feed.distributec(para1,para2,para3);
        }
      },
      distributec:function(para1,para2){
        switch(true)
        {
        case para1=="deletec":
          feed.deletec(para2);
          break;
        }
      },
      logout:function(){
        if(settings.platform ==="chromeapp"){
          storage.remove("usingdata", function(data){})
        }
        if(['web','chromeext','mobile'].indexOf(settings.platform)>-1){
          usingdata = storage.remove('usingdata');
        }
        $('div#content').empty();
        feed.getuser("getdatas");
      },
      shownews:function(data,parentname){
        if(settings.platform ==="chromeext"){
          var lastloadtime = Date.parse(usingdata['lastloadtime']);
          if(Date.parse(data['inserttime']+' UTC')>lastloadtime && data['click']==0){
            // chrome.notifications.create(id, options, creationCallback);
            // Let's check if the browser supports notifications
            if (!("Notification" in window)) {
              alert("This browser does not support desktop notification");
            }
            // Let's check if the user is okay to get some notification
            else if (Notification.permission === "granted") {
              // If it's okay let's create a notification
              var notification = new Notification($.parseJSON(parentname) + ' 有新的更新, 速来看啊~', {
                body: $.parseJSON(data['title']),
                icon: chrome.extension.getURL('../novel.png')
              });
              notification.onclick = function(){
                  // var newlink = "http://zzgary.info/allfeed/singleview.php?name="+$.parseJSON(parentname)+"&url="+data['link']+"&uid="+usingdata['username'];
                  chrome.tabs.create({'url': data['link']});
                  usingdata['flag'] = 'clicklink';
                  usingdata['itemc'] = data['link'];
                  usingdata['itemtype'] = 'click';
                  feed.addnew(usingdata,'clicklink');
                  feed.setbadge(1,'minus');
              };
              // notif.show();
              setTimeout(function() {
                  notification.close();
              },20000);
            }
          }
        }
        // TODO: Add notification for chrome app and web version--if supported.
      },
      showalldata:function(alldatas){
        $('div#content').empty();
        var alldata = JSON.parse(alldatas);
        feed.setcollection(alldata['collectiondata']);
        // initial collection data
        if(Object.keys(alldata).length == 1 && alldata['collectiondata']==null){
          $('div.help').show();
          $('div.loader').hide();
          return
        };
        $('div.leftbar,div.rightbar,div#content').show();
        var totaln = 0;
        for(k in alldata){
          if(k != "collectiondata"){
            if(alldata[k].length==0){
              autosi();
              continue;
            }
            $('#content').append(feed.novelhtml);
            var posid = $('.novel').length -1;
            singledata = alldata[k];
            feed.modifyfeed(posid+1,$.parseJSON(singledata['name']),k,'item'+posid);
            var news = 0;
            for(kk in singledata){
              if(kk != "name"){
                news = addnewitem(singledata[kk]['star'],singledata[kk]['click'],singledata[kk]["link"],singledata[kk]["title"],posid,news,"all");
                feed.shownews(singledata[kk],singledata['name']);
              }
            };
            $('span.notis').eq(posid).html(news).attr('data-newc',news);
            if(news != 0){
                $('span.notis').eq(posid).addClass('nonzero');
            }
            totaln = totaln + news;
          }
        }
        shuffle();
        autosi();
        $('div.loader').hide();
        feed.setbadge(totaln,"add");
        usingdata['lastloadtime'] = Date();
        feed.saveuser(usingdata);
        if(settings.platform=="mobile"){
          loaded();
        }
        if(isFirstPush){
          showpushmes($('div.novel').length);
          pushCount ++;
          isFirstPush = 0;
        }else{
          showpushmes("anyupdates");
          pushCount ++;
        }
      },
      modifyfeed: function(id, name, url, datafg){
        $('.novel:nth-child('+id+')').find('.name')
        .html('<span class=notis id='+datafg+'>0</span><a href=' +url+' target=_blank>'+name+'</a><span class=del></span>')
        .attr('data-termid',datafg)
      },
      add:function(name,type){
        var curtime = new Date();
        usingdata['flag'] = "additem";
        usingdata['itemc'] = name;
        usingdata['itemtype'] = type;
        usingdata['logtime'] = curtime;
        switch (true)
        {
        case name.search("search:")==0:
          feed.getsearchresults(name.replace('search:',''));
          break;
        case name.search("isearch:")==0 || name.search("is:")==0:
          name = name.replace('isearch:','').replace('is:','')
          if(name.indexOf(' ')==0){
            name = name.replace(' ','');
          }
          feed.getisearchresults(name);
          break;
        case name=="help:":
          $('div#content,div.moreitem').hide();
          $('div.help').show();
          // if number of feed items not zero, show back button.
          if($('#content').find('div.novel').length>0){
            $('div.help div.backto').show();
          }
          break;
        case name=="star:":
          $.each($('div.novel'),function(ind,val){
            var stars = $(this).find('span.starit2').length;
            if(stars == 0){
              $(this).hide();
            }else{
              $(this).show();
              $(this).find('div.chapters').show();
              $(this).find('span.starit2').closest('li').siblings().hide();
              $(this).find('span.starit2').closest('li').show();
              var notread = $(this).find('b:visible').length;
              if(notread == 0){
                $(this).find('span.notis').removeClass('nonzero').html(notread).attr('data-newc',notread);
              }
              $(this).find('span.notis').html(notread);
            }
          });
          // $('div.returnm').show();
          $('div.moreitem').hide();
          notclick = 1;
          break;
        case name=="allstar:":
          $('div.novel,div.moreitem,div.chapters').hide();
          $('#content').append(feed.novelhtml);
          var posid = $('.novel').length -1;
          feed.modifyfeed(posid+1,"All Stars","allstar",'item'+posid);
          var news = 0;
          feed.getuser("getmoredata");
          $('div.novel:last div.chapters').show();
          var notread = $('div.novel:last').find('b:visible').length;
          if(notread == 0){
            $('div.novel:last').find('span.notis').removeClass('nonzero').html(notread).attr('data-newc',notread);
          }
          $('div.novel:last').find('span.notis').html(notread);
          notclick = 1;
          setTimeout(function(){
            $('div.moreitem').show();
            shuffle();
          },1000)
          break;
        case name=="collection:":
          var cdatas = JSON.parse(alldatas)['collectiondata'];
          $('div.novel').hide();
          // hide the novels
          $('div.chapters').hide();
          // hide all expanded items
          $('#content').append(feed.novelhtml);
          var posid = $('.novel').length -1;
          feed.modifyfeed(posid+1,"collection","collection",'item'+posid);
          var news = 0;
          for(i in cdatas){
            news = addnewitem(parseInt(cdatas[i]['star']),parseInt(cdatas[i]['click']),cdatas[i]["link"],cdatas[i]["title"],posid,news,"collect");
          }
          $('.novelupdate').eq(posid).closest('div.chapters').show();
          $('span.del').eq(posid).remove();
          $('.novelupdate').eq(posid).find('span').addClass('deletec').removeClass("starit").removeClass("starit2");
          if(news != 0){
            $('span.notis').eq(posid).addClass('nonzero').html(news).attr('data-newc',news);
          }
          $('div.moreitem').hide();
          shuffle();
          // $('div.backto').show();
          break;
        case name=="all:":
          $('div.chapters').show();
          break;
        case type=="tieba":
          feed.addnew(usingdata,'additem');
          $('div.saving').html('Adding ...')
          $('div.saving').fadeIn(100);
          setTimeout(function() {
            feed.getuser("getdatas");
          }, 7000);
          break;
        case name=="logout":
          feed.logout();
          break;
        default:
          var flag = name.match(/^((http|https):\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})/g);
          if(flag){
            $('div.saving').html('Adding ...')
            $('div.saving').fadeIn(100);
            feed.addnew(usingdata,'additem');
          }else{
            feed.getsearchresults(name);
          }
        }
      },
      addnew:function(usingdata,nflag){
        usingdata['flag'] = nflag;
        $.post('http://fun.zzgary.info/feedpusher/receiver.php',usingdata,function(data){
          if(data=='added'){
            $('div.saving').html("Added Successful!");
            $('div.saving').fadeIn(100);
            setTimeout(function() {
              $('div.saving').hide();
              feed.getuser("getdatas");
            }, 1000);
          }else if(data=='deleted'){
            // location.reload();
            console.log(data);
          }else if(data == 'checknew'){
            setTimeout(function() {
              feed.getuser("getdatas");
            }, 1000);
          }else if(data=='uexist'){
            $('div.saving').html("Sorry, please repick a name!");
            $('div.saving').fadeIn(500).fadeOut(1500)
            console.log("Sorry, please repick a name.");
            return
          }else if(data=='successc'){
            $('div.saving').html("Welcome!");
            $('div.saving').fadeIn(100);
            usingdata['flag'] = "alldata";
            feed.getdatas(usingdata);
            $('div.login,div.searchwrap').hide();
            $('div.leftbar,div.rightbar,div.wrap,div.add').show();
            //$('input#auto').focus();
            // clean all datas before reload datas
            $('div#content').empty();
            // initialhide the more button
            $('div.moreitem').hide();
          }else{
            return
          }
        }).fail(function(){
          $('div.saving').html("Failed to add...");
          setTimeout(function() {
            $('div.saving').html("Retrying...!").hide();
          }, 500);
          feed.addnew(usingdata,nflag);
        });
      },
      getsearchresults:function(name){
        $('div.saving').fadeIn(100);
        $('div.saving').html('Searching...');
        $.post("http://fun.zzgary.info/feedpusher/search.php",{name:name,type:"google"},function(rawdata){
          tempsearchdata = $.parseJSON( rawdata );
          feed.searchshow(tempsearchdata.entries,"google");
        }).fail(function(){
          $.post("http://fun.zzgary.info/feedpusher/search.php",{name:name,type:"feedly"},function(rawdata){
            tempsearchdata = $.parseJSON( rawdata );
            feed.searchshow(tempsearchdata,'feedly');
          }).fail(function(){
            $('div.saving').fadeIn(100);
            $('div.saving').html("Search Failed, Please try again!");
            setTimeout(function() {
              $('div.saving').hide();
            }, 1000);
          })
        });
      },
      getisearchresults:function (name){
        usingdata.itemc = name;
        usingdata.flag = "isearch";
        $.post("http://fun.zzgary.info/feedpusher/sender.php",usingdata,function(data){
          var results = JSON.parse(data);
          if(results == null){
            $('div.saving').html('No Match Results Found!')
            $('div.saving').fadeIn(100).fadeOut(1200);
          }else{
            $('div.novel').hide();
            $('div.chapters').hide();
            $('#content').append(feed.novelhtml);
            var posid = $('.novel').length -1;
            feed.modifyfeed(posid+1,name+" Results",name+" Results",'item'+posid);
            var news = 0;
            $.each(results,function(index,value){
              news = addnewitem(parseInt(value['star']),parseInt(value['click']),value['link'],value['title'],posid,news,"is");
            })
            $('.novelupdate').eq(posid).closest('div.chapters').show();
          }
          if(news != 0){
            $('span.notis').eq(posid).addClass('nonzero').html(news).attr('data-newc',news);
          }
          // re-arrange the items.
          shuffle();
        })
      },
      searchshow:function(tempsearchdata,type){
        $('div.searchresults').empty();
        var searchhtml = "<div class=searchitem></div>";
        var count = 0;
        if(type == "google"){
          $.each(tempsearchdata,function(key,value){
            // console.log(key+"    "+value);
            if(key<5 && value.url){
              // console.log(value.url+value.title);
              var rsslink = value.url;
              var contents = value.contentSnippet.replace('\<br\>','');
              var title = value.title;
              var sourcelink = value.link;
              $('div.searchresults').append(searchhtml);
              feed.modifysearchresults(count,contents,title,rsslink,sourcelink);
              count ++;
            }
          });
        }else if(type == "feedly"){
          $.each(tempsearchdata,function(key,value){
            // console.log(key+"    "+value);
            // console.log(tags,contents,rsslink,sourcelink);
            if(key<5 && value.feedId){
              // console.log(value.url+value.title);
              if(value.deliciousTags){
                var tags = "Delicious Tags: "+ value.deliciousTags.join();
              }else{var tags = ""};
              var title = value.title;
              var contents = value.description;
              var rsslink = value.feedId.replace('feed/','');
              var sourcelink = value.website;
              $('div.searchresults').append(searchhtml);
              if(contents){
                feed.modifysearchresults(count,contents,title,rsslink,sourcelink);
              }else{
                feed.modifysearchresults(count,tags,title,rsslink,sourcelink);
              }
              count ++;
            }
          });
        }
        if(count){
          $('div.saving').fadeOut(300).hide()
          $('div.searchwrap').delay(300).show().siblings('div').hide();
          $('.backto').show();
        }else{
          $('div.saving').fadeIn(100)
          $('div.saving').html("No results found!");
          $('.backto').hide();
          setTimeout(function() {
            $('div.saving').hide();
          }, 1000);
        }
        $('div.searchwrap').scrollTop(0);
      },
      modifysearchresults:function(key,contents,title,rsslink,sourcelink){
        // var link = value.link.slice(0,-1);
        $('div.searchitem:nth-child('+(key+1)+')')
        .html('<h3>'+title+'</h3><p>'+contents+'</p><div><span><a href=kk target=_blank class=source>Source</a></span><span><a href='+rsslink+' target=_blank class=addto>Add To</a></span></div>')
        .attr('data-searchitemid','search'+key);
        $('div.searchitem:nth-child('+(key+1)+')').find('a').first().attr({'href':sourcelink});
      },
      deletele:function(th){
        usingdata['flag'] = 'deleteitem';
        usingdata['itemc'] = th.prev('a').attr('href');
        usingdata['itemtype'] = 'del';
        feed.addnew(usingdata,'deleteitem');
        th.closest('div.novel').remove();
        if($('div.novel:visible').length==0){
          $('div.novel').show();
          $('div.moreitem').hide();
        }
      },
      starele:function(th){
        usingdata['flag'] = 'starlink';
        usingdata['itemc'] = th.prev('a').attr('href');
        usingdata['itemtype'] = 'star';
        if(th.hasClass('starit2')){
          feed.addnew(usingdata,'starlink');
        }else{
          feed.addnew(usingdata,'deleteslink');
        }
      },
      collect:function(theurl,thetitle){
        usingdata['flag'] = 'collectlink';
        usingdata['itemc'] = theurl;
        usingdata['itemtype'] = "\"" + unicode(thetitle).replace(/\\/g,"\\\\")||"No Name" + "\"";
        feed.addnew(usingdata,'collectlink');
        var newn = Object.keys(collectdata).length;
        collectdata[newn]={}
        collectdata[newn]['link']=theurl;
        collectdata[newn]['title']=unicode(thetitle).replace(/\\/g,"\\\\")||"No Name";
        feed.setcollection(collectdata);
      },
      deletec:function(th){
        var link = th.prev('a').attr('href');
        var index = collectdata.indexOf(link);
        collectdata.splice(index,1);
        feed.setcollection(collectdata);
        usingdata['flag'] = 'deleteClink';
        usingdata['itemc'] = link;
        usingdata['itemtype'] = 'cancelcollect';
        feed.addnew(usingdata,'deleteClink');
      },
      clickl:function(th,updateflag){
        updateflag = typeof updateflag  !== 'undefined' ? updateflag  : 'update';
        cur = th;
        usingdata['flag'] = 'clicklink';
        usingdata['itemc'] = th.attr('href');
        usingdata['itemtype'] = 'click';
        if(updateflag == "update"){
            feed.addnew(usingdata,'clicklink');
        }
        if(th.find('b').length>0){
          var text = th.text();
          var noti = th.closest('div.chapters').prev('div').children('span.notis');
          var number = Math.max(0,noti.text() -1);
          noti.text(number);
          if(number == 0){
            noti.removeClass('nonzero');
          }
          if(typeof old != 'undefined'){
            // move clicked item to end 
            //if(old.closest('div.chapters').prev('div.name').attr('data-termid')==th.closest('div.chapters').prev('div.name').attr('data-termid'))
            if(old.closest('li').nextAll().find('b').length>0){
              old.closest('li').insertAfter(old.closest('ul').find('b').last().closest('li'));
            }
          }
          th.html(text);
          old = th;
          checkpagen();
        }
        $('#webv').focus();
      },
      getmoredata:function(){
        var thec = $("div.novel:visible");
        var posid = $("div.novel").index(thec);
        var news = thec.find('b').length;
        usingdata.itemc = thec.find('div.name a').attr('href');
        // if all news we got, then maybe there are still some news in the server, if we have both news and olds, then there definitely no news in the server
        usingdata.cunumber = thec.find('span.notis').attr("data-newc")==35 ? thec.find('b').length : thec.find("li").length;
        usingdata.endnumber = usingdata.cunumber + 35;
        usingdata.flag = "getmore";
        $.post("http://fun.zzgary.info/feedpusher/sender.php",usingdata,function(data){
          var moredata = JSON.parse(data);
          if(moredata == null){
            $('div.saving').html('No More!')
            $('div.saving').fadeIn(100).fadeOut(1200);
            $('div.moreitem').hide();
          }else{
            $.each(moredata,function(index,value){
              news = addnewitem(parseInt(value['star']),parseInt(value['click']),value['link'],value['title'],posid,news,"all");
            })
          }
          if(news != 0){
            $('span.notis').eq(posid).addClass('nonzero').html(news).attr('data-newc',news);
          }
          if(moredata.length<35){
            $('div.moreitem').hide();
          }
          // re-arrange the items.
          shuffle();
        })
      },
      setbadge:function(number,flag){
        // Only for chromeext
        if(settings.platform==="chromeext"){
            if(flag=="clear"){
                chrome.browserAction.setBadgeText({text:""})
                return false
            }
            if(flag == "minus"){
                chrome.browserAction.getBadgeText({}, function(result) {
                    oldt = parseInt(result)-number;
                    chrome.browserAction.setBadgeText({text:oldt.toString()})
                });
                return false
            }
            chrome.browserAction.setBadgeText({text:number.toString()})
          }
        }
    };
    feed.getuser("getdatas");
    $('button.loginbutton').on('click',function(){
      var username = $('input#username').val();
      var passw = $('input#passw').val();
      var curtime = new Date();
      if(!username||!passw){
        //console.log('please log in with your username and password!');
        $('div.saving').html("please log in with your username and password!!");
        $('div.saving').fadeIn(100).fadeOut(1500);

        return
      }
      $('div.saving').html('Loading ...')
      $('div.saving').fadeIn(100);
      var usingdata = {
        flag:"alldata",
        username:username,
        userpassw:passw,
        logtime:curtime
      };
      feed.getdatas(usingdata);
    });
    $('button.signinbutton').on('click',function(){
      var username = $('input#username').val();
      var passw = $('input#passw').val();
      var curtime = new Date();
      if(!username || !passw){
        //console.log('Just enter your name and password to create a new user.');
        $('div.saving').html("Just enter your name and password to create a new user.");
        $('div.saving').fadeIn(100).fadeOut(1500);
        return
      }
      var usingdata = {
        flag:"alldata",
        username:username,
        userpassw:passw,
        logtime:curtime
      };
      feed.addnew(usingdata,'newuser');
    });

    // add hotkey for buttons
    $('body').on('keydown',function(e){
        if(e.which == 37 && (e.ctrlKey||e.metaKey)){
            $('i.sprite-back').trigger('click');
        }else if(e.which == 39 && (e.ctrlkey||e.metaKey)){
            $('i.sprite-forward').trigger('click');
        }else if(e.which == 82 && (e.ctrlkey||e.metaKey)){
            $('i.sprite-r').trigger('click');
        }else if(e.which == 40 && (e.ctrlkey||e.metaKey)){
            $('i.sprite-next').trigger('click');
        }else if(e.which == 38 && (e.ctrlkey||e.metaKey)){
            $('i.sprite-prev').trigger('click');
        }else if(e.which == 76 && (e.ctrlkey||e.metaKey)){
            $('i.sprite-link').trigger('click');
        }else if(e.which == 83 && (e.ctrlkey||e.metaKey)){
            $('.entypo-export').trigger('click');
        }else if(e.which == 70 && (e.ctrlkey||e.metaKey)){
            $('#webview').focus();
        }
    });
    $('i.sprite-prev').on('click',function(){
      if(typeof cur != 'undefined'){
        cur.closest('li').prev().find('a').trigger('click');
      }else{
        $('div.pagen').hide();
      }
    });
    $('i.sprite-next').on('click',function(){
      if(typeof cur != 'undefined'){
        cur.closest('li').next().find('a').trigger('click');
      }else{
        $('div.pagen').hide();
      }
    });
    $('i.sprite-link').on('click',function(){
      if(typeof cur != 'undefined'){
        window.open($('#webv').attr('src'));
      }else{
        $('div.pagen').hide();
      }
    });
    $('i.sprite-back').on('click',function(){
      if(settings.platform=="chromeapp"){
        webview.back();
      }else{
        window.history.back();
      }
    });
    $('i.sprite-forward').on('click',function(){
      if(settings.platform=="chromeapp"){
        webview.forward();
      }else{
        window.history.forward();
      }
    });
    $('i.sprite-r').on('click',function(){
      var base1 = $('div.novel b').length-1;
      var ranfeed = Math.floor(Math.random()*base1);
      console.log(ranfeed);
      // collapse all node and expand the node which this ranfeed belongs
      if($('div.novel b').eq(ranfeed).closest('div.novel').find('div.chapters:visible').length==0){
        $('div.chapters:visible').prev('div.name').find('a').trigger('click');
        $('div.novel b').eq(ranfeed).closest('div.novel').find('div.name a').trigger('click');
      }
      // click the item
      $('div.novel b').eq(ranfeed).closest('a').trigger('click');
    });

    // fold or expand the feed
    $('div#content').off('click','div.name a').on('click', 'div.name a', function(e){
      e.preventDefault();
      $('div.moreitem').hide();
      var tnovel = $(this).closest('div.novel');
      if(notclick==0){
        $(this).closest('div').next('div').toggle();
        //$(this).closest('div').next('div').toggle(200);
        $(this).closest('div').css("background-color","#fefbf8");
        tnovel.siblings().toggle();
        if($('div.novel').length>1 && $('div.novel:visible').length == 1){
          $(this).addClass('hideit');
        }else{
          $(this).removeClass('hideit');
        }
      }else if(notclick == 1){
        $('div.novel').find('li').show();
        $.each($('div.novel'),function(ind,val){
          var stars = $(this).find('span.starit2').length;
          var notread = $(this).find('b').length;
          if(stars == 0){
            $(this).find('div.chapters').hide();
            $(this).show();
          }else{
            $(this).find('div.chapters').hide();
            if(notread != 0){
              $(this).find('span.notis').addClass('nonzero').html(notread).attr('data-newc',notread);
            }
            $(this).find('span.notis').html(notread);
          }
        });
        notclick = 0;
      };
      var itemnumber = $(this).closest('div.name').next('div.chapters').find('li').length;
      var isshow = $('div#content').find('div.novel:visible').length;
      var isshow2 = $('div#content').find('div.novel li:visible').length;
      if(itemnumber>34 && isshow2!=0){
        if($(this).closest('div.name a').attr('href')!="collection"){
          $('div.moreitem').show();
        }
      }
      if(isshow!=1){
        // move the current group to the top of all items.
        var temp = tnovel.siblings().clone();
        tnovel.siblings().remove();
        temp.appendTo($('#content'));
      }
      if(settings.platform ==="mobile"){
        myScroll.scrollToElement('#content');
        setTimeout(function () {
            myScroll.refresh();
        },500);
      }
      $('div.wrap').scrollTop(0);
    });

    // fold or expand the help item
    $('div.help').off('click','div.qatitle').on('click', 'div.qatitle', function(e){
      e.preventDefault();
      $(this).next('div').toggle(200);
      $(this).closest('div').css("background-color","#fefbf8");
      $(this).closest('div.qaitem').siblings().toggle();
      $('div.help div.back').hide();
    });

    // search or add
    $('form').submit(function(e) {
      e.preventDefault();
      var name = $( "input#auto" ).val();
      if(name == "searching, adding, saving or downloading..."){return}
      $('div.help').hide();
      if(name.search('tieba:')==0){
        feed.getuser("add",name.replace("tieba:",""),"tieba");
        // feed.add(name.replace("tieba:",""),"tieba");
      }else{
        feed.getuser("add",name,"rss");
        // feed.add(name,"rss");
      };
    });

    // get more from the server
    $('div.moreitem').on('click',function (){
      feed.getuser("getmoredata");
    });

    // back to the main interface
    $('div.backto').on('click',function (){
      var flag = $('div.novel').length;
      if(flag!=0){
        $('div.help,div.searchwrap').hide();
        $('div.add,div.wrap,div#content').show();
      }else{
        $('div.help').find('div.qaitem:visible div.qatitle').trigger('click');
      }
    });

    // preview search result
    $('div.searchresults').off('click','a.source').on('click', 'a.source', function(e){
      e.preventDefault();
      $('div.loading').show();
      var name = $(this).attr('href');
      if(settings.platform ==="chromeapp"){
        $('div.rightbar webview').attr('src',name).attr('data-titlename','');
        setTimeout(function(){
          $('div.loading,span.markcollect,a.saveas,img#bgbg').hide();
          $('div.prev,div.next').show();
        },10000);
      }
      if(['chromeext','mobile'].indexOf(settings.platform)>-1){
        window.open(name);
      }
      if(settings.platform ==="web"){
        $('#webv').attr('src',name);
        $('#webv').load(function( response, status, xhr ){
          console.log(status);
          $('#bgbg,div.loading').hide();
        });
        setTimeout(function(){
          // if x-frame-options don't hide the img
          if(!$('#hintone').is(":visible")){
            $('#bgbg,div.loading').hide();
          }
        },10000);
        // randomwall();
      }
    });

    // add search result to your feed
    $('div.searchresults').off('click','a.addto').on('click', 'a.addto', function(e){
      e.preventDefault();
      var name = $(this).attr('href');
      feed.getuser("add",name,"rss");
      // feed.add(name,"rss");
      $('div.saving').html('Adding ...')
      $('div.saving').fadeIn(100);
    });

    // delete a feed
    $('div.leftbar').off('click','span.del').on('click', 'span.del', function(){
      var th = $(this);
      if(settings.platform !="chromeapp"){
        if (confirm('Are you sure you want to delete this item from your RSS feeds?')) {
        // delete it!
            feed.getuser("delete",th);
        } else {
        // Do nothing!
        }
      }else{
            feed.getuser("delete",th);
      }
    });

    // Save the wallpaper 
    $('div.rightbar').on('click', 'a.saveas', function(){
      $('div.loading').show();
      $('div.prev,div.next').hide();
      saveFile(makelink.replace('1600x1200','1920x1200'));
    });

    // collect the current page -- abondoned
    $('div.rightbar').on('click', 'span.collectit', function(){
      var th = $( this );
      th.toggleClass("collectit2");
      var theurl = $(webview).attr('src');
      var thetitle = $(webview).attr('data-titlename');
      feed.getuser("collect",theurl,thetitle);
      // change to collection
    });

    // add the recommended item to the feeds
    $('div.rightbar').on('click','div#FP_pushmes a',function(e){
      e.preventDefault();
      var name = $(this).attr('href');
      feed.getuser("add",name,"rss");
      $('div.saving').html('Adding ...')
      $('div.saving').fadeIn(100);
    });

    // hover then reset the fading.
    $('div.rightbar').on('mouseenter','div#FP_pushmes',function(){
      $(this).stop( true, true ).show();
    });
    $('div.rightbar').on('mouseout','div#FP_pushmes',function(){
      $(this).stop( true, false ).fadeOut(10000);
    });

    // item link clicked
    $('div#content').off('click','li a').on('click','li a',function(e){
      e.preventDefault();
      e.stopPropagation();
      if($(this).attr('href')==$('#webv').attr('src')) {
          // Mark as read if it is the current website showed to uses.
          $(this).html($(this).text())
          var noti = $(this).closest('div.chapters').prev('div').children('span.notis');
          var number = $(this).closest('div.chapters').find('b').length 
          noti.text(number);
          if(number == 0){
            noti.removeClass('nonzero');
          }
          return
      }
      //e.preventDefault()
      $('div.loading').show();
      // hide the hint
      $('#hintone').hide();
      if(!$('img#bgbg').is(":visible")){
        $('div.loading,a.saveas,img#bgbg').show();
        $('div.prev,div.next,div.pagen').hide();
      }
      var link = $(this).attr('href');
      var cname = $(this).text();
      var th = $(this);
      $('title').text('FeedPusher-'+cname);
      $('span.markcollect').show();
      // judgecollection(link,'url');
      feed.getuser('clicklink',th);
      feed.setbadge(1,'minus');
      if(settings.platform ==="chromeapp"){
        $('div.rightbar webview').attr('src',link).attr('data-titlename','');
        setTimeout(function(){
          if($('img#bgbg').is(":visible")){
            $('img#bgbg,a.saveas').hide();
          }
        },5000)
        setTimeout(function(){
          if($('div.loading').is(":visible")){
            $('div.loading').hide();
            $('div.prev,div.next,div.pagen').show();
          }
        },10000)
      }
      if(['chromeext'].indexOf(settings.platform)>-1){
        window.open(link);
      }
      if(settings.platform ==="mobile"){
        $('#webv').attr('src',link);
        $('div#wrapper,div.add').hide();
        $('div#togglebar,div#goorigin,div.wpreview').show();
        // window.open(link);
      }
      if(settings.platform ==="web"){
        $('#webv').attr('src',link);
        $('#webv').load(function( response, status, xhr ){
          console.log(status);
          $('#bgbg,div.loading').hide();
          $('div.pagen').show();
        });
        // DONE: deal with the error code like X-Frame-Options was set to deny or sameorigin.
        setTimeout(function(){
          if(!$('#hintone').is(":visible")){
            $('#bgbg,div.loading').hide();
            $('div.pagen').show();
          }
        },10000);
        // randomwall();
      }
    });

    $('div#togglebar').on('click',function(){
        $('div#wrapper,div.add').show();
        $('div#togglebar,div#goorigin,div.wpreview').hide();
    })
    $('div#goorigin').on('click',function(){
        window.open($('#webv').attr("src"));
    })
    $('div#content').on('click','span.starit',function(){
      // add click data after click the link
      var th = $( this );
      th.toggleClass("starit2");
      feed.getuser('star',th);
    });
    $('div#content').on('click','span.deletec',function(){
      // add click data after click the link
      var th = $( this );
      th.closest("li").remove();
      feed.getuser('getcollect','deletec',th);
    });

    if(['web','chromeext','chromeapp'].indexOf(settings.platform)>-1){
      // remove the context menu on mobile version
      $.contextMenu({
        selector: 'ul.novelupdate li',
        items: {
          "Mark as read": {
            name: "Mark as read",
            accesskey: "m",
            // superseeds "global" callback
            callback: function(key, options) {
              // var m = "edit was clicked";
              var th = $(this).children('a');
              feed.getuser("clicklink",th);
              var text = $(this).children('a').text();
              $(this).children('a').html(text);
              var noti = $(this).closest('div.chapters').prev('div').children('span.notis');
              var number = noti.text() -1;
              noti.text(number);
              if(number == 0){
                noti.removeClass('nonzero');
              }
            }
          },
          "sep1": "---------",
          "See all star items":{
            name:"See all stars",
            accesskey:"a",
            callback:function(key,options){
              feed.getuser("add","allstar:");
              // feed.add("allstar:");
            }
          },
          "See Stars":{
            name:"See Separate Stars",
            accesskey:"t",
            callback:function(key,options){
              feed.add("star:");
            }
          },
          "See Collections":{
            name:"See Collections",
            accesskey:"c",
            callback:function(key,options){
              feed.add("collection:");
            }
          },
          "sep2": "---------",
          "Search new RSS":{
            name:"Search new RSS",
            accesskey:"s",
            callback:function(key,options){
              $('input#auto').val("search:").focus().addClass('outl');
              setTimeout(function(){$('input#auto').val("search:").focus().removeClass('outl');},500);
            }
          },
          "sep3": "---------",
          "Refresh":{
            name:"Refresh",
            accesskey:"r",
            callback:function(key,options){
              feed.getuser("getdatas");
            }
          },
          "Help":{
            name:"Help",
            accesskey:"h",
            callback:function(key,options){
              feed.add("help:");
            }
          },
        }
      });
      $.contextMenu({
        selector: 'div.novel',
        items: {
          "See all star items":{
            name:"See all stars",
            accesskey:"a",
            callback:function(key,options){
              feed.add("allstar:");
            }
          },
          "See Stars":{
            name:"See Separate Stars",
            accesskey:"t",
            callback:function(key,options){
              feed.add("star:");
            }
          },
          "See Collections":{
            name:"See Collections",
            accesskey:"c",
            callback:function(key,options){
              feed.add("collection:");
            }
          },
          "sep2": "---------",
          "Search new RSS":{
            name:"Search new RSS",
            accesskey:"s",
            callback:function(key,options){
              $('input#auto').val("search:").focus().addClass('outl');
              setTimeout(function(){$('input#auto').val("search:").focus().removeClass('outl');},500);
            }
          },
          "sep3": "---------",
          "Refresh":{
            name:"Refresh",
            accesskey:"r",
            callback:function(key,options){
              feed.getuser("getdatas");
            }
          },
          "Help":{
            name:"Help",
            accesskey:"h",
            callback:function(key,options){
              feed.add("help:");
            }
          },
        }
      });
    }
    // all reload data except the web small.
    if(['web','chromeext','chromeapp'].indexOf(settings.platform)>-1){
      setInterval(function(){
        feed.getuser("getdatas");
      },20*60000);
    }
    $( window ).resize(function() {
      autosi();
    });
  };
})(jQuery);
