import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useEffect } from 'react';
import { Button, Text, View, Platform } from 'react-native';
import CameraStyles from "./components/camera/styles"
import * as Device from 'expo-device';
import * as Location from 'expo-location';

export default function App() {
  // Camera
  const [facing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  // Geolocation
  const [location, setLocation] = useState(null);
  const [setErrorMsg] = useState(null);
  const [geoFence, setGeofence] = useState({
    name: "Carregando",
    latitude: 0,
    longitude: 0
  });
  const currentRoute = [
    {
      name: "Estante",
      latitude: -23.535988,
      longitude: -46.884819
    },
    {
      name: "Bancada 1",
      latitude: -23.535986,
      longitude: -46.884811
    },
    {
      name: "Bancada 3",
      latitude: -23.536007,
      longitude: -46.884832
    },
    {
      name: "Bancada 6",
      latitude: -23.535983,
      longitude: -46.884832
    },
  ];

  // Função para calcular a distância entre duas coordenadas (em metros)
  function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Raio da Terra em metros
    const toRadians = (degrees) => (degrees * Math.PI) / 180;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const lat1Rad = toRadians(lat1);
    const lat2Rad = toRadians(lat2);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distância em metros
  }

  useEffect(() => {
    let locationSubscription;

    (async () => {
      if (Platform.OS === 'android' && !Device.isDevice) {
        setErrorMsg(
          'Oops, this will not work on Snack in an Android Emulator. Try it on your device!'
        );
        return;
      }

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // Configura o rastreamento da localização em tempo real
      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest, // Define a precisão
          timeInterval: 500, // Atualiza a cada 0.5 segundo
          distanceInterval: 0.3, // Atualiza a cada 30cm metro percorrido
        },
        (newLocation) => {
          setLocation(newLocation);
          // Verifica a proximidade com os pontos da rota
          let closestPoint = null;
          let minDistance = Infinity;

          currentRoute.forEach((point) => {
            const distance = haversineDistance(
              newLocation.coords.latitude,
              newLocation.coords.longitude,
              point.latitude,
              point.longitude
            );

            if (distance < minDistance) {
              minDistance = distance;
              closestPoint = point;
            }
          });

          // Atualiza a geoFence se estiver dentro de um raio de 1 metro
          if (minDistance <= 1) {
            setGeofence(closestPoint);
          }
        }
      );
    })();

    // Limpa o rastreamento quando o componente for desmontado
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);


  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={CameraStyles.container}>
        <Text style={CameraStyles.message}>Permita o acesso à câmera.</Text>
        <Button onPress={requestPermission} title="Permitir" />
      </View>
    );
  }


  return (
    <View style={CameraStyles.container}>
      <CameraView style={CameraStyles.camera} facing={facing}></CameraView>
      <View style={CameraStyles.bottomContainer}>
        <Text style={CameraStyles.text}>{geoFence.name}</Text>
        <Text>Accuracy: {location?.coords?.accuracy}</Text>
        <Text>Coords: {location?.coords?.latitude?.toFixed(6)} | {location?.coords?.longitude?.toFixed(6)}</Text>
        <Text>H: {location?.coords?.heading} | S: {location?.coords?.speed} </Text>
        <Text>Timestamp: {location?.timestamp}</Text>
      </View>
    </View>
  );
}

