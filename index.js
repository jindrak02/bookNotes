import express from "express";

const app = express();
const port = 3000;

app.use(express.static("public"));

let books = [
    {bookISBN: "12BJ23", bookId: 1, bookTitle: "Harry Potter and the philospohers stone", bookAuthor: "J.K. Rowling", bookCover: "https://books.google.com/books/content?id=gW36ngEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api"},
    {bookISBN: "12BJ23", bookId: 3, bookTitle: "Harry Potter and the Chamber of Secrets", bookAuthor: "J.K. Rowling", bookCover: "http://books.google.com/books/content?id=Bikg274Y4Q0C&printsec=frontcover&img=1&zoom=1&source=gbs_api"}
]

app.get("/", (req, res) => {
    res.render("index.ejs", {books: books});
});

app.get("/add", (req, res) => {
    res.render("add.ejs");
});

app.get("/book?:id", (req, res) => {
    res.render("book.ejs");
});

app.get("/addNote", (req, res) => {
    res.render("addNote.ejs");
});

app.listen(port, () => {
    console.log("Server running at port " + port);
});