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
    this.stats = {entries:{}}
  }
  init(){
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
  updateDuration(feedUrls){
    return Promise.all(feedUrls.map( (feedUrl) => {
      return this.siteC.findOne({feedUrl:feedUrl}).then( (doc) =>{
        var duration = doc.lastUpdateDuration,
            numUpdates = this.stats.entries[feedUrl]
        if(numUpdates===0){
          // increase the duration if no updates
          duration *= 1.5
        }else{
          // decrease the duration according to the number of updates it has during the last crawl
          duration *= 0.5*(Math.floor( 1 / Math.max(1,(numUpdates - 5)/10)))
        }
        // set the upper and lower limit for duration, and also only keep 3 numbers after the period
        duration = duration > 100 ? 100 : Number(duration).toFixed(3)
        duration = duration < 0.1 ? 0.1 : Number(duration).toFixed(3)
        this.siteC.update({feedUrl: feedUrl},{$set:{lastUpdateDuration:Number(duration)}})
      })
    }) )
  }
  updateCrawled(feedUrls){
    return Promise.all(feedUrls.map( (feedUrl) => {
      return this.siteC.findOne({feedUrl:feedUrl}).then( (doc) =>{
        var curTime = moment().format()
        this.siteC.update({feedUrl: feedUrl},{$set:{lastCrawled:curTime}})
      })
    }) )
  }
  crawler(url,user){
    var _this = this
    var data = {}
    var allTempPromises = []
    return gfeed.load(url)
    .then((tdata)=>{
      _this.stats.entries[url] = 0
      data = tdata
      if(user){
        // update user subscribe list
        _this.updateUser(user,{$addToSet:{subscribe:tdata.feed.feedUrl}})
      }
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
          lastUpdated: moment().format(),
          // last crawled time with valid new feeds
          lastUpdateDuration: 0.5,
          // duration unit: hour
          // default is 0.5 => initial as crawling every half hour
          lastCrawled: moment().format()
        }
        return _this.insert(_this.siteC,siteInfo)
      }else{
        // already stored
        // console.log("already stored")
        return Promise.all([])
      }
    })
    .then( ()=>{
      // insert new feed into the db if doesn't already have
      // console.log("Start crawling the feeds")
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
            _this.stats.entries[url] += 1
            _this.insert(_this.feedC,feedInfo)
          }
        })
      }) )
    })
  }
  authenticate(user){
    // return promise with count, you can judge from the count <> 1
    return this.exist(this.userC,user).then( (count) => {return count==1})
  }
  addNewUser(user){
    this.insert(this.userC,user)
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
  updateUser(user,data){
    // updateUser
    return this.userC.update(user,data)
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
  //
  if(err){console.log(err)}

  var promises = []
  var allData = {}

  var user1 = {
    username:"taoalpha",
    useremail:"iamzhoutao92@gmail.com",
    userpass:"zhou1992"
  }
  var user = {
    email:"asd@12.com",
    pass:"asd"
  }
  var data = {
    subscribe:[
      "http://36kr.com/feed",
      "http://javascriptweekly.com/rss/20e32i2j"
    ]
  }

  //feed.authenticate(user).then( (exist) => {
  //  console.log(exist)
  //  db.close()
  //})

  //var feedUrls = ["http://songshuhui.net/feed","http://taoalpha.me/blog/feed.xml","http://www.kanzhihu.com/feed"]

  //feed.updateDurationTest(feedUrls).then( (doc) =>{
  //  feed.find(feed.siteC,{feedUrl:{$in:feedUrls}}).toArray().then((data) => {
  //    console.log(data)
  //  }).then( ()=>{
  //    db.close()
  //  })
  //})

  feed.find(feed.siteC,{},{feedUrl:1,lastUpdateDuration:1,lastCrawled:1,_id:0}).sort({lastUpdateDuration:-1}).toArray().then((data) => {
    console.log(
      data
      //data.filter( (v) => {
      //  return v.lastUpdateDuration > 0.5
      //})
    )
    db.close()
  })

  //feed.addNewUser(user)
  //feed.updateUser(user,{$pull:{subscribe:"http://www.guokr.com/rss/"}}).then( (doc)=>{
  //  db.close()
  //})

  /*
   * Crawl all sites we currently have
  // list stored with all promises
  var allSites = []

  feed.find(feed.siteC,{},{feedUrl:1,lastCrawled:1,lastUpdateDuration:1,_id:0}).toArray().then((data) => {
    var curTime = moment()
    return Promise.all(data.filter( (v) => {
      // filter all sites that the time from last crawled has passed the last update duration
      return (((curTime - moment(v.lastCrawled)) / 3600 / 1000) > v.lastUpdateDuration)
    })
    .map( (v) =>{
      allSites.push(v.feedUrl)
      return feed.crawler(v.feedUrl)
    }) )
  })
  .then( ()=>{
    return feed.updateCrawled(allSites)
  },(reason)=>{
    console.log("Broken at crawler")
    console.log(reason)
    db.close()
  })
  .then( ()=>{
    console.log(feed.stats)
    feed.updateDuration(allSites).then( () => {
      feed.find(feed.siteC,{feedUrl:{$in:allSites}},{feedUrl:1,lastUpdateDuration:1,lastCrawled:1,_id:0}).toArray().then((data) => {
        console.log(data)
      }).then( ()=>{
        db.close()
      })
    },(reason)=>{
      console.log("Broken at updatedDuration")
      console.log(reason)
      db.close()
    })
    //new_list.forEach( (v)=>{
    //  promises.push(feed.crawler(v))
    //})
  },(reason)=>{
    console.log("Broken at updatedCrawled")
    console.log(reason)
    db.close()
  })
  */
})
