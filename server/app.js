import express from "express";
import cors from "cors";
import route from "./routes/route.js";
import cookiesParser from "cookie-parser";
import dotenv from "dotenv";
import { transporter } from "./config/mailer.js";

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

app.get("/api/smtp-test", async (req, res) => {
  try {
    await transporter.verify();
    res.send("SMTP OK");
  } catch (err) {
    console.error("SMTP verify error:", err);
    res.status(500).json({
      message: err.message || "SMTP connection failed",
      error: err
    });
  }
});

app.get("/smtp-test", async (req, res) => {
  try {
    await transporter.verify();
    res.send("SMTP OK");
  } catch (err) {
    console.error("SMTP verify error:", err);
    res.status(500).json({
      message: err.message || "SMTP connection failed",
      error: err
    });
  }
});

app.use("/api", route);

export default app;