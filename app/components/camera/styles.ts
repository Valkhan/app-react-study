import { StyleSheet } from "react-native";

const CameraStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        backgroundColor: '#ccc',
        minWidth: '100%'
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        margin: 64,
    },
    button: {
        flex: 1,
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'red',
    },
});

export default CameraStyles;