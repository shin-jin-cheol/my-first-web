const MAX_IMAGE_DIMENSION = 1200;
const RESIZED_IMAGE_QUALITY = 0.85;

type ImageInfo = {
  width: number;
  height: number;
};

function getImageInfo(file: File): Promise<ImageInfo> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      const width = image.naturalWidth || image.width;
      const height = image.naturalHeight || image.height;
      URL.revokeObjectURL(objectUrl);
      resolve({ width, height });
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("이미지 정보를 읽을 수 없습니다."));
    };

    image.src = objectUrl;
  });
}

function getResizedDimensions(width: number, height: number) {
  if (width <= MAX_IMAGE_DIMENSION && height <= MAX_IMAGE_DIMENSION) {
    return { width, height, resized: false };
  }

  const ratio = Math.min(MAX_IMAGE_DIMENSION / width, MAX_IMAGE_DIMENSION / height);
  return {
    width: Math.max(Math.round(width * ratio), 1),
    height: Math.max(Math.round(height * ratio), 1),
    resized: true,
  };
}

function replaceExtension(name: string, extension: string) {
  return name.replace(/\.[^.]+$/, "") + `.${extension}`;
}

export async function resizeImageForUpload(file: File) {
  const { width, height } = await getImageInfo(file);
  const nextSize = getResizedDimensions(width, height);

  if (!nextSize.resized) {
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = nextSize.width;
  canvas.height = nextSize.height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("이미지 리사이징을 위한 canvas를 초기화할 수 없습니다.");
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    await new Promise<void>((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        context.drawImage(image, 0, 0, nextSize.width, nextSize.height);
        resolve();
      };
      image.onerror = () => {
        reject(new Error("이미지 리사이징에 실패했습니다."));
      };
      image.src = objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (!result) {
          reject(new Error("리사이징된 이미지를 생성하지 못했습니다."));
          return;
        }

        resolve(result);
      },
      "image/jpeg",
      RESIZED_IMAGE_QUALITY,
    );
  });

  return new File([blob], replaceExtension(file.name, "jpg"), {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}
