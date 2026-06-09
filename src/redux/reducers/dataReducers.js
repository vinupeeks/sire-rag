import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    vesselName: '',
    darkMode: true,
};

const dataSlice = createSlice({
    name: 'data',
    initialState,
    reducers: {
        setVesselName: (state, action) => {
            state.vesselName = action.payload;
        },

        toggleDarkMode: (state) => {
            state.darkMode = !state.darkMode;
        },

        setDarkMode: (state, action) => {
            state.darkMode = action.payload;
        },
    },
});

export const {
    setVesselName,
    toggleDarkMode,
    setDarkMode,
} = dataSlice.actions;

export default dataSlice.reducer;