import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import * as ScreenCapture from 'expo-screen-capture';

interface ScreenshotPreventionProps {
  enabled?: boolean;
}

export function ScreenshotPrevention({ enabled = true }: ScreenshotPreventionProps) {
  useEffect(() => {
    if (enabled) {
      // Prevent screenshots
      ScreenCapture.preventScreenCaptureAsync();
    }

    return () => {
      // Re-enable screenshots when component unmounts
      ScreenCapture.allowScreenCaptureAsync();
    };
  }, [enabled]);

  return null;
} 