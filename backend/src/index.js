import express from "express";
import authRoutes from "./routes/auth.route.js";
import dotenv from "dotenv";
import cors from "cors";
import db from "./db.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use("/api", authRoutes);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  db.getConnection((err) => {
    if (err) {
      console.log(err.message);
    }

    const schemaQuery =
      "CREATE SCHEMA IF NOT EXISTS `housing-and-communal-services`";

    const usersTableQuery =
      'CREATE TABLE IF NOT EXISTS `users` (`id` INT AUTO_INCREMENT PRIMARY KEY, `role` ENUM("tenant", "admin") NOT NULL, `password` VARCHAR(255) NOT NULL, `username` VARCHAR(255) NOT NULL)';

    const requestsTableQuery = 'CREATE TABLE IF NOT EXISTS `requests` (`id` INT AUTO_INCREMENT PRIMARY KEY, `description` VARCHAR(510) NOT NULL, `category` varchar(255) NOT NULL, `priority` ENUM("low", "medium", "high") NOT NULL, `status` ENUM("new", "in_progress", "completed") NOT NULL, `date` VARCHAR(255) NOT NULL, `files` JSON, `comments` JSON)';

    db.query(schemaQuery, (err) => {
      if (err) return console.log(err.message);
      console.log("schema created");

      db.query(usersTableQuery, (err) => {
        if (err) return console.log(err.message);
        console.log("users table created");
      });

      db.query(requestsTableQuery, (err) => {
        if (err) return console.log(err.message);
        console.log("requests table created");
      })
    });

    console.log(`Server is running on port ${PORT}`);
  });
});
