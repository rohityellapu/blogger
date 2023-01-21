const express = require('express');;
const app = express();
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate')
const mysql = require('mysql');

// parse application/json
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// Set ejs engine for rendering ejs pages at client side
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');

// Set all html/ejs view files in views directory
app.set('views', path.join(__dirname, 'views'))

// Method override for getting put,delete methods from client form
app.use(methodOverride('_method'));

// Set static js and css files in public directory
app.use(express.static(path.join(__dirname, 'public')))

// Connect the database
var con = mysql.createConnection({
    host: "database-2.conyko6usosg.us-east-1.rds.amazonaws.com",
    user: process.env.MASTER_USER,
    password: process.env.MASTER_PASSWORD,
    database: "blogger"
});

// Ensure Databas connection
con.connect((err) => {
    if (err) return console.log(err);
    console.log("Database Connected!");
})

// Home route sending all blogs from database
app.get('/', async (req, res) => {
    let sqlQuery = "SELECT * FROM blogs ORDER BY updated_at DESC";
    con.query(sqlQuery, (err, response) => {
        if (err) {
            res.status(400).render('err.ejs', { err: err.message })
        }
        else {
            res.render('index.ejs', { blogs: response })
        }
    })
})


// For adding new blog to databas
app.post('/blog', (req, res) => {
    const { title, description } = req.body;
    // Check for required fields for adding on database
    if (!title || !description) {
        res.status(400).render('err.ejs', { err: "Enter all fields" })
    } else {
        let sqlQuery = `INSERT INTO blogs (title, description) VALUES (?, ?)`
        con.query(sqlQuery, [title, description], (err, response) => {
            if (err) {
                res.status(400).render('err.ejs', { err: err.message })
            }
            else {
                res.redirect('/');
            }
        })
    }

})

app.put('/blog/:id', (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    // Check for id and fields for updation
    if (!title || !description || !id) {
        res.status(400).render('err.ejs', { err: "Required fields are missing." })
    }
    else {
        let sqlQuery = `UPDATE blogs SET title = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?;`
        con.query(sqlQuery, [title, description, id], (err, response) => {
            if (err) {
                res.status(400).render('err.ejs', { err: err.message })
            }
            else {
                res.redirect('/');
            }
        })

    }
})

app.delete('/blog/:id', (req, res) => {
    const { id } = req.params;
    // Check for id
    if (!id) {
        res.status(400).render('err.ejs', { err: "Required fields are missing." })
    }
    else {
        let sqlQuery = `DELETE FROM blogs WHERE id = ?;`
        con.query(sqlQuery, [id], (err, response) => {
            if (err) {
                res.status(400).render('err.ejs', { err: err.message })
            }
            else {
                res.redirect('/');
            }
        })
    }
})

// Handle error for undefined routes
app.get('/*', (req, res) => {
    res.status(404).render('err.ejs', { err: "Page Not Found" })
})

app.listen(PORT, () => console.log('Server is on PORT', PORT));

