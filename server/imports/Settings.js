
Settings = {
  tcp_listen_port: 10000,
  data_sequence_timeout: 5000, // Milisecond before connection is considered dropped
  dropppable_command_timeout: 5000, // Milisecond before a droppable command is dropped
  ping_interval: 1000, // Milisecond between ping
  client_ping_interval: 1000,
  viewtime_update_interval: 200,
  use_bigger_map: true,
  bandwidth_record_interval: 1000,
  machine_view_render_timeout: 50
};

export default Settings;
