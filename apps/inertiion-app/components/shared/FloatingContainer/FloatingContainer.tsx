import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { APP_FONT_SIZE, APP_PADDING_SIZE } from "@theme/index";

export const FloatingContainer = ({ children }: { children: ReactNode }) => {
  return <View style={[styles.floatingContainer]}>{children}</View>;
};

const styles = StyleSheet.create({
  floatingContainer: {
    borderWidth: 2,
    bottom: 0,

    padding: APP_PADDING_SIZE,
    position: "absolute",

    marginBottom: APP_FONT_SIZE,
    marginRight: APP_FONT_SIZE,

    right: 0,
  },
});
