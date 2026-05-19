import React from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import { Text } from 'react-native'
import { TouchableHighlight } from 'react-native'
import { ImageBackground } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { RightDirection } from '../../assets/SVGIMG/svgIcons'

const { width, height } = Dimensions.get('window');

export default function InterviewBoard() {
    const navigation = useNavigation<any>();
    return (
        <ImageBackground
            source={require('../../assets/interviewback.jpeg')}
            style={styles.imageContainer}
            imageStyle={{ borderRadius: 25 }}
            resizeMode='cover'
        >
            <View style={styles.container}>
                <View style={styles.textLeft}>
                    <View style={styles.TxtContainer}>
                        <View >
                            <Text style={[styles.textop]}>Start a Interview Now</Text>
                        </View>
                        <View>
                            <Text style={styles.subTxt}>Answer AI-generated qusions and get instant feeadback</Text>
                        </View>
                    </View>
                    <TouchableHighlight style={styles.button} onPress={() => navigation.navigate('live')} >
                        <View style={styles.btnInner}>
                            <Text style={styles.btnTxt}>Start Interview</Text>
                            <RightDirection />
                        </View>
                    </TouchableHighlight>
                </View>
            </View>
        </ImageBackground>
    )
}
const styles = StyleSheet.create({
    imageContainer: {
        justifyContent: 'center',
        height: height * 0.25,
        width: '100%',
    },
    container: {
        width: '100%',
        justifyContent: 'flex-end',
        flexDirection: 'row',
        padding: width * 0.03,
    },
    textLeft: {
        width: '55%',
        gap: height * 0.030,
    },
    TxtContainer: {
        gap: height * 0.010,
    },
    textop: {
        fontSize: width * 0.050,
        fontWeight: 'bold',
        color: '#fff',
    },
    subTxt: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: width * 0.032,
    },
    button: {
        backgroundColor: '#007AFF',
        padding: height * 0.012,
        borderRadius: 50,
        width: '80%',
        marginTop: height * 0.008,
        alignItems: 'center',
        justifyContent: 'center'
    },
    btnInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: width * 0.02,
    },
    btnTxt: {
        color: '#fff',
        fontSize: width * 0.035,
        fontWeight: '600',
    },
})