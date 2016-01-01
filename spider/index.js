var feed = require("google-feed")
feed.load('http://36kr.com/feed').then((data)=>{
  data.feed.entries.forEach( (v) => {
    console.log(v)
  })
});


var MongoClient = require('mongodb').MongoClient
  , format = require('util').format;

MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
  if(err) throw err;

  var collection = db.collection('test_insert');
  collection.insert({a:2}, function(err, docs) {

    collection.count(function(err, count) {
      console.log(format("count = %s", count));
    });

    // Locate all the entries using find
    collection.find().toArray(function(err, results) {
      console.dir(results);
      // Let's close the db
      db.close();
    });
  });
})
