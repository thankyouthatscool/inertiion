import { createDrawerNavigator } from "@react-navigation/drawer";

import { AuthScreen, PickScreen, SettingsScreen } from "@screens";
import { RootNavigatorProps } from "@types";

const RootNavigator = createDrawerNavigator<RootNavigatorProps>();

export const AppRoot = () => {
  return (
    <RootNavigator.Navigator
      initialRouteName="SettingsScreen"
      screenOptions={{ headerShown: false }}
    >
      <RootNavigator.Screen component={AuthScreen} name="AuthScreen" />
      <RootNavigator.Screen component={PickScreen} name="PickScreen" />
      <RootNavigator.Screen component={SettingsScreen} name="SettingsScreen" />
    </RootNavigator.Navigator>
  );
};
