import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { PutAwayChecklistItem } from "../../components";
import { useAppSelector } from "@hooks";
import type { Item } from "@store";

const sortItems = (items: Item[]) => {
  const warehouse2GroundLocations = items.filter((item) =>
    /^2G/i.test(item.location)
  );
  const warehouse2Level1Locations = items.filter((item) =>
    /^21/i.test(item.location)
  );
  const warehouse2Level2Locations = items.filter((item) =>
    /^22/i.test(item.location)
  );
  const warehouse1Level1Locations = items.filter((item) =>
    /^11/i.test(item.location)
  );
  const warehouse1Level2Locations = items.filter((item) =>
    /^12/i.test(item.location)
  );
  const warehouse1GroundLocations = items.filter((item) =>
    /^1G/i.test(item.location)
  );
  const bayLocations = items.filter((item) => /^bay/i.test(item.location));

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

export const PutAwayItemsScreen = () => {
  const { checkedItems, selectedItems } = useAppSelector(
    ({ putStockAway }) => putStockAway
  );

  const [itemLocations, setItemLocations] = useState<{
    [key: string]: Item[];
  }>({});

  useEffect(() => {
    setItemLocations(sortItems(selectedItems));
  }, [selectedItems]);

  return (
    <SafeAreaView>
      <ScrollView overScrollMode="never" showsVerticalScrollIndicator={false}>
        {!!itemLocations?.["2G"]?.length && (
          <View>
            <Text style={[styles.locationHeading]}>Warehouse 2 - Ground</Text>
            {itemLocations["2G"]
              .filter(
                (item) => !checkedItems.map((item) => item.id).includes(item.id)
              )
              .map((item) => {
                return <PutAwayChecklistItem item={item} key={item.id} />;
              })}
            {itemLocations["2G"]
              .filter((item) =>
                checkedItems.map((item) => item.id).includes(item.id)
              )
              .map((item) => {
                return (
                  <PutAwayChecklistItem checked item={item} key={item.id} />
                );
              })}
          </View>
        )}
        {!!itemLocations?.["21"]?.length && (
          <View>
            <Text style={[styles.locationHeading]}>Warehouse 2 - Level 1</Text>
            {itemLocations["21"]
              .filter(
                (item) => !checkedItems.map((item) => item.id).includes(item.id)
              )
              .map((item) => {
                return <PutAwayChecklistItem item={item} key={item.id} />;
              })}
            {itemLocations["21"]
              .filter((item) =>
                checkedItems.map((item) => item.id).includes(item.id)
              )
              .map((item) => {
                return (
                  <PutAwayChecklistItem checked item={item} key={item.id} />
                );
              })}
          </View>
        )}
        {!!itemLocations?.["22"]?.length && (
          <View>
            <Text
              style={[
                styles.locationHeading,
                {
                  color: itemLocations["22"].every((item) =>
                    checkedItems.map((item) => item.id).includes(item.id)
                  )
                    ? "green"
                    : "black",
                },
              ]}
            >
              Warehouse 2 - Level 2
            </Text>
            {itemLocations["22"]
              .filter(
                (item) => !checkedItems.map((item) => item.id).includes(item.id)
              )
              .map((item) => {
                return <PutAwayChecklistItem item={item} key={item.id} />;
              })}
            {itemLocations["22"]
              .filter((item) =>
                checkedItems.map((item) => item.id).includes(item.id)
              )
              .map((item) => {
                return (
                  <PutAwayChecklistItem checked item={item} key={item.id} />
                );
              })}
          </View>
        )}
        {!!itemLocations?.["11"]?.length && (
          <View>
            <Text style={[styles.locationHeading]}>Warehouse 1 - Level 1</Text>
            {itemLocations["11"]
              .filter(
                (item) => !checkedItems.map((item) => item.id).includes(item.id)
              )
              .map((item) => {
                return <PutAwayChecklistItem item={item} key={item.id} />;
              })}
            {itemLocations["11"]
              .filter((item) =>
                checkedItems.map((item) => item.id).includes(item.id)
              )
              .map((item) => {
                return (
                  <PutAwayChecklistItem checked item={item} key={item.id} />
                );
              })}
          </View>
        )}
        {!!itemLocations?.["12"]?.length && (
          <View>
            <Text style={[styles.locationHeading]}>Warehouse 1 - Level 2</Text>
            {itemLocations["12"]
              .filter(
                (item) => !checkedItems.map((item) => item.id).includes(item.id)
              )
              .map((item) => {
                return <PutAwayChecklistItem item={item} key={item.id} />;
              })}
            {itemLocations["12"]
              .filter((item) =>
                checkedItems.map((item) => item.id).includes(item.id)
              )
              .map((item) => {
                return (
                  <PutAwayChecklistItem checked item={item} key={item.id} />
                );
              })}
          </View>
        )}
        {!!itemLocations?.["1G"]?.length && (
          <View>
            <Text style={[styles.locationHeading]}>Warehouse 1 - Ground</Text>
            {itemLocations["1G"]
              .filter(
                (item) => !checkedItems.map((item) => item.id).includes(item.id)
              )
              .map((item) => {
                return <PutAwayChecklistItem item={item} key={item.id} />;
              })}
            {itemLocations["1G"]
              .filter((item) =>
                checkedItems.map((item) => item.id).includes(item.id)
              )
              .map((item) => {
                return (
                  <PutAwayChecklistItem checked item={item} key={item.id} />
                );
              })}
          </View>
        )}
        {!!itemLocations?.["bays"]?.length && (
          <View>
            <Text
              style={[
                styles.locationHeading,
                {
                  color: itemLocations["bays"].every((item) =>
                    checkedItems.map((item) => item.id).includes(item.id)
                  )
                    ? "green"
                    : "black",
                },
              ]}
            >
              Bays
            </Text>
            {itemLocations["bays"]
              .filter(
                (item) => !checkedItems.map((item) => item.id).includes(item.id)
              )
              .map((item) => {
                return <PutAwayChecklistItem item={item} key={item.id} />;
              })}
            {itemLocations["bays"]
              .filter((item) =>
                checkedItems.map((item) => item.id).includes(item.id)
              )
              .map((item) => {
                return (
                  <PutAwayChecklistItem checked item={item} key={item.id} />
                );
              })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  locationHeading: {
    fontSize: 16,
    fontWeight: "bold",

    padding: 8,
  },
});
