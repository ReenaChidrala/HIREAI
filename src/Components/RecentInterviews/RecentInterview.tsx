import React from 'react'
import { Dimensions, StyleSheet, Text, View } from 'react-native'
import { LeftArrow } from '../../assets/SVGIMG/svgIcons'

const { height, width } = Dimensions.get('window');

const data = [
    {
        id: 1,
        company: "Google",
        title: "Frontend Developer",
        date: "12-12-2023",
        progress: '75%',
        icon: ">",
        progressColor: '#34c759'
    },
    {
        id: 2,
        company: "Meta",
        title: "Backend Developer",
        date: "10-11-2023",
        progress: '50%',
        icon: ">",
        progressColor: '#ff9f0a'

    }
]

export default function RecentInterview() {
    return (
        <View style={styles.container}>

            {/* header */}
            <View style={styles.RecentContainer}>
                <Text style={styles.headerTxt}>Recent Interviews</Text>
                <View style={styles.viewallcontainer}>
                    <Text style={styles.viewTxt}>View all</Text>
                    <View style={styles.leftarrow}>
                        <LeftArrow />
                    </View>
                </View>
            </View>
            <View style={styles.line}></View>

            {/* interview list */}
            {data.map((item) => (
                <View key={item.id}>
                    <View style={styles.item}>
                        <View style={styles.left}>
                            <View style={styles.logoBox}>
                                <Text style={styles.logoText}>{item.company.charAt(0)}</Text>
                            </View>
                            <View>
                                <View style={styles.titleRow}>
                                    <Text style={styles.company}>{item.company}</Text>
                                    <Text style={styles.dash}>–</Text>
                                    <Text style={styles.jobTitle}>{item.title}</Text>
                                </View>
                                <Text style={styles.date}>{item.date}</Text>
                            </View>
                        </View>
                        <View style={styles.right}>
                            <View style={[styles.badge, { backgroundColor: item.progressColor + '22', borderColor: item.progressColor + '55' }]}>
                                <Text style={[styles.badgeTxt, { color: item.progressColor }]}>{item.progress}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            ))}
        </View>



    )
}


const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        gap: height * 0.012,
        borderWidth: 1,
        paddingHorizontal: width * 0.04,
        paddingVertical: height * 0.018,
        borderRadius: 16,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(255,255,255,0.04)',
    },
    RecentContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: height * 0.004

    },
    headerTxt: { 
        fontSize: width * 0.038, 
        fontWeight: 'bold', 
        color: '#fff' 
    },

    viewallcontainer: {
        flexDirection: 'row',
        gap: 4,
        alignItems: 'center',
    },
    viewTxt:{
        fontSize: width * 0.032,
        color: '#4da3ff',
    },
    line: {
        height: 1,
        backgroundColor: "#ccc",
        marginVertical: 5,

    },
    leftarrow:{

    },


    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: height * 0.008,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: width * 0.03,
        flex: 1,
    },
    logoBox: {
        width: width * 0.1,
        height: width * 0.1,
        borderRadius: width * 0.05,
        backgroundColor: 'rgba(0,122,255,0.2)',
        borderWidth: 1,
        borderColor: 'rgba(0,122,255,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        color: '#4da3ff',
        fontSize: width * 0.04,
        fontWeight: 'bold',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: width * 0.01,
        flexWrap: 'wrap',
    },
    company: {
        fontSize: width * 0.035,
        fontWeight: '600',
        color: '#fff',
    },
    dash: {
        fontSize: width * 0.03,
        color: 'rgba(255,255,255,0.3)',
    },
    jobTitle: {
        fontSize: width * 0.032,
        color: 'rgba(255,255,255,0.6)',
    },
    date: {
        fontSize: width * 0.028,
        color: 'rgba(255,255,255,0.3)',
        marginTop: height * 0.003,
    },
    right: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    badge: {
        paddingHorizontal: width * 0.03,
        paddingVertical: height * 0.005,
        borderRadius: 20,
        borderWidth: 1,
    },
    badgeTxt: {
        fontSize: width * 0.032,
        fontWeight: '600',
    },
})
