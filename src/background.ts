import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { State } from "./types.ts";

const initialState: State = {
  data: null,
  isLoading: false,
  error: null,
};

const reducer = (state = initialState, action: any) => {
  switch (action.type) {
    case "FETCH_DATA_BEGIN":
      return { ...state, isLoading: true };
    case "FETCH_DATA_SUCCESS":
      return { ...state, isLoading: false, data: action.payload };
    case "FETCH_DATA_ERROR":
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
};

const store = createStore(reducer, applyMiddleware(thunk));

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "FETCH_DATA") {
    // Fetch data from chrome storage if available
    chrome.storage.local.get(["data"], function (result) {
      // Send data to popup
      console.log("result.data: ", result.data);
      sendResponse({ data: result.data });

      // Then, fetch updated data from API
      store.dispatch(fetchDataFromApi());
    });
  }
  return true; // Will respond asynchronously.
});

const fetchDataFromApi = () => async (dispatch) => {
  dispatch({ type: "FETCH_DATA_BEGIN" });

  try {
    const response = await fetch("https://pokeapi.co/api/v2/pokemon/ditto");
    const data = await response.json();

    dispatch({ type: "FETCH_DATA_SUCCESS", payload: data });

    // Persist data in Chrome storage
    await chrome.storage.local.set({ data });
  } catch (error) {
    dispatch({ type: "FETCH_DATA_ERROR", payload: error });
  }
};
