import "react-native-url-polyfill/auto";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  TextractClient,
  AnalyzeDocumentCommand,
} from "@aws-sdk/client-textract";
import { Buffer } from "buffer";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import { ReactNode, useEffect, useState } from "react";
import { Control, useController, useForm } from "react-hook-form";
import {
  Button,
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import UUID from "react-native-uuid";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { FloatingContainer, OrderItem, parseItemLocation } from "@components";
import { useAppDispatch, useAppSelector } from "@hooks";
import {
  addOrder,
  removeOrder,
  setSelectedOrder,
  setSelectedOrders,
} from "@store";
import { Order } from "@store/pickOrdersSlice";
import { APP_FONT_SIZE, APP_PADDING_SIZE } from "@theme";

import {
  OrderItem as OrderItemProps,
  addCheckedOrderItem,
  removeCheckedOrderItem,
} from "@store";

import {
  CompositeScreenProps,
  DrawerScreenProps,
  NativeStackScreenProps,
  RootNavigator,
} from "@types";

enum CurrentAction {
  idle = "Idle",
  uploading = "Uploading",
  extractingData = "Extracting Data",
}

const { height } = Dimensions.get("screen");

export type PickOrderScreenParams = {
  AddOrderScreen: undefined;
  EditOrder: undefined;
  PickOrderItems: undefined;
};

const PickOrderScreenStack =
  createNativeStackNavigator<PickOrderScreenParams>();

export const PickOrderScreen = () => {
  return (
    <PickOrderScreenStack.Navigator
      initialRouteName="AddOrderScreen"
      screenOptions={{ animation: "slide_from_right", headerShown: false }}
    >
      <PickOrderScreenStack.Screen
        component={AddOrderScreen}
        name="AddOrderScreen"
      />
      <PickOrderScreenStack.Screen
        component={EditOrderScreen}
        name="EditOrder"
      />
      <PickOrderScreenStack.Screen
        component={PickOrderItemsScreen}
        name="PickOrderItems"
      />
    </PickOrderScreenStack.Navigator>
  );
};

type AddOrderProps = CompositeScreenProps<
  NativeStackScreenProps<PickOrderScreenParams, "AddOrderScreen">,
  DrawerScreenProps<RootNavigator>
>;

export const AddOrderScreen = ({ navigation }: AddOrderProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentAction, setCurrentAction] = useState<CurrentAction>(
    CurrentAction.idle
  );

  const { top } = useSafeAreaInsets();

  const dispatch = useAppDispatch();

  const { orders } = useAppSelector(({ pickOrders }) => pickOrders);

  const handleExtractText = async (imageName: string) => {
    setCurrentAction(() => CurrentAction.extractingData);

    const textractClient = new TextractClient({
      credentials: {
        accessKeyId: Constants.expoConfig?.extra?.accessKeyId,
        secretAccessKey: Constants.expoConfig?.extra?.secretAccessKey,
      },
      region: "us-east-1",
    });

    const textExtractResponse = await textractClient.send(
      new AnalyzeDocumentCommand({
        FeatureTypes: ["TABLES"],
        Document: {
          S3Object: {
            Bucket: Constants.expoConfig?.extra?.bucketName,
            Name: `${imageName}.jpg`,
          },
        },
      })
    );

    const allBLocks = textExtractResponse.Blocks;
    const tableCells = textExtractResponse.Blocks?.filter(
      (block) => block.BlockType === "CELL"
    );

    const cellData = tableCells?.map((cell) => {
      const cellText = cell.Relationships?.[0].Ids?.map(
        (id) => allBLocks?.find((cell) => cell.Id === id)?.Text
      );

      return { ...cell, cellText: cellText?.join(" ").trim() };
    });

    const itemCells = cellData
      ?.filter((cell) => /^[A-Za-z]{1,3}\d{3,4}/i.test(cell.cellText!))
      .map((cell) => {
        const targetCell = cellData.find((c) => c.Id === cell.Id);

        const targetCellIndex = cellData.indexOf(targetCell!);

        return {
          cell,

          quantityCell: cellData[targetCellIndex - 1].cellText,
          descriptionCell: cellData[targetCellIndex + 1].cellText,
        };
      });

    const orderItems = itemCells?.map((cell) => {
      return {
        id: UUID.v4() as string,
        itemCode: cell.cell.cellText!,
        location: cell.descriptionCell!,
        quantity: parseInt(cell.quantityCell!),
      };
    });

    dispatch(
      addOrder({
        orderId: imageName,
        orderItems: orderItems!,
      })
    );
  };

  enum OrderSource {
    camera = "camera",
    gallery = "gallery",
  }

  const handleButtonPress = async (source: OrderSource) => {
    setIsLoading(() => true);

    try {
      const imageBuffer = await handleSelectImage(source);

      const imageName = await handleUploadImage(imageBuffer);

      await handleExtractText(imageName);

      setIsLoading(() => false);
      setCurrentAction(() => CurrentAction.idle);
    } catch (e) {
      console.log(e);

      setIsLoading(() => false);
      setCurrentAction(() => CurrentAction.idle);
    }
  };

  const handleSelectImage = async (source: OrderSource) => {
    if (source === OrderSource.gallery) {
      const imagePickerRes = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        allowsMultipleSelection: false,

        base64: true,

        mediaTypes: ImagePicker.MediaTypeOptions.Images,

        quality: 0.25,
      });

      if (imagePickerRes.canceled) {
        throw new Error("Cancelled");
      }

      const base64Representation = imagePickerRes.assets?.[0].base64!;

      const buffer = Buffer.from(base64Representation, "base64");

      return buffer;
    } else {
      const imagePickerRes = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        allowsMultipleSelection: false,

        base64: true,

        mediaTypes: ImagePicker.MediaTypeOptions.Images,

        quality: 0.25,
      });

      if (imagePickerRes.canceled) {
        throw new Error("Cancelled");
      }

      const base64Representation = imagePickerRes.assets?.[0].base64!;

      const buffer = Buffer.from(base64Representation, "base64");

      return buffer;
    }
  };

  const handleUploadImage = async (imageBuffer: Buffer) => {
    setCurrentAction(() => CurrentAction.uploading);

    const client = new S3Client({
      credentials: {
        accessKeyId: Constants.expoConfig?.extra?.accessKeyId,
        secretAccessKey: Constants.expoConfig?.extra?.secretAccessKey,
      },
      region: "us-east-1",
    });

    const imageName = UUID.v4() as string;

    const uploadRes = await client.send(
      new PutObjectCommand({
        Bucket: Constants.expoConfig?.extra?.bucketName,
        Key: `${imageName}.jpg`,
        Body: imageBuffer,
      })
    );

    if (uploadRes.$metadata.httpStatusCode !== 200) {
      throw Error("Upload failed");
    }

    return imageName;
  };

  const handleRenderOrderItem = ({ item }: ListRenderItemInfo<Order>) => {
    return (
      <Pressable
        key={item.orderId}
        onLongPress={() => {
          console.log("entering multi selection mode");
        }}
        onPress={() => {
          dispatch(setSelectedOrder(item));
          navigation.navigate("EditOrder");
        }}
        style={{
          backgroundColor: "white",
          borderRadius: APP_FONT_SIZE,

          elevation: 4,

          marginHorizontal: APP_PADDING_SIZE,
          marginVertical: APP_PADDING_SIZE / 2,

          padding: APP_FONT_SIZE,
        }}
      >
        {item.orderItems.map((item, index) => {
          return (
            <OrderItem
              key={`${item.itemCode} - ${item.location} - ${item.quantity} - ${index}`}
              orderItem={item}
            />
          );
        })}
        <Text style={{ fontWeight: "bold", marginTop: APP_PADDING_SIZE }}>
          Total Order Items :{" "}
          {item.orderItems.reduce((acc, val) => {
            return acc + val.quantity;
          }, 0)}
        </Text>
        <Button
          onPress={() => {
            dispatch(removeOrder(item));
          }}
          title="remove order"
        />
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={{ height: height - (APP_PADDING_SIZE + top) }}>
      <Text>{isLoading ? "Loading..." : "Not Loading..."}</Text>
      <Text>
        {currentAction === CurrentAction.idle
          ? "Not doing much"
          : currentAction === CurrentAction.uploading
          ? "uploading to s3"
          : "extracting data"}
      </Text>
      <View style={{ flexDirection: "row", padding: APP_PADDING_SIZE }}>
        <Pressable
          onPress={() => {
            handleButtonPress(OrderSource.gallery);
          }}
          style={({ pressed }) => ({
            alignItems: "center",

            backgroundColor: "white",
            borderRadius: APP_FONT_SIZE,

            elevation: pressed ? 1 : 4,

            flexDirection: "row",

            marginRight: APP_FONT_SIZE,

            padding: APP_FONT_SIZE,
          })}
        >
          <Text>Gallery </Text>
          <MaterialIcons name="collections" size={APP_FONT_SIZE * 1.5} />
        </Pressable>
        <Pressable
          onPress={() => {
            handleButtonPress(OrderSource.camera);
          }}
          style={({ pressed }) => ({
            alignItems: "center",

            backgroundColor: "white",
            borderRadius: APP_FONT_SIZE,

            elevation: pressed ? 1 : 4,

            flexDirection: "row",

            marginRight: APP_FONT_SIZE,

            padding: APP_FONT_SIZE,
          })}
        >
          <Text>Photo </Text>
          <MaterialIcons name="photo-camera" size={APP_FONT_SIZE * 1.5} />
        </Pressable>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(res) => res.orderId}
        overScrollMode="never"
        renderItem={handleRenderOrderItem}
        showsVerticalScrollIndicator={false}
      />
      {orders.length > 0 && (
        <FloatingContainer>
          <View
            style={{
              backgroundColor: `rgba(255,255,255,0.95)`,
            }}
          >
            <Text>
              TOTAL ITEMS:{" "}
              {orders.reduce((acc, val) => {
                return (
                  acc +
                  val.orderItems.reduce((acc, val) => {
                    return acc + val.quantity;
                  }, 0)
                );
              }, 0)}
            </Text>
            <Button
              onPress={() => {
                dispatch(setSelectedOrders(orders));

                navigation.navigate("PickOrderItems");
              }}
              title="Pick All"
            />
          </View>
        </FloatingContainer>
      )}
    </SafeAreaView>
  );
};

type PickOrderItemsProps = CompositeScreenProps<
  NativeStackScreenProps<PickOrderScreenParams, "PickOrderItems">,
  DrawerScreenProps<RootNavigator>
>;

export const PickOrderItemsScreen = ({ navigation }: PickOrderItemsProps) => {
  const dispatch = useAppDispatch();

  const { checkedOrderItems, selectedOrders } = useAppSelector(
    ({ pickOrders }) => pickOrders
  );

  const [sortOrder, setSortOrder] = useState<string>("grace");
  const [customOrder, setCustomOrder] = useState<{
    [key: string]: OrderItemProps[];
  }>({});

  const { top } = useSafeAreaInsets();

  useEffect(() => {
    setCustomOrder(() =>
      sortSelectedItems(
        selectedOrders.reduce((acc, val) => {
          return [...acc, ...val.orderItems];
        }, [] as OrderItemProps[])
      )
    );
  }, [selectedOrders]);

  const sortSelectedItems = (selectedItems: OrderItemProps[]) => {
    const locRemapped = selectedItems.map((item) => ({
      ...item,
      location: parseItemLocation(item.location)
        .replace(/-/gi, "")
        .replace(/100%/gi, ""),
    }));

    const warehouse2GroundLocations = locRemapped.filter((item) =>
      /^2G/i.test(item.location)
    );
    const warehouse2Level1Locations = locRemapped.filter((item) =>
      /^21/i.test(item.location)
    );
    const warehouse2Level2Locations = locRemapped.filter((item) =>
      /^22/i.test(item.location)
    );
    const warehouse1Level1Locations = locRemapped.filter((item) =>
      /^11/i.test(item.location)
    );
    const warehouse1Level2Locations = locRemapped.filter((item) =>
      /^12/i.test(item.location)
    );
    const warehouse1GroundLocations = locRemapped.filter((item) =>
      /^1G/i.test(item.location)
    );
    const bayLocations = locRemapped.filter((item) =>
      /^bay/i.test(item.location)
    );

    return {
      "2G": warehouse2GroundLocations,
      "21": warehouse2Level1Locations,
      "22": warehouse2Level2Locations,
      "11": warehouse1Level1Locations,
      "12": warehouse1Level2Locations,
      "1G": warehouse1GroundLocations,
      bays: bayLocations,
    };
  };

  return (
    <SafeAreaView style={{ height: height - (APP_PADDING_SIZE + top) }}>
      <ScrollView overScrollMode="never" showsVerticalScrollIndicator={false}>
        {sortOrder === "grace" && (
          <View>
            {/* Warehouse 2 - Level 1 */}
            {!!customOrder?.["21"]?.filter(
              (item) =>
                !checkedOrderItems.map((item) => item.id).includes(item.id)
            ).length && (
              <View>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",

                    padding: 8,
                  }}
                >
                  Warehouse 2 - Level 1
                </Text>
                {customOrder["21"]
                  .sort((a, b) => a.location.localeCompare(b.location))
                  .filter(
                    (item) =>
                      !checkedOrderItems
                        .map((item) => item.id)
                        .includes(item.id)
                  )
                  .map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => {
                        if (
                          !checkedOrderItems
                            .map((item) => item.id)
                            .includes(item.id)
                        ) {
                          dispatch(addCheckedOrderItem(item));
                        } else {
                          dispatch(removeCheckedOrderItem(item));
                        }
                      }}
                      style={({ pressed }) => ({
                        backgroundColor: "white",
                        borderRadius: APP_FONT_SIZE,

                        elevation: pressed ? 1 : 4,

                        marginHorizontal: APP_PADDING_SIZE,
                        marginVertical: APP_PADDING_SIZE / 2,

                        padding: APP_PADDING_SIZE,
                      })}
                    >
                      <Text>{item.quantity}</Text>
                      <Text>{item.itemCode}</Text>
                      <Text>{item.location}</Text>
                    </Pressable>
                  ))}
              </View>
            )}

            {/* Warehouse 2 - Level 2 */}
            {!!customOrder?.["22"]?.filter(
              (item) =>
                !checkedOrderItems.map((item) => item.id).includes(item.id)
            ).length && (
              <View>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",

                    padding: 8,
                  }}
                >
                  Warehouse 2 - Level 2
                </Text>
                {customOrder["22"]
                  .sort((a, b) => a.location.localeCompare(b.location))
                  .filter(
                    (item) =>
                      !checkedOrderItems
                        .map((item) => item.id)
                        .includes(item.id)
                  )
                  .map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => {
                        if (
                          !checkedOrderItems
                            .map((item) => item.id)
                            .includes(item.id)
                        ) {
                          dispatch(addCheckedOrderItem(item));
                        } else {
                          dispatch(removeCheckedOrderItem(item));
                        }
                      }}
                      style={({ pressed }) => ({
                        backgroundColor: "white",
                        borderRadius: APP_FONT_SIZE,

                        elevation: pressed ? 1 : 4,

                        marginHorizontal: APP_PADDING_SIZE,
                        marginVertical: APP_PADDING_SIZE / 2,

                        padding: APP_PADDING_SIZE,
                      })}
                    >
                      <Text>{item.quantity}</Text>
                      <Text>{item.itemCode}</Text>
                      <Text>{item.location}</Text>
                    </Pressable>
                  ))}
              </View>
            )}

            {/* Warehouse 1 - Level 1 */}
            {!!customOrder?.["11"]?.filter(
              (item) =>
                !checkedOrderItems.map((item) => item.id).includes(item.id)
            ).length && (
              <View>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",

                    padding: 8,
                  }}
                >
                  Warehouse 1 - Level 1
                </Text>
                {customOrder["11"]
                  .sort((a, b) => a.location.localeCompare(b.location))
                  .filter(
                    (item) =>
                      !checkedOrderItems
                        .map((item) => item.id)
                        .includes(item.id)
                  )
                  .map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => {
                        if (
                          !checkedOrderItems
                            .map((item) => item.id)
                            .includes(item.id)
                        ) {
                          dispatch(addCheckedOrderItem(item));
                        } else {
                          dispatch(removeCheckedOrderItem(item));
                        }
                      }}
                      style={({ pressed }) => ({
                        backgroundColor: "white",
                        borderRadius: APP_FONT_SIZE,

                        elevation: pressed ? 1 : 4,

                        marginHorizontal: APP_PADDING_SIZE,
                        marginVertical: APP_PADDING_SIZE / 2,

                        padding: APP_PADDING_SIZE,
                      })}
                    >
                      <Text>{item.quantity}</Text>
                      <Text>{item.itemCode}</Text>
                      <Text>{item.location}</Text>
                    </Pressable>
                  ))}
              </View>
            )}

            {/* Warehouse 1 - Level 2 */}
            {!!customOrder?.["12"]?.filter(
              (item) =>
                !checkedOrderItems.map((item) => item.id).includes(item.id)
            ).length && (
              <View>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",

                    padding: 8,
                  }}
                >
                  Warehouse 1 - Level 2
                </Text>
                {customOrder["12"]
                  .sort((a, b) => a.location.localeCompare(b.location))
                  .filter(
                    (item) =>
                      !checkedOrderItems
                        .map((item) => item.id)
                        .includes(item.id)
                  )
                  .map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => {
                        if (
                          !checkedOrderItems
                            .map((item) => item.id)
                            .includes(item.id)
                        ) {
                          dispatch(addCheckedOrderItem(item));
                        } else {
                          dispatch(removeCheckedOrderItem(item));
                        }
                      }}
                      style={({ pressed }) => ({
                        backgroundColor: "white",
                        borderRadius: APP_FONT_SIZE,

                        elevation: pressed ? 1 : 4,

                        marginHorizontal: APP_PADDING_SIZE,
                        marginVertical: APP_PADDING_SIZE / 2,

                        padding: APP_PADDING_SIZE,
                      })}
                    >
                      <Text>{item.quantity}</Text>
                      <Text>{item.itemCode}</Text>
                      <Text>{item.location}</Text>
                    </Pressable>
                  ))}
              </View>
            )}

            {/* Warehouse 2 - Ground */}
            {!!customOrder?.["2G"]?.filter(
              (item) =>
                !checkedOrderItems.map((item) => item.id).includes(item.id)
            ).length && (
              <View>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",

                    padding: 8,
                  }}
                >
                  Warehouse 2 - Ground
                </Text>
                {customOrder["2G"]
                  .sort((a, b) => a.location.localeCompare(b.location))
                  .filter(
                    (item) =>
                      !checkedOrderItems
                        .map((item) => item.id)
                        .includes(item.id)
                  )
                  .map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => {
                        if (
                          !checkedOrderItems
                            .map((item) => item.id)
                            .includes(item.id)
                        ) {
                          dispatch(addCheckedOrderItem(item));
                        } else {
                          dispatch(removeCheckedOrderItem(item));
                        }
                      }}
                      style={({ pressed }) => ({
                        backgroundColor: "white",
                        borderRadius: APP_FONT_SIZE,

                        elevation: pressed ? 1 : 4,

                        marginHorizontal: APP_PADDING_SIZE,
                        marginVertical: APP_PADDING_SIZE / 2,

                        padding: APP_PADDING_SIZE,
                      })}
                    >
                      <Text>{item.quantity}</Text>
                      <Text>{item.itemCode}</Text>
                      <Text>{item.location}</Text>
                    </Pressable>
                  ))}
              </View>
            )}

            {/* Warehouse 1 - Ground */}
            {!!customOrder?.["1G"]?.filter(
              (item) =>
                !checkedOrderItems.map((item) => item.id).includes(item.id)
            ).length && (
              <View>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",

                    padding: 8,
                  }}
                >
                  Warehouse 1 - Ground
                </Text>
                {customOrder["1G"]
                  .sort((a, b) => a.location.localeCompare(b.location))
                  .filter(
                    (item) =>
                      !checkedOrderItems
                        .map((item) => item.id)
                        .includes(item.id)
                  )
                  .map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => {
                        if (
                          !checkedOrderItems
                            .map((item) => item.id)
                            .includes(item.id)
                        ) {
                          dispatch(addCheckedOrderItem(item));
                        } else {
                          dispatch(removeCheckedOrderItem(item));
                        }
                      }}
                      style={({ pressed }) => ({
                        backgroundColor: "white",
                        borderRadius: APP_FONT_SIZE,

                        elevation: pressed ? 1 : 4,

                        marginHorizontal: APP_PADDING_SIZE,
                        marginVertical: APP_PADDING_SIZE / 2,

                        padding: APP_PADDING_SIZE,
                      })}
                    >
                      <Text>{item.quantity}</Text>
                      <Text>{item.itemCode}</Text>
                      <Text>{item.location}</Text>
                    </Pressable>
                  ))}
              </View>
            )}

            {/* Checked */}
            {!!checkedOrderItems.length && (
              <View>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",

                    padding: 8,
                  }}
                >
                  Completed
                </Text>
                {checkedOrderItems.map((item) => {
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => {
                        if (
                          !checkedOrderItems
                            .map((item) => item.id)
                            .includes(item.id)
                        ) {
                          dispatch(addCheckedOrderItem(item));
                        } else {
                          dispatch(removeCheckedOrderItem(item));
                        }
                      }}
                      style={{
                        backgroundColor: "gainsboro",
                        borderRadius: APP_FONT_SIZE,

                        marginHorizontal: APP_PADDING_SIZE,
                        marginVertical: APP_PADDING_SIZE / 2,

                        padding: APP_PADDING_SIZE,
                      }}
                    >
                      <Text style={{ textDecorationLine: "line-through" }}>
                        {item.quantity}
                      </Text>
                      <Text style={{ textDecorationLine: "line-through" }}>
                        {item.itemCode}
                      </Text>
                      <Text style={{ textDecorationLine: "line-through" }}>
                        {item.location}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

type EditOrderProps = CompositeScreenProps<
  NativeStackScreenProps<PickOrderScreenParams, "EditOrder">,
  DrawerScreenProps<RootNavigator>
>;

export const EditOrderScreen = ({ navigation }: EditOrderProps) => {
  const { selectedOrder } = useAppSelector(({ pickOrders }) => pickOrders);

  const { control, handleSubmit } = useForm();

  return (
    <ScreenRootWrapper>
      <ScrollView>
        <TextInput placeholder="quantity" value={selectedOrder?.orderId} />
        {selectedOrder?.orderItems.map((orderItem) => {
          return (
            <View
              key={orderItem.id}
              style={[
                {
                  backgroundColor: "white",
                  margin: APP_PADDING_SIZE,
                  padding: APP_PADDING_SIZE,
                },
              ]}
            >
              <Text style={[styles.textInputLabel]}>Quantity</Text>
              <TextInput
                placeholder="quantity"
                style={[styles.textInput]}
                value={orderItem.quantity.toString()}
              />
              <Text style={[styles.textInputLabel]}>Description</Text>
              <TextInput
                placeholder="description"
                style={[styles.textInput]}
                value={orderItem.itemCode}
              />
              <Text style={[styles.textInputLabel]}>Location</Text>
              <TextInput
                placeholder="location"
                style={[styles.textInput]}
                value={orderItem.location}
              />
              <CustomTextInput
                control={control}
                defaultValue={orderItem.location}
                name="test"
                onChangeCallback={() => {
                  console.log("some values have changed");
                }}
              />
            </View>
          );
        })}
      </ScrollView>
    </ScreenRootWrapper>
  );
};

const CustomTextInput = ({
  control,
  defaultValue,
  name,
  onChangeCallback,
  placeholder,
}: {
  control: Control;
  defaultValue: string;
  name: string;
  onChangeCallback: () => void;
  placeholder?: string;
}) => {
  const { field } = useController({ control, defaultValue, name });

  return (
    <TextInput
      onChangeText={(e) => {
        field.onChange(e);
        onChangeCallback();
      }}
      placeholder={placeholder}
      // style={[styles.textInput]}
      value={field.value}
    />
  );
};

const styles = StyleSheet.create({
  textInput: {
    borderRadius: APP_FONT_SIZE,
    borderWidth: 2,

    marginRight: APP_PADDING_SIZE / 2,

    padding: APP_PADDING_SIZE,
  },
  textInputLabel: {
    marginVertical: APP_PADDING_SIZE / 2,

    fontWeight: "bold",
  },
});

export const ScreenRootWrapper = ({ children }: { children: ReactNode }) => {
  const { top } = useSafeAreaInsets();

  return (
    <SafeAreaView style={{ height: height - (APP_PADDING_SIZE + top) }}>
      {children}
    </SafeAreaView>
  );
};
