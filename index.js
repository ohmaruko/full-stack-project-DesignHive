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

// log out
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
})

// Feed
app.get('/feed', async (req, res) => {
    try {
        // Fetch posts with corresponding user details
        const result = await db.query(`
            SELECT posts.post_id, posts.content, users.user_name, users.personal_emoji
            FROM posts
            JOIN users ON users.user_id = posts.user_id
        `);
        res.render('feed.ejs', { posts: [...result.rows].reverse() });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).send("Server Error");
    }
});


// Account
app.get('/account', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/'); // Redirect if not logged in
    }

    try {
        const userId = req.session.userId;

        // Fetch user details
        const result = await db.query("SELECT user_name, personal_emoji, bio, password FROM users WHERE user_id = $1", [userId]);
        const user = result.rows[0];

        if (!user) {
            return res.redirect('/');
        }

        // Fetch posts created by the user
        const postsResult = await db.query("SELECT post_id, content FROM posts WHERE user_id = $1", [userId]);
        const posts = postsResult.rows || []; 

        // Render the account page with user and posts data
        res.render('account.ejs', { user, posts });
    } catch (error) {
        console.error("Error fetching account details:", error);
        res.status(500).send("Internal Server Error");
    }
});


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

    const postResult = await db.query("SELECT COUNT(*) AS count FROM posts");

    try {
        if (Array.isArray(postResult.rows) && postResult.rows.length > 0) {
        const currentPostNumber = Number(postResult.rows[0].count); 
        const postNumber = currentPostNumber + 1;

        console.log(postNumber); 
        await db.query("INSERT INTO posts (post_id, content, user_id) VALUES ($1, $2, $3)", [postNumber, postContent, req.session.userId]);
        res.redirect('/feed');
    } else {
    throw new Error("Failed to fetch post count from the database.");
}
    } catch (error) {
        console.error("Error inserting post:", error);
        res.status(500).send("Server Error");
    }
});



app.listen(port, () => {
    console.log("The server is running:)")
})