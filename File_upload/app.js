const express = require("express")
const app = express()
const router = require("./router")

app.set('view engine', 'ejs');
app.use('/file',router)

app.listen(5000, () => {
    console.log("Server running at 5000")
})