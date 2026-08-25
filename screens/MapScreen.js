// screens/MapScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { supabase } from '../lib/supabase'; // Нужно создать этот файл

const { width, height } = Dimensions.get('window');

export default function MapScreen() {
  const [events, setEvents] = useState([]);
  const [region, setRegion] = useState({
    latitude: 55.7558,
    longitude: 37.6173,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'active');
    
    if (!error && data) {
      setEvents(data);
    }
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
      >
        {events.map((event) => (
          <Marker
            key={event.id}
            coordinate={{
              latitude: event.latitude || 55.7558,
              longitude: event.longitude || 37.6173,
            }}
            title={event.title}
            description={`${event.type === 'help' ? '💰' : '👥'} ${event.price || 'Бесплатно'}`}
            pinColor={event.type === 'help' ? '#FF6B6B' : '#4ECDC4'}
            onPress={() => {
              // Навигация к деталям события
            }}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: width,
    height: height,
  },
});