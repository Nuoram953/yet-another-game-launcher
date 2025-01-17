
interface Window {
  api: {
    getStoredPicturesDirectory: (id:string) => Promise<string>
  };
}
