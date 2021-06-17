import React from "react";
import { INavigation } from "./useNavigation";
import { IValueSetList } from "./useValueSet";
import { IUtils } from "./utils";

export interface IAppContext {
    navigation?: INavigation;
    valueSets?: IValueSetList;
    utils?: IUtils;
}

const AppContext = React.createContext<IAppContext>({});

export default AppContext;