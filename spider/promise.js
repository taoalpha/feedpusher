var feed = require("google-feed")
var moment = require('moment')


  /* DB: feedpusher
   * Tables:
   *   - site
   *    - title
   *    - link
   *    - feedUrl
   *    - description
   *    - type
   *    - author
   *    - addedDate
   *    - addedBy
   *    - lastCrawled
   *   - feed
   *    - title
   *    - link
   *    - author
   *    - publishedDate
   *    - content
   *    - categories
   *    - addedDate
   *   - User
   *    - name
   *    - email
   *    - password
   *    - subscribe: []
   *    - like: []
   *    - star: []
   *    - collect: []
   */

  var crawler = (site_url) => {
    return feed.load(site_url).then((data)=>{
      console.log("Crawling this website: "+site_url)
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
      })
      console.log("Crawled : "+data.feed.entries.length +" items!")
      return 1
    })
  }


  var site_list = ['http://my.hupu.com/594/blog/rss','http://www.dfdaily.com/rss/1170.xml','http://onehd.herokuapp.com/','http://www.ciqiong.cn/feed','http://www.adaymag.com/feed/','http://www.duxieren.com/duxieren.xml','http://taoalpha.me/blog/feed.xml']
  var promises = []
  new Promise( (resolve,reject) => {
    site_list.forEach( (v,i) => {
      promises.push(crawler(v))
    })
  })
  Promise.all(promises).then( (data) => {
    console.log(data)
  })
