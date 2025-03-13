import express from "express"
import pg from "pg"

const app = express();
const port = 3000;


// middleware
app.use(express.urlencoded({extended: true}))//to make the body accessible
app.use(express.static('public'));//to make everything in the public folder accessible

// database
const bd = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "DesignHive",
    password: "1234",
    port: 5432,
})

// Log in
app.get('/', (req, res) => {
    res.render("index.ejs")
})
app.post('/feed', (req, res) => {
    res.redirect("/feed");
})

// Feed

// Account

// New Post


app.listen(port, () => {
    console.log("The server is running:)")
})