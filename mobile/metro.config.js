const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// zustand's "browser"/"import" export condition ships an ESM build that uses
// `import.meta.env`, which Metro's web bundle (a classic, non-module script)
// cannot parse — prefer the CJS build by resolving "require" first.
config.resolver.unstable_conditionNames = ["require", "react-native", "browser"];

module.exports = withNativeWind(config, { input: "./global.css" });
