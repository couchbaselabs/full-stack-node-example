var Couchbase = require("couchbase");
var BodyParser = require("body-parser");
var Uuid = require("uuid");
var Cors = require("cors");
var Express = require("express");

var app = Express();
var N1qlQuery = Couchbase.N1qlQuery;

app.use(BodyParser.json());
app.use(Cors())

var bucket = (new Couchbase.Cluster("couchbase://localhost")).openBucket("example");

app.get("/movies", function(req, res) {
    var query = N1qlQuery.fromString("SELECT example.* FROM example").consistency(N1qlQuery.Consistency.REQUEST_PLUS);
    bucket.query(query, function(error, result) {
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
    var query = N1qlQuery.fromString("SELECT example.* FROM example WHERE LOWER(name) LIKE '%' || $1 || '%'");
    bucket.query(query, [req.params.title.toLowerCase()], function(error, result) {
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
    bucket.insert(Uuid.v4(), req.body, function(error, result) {
        if(error) {
            return res.status(400).send({ "message": error });
        }
        res.send(req.body);
    });
});

app.listen(3000, function() {
    console.log("Starting server on port 3000...");
});