import { useState, useEffect } from 'react';
import { Platform, Text, View, StyleSheet } from 'react-native';
import * as Device from 'expo-device';
import * as Location from 'expo-location';

export default function App() {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

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

    let text = 'Waiting..';
    if (errorMsg) {
        text = errorMsg;
    } else if (location) {
        text = JSON.stringify(location);
    }

    return (
        <View style={styles.container}>
            <Text>Accuracy: {location?.coords?.accuracy}</Text>
            <Text>Coords: {location?.coords?.latitude} | {location?.coords?.longitude}</Text>
            <Text>H: {location?.coords?.heading} | S: {location?.coords?.speed} </Text>
            <Text>Timestamp: {location?.timestamp}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    paragraph: {
        fontSize: 18,
        textAlign: 'center',
    },
});
