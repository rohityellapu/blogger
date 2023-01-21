const app = require('express')();

require('dotenv').config()
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const path = require('path');
// parse application/json

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const ejsMate = require('ejs-mate')
const mysql = require('mysql');


app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

var con = mysql.createConnection({
    host: "database-2.conyko6usosg.us-east-1.rds.amazonaws.com",
    user: process.env.MASTER_USER,
    password: process.env.MASTER_PASSWORD,
    database: "blogger"
});


con.connect((err) => {
    if (err) return console.log(err);
    console.log("Connected!");
});


app.get('/', async (req, res) => {
    let sqlQuery = "SELECT * FROM blogs";
    con.query(sqlQuery, (err, response) => {
        if (err) {
            console.log(err.message);
            res.status(400).end(err.message);
        }
        else {
            console.log(response);
            res.json({
                response
            })
        }
    })
})

app.post('/blog', (req, res) => {
    const { title, description } = req.body;
    let sqlQuery = `INSERT INTO blogs (title, description) VALUES (?, ?)`
    con.query(sqlQuery, [title, description], (err, response) => {
        if (err) {
            console.log(err.message);
            res.status(400).end(err.message);
        }
        else {
            console.log(response);
            res.json({
                response
            })
        }
    })

})

app.put('/blog/:id', (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    let sqlQuery = `UPDATE blogs SET title = '${title}', description = '${description}' WHERE id = ${id};`
    res.json({ title, description, id, sqlQuery })
})

app.delete('/blog/:id', (req, res) => {
    const { id } = req.params;
    let sqlQuery = `DELETE FROM blogs WHERE id=${id};`
    res.json({ id, sqlQuery })
})

app.listen(PORT, () => console.log('Server is on PORT', PORT));