"use strict";
var mongo = require('mongodb');
var gfeed = require("google-feed")
var MongoClient = require('mongodb').MongoClient
var ObjectId = require('mongodb').ObjectID
var moment = require('moment')

class FeedSpider{
  constructor(){
    // configuration
    this.CONFIG = {}
    // the db instance
    this.db = new mongo.Db('feedpusher', new mongo.Server('192.168.0.107', 27017))
    this.siteC = this.db.collection("site")
    this.feedC = this.db.collection("feed")
    this.userC = this.db.collection("user")
    // statistical data
    this.stats = {}
  }
  init(){
    var _this = this
    MongoClient.connect('mongodb://127.0.0.1:27017/feedpusher', function(err, db) {
        _this.db = db
    })
  }
  insert(collection,data){
    this.stats.insertTotal = this.stats.insertTotal || 0 
    this.stats.insertTotal ++
    return collection.insert(data)
  }
  find(collection,query,match){
    // return promise and access the docs from .then(docs)
    query = query || {}
    match = match || {}
    return collection.find(query,match)
  }
  findOne(collection,query,match){
    // return promise and access the docs from .then(docs)
    query = query || {}
    match = match || {}
    return collection.findOne(query,match)
  }
  exist(collection,query){
    // return promise and access the count from .then(count)
    query = query || {}
    return collection.count(query)
  }
  addNewSite(url){
    return this.crawler(url)
  }
  crawler(url){
    var _this = this
    var data = {}
    var allTempPromises = []
    return gfeed.load(url)
    .then((tdata)=>{
      _this.stats[url] = 0
      data = tdata
      return _this.siteC.count({'feedUrl':tdata.feed.feedUrl})
    })
    .then( (count) => {
      if(count == 0){
        var siteInfo = {
          title: data.feed.title,
          link: data.feed.link,
          feedUrl: data.feed.feedUrl,
          author: data.feed.author,
          description: data.feed.description,
          type: data.feed.type,
          addedDate: moment().format(),
          lastCrawled: moment().format()
        }
        return _this.insert(_this.siteC,siteInfo)
      }else{
        // already stored
        console.log("already stored")
      }
    })
    .then( ()=>{
      // insert new feed into the db if doesn't already have
      console.log("Start crawling the feeds")
      return Promise.all(data.feed.entries.map( (v) => {
        var feedInfo = {
          title: v.title,
          link: v.link,
          publishedDate: moment(new Date(v.publishedDate)).isValid() ? moment(new Date(v.publishedDate)).format() : moment().format(),
          author: v.author,
          feedUrl:data.feed.feedUrl,
          content: v.content,
          categories: v.categories,
          addedDate: moment().format()
        }
        return _this.exist(_this.feedC,{'link':v.link}).then( (count) => {
          if(count == 0){
            _this.stats[url] += 1
            _this.insert(_this.feedC,feedInfo)
          }
        })
      }) )
    })
  }
  authenticate(user){
    // return promise with count, you can judge from the count <> 1
    return this.exist(this.userC,user)
  }
  getUserData(user){
    // get user data: subscribe,read,star,collection,status...
    if(user.id){
      user = {_id:ObjectId(user.id)}
    }
    return this.findOne(this.userC,user)
  }
  getSiteBySub(sub){
    return this.find(this.siteC,{feedUrl:{$in:sub}},{feedUrl:1,title:1,link:1}).toArray()
  }
  getDataByFeed(url,allData,read,limit,skip){
    limit = limit || 10
    skip = skip || 0
    return this.find(this.feedC,{feedUrl:url},{title:1,link:1}).sort({"publishedDate":-1}).skip(skip).limit(limit).toArray().then( (data) =>{
      data.forEach( (v) => {
        v.read = 0
        allData[url].unreadNum = allData[url].unreadNum || 0
        allData[url].unreadNum ++
        if(read.indexOf(v._id.toString())>-1){
          v.read = 1
          allData[url].unreadNum --
        }
        allData[url].entries.push(v)
      })
    })
  }
  updateUserSub(user,data){
    return this.userC.update(user,{$set:data})
  }
  markRead(user,fid){
    if(user.id){
      user = {_id:ObjectId(user.id)}
    }
    return this.userC.update(user,{$addToSet:{read:fid}})
  }
}

var feed = new FeedSpider()
var allData = {}
feed.db.open((err, db) =>{
  // list stored with all promises

  var promises = []
  var allData = {}

  var user = {
    username:"taoalpha",
    useremail:"iamzhoutao92@gmail.com",
    userpass:""
  }
  var data = {
    subscribe:[
      "http://36kr.com/feed",
      "http://javascriptweekly.com/rss/20e32i2j"
    ]
  }

  feed.updateUserSub(user,"https://www.producthunt.com/feed").then( (doc) =>{
    console.log(doc)
    db.close()
  })
  //feed.findOne(feed.userC,user,{subscribe:1}).then((data) => {
  //  console.log(data._id)
  //}).then( ()=>{
  //  db.close()
  //})
  //
  var uid = "568c64adb45187532689647d"
  var fid = "568cd7ac995ac18e3deca42a"

  // test add new site
  //feed.addNewSite("http://www.designnews.com/rss_simple.asp").then( (data)=>{
  //  console.log(feed.stats)
  //})

// test with get user subscibe feeds and items
//  feed.getUserSub(user).then( (data) => {
//    feed.getSiteBySub(data.subscribe).then( (data) =>{
//      data.forEach( (item) =>{
//        allData[item.feedUrl] = {}
//        allData[item.feedUrl].title = item.title
//        allData[item.feedUrl].link = item.link
//        promises.push(feed.getDataByFeed(item.feedUrl,allData))
//      })
//    }).then( ()=>{
//      Promise.all(promises).then( (data) =>{
//        console.log(allData)
//        db.close()
//      },(reason)=>{
//        console.log(reason)
//        db.close()
//      })
//    })
//  })
//

  //feed.find(feed.siteC,{},{'feedUrl':1,'_id':0}).limit(2).toArray().then((data) => {
  //  data.forEach( (v) => {
  //    allData[v.feedUrl] = []
  //    promises.push(feed.getDataByFeed(v.feedUrl,allData))
  //  })
  //})
  //.then( ()=>{
  //  Promise.all(promises).then( (data) => {
  //    console.log(allData)
  //    db.close()
  //  },(reason) => {
  //    console.log(reason)
  //    db.close()
  //  })
  //})
})
