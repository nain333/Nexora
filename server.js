import envConfig from "./src/config/env.config.js"
import app from "./src/app.js"
const port = envConfig.port 

app.listen(port,()=>{
    console.log(`The app is listening at port : ${port}`)
})
