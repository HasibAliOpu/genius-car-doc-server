const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.c2j06.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const serviceCollection = client.db("geniusCar").collection("service");
    const orderCollection = client.db("geniusCar").collection("order");

    //Auth
    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.TOKEN_KEY, {
        expiresIn: "1d",
      });
      res.send(accessToken);
    });

    // GET all service
    app.get("/service", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    // GET single service

    app.get("/service/:id", async (req, res) => {
      const id = req.params.id;
      const service = await serviceCollection.findOne({ _id: ObjectId(id) });
      res.send(service);
    });

    //POST
    app.post("/service", async (req, res) => {
      const newService = req.body;
      if (
        !newService.name ||
        !newService.description ||
        !newService.price ||
        !newService.img
      ) {
        return res.send({
          success: false,
          error: "Please Provide all information",
        });
      }
      const result = await serviceCollection.insertOne(newService);
      res.send({
        success: true,
        message: `Successfully added ${newService.name}`,
      });
    });

    //DELETE
    app.delete("/service/:id", async (req, res) => {
      const id = req.params.id;
      const result = await serviceCollection.deleteOne({ _id: ObjectId(id) });
      if (!result.deletedCount) {
        return res.send({ success: false, error: "Something Went Wrong" });
      }
      res.send({ success: true, message: "Successfully Deleted the Service" });
    });

    // Order Collection API
    app.get("/order", async (req, res) => {
      const email = req.query.email;
      const cursor = orderCollection.find({ email });
      const orders = await cursor.toArray();
      res.send(orders);
    });
    app.post("/order", async (req, res) => {
      const order = req.body;

      await orderCollection.insertOne(order);
      res.send({
        success: true,
        message: `Successfully Inserted ${order.service}`,
      });
    });
  } finally {
    // await client.close()
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Running Genius Car ON server");
});

app.listen(port, () => {
  console.log("Listening Port:", port);
});
