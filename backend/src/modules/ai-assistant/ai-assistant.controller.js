import AIAssistantChat from '../../models/AIAssistantChat.js';
import PatientProfile from '../../models/PatientProfile.js';
import crypto from 'crypto';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Generate a real AI response using Gemini based on the user's message and history.
 */
const generateGeminiResponse = async (message, patientContext, chatHistory) => {
  if (!process.env.GEMINI_API_KEY) {
    return "API Key not configured. Please add GEMINI_API_KEY to your environment variables.";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Build system prompt based on patient context
    let systemPrompt = "You are the HealthHub+ AI Assistant, a helpful and empathetic medical assistant. You provide general health insights, diet plans, exercise routines, and wellness tips. IMPORTANT: You must always add a short disclaimer that you are an AI and not a substitute for professional medical advice if the user asks for diagnosis or treatment.";
    
    if (patientContext) {
      systemPrompt += `\n\nPatient Context:\n- BMI: ${patientContext.bmi || 'Unknown'}\n- Blood Group: ${patientContext.bloodGroup || 'Unknown'}\n- Allergies: ${patientContext.allergies?.join(', ') || 'None reported'}\n- Current Risk Level: ${patientContext.healthRiskScore?.level || 'Unknown'}`;
      if (patientContext.medicalConditions && patientContext.medicalConditions.length > 0) {
        systemPrompt += `\n- Known Conditions: ${patientContext.medicalConditions.join(', ')}`;
      }
      systemPrompt += "\nUse this context to personalize your advice, but do not explicitly mention that you are reading their profile unless necessary.";
    }

    // Format chat history for Gemini
    const formattedHistory = chatHistory ? chatHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    })) : [];

    const chat = model.startChat({
      history: formattedHistory,
      systemInstruction: {
        role: "system",
        parts: [{ text: systemPrompt }]
      }
    });

    const result = await chat.sendMessage(message);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm sorry, I'm currently experiencing technical difficulties. Please try again later.";
  }
};

/**
 * @desc    Send a message to the AI assistant and get a response
 * @route   POST /api/ai-assistant/chat
 * @access  Private (Patient)
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty.',
      });
    }

    if (message.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot exceed 500 characters.',
      });
    }

    const currentSessionId = sessionId || crypto.randomUUID();

    // Fetch existing chat for history
    let chat = await AIAssistantChat.findOne({ sessionId: currentSessionId });

    // Fetch patient context for personalized responses
    let patientContext = null;
    try {
      patientContext = await PatientProfile.findOne({ userId: req.user._id });
    } catch {
      // If patient profile doesn't exist, continue without context
    }

    const contextUsed = !!patientContext;

    // Generate AI response
    const aiResponseText = await generateGeminiResponse(
      message, 
      patientContext, 
      chat ? chat.messages : []
    );

    const userMessage = {
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
    };

    const assistantMessage = {
      role: 'assistant',
      content: aiResponseText,
      timestamp: new Date(),
    };

    // We already fetched 'chat' at the beginning, so no need to fetch it again
    // Just update the existing chat object if it exists
    if (chat) {
      chat.messages.push(userMessage, assistantMessage);
      chat.contextUsed = chat.contextUsed || contextUsed;
      chat.tokenUsage += message.length + aiResponseText.length;
      await chat.save();
    } else {
      chat = await AIAssistantChat.create({
        patientId: req.user._id,
        sessionId: currentSessionId,
        messages: [userMessage, assistantMessage],
        contextUsed,
        tokenUsage: message.length + aiResponseText.length,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        sessionId: currentSessionId,
        reply: aiResponseText,
        contextUsed,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get chat history for the logged-in patient
 * @route   GET /api/ai-assistant/history
 * @access  Private (Patient)
 */
export const getChatHistory = async (req, res, next) => {
  try {
    const chats = await AIAssistantChat.find({ patientId: req.user._id })
      .sort('-createdAt')
      .limit(20);

    res.status(200).json({ success: true, data: chats });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single chat session by sessionId
 * @route   GET /api/ai-assistant/session/:sessionId
 * @access  Private (Patient)
 */
export const getChatSession = async (req, res, next) => {
  try {
    const chat = await AIAssistantChat.findOne({
      sessionId: req.params.sessionId,
      patientId: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found.',
      });
    }

    res.status(200).json({ success: true, data: chat });
  } catch (error) {
    next(error);
  }
};
