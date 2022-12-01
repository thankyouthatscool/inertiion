import "react-native-gesture-handler";

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import {
  NavigationContainer,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import { Text, ToastAndroid, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider as ReduxProvider } from "react-redux";

import { useAppDispatch } from "@hooks";
import {
  InventoryScreen,
  PickOrderScreen,
  PutStockAwayScreen,
  SettingsScreen,
} from "@screens";
import type { PutStockAwayProps } from "@screens/PutStockAwayScreen";
import { Item, Order, setCatalogData, setOrders, store } from "@store";
import { APP_FONT_SIZE } from "@theme";
import { trpc } from "@utils";
import { apiUrl } from "./api.json";

export const App = () => {
  return (
    <ReduxProvider store={store}>
      <AppRoot />
    </ReduxProvider>
  );
};

export type RootNavigator = {
  Inventory: undefined;
  PickOrdersScreen: undefined;
  PutStockAway: NavigatorScreenParams<PutStockAwayProps>;
  Settings: undefined;
};

const RootNavigator = createDrawerNavigator<RootNavigator>();

const AppRoot = () => {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({ links: [httpBatchLink({ url: `${apiUrl}/trpc` })] })
  );

  const initialLoadRef = useRef<boolean>(false);

  const dispatch = useAppDispatch();

  const performInitialLoad = useCallback(async () => {
    ToastAndroid.show("Setting local data...", ToastAndroid.SHORT);

    const res = await AsyncStorage.getItem("catalogData");
    const orderData = await AsyncStorage.getItem("orders");

    if (res) {
      const catalogData: Item[] = JSON.parse(res);

      dispatch(setCatalogData(catalogData));
    } else {
      dispatch(setCatalogData([]));
    }

    if (orderData) {
      const orders: Order[] = JSON.parse(orderData);

      dispatch(setOrders(orders));
    } else {
      dispatch(setOrders([]));
    }
  }, []);

  useEffect(() => {
    if (!initialLoadRef.current) {
      performInitialLoad();

      initialLoadRef.current = true;
    }
  }, [initialLoadRef]);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <SafeAreaProvider>
            <StatusBar style="auto" />
            <RootNavigator.Navigator
              drawerContent={(props) => <CustomDrawer {...props} />}
              initialRouteName="PickOrdersScreen"
              screenOptions={{ headerShown: false }}
            >
              <RootNavigator.Screen
                component={PickOrderScreen}
                name="PickOrdersScreen"
                options={{ title: "Pick Orders" }}
              />
              <RootNavigator.Screen
                component={PutStockAwayScreen}
                name="PutStockAway"
                options={{ title: "Put Stock Away" }}
              />
              <RootNavigator.Screen
                component={InventoryScreen}
                name="Inventory"
                options={{
                  title: "Inventory",
                }}
              />
              <RootNavigator.Screen
                component={SettingsScreen}
                name="Settings"
                options={{ title: "Settings" }}
              />
            </RootNavigator.Navigator>
          </SafeAreaProvider>
        </NavigationContainer>
      </QueryClientProvider>
    </trpc.Provider>
  );
};

const CustomDrawer = (props: DrawerContentComponentProps) => {
  return (
    <DrawerContentScrollView {...props}>
      <View
        style={{
          alignItems: "center",

          justifyContent: "center",
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: APP_FONT_SIZE * 2 }}>
          INERTiiON
        </Text>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
};
