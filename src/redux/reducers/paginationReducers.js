import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentPage: 0,
};

const paginationSlice = createSlice({
  name: 'pagination',
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
    resetPage: (state) => {
      state.currentPage = 0
    }
  },
});

export const { setPage, resetPage } = paginationSlice.actions;
export default paginationSlice.reducer;