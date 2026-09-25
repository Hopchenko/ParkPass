package com.hopchenko.parkpass.core

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

/** The two UI languages. Swedish is the default — see docs/specs/i18n.md. */
enum class Lang(val tag: String) {
    SV("sv"),
    EN("en"),
}

@Serializable
data class Localized(val sv: String, val en: String) {
    operator fun get(lang: Lang): String = when (lang) {
        Lang.SV -> sv
        Lang.EN -> en
    }
}

/** Placeholder pin glyph, drawn when a park has no artwork yet. */
@Serializable
enum class Glyph {
    @SerialName("mtn") MTN,
    @SerialName("pine") PINE,
    @SerialName("wave") WAVE,
    @SerialName("leaf") LEAF,
    @SerialName("sun") SUN,
}

/** One national park, as exported to shared/parks.json from parks.ts. */
@Serializable
data class Park(
    val slug: String,
    val name: String,
    val sami: String? = null,
    val year: Int,
    /** Area in km². */
    val area: Double,
    val glyph: Glyph,
    /** Index into the placeholder palette, mod 6. */
    val color: Int,
    val region: Localized,
    val description: Localized,
    val officialUrl: Localized,
    val hasArtwork: Boolean,
)

@Serializable
private data class ParksFile(val parks: List<Park>)

object ParkData {
    private val json = Json { ignoreUnknownKeys = true }

    /** Parses shared/parks.json. Order is display order. */
    fun parse(text: String): List<Park> = json.decodeFromString<ParksFile>(text).parks
}
