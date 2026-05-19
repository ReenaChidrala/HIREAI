import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

export default function Reports() {
  return (
    <View style={styles.container}>
      <Text style={styles.Txt}>
        Reports Screen
      </Text>
    </View>
  )
}

const styles= StyleSheet.create({
  container:{
    flex:1,
    justifyContent:'center',
    alignItems:'center'
  },
  Txt:{
    fontSize:20,
    fontWeight: '700',
  }
})