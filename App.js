import React from 'react';
import {TaskManager, Notifications, Permissions, Location } from 'expo';
import { StyleSheet, Text, View, Platform, TouchableOpacity } from 'react-native';
import VIForegroundService from '@voximplant/react-native-foreground-service';

const LOCATION_BACKGROUND_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_BACKGROUND_TASK_NAME, async({data, error}) =>{
  if (error) {
        console.log(error);
      }
      if (data) {
        console.log(data.locations[0].timestamp, 'TIME STAMP');
        
      }
})

export default class App extends React.Component {
  constructor() {
    super();
    this.state={
      handleStateChange: false,
    };
    this.initState();
  }

  async initState() {
    const x = await Location.hasStartedLocationUpdatesAsync(LOCATION_BACKGROUND_TASK_NAME);
    this.setState({running: x});
  }

  async on() {
    await Permissions.askAsync(Permissions.NOTIFICATIONS)
    await Permissions.askAsync(Permissions.LOCATION);
    await Notifications.createChannelAndroidAsync('chat-messages2', {name: 'testChannel', description: 'testChannelDesc', sound: false, priority: 'max', vibrate: false, badge: true})
    await Location.startLocationUpdatesAsync(LOCATION_BACKGROUND_TASK_NAME, {
      timeInterval: 1000,
      distanceInterval: 0,
      accuracy: Location.Accuracy.High,
      showsBackgroundLocationIndicatior: true,
    });
  };

  async off() {
    await Location.stopLocationUpdatesAsync(LOCATION_BACKGROUND_TASK_NAME);
  };

   startForegroundService = async () => {
    if (Platform.OS !== 'android') {
        console.log('Only Android platform is supported');
        return;
    }

    if (Platform.Version >= 26) {
      const channelConfig = {
        id: 'ForegroundServiceChannel',
        name: 'Notification Channel',
        description: 'Notification Channel for Foreground Service',
        enableVibration: false,
        importance: 5 //MAX IMPORTANCE
      };
        await VIForegroundService.createNotificationChannel(channelConfig);
    }
    const notificationConfig = {
        id: 3456,
        title: 'Foreground Service',
        text: 'Foreground service is running',
        icon: 'ic_notification',
        priority: 2 //MAX PRIORITIY
    };
    if (Platform.Version >= 26) {
        notificationConfig.channelId = 'ForegroundServiceChannel';
    }
    await VIForegroundService.startService(notificationConfig);
  }

  stopForegroundService = async () =>{
    await VIForegroundService.stopService();
  }

  async componentDidMount(){
    await Notifications.createChannelAndroidAsync('chat-messages', {name: 'testChannel', description: 'testChannelDesc', sound: false, priority: 'max', vibrate: false, badge: true})
    await this.startForegroundService()
  }

  render() {
    return (
      <View style={{marginTop: 100}}>
      <Text>Running: {this.state.running?"Yes":"No"}</Text>
      <TouchableOpacity onPress={this.initState.bind(this)}>
        <Text>Refresh</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={this.on}>
        <Text>Enable background location</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={this.off}>
        <Text>Disable background location</Text>
      </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
