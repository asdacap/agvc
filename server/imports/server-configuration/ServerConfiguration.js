import GlobalStates from '../global-state/GlobalStates';

let defaultProp = {
  wifiSSID: "localhost.localdomain",
  wifiPassphrase: "hgMTc01e",
  serverHost: "10.42.0.2",
  serverPort: 10000,
  tcpConnectDelay: 5
};

export default ServerConfiguration = {
  get(){
    let obj = GlobalStates.findOne({ name: "ServerConfiguration" });
    if(obj === undefined){
      obj = defaultProp;
    }else{
      obj = obj.configuration;
    }
    return obj;
  },
  set(prop){
    let schema = new SimpleSchema(this.schema).namedContext();
    if(schema.validate(prop)){
      GlobalStates.upsert({ name: "ServerConfiguration" }, {
        $set: {
          name: "ServerConfiguration",
          configuration: prop
        }
      });
    }else{
      console.warn("Invalid server configuration "+JSON.stringify(schema.invalidKeys()));
    }
  },
  schema: {
    wifiSSID: {
      optional: false,
      type: String,
      label: "Wifi SSID",
      max: 50
    },
    wifiPassphrase: {
      optional: false,
      type: String,
      label: "Wifi Passphrase",
      max: 50
    },
    serverHost: {
      optional: false,
      type: String,
      label: "Server Host",
      max: 50
    },
    serverPort: {
      optional: false,
      type: Number,
      label: "Server Port"
    },
    tcpConnectDelay: {
      optional: false,
      type: Number,
      label: "TCP Connect Delay"
    }
  }
}

if(Meteor.isServer){
  Meteor.methods({
    setServerConfiguration(props){
      ServerConfiguration.set(props);
    }
  });
}
