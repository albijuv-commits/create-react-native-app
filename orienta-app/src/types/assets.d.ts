// Le immagini importate diventano un riferimento di Metro, da passare a expo-image
declare module "*.webp" {
  const source: number;
  export default source;
}
declare module "*.png" {
  const source: number;
  export default source;
}
