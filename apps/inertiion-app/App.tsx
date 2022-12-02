import "react-native-gesture-handler";

import { Provider } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";

import { AppRoot } from "@components";
import { store } from "@store";

export const App = () => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <AppRoot />
      </NavigationContainer>
    </Provider>
  );
};
