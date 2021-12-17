import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { INITIAL_RATE_LIMIT } from "../helpers/constants";
import { IGetUserRequest } from "../models/request.getUser.model";
import { IUser } from "../models/user.model";
import { RootState } from "./store";

export interface IUserState {
  currentUsername: string;
  users: IUser[];
  remainingSearchTime: number;
  error: string;
}

const initialState: IUserState = {
  currentUsername: "",
  users: [],
  remainingSearchTime: INITIAL_RATE_LIMIT,
  error: "",
};

export const getUserAsync = createAsyncThunk(
  "user/getUser",
  async (requestModel: IGetUserRequest, thunkApi) => {
    try {
      const response = axios.get("https://api.github.com/search/users", {
        params: requestModel,
      });
      return response;
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: error });
    }
  }
);

export const getRemainingSearchAsync = createAsyncThunk(
  "user/remainingSearch",
  async (_, thunkApi) => {
    try {
      const response = axios.get("https://api.github.com/rate_limit");
      return response;
    } catch (error: any) {
      return thunkApi.rejectWithValue({ error: error });
    }
  }
);

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    removeUsers: (state) => {
      state.users = [];
    },
    setCurrentUsername: (state, action: PayloadAction<string>) => {
      state.currentUsername = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserAsync.fulfilled, (state, action) => {
        state.users = action.payload.data.items;
        state.error = "";
        state.remainingSearchTime = parseInt(
          action.payload.headers["x-ratelimit-remaining"]
        );
      })
      .addCase(getUserAsync.rejected, (state, action) => {
        state.error = action.error.message!;
        if (action.error.message?.includes("422")) {
          state.remainingSearchTime -= 1;
        }
        console.log(state.error);
      })
      .addCase(getRemainingSearchAsync.fulfilled, (state, action) => {
        state.error = "";
        state.remainingSearchTime =
          action.payload.data.resources.search.remaining;
      });
  },
});

export const { setCurrentUsername, removeUsers } = userSlice.actions;

export const selectUsers = (state: RootState) => state.users;
export const selectRemainingSearchTime = (state: RootState) =>
  state.remainingSearchTime;
export const selectCurrentUsername = (state: RootState) =>
  state.currentUsername;
export const selectError = (state: RootState) => state.error;

export default userSlice.reducer;
