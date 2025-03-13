import express from "express"
import pg from "pg"
import session from "express-session";

const app = express();
const port = 3000;


// middleware
app.use(express.urlencoded({extended: true}))//to make req.body accessible
app.use(express.static('public'));//to make everything in the public folder accessible
app.use(session({
    secret: 'design_hive',
    resave: false,
    saveUninitialized: true,
}))

// database
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "DesignHive",
    password: "1234",
    port: 5432,
})
db.connect();

// Log in
app.get('/', (req, res) => {
    res.render("index.ejs");    
    console.log(req.session);
})
app.post('/', async (req, res) => {
    const { username, password } = req.body;//user's input
    console.log(`username input: ${username}, password input: ${password}`);
    const userQueryResult = await db.query("SELECT * FROM users WHERE user_name=$1", [username]);//query data from username input
    console.log(userQueryResult.rows);

    if(password == userQueryResult.rows[0].password){
        console.log("success")
        res.redirect("/feed");
    } else {
        res.render("index.ejs", {errorMessage: "Invalid username or password. Please try again."})
    }
})

// Feed

// Account

// New Post


app.listen(port, () => {
    console.log("The server is running:)")
})