import { ReactNode } from "react";
import { Dimensions } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { APP_PADDING_SIZE } from "@theme";

const { height } = Dimensions.get("screen");

export const ScreenContainer = ({ children }: { children: ReactNode }) => {
  const { top } = useSafeAreaInsets();

  return (
    <SafeAreaView
      style={[
        {
          height: height - (top + APP_PADDING_SIZE),

          padding: APP_PADDING_SIZE,
        },
      ]}
    >
      {children}
    </SafeAreaView>
  );
};
