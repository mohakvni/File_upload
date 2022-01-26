// Code adapted from youtube - @Traversy Media
// @youtube https://www.youtube.com/watch?v=3f5Q9wDePzY
// @github https://github.com/bradtraversy/mongo_file_uploads
// @author Mohak Vaswani

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const {GridFsStorage} = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');

const app = express();

// Middleware
app.use(bodyParser.json());
//app.use(methodOverride('_method'));
app.set('view engine', 'ejs');

// Mongo URI
const mongoURI = 'mongodb+srv://Mohak:trial123@cluster0.1divz.mongodb.net/Cluster0?retryWrites=true&w=majority';

// Create mongo connection
const conn = mongoose.createConnection(mongoURI);

//Init gfs
let gfs, gridfsBucket;
conn.once('open', () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: "uploads"
    })

    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});


// Create storage engine
// Here we store the files in 16 bit character with extension
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage });

//render home page from view engine
app.get('/', (req, res)=>{
    res.render('index')
})

// @route POST /upload
// @desc  Uploads file to DB
app.post('/upload', upload.single('file'), (req, res) => {
    // res.json({ file: req.file });
    res.redirect('/');
  });


// @route GET /files/:filename
// @desc return the information of the file using json format
app.get('/files/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
      // Check if file
      if (!file || file.length === 0) {
        return res.status(404).json({
          err: 'No file exists'
        });
      }
      // File exists
      return res.json(file);
    });
});


// @route GET /display/:filename
// @desc display the file name on the browser
app.get('/display/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }

    try{
      const readstream = gridfsBucket.openDownloadStream(file._id)
      readstream.pipe(res);
    }catch{
      res.status(404).json({
        err: 'Not an image'
      });
    }
  });
});

// @route GET /files
// @desc display the info of all files as an array of json files
app.get('/files', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: 'No files exist'
      });
    }
  
    // Files exist
    return res.json(files);
  });
});


// @route DELETE /delete/:filename
// @desc delete the file from database
app.delete("/delete/:filename", (req,res)=>{
  gfs.files.findOne({ filename : req.params.filename}, (err,file)=>{
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }
    gridfsBucket.delete(file._id)
  })
})

const port = 5000
app.listen(port, ()=>{
    console.log(`server started on port ${port}`)
})