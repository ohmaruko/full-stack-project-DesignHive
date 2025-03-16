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
})
app.post('/', async (req, res) => {
    const { username, password } = req.body;//user's input
    console.log(`username input: ${username}, password input: ${password}`);
    const userQueryResult = await db.query("SELECT * FROM users WHERE user_name=$1", [username]);//query data from username input
    // console.log(userQueryResult.rows);

    if(userQueryResult.rows.length > 0 && password == userQueryResult.rows[0].password){
        console.log("logged in successfuly")
        // set current user's user_id to the current session below
        // so req.session.userId is accessible across the app:]
        req.session.userId = userQueryResult.rows[0].user_id;
        res.redirect("/feed");
    } else {
        res.render("index.ejs", {errorMessage: "Invalid username or password. Please try again."})
    }
})

// Feed
app.get('/feed', async (req, res) => {
    try {
        const posts = await db.query("SELECT posts.post_id, posts.content, users.user_name FROM posts, users");
        res.render('feed.ejs', { posts: posts.rows });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).send("Server Error");
    }
});


// Account

// New Post

app.get('/newPost', async (req, res) => {
    const userId = req.session.userId;
    const userQueryResult = await db.query("SELECT * FROM users WHERE user_id=$1", [userId]);
    req.session.emoji = userQueryResult.rows[0].personal_emoji;
    const userEmoji = req.session.emoji;
    console.log(`user id: ${userId}, emoji: ${userEmoji}`);
    res.render('newPost.ejs', {userEmoji: userEmoji});

})

app.post('/feed', async (req, res) => {
    const user = req.session.userId;
    const result = await db.query("SELECT user_id FROM users WHERE user_id=$1", [user]);

    if (!req.session.userId) {
        return res.redirect('/');
    }

    const { postContent } = req.body;
    console.log(`post: ${postContent}`);
    
    if (!postContent.trim()) {
        return res.render('newPost.ejs', { errorMessage: "Post cannot be empty" });
    }

    try {
        await db.query("INSERT INTO posts (content, user_id) VALUES ($1, $2)", [postContent, req.session.userId]);
        res.redirect('/feed');
    } catch (error) {
        console.error("Error inserting post:", error);
        res.status(500).send("Server Error");
    }
});



app.listen(port, () => {
    console.log("The server is running:)")
})