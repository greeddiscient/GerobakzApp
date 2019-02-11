import React from 'react';
import { ScrollView, StyleSheet,Text } from 'react-native';
import moment from 'moment';
import axios from 'axios';
import { NavigationEvents } from "react-navigation";

export default class LinksScreen extends React.Component {
  static navigationOptions = {
    title: 'Summary',
  };
  constructor(props){
    super(props)
    this.state={
      orders: [],
      todaysData: [],
      loading: true,
      kejual: 0,
      omset: 0,
      komisiPersen:0,
      komisi:0,
      setoran:0,
      jualLagi:0,
      nextKomisiPersen:0,
      simulasiKejual:0
    }
  }
  componentDidMount(){
    var that= this
    axios.get('https://gerobakz-api.herokuapp.com/api/orders')
    .then(function (response) {
      // handle success
      var data=response.data
      that.setState({
        orders: data,
        loading: false
      })
      console.log(data)
      that.addTodaysSales()
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
    .then(function () {
      // always executed
    });
    console.log()
  }
  addTodaysSales(){
    var data= this.state.orders
    todaysData= []
    for (i=0;i<data.length;i++){
      var momentData=moment(data[i].time)
      if(momentData.format("YYYY-MM-DD")==moment().format("YYYY-MM-DD")){
        todaysData.push(data[i])
      }
    }
    this.setState({
      todaysData: todaysData
    })
    this.calculateSummary()
    console.log("todaysData",todaysData)
  }
  calculateSummary(){
    var todaysData=this.state.todaysData
    var kejual= 0
    for (i=0;i<todaysData.length;i++){
      kejual+=todaysData[i].order[0].quantity
    }
    var omset=25000*kejual
    
    var komisiPersen=0
    
    //komisi
    if (kejual<16){
      komisiPersen=0
    }
    else if(kejual<24){
      komisiPersen=5
    }
    else if(kejual<32){
      komisiPersen=10
    }
    else if(kejual<40){
      komisiPersen=15
    }
    else{
      komisiPersen=20
    }
    var komisi=omset*komisiPersen/100
    var nextKomisiPersen=komisiPersen
    if(komisiPersen==20){
      nextKomisiPersen=20
    }
    else{
      nextKomisiPersen+=5
    }
    var jualLagi=0
    if(komisiPersen==0){
      jualLagi=16-kejual
      simulasiKejual=16
    }
    else if(komisiPersen==5){
      jualLagi=24-kejual
      simulasiKejual=24
    }
    else if(komisiPersen==10){
      jualLagi=32-kejual
      simulasiKejual=32
    }
    else if(komisiPersen==15){
      jualLagi=40-kejual
      simulasiKejual=40
    }
    else{
      jualLagi=0
      simulasiKejual=0
    }
    this.setState({
      kejual: kejual,
      omset: omset,
      komisiPersen: komisiPersen,
      komisi: komisi,
      nextKomisiPersen: nextKomisiPersen,
      jualLagi: jualLagi,
      simulasiKejual:simulasiKejual
      
    })
    
    
  }
  render() {
    return (
      <ScrollView style={styles.container}>
        <NavigationEvents
          onWillFocus={payload=>this.componentDidMount()}
        />
        <Text>Hari ini: {moment().format("MMM DD YYYY")}</Text>
        <Text>Kejual: {this.state.kejual}</Text>
        <Text>Omset: Rp{(this.state.omset).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</Text>
        <Text>% Komisi: {this.state.komisiPersen}%</Text>
        <Text>Komisi: Rp{(this.state.komisi).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</Text>
        <Text>Jual [{this.state.jualLagi}] lagi untuk dapat [{this.state.nextKomisiPersen}%] komisi</Text>
        <Text>Simulasi komisi tingkat berikut: [{this.state.simulasiKejual}] kejual dapat [Rp{(this.state.simulasiKejual*25000*this.state.nextKomisiPersen/100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}]</Text>
        <Text>Setoran: Rp{(this.state.omset-this.state.komisi).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</Text>
      
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
});
