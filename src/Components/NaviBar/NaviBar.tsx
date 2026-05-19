import React from 'react'
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native'
import { MenuIcon } from '../../assets/SVGIMG/svgIcons'
import { DrawerActions, useNavigation } from '@react-navigation/native';

const {width ,height} =Dimensions.get('window')

export default function NaviBar() {
  const navigation = useNavigation<any>();
  
  return (
    <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                <MenuIcon />
        </TouchableOpacity>
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
  menuTxt: {
    fontWeight: 'bold', 
    fontSize: width * 0.05, //20
    color: 'white',
    
  }

})