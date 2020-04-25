// server.js
// where your node app starts

// init project
const express = require("express");
// const cors = require('cors');
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const csv = require("csv-parser");
const fastcsv = require("fast-csv");

// const corsOptz = {
//   origin: 'https://descriptive-seederglitch.me',
//   optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// }

// app.use(cors(corsOptz))
// app.options('*', cors(corsOptz))

const upload = multer({
  storage: multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, "/tmp");
    },
    filename: function(req, file, cb) {
      cb(null, Date.now() + "_" + file.originalname);
    }
  }),
  fileFilter: function(req, file, cb) {
    const filetypes = /csv/;
    // const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    if (!extname) {
      req.fileValidationError = "Error: upload only supports .csv files!";
      return cb(null, false, new Error(req.fileValidationError));
    }
    return cb(null, true);
  }
});

app.use(express.static("public"));

app.get("/", function(request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

app.post(
  "/test",
  upload.fields([
    { name: "filea", maxCount: 1 },
    { name: "fileb", maxCount: 1 }
  ]),
  function(req, res, next) {
    if (req.fileValidationError) {
      res.send(req.fileValidationError);
    } else {
      // console.log("req.files:", req.files);
      console.log("filea:", req.files["filea"][0].path);
      console.log("fileb:", req.files["fileb"][0].path);

      parseFiles(req.files["filea"][0].path, req.files["fileb"][0].path, res);
    }
  }
);

function parseFiles(filea, fileb, res) {
  console.log("gonna parse filea:", filea);

  let colKeys = [];

  fs.createReadStream(filea)
    .pipe(
      csv({
        mapValues: ({ header, index, value }) => value.trim()
      })
    )
    .on("data", row => {
      colKeys.push(Object.values(row)[0]);
    })
    .on("end", () => {
      fs.unlinkSync(filea);
      parseFileB(colKeys, fileb, res);
    })
    .on("error", console.warn);
}

function parseFileB(colKeys, fileb, res) {
  let data = {
    headers: [],
    body: []
  };

  fs.createReadStream(fileb)
    .pipe(
      csv({
        mapHeaders: ({ header, index }) => data.headers.push(header),
        mapValues: ({ header, index, value }) => value.trim()
      })
    )
    .on("data", row => {
      if (colKeys.includes(row["1"])) {
        data.body.push(Object.values(row));
      }
    })
    .on("end", () => {
      fs.unlinkSync(fileb);
      writeFile(data, res);
    })
    .on("error", console.warn);
}

function writeFile(data, res) {
  res.setHeader("Content-disposition", "attachment; filename=out.csv");
  res.set("Content-Type", "text/csv");
  res.status(200);
  fastcsv.write([data.headers, ...data.body]).pipe(res);
}

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
