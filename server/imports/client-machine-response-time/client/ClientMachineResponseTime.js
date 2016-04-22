
export default ClientMachineResponseTime = new Mongo.Collection();
ClientMachineResponseTime.attachBehaviour("timestampable");

let schema = new SimpleSchema({
  machineId: {
    type: String,
    optional: false
  },
  responseTime: {
    type: Number,
    optional: false
  }
});

ClientMachineResponseTime.attachSchema(schema);
