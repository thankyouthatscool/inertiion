import AsyncStorage from "@react-native-async-storage/async-storage";
import { parse } from "expo-linking";
import { ReactNode, useState } from "react";
import {
  Button,
  ScrollView,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppDispatch, useAppSelector } from "@hooks/index";
import { setApiStatus, setCustomApiUrl } from "@store/appSlice";
import { APP_FONT_SIZE, APP_PADDING_SIZE } from "@theme/index";
import { trpc } from "@utils/index";

export const SettingsScreen = () => {
  const dispatch = useAppDispatch();

  const { apiStatus, customApiUrl } = useAppSelector(({ app }) => app);
  const { catalog } = useAppSelector(({ item }) => item);

  const { isFetching: seedDatabaseIsFetching, refetch: seedDatabaseRefetch } =
    trpc.item.seedDatabase.useQuery("", {
      enabled: false,
      cacheTime: 0,
    });
  const { isFetching: testerIsFetching, refetch: testerRefetch } =
    trpc.item.tester.useQuery("", {
      cacheTime: 0,
      enabled: false,
    });
  const { isFetching: getAllItemsIsFetching, refetch: getAllItemsRefetch } =
    trpc.item.getAllItems.useQuery("", {
      enabled: false,
    });

  return (
    <SafeAreaView>
      <Text
        style={{
          fontSize: APP_FONT_SIZE * 1.5,
          fontWeight: "bold",

          paddingTop: APP_FONT_SIZE,
          paddingBottom: APP_PADDING_SIZE,
          paddingHorizontal: APP_FONT_SIZE,
        }}
      >
        Settings
      </Text>
      <ScrollView>
        <SettingCard danger>
          <TextButtonWrapper>
            <View style={{ flex: 4 }}>
              <Text style={{ fontWeight: "bold" }}>SEED DATABASE</Text>
              <Text>Probably only want to do it once per the thing</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Button
                color="red"
                disabled={seedDatabaseIsFetching}
                onPress={async () => {
                  const res = await seedDatabaseRefetch();

                  console.log(res);
                }}
                title="seed"
              />
            </View>
          </TextButtonWrapper>
        </SettingCard>

        <SettingCard>
          <TextButtonWrapper>
            <Text
              style={{
                color:
                  apiStatus === undefined
                    ? "orange"
                    : !!apiStatus
                    ? "green"
                    : "red",
                fontWeight: "bold",
              }}
            >
              Status:
              {apiStatus === undefined
                ? " unknown"
                : !!apiStatus
                ? " OK"
                : " Down"}
            </Text>
            <Button
              disabled={testerIsFetching}
              onPress={async () => {
                try {
                  const { status } = await testerRefetch();

                  if (status === "success") {
                    dispatch(setApiStatus(true));
                  } else if (status === "error") {
                    dispatch(setApiStatus(false));
                  } else {
                    dispatch(setApiStatus(false));
                  }
                } catch {
                  dispatch(setApiStatus(false));
                }
              }}
              title="test"
            />
          </TextButtonWrapper>
        </SettingCard>
        <CustomEndpointSettingItem />
        <SettingCard>
          <TextButtonWrapper>
            <View style={{ flex: 4 }}>
              <Text style={{ fontWeight: "bold" }}>DOWNLOAD CATALOG DATA</Text>
              {!!customApiUrl && (
                <View>
                  <Text>Will be downloaded from:</Text>
                  <Text>{customApiUrl}</Text>
                </View>
              )}

              <Text style={{ color: !!catalog.length ? "green" : "red" }}>
                {!!catalog.length
                  ? "Local data available"
                  : "No local data available"}
              </Text>
            </View>
            <View style={{ flex: 2 }}>
              <Button
                disabled={getAllItemsIsFetching}
                onPress={async () => {
                  if (!customApiUrl) {
                    try {
                      const res = await getAllItemsRefetch();

                      ToastAndroid.show(
                        `Retrieved ${res.data?.data.length} items!`,
                        ToastAndroid.SHORT
                      );

                      await AsyncStorage.setItem(
                        "catalogData",
                        JSON.stringify(res.data?.data)
                      );

                      ToastAndroid.show("Local data set", ToastAndroid.SHORT);
                    } catch (e) {
                      console.log(e);

                      ToastAndroid.show(
                        "Could not download catalog data",
                        ToastAndroid.LONG
                      );
                    }
                  } else {
                    ToastAndroid.show(
                      "Downloading catalog data from custom URL",
                      ToastAndroid.LONG
                    );
                  }
                }}
                title="Download"
              />
            </View>
          </TextButtonWrapper>
        </SettingCard>
      </ScrollView>
    </SafeAreaView>
  );
};

const SettingCard = ({
  children,
  danger,
}: {
  children: ReactNode;
  danger?: boolean;
}) => {
  return (
    <View
      style={{
        backgroundColor: danger ? "orange" : "white",
        borderColor: danger ? "red" : "white",
        borderRadius: APP_FONT_SIZE,
        borderWidth: danger ? 2 : 0,

        elevation: 2,

        marginHorizontal: APP_FONT_SIZE,
        marginVertical: APP_PADDING_SIZE,

        padding: APP_FONT_SIZE,
      }}
    >
      {children}
    </View>
  );
};

const TextButtonWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <View
      style={{
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
      {children}
    </View>
  );
};

const CustomEndpointSettingItem = () => {
  const dispatch = useAppDispatch();

  const { customApiUrl } = useAppSelector(({ app }) => app);

  const [newCustomApiUrl, setNewCustomApiUrl] = useState<typeof customApiUrl>(
    () => customApiUrl
  );

  return (
    <SettingCard>
      <View>
        <Text style={{ fontWeight: "bold" }}>Set custom API endpoint</Text>
        <Text>
          Just in case not connected to the default tRPC server, and need to
          grab the data real quick.
        </Text>
        <View
          style={{
            backgroundColor: "white",

            flexDirection: "row",

            justifyContent: "space-between",

            marginTop: APP_PADDING_SIZE,
          }}
        >
          <View style={{ flex: 1 }}>
            <TextInput
              onChangeText={(e) => {
                setNewCustomApiUrl(e);
              }}
              placeholder="Set custom API endpoint"
              style={{ flex: 1 }}
              value={newCustomApiUrl || ""}
            />
          </View>
          <View>
            <Button
              disabled={!newCustomApiUrl}
              onPress={() => {
                if (!!newCustomApiUrl) {
                  const { scheme } = parse(newCustomApiUrl);

                  if (scheme) {
                    dispatch(setCustomApiUrl(newCustomApiUrl!));
                  } else {
                    ToastAndroid.show("Invalid URL", ToastAndroid.LONG);
                    setNewCustomApiUrl(() => "");
                  }
                }
              }}
              title="set"
            />
          </View>
        </View>
      </View>
    </SettingCard>
  );
};
