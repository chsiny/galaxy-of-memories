import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LLMRecord } from '../types';

interface ReadDiaryModalProps {
  visible: boolean;
  diary: LLMRecord | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export function ReadDiaryModal({ visible, diary, onClose, onDelete }: ReadDiaryModalProps) {
  if (!diary) return null;

  const handleDelete = () => {
    Alert.alert(
      'Delete Diary',
      'Are you sure you want to delete this diary entry? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete?.(diary.id);
            onClose();
          },
        },
      ]
    );
  };

  const formattedDate = new Date(diary.createdAt).toLocaleString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Use generated title if available, otherwise fall back to first message
  const summary = diary.title || 
                  diary.messages.find(m => m.role === 'user')?.content || 
                  diary.messages[0]?.content || 
                  'Diary Entry';
  const content = diary.messages
    .map(m => `${m.role === 'user' ? 'You' : 'Aurora'}: ${m.content}`)
    .join('\n\n');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTouchable} onPress={onClose} />
      </View>

      <View style={[styles.modal, { borderLeftColor: diary.emotionColor || '#ffffff' }]}>
        <View style={styles.header}>
          <View style={styles.metadata}>
            {diary.emotion && (
              <View
                style={[
                  styles.emotionBadge,
                  { backgroundColor: diary.emotionColor || '#ffffff' },
                ]}
              >
                <Text style={styles.emotionText}>{diary.emotion}</Text>
              </View>
            )}
            <Text style={styles.date}>{formattedDate}</Text>
          </View>
          <View style={styles.headerActions}>
            {onDelete && (
              <Pressable onPress={handleDelete} style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={24} color="#ef4444" />
              </Pressable>
            )}
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={24} color="#94a3b8" />
            </Pressable>
          </View>
        </View>

        <Text style={styles.summary} numberOfLines={2}>
          {summary.length > 100 ? summary.substring(0, 100) + '...' : summary}
        </Text>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          <Text style={styles.contentText}>{content}</Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  backdropTouchable: {
    flex: 1,
  },
  modal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderLeftWidth: 4,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  metadata: {
    flex: 1,
    marginRight: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteButton: {
    padding: 4,
  },
  emotionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  emotionText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  date: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 14,
  },
  summary: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flex: 1,
    marginBottom: 16,
  },
  contentContainer: {
    paddingRight: 8,
  },
  contentText: {
    color: '#e2e8f0',
    fontSize: 16,
    lineHeight: 24,
  },
});

