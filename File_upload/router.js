const express = require("express")
const router = express.Router()
const multer = require("multer")
const upload = multer({storage : "./server_uploads"})
const {Upload_File, Delete_File, Display_File} = require("./Upload_controller")


router.get("/", (req,res,next)=>{
    res.render('index')
})

router.post('/images', upload.single("file"), Upload_File)

router.get('/images/:key', Display_File)

router.delete('/delete/:key', Delete_File)

module.exports =  router