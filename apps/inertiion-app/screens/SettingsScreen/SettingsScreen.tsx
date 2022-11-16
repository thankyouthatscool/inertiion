import AsyncStorage from "@react-native-async-storage/async-storage";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { Button, Text, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

import { apiUrl } from "../../api.json";
import { setCustomApiUrl, useAppDispatch, useAppSelector } from "../../store";
import { APP_BACKGROUND_COLOR, APP_FONT_SIZE, APP_PADDING } from "../../theme";
import { trpc } from "../../utils";

export const SettingsScreen = () => {
  const [tempCustomApiUrl, setTempCustomApiUrl] = useState<string>("");

  const {
    data: getAllItemsData,
    refetch: getAllItemsRefetch,
    isFetching: getAllItemsIsFetching,
  } = trpc.item.getAllItems.useQuery("", {
    enabled: false,
  });

  const { refetch: testerRefetch } = trpc.item.tester.useQuery("", {
    enabled: false,
    cacheTime: 0,
  });

  const dispatch = useAppDispatch();

  const { customApiUrl } = useAppSelector(({ app }) => app);

  const handleSetLocal = useCallback(async (catalogData: string) => {
    await AsyncStorage.setItem("catalogData", catalogData);

    console.log("Local data set.");
  }, []);

  useEffect(() => {
    if (getAllItemsData !== undefined) {
      handleSetLocal(JSON.stringify(getAllItemsData.data));
    }
  }, [getAllItemsData]);

  return (
    <SafeAreaView
      style={{
        backgroundColor: APP_BACKGROUND_COLOR,
        padding: APP_PADDING,
      }}
    >
      <Text style={{ fontSize: APP_FONT_SIZE * 1.5, fontWeight: "bold" }}>
        Settings
      </Text>
      <View
        style={{
          alignItems: "center",

          borderRadius: APP_FONT_SIZE,
          borderWidth: 2,

          display: "flex",

          flexDirection: "row",

          justifyContent: "space-between",

          marginVertical: APP_PADDING,

          padding: APP_PADDING,
        }}
      >
        <Text>Download Data</Text>
        <Button
          disabled={getAllItemsIsFetching}
          onPress={() => {
            getAllItemsRefetch();
          }}
          title={getAllItemsIsFetching ? "Loading..." : "Download"}
        />
      </View>
      <SettingItem>
        <TextInput
          onChangeText={(newText) => {
            setTempCustomApiUrl(newText);
          }}
          placeholder="Set custom endpoint..."
          style={{ flex: 1 }}
        />
        <Button
          onPress={() => {
            dispatch(setCustomApiUrl(tempCustomApiUrl));
          }}
          title="Set"
        />
      </SettingItem>
      <SettingItem>
        <View>
          <Text>Test Connection</Text>
          <Text>Original</Text>
          <Text>{apiUrl}</Text>
          <Text>{customApiUrl || "No custom endpoint set"}</Text>
        </View>
        <Button
          onPress={async () => {
            const { data } = await testerRefetch();

            console.log(data);
          }}
          title="Test"
        />
      </SettingItem>
    </SafeAreaView>
  );
};

export const SettingItem = ({ children }: { children: ReactNode }) => {
  return (
    <View
      style={{
        alignItems: "center",

        borderRadius: APP_FONT_SIZE,
        borderWidth: 2,

        display: "flex",

        flexDirection: "row",

        justifyContent: "space-between",

        marginVertical: APP_PADDING,

        padding: APP_PADDING,
      }}
    >
      {children}
    </View>
  );
};
