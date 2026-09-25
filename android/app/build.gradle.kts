plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.hopchenko.parkpass"
    compileSdk = 35

    defaultConfig {
        // Permanent once published to Play — see docs/MOBILE.md.
        applicationId = "com.hopchenko.parkpass"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "0.1.0"
    }

    signingConfigs {
        // A committed debug key, so every CI build is signed identically and a
        // newer APK installs over an older one without wiping the pin board.
        // Debug-only: a Play release needs its own key, kept out of the repo.
        getByName("debug") {
            storeFile = file("debug.keystore")
            storePassword = "android"
            keyAlias = "androiddebugkey"
            keyPassword = "android"
        }
    }

    buildTypes {
        debug {
            signingConfig = signingConfigs.getByName("debug")
        }
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    androidResources {
        // Swedish is the default in values/; English lives in values-en/.
        generateLocaleConfig = true
    }

    sourceSets["main"].assets.srcDir(layout.buildDirectory.dir("generated/sharedAssets"))
}

// The app ships the web app's data and artwork instead of keeping copies:
// shared/*.json (from `npm run export:shared`), the pin WebPs and the
// pin-board fabric are copied in at build time.
val copySharedAssets by tasks.registering(Sync::class) {
    val repo = rootProject.projectDir.parentFile
    into(layout.buildDirectory.dir("generated/sharedAssets"))
    from(File(repo, "shared")) {
        include("parks.json", "map.json")
    }
    from(File(repo, "parkpass-web/public/pins")) {
        include("*.webp")
        into("pins")
    }
    from(File(repo, "parkpass-web/public")) {
        include("pinboard-fabric-seamless.webp")
    }
}

tasks.named("preBuild") { dependsOn(copySharedAssets) }

dependencies {
    implementation(project(":core"))

    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.androidx.lifecycle.runtime.compose)

    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.foundation)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.ui.tooling.preview)
    debugImplementation(libs.androidx.compose.ui.tooling)
}
