import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { LoginScreen } from "@screens/LoginScreen";
import type { AuthScreenProps } from "@types";

const AuthNavigator = createNativeStackNavigator<AuthScreenProps>();

export const AuthScreen = () => {
  return (
    <AuthNavigator.Navigator
      initialRouteName="LoginScreen"
      screenOptions={{ headerShown: false }}
    >
      <AuthNavigator.Screen component={LoginScreen} name="LoginScreen" />
    </AuthNavigator.Navigator>
  );
};
