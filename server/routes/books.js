const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// Get all books
router.get('/', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

/**
 * @route   GET /api/books
 * @desc    Get all books
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @route   GET /api/books/:id
 * @desc    Get book by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json(book);
  } catch (err) {
    console.error('Error fetching book by ID:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @route   POST /api/books
 * @desc    Add a new book
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.title || !req.body.author || !req.body.year) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Create a new book
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      year: req.body.year
    });

    // Save to the database
    const newBook = await book.save();
    res.status(201).json(newBook);
  } catch (err) {
    console.error('Error adding book:', err);
    res.status(400).json({ message: 'Error adding book', error: err.message });
  }
});

/**
 * @route   DELETE /api/books/:id
 * @desc    Delete a book
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json({ message: 'Book removed', book });
  } catch (err) {
    console.error('Error deleting book:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @route   PUT /api/books/:id
 * @desc    Update a book
 * @access  Public
 */
router.put('/:id', async (req, res) => {
  try {
    // Find the book and update it
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    if (!updatedBook) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json(updatedBook);
  } catch (err) {
    console.error('Error updating book:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
});

// Add a new book
router.post('/', async (req, res) => {
    if (!req.body.title || !req.body.author || !req.body.year) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    year: req.body.year
  });

  try {
    const newBook = await book.save();
    res.status(201).json(newBook);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;