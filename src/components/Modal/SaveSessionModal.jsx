import React from 'react';
import ModalTitle from './ModalTitle';
import InputTextButton from '../Input/InputTextButton';
import '././SaveSessionModal.scss';

const propTypes = {
  currentSessionName: React.PropTypes.string,
  saveSessionAs: React.PropTypes.func,
};

class SaveSessionModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = { currentName: props.currentSessionName };
    this.submitSaveAs = this.submitSaveAs.bind(this);
  }

  updateInput(evt) {
    const newSessionName = evt.target.value;
    this.setState({
      currentName: newSessionName,
    });
  }

  submitSaveAs(evt) {
    evt.preventDefault();
    this.props.saveSessionAs(this.state.currentName);
  }

  render() {
    return (
      <div className="SaveSessionModal">
        <ModalTitle title="Save session" />
        <form
          className="SaveSessionModal__content"
          onSubmit={this.submitSaveAs}
        >
          <InputTextButton
            placeholder="Session Name"
            value={this.state.currentName}
            onTextChange={evt => this.updateInput(evt)}
            buttonIcon="fa fa-lg fa-save"
          />
        </form>
      </div>
    );
  }
}

SaveSessionModal.propTypes = propTypes;
export default SaveSessionModal;