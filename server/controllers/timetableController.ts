import { Request, Response } from 'express';
import TimetableSlot from '../models/Timetable.js';

// Helper function to check if time ranges overlap (time in "HH:MM" 24h format)
const isTimeOverlapping = (start1: string, end1: string, start2: string, end2: string): boolean => {
  return start1 < end2 && start2 < end1;
};

// @desc    Get timetable slots with filters
// @route   GET /api/v1/timetable
// @access  Public / Protected
export const getTimetableSlots = async (req: Request, res: Response) => {
  try {
    const { department, semester, section, facultyName, facultyId, roomNumber, dayOfWeek, search } = req.query;

    const query: any = {};

    if (department && department !== 'ALL') query.department = department;
    if (semester && semester !== 'ALL') query.semester = Number(semester);
    if (section && section !== 'ALL') query.section = section;
    if (facultyName) query.facultyName = new RegExp(String(facultyName), 'i');
    if (facultyId) query.facultyId = facultyId;
    if (roomNumber && roomNumber !== 'ALL') query.roomNumber = roomNumber;
    if (dayOfWeek && dayOfWeek !== 'ALL') query.dayOfWeek = dayOfWeek;

    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      query.$or = [
        { subject: searchRegex },
        { subjectCode: searchRegex },
        { facultyName: searchRegex },
        { roomNumber: searchRegex },
        { department: searchRegex },
      ];
    }

    const slots = await TimetableSlot.find(query).sort({ dayOfWeek: 1, startTime: 1 });

    res.json({
      success: true,
      count: slots.length,
      slots,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Detect timetable conflicts (Room double-booking, Faculty double-booking, Section double-booking)
// @route   POST /api/v1/timetable/check-conflicts
// @access  Public / Protected
export const checkConflicts = async (req: Request, res: Response) => {
  try {
    const { slotId, dayOfWeek, startTime, endTime, roomNumber, facultyName, department, semester, section } = req.body;

    if (!dayOfWeek || !startTime || !endTime || !roomNumber || !facultyName) {
      return res.status(400).json({
        success: false,
        message: 'Day, Start Time, End Time, Room Number, and Faculty Name are required for conflict checking.',
      });
    }

    // Find all slots on the same day
    const existingSlots = await TimetableSlot.find({ dayOfWeek });

    const conflicts: Array<{
      type: 'ROOM' | 'FACULTY' | 'SECTION';
      message: string;
      conflictingSlot: any;
    }> = [];

    for (const slot of existingSlots) {
      // Ignore current slot if updating
      if (slotId && slot._id.toString() === slotId.toString()) {
        continue;
      }

      // Check time overlap
      if (isTimeOverlapping(startTime, endTime, slot.startTime, slot.endTime)) {
        // 1. Room Double Booking Conflict
        if (slot.roomNumber.toLowerCase().trim() === roomNumber.toLowerCase().trim()) {
          conflicts.push({
            type: 'ROOM',
            message: `Room ${roomNumber} is already booked by ${slot.facultyName} for ${slot.subject} (${slot.startTime} - ${slot.endTime}).`,
            conflictingSlot: slot,
          });
        }

        // 2. Faculty Double Booking Conflict
        if (slot.facultyName.toLowerCase().trim() === facultyName.toLowerCase().trim()) {
          conflicts.push({
            type: 'FACULTY',
            message: `Faculty ${facultyName} is already assigned to ${slot.subject} in Room ${slot.roomNumber} (${slot.startTime} - ${slot.endTime}).`,
            conflictingSlot: slot,
          });
        }

        // 3. Section Double Booking Conflict
        if (
          department &&
          semester &&
          section &&
          slot.department === department &&
          slot.semester === Number(semester) &&
          slot.section === section
        ) {
          conflicts.push({
            type: 'SECTION',
            message: `${department} Sem ${semester}-${section} already has ${slot.subject} scheduled in Room ${slot.roomNumber} (${slot.startTime} - ${slot.endTime}).`,
            conflictingSlot: slot,
          });
        }
      }
    }

    res.json({
      success: true,
      hasConflict: conflicts.length > 0,
      conflictCount: conflicts.length,
      conflicts,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Get room occupancy overview & statistics
// @route   GET /api/v1/timetable/rooms
// @access  Public / Protected
export const getRoomStats = async (_req: Request, res: Response) => {
  try {
    const slots = await TimetableSlot.find();

    const roomMap: Record<string, { roomNumber: string; totalSlots: number; slots: any[] }> = {};

    slots.forEach((s) => {
      if (!roomMap[s.roomNumber]) {
        roomMap[s.roomNumber] = { roomNumber: s.roomNumber, totalSlots: 0, slots: [] };
      }
      roomMap[s.roomNumber].totalSlots += 1;
      roomMap[s.roomNumber].slots.push(s);
    });

    const roomsList = Object.values(roomMap).sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));

    res.json({
      success: true,
      totalRoomsAllocated: roomsList.length,
      rooms: roomsList,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Create a new timetable slot with automatic conflict detection
// @route   POST /api/v1/timetable
// @access  Protected
export const createSlot = async (req: Request, res: Response) => {
  try {
    const {
      dayOfWeek,
      startTime,
      endTime,
      department,
      course,
      subject,
      subjectCode,
      semester,
      section,
      facultyId,
      facultyName,
      roomNumber,
      building,
      slotType,
      ignoreConflict,
    } = req.body;

    if (!dayOfWeek || !startTime || !endTime || !department || !subject || !semester || !section || !facultyName || !roomNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all mandatory slot fields: Day, Time, Department, Subject, Semester, Section, Faculty, and Room Number.',
      });
    }

    // Check conflict if ignoreConflict is false
    if (!ignoreConflict) {
      const existingSlots = await TimetableSlot.find({ dayOfWeek });
      for (const slot of existingSlots) {
        if (isTimeOverlapping(startTime, endTime, slot.startTime, slot.endTime)) {
          if (slot.roomNumber.toLowerCase().trim() === roomNumber.toLowerCase().trim()) {
            return res.status(409).json({
              success: false,
              message: `Conflict Detected: Room ${roomNumber} is already occupied by ${slot.facultyName} (${slot.subject}).`,
            });
          }
          if (slot.facultyName.toLowerCase().trim() === facultyName.toLowerCase().trim()) {
            return res.status(409).json({
              success: false,
              message: `Conflict Detected: Faculty ${facultyName} is already assigned to ${slot.subject} in Room ${slot.roomNumber}.`,
            });
          }
          if (
            slot.department === department &&
            slot.semester === Number(semester) &&
            slot.section === section
          ) {
            return res.status(409).json({
              success: false,
              message: `Conflict Detected: ${department} Sem ${semester}-${section} already has ${slot.subject} scheduled.`,
            });
          }
        }
      }
    }

    const slot = await TimetableSlot.create({
      dayOfWeek,
      startTime,
      endTime,
      department,
      course: course || 'B.Tech CS',
      subject,
      subjectCode: subjectCode || subject.substring(0, 3).toUpperCase() + '-101',
      semester: Number(semester),
      section,
      facultyId,
      facultyName,
      roomNumber,
      building: building || 'Main Academic Block',
      slotType: slotType || 'LECTURE',
    });

    res.status(201).json({
      success: true,
      message: 'Timetable slot created successfully!',
      slot,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Update a timetable slot
// @route   PUT /api/v1/timetable/:id
// @access  Protected
export const updateSlot = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const slot = await TimetableSlot.findById(id);

    if (!slot) {
      return res.status(404).json({ success: false, message: 'Timetable slot not found' });
    }

    Object.assign(slot, req.body);
    await slot.save();

    res.json({
      success: true,
      message: 'Timetable slot updated successfully',
      slot,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Delete timetable slot
// @route   DELETE /api/v1/timetable/:id
// @access  Protected
export const deleteSlot = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const slot = await TimetableSlot.findById(id);

    if (!slot) {
      return res.status(404).json({ success: false, message: 'Timetable slot not found' });
    }

    await TimetableSlot.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Timetable slot removed successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};
