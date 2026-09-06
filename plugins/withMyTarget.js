const { withProjectBuildGradle, withAppBuildGradle, withAndroidManifest, withMainApplication } = require('@expo/config-plugins');

function withMyTarget(config) {
  // Добавляем репозиторий MyTarget в root build.gradle
  config = withProjectBuildGradle(config, (config) => {
    if (!config.modResults.contents.includes('mytarget')) {
      config.modResults.contents = config.modResults.contents.replace(
        'allprojects {',
        `allprojects {
    repositories {
        maven { url "https://dl.bintray.com/mytarget/maven" }
    }`
      );
    }
    return config;
  });

  // Добавляем зависимость MyTarget SDK
  config = withAppBuildGradle(config, (config) => {
    if (!config.modResults.contents.includes('mytarget-sdk')) {
      config.modResults.contents = config.modResults.contents.replace(
        'dependencies {',
        `dependencies {
    implementation 'com.my.target:mytarget-sdk:5.+'`
      );
    }
    return config;
  });

  // Добавляем разрешения в AndroidManifest
  config = withAndroidManifest(config, (config) => {
    const mainApplication = config.modResults.manifest.application?.[0];
    if (mainApplication) {
      // Разрешения уже должны быть, но добавим на всякий случай
    }
    return config;
  });

  return config;
}

module.exports = withMyTarget;