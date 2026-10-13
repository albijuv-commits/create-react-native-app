import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { clearMedicineLists, useMedicineList } from "~/lib/medicine-lists";

const TORVAST = "033007042";
const AUGMENTIN = "026089019";
const ZIRTEC = "026894016";
const EUTIROX = "024402125";

const saved = async (key: string) => JSON.parse((await AsyncStorage.getItem(key)) ?? "null") as unknown;

// Le liste salvate prima del primo uso: questo file parte con un modulo nuovo, mai letto
beforeAll(async () => {
  await AsyncStorage.setItem("orienta:farmaci-preferiti", JSON.stringify([TORVAST, "non-un-codice", 42, AUGMENTIN]));
  await AsyncStorage.setItem("orienta:farmaci-confronto", "{rotto");
});

describe("preferiti e confronto sul telefono", () => {
  it("un tocco prima che le liste siano lette non cancella quelle salvate", async () => {
    const { result } = await renderHook(() => useMedicineList("preferiti"));
    // Subito, mentre la lettura dal telefono è ancora in corso
    await act(async () => result.current.toggle(ZIRTEC));
    await waitFor(() => expect(result.current.list).toEqual([TORVAST, AUGMENTIN, ZIRTEC]));
    expect(await saved("orienta:farmaci-preferiti")).toEqual([TORVAST, AUGMENTIN, ZIRTEC]);
    await act(async () => result.current.toggle(ZIRTEC));
    await waitFor(() => expect(result.current.list).toEqual([TORVAST, AUGMENTIN]));
  });

  it("rilegge i preferiti salvati e scarta i valori non validi", async () => {
    const { result } = await renderHook(() => useMedicineList("preferiti"));
    await waitFor(() => expect(result.current.list).toEqual([TORVAST, AUGMENTIN]));
    expect(result.current.has(TORVAST)).toBe(true);
    expect(result.current.max).toBe(50);
    // Un salvataggio rovinato non blocca l'app: la lista riparte vuota
    const compare = await renderHook(() => useMedicineList("confronto"));
    expect(compare.result.current.list).toEqual([]);
  });

  it("aggiunge e toglie, e salva ogni modifica", async () => {
    const { result } = await renderHook(() => useMedicineList("preferiti"));
    await waitFor(() => expect(result.current.list).toHaveLength(2));
    await act(async () => result.current.toggle(ZIRTEC));
    expect(result.current.list).toEqual([TORVAST, AUGMENTIN, ZIRTEC]);
    await act(async () => result.current.toggle(TORVAST));
    expect(result.current.list).toEqual([AUGMENTIN, ZIRTEC]);
    expect(await saved("orienta:farmaci-preferiti")).toEqual([AUGMENTIN, ZIRTEC]);
  });

  it("nel confronto tiene al massimo tre confezioni", async () => {
    const { result } = await renderHook(() => useMedicineList("confronto"));
    for (const aic of [TORVAST, AUGMENTIN, ZIRTEC, EUTIROX]) await act(async () => result.current.toggle(aic));
    expect(result.current.list).toEqual([TORVAST, AUGMENTIN, ZIRTEC]);
    expect(result.current.full).toBe(true);
    await act(async () => result.current.remove(AUGMENTIN));
    expect(result.current.full).toBe(false);
    expect(await saved("orienta:farmaci-confronto")).toEqual([TORVAST, ZIRTEC]);
  });

  it("«Elimina tutti i miei dati» svuota le liste e le chiavi salvate", async () => {
    const favorites = await renderHook(() => useMedicineList("preferiti"));
    await act(async () => clearMedicineLists());
    expect(favorites.result.current.list).toEqual([]);
    expect(await AsyncStorage.getItem("orienta:farmaci-preferiti")).toBeNull();
    expect(await AsyncStorage.getItem("orienta:farmaci-confronto")).toBeNull();
  });
});
