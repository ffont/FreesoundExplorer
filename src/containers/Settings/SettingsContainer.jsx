import React from 'react';
import { connect } from 'react-redux';
import CheckBox from 'components/Input/CheckBox.jsx';
import { togglePlayOnHover } from './actions';

const propTypes = {
  shouldPlayOnHover: React.PropTypes.bool,
  togglePlayOnHover: React.PropTypes.func,
};

const SettingsContainer = props => (
  <CheckBox
    checked={props.shouldPlayOnHover}
    onChange={props.togglePlayOnHover}
    label="Play on hover"
    tabIndex="0"
  />
);

SettingsContainer.propTypes = propTypes;
const mapStateToProps = state => state.settings;
export default connect(mapStateToProps, { togglePlayOnHover })(SettingsContainer);
