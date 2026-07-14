import express from "express";
import cors from "cors";
import route from "./routes/route.js";
import cookiesParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();
const app = express();
app.set("trust proxy", 1);


app.use(cors(
    {
        credentials: true,
        origin: [process.env.CLIENT_URL, "http://localhost:5173"].filter(Boolean),
    }
));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookiesParser());



app.get("/api/health", (req, res) => {
    res.json({ message: "OK" });
});

app.use("/api", route);

export default app;