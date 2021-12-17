import React, { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { ProgressSpinner } from "primereact/progressspinner";
import { DataTable } from "primereact/datatable";
import "./App.css";
import { Column } from "primereact/column";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import 'primeflex/primeflex.css';
import { useAppDispatch, useAppSelector } from "./stores/hooks";
import { getRemainingSearchAsync, getUserAsync, removeUsers, selectCurrentUsername, selectError, selectRemainingSearchTime, selectUsers, setCurrentUsername } from "./stores/userSlice";
import { REQUEST_ITEMS_PER_PAGE } from "./helpers/constants";
import { IUser } from "./models/user.model";
const App = () => {
  // Redux
  const dispatch = useAppDispatch();
  const usersInStore = useAppSelector(selectUsers);
  const remainingSearchTime = useAppSelector(selectRemainingSearchTime);
  const currentUsername = useAppSelector(selectCurrentUsername);
  const error = useAppSelector(selectError);

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Functions
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(getRemainingSearchAsync())
    }, 60000);
    return () => clearInterval(interval);
  },[]);
  
 
  const searchUsername = async (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setCurrentUsername(event.target.value));
    if (event.target.value.length >= 3) {
      const requestModel = {
        q: encodeURIComponent(event.target.value),
        per_page: REQUEST_ITEMS_PER_PAGE
      }
      setIsLoading(true);
      dispatch(getUserAsync(requestModel)).then((response: any) => {
        setIsLoading(false);
        if (response.error) {
          setErrorMessage(response.error.message);
        } else {
          setErrorMessage("");
        }
      });
    } else {
      dispatch(removeUsers());
    }
  };

  const avatarTemplate = (rowData: IUser) => {
    return (
      <img
        src={`${rowData.avatar_url}`}
        alt={rowData.login}
        width={50}
      />
    );
  };
  return (
    <>
      <div className="p-grid p-dir-col p-jc-center p-ai-center">
        <div className="p-col">
          <span className="p-mr-4">Search Username: </span>{" "}
          <InputText
            autoFocus={true}
            value={currentUsername}
            onChange={searchUsername}
            disabled={remainingSearchTime === 0 || error.includes("403")}
            key="search-input-field"
          ></InputText>
          
        </div>
        <div className="p-col">
          {(remainingSearchTime > 0 && !error.includes("403"))? <span>You can search {remainingSearchTime} more time(s)</span> : <span>You can not search anymore, have to wait a little bit</span>}
        </div>
        <div className="p-col">
          {errorMessage !== "" ? <span style={{color: "red"}}>{errorMessage}</span> : null}
        </div>
        <div className="p-col" style={{width: "90%"}}>
          {isLoading ? (
            <ProgressSpinner className="p-d-flex p-jc-center"/>
          ) : (
            <>
              <DataTable
                value={usersInStore}
                header={"User"}
                responsiveLayout="scroll"
              >
                <Column field="login" header="Username"></Column>
                <Column header="Avatar" body={avatarTemplate}></Column>
                <Column field="type" header="Type"></Column>
                <Column field="score" header="score"></Column>
              </DataTable>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default App;
