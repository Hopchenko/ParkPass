// swift-tools-version:5.9
// Platform-free ParkPass logic: park data, visit merging, the transfer-code
// codec and the ICU message formatter. The app compiles these sources
// directly; this package exists so `swift test` can prove them against the
// vectors the web app's codec wrote to shared/.
import PackageDescription

let package = Package(
    name: "ParkPassCore",
    platforms: [.iOS(.v17), .macOS(.v14)],
    products: [.library(name: "ParkPassCore", targets: ["ParkPassCore"])],
    targets: [
        .target(name: "ParkPassCore"),
        .testTarget(name: "ParkPassCoreTests", dependencies: ["ParkPassCore"]),
    ]
)
