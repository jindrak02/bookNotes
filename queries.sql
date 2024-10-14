--Books
CREATE TABLE books(
	id SERIAL PRIMARY KEY,
	isbn varchar NOT NULL,
	book_title VARCHAR,
	author VARCHAR,
	cover_url VARCHAR,
	published INT,
	page_count INT,
	categories VARCHAR
);

INSERT INTO books(isbn, book_title, author, cover_url, published, page_count, categories)
VALUES('9780439064866', 'Harry Potter and the Chamber of Secrets', 'J. K. Rowling', 'http://books.google.com/books/content?id=Bikg274Y4Q0C&printsec=frontcover&img=1&zoom=5&source=gbs_api', 1999, 364, 'Juvenile Fiction');

SELECT * FROM books;

--Notes
CREATE TABLE notes(
	id SERIAL PRIMARY KEY,
	book_id INT NOT NULL,
	note_text VARCHAR NOT NULL,
	
	FOREIGN KEY(book_id) REFERENCES books(id)
);

INSERT INTO notes(book_id, note_text)
VALUES(1, 'Dont uderestimate little student of Griffindor!');

SELECT * FROM notes;

--Joined
SELECT * FROM books b
LEFT JOIN notes n on b.id = n.book_id;