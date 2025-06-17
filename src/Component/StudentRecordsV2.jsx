import React, { useReducer, useMemo } from 'react';
import './StudentRecordsV2.css';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';

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
  errors: {
    name: '',
    age: '',
    marks: ['', '', '', '', ''],
  },
};

const validateName = (name) => /^[A-Za-z ]+$/.test(name);
const validateAge = (age) => /^\d+$/.test(age);
const validateMark = (mark) =>
  /^\d+$/.test(mark) && Number(mark) >= 0 && Number(mark) <= 100;

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

function reducer(state, action) {
  switch (action.type) {
    case 'SET_NAME':
      return {
        ...state,
        name: action.payload,
        errors: {
          ...state.errors,
          name: !validateName(action.payload) ? 'Only letters allowed' : '',
        },
      };
    case 'SET_AGE':
      return {
        ...state,
        age: action.payload,
        errors: {
          ...state.errors,
          age: !validateAge(action.payload) ? 'Enter a valid number' : '',
        },
      };
    case 'SET_MARK':
      const updatedMarks = [...state.marks];
      updatedMarks[action.payload.index] = action.payload.value;

      const updatedMarkErrors = [...state.errors.marks];
      updatedMarkErrors[action.payload.index] = !validateMark(action.payload.value)
        ? 'Enter 0-100'
        : '';

      return {
        ...state,
        marks: updatedMarks,
        errors: {
          ...state.errors,
          marks: updatedMarkErrors,
        },
      };
    case 'SUBMIT':
      const nameError = !validateName(state.name) ? 'Only letters allowed' : '';
      const ageError = !validateAge(state.age) ? 'Enter a valid number' : '';
      const markErrors = state.marks.map((m) =>
        !validateMark(m) ? 'Enter 0-100' : ''
      );

      const hasError =
        nameError || ageError || markErrors.some((e) => e !== '') || state.marks.includes('');
      if (hasError) {
        return {
          ...state,
          errors: {
            name: nameError,
            age: ageError,
            marks: markErrors,
          },
        };
      }

      const parsedMarks = state.marks.map((m) => parseInt(m) || 0);
      const { percentage, division } = calculateResult(parsedMarks);
      const newRecord = {
        name: state.name,
        age: state.age,
        marks: parsedMarks,
        percentage,
        division,
      };

      const newRecords = [...state.records];
      if (state.editingIndex !== null) {
        newRecords[state.editingIndex] = newRecord;
      } else {
        newRecords.push(newRecord);
      }

      return {
        ...initialState,
        records: newRecords,
      };
    case 'EDIT':
      const rec = state.records[action.payload];
      return {
        ...state,
        name: rec.name,
        age: rec.age,
        marks: rec.marks.map((m) => m.toString()),
        editingIndex: action.payload,
        percentage: rec.percentage,
        division: rec.division,
        errors: initialState.errors,
      };
    case 'DELETE':
      return {
        ...state,
        records: state.records.filter((_, i) => i !== action.payload),
      };
    case 'CLEAR':
      return {
        ...initialState,
        records: state.records,
      };
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
    const matchSearch = record.name.toLowerCase().includes(state.search.toLowerCase());
    const matchDivision = state.filterDivision ? record.division === state.filterDivision : true;
    return matchSearch && matchDivision;
  });

  const columns = useMemo(() => [
    { header: 'Name', accessorKey: 'name' },
    { header: 'Age', accessorKey: 'age' },
    ...subjects.map((s, i) => ({
      header: s,
      accessorKey: `marks[${i}]`,
    })),
    { header: '%', accessorKey: 'percentage' },
    { header: 'Division', accessorKey: 'division' },
    {
      header: 'Action',
      cell: ({ row }) => (
        <div className="btn-group">
          <button onClick={() => dispatch({ type: 'EDIT', payload: row.index })}>Edit</button>
          <button onClick={() => dispatch({ type: 'DELETE', payload: row.index })}>Delete</button>
        </div>
      ),
    },
  ], [dispatch]);

  const table = useReactTable({
    data: filteredRecords,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="container">
      <div className="form-box">
        <h3>Student Form</h3>

        <label>Name:</label>
        <input
          className={state.errors.name ? 'error-input' : ''}
          type="text"
          value={state.name}
          onChange={(e) => dispatch({ type: 'SET_NAME', payload: e.target.value })}
        />
        {state.errors.name && <div className="error">{state.errors.name}</div>}

        <label>Age:</label>
        <input
          className={state.errors.age ? 'error-input' : ''}
          type="text"
          value={state.age}
          onChange={(e) => dispatch({ type: 'SET_AGE', payload: e.target.value })}
        />
        {state.errors.age && <div className="error">{state.errors.age}</div>}

        {subjects.map((subj, i) => (
          <div key={i}>
            <label>{subj}:</label>
            <input
              className={state.errors.marks[i] ? 'error-input' : ''}
              type="text"
              value={state.marks[i]}
              onChange={(e) =>
                dispatch({
                  type: 'SET_MARK',
                  payload: { index: i, value: e.target.value },
                })
              }
            />
            {state.errors.marks[i] && <div className="error">{state.errors.marks[i]}</div>}
          </div>
        ))}

        <button className="submit-btn" onClick={() => dispatch({ type: 'SUBMIT' })}>
          {state.editingIndex !== null ? 'Update' : 'Submit'}
        </button>
        <button className="clear-btn" onClick={() => dispatch({ type: 'CLEAR' })}>
          Clear
        </button>

        {state.percentage && (
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
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell ?? cell.column.columnDef.accessorKey, cell.getContext())}
                    </td>
                  ))}
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
