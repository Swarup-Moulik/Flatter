import multer from "multer";

const storage = multer.diskStorage({});

export const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB per file (you can increase if needed)
        files: 10, // max 10 files
    },
}); 