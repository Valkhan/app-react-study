import { CameraView, CameraType, useCameraPermissions, Camera } from 'expo-camera';
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
        <Text>Accuracy: {location?.coords?.accuracy}</Text>
        <Text>Coords: {location?.coords?.latitude} | {location?.coords?.longitude}</Text>
        <Text>H: {location?.coords?.heading} | S: {location?.coords?.speed} </Text>
        <Text>Timestamp: {location?.timestamp}</Text>
      </View>
    </View>
  );
}

