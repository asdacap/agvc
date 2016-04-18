
import React from 'react';
import {
  Paper
} from 'material-ui';
import ReadingHistoryChart from '../reading/ReadingHistoryChart';
import Readings from '../reading/Readings';

var styles = {
  MachineLoading: {
    textAlign: "center"
  },
  ReadingTab: {
    Content: {
      padding: "1ex"
    },
    ChartPaper: {
      padding: "1ex",
      marginBottom: "1ex"
    }
  }
};

export default ReadingsTab = function(props){
  var charts = Readings.availableReadings.map(function(reading){
    return <div className="col-lg-4 col-md-6 col-xs-12" key={reading}>
      <Paper style={styles.ReadingTab.ChartPaper}>
        <div>{Readings.meta[reading].title}</div>
        <ReadingHistoryChart machine={props.machine} reading={reading} key={reading} />
      </Paper>
    </div>
  });
  return <div className="row" style={styles.ReadingTab.Content}>{charts}</div>;
};
