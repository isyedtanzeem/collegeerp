import express, { Request, Response } from 'express';
import Book from '../models/Book.js';
import BookCategory from '../models/BookCategory.js';
import BookIssue from '../models/BookIssue.js';
import Student from '../models/Student.js';

const router = express.Router();

const BookModel = Book as any;
const BookCategoryModel = BookCategory as any;
const BookIssueModel = BookIssue as any;
const StudentModel = Student as any;

// Helper to generate issue slip number e.g. SLIP-2026-948120
const generateSlipNo = () => {
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `SLIP-${year}-${rand}`;
};

// ============================================================================
// 1. LIBRARY DASHBOARD STATS
// ============================================================================
router.get('/stats', async (_req: Request, res: Response): Promise<void> => {
  try {
    const books = await BookModel.find();
    const categories = await BookCategoryModel.find();
    const issues = await BookIssueModel.find();

    let totalBooks = books.length;
    let totalCopies = 0;
    let availableCopies = 0;

    books.forEach((b: any) => {
      totalCopies += b.totalCopies || 0;
      availableCopies += b.availableCopies || 0;
    });

    let activeIssuesCount = 0;
    let overdueCount = 0;
    let totalFinesPending = 0;
    let totalFinesCollected = 0;

    const todayStr = new Date().toISOString().split('T')[0];

    issues.forEach((iss: any) => {
      if (iss.status === 'ISSUED') {
        activeIssuesCount++;
        if (iss.dueDate < todayStr) overdueCount++;
      } else if (iss.status === 'OVERDUE') {
        overdueCount++;
      }

      if (iss.fineStatus === 'PENDING') {
        totalFinesPending += iss.fineAmount || 0;
      } else if (iss.fineStatus === 'PAID') {
        totalFinesCollected += iss.fineAmount || 0;
      }
    });

    res.json({
      success: true,
      stats: {
        totalBooks,
        totalCopies,
        availableCopies,
        issuedCopies: Math.max(0, totalCopies - availableCopies),
        totalCategories: categories.length,
        activeIssuesCount,
        overdueCount,
        totalFinesPending,
        totalFinesCollected,
        totalIssuesRecorded: issues.length,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching library stats' });
  }
});

// ============================================================================
// 2. CATEGORIES CRUD
// ============================================================================
router.get('/categories', async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await BookCategoryModel.find().sort({ name: 1 });
    res.json({ success: true, total: categories.length, categories });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching categories' });
  }
});

router.post('/categories', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, code, description, locationSection, maxIssueDays, finePerDay } = req.body;
    if (!name || !code) {
      res.status(400).json({ success: false, message: 'Category Name and Code are required.' });
      return;
    }

    const newCategory = new BookCategoryModel({
      name,
      code: code.toUpperCase(),
      description: description || '',
      locationSection: locationSection || 'Main Library Floor 1',
      maxIssueDays: Number(maxIssueDays) || 14,
      finePerDay: Number(finePerDay) || 2,
    });

    await newCategory.save();
    res.status(201).json({ success: true, message: 'Category created successfully!', category: newCategory });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error creating category' });
  }
});

router.put('/categories/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, code, description, locationSection, maxIssueDays, finePerDay } = req.body;
    const cat = await BookCategoryModel.findById(req.params.id);
    if (!cat) {
      res.status(404).json({ success: false, message: 'Category not found.' });
      return;
    }

    if (name) cat.name = name;
    if (code) cat.code = code.toUpperCase();
    if (description !== undefined) cat.description = description;
    if (locationSection) cat.locationSection = locationSection;
    if (maxIssueDays) cat.maxIssueDays = Number(maxIssueDays);
    if (finePerDay !== undefined) cat.finePerDay = Number(finePerDay);

    await cat.save();
    res.json({ success: true, message: 'Category updated successfully!', category: cat });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error updating category' });
  }
});

router.delete('/categories/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await BookCategoryModel.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Category not found.' });
      return;
    }
    res.json({ success: true, message: 'Category deleted successfully!' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error deleting category' });
  }
});

// ============================================================================
// 3. BOOKS CRUD & SEARCH / AVAILABILITY
// ============================================================================
router.get('/books', async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, availability, search } = req.query;
    const query: any = {};

    if (category && category !== 'ALL') query.category = category;
    if (availability === 'AVAILABLE') query.availableCopies = { $gt: 0 };
    if (availability === 'OUT_OF_STOCK') query.availableCopies = { $eq: 0 };

    if (search && typeof search === 'string') {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { title: regex },
        { author: regex },
        { isbn: regex },
        { category: regex },
        { publisher: regex },
        { callNumber: regex },
      ];
    }

    const books = await BookModel.find(query).sort({ createdAt: -1 });
    res.json({ success: true, total: books.length, books });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching books' });
  }
});

router.get('/books/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const book = await BookModel.findById(req.params.id);
    if (!book) {
      res.status(404).json({ success: false, message: 'Book not found.' });
      return;
    }
    res.json({ success: true, book });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching book details' });
  }
});

router.post('/books', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      author,
      isbn,
      category,
      publisher,
      edition,
      totalCopies,
      locationRack,
      price,
      callNumber,
    } = req.body;

    if (!title || !author) {
      res.status(400).json({ success: false, message: 'Title and Author are required.' });
      return;
    }

    const copies = Number(totalCopies) || 1;
    const generatedIsbn = isbn || `ISBN-${Math.floor(1000000000000 + Math.random() * 9000000000000)}`;
    const callNum = callNumber || `LIB-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBook = new BookModel({
      title,
      author,
      isbn: generatedIsbn,
      category: category || 'General',
      publisher: publisher || 'Academic Press',
      edition: edition || '1st Edition',
      totalCopies: copies,
      availableCopies: copies,
      locationRack: locationRack || 'Rack A-1',
      price: Number(price) || 0,
      callNumber: callNum,
      status: copies > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK',
    });

    await newBook.save();
    res.status(201).json({ success: true, message: 'Book cataloged successfully!', book: newBook });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error creating book' });
  }
});

router.put('/books/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      author,
      isbn,
      category,
      publisher,
      edition,
      totalCopies,
      availableCopies,
      locationRack,
      price,
      callNumber,
      status,
    } = req.body;

    const book = await BookModel.findById(req.params.id);
    if (!book) {
      res.status(404).json({ success: false, message: 'Book not found.' });
      return;
    }

    if (title) book.title = title;
    if (author) book.author = author;
    if (isbn) book.isbn = isbn;
    if (category) book.category = category;
    if (publisher !== undefined) book.publisher = publisher;
    if (edition !== undefined) book.edition = edition;
    if (locationRack !== undefined) book.locationRack = locationRack;
    if (price !== undefined) book.price = Number(price);
    if (callNumber !== undefined) book.callNumber = callNumber;

    if (totalCopies !== undefined) {
      const diff = Number(totalCopies) - book.totalCopies;
      book.totalCopies = Number(totalCopies);
      book.availableCopies = Math.max(0, book.availableCopies + diff);
    }

    if (availableCopies !== undefined) {
      book.availableCopies = Number(availableCopies);
    }

    book.status = book.availableCopies > 0 ? (status || 'AVAILABLE') : 'OUT_OF_STOCK';

    await book.save();
    res.json({ success: true, message: 'Book updated successfully!', book });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error updating book' });
  }
});

router.delete('/books/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await BookModel.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Book not found.' });
      return;
    }
    res.json({ success: true, message: 'Book deleted successfully!' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error deleting book' });
  }
});

// ============================================================================
// 4. BOOK ISSUE (Lend Book to Student/Faculty)
// ============================================================================
router.post('/issue', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      bookId,
      studentId,
      borrowerType = 'STUDENT',
      issueDate,
      dueDate,
      issuedBy = 'Librarian',
      remarks = '',
    } = req.body;

    if (!bookId || !studentId) {
      res.status(400).json({ success: false, message: 'Book and Borrower/Student are required.' });
      return;
    }

    const book = await BookModel.findById(bookId);
    if (!book) {
      res.status(404).json({ success: false, message: 'Book not found.' });
      return;
    }

    if (book.availableCopies <= 0) {
      res.status(400).json({
        success: false,
        message: `Book "${book.title}" is currently out of stock. Available copies: 0.`,
      });
      return;
    }

    const student = await StudentModel.findById(studentId);
    if (!student) {
      res.status(404).json({ success: false, message: 'Student/Borrower not found.' });
      return;
    }

    // Default dates if missing
    const issDate = issueDate || new Date().toISOString().split('T')[0];
    const dueD = dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Decrement available copies
    book.availableCopies = Math.max(0, book.availableCopies - 1);
    if (book.availableCopies === 0) book.status = 'OUT_OF_STOCK';
    await book.save();

    const slipNo = generateSlipNo();

    const issueRecord = new BookIssueModel({
      issueSlipNo: slipNo,
      bookId: book._id,
      bookTitle: book.title,
      bookIsbn: book.isbn,
      bookCategory: book.category,
      borrowerType,
      studentId: student._id,
      studentRollNo: student.studentId || student.admissionNumber || 'N/A',
      borrowerName: student.name,
      department: student.department,
      issueDate: issDate,
      dueDate: dueD,
      status: 'ISSUED',
      fineAmount: 0,
      fineStatus: 'NONE',
      issuedBy,
      remarks,
    });

    await issueRecord.save();

    res.status(201).json({
      success: true,
      message: `Book "${book.title}" successfully issued to ${student.name}! Issue Slip: ${slipNo}`,
      issue: issueRecord,
      book,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error issuing book' });
  }
});

// ============================================================================
// 5. BOOK RETURN & AUTO FINE CALCULATION
// ============================================================================
router.post('/return', async (req: Request, res: Response): Promise<void> => {
  try {
    const { issueId, returnDate, fineAmountOverride, remarks = '' } = req.body;

    if (!issueId) {
      res.status(400).json({ success: false, message: 'Issue ID or Slip Number is required.' });
      return;
    }

    let issue = await BookIssueModel.findById(issueId);
    if (!issue) {
      issue = await BookIssueModel.findOne({ issueSlipNo: issueId.toUpperCase() });
    }

    if (!issue) {
      res.status(404).json({ success: false, message: 'Issue record not found.' });
      return;
    }

    if (issue.status === 'RETURNED') {
      res.status(400).json({ success: false, message: 'This book issue has already been returned.' });
      return;
    }

    const retDate = returnDate || new Date().toISOString().split('T')[0];
    const dueTime = new Date(issue.dueDate).getTime();
    const retTime = new Date(retDate).getTime();

    let calculatedFine = 0;
    if (retTime > dueTime) {
      const overdueDays = Math.ceil((retTime - dueTime) / (1000 * 60 * 60 * 24));
      // Lookup category fine rate or default $2/day
      const category = await BookCategoryModel.findOne({ name: issue.bookCategory });
      const finePerDay = category ? category.finePerDay : 2;
      calculatedFine = overdueDays * finePerDay;
    }

    if (fineAmountOverride !== undefined) {
      calculatedFine = Number(fineAmountOverride);
    }

    issue.returnDate = retDate;
    issue.status = 'RETURNED';
    if (calculatedFine > 0) {
      issue.fineAmount = calculatedFine;
      issue.fineStatus = 'PENDING';
    }
    if (remarks) issue.remarks = remarks;

    await issue.save();

    // Increment available copies on Book
    const book = await BookModel.findById(issue.bookId);
    if (book) {
      book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
      book.status = 'AVAILABLE';
      await book.save();
    }

    res.json({
      success: true,
      message: `Book "${issue.bookTitle}" returned successfully! ${calculatedFine > 0 ? `Late fine of $${calculatedFine} applied.` : 'No late fines.'}`,
      issue,
      fineAmount: calculatedFine,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error returning book' });
  }
});

// ============================================================================
// 6. GET ALL BOOK ISSUES (ROSTER & HISTORY)
// ============================================================================
router.get('/issues', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, studentId, search } = req.query;
    const query: any = {};

    if (status && status !== 'ALL') query.status = status;
    if (studentId && studentId !== 'ALL') query.studentId = studentId;

    if (search && typeof search === 'string') {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { issueSlipNo: regex },
        { bookTitle: regex },
        { bookIsbn: regex },
        { borrowerName: regex },
        { studentRollNo: regex },
      ];
    }

    const issues = await BookIssueModel.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      total: issues.length,
      issues,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching issues list' });
  }
});

// ============================================================================
// 7. STUDENT BORROWING HISTORY
// ============================================================================
router.get('/student-history/:studentId', async (req: Request, res: Response): Promise<void> => {
  try {
    const student = await StudentModel.findById(req.params.studentId);

    const issues = await BookIssueModel.find({ studentId: req.params.studentId }).sort({ createdAt: -1 });

    let activeLoans = 0;
    let totalReturned = 0;
    let overdueCount = 0;
    let totalFinesAssigned = 0;
    let totalFinesPending = 0;

    issues.forEach((iss: any) => {
      if (iss.status === 'ISSUED') activeLoans++;
      if (iss.status === 'RETURNED') totalReturned++;
      if (iss.status === 'OVERDUE' || (iss.status === 'ISSUED' && new Date(iss.dueDate) < new Date())) overdueCount++;

      totalFinesAssigned += iss.fineAmount || 0;
      if (iss.fineStatus === 'PENDING') totalFinesPending += iss.fineAmount || 0;
    });

    res.json({
      success: true,
      student: student ? {
        _id: student._id,
        name: student.name,
        rollNo: student.studentId || student.admissionNumber,
        department: student.department,
        course: student.course,
        email: student.email,
        phone: student.phone,
      } : null,
      summary: {
        totalBorrowed: issues.length,
        activeLoans,
        totalReturned,
        overdueCount,
        totalFinesAssigned,
        totalFinesPending,
      },
      history: issues,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching student history' });
  }
});

// ============================================================================
// 8. FINES MANAGEMENT & COLLECTION / WAIVER
// ============================================================================
router.get('/fines', async (req: Request, res: Response): Promise<void> => {
  try {
    const { fineStatus } = req.query;
    const query: any = { fineAmount: { $gt: 0 } };

    if (fineStatus && fineStatus !== 'ALL') {
      query.fineStatus = fineStatus;
    }

    const fineRecords = await BookIssueModel.find(query).sort({ updatedAt: -1 });

    res.json({
      success: true,
      total: fineRecords.length,
      fines: fineRecords,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching library fines' });
  }
});

router.post('/fines/pay', async (req: Request, res: Response): Promise<void> => {
  try {
    const { issueId, action, remarks = '' } = req.body; // action: 'PAY' | 'WAIVE'

    if (!issueId || !action) {
      res.status(400).json({ success: false, message: 'Issue ID and Action (PAY or WAIVE) are required.' });
      return;
    }

    const issue = await BookIssueModel.findById(issueId);
    if (!issue) {
      res.status(404).json({ success: false, message: 'Issue record not found.' });
      return;
    }

    if (action === 'PAY') {
      issue.fineStatus = 'PAID';
      issue.remarks = remarks || 'Fine collected at library counter';
    } else if (action === 'WAIVE') {
      issue.fineStatus = 'WAIVED';
      issue.remarks = remarks || 'Fine waived by Chief Librarian';
    }

    await issue.save();

    res.json({
      success: true,
      message: `Fine for "${issue.bookTitle}" (${issue.borrowerName}) successfully set to ${issue.fineStatus}!`,
      issue,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error processing fine action' });
  }
});

export default router;
