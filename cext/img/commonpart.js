/*
* feedpusher.js
* @version      0.0.1
* @copyright    ZzGary(http://zzgary.info)
* @description  Common part for feedpusher among app/web/extension
*/

;(function($) {
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



  function startFeed(options){
    var settings = {
      platform: options['platform'] || 'chromeapp',
      // value: chromeapp,chromeext, web, mobile
      // default to chromeapp which is best of all platform.
      startState: options['startState'] || 'closed' // value: closed | open,
      // default to closed; sets whether the timeline is
      // initially collapsed or fully expanded
    };

    function autosi(){
      var wid = 315;
      var wh = $( window ).height();
      var ww = $( window ).width();
      $('span.nonzero').css('right',wid);
      $('div.loader').css('left',(ww-175)/2);
      $('div.login').css({
        'left':(ww-350)/2,
        'top':(wh-180)/2
      });
      $('div.saving').css('height',wh);
      $('div.loader').css('top',(wh-100)/2);
      $('div.wrap').css('height',wh-60);
      $('div.searchwrap').css('height',wh-10);
      // for chromeapp and web version:
      if(settings.platform=="chromeapp"||settings.platform=="web"){
        $('div.prev').css('top',(wh-41)/2);
        $('div.next').css('top',(wh-41)/2);
        $('div.right').css({
          'width':(ww-350),
          'height':wh,
          'background-size':'auto '+wh
        });
        $('div.right img').css('height',wh);
        $('div.loading').css({
          'top':(wh-10)/2,
          'left':(ww-410)/2
        });
        $('div.left').css('height',wh);
        $("body").css('background-size','auto '+wh);
      }
    }
    function shuffle(){
      var highitem = $('b');
      $.each(highitem,function(index,object){
        // console.log(object)
        var highlight = $(this).closest('li')
        highlight.prependTo($(this).closest('ul'))
        // move highlight items to the front.
      })
      var unreaditem = $('span.nonzero');
      $.each(unreaditem,function(index,object){
        // console.log(object)
        var unreadnovel = $(this).closest('div.novel')
        unreadnovel.prependTo($('div#content'))
        // move nonzero unread items to the front.
      })
    }
    function addnewitem(star,click,link,title,posid,news){
      if(star && click){
        $('.novelupdate').eq(posid).append("<li><a href="+link+" target=_blank>"+title+"</a><span class='starit starit2'></span></li>");
      }else if(star && !click){
        $('.novelupdate').eq(posid).append("<li><a href="+link+" target=_blank><b>"+title+"</b></a><span class='starit starit2'></span></li>");
        news ++;
      }else if(!star && click){
        $('.novelupdate').eq(posid).append("<li><a href="+link+" target=_blank>"+title+"</a><span class='starit'></span></li>");
      }else if(!star && !click){
        $('.novelupdate').eq(posid).append("<li><a href="+link+" target=_blank><b>"+title+"</b></a><span class='starit'></span></li>");
        news ++;
      }
      return news
    }
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
        // $("div.right").css('background-image','url('+blob_uri+')');
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

    // change to collection
    function judgecollection(name,flag){
      if(settings.platform=="chromeapp"){
        chrome.storage.local.get("collectdata", function(data){
          var collectdata = data.collectdata;
          console.log(name);
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

    // some common functions and events.
    $('input').on('click',function(){
      $(this).val("");
    })
    autosi();// auto postion all elements according to the window width and height.
    notclick = 0;// a indicator for two different kinds of elements we click
    usingdata = "";// save user profile
    collectdata = ""; // save user collections

    // for autocomplete
    // var availableTags = [
    //   "search:",
    //   "save:",
    //   "download:",
    //   "help",
    //   "allstar",
    //   "star:",
    //   "collection:",
    //   "all"
    // ];
    // $( "#auto" ).autocomplete({
    //   source: availableTags
    // });

    if(settings.platform==='chromeapp'){
      // set the webview events for chrome app

      webview = document.getElementById("webv")

      // hide loading animation and change wallpaper after finish loading
      webview.addEventListener("loadstop", function(){
        if($('img#bgbg').is(":visible")){
          $('div.loading').hide();
          $('div.prev').show();
          $('div.next').show();
          $('img#bgbg').hide();
          $('a.saveas').hide();
          randomwall();
        }
      })

      webview.addEventListener("loadstart", function(){
        var link = $(webview).attr('src');
        judgecollection(link,'url');
      })

      // hide loading animation and change wallpaper when abort from loading
      webview.addEventListener("loadabort", function(){
        if($('img#bgbg').is(":visible")){
          $('div.loading').hide();
          $('div.prev').show();
          $('div.next').show();
          $('img#bgbg').hide();
          $('a.saveas').hide();
          randomwall();
        }
      })

      // allow new window for the webview.
      webview.addEventListener('newwindow', function(e) {
        $('div.right webview').attr('src',e.targetUrl).attr('data-titlename','');
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
          $('div.left').hide();
          $('div.right').hide();
          $('div.login').show();
          $('div.saving').hide();
          $('div.add').hide();
          $('div.loader').hide();
          if(settings.platform==='chromeapp' || settings.platform==='web'){
            randomwall("fullscreen");
          }
        }else{
          $('div.loader').show();
          $('div.login').hide();
          $('div.wrap').show();
          $('div.searchwrap').hide();
          $('div.add').show();
          $('input#auto').focus();
          $('div#content').empty();
          if(settings.platform==='chromeapp' || settings.platform==='web'){
            randomwall();
          }
          $.post('http://fun.zzgary.info/feedpusher/sender.php',usingdata,function(data){
            if(data=="no user"){
              $('div.saving').html("User Doesn't Exist ...")
              $('div.saving').fadeIn(100).fadeOut(2000);
              $('div.login').show();
            }else if(data=="Connect Failed"){
              $('div.saving').html("Server is a little busy...Retry later~")
              $('div.saving').fadeIn(100).fadeOut(2000);
              $('div.login').show();
            }else{
              alldatas = data;
              feed.saveuser(usingdata);
              // save user information to local and auto log in next time.
              $('div.saving').hide();
              $('div.login').hide();
              $('div.add').show();
              $('input#auto').focus();
              if(alldatas!="null"){
                feed.getuser("showdata",alldatas);
              }else{
                $('div#content').hide();
                $('div.left').hide();
                $('div.right').hide();
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
          chrome.storage.local.set({"usingdata":data}, function() {
            console.log("Saved userdata.")
          });
        }
        if(['web','chromeext','mobile'].indexOf(settings.platform)){
          $.localStorage.set('usingdata',data);
        }
      },
      setcollection:function(data){
        if(settings.platform ==="chromeapp"){
          chrome.storage.local.set({"collectdata":data}, function(){
            console.log("Update collected!")
          });
        }
        if(['web','chromeext','mobile'].indexOf(settings.platform)){
          $.localStorage.set('collectdata',data);
        }
      },
      getuser:function(para1,para2,para3){
        //para1 : next step
        //para2.. : next function paras
        if(settings.platform ==="chromeapp"){
          chrome.storage.local.get("usingdata", function(data){
            usingdata=data.usingdata;
            feed.distribute(para1,para2,para3);
          })
        }
        if(['web','chromeext','mobile'].indexOf(settings.platform)){
          usingdata = $.localStorage.get('usingdata');
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
          chrome.storage.local.get("collectdata", function(data){
            collectdata = data.collectdata;
            feed.distributec(para1,para2,para3);
          })
        }
        if(['web','chromeext','mobile'].indexOf(settings.platform)){
          usingdata = $.localStorage.get('collectdata');
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
          chrome.storage.local.remove("usingdata", function(data){})
        }
        if(['web','chromeext','mobile'].indexOf(settings.platform)){
          usingdata = $.localStorage.remove('usingdata');
        }
        feed.getuser("getdatas");
      },
      shownews:function(data,parentname){
        if(settings.platform ==="chromeext"){
            var lastloadtime = Date.parse(usingdata['lastloadtime']);
            if(Date.parse(data['inserttime']+' UTC')>lastloadtime && data['click']==0){
              // chrome.notifications.create(id, options, creationCallback);
              var notif = window.webkitNotifications.createNotification(
                  chrome.extension.getURL('../novel.png'),
                  parentname + ' 有新的更新, 速来看啊~',    // title
                  data['title']    // body.
              );
              notif.onclick = function(){
                  var newlink = "http://zzgary.info/allfeed/singleview.php?name="+parentname+"&url="+data['link']+"&uid="+usingdata['username'];
                  chrome.tabs.create({'url': newlink});
                  usingdata['flag'] = 'clicklink';
                  usingdata['itemc'] = data['link'];
                  usingdata['itemtype'] = 'click';
                  feed.addnew(usingdata,'clicklink');
                  feed.setbadge(1,'minus');
              };
              notif.show();
              setTimeout(function() {
                  notif.cancel();
              },10000);
            }
        }
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
        $('div.left').show();
        $('div.right').show();
        $('div#content').show();
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
                news = addnewitem(singledata[kk]['star'],singledata[kk]['click'],singledata[kk]["link"],$.parseJSON(singledata[kk]["title"]),posid,news);
                feed.shownews(singledata[kk],singledata['name']);
              }
            };
            if(news != 0){
              $('span.notis').eq(posid).addClass('nonzero').html(news).attr('data-newc',news);
            }
            totaln = totaln + news;
          }
        }
        shuffle();
        autosi();
        $('div.loader').hide();
        usingdata['lastloadtime'] = Date();
        feed.saveuser(usingdata);
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
        case name=="help:":
          // $('div.left').hide();
          // $('div.right').hide();
          $('div#content').hide();
          $('div.help').show();
          $('div.moreitem').hide();
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
          $('div.novel').hide();
          $('div.moreitem').hide();
          $('div.chapters').hide();
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
          setTimeout(function(){
            $('div.moreitem').show();
            shuffle();
          },1000)
          break;
        case name=="collection:":
          var cdatas = JSON.parse(alldatas)['collectiondata'];
          $('div.novel').hide();
          $('div.chapters').hide();
          $('#content').append(feed.novelhtml);
          var posid = $('.novel').length -1;
          feed.modifyfeed(posid+1,"collection","collection",'item'+posid);
          var news = 0;
          for(i in cdatas){
            news = addnewitem(parseInt(cdatas[i]['star']),parseInt(cdatas[i]['click']),cdatas[i]["link"],$.parseJSON(unescape(cdatas[i]["title"])),posid,news);
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
          console.log(data);
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
            $('div.login').hide();
            $('div.left').show();
            $('div.right').show();
            $('div.wrap').show();
            $('div.searchwrap').hide();
            $('div.add').show();
            $('input#auto').focus();
            $('div#content').empty();
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
      clickl:function(th){
        usingdata['flag'] = 'clicklink';
        usingdata['itemc'] = th.attr('href');
        usingdata['itemtype'] = 'click';
        feed.addnew(usingdata,'clicklink');
        if(th.find('b').length>0){
          var text = th.text();
          th.html(text);
          var noti = th.closest('div.chapters').prev('div').children('span.notis');
          var number = noti.text() -1;
          noti.text(number);
          if(number == 0){
            noti.removeClass('nonzero');
          }
          // th.closest('li').appendTo(th.closest('ul'));
          th.closest('li').insertAfter(th.closest('ul').find('b').last().closest('li'));
          //shuffle();
        }
        // var newlink = "http://fun.zzgary.info/feedpusher/singleview.php?name="+cname+"&url="+link+"&uid="+usingdata['username']+"&pid="+usingdata['userpassw'];
        // window.open(newlink, '_blank');
      },
      getmoredata:function(){
        var thec = $("div.novel:visible");
        var posid = $("div.novel").index(thec);
        var news = thec.find('b').length;
        usingdata.itemc = thec.find('div.name a').attr('href');
        usingdata.cunumber = thec.find('li').length;
        usingdata.endnumber = usingdata.cunumber + 35;
        usingdata.flag = "getmore";
        console.log(usingdata);
        $.post("http://fun.zzgary.info/feedpusher/sender.php",usingdata,function(data){
          var moredata = JSON.parse(data);
          console.log(moredata);
          if(moredata == null){
            $('div.saving').html('No More!')
            $('div.saving').fadeIn(100).fadeOut(1200);
            $('div.moreitem').hide();
          }else{
            $.each(moredata,function(index,value){
              news = addnewitem(parseInt(value['star']),parseInt(value['click']),value['link'],$.parseJSON(unescape(value['title'])),posid,news);
            })
          }
          if(news != 0){
            $('span.notis').eq(posid).addClass('nonzero').html(news).attr('data-newc',news);
          }
        })
      },
      setbadge:function(number,flag){
        // Only for chromeext
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
    };
    feed.getuser("getdatas");
    $('button.loginbutton').on('click',function(){
      var username = $('input#username').val();
      var passw = $('input#passw').val();
      var curtime = new Date();
      if(username == "Enter Your Username."){
        console.log('please log in with your username.');
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
      if(username == "Enter Your Username."){
        console.log('Just enter your name and password to create a new user.');
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
    $('div.prev').on('click',function(){
      webview.back();
    });
    $('div.next').on('click',function(){
      webview.forward();
    });
    $('div#content').on('click', 'div.name a', function(e){
      e.preventDefault();
      $('div.moreitem').hide();
      var tnovel = $(this).closest('div.novel');
      if(notclick==0){
        $(this).closest('div').next('div').toggle(200);
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
      if(itemnumber>34 && isshow==1){
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
    });
    $('div.help').on('click', 'div.qatitle', function(e){
      e.preventDefault();
      $(this).next('div').toggle(200);
      $(this).closest('div').css("background-color","#fefbf8");
      $(this).closest('div.qaitem').siblings().toggle();
    });
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
    $('div.moreitem').on('click',function (){
      feed.getuser("getmoredata");
    });
    $('div.backto').on('click',function (){
      $('div.help').hide();
      $('div.searchwrap').hide();
      $('div.add').show();
      $('div.wrap').show();
      $('#content').show();
    });
    $('div.searchresults').on('click', 'a.source', function(e){
      e.preventDefault();
      var name = $(this).attr('href');
      $('div.right webview').attr('src',name).attr('data-titlename','');
      setTimeout(function(){
        $('div.loading').hide();
        $('div.prev').show();
        $('div.next').show();
        $('span.markcollect').hide();
        $('a.saveas').hide();
        $('img#bgbg').hide();
      },10000);
      // judgecollection(name,'url');
    });
    $('div.searchresults').on('click', 'a.addto', function(e){
      e.preventDefault();
      var name = $(this).attr('href');
      feed.getuser("add",name,"rss");
      // feed.add(name,"rss");
      $('div.saving').html('Adding ...')
      $('div.saving').fadeIn(100);
    });
    $('div.left').on('click', 'span.del', function(){
      var th = $(this);
      feed.getuser("delete",th);
    });
    $('div.right').on('click', 'a.saveas', function(){
      $('div.loading').show();
      $('div.prev').hide();
      $('div.next').hide();
      saveFile(makelink.replace('1600x1200','1920x1200'));
    });
    $('div.right').on('click', 'span.collectit', function(){
      var th = $( this );
      th.toggleClass("collectit2");
      var theurl = $(webview).attr('src');
      var thetitle = $(webview).attr('data-titlename');
      feed.getuser("collect",theurl,thetitle);
      // change to collection
    });
    $('div#content').on('click','li a',function(e){
      //e.preventDefault()
      $('div.loading').show();
      if(!$('img#bgbg').is(":visible")){
        $('div.loading').show();
        $('div.prev').hide();
        $('div.next').hide();
        $('a.saveas').show();
        $('img#bgbg').show();
      }
      e.preventDefault();
      e.stopPropagation();
      var link = $(this).attr('href');
      var cname = $(this).text();
      var th = $(this);
      $('span.markcollect').show();
      // judgecollection(link,'url');
      feed.getuser('clicklink',th);
      $('div.right webview').attr('src',link).attr('data-titlename','');
      setTimeout(function(){
        if($('img#bgbg').is(":visible")){
          $('img#bgbg').hide();
          $('a.saveas').hide();
        }
      },5000)
      setTimeout(function(){
        if($('div.loading').is(":visible")){
          $('div.loading').hide();
          $('div.prev').show();
          $('div.next').show();
        }
      },10000)
    });
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
    setInterval(function(){
      feed.getuser("getdatas");
    },10*60000);
    $( window ).resize(function() {
      autosi();
    });
  };
})(jQuery);
