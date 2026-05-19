import React from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { DrawerContentScrollView } from '@react-navigation/drawer'
// import { useNavigation } from '@react-navigation/native'
import auth from '@react-native-firebase/auth'
import { DashboardScreen } from '../../screens/dashboard/Dashboard'



const Drawer = createDrawerNavigator()
const { width, height } = Dimensions.get('window')


function CustomDrawer(props: any) {
    // const navigation = useNavigation<any>()
    const user = auth().currentUser
    const raw = user?.email?.split('@')[0] || ""
    const name = raw.replace(/[0-9]/g, "")
    const displayName = name.charAt(0).toUpperCase() + name.slice(1)

    const menuItems = [
        { label: 'Dashboard', icon: '⊞', screen: 'Dashboard' },
        { label: 'History', icon: '🕐', screen: 'History' },
        { label: 'Reports', icon: '📊', screen: 'Reports' },
        { label: 'Profile', icon: '👤', screen: 'Profile' },
        { label: 'Settings', icon: '⚙️', screen: 'Settings' },
    ]

    const handleLogout = async () => {
        await auth().signOut()
        props.navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        })
    }

    return (
        <DrawerContentScrollView
            {...props}
            style={styles.drawerContainer}
            contentContainerStyle={{ flex: 1 }}
        >
            {/* profile section */}
            <View style={styles.profileSection}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{displayName.charAt(0)}</Text>
                </View>
                <Text style={styles.name}>{displayName}</Text>
                <Text style={styles.email}>{user?.email}</Text>
            </View>

            <View style={styles.divider} />

            {/* menu items */}
            <View style={styles.menuList}>
                {menuItems.map((item) => (
                    <TouchableOpacity
                        key={item.label}
                        style={styles.menuItem}
                        onPress={() => {
                            props.navigation.closeDrawer()
                            props.navigation.getParent()?.navigate(item.screen)
                        }}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.menuIcon}>{item.icon}</Text>
                        <Text style={styles.menuLabel}>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* logout at bottom */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutIcon}>🚪</Text>
                <Text style={styles.logoutTxt}>Logout</Text>
            </TouchableOpacity>
        </DrawerContentScrollView>
    )
}

export default function DrawerNav() {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawer {...props} />}
            screenOptions={{
                headerShown: false,
                drawerStyle: {
                    width: width * 0.72,
                    backgroundColor: '#0d0f14',
                },
                overlayColor: 'rgba(0,0,0,0.6)',
            }}
        >
            <Drawer.Screen name="Dashboard" component={DashboardScreen} />

        </Drawer.Navigator>
    )
}

const styles = StyleSheet.create({
    drawerContainer: {
        backgroundColor: '#0d0f14',
        flex: 1,
    },
    profileSection: {
        paddingHorizontal: width * 0.06,
        paddingTop: height * 0.04,
        paddingBottom: height * 0.025,
    },
    avatar: {
        width: width * 0.16,
        height: width * 0.16,
        borderRadius: width * 0.08,
        backgroundColor: 'rgba(0,122,255,0.2)',
        borderWidth: 1.5,
        borderColor: 'rgba(0,122,255,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: height * 0.012,
    },
    avatarText: {
        fontSize: width * 0.07,
        fontWeight: 'bold',
        color: '#4da3ff',
    },
    name: {
        fontSize: width * 0.048,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    email: {
        fontSize: width * 0.03,
        color: 'rgba(255,255,255,0.3)',
    },
    divider: {
        height: 0.5,
        backgroundColor: 'rgba(255,255,255,0.08)',
        marginHorizontal: width * 0.06,
        marginBottom: height * 0.02,
    },
    menuList: {
        flex: 1,
        paddingHorizontal: width * 0.04,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: width * 0.04,
        paddingVertical: height * 0.018,
        paddingHorizontal: width * 0.04,
        borderRadius: 12,
        marginBottom: 4,
    },
    menuIcon: {
        fontSize: width * 0.055,
    },
    menuLabel: {
        fontSize: width * 0.04,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '500',
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: width * 0.04,
        paddingHorizontal: width * 0.08,
        paddingVertical: height * 0.025,
        borderTopWidth: 0.5,
        borderTopColor: 'rgba(255,255,255,0.08)',
    },
    logoutIcon: {
        fontSize: width * 0.055,
    },
    logoutTxt: {
        fontSize: width * 0.04,
        color: '#ff453a',
        fontWeight: '500',
    },
})

