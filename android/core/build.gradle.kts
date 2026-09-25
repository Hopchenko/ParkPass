// Platform-free ParkPass logic: park data, visit merging and the transfer-code
// codec. No Android dependencies, so `./gradlew :core:test` runs on any JVM.
plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.kotlin.serialization)
}

java {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
}

kotlin {
    compilerOptions.jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
}

dependencies {
    api(libs.kotlinx.serialization.json)
    testImplementation(libs.junit)
}

// The tests replay vectors produced by the web app's own codec.
sourceSets {
    test {
        resources.srcDir(rootProject.file("../shared"))
    }
}
