import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  watched: [],
}

const watchedSlice = createSlice({
  name: 'watched',
  initialState,
  reducers: {
    setWatched(state, action) {
      state.watched = action.payload
    },
    upsertMovie(state, action) {
      const index = state.watched.findIndex(movie => movie.imdbID === action.payload.imdbID)

      if (index === -1) {
        state.watched.push(action.payload)
        return
      }

      state.watched[index] = action.payload
    },
    addMovie(state, action) {
      // payload === watched movie
      state.watched.push(action.payload)
    },
    removeMovie(state, action) {
      // payload === id
      state.watched = state.watched.filter(m => m.imdbID !== action.payload)

    }
  }
})

export const { setWatched, upsertMovie, addMovie, removeMovie } = watchedSlice.actions
export default watchedSlice.reducer