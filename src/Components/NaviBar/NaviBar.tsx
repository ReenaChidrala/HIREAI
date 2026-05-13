import React from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { MenuIcon } from '../../assets/SVGIMG/svgIcons'

const {width ,height} =Dimensions.get('window')

export default function NaviBar() {
  return (
    <View style={styles.container}>
      <View style={styles.menuIcon}>
        <MenuIcon />
      </View>
      <Text style={styles.menuTxt}>Dashboard</Text>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: width * 0.04,
    marginTop: height *  0.020,//20
    alignItems: 'center',
    paddingVertical: height * 0.006,//5
    
  },
  menuIcon: {
    width: width * 0.10,
    // height: width * 0.06,
    
  },
  menuTxt: {
    fontWeight: 'bold', 
    fontSize: width * 0.05, //20
    color: 'white',
    
  }

})