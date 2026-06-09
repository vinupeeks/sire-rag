import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    toggleBar: false,
    snackbar: {
        open: false,
        message: '',
        description: '',
        severity: 'success',
        position: 'top-center'
    },
    fullVersion: false
};

const optionSlice = createSlice({
    name: 'options',
    initialState,
    reducers: {
        toggleBar: (state) => {
            state.toggleBar = !state.toggleBar;
        },
        setToggleFalse: (state) => {
            state.toggleBar = false;
        },
        setToggleTrue: (state) => {
            state.toggleBar = true;
        },
        toggleSnackbar: (state, action) => {
            state.snackbar = action.payload;
        },
        setFullVersion: (state, action) => {
            state.fullVersion = action.payload;
        },
    },
});

export const { toggleBar, setToggleFalse, setToggleTrue, toggleSnackbar, setFullVersion } = optionSlice.actions;
export default optionSlice.reducer;