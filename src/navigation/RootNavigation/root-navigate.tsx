import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { LoginScreen } from "../../screens/loginpage/login";
import InterviewScreen from "../../screens/interviewScreen/interviewChat";
import { BottomTabs } from "../BottomTabs/BottomNav";

// import DrawerNav from "../DrawerNav/DrawerNav";

const Stack = createNativeStackNavigator();

export function RootNavigater(){
    return ( 
        <NavigationContainer>
    <Stack.Navigator screenOptions={{ 
        headerShown: false,

    }} >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MainApp" component={BottomTabs} />
        <Stack.Screen name="live" component={InterviewScreen} />
        
    </Stack.Navigator>
    </NavigationContainer>
)}