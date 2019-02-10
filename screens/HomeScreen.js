import React from 'react';
import moment from 'moment'
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  Alert,
  Button,
  View,
  AsyncStorage,
  ActivityIndicator
} from 'react-native';
import { WebBrowser, Constants, Location, Permissions  } from 'expo';
import axios from 'axios'

import { MonoText } from '../components/StyledText';

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    title:'Welcome to the app',
    header: null,
  };
  constructor(props){
    super(props)
    this.state={
      nasgorQuantity: 0,
      airQuantity: 0,
      airPrice: 0,
      nasgorPrice: 0,
      location: null,
      user: '',
      savingOrder: false
    }
  }
  async componentDidMount(){
    user = await AsyncStorage.getItem('userToken')
    console.log(user)
    this.setState({
      user: user
    })

  }
  onIncreaseItem(type){
    if (type === "air"){
      quantity= this.state.airQuantity
      price= this.state.airPrice
      this.setState({
        airQuantity: quantity+1,
        airPrice: price+3000
      })
    }
    else if(type === "nasgor"){
      quantity=this.state.nasgorQuantity
      price=this.state.nasgorPrice
      this.setState({
        nasgorQuantity: quantity+1,
        nasgorPrice: price+25000
      })
    }

  }
  onDecreaseItem(type){
    if (type === "air"){
      quantity= this.state.airQuantity
      price= this.state.airPrice
      that= this
      if(quantity===0){

      }
      else{
        this.setState({
          airQuantity: quantity-1,
          airPrice: price-3000
        })
      }
    }
    else if(type==="nasgor"){
      quantity=this.state.nasgorQuantity
      price=this.state.nasgorPrice
      if (quantity===0){

      }
      else{
        this.setState({
          nasgorQuantity: quantity-1,
          nasgorPrice: price-25000
        })
      }
    }

  }

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    console.log(location)
    this.setState({ location });
  };

  saveOrderAlert(){
    console.log(moment().format('MMMM Do YYYY, h:mm:ss a'))
    this._getLocationAsync()
    Alert.alert(
      'Yakin',
      'Anda yakin mau masukkan \n Nasi Goreng '+this.state.nasgorQuantity+' dengan harga Rp'+this.state.nasgorPrice,
      [
        {text: 'Masukkan Order', onPress: () => this.saveOrder()},
        {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
      ],
      {cancelable:false}
    )
  }
  saveOrder(){
    this.setState({
      savingOrder: true
    })
    that=this
    axios.post('http://gerobakz-api.herokuapp.com/api/new_order', {
      user: this.state.user,
      order: [
        {
          item: "nasi goreng",
          quantity: this.state.nasgorQuantity,
          price: this.state.nasgorPrice
        }
      ],
      totalPrice: this.state.nasgorPrice+this.state.airPrice,
      location: this.state.location.coords,
      time: moment().format('YYYY-MM-DD HH:mm:ss')
      }
    )
    .then(function (response) {
        Alert.alert(
          'Sukses',
          'Silahkan ambil pembayaran Rp'+(that.state.nasgorPrice+that.state.airPrice),
          [
            {text: 'OK', onPress: () => console.log('OK Pressed')},
          ],
          {cancelable:false}
        )
        that.setState({
          nasgorQuantity: 0,
          nasgorPrice: 0,
          airQuantity: 0,
          airPrice: 0,
          savingOrder: false
        })
    })
    .catch(function (error) {
      console.log(error);
      that.setState({
        savingOrder: false
      })
    });
  }

  _signOutAsync = async () => {
    await AsyncStorage.clear();
    this.props.navigation.navigate('Auth');
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <View style= {styles.welcomeContainer}>

            <View style={styles.addItemContainer}>
              <View style={styles.foodItemContainer}>
                <Text style={styles.getStartedText}>Nasi Goreng</Text>
                <Text style={styles.priceText}>Rp25,000</Text>
              </View>
              <View style={styles.incrementContainer}>
                <TouchableHighlight onPress={this.onIncreaseItem.bind(this,"nasgor")}>
                  <Text style={styles.incrementDecrementText}>+</Text>
                </TouchableHighlight>
                <Text style={styles.quantityText}>{this.state.nasgorQuantity}</Text>
                <TouchableHighlight onPress={this.onDecreaseItem.bind(this,"nasgor")}>
                  <Text style={styles.incrementDecrementText}>-</Text>
                </TouchableHighlight>
              </View>
            </View>

            

            <View>
              <View style ={styles.foodItemContainer}>
                <Text style={styles.getStartedText}>Harga Total: Rp {(this.state.nasgorPrice+this.state.airPrice).toLocaleString()}</Text>
              </View>
            </View>
            {this.state.savingOrder ? <ActivityIndicator/> : <Button style={styles.button} onPress={this.saveOrderAlert.bind(this)} title="Masukkan Order"/>}
            
          </View>
          <Button style={styles.button} title="Logout" onPress={this._signOutAsync} />
          </ScrollView>
      </View>
    );
  }

  _maybeRenderDevelopmentModeWarning() {
    if (__DEV__) {
      const learnMoreButton = (
        <Text onPress={this._handleLearnMorePress} style={styles.helpLinkText}>
          Learn more
        </Text>
      );

      return (
        <Text style={styles.developmentModeText}>
          Development mode is enabled, your app will be slower but you can use useful development
          tools. {learnMoreButton}
        </Text>
      );
    } else {
      return (
        <Text style={styles.developmentModeText}>
          You are not in development mode, your app will run at full speed.
        </Text>
      );
    }
  }

  _handleLearnMorePress = () => {
    WebBrowser.openBrowserAsync('https://docs.expo.io/versions/latest/guides/development-mode');
  };

  _handleHelpPress = () => {
    WebBrowser.openBrowserAsync(
      'https://docs.expo.io/versions/latest/guides/up-and-running.html#can-t-see-your-changes'
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  button: {
    marginBottom: 50,
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  foodItemContainer:{
    backgroundColor:'#e0115f',
    paddingTop:10,
    paddingBottom:10,
    paddingLeft:20,
    paddingRight:20,
    borderRadius:10,
    marginBottom:10,
  },
  addItemContainer:{
    flex: 1,
    flexDirection: 'row',
    alignItems:'center',
    justifyContent:'center',
    marginLeft: 5,
    marginBottom: 10
  },
  incrementContainer:{
    flex: 2,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    marginLeft: 0
  },
  incrementDecrementText:{
    fontSize: 60,
    color: '#000',
    marginLeft:10,

  },
  quantityText:{
    fontSize: 48,
    color: '#000',
    marginLeft: 15,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 32,
    color: '#fff',
    textAlign: 'center',
  },
  priceText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },

  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
