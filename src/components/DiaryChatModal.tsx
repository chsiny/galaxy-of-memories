import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRecords } from '../context/RecordsContext';
import { generateCompletion, classifyEmotion, generateTitle } from '../services/llmClient';
import { LLMRecord, ChatMessage } from '../types';

interface DiaryChatModalProps {
  visible: boolean;
  onClose: () => void;
}

// Using the system prompt from backend config - this is just for reference
// The actual prompt is set in backend/lib/ai/config/prompt.ts

export function DiaryChatModal({ visible, onClose }: DiaryChatModalProps) {
  const { addRecord, updateRecord } = useRecords();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isLoading]);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setMessages([]);
      setInputText('');
      setError(null);
      setCurrentRecordId(null);
      setIsCompleting(false);
    }
  }, [visible]);

  const handleSend = async () => {
    if (!inputText.trim()) {
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setError(null);
    setIsLoading(true);

    // Determine the record ID to use (create if needed)
    let recordIdToUse = currentRecordId;
    
    // If this is the first message and we don't have a record yet, create a new record
    if (messages.length === 0 && !currentRecordId) {
      const newRecord: LLMRecord = {
        id: Date.now().toString(),
        messages: [userMessage],
        rating: null,
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      recordIdToUse = newRecord.id;
      setCurrentRecordId(newRecord.id);
      addRecord(newRecord);
    } else if (messages.length === 0 && currentRecordId) {
      // If we have a record ID but no messages, update it with the first message
      recordIdToUse = currentRecordId;
      updateRecord(currentRecordId, {
        messages: [userMessage],
        updatedAt: new Date().toISOString(),
      });
    }

    try {
      const conversationHistory = newMessages
        .map((msg) => `${msg.role === 'user' ? 'User' : 'Aurora'}: ${msg.content}`)
        .join('\n\n');

      const generatedResponse = await generateCompletion(conversationHistory, {
        // System prompt is handled by the backend
        systemPrompt: undefined,
      });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generatedResponse,
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);

      // Update the existing record using the record ID we determined
      if (!recordIdToUse) {
        console.error('No recordIdToUse found - this should not happen');
        return;
      }
      
      // Update the existing record
      updateRecord(recordIdToUse, {
        messages: updatedMessages,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate response';
      setError(errorMessage);
      console.error('Generation error:', err);
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = async () => {
    if (!currentRecordId || messages.length === 0) {
      onClose();
      return;
    }

    setIsCompleting(true);
    try {
      // Prepare conversation text for analysis
      const conversationText = messages
        .map((msg) => `${msg.role === 'user' ? 'User' : 'Aurora'}: ${msg.content}`)
        .join('\n\n');

      // Generate title and classify emotion in parallel
      const [title, emotionData] = await Promise.all([
        generateTitle(conversationText),
        classifyEmotion(conversationText),
      ]);

      // Update record with title, emotion, and color
      updateRecord(currentRecordId, {
        title,
        emotion: emotionData.emotion,
        emotionColor: emotionData.color,
        updatedAt: new Date().toISOString(),
      });

      // Close modal after a brief delay
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      console.error('Error classifying emotion:', err);
      // Close anyway even if emotion classification fails
      onClose();
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Write Your Diary</Text>
            <Pressable onPress={handleFinish} style={styles.finishButton}>
              {isCompleting ? (
                <ActivityIndicator color="#007AFF" size="small" />
              ) : (
                <Text style={styles.finishButtonText}>Finish</Text>
              )}
            </Pressable>
          </View>

          {/* Chat Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.chatContainer}
            contentContainerStyle={styles.chatContentContainer}
          >
            {messages.length === 0 ? (
              <View style={styles.emptyChatContainer}>
                <Text style={styles.emptyChatText}>✨ Begin Your Journey ✨</Text>
                <Text style={styles.emptyChatSubtext}>
                  Share your thoughts, feelings, and experiences{'\n'}
                  with Aurora, your spiritual guide
                </Text>
              </View>
            ) : (
              messages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageContainer,
                    message.role === 'user' ? styles.userMessage : styles.assistantMessage,
                  ]}
                >
                  <Text style={[
                    styles.messageRole,
                    message.role === 'user' 
                      ? { color: 'rgba(255, 254, 248, 0.8)' }
                      : { color: 'rgba(125, 211, 252, 0.9)' }
                  ]}>
                    {message.role === 'user' ? 'You' : 'Aurora'}
                  </Text>
                  <Text style={[
                    styles.messageContent,
                    message.role === 'user' 
                      ? { color: '#fffef8' }
                      : { color: 'rgba(255, 254, 248, 0.9)' }
                  ]}>
                    {message.content}
                  </Text>
                </View>
              ))
            )}

            {isLoading && (
              <View style={styles.loadingMessageContainer}>
                <ActivityIndicator size="small" color="#7dd3fc" />
                <Text style={styles.loadingText}>Aurora is thinking...</Text>
              </View>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </ScrollView>

          {/* Input Area */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              multiline
              placeholder="Share your thoughts..."
              placeholderTextColor="rgba(255, 254, 248, 0.4)"
              value={inputText}
              onChangeText={setInputText}
              editable={!isLoading && !isCompleting}
              onSubmitEditing={handleSend}
            />
            <Pressable
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading || isCompleting) && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading || isCompleting}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.sendButtonText}>Send</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 17, 0.8)', // Dark midnight backdrop
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#000011', // Dark midnight black matching galaxy
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 254, 248, 0.1)', // Subtle cream border
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 254, 248, 0.15)', // Subtle cream border
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fffef8', // Warm cream color
    letterSpacing: 0.5,
  },
  finishButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 254, 248, 0.2)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 254, 248, 0.3)',
  },
  finishButtonText: {
    color: '#fffef8',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  chatContainer: {
    flex: 1,
  },
  chatContentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyChatContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyChatText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fffef8', // Warm cream
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  emptyChatSubtext: {
    fontSize: 15,
    color: 'rgba(255, 254, 248, 0.6)', // Lighter cream
    textAlign: 'center',
    lineHeight: 22,
  },
  messageContainer: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255, 254, 248, 0.15)', // Subtle cream background
    borderWidth: 1,
    borderColor: 'rgba(255, 254, 248, 0.2)',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(125, 211, 252, 0.15)', // Subtle light blue (galaxy color)
    borderWidth: 1,
    borderColor: 'rgba(125, 211, 252, 0.25)',
  },
  messageRole: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  messageContent: {
    fontSize: 15,
    lineHeight: 22,
  },
  loadingMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: 'rgba(125, 211, 252, 0.15)',
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(125, 211, 252, 0.25)',
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(255, 254, 248, 0.7)',
    fontStyle: 'italic',
  },
  errorContainer: {
    padding: 16,
    backgroundColor: 'rgba(255, 69, 0, 0.2)', // Subtle orange-red
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 0, 0.3)',
  },
  errorText: {
    color: '#ff8c69',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 254, 248, 0.15)',
    backgroundColor: '#000011',
    gap: 12,
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 254, 248, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    maxHeight: 100,
    backgroundColor: 'rgba(255, 254, 248, 0.05)',
    color: '#fffef8',
  },
  sendButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 254, 248, 0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: 'rgba(255, 254, 248, 0.3)',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(255, 254, 248, 0.05)',
    borderColor: 'rgba(255, 254, 248, 0.1)',
  },
  sendButtonText: {
    color: '#fffef8',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

