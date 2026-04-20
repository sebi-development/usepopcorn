import { configureStore } from "@reduxjs/toolkit";
import watchedReducer from './store/watchedSlice'
import uiReducer from './store/uiSlice'

const store = configureStore({
  reducer: {
    watched: watchedReducer,
    ui: uiReducer,
  }
})

export default store