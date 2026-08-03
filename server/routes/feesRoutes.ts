import express, { Request, Response } from 'express';
import FeeRecord from '../models/FeeRecord.js';
import FeePayment from '../models/FeePayment.js';
import Student from '../models/Student.js';

const router = express.Router();

const FeeRecordModel = FeeRecord as any;
const FeePaymentModel = FeePayment as any;
const StudentModel = Student as any;

// Helper to generate receipt number e.g. REC-2026-849102
const generateReceiptNo = () => {
  const dateStr = new Date().getFullYear();
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `REC-${dateStr}-${randomDigits}`;
};

// ============================================================================
// 1. FEES DASHBOARD STATS
// ============================================================================
router.get('/stats', async (_req: Request, res: Response): Promise<void> => {
  try {
    const feeRecords = await FeeRecordModel.find();
    const payments = await FeePaymentModel.find({ status: 'SUCCESS' });

    let totalCollectable = 0;
    let totalCollected = 0;
    let totalPending = 0;
    let totalScholarships = 0;
    let totalFines = 0;

    let countPaid = 0;
    let countPartial = 0;
    let countPending = 0;
    let countOverdue = 0;

    feeRecords.forEach((r: any) => {
      totalCollectable += r.totalPayable || 0;
      totalCollected += r.paidAmount || 0;
      totalPending += r.pendingAmount || 0;
      totalScholarships += r.scholarshipAmount || 0;
      totalFines += r.fineAmount || 0;

      if (r.status === 'PAID') countPaid++;
      else if (r.status === 'PARTIAL') countPartial++;
      else if (r.status === 'OVERDUE') countOverdue++;
      else countPending++;
    });

    res.json({
      success: true,
      stats: {
        totalCollectable,
        totalCollected,
        totalPending,
        totalScholarships,
        totalFines,
        totalRecords: feeRecords.length,
        statusCounts: {
          PAID: countPaid,
          PARTIAL: countPartial,
          PENDING: countPending,
          OVERDUE: countOverdue,
        },
        recentTransactionsCount: payments.length,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching fee stats' });
  }
});

// ============================================================================
// 2. GET ALL FEE RECORDS (Search & Filter)
// ============================================================================
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, department, category, status, search } = req.query;

    const query: any = {};
    if (studentId && studentId !== 'ALL') query.studentId = studentId;
    if (department && department !== 'ALL') query.department = department;
    if (category && category !== 'ALL') query.category = category;
    if (status && status !== 'ALL') query.status = status;

    if (search && typeof search === 'string') {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { studentName: searchRegex },
        { studentRollNo: searchRegex },
        { title: searchRegex },
        { department: searchRegex },
      ];
    }

    const records = await FeeRecordModel.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      total: records.length,
      fees: records,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching fee records' });
  }
});

// ============================================================================
// 3. CREATE SINGLE FEE ASSIGNMENT
// ============================================================================
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      studentId,
      category,
      title,
      dueDate,
      baseAmount,
      fineAmount = 0,
      scholarshipAmount = 0,
      remarks = '',
    } = req.body;

    if (!studentId || !category || !title || !dueDate || baseAmount === undefined) {
      res.status(400).json({
        success: false,
        message: 'Student, category, title, due date, and base amount are required.',
      });
      return;
    }

    const student = await StudentModel.findById(studentId);
    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found.' });
      return;
    }

    const base = Number(baseAmount) || 0;
    const fine = Number(fineAmount) || 0;
    const scholarship = Number(scholarshipAmount) || 0;

    const totalPayable = Math.max(0, base + fine - scholarship);
    const paidAmount = 0;
    const pendingAmount = totalPayable;

    const isPastDue = new Date(dueDate) < new Date() && pendingAmount > 0;
    const status = isPastDue ? 'OVERDUE' : 'PENDING';

    const newRecord = new FeeRecordModel({
      studentId: student._id,
      studentRollNo: student.studentId || student.admissionNumber || 'N/A',
      studentName: student.name,
      department: student.department,
      course: student.course,
      semester: student.semester,
      category,
      title,
      dueDate,
      baseAmount: base,
      fineAmount: fine,
      scholarshipAmount: scholarship,
      totalPayable,
      paidAmount,
      pendingAmount,
      status,
      remarks,
    });

    await newRecord.save();

    res.status(201).json({
      success: true,
      message: 'Fee record assigned successfully!',
      fee: newRecord,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error creating fee record' });
  }
});

// ============================================================================
// 4. UPDATE FEE RECORD
// ============================================================================
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { baseAmount, fineAmount, scholarshipAmount, dueDate, category, title, remarks } = req.body;

    const record = await FeeRecordModel.findById(req.params.id);
    if (!record) {
      res.status(404).json({ success: false, message: 'Fee record not found.' });
      return;
    }

    if (baseAmount !== undefined) record.baseAmount = Number(baseAmount);
    if (fineAmount !== undefined) record.fineAmount = Number(fineAmount);
    if (scholarshipAmount !== undefined) record.scholarshipAmount = Number(scholarshipAmount);
    if (dueDate) record.dueDate = dueDate;
    if (category) record.category = category;
    if (title) record.title = title;
    if (remarks !== undefined) record.remarks = remarks;

    record.totalPayable = Math.max(0, record.baseAmount + record.fineAmount - record.scholarshipAmount);
    record.pendingAmount = Math.max(0, record.totalPayable - record.paidAmount);

    if (record.pendingAmount === 0) {
      record.status = 'PAID';
    } else if (record.paidAmount > 0) {
      record.status = 'PARTIAL';
    } else if (new Date(record.dueDate) < new Date()) {
      record.status = 'OVERDUE';
    } else {
      record.status = 'PENDING';
    }

    await record.save();

    res.json({
      success: true,
      message: 'Fee record updated successfully!',
      fee: record,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error updating fee record' });
  }
});

// ============================================================================
// 5. DELETE FEE RECORD
// ============================================================================
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await FeeRecordModel.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Fee record not found.' });
      return;
    }

    res.json({ success: true, message: 'Fee record deleted successfully!' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error deleting fee record' });
  }
});

// ============================================================================
// 6. BATCH GENERATE FEES
// ============================================================================
router.post('/generate-batch', async (req: Request, res: Response): Promise<void> => {
  try {
    const { department, category, title, dueDate, baseAmount, scholarshipPercentage = 0 } = req.body;

    if (!category || !title || !dueDate || !baseAmount) {
      res.status(400).json({
        success: false,
        message: 'Category, title, due date, and base amount are required.',
      });
      return;
    }

    const query: any = { status: 'ACTIVE' };
    if (department && department !== 'ALL') query.department = department;

    const targetStudents = await StudentModel.find(query);
    if (targetStudents.length === 0) {
      res.status(404).json({ success: false, message: 'No active students found matching criteria.' });
      return;
    }

    const base = Number(baseAmount);
    const createdRecords: any[] = [];

    for (const student of targetStudents) {
      const scholarshipAmt = scholarshipPercentage > 0 ? Math.round((base * scholarshipPercentage) / 100) : 0;
      const totalPayable = Math.max(0, base - scholarshipAmt);

      const feeRec = new FeeRecordModel({
        studentId: student._id,
        studentRollNo: student.studentId || student.admissionNumber || 'N/A',
        studentName: student.name,
        department: student.department,
        course: student.course,
        semester: student.semester,
        category,
        title,
        dueDate,
        baseAmount: base,
        fineAmount: 0,
        scholarshipAmount: scholarshipAmt,
        totalPayable,
        paidAmount: 0,
        pendingAmount: totalPayable,
        status: new Date(dueDate) < new Date() ? 'OVERDUE' : 'PENDING',
        remarks: 'Batch generated fee structure',
      });

      await feeRec.save();
      createdRecords.push(feeRec);
    }

    res.status(201).json({
      success: true,
      message: `Successfully batch assigned ${category} to ${createdRecords.length} students!`,
      totalAssigned: createdRecords.length,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error generating batch fees' });
  }
});

// ============================================================================
// 7. PROCESS PAYMENT & GENERATE RECEIPT
// ============================================================================
router.post('/pay', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      feeRecordId,
      amountPaid,
      paymentMode = 'ONLINE',
      transactionRef,
      receivedBy = 'Accounts Officer',
      remarks = '',
    } = req.body;

    if (!feeRecordId || !amountPaid || Number(amountPaid) <= 0) {
      res.status(400).json({
        success: false,
        message: 'Fee Record ID and valid Payment Amount are required.',
      });
      return;
    }

    const feeRecord = await FeeRecordModel.findById(feeRecordId);
    if (!feeRecord) {
      res.status(404).json({ success: false, message: 'Fee record not found.' });
      return;
    }

    const payAmt = Number(amountPaid);
    if (payAmt > feeRecord.pendingAmount) {
      res.status(400).json({
        success: false,
        message: `Payment amount ($${payAmt}) cannot exceed pending balance ($${feeRecord.pendingAmount}).`,
      });
      return;
    }

    feeRecord.paidAmount += payAmt;
    feeRecord.pendingAmount = Math.max(0, feeRecord.totalPayable - feeRecord.paidAmount);

    if (feeRecord.pendingAmount === 0) {
      feeRecord.status = 'PAID';
    } else {
      feeRecord.status = 'PARTIAL';
    }

    await feeRecord.save();

    const receiptNo = generateReceiptNo();
    const txnRef = transactionRef || `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const payment = new FeePaymentModel({
      receiptNo,
      feeRecordId: feeRecord._id,
      studentId: feeRecord.studentId,
      studentName: feeRecord.studentName,
      studentRollNo: feeRecord.studentRollNo,
      department: feeRecord.department,
      course: feeRecord.course,
      feeCategory: feeRecord.category,
      amountPaid: payAmt,
      paymentMode,
      transactionRef: txnRef,
      paymentDate: new Date().toISOString().split('T')[0],
      status: 'SUCCESS',
      receivedBy,
      remarks,
    });

    await payment.save();

    res.status(201).json({
      success: true,
      message: `Payment of $${payAmt} processed successfully! Receipt: ${receiptNo}`,
      payment,
      feeRecord,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error processing fee payment' });
  }
});

// ============================================================================
// 8. GET PAYMENT HISTORY & RECEIPTS LIST
// ============================================================================
router.get('/payments', async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, paymentMode, search } = req.query;

    const query: any = {};
    if (studentId && studentId !== 'ALL') query.studentId = studentId;
    if (paymentMode && paymentMode !== 'ALL') query.paymentMode = paymentMode;

    if (search && typeof search === 'string') {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { receiptNo: searchRegex },
        { studentName: searchRegex },
        { studentRollNo: searchRegex },
        { transactionRef: searchRegex },
      ];
    }

    const payments = await FeePaymentModel.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      total: payments.length,
      payments,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching payment history' });
  }
});

// ============================================================================
// 9. GET SINGLE RECEIPT DETAILS
// ============================================================================
router.get('/receipt/:paymentId', async (req: Request, res: Response): Promise<void> => {
  try {
    const payment = await FeePaymentModel.findById(req.params.paymentId);
    if (!payment) {
      res.status(404).json({ success: false, message: 'Receipt not found.' });
      return;
    }

    const feeRecord = await FeeRecordModel.findById(payment.feeRecordId);
    const student = await StudentModel.findById(payment.studentId);

    res.json({
      success: true,
      receipt: {
        receiptNo: payment.receiptNo,
        date: payment.paymentDate,
        transactionRef: payment.transactionRef,
        paymentMode: payment.paymentMode,
        receivedBy: payment.receivedBy,
        amountPaid: payment.amountPaid,
        status: payment.status,
      },
      student: {
        name: payment.studentName,
        rollNo: payment.studentRollNo,
        department: payment.department,
        course: payment.course,
        email: student?.email || 'N/A',
        phone: student?.phone || 'N/A',
      },
      feeBreakdown: {
        category: payment.feeCategory,
        title: feeRecord?.title || payment.feeCategory,
        baseAmount: feeRecord?.baseAmount || payment.amountPaid,
        fineAmount: feeRecord?.fineAmount || 0,
        scholarshipAmount: feeRecord?.scholarshipAmount || 0,
        totalPayable: feeRecord?.totalPayable || payment.amountPaid,
        paidToDate: feeRecord?.paidAmount || payment.amountPaid,
        remainingBalance: feeRecord?.pendingAmount || 0,
      },
      institution: {
        name: 'Apex Institute of Technology & Management',
        address: 'Knowledge Park II, Greater City, Campus Tower A',
        contact: '+1 (800) 555-APEX | accounts@apexinstitute.edu',
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error fetching receipt details' });
  }
});

// ============================================================================
// 10. APPLY LATE FINE TO OVERDUE RECORDS
// ============================================================================
router.post('/apply-fine', async (req: Request, res: Response): Promise<void> => {
  try {
    const { fineAmount = 50, category } = req.body;

    const query: any = {
      pendingAmount: { $gt: 0 },
      dueDate: { $lt: new Date().toISOString().split('T')[0] },
    };
    if (category && category !== 'ALL') query.category = category;

    const overdueRecords = await FeeRecordModel.find(query);
    let updatedCount = 0;

    for (const record of overdueRecords) {
      const fineToAdd = Number(fineAmount);
      record.fineAmount += fineToAdd;
      record.totalPayable = Math.max(0, record.baseAmount + record.fineAmount - record.scholarshipAmount);
      record.pendingAmount = Math.max(0, record.totalPayable - record.paidAmount);
      record.status = 'OVERDUE';
      await record.save();
      updatedCount++;
    }

    res.json({
      success: true,
      message: `Late fine of $${fineAmount} successfully applied to ${updatedCount} overdue fee records!`,
      updatedRecords: updatedCount,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error applying late fines' });
  }
});

// ============================================================================
// 11. APPLY SCHOLARSHIP / WAIVER
// ============================================================================
router.post('/apply-scholarship', async (req: Request, res: Response): Promise<void> => {
  try {
    const { feeRecordId, scholarshipAmount, remarks = 'Merit Scholarship Applied' } = req.body;

    if (!feeRecordId || scholarshipAmount === undefined) {
      res.status(400).json({ success: false, message: 'Fee Record ID and Scholarship Amount are required.' });
      return;
    }

    const record = await FeeRecordModel.findById(feeRecordId);
    if (!record) {
      res.status(404).json({ success: false, message: 'Fee record not found.' });
      return;
    }

    const schol = Number(scholarshipAmount);
    record.scholarshipAmount = schol;
    record.remarks = remarks;

    record.totalPayable = Math.max(0, record.baseAmount + record.fineAmount - record.scholarshipAmount);
    record.pendingAmount = Math.max(0, record.totalPayable - record.paidAmount);

    if (record.pendingAmount === 0) {
      record.status = 'PAID';
    }

    await record.save();

    res.json({
      success: true,
      message: `Scholarship waiver of $${schol} applied successfully!`,
      fee: record,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Error applying scholarship' });
  }
});

export default router;
