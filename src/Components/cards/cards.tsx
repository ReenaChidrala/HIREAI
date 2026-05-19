import React from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import { Text } from 'react-native'

const { width, height } = Dimensions.get('window');

export default function Cards() {

    const data = [
        {
            id: 1,
            value: 12,
            title: "interview\nCompleted",
            icon: '✅',
        },
        {
            id: 2,
            value: '85%',
            title: "average\nScrore",
            icon: '📈'
        },
        {
            id: 3,
            value: '85%',
            title: "average\nScrore",
            icon: '📈'
        }
    ]

    return (
        <>
            <View style={styles.row}>
                {
                    data.map((item) => (
                        <View style={styles.card} key={item.id}>
                            <View style={[styles.iconBox]}>
                                <Text style={styles.icon}>{item.icon}</Text>
                            </View>
                            <View>
                                <Text style={styles.value}>
                                    {item.value}
                                </Text>
                                <Text style={styles.title}>
                                    {item.title}
                                </Text>

                            </View>
                        </View>
                    )
                    )}
            </View>
        </>
    )
}
const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        gap: width * 0.02,
        height: height * 0.10,
    },
    card: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: width * 0.006,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: width * 0.03,
        
    },
    iconBox: {
        width: width * 0.09,
        height: width * 0.09,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },

    icon: {
        fontSize: width * 0.050,
    },
    value: {
        fontSize: width * 0.052,
        fontWeight: 'bold',
        color: '#fff'
    },
    title: {
        fontSize: width * 0.028,
        color: 'rgba(255,255,255,0.4)',
        
    }
})