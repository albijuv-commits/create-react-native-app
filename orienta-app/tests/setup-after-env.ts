import { configure } from "@testing-library/react-native";

// Il Mercato aspetta 300 ms prima di cercare: con tutti i test in parallelo e la cache di Babel
// ancora vuota, il secondo che findBy e waitFor concedono di solito non basta. Un'attesa più lunga
// non rallenta i test che passano: finisce appena l'elemento compare.
configure({ asyncUtilTimeout: 5000 });
