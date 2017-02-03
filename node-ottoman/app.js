var Couchbase = require("couchbase");
var Ottoman = require("ottoman");
var BodyParser = require("body-parser");
var Cors = require("cors");
var Express = require("express");

var app = Express();

app.use(BodyParser.json());
app.use(Cors())

var bucket = (new Couchbase.Cluster("couchbase://localhost")).openBucket("example");

Ottoman.store = new Ottoman.CbStoreAdapter(bucket, Couchbase);

var MovieModel = Ottoman.model("Movie", {
    name: {type: "string"},
    genre: {type: "string"},
    formats: {
        digital: {type: "boolean"},
        bluray: {type: "boolean"},
        dvd: {type: "boolean"}
    }
});

app.get("/movies", function(req, res) {
    MovieModel.find({}, {consistency: Ottoman.Consistency.GLOBAL}, function(error, result) {
        if(error) {
            return res.status(400).send({ "message": error });
        }
        res.send(result);
    });
});

app.get("/movies/:title", function(req, res) {
    if(!req.params.title) {
        return res.status(400).send({ "message": "Missing `title` parameter" });
    }
    MovieModel.find({name: {$like: "%" + req.params.title + "%"}}, function(error, result) {
        if(error) {
            return res.status(400).send({ "message": error });
        }
        res.send(result);
    });
});

app.post("/movies", function(req, res) {
    if(!req.body.name) {
        return res.status(400).send({ "message": "Missing `name` property" });
    } else if(!req.body.genre) {
        return res.status(400).send({ "message": "Missing `genre` property" });
    }
    var movie = new MovieModel({
        name: req.body.name,
        genre: req.body.genre,
        formats: {
            digital: req.body.formats.digital,
            bluray: req.body.formats.bluray,
            dvd: req.body.formats.dvd,
        }
    });
    movie.save(function(error) {
        if(error) {
            return res.status(400).send({ "message": error });
        }
        res.send(req.body);
    });
});


Ottoman.ensureIndices(function(error) {
    app.listen(3000, function() {
        console.log("Starting server on port 3000...");
    });
});