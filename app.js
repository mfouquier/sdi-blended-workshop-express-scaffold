const express = require('express');
const cookieParser = require('cookie-parser');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');
const port = 3001;
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors())
// GET ALL BOOKS
app.get('/books', (req, res) => {
  let allBookData = parse(fs.readFileSync('./dummy.csv').toString(), { columns: true });
  res.status(200).send(allBookData)
});

// POST NEW BOOK OBJECT
app.post('/books', (req, res) => {
  let allBookData = parse(fs.readFileSync('./dummy.csv').toString(), { columns: true })
  let newId = allBookData.length + 1;
  const book = []

  const { title, author, cover, genres, synopsis } = req.body;
  const newBook = {
    id: newId,
    title,
    author,
    cover,
    genres,
    synopsis
  }

  allBookData.push(newBook);
  book.push(newBook);

  writeAllBooks(allBookData)
  writeOneBook(book, newId)
  res.status(200).send(allBookData);
})

// GET SPECIFIC BOOK
app.get('/books/:id', (req, res) => {
  const currentBookId = req.params.id;
  let currentBook = parse(fs.readFileSync(`./data/${currentBookId}.csv`).toString(), { columns: true });
  res.status(200).send(currentBook)
});

// PATCH UPDATE BOOK
app.patch('/books/:id', (req, res) => {
  var { id } = req.params;
  let allBookData = parse(fs.readFileSync('./dummy.csv').toString(), { columns: true });
  let currentBook = parse(fs.readFileSync(`./data/${id}.csv`).toString(), { columns: true });
  let paramsObj = req.body;

  for (element in paramsObj) {
    if (paramsObj[element] !== undefined) {
      currentBook.forEach((book, index) => {
        if (book.id == id) currentBook[index][element] = paramsObj[element]
      });
      allBookData.forEach((book, index) => {
        if (book.id == id) allBookData[index][element] = paramsObj[element];
      });
    }
  }
  var justAdded = allBookData.find(book => book.id == id);

  writeAllBooks(allBookData)
  writeOneBook(currentBook, id)

  res.send([justAdded, currentBook]);
})


// DELETE BOOK
app.delete('/books/:id', (req, res) => {
  var { id } = req.params;
  let allBookData = parse(fs.readFileSync('./dummy.csv').toString(), { columns: true });
  var updatedBooks = allBookData.filter(book => book.id != id);
  allBookData = updatedBooks;

  writeAllBooks(allBookData);

  fs.unlinkSync(`./data/${id}.csv`, function (err) {
    if (err) throw err;
    console.log('Saved!');
  })

  res.send("Resource has been deleted.")
})

//http://localhost:3001/booksGenre/?genres=Humor&genres=Thriller
app.get('/booksGenre', function (req, res) {
  const query = req.query.genres
  let allBookData = parse(fs.readFileSync('./dummy.csv').toString(), { columns: true });
  let bookListLength = allBookData.length;
  const filteredBooks = [];

  for (let i = 0; i < bookListLength; i++) {
    let currentBook = parse(fs.readFileSync(`./data/${i + 1}.csv`).toString(), { columns: true });
    for (genre of query) {
      if (currentBook[0].genres.includes(genre)) {
        filteredBooks.push(currentBook[0])
      }
    }
  }

  var uniqueArray = filteredBooks.reduce((filter, current) => {
    var dk = filter.find(item => item.title === current.title);
    if (!dk) {
      return filter.concat([current]);
    } else {
      return filter;
    }
  }, []);

  res.send(uniqueArray)
})

//Handle any routes that don't exist
app.get('*', function (req, res) {
  res.status(404).send(`404: Please try /books OR /books/#NUMBER instead`);
});

//METHODS to Write to CSV files
const writeAllBooks = (books) => {
  let allBookString = stringify(books, { header: true, columns: ['id', 'title', 'author', 'cover'], quoted: true })
  fs.writeFileSync(`./dummy.csv`, allBookString, function (err) {
    if (err) throw err;
    console.log('Saved!');
  });
}

const writeOneBook = (book, id) => {
  let newBookString = stringify(book, { header: true, columns: ['id', 'title', 'author', 'genres', 'synopsis'], quoted: true })
  fs.writeFileSync(`./data/${id}.csv`, newBookString, function (err) {
    if (err) throw err;
    console.log('Saved!');
  });
}

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));