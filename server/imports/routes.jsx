import {mount} from 'react-mounter';
import Dashboard from './components/Dashboard';
import AllMachineMapPage from './location/AllMachineMapPage';
import MachinePage from './machine/MachinePage';
import MessageLogPage from './message-log/MessageLogPage';
import ConfigurationPage from './server-configuration/ConfigurationPage';

FlowRouter.route('/', {
  name: 'dashboard',
  action: function(params, queryParams) {
    mount(Dashboard, params);
  }
});

FlowRouter.route('/all_machine_map', {
  name: 'allMachineMap',
  action: function(params, queryParams) {
    mount(AllMachineMapPage, params);
  }
});

FlowRouter.route('/chart/:reading?', {
  name: 'dashboardChart',
  action: function(params, queryParams) {
    params['page'] = 'chart';
    mount(Dashboard, params);
  }
});

FlowRouter.route('/machine/:machineId/status/:reading', {
  name: 'machineReading',
  action: function(params, queryParams) {
    params['page'] = 'status';
    mount(MachinePage, params);
  }
});

FlowRouter.route('/machine/:machineId/:page?', {
  name: 'machine',
  action: function(params, queryParams) {
    mount(MachinePage, params);
  }
});

FlowRouter.route('/message_logs', {
  name: 'message_logs',
  action: function(params, queryParams) {
    mount(MessageLogPage);
  }
});

FlowRouter.route('/configurations', {
  name: 'configurations',
  action: function(params, queryParams) {
    mount(ConfigurationPage);
  }
});

FlowRouter.triggers.enter([setDocumentHead]);

function setDocumentHead(){
  DocHead.setTitle("Machine Monitor");
  DocHead.addMeta({ name: "viewport", content: "width=device-width, initial-scale=1" });
  DocHead.addLink({ rel: "stylesheet", type: "text/css", href: "'https://fonts.googleapis.com/css?family=Roboto:400,300,500'" });
}
