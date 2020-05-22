import React from 'react';
import styles from './OnLineStatusBanner.module.css';

class OnLineStatusBanner extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isOnLine: navigator.onLine,
    };

    this.updateOnLineStatus = this.updateOnLineStatus.bind(this);
  }

  componentDidMount() {
    window.addEventListener('online', this.updateOnLineStatus);
    window.addEventListener('offline', this.updateOnLineStatus);
  }

  updateOnLineStatus() {
    this.setState({
      isOnLine: navigator.onLine,
    });
  }

  render() {
    const className = this.state.isOnLine ? styles.OnLine : styles.OffLine;
    const text = this.state.isOnLine ? 'Online' : 'Offline';
    return <div className={className}>{text}</div>;
  }
}

export default OnLineStatusBanner;
