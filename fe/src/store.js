import { configureStore } from "@reduxjs/toolkit";
import watchedReducer from './store/watchedSlice'
import uiReducer from './store/uiSlice'
import authReducer from './store/authSlice'

const store = configureStore({
  reducer: {
    watched: watchedReducer,
    ui: uiReducer,
    auth: authReducer
  }
})

export default store