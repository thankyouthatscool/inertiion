import type { DrawerScreenProps } from "@react-navigation/drawer";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Control, useController, useForm } from "react-hook-form";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { RootDrawerParamList } from "../../App";
import type { PutStockAwayScreenProps } from "../PutStockAwayScreen";
import { Item } from "../../store";
import { useItemHooks } from "../../store/ItemHooks";
import { APP_FONT_SIZE, APP_PADDING } from "../../theme";

type EditItemScreenProps = CompositeScreenProps<
  NativeStackScreenProps<PutStockAwayScreenProps, "EditItemScreen">,
  DrawerScreenProps<RootDrawerParamList>
>;

type EditItemFormProps = {
  location: string;
};

export const EditItemScreen = ({
  navigation,
  route: {
    params: { item },
  },
}: EditItemScreenProps) => {
  const { updateItem } = useItemHooks();

  const { control, handleSubmit } = useForm<EditItemFormProps>();

  const [formData, setFormData] = useState<{ location: string }>({
    location: item.location,
  });

  const onSubmit = handleSubmit((data) => {
    if (data.location) {
      console.log(
        `Old location was: ${item.location}\nNew location is: ${data.location}`
      );

      updateItem({ ...item, location: data.location });
      navigation.navigate("PutAwayItemsScreen");
    }
  });

  return (
    <SafeAreaView>
      <View style={[styles.card]}>
        <Text style={[styles.textField]}>
          {item.code} {item.description}
        </Text>
        <Input
          control={control}
          initialValues={item}
          name="location"
          onTextChangeCallback={(e: string) => {
            setFormData((formData) => ({ ...formData, location: e }));
          }}
        />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            marginTop: APP_PADDING,
          }}
        >
          <Button
            onPress={() => {
              navigation.navigate("PutAwayItemsScreen");
            }}
            title="cancel"
            color="orange"
          />
          <View style={{ marginLeft: APP_PADDING / 2 }}>
            <Button
              disabled={!formData.location}
              onPress={() => {
                onSubmit();
              }}
              title="save"
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const Input = ({
  control,
  initialValues,
  name,
  onTextChangeCallback,
}: {
  control: Control<EditItemFormProps>;
  initialValues: Item;
  name: keyof EditItemFormProps;
  onTextChangeCallback: (e: string) => void;
}) => {
  const { field } = useController({
    control,
    defaultValue: initialValues.location,
    name,
  });

  return (
    <TextInput
      onChangeText={(e) => {
        field.onChange(e);
        onTextChangeCallback(e);
      }}
      style={[styles.textInput]}
      placeholder="Item Location"
      value={field.value}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: APP_PADDING * 0.75,

    elevation: 4,

    margin: APP_PADDING,

    padding: APP_PADDING,
    // flex: 1,
    // justifyContent: "center",
    // marginLeft: APP_PADDING,
    // padding: APP_PADDING,
  },
  textField: {
    fontSize: APP_FONT_SIZE,
    fontWeight: "bold",

    // padding: APP_PADDING * 1,
  },
  textInput: {
    borderRadius: APP_PADDING * 0.75,
    borderWidth: 2,

    fontSize: APP_FONT_SIZE,

    padding: APP_PADDING * 1,
  },
});
