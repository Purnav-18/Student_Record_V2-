import React, { useReducer } from 'react';
import './StudentRecordsV2.css';

const subjects = ['Math', 'Science', 'English', 'History', 'Computer'];

const initialState = {
  name: '',
  age: '',
  marks: ['', '', '', '', ''],
  records: [],
  editingIndex: null,
  percentage: '',
  division: '',
  search: '',
  filterDivision: '',
  error: '', // for validation error
};

// function to calculate percentage & division
const calculateResult = (marks) => {
  const total = marks.reduce((sum, mark) => sum + Number(mark || 0), 0);
  const percentage = total / marks.length;
  let division = '';
  if (percentage >= 60) division = 'First';
  else if (percentage >= 50) division = 'Second';
  else if (percentage >= 35) division = 'Third';
  else division = 'Fail';
  return { percentage: percentage.toFixed(2), division };
};

// validation function
const validate = (state) => {
  if (!/^[a-zA-Z\s]+$/.test(state.name)) {
    return 'Name should contain only letters';
  }
  if (!/^\d+$/.test(state.age)) {
    return 'Age should be a number';
  }
  for (let mark of state.marks) {
    if (!/^\d+$/.test(mark) || Number(mark) > 100) {
      return 'Marks should be numbers between 0 and 100';
    }
  }
  return '';
};

const addOrUpdateRecord = (state) => {
  const error = validate(state);
  if (error) {
    return { ...state, error };
  }

  const newMarks = state.marks.map((m) => parseInt(m) || 0);
  const { percentage, division } = calculateResult(newMarks);
  const newRecord = {
    name: state.name,
    age: state.age,
    marks: newMarks,
    percentage,
    division,
  };

  const updatedRecords = [...state.records];
  if (state.editingIndex !== null) {
    updatedRecords[state.editingIndex] = newRecord;
  } else {
    updatedRecords.push(newRecord);
  }

  return {
    ...state,
    records: updatedRecords,
    name: '',
    age: '',
    marks: ['', '', '', '', ''],
    editingIndex: null,
    percentage,
    division,
    error: '',
  };
};

const editRecord = (state, index) => {
  const record = state.records[index];
  return {
    ...state,
    name: record.name,
    age: record.age,
    marks: record.marks.map((m) => m.toString()),
    editingIndex: index,
    percentage: record.percentage,
    division: record.division,
    error: '',
  };
};

const deleteRecord = (state, index) => {
  const updated = state.records.filter((_, i) => i !== index);
  return { ...state, records: updated };
};

const clearAll = () => ({
  ...initialState,
  records: [],
});

function reducer(state, action) {
  switch (action.type) {
    case 'SET_NAME':
      return { ...state, name: action.payload };
    case 'SET_AGE':
      return { ...state, age: action.payload };
    case 'SET_MARK':
      const newMarks = [...state.marks];
      newMarks[action.payload.index] = action.payload.value;
      return { ...state, marks: newMarks };
    case 'SUBMIT':
      return addOrUpdateRecord(state);
    case 'EDIT':
      return editRecord(state, action.payload);
    case 'DELETE':
      return deleteRecord(state, action.payload);
    case 'CLEAR':
      return clearAll();
    case 'SET_SEARCH':
      return { ...state, search: action.payload };
    case 'SET_FILTER_DIVISION':
      return { ...state, filterDivision: action.payload };
    default:
      return state;
  }
}

function StudentRecordsV2() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const filteredRecords = state.records.filter((record) => {
    const matchesSearch = record.name.toLowerCase().includes(state.search.toLowerCase());
    const matchesDivision = state.filterDivision ? record.division === state.filterDivision : true;
    return matchesSearch && matchesDivision;
  });

  return (
    <div className="container">
      <div className="form-box">
        <label>Student Name :</label>
        <input
          type="text"
          value={state.name}
          onChange={(e) => dispatch({ type: 'SET_NAME', payload: e.target.value })}
        />

        <label>Age :</label>
        <input
          type="text"
          value={state.age}
          onChange={(e) => dispatch({ type: 'SET_AGE', payload: e.target.value })}
        />

        {subjects.map((subj, index) => (
          <div key={index}>
            <label>{subj} Marks :</label>
            <input
              type="text"
              value={state.marks[index]}
              onChange={(e) =>
                dispatch({
                  type: 'SET_MARK',
                  payload: { index, value: e.target.value },
                })
              }
            />
          </div>
        ))}

        <button className="submit-btn" onClick={() => dispatch({ type: 'SUBMIT' })}>
          {state.editingIndex !== null ? 'Update' : 'Submit'}
        </button>
        <button className="clear-btn" onClick={() => dispatch({ type: 'CLEAR' })}>
          Clear All
        </button>

        {state.error && (
          <div className="result red">{state.error}</div>
        )}

        {state.percentage && !state.error && (
          <div className="result green">
            Percentage: {state.percentage}% | Division: {state.division}
          </div>
        )}
      </div>

      <div className="table-container">
        <div className="filter-container">
          <input
            type="text"
            placeholder="Search by name"
            value={state.search}
            onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
          />
          <select
            value={state.filterDivision}
            onChange={(e) => dispatch({ type: 'SET_FILTER_DIVISION', payload: e.target.value })}
          >
            <option value="">All Divisions</option>
            <option value="First">First</option>
            <option value="Second">Second</option>
            <option value="Third">Third</option>
            <option value="Fail">Fail</option>
          </select>
        </div>

        <div className="table-scroll">
          <table className="record-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                {subjects.map((subj) => (
                  <th key={subj}>{subj}</th>
                ))}
                <th>%</th>
                <th>Division</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record, index) => (
                <tr key={index}>
                  <td>{record.name}</td>
                  <td>{record.age}</td>
                  {record.marks.map((mark, i) => (
                    <td key={i}>{mark}</td>
                  ))}
                  <td>{record.percentage}</td>
                  <td>{record.division}</td>
                  <td>
                    <div className="btn-group">
                      <button onClick={() => dispatch({ type: 'EDIT', payload: index })}>Edit</button>
                      <button onClick={() => dispatch({ type: 'DELETE', payload: index })}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StudentRecordsV2;
