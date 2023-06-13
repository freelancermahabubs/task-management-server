const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
// midlware
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mzwsigq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const tasksCollection = client.db("tasksDB").collection("tasks");

    // API endpoints

    // Create a new task
    app.post("/add-tasks", async (req, res) => {
      const task = req.body;
      console.log(task);

      await tasksCollection.insertOne(task, (err, result) => {
        if (err) {
          console.error("Error creating task:", err);
          res
            .status(500)
            .send({ error: "An error occurred while creating the task" });
        } else {
          res.status(201).send(result.ops[0]);
        }
      });
    });

    app.get("/all-tasks", async (req, res) => {
      const result = await tasksCollection.find().toArray();
      res.send(result);
    });

    // Update a task
    app.put("/update-tasks/:id", async (req, res) => {
      const taskId = req.params.id;
      const updatedTask = req.body;

      await tasksCollection.updateOne(
        { _id: new ObjectId(taskId) },
        { $set: updatedTask },
        (err, result) => {
          if (err) {
            console.error("Error updating task:", err);
            res
              .status(500)
              .send({ error: "An error occurred while updating the task" });
          } else if (result.modifiedCount === 0) {
            res.status(404).send({ error: "Task not found" });
          } else {
            res.status(200).send({ message: "Task updated successfully" });
          }
        }
      );
    });

    // Delete a task
    app.delete("/delete-tasks/:id", async (req, res) => {
      const taskId = req.params.id;

      await tasksCollection.deleteOne(
        { _id: new ObjectId(taskId) },
        (err, result) => {
          if (err) {
            console.error("Error deleting task:", err);
            res
              .status(500)
              .send({ error: "An error occurred while deleting the task" });
          } else if (result.deletedCount === 0) {
            res.status(404).send({ error: "Task not found" });
          } else {
            res.status(200).send({ message: "Task deleted successfully" });
          }
        }
      );
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.log);

app.get("/", (req, res) => {
  res.send("Task Management Server is running..");
});

app.listen(port, () => {
  console.log(`Task Management is running on port ${port}`);
});
