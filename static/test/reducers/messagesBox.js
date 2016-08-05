import expect from 'expect';
import deepFreeze from 'deep-freeze';
import '../../src/polyfills/Object.assign';
import { displaySystemMessage } from '../../src/actions/messagesBox';
import { default as reducer, initialState } from '../../src/reducers/messagesBox';
import { MESSAGE_STATUS } from '../../src/constants';

describe('messsagesBox reducer', () => {
  it('should return initialState', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });
  describe('displaySystemMessage', () => {
    const stateBefore = initialState;
    const testMessage = 'Test message';
    const action = displaySystemMessage(testMessage, MESSAGE_STATUS.INFO);
    deepFreeze(stateBefore);  // ensure reducer's purity
    const stateAfter = Object.assign({}, stateBefore, {
      message: testMessage,
      status: MESSAGE_STATUS.INFO,
    });
    it('correctly updates state', () => {
      expect(reducer(stateBefore, action)).toEqual(stateAfter);
    });
    // 'info' status should be assigned by default
    const actionWithoutStatus = displaySystemMessage(testMessage);
    it('correctly assigns default status', () => {
      expect(reducer(stateBefore, actionWithoutStatus)).toEqual(stateAfter);
    });
    const actionWithErrorStatus = displaySystemMessage(testMessage, MESSAGE_STATUS.ERROR);
    const stateAfterErrorStatus = Object.assign({}, stateBefore, {
      message: testMessage,
      status: MESSAGE_STATUS.ERROR,
    });
    it('correctly assign error status', () => {
      expect(reducer(stateBefore, actionWithErrorStatus)).toEqual(stateAfterErrorStatus);
    });
  });
});
