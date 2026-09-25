package com.hopchenko.parkpass.core

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

/**
 * Hex-grid map of Sweden (shared/map.json). Every hexagon is congruent and
 * stored as its top-left anchor vertex — see docs/specs/data.md.
 */
@Serializable
data class MapData(
    val viewBox: ViewBox,
    val land: List<List<Double>>,
    val parks: List<ParkHex>,
) {
    @Serializable
    data class ViewBox(val width: Double, val height: Double)

    @Serializable
    data class ParkHex(val slug: String, val x: Double, val y: Double)

    companion object {
        private val json = Json { ignoreUnknownKeys = true }

        fun parse(text: String): MapData = json.decodeFromString(text)

        /** Corner offsets from a hex's anchor vertex, in drawing order. */
        val HEX_CORNERS: List<Pair<Double, Double>> = listOf(
            0.0 to 0.0,
            0.0 to 12.45,
            10.78 to 18.68,
            21.56 to 12.45,
            21.56 to 0.0,
            10.78 to -6.22,
        )

        /** Offset from the anchor vertex to the hex centre. */
        const val CENTER_DX = 10.78
        const val CENTER_DY = 6.23

        /** Centre-to-corner distance, used as the tap radius. */
        const val CIRCUMRADIUS = 12.45
    }
}
