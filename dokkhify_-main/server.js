import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

const uri =
  "mongodb://mojumdernamira_db_user:HJWx9m9w6nTDpSLZ@ac-ha3jbpf-shard-00-00.hosssmp.mongodb.net:27017,ac-ha3jbpf-shard-00-01.hosssmp.mongodb.net:27017,ac-ha3jbpf-shard-00-02.hosssmp.mongodb.net:27017/?ssl=true&replicaSet=atlas-3op5a4-shard-0&authSource=admin&appName=dokkhify";

const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

let coursesCollection;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

async function startServer() {
  try {
    await client.connect();
    const db = client.db("dokkhify");
    coursesCollection = db.collection("courses");

    console.log("✅ MongoDB Connected");

    app.get("/", (req, res) => res.send("Backend running"));

    // Add course with file uploads
    app.post("/courses", upload.array("files"), async (req, res) => {
      console.log("Body received:", req.body);       // Logs text fields
      console.log("Files received:", req.files);     // Logs uploaded files

      if (!req.files || req.files.length === 0) {
        return res.status(400).send({ error: "No files uploaded" });
      }

      const filesData = req.files.map((file) => ({
        name: file.filename,
        originalName: file.originalname,
        type: file.mimetype,
        url: `http://localhost:5000/uploads/${file.filename}`,
      }));

      const course = {
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        uploadedBy: req.body.uploadedBy,
        students: 0,
        files: filesData,
      };

      const result = await coursesCollection.insertOne(course);
      res.send(result);
    });

    // Get all courses
    app.get("/courses", async (req, res) => {
      const result = await coursesCollection.find().toArray();
      res.send(result);
    });

    // Delete a course
    app.delete("/courses/:id", async (req, res) => {
      const result = await coursesCollection.deleteOne({ _id: new ObjectId(req.params.id) });
      res.send(result);
    });

    app.listen(5000, () => console.log("🚀 Server running on port 5000"));
  } catch (err) {
    console.error(err);
  }
}

startServer();