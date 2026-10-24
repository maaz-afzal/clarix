import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export default cloudinary;

export interface UploadResult {
  url: string;
  publicId: string;
  fileName: string;
  fileSize: number;
  format: string;
}

export async function uploadFile(
  buffer: Buffer,
  fileName: string,
  folder: string = "clarix",
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        public_id: `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`,
        use_filename: false,
      },
      (error, result) => {
        if (error) reject(error);
        else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            fileName,
            fileSize: result.bytes,
            format: result.format,
          });
        }
      },
    );

    uploadStream.end(buffer);
  });
}

export async function deleteFile(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
