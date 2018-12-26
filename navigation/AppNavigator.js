import React from 'react';
import { createSwitchNavigator, createStackNavigator,createAppContainer } from 'react-navigation';
import {
  ActivityIndicator,
  AsyncStorage,
  StatusBar,
  StyleSheet,
  View,
  Button,
  Text,
  TextInput,
  Alert
} from 'react-native';
import axios from 'axios';

import MainTabNavigator from './MainTabNavigator';

class SignInScreen extends React.Component {
  static navigationOptions = {
    title: 'Please sign in',
  };
  constructor(props){
    super(props)

    this.state={
      username: "",
      password: "",
      loggingin: false,
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Username:</Text>
        <TextInput
          style={{height: 40, borderColor: 'gray', borderWidth: 1}}
          onChangeText={(text) => this.setState({username: text})}
          value={this.state.username}
        />
        <Text>Password:</Text>
        <TextInput
          style={{height: 40, borderColor: 'gray', borderWidth: 1}}
          onChangeText={(text) => this.setState({password: text})}
          value={this.state.password} secureTextEntry={true}
        />
        {this.state.loggingin ? <ActivityIndicator /> : <Button title="Sign in!" onPress={this._signInAsync} />}
      </View>
    );
  }

  _signInAsync = () => {
    this.setState({
      loggingin: true
    })
    that=this
    axios.post('http://gerobakz-api.herokuapp.com/api/login', {
      username: this.state.username,
      password: this.state.password
    })
    .then(function (response) {
      if(response.data.hasOwnProperty('failed')){
        Alert.alert(
          'Login Gagal',
          'Mohon cek kembali username dan password anda',
          [
            {text: 'OK', onPress: () => console.log('Cancel Pressed')},
          ],
          {cancelable:false}
        )
        that.setState({
          loggingin: false
        })
      }
      else{
        that.saveToken()
      }
    })
    .catch(function (error) {
      console.log(error);
    });
  };

  async saveToken(){
    await AsyncStorage.setItem('userToken', this.state.username);
    this.props.navigation.navigate('App');
  }
}

class AuthLoadingScreen extends React.Component {
  constructor(props) {
    super(props);
    this._bootstrapAsync();
  }

  // Fetch the token from storage then navigate to our appropriate place
  _bootstrapAsync = async () => {
    const userToken = await AsyncStorage.getItem('userToken');

    // This will switch to the App screen or Auth screen and this loading
    // screen will be unmounted and thrown away.
    this.props.navigation.navigate(userToken ? 'App' : 'Auth');
  };

  // Render any loading content that you like here
  render() {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
        <StatusBar barStyle="default" />
      </View>
    );
  }
}
const AuthStack = createStackNavigator({ SignIn: SignInScreen });

const AppStack = createStackNavigator({
  main: MainTabNavigator
}, {
  initialRouteName: 'main',
  header: null,
  headerMode: 'none'
});

export default createAppContainer(createSwitchNavigator(
  {
    AuthLoading: AuthLoadingScreen,
    App: AppStack,
    Auth: AuthStack,
  },
  {
    initialRouteName: 'AuthLoading',
  }
));
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
})
