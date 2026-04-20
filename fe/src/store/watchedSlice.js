import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { addWatchedMovie, deleteWatchedMovie, getWatchedMovies } from "../utils/api"

// ASYNC THUNKS

export const fetchWatched = createAsyncThunk(
  'watched/fetchWatched',
  async () => {
    return await getWatchedMovies()
  }
)

export const fetchAddWatched = createAsyncThunk(
  'watched/fetchAddWatched',
  async (movie) => {
    return await addWatchedMovie(movie)
  }
)

export const fetchDeleteWatched = createAsyncThunk(
  'watched/fetchDeleteWatched',
  async (imdbID) => {
    return await deleteWatchedMovie(imdbID)
  }
)

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
  },
  extraReducers: (builder) => {
    builder.addCase(fetchWatched.fulfilled, (state, action) => {
      state.watched = action.payload
    })
    builder.addCase(fetchAddWatched.fulfilled, (state, action) => {
      state.watched.push(action.payload)
    })
    builder.addCase(fetchDeleteWatched.fulfilled, (state, action) => {
      state.watched = state.watched.filter(m => m.imdbID !== action.payload.imdbID)
    })
  }
})


export const { setWatched, upsertMovie, addMovie, removeMovie } = watchedSlice.actions
export default watchedSlice.reducer