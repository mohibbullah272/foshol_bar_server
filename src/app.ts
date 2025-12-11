import cors from "cors";
import express from "express";
import compression from 'compression';
import router from "./routes";
import cookieParser from "cookie-parser";
const app = express();


app.use(cors()); 
app.use(compression()); 
app.use(express.json()); 
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1',router)
app.use(cors({
  origin: ["http://localhost:3000","https://foshol-bari-client.vercel.app"," http://192.168.0.202:3000","https://fosholbari-client-v0-2-rft1.vercel.app"], // frontend origin
  
  credentials: true, // 👈 allow cookies
}));


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
