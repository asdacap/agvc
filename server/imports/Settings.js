
Settings = {
  tcp_listen_port: 10000,
  udp_listen_port: 10000,
  data_sequence_timeout: 5000, // Milisecond before connection is considered dropped
  dropppable_command_timeout: 5000, // Milisecond before a droppable command is dropped
  ping_interval: 1000, // Milisecond between ping
  client_ping_interval: 1000,
  viewtime_update_interval: 500,
  machineview_update_interval: 200,
  use_bigger_map: true,
  bandwidth_record_interval: 1000,
  master: true,
  bypassCommandQueue: false,
  per_page_machine_count: 8,
  disable_client_machine_response_time: true,
  show_client_response_time: true,
  show_average_readings: true,
  machine_view_render_timeout: 33
};

Settings = _.extend(Settings, Meteor.settings);

export default Settings;
