const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

require("dotenv").config();

const app = express();
app.use(express.static("public"));
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
    extended: true
}));


app.set('view engine', 'ejs');

const url = process.env.MONGO_URL;

mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
})


const noteSchema = new mongoose.Schema({
    title: String,
    content: String
})

const note = mongoose.model("notes", noteSchema);


// let Felix = {};

let matchArray = [];

app.get("/", (req, res) => {
    note.find({}, (err, foundNotes) => {
        if (!err) {
            res.render("home", {
                Felix: foundNotes,
                Match: JSON.stringify(matchArray)
            });
        }
    })
})



app.post("/search", (req, res) => {
    const substring = _.toLower(req.body.search);
    matchArray = [];
    note.find({}, (err, foundNotes) => {
        if (!err) {
            for (const note of foundNotes) {
                if (_.toLower(note.title).includes(substring) || _.toLower(note.content).includes(substring)) {
                    if (matchArray.indexOf(note._id) === -1) {
                        matchArray.push(note._id);
                    }
                }
            }
            res.redirect("/");
        }
    })
})


app.post("/", (req, res) => {
    let event = req.body.event;
    let description = req.body.description;

    let paragraph = new note({
        title: event,
        content: description
    });
    // let pair = {[event]: description};
    if (event || description) {
        paragraph.save();
        res.redirect("/");
    } else {
        res.send("PLEASE ENTER SOMETHING");
    }
})

app.post("/cat", (req, res) => {
    note.deleteOne({
        _id: req.body.ID
    }, () => {
        res.redirect("/");
    })
})

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, () => {
    console.log("Online successfully!")
})