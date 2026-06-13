import mongoose from 'mongoose';

const aiAssistantChatSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    messages: [
      {
        role: {
          type: String,
          enum: ['user', 'assistant', 'system'],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    contextUsed: {
      type: Boolean,
      default: false,
    },
    tokenUsage: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fetching chat histories by patient
aiAssistantChatSchema.index({ patientId: 1, createdAt: -1 });

const AIAssistantChat = mongoose.model('AIAssistantChat', aiAssistantChatSchema);
export default AIAssistantChat;
