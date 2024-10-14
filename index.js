import express from "express";
import 'dotenv/config';
import pg from "pg";
import bodyParser from "body-parser";

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    password: process.env.dbPassword,
    database: "book_notes",
    port: 5432
});

db.connect();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded( {extended: true} ));
app.use(express.static("public"));

// DB functions
async function getBooks(){
    const result = await db.query("SELECT * FROM books;");
    return result.rows;
}

async function getBook(id) {
    const result = await db.query("SELECT * FROM books b WHERE b.id = $1;", [id]);
    return result.rows[0];
}

// Route handlers
app.get("/", async (req, res) => {
    const books = await getBooks();
    res.render("index.ejs", {books: books});
    console.log(books);
});

app.get("/add", (req, res) => {
    res.render("add.ejs");
});

app.get("/book/:id", async (req, res) => {
    const bookId = req.params.id;
    const book = await getBook(req.params.id);
    res.render("book.ejs", {book: book});
});

app.get("/addNote", (req, res) => {
    res.render("addNote.ejs");
});

app.listen(port, () => {
    console.log("Server running at port " + port);
});