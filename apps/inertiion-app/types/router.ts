import type { DrawerScreenProps } from "@react-navigation/drawer";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootNavigatorProps = {
  AuthScreen: undefined;
  PickScreen: undefined;
  SettingsScreen: undefined;
};

export type AuthScreenProps = {
  LoginScreen: undefined;
  SignUpScreen: undefined;
};

export type PickScreenProps = {
  AddOrderScreen: undefined;
  EditOrderScreen: undefined;
  PickOrderItemsScreen: undefined;
};

export type AddOrderScreenProps = CompositeScreenProps<
  NativeStackScreenProps<PickScreenProps, "AddOrderScreen">,
  DrawerScreenProps<RootNavigatorProps>
>;
