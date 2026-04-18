import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  query: '',
  selectedId: null,
  moviesCount: 0
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setQuery(state, action) {
      // payload === searchInput
      state.query = action.payload
    },
    setSelected(state, action) {
      state.selectedId = state.selectedId === action.payload ? null : action.payload
    },
    setMoviesCount(state, action) {
      // payload === moviesLength
      state.movieCount = action.payload
    }
  }
})

export const { setQuery, setSelected, setMoviesCount } = uiSlice.actions
export default uiSlice.reducer
