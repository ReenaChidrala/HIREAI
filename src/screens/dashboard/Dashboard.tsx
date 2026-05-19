import React, { Component } from 'react'
import { Dimensions, ScrollView, View,StyleSheet } from 'react-native'



import NaviBar from '../../Components/NaviBar/NaviBar'
import InterviewBoard from '../../Components/IntervieBoard/interviewBord'
import Cards from '../../Components/cards/cards'
import RecentInterview from '../../Components/RecentInterviews/RecentInterview'
import Logo from '../../Components/Logo/Logo'


const { width, height } = Dimensions.get('window');

export const  DashboardScreen = () => {
  []
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ 
          paddingHorizontal: width * 0.03, 
          gap: 10, 
          paddingBottom: height * 0.02 
        }}
        showsVerticalScrollIndicator={false}>
        <NaviBar />
        <Logo />
        <InterviewBoard />
        <Cards />
        <RecentInterview />
        {/* <Jobinterview /> */}
      </ScrollView>
    </View>
  )
}


const styles = StyleSheet.create({

  container: {
    gap: 12,
    backgroundColor: 'black',
    flex: 1,

  }
})