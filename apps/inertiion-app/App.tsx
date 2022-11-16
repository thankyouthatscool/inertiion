import "react-native-gesture-handler";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider as ReduxProvider } from "react-redux";

import { apiUrl } from "./api.json";
import { PutStockAwayScreen, SettingsScreen } from "./screens";
import { store, useAppSelector } from "./store";
import { trpc } from "./utils";

export const App = () => {
  return (
    <ReduxProvider store={store}>
      <AppRoot />
    </ReduxProvider>
  );
};

export type RootDrawerParamList = {
  PutStockAwayScreen: undefined;
  SettingsScreen: undefined;
};

const Drawer = createDrawerNavigator<RootDrawerParamList>();

export const AppRoot = () => {
  const { customApiUrl } = useAppSelector(({ app }) => app);

  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [httpBatchLink({ url: `${customApiUrl || apiUrl}/trpc` })],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <SafeAreaProvider>
            <StatusBar style="auto" />
            <Drawer.Navigator
              initialRouteName="PutStockAwayScreen"
              screenOptions={{ headerShown: false }}
            >
              <Drawer.Screen
                component={PutStockAwayScreen}
                name="PutStockAwayScreen"
                options={{ title: "Put Stock Away" }}
              />
              <Drawer.Screen
                component={SettingsScreen}
                name="SettingsScreen"
                options={{ title: "Settings" }}
              />
            </Drawer.Navigator>
          </SafeAreaProvider>
        </NavigationContainer>
      </QueryClientProvider>
    </trpc.Provider>
  );
};
