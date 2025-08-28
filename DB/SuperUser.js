import User from "../Models/UserCredential.js";
const superUser = {
  name: "Admin",
  role: "admin",
  email: 'admin@example.com',
  password: 'admin123',
  image:
    "https://www.shutterstock.com/shutterstock/photos/1153673752/display_1500/stock-vector-profile-placeholder-image-gray-silhouette-no-photo-1153673752.jpg",
  isVerified: true,
};

const seedAdmin = async () => {
  const isExistSuperAdmin = await User.findOne({
    role: 'admin',
  });

  if (!isExistSuperAdmin) {
    await User.create(superUser);
console.log("✔admin created successfully!");  
}
};

export default seedAdmin;
