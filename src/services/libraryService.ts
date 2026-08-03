import api from './api.js';
import { Book, BookCategory, BookIssue, LibraryStats } from '../types/index.js';

export interface GetBooksParams {
  category?: string;
  availability?: string;
  search?: string;
}

export interface SaveBookPayload {
  title: string;
  author: string;
  isbn?: string;
  category: string;
  publisher?: string;
  edition?: string;
  totalCopies: number;
  availableCopies?: number;
  locationRack?: string;
  price?: number;
  callNumber?: string;
  status?: string;
}

export interface SaveCategoryPayload {
  name: string;
  code: string;
  description?: string;
  locationSection?: string;
  maxIssueDays?: number;
  finePerDay?: number;
}

export interface IssueBookPayload {
  bookId: string;
  studentId: string;
  borrowerType?: 'STUDENT' | 'FACULTY';
  issueDate?: string;
  dueDate?: string;
  issuedBy?: string;
  remarks?: string;
}

export interface ReturnBookPayload {
  issueId: string;
  returnDate?: string;
  fineAmountOverride?: number;
  remarks?: string;
}

export interface GetIssuesParams {
  status?: string;
  studentId?: string;
  search?: string;
}

export const libraryService = {
  // Get dashboard statistics
  async getStats() {
    const res = await api.get<{ success: boolean; stats: LibraryStats }>('/library/stats');
    return res.data;
  },

  // Categories
  async getCategories() {
    const res = await api.get<{ success: boolean; total: number; categories: BookCategory[] }>('/library/categories');
    return res.data;
  },

  async createCategory(payload: SaveCategoryPayload) {
    const res = await api.post<{ success: boolean; message: string; category: BookCategory }>('/library/categories', payload);
    return res.data;
  },

  async updateCategory(id: string, payload: Partial<SaveCategoryPayload>) {
    const res = await api.put<{ success: boolean; message: string; category: BookCategory }>(`/library/categories/${id}`, payload);
    return res.data;
  },

  async deleteCategory(id: string) {
    const res = await api.delete<{ success: boolean; message: string }>(`/library/categories/${id}`);
    return res.data;
  },

  // Books
  async getBooks(params?: GetBooksParams) {
    const res = await api.get<{ success: boolean; total: number; books: Book[] }>('/library/books', { params });
    return res.data;
  },

  async getBookById(id: string) {
    const res = await api.get<{ success: boolean; book: Book }>(`/library/books/${id}`);
    return res.data;
  },

  async createBook(payload: SaveBookPayload) {
    const res = await api.post<{ success: boolean; message: string; book: Book }>('/library/books', payload);
    return res.data;
  },

  async updateBook(id: string, payload: Partial<SaveBookPayload>) {
    const res = await api.put<{ success: boolean; message: string; book: Book }>(`/library/books/${id}`, payload);
    return res.data;
  },

  async deleteBook(id: string) {
    const res = await api.delete<{ success: boolean; message: string }>(`/library/books/${id}`);
    return res.data;
  },

  // Issue Book
  async issueBook(payload: IssueBookPayload) {
    const res = await api.post<{ success: boolean; message: string; issue: BookIssue; book: Book }>('/library/issue', payload);
    return res.data;
  },

  // Return Book
  async returnBook(payload: ReturnBookPayload) {
    const res = await api.post<{ success: boolean; message: string; issue: BookIssue; fineAmount: number }>('/library/return', payload);
    return res.data;
  },

  // Get Issues List
  async getIssues(params?: GetIssuesParams) {
    const res = await api.get<{ success: boolean; total: number; issues: BookIssue[] }>('/library/issues', { params });
    return res.data;
  },

  // Student Borrowing History
  async getStudentHistory(studentId: string) {
    const res = await api.get<{
      success: boolean;
      student: any;
      summary: {
        totalBorrowed: number;
        activeLoans: number;
        totalReturned: number;
        overdueCount: number;
        totalFinesAssigned: number;
        totalFinesPending: number;
      };
      history: BookIssue[];
    }>(`/library/student-history/${studentId}`);
    return res.data;
  },

  // Fines
  async getFines(fineStatus?: string) {
    const res = await api.get<{ success: boolean; total: number; fines: BookIssue[] }>('/library/fines', {
      params: { fineStatus },
    });
    return res.data;
  },

  async processFineAction(issueId: string, action: 'PAY' | 'WAIVE', remarks?: string) {
    const res = await api.post<{ success: boolean; message: string; issue: BookIssue }>('/library/fines/pay', {
      issueId,
      action,
      remarks,
    });
    return res.data;
  },
};
