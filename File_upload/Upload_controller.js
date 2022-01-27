// Code adapted from youtube - @ Sam Meech-Ward
// @youtube https://www.youtube.com/watch?v=NZElg91l_ms
// @github https://github.com/Sam-Meech-Ward/image-upload-s3
// @author Mohak Vaswani

const fs = require('fs')
const util = require('util')
const unlinkFile = util.promisify(fs.unlink)
const multer = require("multer")
const upload = multer({dest : "server_uploads/"})

const {uploadFile, getFileStream, DeleteFile} = require("./s3")

const Upload_File = (async (req,res,next)=>{
    try{    
        const file = req.file
        const result = await uploadFile(file)
        await unlinkFile(file.path)
        console.log(result)
        res.redirect("/")
    }catch(e){
        console.log(e)
        res.status(400).json({"error" : "Error, cannot upload file"})
    }
})

const Delete_File = (async (req,res,next)=>{
    try{
        key = req.params.key
        await DeleteFile(key)
        res.send("File successfully deleted")
    }catch(e){
        console.log(e)
        res.status(400).json({"error" : "Error, cannot delete file"})
    }
})

const Display_File = ((req,res,next)=>{
    try{
        const key = req.params.key
        const readStream = getFileStream(key)
        readStream.pipe(res)
    }catch(e){
        console.log(e)
        res.status(400).json({"error" : "Error, cannot display file"})
    }
    
})

module.exports = {
    Upload_File,
    Delete_File,
    Display_File
}