import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BarChart3, Clock3, House, JobSearch, UserRound } from '../../assets/SVGIMG/svgIcons';
import { History }from '../../screens/History/History';
import Reports from '../../screens/Reports/Reports';
import { Profile }from '../../screens/Profile/Profile';
import { DashboardScreen }from '../../screens/dashboard/Dashboard';
import DrawerNav from '../DrawerNav/DrawerNav';
import Jobs from '../../Components/jobs/jobs';

const Tab = createBottomTabNavigator();

export const  BottomTabs = () => {
  return (
    <Tab.Navigator 
    screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.label,
      }}>
      <Tab.Screen name="Dashboard" component={DrawerNav} options={{ tabBarIcon: ({ focused }) => (<House focused={focused} />),tabBarActiveTintColor: '#007AFF', tabBarInactiveTintColor: '#8e8e93',
      }}/>
      <Tab.Screen name="History" component={History}  options={{ tabBarIcon: ({ focused }) => (<Clock3 focused={focused} />),tabBarActiveTintColor: '#007AFF', tabBarInactiveTintColor: '#8e8e93',
      }}/>
      <Tab.Screen name="Reports" component={Reports}  options={{ tabBarIcon: ({ focused }) => (<BarChart3 focused={focused} />),tabBarActiveTintColor: '#007AFF', tabBarInactiveTintColor: '#8e8e93',
      }}/>
      <Tab.Screen name="Jobs" component={Jobs} options={{ tabBarIcon: ({ focused }) => (<JobSearch focused={focused} />),tabBarActiveTintColor: '#007AFF', tabBarInactiveTintColor: '#8e8e93'}} />
      <Tab.Screen name="Profile" component={Profile} options={{ tabBarIcon: ({ focused }) => (<UserRound focused={focused} />),tabBarActiveTintColor: '#007AFF', tabBarInactiveTintColor: '#8e8e93',
      }}/>
      
    </Tab.Navigator>

  )
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    height: 75,
    backgroundColor: '#0b1220',
    borderTopWidth: 0,
    elevation: 0,
    paddingTop: 10,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10, },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    borderTopLeftRadius:25,
    borderTopRightRadius:30,
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },

});