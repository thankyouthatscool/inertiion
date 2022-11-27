module.exports = {
  expo: {
    name: "inertiion-app",
    slug: "inertiion-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    extra: {
      eas: {
        projectId: "538a45f7-0e61-4134-b889-d0cf3dba6fec",
      },
      accessKeyId: process.env.accessKeyId,
      bucketName: process.env.bucketName,
      secretAccessKey: process.env.secretAccessKey,
    },
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF",
      },
      package: "com.ozahnitko.inertiionapp",
    },
    web: {
      favicon: "./assets/favicon.png",
    },
  },
};
