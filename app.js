//Requiring necessary modules
const req = require("request"),
    express = require("express"),
    bodyParser = require("body-parser"),
    fileupload = require("express-fileupload"),
    Clarifai = require('clarifai'),
    request = require("request"),
    cloudinary = require("cloudinary").v2
    //required variables
let url, query = '',
    data, searchResults //for storing the url
    //configuring app
const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))
app.set("view engine", "ejs")
    //cloudinary and express file upload cofig for file upload
app.use(fileupload({
    useTempFiles: true,
    limits: { fileSize: 10485760 }
}))
cloudinary.config({
        cloud_name: 'dkqw2oklp',
        api_key: '393525635444256',
        api_secret: 'GZiAOYYY-r1K6P4CBh8ITE9FSd4'
    })
    // Instantiate a new Clarifai app by passing in your API key.
const imageProcessor = new Clarifai.App({ apiKey: '54ec7972d2c6440e8724a5da3e942b21' });
//initializing the port
let PORT = process.env.PORT || 3000
    //Landing Page Route
app.get("/", (req, res) => {
        res.render("landing")
    })
    //Form Routes
app.get("/form", (req, res) => {
        res.render("form")
    })
    //form image url post route
app.post("/form/url", nullQuery, (req, res) => {

        url = req.body.url
        imageProcessor.models.predict(Clarifai.GENERAL_MODEL, url)
            .then(response => {
                for (var i = 0; i < response.rawData.outputs[0].data.concepts.length; i++) {
                    console.log(response.rawData.outputs[0].data.concepts[i].name);
                    if (i < 6) {
                        query += response.rawData.outputs[0].data.concepts[i].name + "+"
                    }
                }
                data = response
                query = query.substring(0, query.length - 1);
                query = spaceToplus(query)
                console.log(query)
                res.redirect("/showAllResults")
            })
            .catch(err => {
                res.redirect("back")
                console.log(err);
            });
    })
    //form image upload route
app.post("/form/img", nullQuery, (req, res) => {


        var file = req.files.image
        cloudinary.uploader.upload(file.tempFilePath, (err, result) => {
            if (err) {
                console.log(err);
                res.redirect("back")
            } else {
                url = result.secure_url
                imageProcessor.models.predict(Clarifai.GENERAL_MODEL, url)
                    .then(response => {
                        for (var i = 0; i < response.rawData.outputs[0].data.concepts.length; i++) {
                            console.log(response.rawData.outputs[0].data.concepts[i].name);
                            if (i < 6) {
                                query += response.rawData.outputs[0].data.concepts[i].name + "+"
                            }
                        }
                        data = response
                        query = query.substring(0, query.length - 1);
                        query = spaceToplus(query)
                        console.log(query)
                        res.redirect("/showAllResults")
                    })
                    .catch(err => {
                        res.redirect("back")
                        console.log(err);
                    });


            }

        })

    })
    //show route
app.get("/showAllResults", checkData, (req, res) => {

        var imgurl = "https://pixabay.com/api/?key=16586857-850dcbf890ffd20bd9d88f5de&q=" + query
        request(imgurl, function(error, response, body) {
            if (error) {
                console.log(error);
                res.redirect("/form")
            } else {
                if (response.statusCode == 200) {
                    var imgdata = JSON.parse(body)
                    if (imgdata.totalHits < 3 && query.split("+").length - 1 > 3) {
                        query = ""
                        for (var i = 0; i < data.rawData.outputs[0].data.concepts.length; i++) {
                            if (i < 3) {
                                query += data.rawData.outputs[0].data.concepts[i].name + "+"
                            }
                        }
                        query = query.substring(0, query.length - 1);
                        query = spaceToplus(query)
                        console.log(query);
                        res.redirect("/showAllResults")

                    } else {
                        console.log(imgdata);
                        res.render("show", { url: url, response: data, imgdata: imgdata })
                    }

                }
            }
        })

    })
    //functions

function nullQuery(req, res, next) {
    query = ""
    next()
}

function checkData(req, res, next) {
    if (data == undefined) {
        res.redirect("/form")
    } else {
        next()
    }
}

function spaceToplus(word) {
    var res = word.replace(/ /g, "+");

    return res;
}
app.listen(PORT, () => console.log(`Server started on port ${PORT}`))