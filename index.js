const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const { query } = require("express");
require("dotenv").config();

// middle wares
app.use(cors());
app.use(express.json());

// Mongo DB

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.elpkqgt.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    const usersCollection = client.db("celmmerce").collection("users");
    const productsCollection = client.db("celmmerce").collection("products");
    const brandsCollection = client
      .db("celmmerce")
      .collection("brandCategories");

    app.get("/users", async (req, res) => {
      const email = req.query.email;
      let query = {};
      if (email) {
        query = {
          userEmail: email,
        };
      }
      const cursor = usersCollection.find(query);
      const users = await cursor.toArray();
      res.send(users);
    });

    app.get("/user", async (req, res) => {
      const email = req.query.email;
      let query = {};
      if (email) {
        query = {
          userEmail: email,
        };
      }
      const cursor = await usersCollection.findOne(query);
      res.send(cursor);
    });

    app.get("/product", async (req, res) => {
      const id = req.query.id;
      const query = { _id: ObjectId(id) };
      const product = await productsCollection.findOne(query);
      res.send(product);
    });

    app.get("/products", async (req, res) => {
      const brand = req.query.brand;
      const seller = req.query.seller;
      let query = {};
      if (brand) {
        query = {
          brandCategory: brand,
        };
      }
      if (seller) {
        query = {
          sellerUID: seller,
        };
      }
      const cursor = productsCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });

    app.get("/brands", async (req, res) => {
      let query = {};
      const cursor = brandsCollection.find(query);
      const brands = await cursor.toArray();
      res.send(brands);
    });
    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { userEmail: email };
      const user = await usersCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "1d",
        });
        return res.send({ accessToken: token });
      }
      console.log(user);
      res.status(403).send({ accessToken: "" });
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const users = await usersCollection.insertOne(user);
      res.send(users);
    });
    app.post("/products", async (req, res) => {
      const product = req.body;
      const products = await productsCollection.insertOne(product);
      res.send(products);
    });

    app.put("/product", async (req, res) => {
      const id = req.query.id;
      const query = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          isAdvertise: true,
        },
      };
      const result = await productsCollection.updateOne(query, updateDoc);
      res.send(result);
    });
  } finally {
  }
};
run().catch((error) => console.error(error));

app.get("/", (req, res) => {
  res.send(`Celmmerce server is running on port ${port}`);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
