import { useState, useEffect } from "react"
import { Alert, Dimensions, ImageBackground, Platform, Text, TextInput, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StyleSheet } from "react-native"
import auth from '@react-native-firebase/auth';
import { useNavigation } from "@react-navigation/native";
import { KeyboardAvoidingView } from "react-native";
import { ScrollView } from "react-native";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
const { width, height } = Dimensions.get('window');




export const LoginScreen = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [signup, Setsignup] = useState(false)

    const navigation = useNavigation<any>();

    useEffect(() => {
        GoogleSignin.configure({
            webClientId: '789836582938-mvscpvkosepl848utr57d257r0gqnkte.apps.googleusercontent.com', // from Google Cloud Console
        });
    }, []);
    const handleGoogle = async () => {
        try {
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            await GoogleSignin.signOut(); // ← add this, fixes "activity is null" error
            const { data } = await GoogleSignin.signIn();
            if (!data?.idToken) {
                Alert.alert("Error", "Google sign in failed");
                return;
            }
            const credential = auth.GoogleAuthProvider.credential(data.idToken);
            await auth().signInWithCredential(credential);
            Alert.alert("Success", "Login successful!");
            navigation.navigate('MainApp');
        } catch (error: any) {
            Alert.alert("Error", error.message);
        }
    };

    const handleAuth = async (): Promise<void> => {

        const cleanEmail = email.trim();

        if (!cleanEmail || !password) {
            Alert.alert("Error", "Please fill all fields");
            return;
        }

        if (signup && password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        try {
            if (signup) {
                //  SIGN UP FLOW
                const userCredential = await auth().createUserWithEmailAndPassword(cleanEmail, password);

                // Send email verification
                await userCredential.user.sendEmailVerification();
                await auth().signOut();

                Alert.alert("Verify Email", "Check your email before login");
                Setsignup(false); // switch to login after sign up
            } else {
                // LOGIN FLOW
                const userCredential = await auth().signInWithEmailAndPassword(cleanEmail, password);

                if (!userCredential.user.emailVerified) {
                    await auth().signOut();
                    Alert.alert("Verify Email", "Please verify your email before logging in.");
                    return;
                }

                Alert.alert("Success", "Login successful!");
                // navigation.navigate("Home"); // navigating to dashboard after successful login
                navigation.navigate("MainApp");
            }
        } catch (error: any) {
            switch (error.code) {
                case "auth/email-already-in-use":
                    Alert.alert("Error", "Email already in use");
                    break;
                case "auth/invalid-email":
                    Alert.alert("Error", "Invalid email");
                    break;
                case "auth/user-not-found":
                    Alert.alert("Error", "User not found");
                    break;
                case "auth/wrong-password":
                    Alert.alert("Error", "Wrong password");
                    break;
                case "auth/weak-password":
                    Alert.alert("Error", "Password must be at least 6 characters");
                    break;
                default:
                    Alert.alert("Error", error.message);
            }
        }
    };
    return (
        <ImageBackground
            source={require("../../assets/bgscreen.png")}
            style={styles.bg}
            resizeMode="cover"
        >
            <SafeAreaView style={styles.safe}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.kav}
                >
                    <ScrollView
                        contentContainerStyle={styles.scroll}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >

                        <View style={styles.glassContainer}>

                            <Text style={styles.welcomeText}>
                                {signup ? "Let's Get\nStarted!" : "Hey, \nWelcome Back!"}
                            </Text>
                            <Text style={styles.subText}>
                                {signup ? "Create your account" : "Sign in to continue your journey"}
                            </Text>

                            <View style={styles.fieldWrap}>
                                <Text style={styles.fieldLabel}>Email</Text>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your email"
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.fieldWrap}>
                                <Text style={styles.fieldLabel}>Password</Text>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your Password"
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                            </View>

                            {signup && (
                                <View style={styles.fieldWrap}>
                                    <Text style={styles.fieldLabel}>
                                        Confirm Password
                                    </Text>

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Re-enter your Password"
                                        placeholderTextColor="rgba(255,255,255,0.3)"
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry
                                    />
                                </View>
                            )}

                            {!signup && (
                                <TouchableOpacity style={styles.forgotWrap}>
                                    <Text style={styles.forgotTxt}>Forgot Password?</Text>
                                </TouchableOpacity>
                            )}


                            <TouchableOpacity
                                style={styles.loginButton}
                                onPress={handleAuth}
                                activeOpacity={0.8}
                            >
                                <Text
                                    style={styles.buttonBtnTxt}
                                >
                                    {signup ? "Sign Up" : "Login"}
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>or continue with</Text>
                                <View style={styles.dividerLine} />
                            </View>
                            <View style={styles.socialRow}>
                                <TouchableOpacity style={styles.socialBtn} onPress={handleGoogle}>
                                    <Text style={styles.socialTxt}>G Google</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.signupContainer}>
                                <Text
                                    style={styles.toggleTxt}
                                >
                                    {signup
                                        ? "Already have an account?"
                                        : "Don't have an account? "}
                                </Text>

                                <TouchableOpacity
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    onPress={() => Setsignup(!signup)}
                                >
                                    <Text
                                        style={styles.toggleLink}
                                    >
                                        {signup ? "Sign In" : "Sign Up"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </ImageBackground>
    )
}


const styles = StyleSheet.create({
    bg: {
        flex: 1,

    },
    safe: {
        flex: 1,

    },
    kav: {
        flex: 1 //keyboard Avioding View  new term hai
    },
    scroll: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: width * 0.05,  // 5% of screen width
        paddingVertical: height * 0.06,

    },
    welcomeText: {
        fontSize: width * 0.14,
        fontWeight: '800',
        marginBottom: height * 0.02,
        color: "#fff",
        lineHeight: width * 0.15,
        letterSpacing: 1.5,

    },
    subText: {
        color: 'rgba(255, 255, 255, 0.53)',
        fontSize: width * 0.033,
        marginTop: 0,
        marginBottom: height * 0.02,
    },
    glassContainer: {//chatbot
        width: '100%',
        padding: width * 0.06,           // 6% of screen width
        paddingBottom: height * 0.04,
        borderRadius: 22,
        // Semi-transparent background
        backgroundColor: 'rgba(177, 177, 177, 0.13)',
        // Thin border to mimic glass edge
        borderWidth: 1,
        borderColor: 'rgba(206, 202, 202, 0.15)',
        // Shadow for depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,

    },
    fieldWrap: {
        marginBottom: height * 0.018,    // scales with screen height
    },
    fieldLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: width * 0.03,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 6,
    },
    forgotWrap: {
        alignSelf: 'flex-end',
        marginBottom: height * 0.025,

    },
    forgotTxt: {
        color: '#007AFF',
        fontSize: width * 0.033,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: height * 0.018,
        gap: 8,
    },
    dividerLine: {
        flex: 1,
        height: 0.5,
        backgroundColor: 'rgba(255,255,255,0.12)',
    },
    dividerText: {
        color: 'rgba(255,255,255,0.25)',
        fontSize: width * 0.035,
    },
    socialRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: height * 0.018,
    },
    socialBtn: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
        borderRadius: 12,
        paddingVertical: height * 0.014,
        alignItems: 'center'
    },
    socialTxt: {
        color: 'rgba(255,255,255,0.55)',
        fontSize: width * 0.033,
        fontWeight: '500',
    },
    buttonBtnTxt: {
        color: '#fff',
        fontSize: width * 0.042,
        fontWeight: '700',
    },
    input: {
        height: height * 0.058,
        borderColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: width * 0.04,
        borderRadius: 14,
        color: "#fff",
        fontSize: width * 0.038,
        backgroundColor: 'rgba(255,255,255,0.07)',

    },
    loginButton: {
        backgroundColor: '#007AFF',
        borderRadius: 50,
        paddingVertical: height * 0.018,
        alignItems: 'center',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,

    },
    signupContainer: {
        marginTop: 10,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        flexWrap: 'wrap',
        gap: 4,

    },
    toggleTxt: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: width * 0.04,
    },
    toggleLink: {
        color: '#007AFF',
        fontSize: width * 0.04,
        fontWeight: '600',
    },

})

