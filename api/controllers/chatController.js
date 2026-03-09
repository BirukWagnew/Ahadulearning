// controllers/chatController.js
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import asyncHandler from "express-async-handler";

export const createConversation = async (req, res) => {
  const { studentId, instructorId, courseId } = req.body;

  try {
    let conversation = await Conversation.findOne({
      courseId: courseId,
      instructor: instructorId,
      members: { $all: [studentId, instructorId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        courseId: courseId,
        instructor: instructorId,
        members: [studentId, instructorId],
      });
      await conversation.save();
    }

    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getChatContacts = async (req, res) => {
  const userId = req.query.userId || req.body.userId || req.user?._id;
  const role = req.user?.role;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  if (!role) {
    return res.status(400).json({ error: "Missing user role" });
  }

  try {
    if (role === "student") {
      const enrollments = await Enrollment.find({ studentId: userId }).populate({
        path: "courseId",
        select: "instructor",
        populate: { path: "instructor", select: "name email" },
      });

      const instructorMap = new Map();
      for (const enr of enrollments) {
        const course = enr.courseId;
        const instructor = course?.instructor;
        if (!course?._id || !instructor?._id) continue;
        if (!instructorMap.has(String(instructor._id))) {
          instructorMap.set(String(instructor._id), {
            user: instructor,
            courseId: course._id,
          });
        }
      }

      return res.status(200).json(Array.from(instructorMap.values()));
    }

    if (role === "instructor") {
      const courses = await Course.find({ instructor: userId }).select("_id");
      const courseIds = courses.map((c) => c._id);

      if (courseIds.length === 0) {
        return res.status(200).json([]);
      }

      const enrollments = await Enrollment.find({ courseId: { $in: courseIds } })
        .populate("studentId", "name email")
        .select("studentId courseId");

      const studentMap = new Map();
      for (const enr of enrollments) {
        const student = enr.studentId;
        if (!student?._id || !enr.courseId) continue;
        if (!studentMap.has(String(student._id))) {
          studentMap.set(String(student._id), {
            user: student,
            courseId: enr.courseId,
          });
        }
      }

      return res.status(200).json(Array.from(studentMap.values()));
    }

    return res.status(200).json([]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const sendMessage = async (req, res) => {
  const { conversationId, senderId, text } = req.body;
  const file = req.file;

  try {
    const message = new Message({
      conversationId,
      sender: senderId,
      text: text || "",
      fileUrl: file ? `/uploads/chat/${file.filename}` : null,
      fileType: file ? normalizeFileType(file.mimetype) : null,
    });

    await message.save();
    await message.populate("sender", "name email");
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Helper function to normalize file types
function normalizeFileType(mimetype) {
  if (mimetype.startsWith("image")) return "image";
  if (mimetype.startsWith("video")) return "video";
  if (mimetype === "application/pdf") return "pdf";
  if (mimetype.includes("msword") || mimetype.includes("document"))
    return "doc";
  return "other";
}





export const getMessages = async (req, res) => {
  const { conversationId } = req.params;
  try {
    const messages = await Message.find({ conversationId })
      .populate("sender", "name email")
      .sort({
        createdAt: 1,
      });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMessage = async (req, res) => {
  const { messageId } = req.params;
  const { text } = req.body;

  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { text },
      { new: true }
    );
    res.status(200).json(updatedMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  const { messageId } = req.params;
  try {
    await Message.findByIdAndDelete(messageId);
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getConversations = async (req, res) => {
  const userId = req.query.userId || req.body.userId;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    const conversations = await Conversation.find({
      members: userId,
    })
      .populate("members", "name email")
      .populate("instructor", "name email");

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

