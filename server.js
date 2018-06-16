var express = require("express");
var mongojs = require("mongojs");
var request = require("request");
var cheerio = require("cheerio");
var bodyParser = require("body-parser");

var exphbs = require("express-handlebars");
var app = express()

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var databaseUrl = process.env.MONGODB_URI || "mongodb://localhost/WebScraperHW"
//var databaseUrl = "WebScraperHW";
var collections = ["Data"];

//mongoose.Promise = Promise;
//mongoose.connect(MONGODB_URI);


var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});


app.get("/", function(req, res) {
  res.render("home", { });
});

app.get("/save/:Title", function(req, res) {
  var Title = req.params.Title
  res.render("new_note", {articles:Title });
});

app.get("/delete/:Title", function(req, res) {
  var Title = req.params.Title
  db.Data.remove({Title: Title})
  res.redirect("/my_articles")
});




app.post("/form/save/comment", function(req, res) {
  db.Data.update({'Title':req.body.Title},req.body,{ upsert: true })
  res.redirect("/my_articles")
  
  })


app.get("/my_articles", function(req, res) {
  db.Data.find({}, function(error, found) {
    if (error) {
      console.log(error);
    }
    else {
    // res.json(found)
    res.render("my_articles", {articles:found })
      
    }
  });
});



app.get("/new_articles", function(req, res) {

  request("https://www.npr.org", function(error, response, html) {

  var $ = cheerio.load(html);
  var results = [];

  $("h3.title").each(function(i, element) {
    
    var Title = $(element).text();

   results.push({
      Title: Title
    });
  });
  //res.json(results)
  res.render("new_articles", {articles:results })
});

})






app.listen(3000, function() {
  console.log("App running on port 3000!");
});
