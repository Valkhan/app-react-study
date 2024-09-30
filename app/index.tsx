import { CameraView, CameraType, useCameraPermissions, Camera } from 'expo-camera';
import { useState, useEffect } from 'react';
import { Button, Text, View, Platform } from 'react-native';
import CameraStyles from "./components/camera/styles";
import * as Device from 'expo-device';
import * as Location from 'expo-location';
// Função para calcular a distância entre duas coordenadas (em metros)


function getDistance(p1, p2, accuracy1 = 0) {
  const R = 6371e3; // Raio da Terra em metros
  const toRadians = (degrees) => (degrees * Math.PI) / 180;

  // Diferença entre latitudes e longitudes em radianos
  const dLat = toRadians(p2.latitude - p1.latitude);
  const dLon = toRadians(p2.longitude - p1.longitude);

  // Latitude dos pontos convertidos em radianos
  const lat1Rad = toRadians(p1.latitude);
  const lat2Rad = toRadians(p2.latitude);

  // Fórmula de Haversine
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  let distance = R * c; // Distância em metros

  // Ajuste com base no accuracy de p1
  if (accuracy1 > 0) {
    const adjustmentFactor = 1 + (accuracy1 / 100); // Ajusta distância conforme a precisão (accuracy)
    distance *= adjustmentFactor; // Aplica o fator de ajuste à distância
  }

  return distance; // Retorna a distância ajustada em metros
}

export default function App() {
  // Camera
  const [facing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  // Geolocation
  const [location, setLocation] = useState(null);
  const minDistanceTarget = 1;

  // Estado e função setGeofence movidos para fora do componente App

  const stdFence = {
    name: "Carregando",
    latitude: 0,
    longitude: 0,
    distance: -1
  };
  const [currentFence, setCurrentFence] = useState(stdFence);

  const currentRoute = [
    {
      name: "Estante",
      latitude: -23.536028855539374,
      longitude: -46.884936793403334,
    },
    {
      name: "Bancada",
      latitude: -23.53593755980437,
      longitude: -46.88496078875079,
    },
  ];

  useEffect(() => {
    let locationSubscription;

    (async () => {
      if (Platform.OS === 'android' && !Device.isDevice) {
        console.error(
          'Oops, this will not work on Snack in an Android Emulator. Try it on your device!'
        );
        return;
      }

      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus === 'granted') {
        // console.log('foregroundStatus: granted');
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus === 'granted') {
          // console.log('backgroundStatus: granted');
          // Configura o rastreamento da localização em tempo real
          try {
            locationSubscription = await Location.watchPositionAsync(
              {
                accuracy: Location.Accuracy.Highest, // Define a precisão
                timeInterval: 2000, // Atualiza a cada 0.5 segundo
                distanceInterval: 0.01, // Atualiza a cada 30cm metro percorrido
              },
              (newLocation) => {
                setLocation(newLocation);
                let newRoute = Object.assign({}, stdFence);
                // Varre array de currentRoute para localizar a rota mais próxima 
                currentRoute.forEach((route, i) => {
                  let distance = getDistance(
                    newLocation.coords,
                    route,
                    newLocation.coords.accuracy
                  );
                  if (distance <= (minDistanceTarget + newLocation.coords.accuracy)) {
                    if (newRoute.distance === -1) {
                      newRoute = Object.assign({}, route);
                      newRoute.distance = parseFloat(distance.toFixed(6));
                    } else if (newRoute.distance > distance) {
                      newRoute = Object.assign({}, route);
                      newRoute.distance = parseFloat(distance.toFixed(6));
                    }
                  }
                  console.log('distance: ', newRoute);
                });
                setCurrentFence(newRoute);
              }
            );
          } catch (error) {
          }
        }
      }

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
        <Text style={CameraStyles.text}>{currentFence.name} | {currentFence.distance}</Text>
        <Text>Accuracy: {location?.coords?.accuracy}</Text>
        <Text>Coords: {location?.coords?.latitude?.toFixed(6)} | {location?.coords?.longitude?.toFixed(6)}</Text>
        <Text>H: {location?.coords?.heading} | S: {location?.coords?.speed} </Text>
        <Text>Timestamp: {location?.timestamp}</Text>
      </View>
    </View>
  );
}