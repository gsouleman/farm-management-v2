import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Platform, StatusBar as RNStatusBar, View, Text, TouchableOpacity, ActivityIndicator, TextInput, KeyboardAvoidingView } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Main() {
  const [url, setUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const webViewRef = useRef(null);

  // Initialize URL
  useEffect(() => {
    const initUrl = async () => {
      try {
        const savedUrl = await AsyncStorage.getItem('custom_url');
        if (savedUrl) {
          setUrl(savedUrl);
          setInputUrl(savedUrl);
        } else {
          const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];
          const defaultUrl = debuggerHost ? `http://${debuggerHost}:5173` : 'http://192.168.160.36:5173';
          setUrl(defaultUrl);
          setInputUrl(defaultUrl);
        }
      } catch (e) {
        console.error('Failed to load saved URL', e);
      }
    };
    initUrl();
  }, []);

  const handleSaveUrl = async () => {
    try {
      let formattedUrl = inputUrl.trim();
      if (formattedUrl && !formattedUrl.startsWith('http')) {
        formattedUrl = `http://${formattedUrl}`;
      }
      await AsyncStorage.setItem('custom_url', formattedUrl);
      setUrl(formattedUrl);
      setShowSettings(false);
      setError(null);
      setLoading(true);
    } catch (e) {
      console.error('Failed to save URL', e);
    }
  };

  const handleReload = () => {
    setError(null);
    setLoading(true);
    webViewRef.current?.reload();
  };

  if (!url) return null;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        <StatusBar style="auto" />

        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            setError(`Error: ${nativeEvent.description}\nTarget: ${url}`);
            setLoading(false);
          }}
          mixedContentMode="always"
        />

        {loading && !error && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#bb1919" />
            <Text style={styles.loadingText}>Connecting to {url}...</Text>
          </View>
        )}

        {(error || showSettings) && (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.errorContainer}
          >
            <Text style={styles.errorTitle}>{error ? 'Connection Failed' : 'App Settings'}</Text>
            {error && <Text style={styles.errorMessage}>{error}</Text>}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Web App URL:</Text>
              <TextInput
                style={styles.input}
                value={inputUrl}
                onChangeText={setInputUrl}
                placeholder="http://192.168.160.36:5173"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSaveUrl}>
              <Text style={styles.buttonText}>SAVE & CONNECT</Text>
            </TouchableOpacity>

            {error && (
              <TouchableOpacity style={styles.secondaryButton} onPress={handleReload}>
                <Text style={styles.secondaryButtonText}>RETRY CURRENT</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.errorHint}>
              If local IP fails, use Localtunnel:{"\n"}
              1. Run 'lt --port 5173' on your PC{"\n"}
              2. Copy the URL it gives you{"\n"}
              3. Paste it above and click SAVE
            </Text>
          </KeyboardAvoidingView>
        )}

        {!showSettings && !error && (
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setShowSettings(true)}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  webview: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#bb1919',
    marginBottom: 10,
  },
  errorMessage: {
    textAlign: 'center',
    color: '#333',
    marginBottom: 20,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    width: '100%',
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
  },
  errorHint: {
    marginTop: 30,
    color: '#999',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  button: {
    backgroundColor: '#bb1919',
    width: '100%',
    height: 45,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  secondaryButton: {
    marginTop: 10,
    padding: 10,
  },
  secondaryButtonText: {
    color: '#bb1919',
    fontWeight: '600',
  },
  settingsButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 20,
  }
});
