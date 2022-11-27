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
import { useState } from "react";
import {
  Button,
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  Pressable,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import UUID from "react-native-uuid";

import { FloatingContainer, OrderItem } from "@components";
import { useAppDispatch, useAppSelector } from "@hooks";
import { addOrder, removeOrder } from "@store";
import { Order } from "@store/pickOrdersSlice";
import { APP_FONT_SIZE, APP_PADDING_SIZE } from "@theme";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { CompositeScreenProps } from "@react-navigation/native";
import { DrawerScreenProps } from "@react-navigation/drawer";

import type { RootNavigator } from "../../App";

enum CurrentAction {
  idle = "Idle",
  uploading = "Uploading",
  extractingData = "Extracting Data",
}

const { height } = Dimensions.get("screen");

export type PickOrderScreenParams = {
  AddOrderScreen: undefined;
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
        component={PickOrderItemsScreen}
        name="PickOrderItems"
      />
    </PickOrderScreenStack.Navigator>
  );
};

type PickOrderItemsProps = CompositeScreenProps<
  NativeStackScreenProps<PickOrderScreenParams, "PickOrderItems">,
  DrawerScreenProps<RootNavigator>
>;

type AddOrderProps = CompositeScreenProps<
  NativeStackScreenProps<PickOrderScreenParams, "AddOrderScreen">,
  DrawerScreenProps<RootNavigator>
>;

export const PickOrderItemsScreen = () => {
  return <Text>PPP</Text>;
};

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
    // Might want to have a couple of options here:
    // 1. Either pick an image from the gallery
    // 2. Or take a picture with the camera -> launchCameraAsync

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
        {/* <View style={{ flex: 1 }}>
          <Button
            onPress={async () => {
              setIsLoading(() => true);

              try {
                const imageBuffer = await handleSelectImage();

                const imageName = await handleUploadImage(imageBuffer);

                await handleExtractText(imageName);

                setIsLoading(() => false);
                setCurrentAction(() => CurrentAction.idle);
              } catch (e) {
                console.log(e);

                setIsLoading(() => false);
                setCurrentAction(() => CurrentAction.idle);
              }
            }} 
            title="Single Page Order"
          />
        </View> */}
        {/* <View style={{ flex: 1 }}>
          <Button disabled title="Multiple Page Order" />
        </View> */}
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
