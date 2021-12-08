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
      .query("SELECT * FROM comments WHERE id = $1 LIMIT 1", [
        request.params.id,
      ])
      .then((queryResponse) => {
        if (queryResponse.rowCount >= 1) {
          response.json(queryResponse.rows[0]);
        } else {
          response.status(404).send();
        }
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
        [request.body.names, request.body.posts]
      )
      .then((queryResponse) => {
        response.json(queryResponse.rows[0]);
      });
  });
});

app.delete("/api/comments/:id", (request, response) => {
  const client = createClient();

  client.connect().then(() => {
    client
      .query("DELETE FROM comments WHERE id = $1", [request.params.id])
      .then((queryResponse) => {
        if (queryResponse.rowCount === 1) {
          response.status(204).send();
        } else {
          response.status(404).send();
        }
      });
  });
});

app.put("/api/comments/:id", (request, response) => {
  const client = createClient();

  client.connect().then(() => {
    client
      .query(
        "UPDATE comments SET names = $1, posts = $2 WHERE id = $3 RETURNING *",
        [request.body.names, request.body.posts, request.params.id]
      )
      .then((queryResponse) => {
        if (queryResponse.rowCount === 1) {
          response.json(queryResponse.rows[0]);
        } else {
          response.status(404).send();
        }
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
