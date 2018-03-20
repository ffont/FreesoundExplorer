import { default as UUID } from 'node-uuid';
import makeActionCreator from 'utils/makeActionCreator';
import { MESSAGE_STATUS, MAX_TSNE_ITERATIONS } from 'constants';
import 'polyfills/requestAnimationFrame';
import { displaySystemMessage } from '../MessagesBox/actions';
import { submitQuery, reshapeReceivedSounds } from '../Search/utils';
import { setSpaceAsCenter } from '../Spaces/actions';
import { getTrainedTsne, computePointsPositionInSolution } from './utils';

export const FETCH_SOUNDS_REQUEST = 'FETCH_SOUNDS_REQUEST';
export const FETCH_SOUNDS_SUCCESS = 'FETCH_SOUNDS_SUCCESS';
export const FETCH_SOUNDS_FAILURE = 'FETCH_SOUNDS_FAILURE';
export const UPDATE_SOUNDS_POSITION = 'UPDATE_SOUNDS_POSITION';
export const MAP_COMPUTATION_COMPLETE = 'MAP_COMPUTATION_COMPLETE';
export const SELECT_SOUND_BY_ID = 'SELECT_SOUND_BY_ID';
export const DESELECT_SOUND_BY_ID = 'DESELECT_SOUND_BY_ID';
export const GET_SOUND_BUFFER = 'GET_SOUND_BUFFER';
export const TOGGLE_HOVERING_SOUND = 'TOGGLE_HOVERING_SOUND';
export const REMOVE_SOUND = 'REMOVE_SOUND';

// no need to exports all these actions as they will be used internally in getSounds
const fetchRequest = makeActionCreator(FETCH_SOUNDS_REQUEST, 'queryID', 'query', 'queryParams');
const fetchSuccess = makeActionCreator(FETCH_SOUNDS_SUCCESS, 'sounds', 'queryID', 'mapPosition');
const fetchFailure = makeActionCreator(FETCH_SOUNDS_FAILURE, 'error', 'queryID');
const updateSoundsPosition = makeActionCreator(UPDATE_SOUNDS_POSITION, 'sounds', 'queryID');
const mapComputationComplete = makeActionCreator(MAP_COMPUTATION_COMPLETE, 'queryID');

export const selectSound = makeActionCreator(SELECT_SOUND_BY_ID, 'soundID');
export const deselectSound = makeActionCreator(DESELECT_SOUND_BY_ID, 'soundID');
export const getSoundBuffer = makeActionCreator(GET_SOUND_BUFFER, 'soundID', 'buffer');
export const toggleHoveringSound = makeActionCreator(TOGGLE_HOVERING_SOUND, 'soundID');

export const removeSound = soundID => (dispatch, getStore) => {
  const store = getStore();
  const sound = store.sounds.byID[soundID];
  const { queryID } = sound;
  dispatch({ type: REMOVE_SOUND, soundID, queryID });
};

export const deselectAllSounds = () => (dispatch, getStore) => {
  const selectedSounds = getStore().sounds.selectedSounds;
  selectedSounds.forEach(sound => dispatch(deselectSound(sound)));
};

let clearTimeoutId;
let progress = 0;

const updateProgress = (sounds, stepIteration) => (dispatch) => {
  const computedProgress = (stepIteration + 1) / MAX_TSNE_ITERATIONS;
  const computedProgressPercentage = parseInt(100 * computedProgress, 10);
  if (progress !== computedProgressPercentage) {
    // update status message only with new percentage
    progress = computedProgressPercentage;
    const soundsLength = Object.keys(sounds).length;
    const statusMessage =
      `${soundsLength} sounds loaded, computing map (${progress}%)`;
    dispatch(displaySystemMessage(statusMessage));
  }
};

const centerMapAtNewSpace = queryID => (dispatch, getStore) => {
  const space = getStore().spaces.spaces.find(curSpace => curSpace.queryID === queryID);
  dispatch(setSpaceAsCenter(space));
};

const handleFinalStep = queryID => (dispatch) => {
  cancelAnimationFrame(clearTimeoutId);
  dispatch(displaySystemMessage('Map computed!', MESSAGE_STATUS.SUCCESS));
  dispatch(mapComputationComplete(queryID));
};

const updateSounds = (tsne, sounds, queryID) => (dispatch, getStore) => {
  const soundsWithUpdatedPosition = computePointsPositionInSolution(tsne, sounds, getStore());
  dispatch(updateSoundsPosition(soundsWithUpdatedPosition, queryID));
  return soundsWithUpdatedPosition;
};

const computeTsneSolution = (tsne, sounds, queryID, stepIteration = 0) => (dispatch) => {
  /** we retrieve the store at each step to take into account user zooming/moving
  while map being computed */
  if (stepIteration <= MAX_TSNE_ITERATIONS) {
    // compute step solution
    tsne.step();
    if (!stepIteration) {
      dispatch(centerMapAtNewSpace(queryID));
    }
    dispatch(updateProgress(sounds, stepIteration));
    dispatch(updateSounds(tsne, sounds, queryID));
    clearTimeoutId = requestAnimationFrame(() =>
      dispatch(computeTsneSolution(tsne, sounds, queryID, stepIteration + 1)));
  } else {
    dispatch(handleFinalStep(queryID));
  }
};


/**
 * Function for calling FS and creating a map for the received sounds.
 *
 * @type {string} query: the query (e.g. 'instrument note')
 * @type {object} queryParams: the parameters of the query
 *       (descriptor, maxResults, maxDuration, minDuration)
 */
export const getSounds = (query, queryParams) => (dispatch, getStore) => {
  dispatch(displaySystemMessage('Searching for sounds...'));
  const queryID = UUID.v4();
  dispatch(fetchRequest(queryID, query, queryParams));
  const { maxResults, maxDuration, sorting } = queryParams;
  submitQuery(query, maxResults, maxDuration, sorting).then(
    (allPagesResults) => {
      const sounds = reshapeReceivedSounds(allPagesResults, queryID);
      const soundsFound = Object.keys(sounds).length;
      if (!soundsFound) {
        dispatch(displaySystemMessage('No sounds found', MESSAGE_STATUS.ERROR));
        dispatch(fetchFailure('no sounds', queryID));
        return;
      }
      const mapPosition = getStore().map;
      dispatch(fetchSuccess(sounds, queryID, mapPosition));
      dispatch(displaySystemMessage(`${soundsFound} sounds loaded, computing map`));
      const tsne = getTrainedTsne(sounds, queryParams);
      dispatch(computeTsneSolution(tsne, sounds, queryID));
    },
    (error) => {
      dispatch(displaySystemMessage('No sounds found', MESSAGE_STATUS.ERROR));
      dispatch(fetchFailure(error, queryID));
    }
  );
};
