import React from 'react';
import styles from './OnLineStatusBanner.module.css';

function OnLineStatusBanner(props) {
  let className;
  let text;

  switch (props.status) {
    case 'online':
      className = styles.OnLine;
      text = 'Online';
      break;
    case 'tryingToConnect':
      className = styles.TryingToConnect;
      text = 'Connecting to server...';
      break;
    default:
      className = styles.OffLine;
      text = 'Unknown connection status...';
  }

  return <div className={className}>{text}</div>;
}

export default OnLineStatusBanner;
