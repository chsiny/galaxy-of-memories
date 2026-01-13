import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Canvas, useThree } from '@react-three/fiber';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { GalaxyScene } from '../components/GalaxyScene';
import { useRecords } from '../context/RecordsContext';
import { DiaryChatModal } from '../components/DiaryChatModal';
import { ReadDiaryModal } from '../components/ReadDiaryModal';
import { LLMRecord } from '../types';
import * as THREE from 'three';

// Camera controller component
function CameraController({ angle, zoom }: { angle: number; zoom: number }) {
  const { camera } = useThree();
  
  React.useEffect(() => {
    // Adjust camera angle based on vertical drag
    // angle: -1 to 1, maps to camera position from top to bottom
    // zoom: 0.5 to 2, controls camera distance (0.5 = zoomed in, 2 = zoomed out)
    const baseDistance = 25;
    const distance = baseDistance * zoom;
    const verticalOffset = angle * 10; // Max 10 units up/down
    const horizontalOffset = Math.sin(angle * Math.PI / 2) * 5; // Move camera slightly forward/back
    
    camera.position.set(
      horizontalOffset,
      verticalOffset,
      distance
    );
    camera.lookAt(0, 0, 0);
  }, [angle, zoom, camera]);
  
  return null;
}

export function HomeScreen() {
  const { records, deleteRecord } = useRecords();
  const [rotationSpeed, setRotationSpeed] = useState(0.1); // Base rotation speed
  const [cameraAngle, setCameraAngle] = useState(0.7); // -1 to 1, controls vertical viewing angle (0.3 = slight overhead view)
  const [zoom, setZoom] = useState(1.0); // 0.5 to 2, controls camera distance
  const [isDragging, setIsDragging] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [lastDragX, setLastDragX] = useState(0);
  const [lastDragY, setLastDragY] = useState(0);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedDiary, setSelectedDiary] = useState<LLMRecord | null>(null);
  const [showReadModal, setShowReadModal] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const momentumRef = useRef(0);
  const momentumIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const initialPinchDistanceRef = useRef<number | null>(null);
  const initialZoomRef = useRef<number>(1.0);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Load and play background music
  useEffect(() => {
    let isMounted = true;

    async function loadAndPlayMusic() {
      try {
        // Set audio mode for background playback
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: false,
        });

        // Load the sound
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/integration-be-still-the-earth-sloer-all-ambient-main-version-38713-03-22.mp3'),
          { 
            shouldPlay: true,
            isLooping: true,
            volume: 0.5, // 50% volume - adjust as needed
          }
        );

        if (isMounted) {
          soundRef.current = sound;
        } else {
          // If component unmounted before sound loaded, unload it
          await sound.unloadAsync();
        }
      } catch (error) {
        console.error('Error loading background music:', error);
      }
    }

    loadAndPlayMusic();

    // Cleanup function
    return () => {
      isMounted = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(console.error);
      }
    };
  }, []);

  // Filter records that have messages AND emotion (completed diaries only)
  const diaries = records.filter(record => 
    record.messages && 
    record.messages.length > 0 && 
    record.emotion && 
    record.emotionColor
  );

  const touchStartTimeRef = useRef<number>(0);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);

  // Calculate distance between two touches
  const getTouchDistance = (touch1: any, touch2: any): number => {
    const x1 = touch1.pageX || touch1.clientX || touch1.locationX || 0;
    const y1 = touch1.pageY || touch1.clientY || touch1.locationY || 0;
    const x2 = touch2.pageX || touch2.clientX || touch2.locationX || 0;
    const y2 = touch2.pageY || touch2.clientY || touch2.locationY || 0;
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  };

  const handleTouchStart = (event: any) => {
    const touches = event.nativeEvent.touches || [event.nativeEvent];
    
    // Check if it's a pinch gesture (2 touches)
    if (touches.length === 2) {
      setIsZooming(true);
      setIsDragging(false);
      const distance = getTouchDistance(touches[0], touches[1]);
      initialPinchDistanceRef.current = distance;
      initialZoomRef.current = zoom;
      return;
    }
    
    // Single touch - handle drag
    const touch = touches[0];
    const x = touch.pageX || touch.clientX || touch.locationX || 0;
    const y = touch.pageY || touch.clientY || touch.locationY || 0;
    
    touchStartTimeRef.current = Date.now();
    touchStartPosRef.current = { x, y };
    setIsDragging(false); // Don't set dragging immediately
    setIsZooming(false);
    setLastDragX(x);
    setLastDragY(y);
    momentumRef.current = 0;
    initialPinchDistanceRef.current = null;
  };

  const handleTouchMove = (event: any) => {
    const touches = event.nativeEvent.touches || [event.nativeEvent];
    
    // Handle pinch-to-zoom (2 touches)
    if (touches.length === 2 && initialPinchDistanceRef.current !== null) {
      const currentDistance = getTouchDistance(touches[0], touches[1]);
      // Inverted: pinch in (smaller distance) → zoom out, pinch out (larger distance) → zoom in
      const scale = initialPinchDistanceRef.current / currentDistance;
      const newZoom = initialZoomRef.current * scale;
      // Limit zoom range (0.5 = zoomed in, 2 = zoomed out)
      setZoom(Math.max(0.5, Math.min(2, newZoom)));
      return;
    }
    
    // Single touch - handle drag
    const touch = touches[0];
    const currentX = touch.pageX || touch.clientX || touch.locationX || 0;
    const currentY = touch.pageY || touch.clientY || touch.locationY || 0;
    
    // Check if this is a drag (movement > threshold)
    if (touchStartPosRef.current && !isDragging && !isZooming) {
      const moveX = Math.abs(currentX - touchStartPosRef.current.x);
      const moveY = Math.abs(currentY - touchStartPosRef.current.y);
      const moveDistance = Math.sqrt(moveX * moveX + moveY * moveY);
      
      // If moved more than 10 pixels, it's a drag
      if (moveDistance > 10) {
        setIsDragging(true);
        // Reset last position to current when starting drag to make it relative
        setLastDragX(currentX);
        setLastDragY(currentY);
        return;
      }
    }
    
    if (!isDragging || isZooming) return;
    
    // Calculate relative motion from last position
    const deltaX = currentX - lastDragX;
    const deltaY = currentY - lastDragY;
    
    // Horizontal drag controls rotation
    // Drag left → galaxy rotates right (positive rotation)
    // Drag right → galaxy rotates left (negative rotation)
    const rotationDelta = deltaX * 0.01; // Scale factor for rotation speed
    momentumRef.current = rotationDelta;
    setRotationSpeed(prev => {
      const newSpeed = prev + rotationDelta;
      // Limit rotation speed
      return Math.max(-2, Math.min(2, newSpeed));
    });
    
    // Vertical drag controls camera angle
    // Drag up → camera looks down (decrease angle)
    // Drag down → camera looks up (increase angle)
    const angleDelta = deltaY * 0.01; // Scale factor for angle
    setCameraAngle(prev => {
      const newAngle = prev + angleDelta; // Add because drag down should increase angle
      // Limit angle range (-1 to 1)
      return Math.max(-1, Math.min(1, newAngle));
    });
    
    setLastDragX(currentX);
    setLastDragY(currentY);
  };

  const handleTouchEnd = () => {
    // If it was a drag, apply momentum. If it was a tap, let the star handle it
    if (isDragging) {
      // Clear any existing momentum interval
      if (momentumIntervalRef.current) {
        clearInterval(momentumIntervalRef.current);
      }
      
      // Gradually slow down rotation when drag ends (momentum)
      momentumIntervalRef.current = setInterval(() => {
        setRotationSpeed(prev => {
          const newSpeed = prev * 0.98; // Decay factor
          if (Math.abs(newSpeed) < 0.05) {
            if (momentumIntervalRef.current) {
              clearInterval(momentumIntervalRef.current);
              momentumIntervalRef.current = null;
            }
            return 0.1; // Return to base rotation speed
          }
          return newSpeed;
        });
      }, 16); // ~60fps
    }
    
    setIsDragging(false);
    setIsZooming(false);
    touchStartPosRef.current = null;
    initialPinchDistanceRef.current = null;
  };

  // Toggle mute/unmute
  const toggleMute = async () => {
    try {
      if (soundRef.current) {
        if (isMuted) {
          await soundRef.current.setVolumeAsync(0.5);
          await soundRef.current.playAsync();
          setIsMuted(false);
        } else {
          await soundRef.current.setVolumeAsync(0);
          await soundRef.current.pauseAsync();
          setIsMuted(true);
        }
      }
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Mute/Unmute Button */}
      <Pressable style={styles.muteButton} onPress={toggleMute}>
        <Ionicons 
          name={isMuted ? "volume-mute" : "volume-high"} 
          size={24} 
          color="#FFFFFF" 
        />
      </Pressable>
      
      {/* Three.js Canvas */}
      <View
        style={styles.canvasContainer}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={handleTouchStart}
        onResponderMove={handleTouchMove}
        onResponderRelease={handleTouchEnd}
        onResponderTerminate={handleTouchEnd}
      >
        <Canvas
          camera={{ position: [0, 3, 25], fov: 75 }}
          gl={{ 
            antialias: false,
            alpha: true,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true,
          }}
          dpr={[1, 2]}
        >
          {/* Dark background */}
          <color attach="background" args={['#000011']} />
          
          {/* Ambient light for subtle illumination */}
          <ambientLight intensity={0.2} />
          
          {/* Point light for galaxy glow */}
          <pointLight position={[0, 0, 0]} intensity={0.5} distance={50} decay={2} />
          
          {/* Camera controller */}
          <CameraController angle={cameraAngle} zoom={zoom} />
          
          {/* Galaxy Scene */}
          <GalaxyScene 
            diaries={diaries} 
            rotationSpeed={rotationSpeed}
            cameraAngle={cameraAngle}
            onDiaryClick={(diary) => {
              setSelectedDiary(diary);
              setShowReadModal(true);
            }}
          />
        </Canvas>
      </View>

      {/* Write Diary Button */}
      <Pressable
        style={styles.writeButton}
        onPress={() => setShowChatModal(true)}
      >
        <Text style={styles.writeButtonText}>✨ Write a Diary</Text>
      </Pressable>

      {/* Diary Chat Modal */}
      <DiaryChatModal
        visible={showChatModal}
        onClose={() => setShowChatModal(false)}
      />

      {/* Read Diary Modal */}
      {selectedDiary && (
        <ReadDiaryModal
          visible={showReadModal}
          diary={selectedDiary}
          onClose={() => {
            setShowReadModal(false);
            setSelectedDiary(null);
          }}
          onDelete={(id) => {
            deleteRecord(id);
            setShowReadModal(false);
            setSelectedDiary(null);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000011',
  },
  canvasContainer: {
    flex: 1,
  },
  muteButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'transparent',
    padding: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'transparent',
    zIndex: 10,
  },
  writeButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  writeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
