import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { PutAwayItemsScreen, SelectItems } from "./screens";

export type PutStockAwayProps = {
  SelectItems: undefined;
  PutAwayItems: undefined;
};

const PutStockAwayStack = createNativeStackNavigator<PutStockAwayProps>();

export const PutStockAwayScreen = () => {
  return (
    <PutStockAwayStack.Navigator
      screenOptions={{ animation: "slide_from_right", headerShown: false }}
    >
      <PutStockAwayStack.Screen component={SelectItems} name="SelectItems" />
      <PutStockAwayStack.Screen
        component={PutAwayItemsScreen}
        name="PutAwayItems"
      />
    </PutStockAwayStack.Navigator>
  );
};
