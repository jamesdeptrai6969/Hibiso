
export const fileToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // result is in the format: "data:image/jpeg;base64,LzlqLzRBQ...""
      const parts = result.split(',');
      if (parts.length !== 2) {
          return reject(new Error("Invalid data URL format"));
      }
      const base64 = parts[1];
      const mimeType = parts[0].split(':')[1].split(';')[0];
      resolve({ base64, mimeType });
    };
    reader.onerror = (error) => reject(error);
  });
};
