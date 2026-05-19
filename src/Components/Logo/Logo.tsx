import React from 'react'
import { Dimensions, Text, View } from 'react-native'
import { StyleSheet } from 'react-native'
import auth from '@react-native-firebase/auth';

const { width, height } = Dimensions.get('window');

export default function Logo() {
    const user = auth().currentUser;

    const raw = user?.email?.split('@')[0] || "";
    const clean = raw.replace(/[0-9]/g, "");
    const name = clean.charAt(0).toUpperCase() + clean.slice(1);



    return (
        <View style={styles.container}>
            <View style={styles.imageMainContainer}>
                <View style={styles.imageContainer}>
                    <Text style={styles.initialText}>
                        {name.charAt(0)}
                    </Text>
                </View>
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.textstyle}>
                    Hello {name}
                </Text>
                <Text style={styles.subTxt}>
                    Ready to ace next interview
                </Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    imageMainContainer: {
        width: width * 0.15,
        height: width * 0.15,
        padding: width * 0.008,
        borderColor: 'rgba(0,122,255,0.5)',
        borderWidth: 1.5,
        borderRadius: (width * 0.14) / 2,

    },
    imageContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,122,255,0.2)',
        borderRadius: (width * 0.15) / 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        marginLeft: width * 0.03,

    },
    subTxt: {
        fontSize: width * 0.032,
        color: 'rgba(255,255,255,0.4)',
        marginTop: height * 0.004,

    },
    textstyle: {
        fontSize: width * 0.045,
        fontWeight: 'bold',
        color: '#fff'
    },
    initialText: {
        color: '#fff',
        fontSize: width * 0.055,
        fontWeight: 'bold',
    }
})