// good https://github.com/reduxjs/cra-template-redux/blob/master/template/src/app/store.js

import { configureStore } from '@reduxjs/toolkit';
import dockSlice from './dockSlice';

export const store = configureStore({
  reducer: {
    dock: dockSlice
  },
});