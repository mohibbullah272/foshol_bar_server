import cors from "cors";
import express from "express";
import compression from 'compression';

const app = express();


app.use(cors()); 
app.use(compression()); 
app.use(express.json()); 

app.use(cors());




app.get("/", (_req, res) => {
  res.send("API is running");
});



app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

export default app;
