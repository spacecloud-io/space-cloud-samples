var express = require("express");
var app = express();

app.use(express.json());

app.get("/add/:num1/:num2", function (req, res) {
 const num1 = Number(req.params.num1);
 const num2 = Number(req.params.num2);
 const response = { value: num1 + num2 };
 res.status(200).send(JSON.stringify(response));
});

app.post("/double", function (req, res) {
 const num = Number(req.body.value);
 const response = { value: num * 2 };
 res.status(200).send(JSON.stringify(response));
});

app.post("/logger", function (req, res) {
 console.log("Received an event:\n", JSON.stringify(req.body, null, 2))
 res.status(200).send(JSON.stringify({}));
});

var server = app.listen(8080, function () {
 console.log("app running on port:", server.address().port);
});