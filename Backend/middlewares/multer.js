import multer from "multer";

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public");
  },
  // filename: (req, file, cb) => {
  //   cb(null, file.originalname);
  // }

  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + "-" + file.originalname);  // ✅ unique filename
  }
});

const upload = multer({ storage });

export default upload;
