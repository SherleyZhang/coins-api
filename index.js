require("dotenv").config();

// npm run dev
const express = require("express"); //CommonJS
const pg = require("pg");
const cors = require("cors");
const Client = pg.Client;
const app = express();
app.use(express.json()); //middleware to deserialize JSON in request
app.use(cors()); //middleare to allow cross-domain AJAX requiests

app.get("/api/comments", (request, response) => {
  const client = createClient();
  client.connect().then(() => {
    client.query("select * from comments").then((queryResponse) => {
      response.json(queryResponse.rows);
    });
  });
  //response.json([1,2]);
});

app.get("/api/comments/:id", (request, response) => {
  const client = createClient();
  client.connect().then(() => {
    client
      .query("select * from comments where id=$1", [request.params.id])
      .then((queryResponse) => {
        response.json(queryResponse.rows[0]);
      });
  });
});

// post request: get request是refresh就自然发生，但是post request需要手动（比如postman上）
app.post("/api/comments", (request, response) => {
  const client = createClient();
  client.connect().then(() => {
    client
      .query(
        "insert into comments (names, posts) values ($1, $2) returning *",
        [request.body.title, request.body.body]
      )
      .then((queryResponse) => {
        response.json(queryResponse.rows[0]);
      });
  });
});

function createClient() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
  return client;
}

app.listen(process.env.PORT || 3000);
//http://localhost:3000/api/posts

//git init
//git status
