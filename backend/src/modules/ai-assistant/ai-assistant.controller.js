import AIAssistantChat from '../../models/AIAssistantChat.js';
import PatientProfile from '../../models/PatientProfile.js';
import crypto from 'crypto';

/**
 * Generate a contextual mock AI response based on the user's message.
 * In production, this would call an LLM API (Gemini, OpenAI, etc.)
 */
const generateMockResponse = (message, patientContext) => {
  const lowerMsg = message.toLowerCase();

  // Context-aware responses based on patient health data
  if (patientContext && (lowerMsg.includes('health') || lowerMsg.includes('risk'))) {
    const bmi = patientContext.bmi;
    const risk = patientContext.healthRiskScore?.level || 'unknown';
    return `Based on your health profile, your BMI is ${bmi || 'not recorded'} and your current risk level is **${risk}**. I recommend maintaining a balanced diet and regular exercise. Would you like personalized diet or exercise recommendations?`;
  }

  if (lowerMsg.includes('diet') || lowerMsg.includes('food') || lowerMsg.includes('nutrition')) {
    return `🥗 **Diet Recommendations:**\n\n1. **Breakfast:** Oatmeal with berries and nuts (350 cal)\n2. **Lunch:** Grilled chicken salad with olive oil dressing (450 cal)\n3. **Dinner:** Baked salmon with steamed vegetables (500 cal)\n\nStay hydrated with at least 8 glasses of water daily. Would you like a detailed weekly meal plan?`;
  }

  if (lowerMsg.includes('exercise') || lowerMsg.includes('workout') || lowerMsg.includes('fitness')) {
    return `🏃 **Exercise Plan for This Week:**\n\n- **Mon/Wed/Fri:** 30 min brisk walking or jogging\n- **Tue/Thu:** 20 min strength training (bodyweight exercises)\n- **Sat:** Yoga or stretching (30 min)\n- **Sun:** Rest day\n\nStart slow and gradually increase intensity. Would you like exercises specific to any health condition?`;
  }

  if (lowerMsg.includes('stress') || lowerMsg.includes('anxiety') || lowerMsg.includes('mental')) {
    return `🧘 **Stress Management Tips:**\n\n1. Practice deep breathing exercises (4-7-8 technique)\n2. Try 10 minutes of daily meditation\n3. Maintain a consistent sleep schedule (7-8 hours)\n4. Limit caffeine and screen time before bed\n\nWould you like me to suggest specific relaxation techniques?`;
  }

  if (lowerMsg.includes('symptom') || lowerMsg.includes('pain') || lowerMsg.includes('fever')) {
    return `⚠️ I can help track your symptoms, but please remember I am an AI assistant and **not a substitute for professional medical advice**.\n\nCould you describe your symptoms in more detail? For example:\n- When did they start?\n- How severe are they (1-10)?\n- Any other accompanying symptoms?\n\nBased on your description, I can suggest whether you should consult a doctor urgently.`;
  }

  if (lowerMsg.includes('appointment') || lowerMsg.includes('doctor') || lowerMsg.includes('consult')) {
    return `📅 You can book an appointment directly from the **Appointments** section in your dashboard. Based on your health profile, I would recommend:\n\n- **General Physician** for routine checkups\n- **Cardiologist** if you have heart-related concerns\n- **Endocrinologist** for diabetes management\n\nWould you like me to help you identify the right specialist?`;
  }

  if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
    return `👋 Hello! I'm your **HealthHub+ AI Assistant**. I can help you with:\n\n- 🔍 Understanding your health risks\n- 🥗 Personalized diet plans\n- 🏃 Exercise recommendations\n- 🧘 Stress management tips\n- 📅 Booking appointments\n\nHow can I assist you today?`;
  }

  return `Thank you for your message. I can help you with health insights, diet plans, exercise routines, and understanding your medical reports. Could you please be more specific about what you'd like to know?`;
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

    // Fetch patient context for personalized responses
    let patientContext = null;
    try {
      patientContext = await PatientProfile.findOne({ userId: req.user._id });
    } catch {
      // If patient profile doesn't exist, continue without context
    }

    const contextUsed = !!patientContext;

    // Generate AI response
    const aiResponseText = generateMockResponse(message, patientContext);

    // Create or update the chat session
    const currentSessionId = sessionId || crypto.randomUUID();

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

    let chat = await AIAssistantChat.findOne({ sessionId: currentSessionId });

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
