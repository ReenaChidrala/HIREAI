import React from 'react'
import { Dimensions, Text, View } from 'react-native'
import { StyleSheet } from 'react-native'
import auth from '@react-native-firebase/auth';

const{width,height} =Dimensions.get('window');

export default function Profile() {
    const user =auth().currentUser;

    const raw = user?.email?.split('@')[0] || "";
    const clean =raw.replace(/[0-9]/g,"");
    const name =clean.charAt(0).toUpperCase() +clean.slice(1);
    
    

  return (
    <View style={styles.container}>
        <View style={styles.imageMainConatiner}>
            <View style={styles.imageConatiner}>

            </View> 
        </View>
        <View style={styles.textContainer}>
            <Text style={styles.textstule}>
                Hello {name}
            </Text>
            <Text style={styles.textContainersecond}>
                Ready to ace next interview
            </Text>
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
    container:{
        flexDirection:'row',
        alignItems: 'center',
    },
    imageMainConatiner:{
        width: 70,
        height: 70,
       
        padding: 3,
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: '50%',
        
    },
    imageConatiner:{
        width:'100%',
        height: '100%',
        backgroundColor: 'gray',
        borderRadius: '50%',
    },
    textContainer:{
            marginLeft: 10,
            fontSize: 20,
            fontWeight: 'bold',
            color: 'black',
            
    },
    textContainersecond:{
        fontSize: 14,
          color:'gray'

    },
    textstule:{
        fontSize:17,
        fontWeight: 'bold',
        color:'white'
    }



})