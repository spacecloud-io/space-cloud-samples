var express = require("express");
var app = express();

const axios = require('axios').default;

app.use(express.json());

const adderURL = process.env.ADDER_URL || 'localhost'
const delay = process.env.DELAY || 100

app.get("/add/:num1/:num2", (req, res) => {
  const num1 = Number(req.params.num1);
  const num2 = Number(req.params.num2);
  const response = { value: num1 + num2 };
  res.status(200).send(JSON.stringify(response));
});

app.post("/double", async (req, res) => {
  // Get the number from the body
  const num = Number(req.body.value);

  // Generate the url
  const url = `http://${adderURL}:8080/add/${num}/${num}`

  try {
    // Fire request and get response
    const response = await axios.get(url);
    // Send the response to the client
    res.status(200).send(JSON.stringify(response.data));
  } catch (e) {
    res.status(500).send(JSON.stringify({ error: "an error occured" }));
  }
});

app.post("/logger", (req, res) => {
  setTimeout(() => {
    console.log("Received an event:\n", JSON.stringify(req.body, null, 2))
    res.status(200).send(JSON.stringify(req.body));
  }, delay)
});

var server = app.listen(8080, () => {
  console.log("app running on port:", server.address().port);
});