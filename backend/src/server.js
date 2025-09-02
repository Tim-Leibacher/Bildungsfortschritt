import express from "express";
import cors from "cors"
import dotenv from "dotenv";

import notesRoutes from "./routes/notesRoutes.js"
import { connectDB } from "../config/db.js";
import rateLimiter from "../middleware/rateLimiter.js";

dotenv.config();

const app = express();

//middleware
app.use(cors({
    origin:"http://localhost:5173",
}))
app.use(express.json());  //will parse the JSON bodies: req.body
app.use(rateLimiter);


app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use("/api/notes", notesRoutes);


connectDB().then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
});




