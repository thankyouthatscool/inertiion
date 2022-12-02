import { Text } from "react-native";

import { ScreenContainer } from "@components/ScreenContainer";
import type { AddOrderScreenProps } from "@types";

export const AddOrderScreen = ({ navigation }: AddOrderScreenProps) => {
  return (
    <ScreenContainer>
      <Text>Add Order Screen</Text>
    </ScreenContainer>
  );
};
