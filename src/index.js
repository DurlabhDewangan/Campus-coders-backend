import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path:'./.env'
})

const PORT = process.env.PORT ;
console.log(PORT)

connectDB()
.then(() =>   {
    app.on("error", (error) => {
        console.log("🔥 SERVER ERROR CAUGHT 🔥");
        console.log(error.message);
        throw error
    })
    app.listen(PORT, () =>{
        console.log(`Sever is running at port : ${PORT}`);
    })
})
.catch(( err ) => {
    console.log("mongo db connection failed!", err)
})