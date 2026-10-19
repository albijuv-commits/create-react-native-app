// Archiviazione del telefono simulata in memoria
jest.mock("@react-native-async-storage/async-storage", () => require("@react-native-async-storage/async-storage/jest/async-storage-mock"));

// Reanimated e i gesti in versione per i test: le animazioni arrivano subito al valore finale
require("react-native-reanimated").setUpTests();
require("react-native-gesture-handler/jestSetup");
