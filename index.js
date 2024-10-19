import express from "express";
import 'dotenv/config';
import pg from "pg";
import bodyParser from "body-parser";
import axios from "axios";
import methodOverride from 'method-override';

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

app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded( {extended: true} ));
app.use(express.static("public"));

// DB and API functions
async function getBooks(){

    try {
        const result = await db.query("SELECT * FROM books ORDER BY id desc;");
        return result.rows;
    } catch (error) {
        console.error("Error executing sql query for books." + error.stack);
    }

}

async function getBook(id) {

    try {
        const result = await db.query("SELECT * FROM books b WHERE b.id = $1;", [id]);
        return result.rows[0];
    } catch (error) {
        console.error("Error executing sql query for book." + error.stack);
    }

}

async function addBook(isbn) {

    try {
        // Fetching book data from api
        const response = await axios.get("https://www.googleapis.com/books/v1/volumes?q=isbn:" + isbn);
        
        if(response.data && response.data.items) {
            const bookData = response.data.items.map(item => {
                return {
                    isbn: item.volumeInfo.industryIdentifiers[1].identifier || "No isbn available",
                    bookTitle: item.volumeInfo.title || "No title available",
                    author: item.volumeInfo.authors.join(', ') || "No authors available",
            
                    cover_url: item.volumeInfo.imageLinks?.thumbnail || 
                    item.volumeInfo.imageLinks?.smallThumbnail || 
                    "https://books.google.cz/googlebooks/images/no_cover_thumb.gif",
        
                    published: item.volumeInfo.publishedDate || "unknown",
                    page_count: item.volumeInfo.pageCount || "unknown",
                    categories: item.volumeInfo.categories?.join(', ') || "unknown"
                }
            });

            // Adding the book into db
            try {
                db.query("INSERT INTO books(isbn, book_title, author, cover_url, published, page_count, categories)VALUES($1, $2, $3, $4, $5, $6, $7);", 
                    [bookData[0].isbn, bookData[0].bookTitle, bookData[0].author, bookData[0].cover_url, bookData[0].published, bookData[0].page_count, bookData[0].categories]);
            } catch (error) {
                console.error("Error inseting API data into database. " + error.stack);
            }

        } else {
            console.log("No books found for the provided ISBN");
        }

    } catch (error) {
        console.error("Error fetching data from book api with isbn." + error.stack);
    }

}

async function deleteBook(id) {

    try {
        await db.query("DELETE FROM notes WHERE notes.book_id = $1;", [id]);
        await db.query("DELETE FROM books WHERE books.id = $1;", [id]);
        
        return(`Successfully delete book with id ${id}`);
    } catch (error) {
        console.error("Error executing sql query deletin book." + error.stack);
    }

}

async function getNotes(bookId) {

    try {
        const result = await db.query("SELECT * FROM notes WHERE book_id = $1 ORDER BY id desc;", [bookId]);
        return result.rows;
    } catch (error) {
        console.error("Error executing sql query for book notes." + error.stack);
    }
    
}

async function getNote(id) {

    try {
        const result = await db.query("SELECT * FROM notes WHERE id = $1;", [id]);
        return result.rows;
    } catch (error) {
        console.error("Error executing sql query for book note." + error.stack);
    }
    
}

async function addNote(note, bookId) {

    try {
        const result = await db.query("INSERT INTO notes(book_id, note_text) VALUES($1, $2);", [bookId, note]);
        console.log("Note successfully added.");
    } catch (error) {
        console.error("Error executing sql query for book notes." + error.stack);
    }

}

async function deleteNote(id) {

    try {
        await db.query("DELETE FROM notes WHERE notes.id = $1;", [id]);
        
        return(`Successfully deleted note with id ${id}`);
    } catch (error) {
        console.error("Error executing sql query deleting note." + error.stack);
    }

}

async function updateNote(text, id) {

    try {
        await db.query("UPDATE notes SET note_text = $1 WHERE id = $2;", [text, id]);
        
        return(`Successfully updated note with id ${id}`);
    } catch (error) {
        console.error("Error executing sql query updating note." + error.stack);
    }

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

app.post("/add", async (req, res) => {
    const isbn = req.body.isbn;
    let result = await addBook(isbn);
    console.log(result);
    res.redirect("/");
});

app.get("/book/:id", async (req, res) => {
    const bookId = req.params.id;
    const book = await getBook(bookId);
    const notes = await getNotes(bookId);
    res.render("book.ejs", {book: book, notes: notes});
});

app.get("/addNote/book/:id", (req, res) => {
    const bookId = req.params.id;
    res.render("addNote.ejs", {bookId: bookId});
});

app.post("/addNote", async (req, res) => {
    const bookId = req.body.bookId;
    const note = req.body.note;
    await addNote(note, bookId);

    res.redirect("/book/" + bookId + "?");
});

app.post("/delete/book/:id", async (req, res) => {
    const bookId = req.params.id;
    await deleteBook(bookId);
    
    res.redirect("/");
});

app.post("/delete/note/:id", async (req, res) => {
    const noteId = req.params.id;
    const bookId = req.body.bookId;
    await deleteNote(noteId);

    res.redirect(`/book/${bookId}?`);
});

app.get("/update/note/:id", async (req, res) => {
    const noteId = req.params.id;
    const bookId = req.query.bookId;
    const note = await getNote(noteId);

    res.render("editNote.ejs", {bookId: bookId, note: note[0]});
});

app.post("/update/note/:id", async (req, res) => {
    const noteId = req.params.id;
    const bookId = req.body.bookId;
    const text = req.body.note;

    await updateNote(text, noteId);

    res.redirect(`/book/${bookId}?`);
});

app.listen(port, () => {
    console.log("Server running at port " + port);
});