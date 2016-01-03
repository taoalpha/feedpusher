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
    this.db = new mongo.Db('feedpusher', new mongo.Server('localhost', 27017))
    this.siteC = this.db.collection("site")
    this.feedC = this.db.collection("feed")
    this.userC = this.db.collection("user")


    // statistical data
    this.stats = {}
  }
  init(){
    var _this = this
    MongoClient.connect('mongodb://127.0.0.1:27017/feedpusher', function(err, db) {
        console.log(db)
        _this.db = db
    })
  }
  insert(collection,data){
    collection.insert(data,(err,docs) =>{
      if(err) throw err;
    })
    this.stats.insertTotal = this.stats.insertTotal || 0 
    this.stats.insertTotal ++
  }
  find(collection,query,match){
    // return promise and access the docs from .then(docs)
    query = query || {}
    match = match || {}
    return collection.find(query,match)
  }
  exist(collection,query){
    // return promise and access the count from .then(count)
    query = query || {}
    return collection.count(query)
  }
  crawler(url){
    var _this = this
    return gfeed.load(url).then((data)=>{
      _this.stats[url] = 0
      _this.siteC.count({'feedUrl':data.feed.feedUrl}).then( (count) => {
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
          _this.insert(_this.siteC,siteInfo)
        }else{
          // already stored
        }
      }).then( ()=>{
        // insert new feed into the db if doesn't already have
        data.feed.entries.forEach( (v) => {
          var feedInfo = {
            title: v.title,
            link: v.link,
            publishedDate: moment(new Date(v.publishedDate)).format(),
            author: v.author,
            content: v.content,
            categories: v.categories,
            addedDate: moment().format()
          }
          _this.exist(_this.feedC,{'link':v.link}).then( (count) => {
            if(count == 0){
              _this.insert(_this.feedC,feedInfo)
              _this.stats[url] += 1
            }
          })
        })
      })
    })
  }
}


var feed = new FeedSpider()
feed.db.open((err, db) =>{
  // list stored with all promises
  var promises = []
  var new_list = []

  feed.find(feed.siteC,{},{'feedUrl':1,'_id':0}).toArray().then((data) => {
    data.forEach( (v) => {
      promises.push(feed.crawler(v.feedUrl))
    })
  })
  .then( ()=>{
    new_list.forEach( (v)=>{
      promises.push(feed.crawler(v))
    })
  })
  .then( ()=>{
    Promise.all(promises).then( (data) => {
      console.log(feed.stats)
      db.close()
    },(reason) => {
      console.log(reason)
      db.close()
    })
  })
})
