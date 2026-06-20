import { v2 as cloudinary, type UploadApiOptions, type UploadApiResponse } from "cloudinary";

type UploadResourceType = "image" | "video" | "raw";

type UploadToCloudinaryParams = {
  fileBuffer: Buffer;
  filename: string;
  resourceType: UploadResourceType;
  folder: string;
};

let configured = false;

function configureCloudinary() {
  if (configured) {
    return;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials are missing from environment variables.");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  configured = true;
}

export async function uploadToCloudinary({
  fileBuffer,
  filename,
  resourceType,
  folder,
}: UploadToCloudinaryParams): Promise<UploadApiResponse> {
  configureCloudinary();

  const options: UploadApiOptions = {
    folder,
    resource_type: resourceType,
    public_id: `${Date.now()}-${filename.replace(/\.[^.]+$/, "")}`,
    overwrite: false,
    unique_filename: true,
  };

  if (resourceType === "image") {
    options.format = "webp";
    options.transformation = [
      {
        quality: "auto:best",
        fetch_format: "webp",
      },
    ];
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error || !result) {
        reject(error ?? new Error("Cloudinary upload failed."));
        return;
      }

      resolve(result);
    });

    uploadStream.end(fileBuffer);
  });
}
