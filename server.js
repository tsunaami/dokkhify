import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Ensure uploads folder exists
const uploadDir = path.join(path.resolve(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ✅ Serve uploaded files
app.use("/uploads", express.static(uploadDir));

// 🔐 MongoDB URI
const uri =
  "mongodb://mojumdernamira_db_user:HJWx9m9w6nTDpSLZ@ac-ha3jbpf-shard-00-00.hosssmp.mongodb.net:27017,ac-ha3jbpf-shard-00-01.hosssmp.mongodb.net:27017,ac-ha3jbpf-shard-00-02.hosssmp.mongodb.net:27017/?ssl=true&replicaSet=atlas-3op5a4-shard-0&authSource=admin&appName=dokkhify";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let coursesCollection;
let myCoursesCollection;

// ✅ Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

async function startServer() {
  try {
    await client.connect();
    const db = client.db("dokkhify");

    coursesCollection = db.collection("courses");
    myCoursesCollection = db.collection("myCourses");

    console.log("✅ MongoDB Connected");

    app.get("/", (req, res) => res.send("Backend running"));

    // =========================
    // ✅ ADD COURSE (WITH QUIZ)
    // =========================
    app.post("/courses", upload.array("files"), async (req, res) => {
      try {
        if (!req.files || req.files.length === 0) {
          return res.status(400).send({ error: "No files uploaded" });
        }

        const filesData = req.files.map((file) => ({
          name: file.filename,
          originalName: file.originalname,
          type: file.mimetype,
          url: `http://localhost:5000/uploads/${file.filename}`,
        }));

        // ✅ Parse quiz safely
        let quiz = [];
        if (req.body.quiz) {
          try {
            quiz = JSON.parse(req.body.quiz);
          } catch (e) {
            console.log("Invalid quiz JSON");
          }
        }

        const course = {
          title: req.body.title,
          description: req.body.description,
          price: req.body.price,
          uploadedBy: req.body.uploadedBy,
          students: 0,
          files: filesData,
          quiz: quiz, // ✅ stored in DB
        };

        const result = await coursesCollection.insertOne(course);
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Course upload failed" });
      }
    });

    // =========================
    // ✅ GET ALL COURSES
    // =========================
    app.get("/courses", async (req, res) => {
      try {
        const result = await coursesCollection.find().toArray();
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: "Failed to fetch courses" });
      }
    });

    // =========================
    // ✅ DELETE COURSE
    // =========================
    app.delete("/courses/:id", async (req, res) => {
      try {
        const result = await coursesCollection.deleteOne({
          _id: new ObjectId(req.params.id),
        });
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: "Delete failed" });
      }
    });

    // =========================
    // ✅ ENROLL COURSE
    // =========================
    app.post("/myCourses", async (req, res) => {
      try {
        const course = req.body;

        const existing = await myCoursesCollection.findOne({
          courseId: course.courseId,
          student: course.student,
        });

        if (existing) {
          return res.status(400).send({ message: "Already enrolled" });
        }

        const newEnrollment = {
          ...course,
          certificate: false,
          progress: 0,
        };

        const result = await myCoursesCollection.insertOne(newEnrollment);
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Enrollment failed" });
      }
    });

    // =========================
    // ✅ GET MY COURSES
    // =========================
    app.get("/myCourses", async (req, res) => {
      try {
        const result = await myCoursesCollection.find().toArray();
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: "Failed to fetch enrolled courses" });
      }
    });

    // =========================
    // ✅ UPDATE PROGRESS / CERTIFICATE
    // =========================
    app.put("/myCourses/:id", async (req, res) => {
      try {
        const result = await myCoursesCollection.updateOne(
          { _id: new ObjectId(req.params.id) },
          {
            $set: {
              certificate: req.body.certificate,
              progress: req.body.progress,
            },
          }
        );

        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Update failed" });
      }
    });

    // =========================
    // 🚀 START SERVER
    // =========================
    app.listen(5000, () =>
      console.log("🚀 Server running on port 5000")
    );
  } catch (err) {
    console.error("❌ Server failed:", err);
  }
}

startServer();