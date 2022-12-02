import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AddOrderScreen } from "@screens/AddOrderScreen";
import { PickScreenProps } from "@types";

const PickNavigator = createNativeStackNavigator<PickScreenProps>();

export const PickScreen = () => {
  return (
    <PickNavigator.Navigator
      initialRouteName="AddOrderScreen"
      screenOptions={{ animation: "slide_from_right", headerShown: false }}
    >
      <PickNavigator.Screen component={AddOrderScreen} name="AddOrderScreen" />
    </PickNavigator.Navigator>
  );
};
