import React from 'react';
import '../../stylesheets/MessagesBox.scss';
import 'font-awesome/css/font-awesome.min.css';

const propTypes = {
  statusMessage: React.PropTypes.shape({
    message: React.PropTypes.string,
    status: React.PropTypes.string,
  }),
};

class MessagesBox extends React.Component {
  shouldComponentUpdate(nextProps) {
    // update component only when receiving a new message
    if (this.props.statusMessage.message !== nextProps.statusMessage.message) {
      return true;
    }
    return false;
  }
  render() {
    let className = 'message-box';
    const { message, status } = this.props.statusMessage;
    if (!!message) {
      className += ' active';
    }
    let statusIcon;
    switch (status) {
      case 'info': {
        statusIcon = 'info-circle';
        break;
      }
      case 'success': {
        statusIcon = 'check-circle';
        break;
      }
      case 'error': {
        statusIcon = 'exclamation';
        break;
      }
      default: {
        statusIcon = 'info-circle';
        break;
      }
    }
    return (
      <div className={className}>
        <div className="message-content">
          <i className={`fa fa-${statusIcon}`} aria-hidden></i>
          <span style={{ marginLeft: 20 }}>{message}</span>
        </div>
      </div>
    );
  }
}

MessagesBox.propTypes = propTypes;
export default MessagesBox;
