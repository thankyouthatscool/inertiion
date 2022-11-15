import { registerRootComponent } from "expo";
import { gestureHandlerRootHOC } from "react-native-gesture-handler";

import { App } from "./App";

const AppHOCWrapper = gestureHandlerRootHOC(() => <App />);

registerRootComponent(AppHOCWrapper);
