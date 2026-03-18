const express = require("express");
const axios = require("axios");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public")); // Serve frontend

// MongoDB connection
mongoose
  .connect("mongodb://127.0.0.1:27017/weatherDB")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Schema
const historySchema = new mongoose.Schema({
  city: String,
  date: { type: Date, default: Date.now },
});

const History = mongoose.model("History", historySchema);

// ✅ Correct API Key
const API_KEY = "246c5972d37205572b347da61dfc82fa";

// ---------------- ROUTES ---------------- //

// Root (optional but helpful)
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// 🌤 Current Weather
app.get("/weather/:city", async (req, res) => {
  try {
    const city = req.params.city;

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`,
    );

    await History.create({ city });

    res.json(response.data);
  } catch (err) {
    console.log(err.response?.data);
    res.status(500).json({ message: "City not found" });
  }
});

// 🌦 5-Day Forecast
app.get("/forecast/:city", async (req, res) => {
  try {
    const city = req.params.city;

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`,
    );

    res.json(response.data);
  } catch (err) {
    console.log(err.response?.data);
    res.status(500).json({ message: "Forecast not available" });
  }
});

// 📜 Get History
app.get("/history", async (req, res) => {
  const history = await History.find().sort({ date: -1 }).limit(10);
  res.json(history);
});

// ❌ Delete History
app.delete("/history/:id", async (req, res) => {
  await History.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// 🚀 Start Server (ALWAYS LAST)
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Schema for Contact Messages
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  date: { type: Date, default: Date.now },
});
const Contact = mongoose.model("Contact", contactSchema);

// POST Contact Form
app.post("/api/contact", async (req, res) => {
    try {
        const { name, email, message } = req.body;
        const newMessage = new Contact({ name, email, message });
        await newMessage.save();
        res.json({ message: "Message sent successfully!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});