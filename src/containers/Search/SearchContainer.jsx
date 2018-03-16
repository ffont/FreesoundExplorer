import React from 'react';
import { connect } from 'react-redux';
import { DEFAULT_QUERY, PERFORM_QUERY_AT_MOUNT } from 'constants';
import InputTextButton from 'components/Input/InputTextButton';
import SelectWithLabel from 'components/Input/SelectWithLabel';
import SliderRange from 'components/Input/SliderRange';
import { updateSorting, updateDescriptor, updateMinDuration, updateMaxDuration,
  updateMaxResults, updateQuery }
  from './actions';
import { getSounds } from '../Sounds/actions';
import { setExampleQueryDone } from '../Sidebar/actions';

const propTypes = {
  maxResults: React.PropTypes.number,
  maxDuration: React.PropTypes.number,
  minDuration: React.PropTypes.number,
  query: React.PropTypes.string,
  descriptor: React.PropTypes.string,
  sorting: React.PropTypes.string,
  getSounds: React.PropTypes.func,
  isExampleQueryDone: React.PropTypes.bool,
  updateDescriptor: React.PropTypes.func,
  updateSorting: React.PropTypes.func,
  updateMinDuration: React.PropTypes.func,
  updateMaxDuration: React.PropTypes.func,
  updateMaxResults: React.PropTypes.func,
  updateQuery: React.PropTypes.func,
  setExampleQueryDone: React.PropTypes.func,
};

class QueryBox extends React.Component {
  constructor(props) {
    super(props);
    this.submitQuery = this.submitQuery.bind(this);
    this.tryQueryAtMount = this.tryQueryAtMount.bind(this);
  }

  componentDidMount() {
    if (PERFORM_QUERY_AT_MOUNT) {
      // query at mount to have the user play with something with no additional interaction
      if (!this.props.isExampleQueryDone) {
        this.tryQueryAtMount();
      }
    }
  }

  tryQueryAtMount() {
    if (sessionStorage.getItem('appToken')) {
      this.submitQuery();
      this.props.setExampleQueryDone();
    } else {
      setTimeout(this.tryQueryAtMount, 500);
    }
  }

  submitQuery() {
    let { query } = this.props;
    const { sorting, descriptor, maxResults, minDuration, maxDuration } = this.props;
    const queryParams = { sorting, descriptor, maxResults, minDuration, maxDuration };
    if (!query.length) {
      query = DEFAULT_QUERY;
    }
    this.props.getSounds(query, queryParams);
  }

  render() {
    return (
      <form
        id="query-form"
        className="QueryForm"
        onSubmit={(evt) => {
          evt.preventDefault();
          this.submitQuery();
        }}
      >
        <InputTextButton
          onTextChange={(evt) => {
            const query = evt.target.value;
            this.props.updateQuery(query);
          }}
          currentValue={this.props.query}
          tabIndex="0"
          placeholder="query terms, e.g.: instruments"
          buttonIcon="fa fa-search fa-lg"
        />
        <SelectWithLabel
          onChange={(evt) => {
            const descriptor = evt.target.value;
            this.props.updateDescriptor(descriptor);
          }}
          options={[{ value: 'lowlevel.mfcc.mean', name: 'Timbre' },
            { value: 'tonal.hpcp.mean', name: 'Tonality' }]}
          label="Arrange by"
          tabIndex="0"
          defaultValue={this.props.descriptor}
        />
        <SelectWithLabel
          onChange={(evt) => {
            const sorting = evt.target.value;
            this.props.updateSorting(sorting);
          }}
          options={[
            { value: 'rating', name: 'Rating' },
            { value: 'duration', name: 'Duration' },
            // { value: '', name: '' },
            // { value: '', name: '' },
            // { value: '', name: '' },
            // { value: '', name: '' },
            // { value: '', name: '' },
            // { value: '', name: '' },
          ]}
          label="Sort by"
          tabIndex="0"
          defaultValue={this.props.sorting}
        />
        <SliderRange
          label="Number of results"
          minValue="20"
          maxValue="450"
          onChange={(evt) => {
            const maxResults = evt.target.value;
            this.props.updateMaxResults(maxResults);
          }}
          currentValue={this.props.maxResults}
          tabIndex="0"
          id="max-results-slider"
        />
        <SliderRange
          label="Maximum duration"
          minValue="0.5"
          maxValue="30"
          step="0.5"
          onChange={(evt) => {
            const maxDuration = evt.target.value;
            this.props.updateMaxDuration(maxDuration);
          }}
          currentValue={this.props.maxDuration}
          tabIndex="0"
          id="max-duration-slider"
        />
      </form>
    );
  }
}

const mapStateToProps = (state) => {
  const { isExampleQueryDone } = state.sidebar;
  return Object.assign({}, { isExampleQueryDone }, state.search);
};

QueryBox.propTypes = propTypes;
export default connect(mapStateToProps, {
  getSounds,
  setExampleQueryDone,
  updateDescriptor,
  updateSorting,
  updateMinDuration,
  updateMaxDuration,
  updateMaxResults,
  updateQuery,
})(QueryBox);
