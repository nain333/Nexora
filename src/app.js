import express from "express";
const app = express();
// bootstrap route
app.use(express.json())
app.get("/",(req,res)=>res.json({
    "status": "ok",
    "message": "welcome to Nexora"
}))
export default app;