package com.hopchenko.parkpass.core

import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.contentOrNull

/** slug → ISO date (yyyy-mm-dd) of the visit. See docs/specs/storage.md. */
typealias VisitedMap = Map<String, String>

data class MergeResult(val visits: VisitedMap, val added: Int, val updated: Int) {
    val changed: Boolean get() = added > 0 || updated > 0
}

object Visits {
    /**
     * Union, never a replacement — importing a transfer code must not be able
     * to destroy pins this device already has. On a collision the earlier
     * visit wins, since that is the one that actually happened first (ISO
     * yyyy-mm-dd sorts chronologically as a plain string).
     */
    fun merge(current: VisitedMap, incoming: VisitedMap): MergeResult {
        val next = current.toMutableMap()
        var added = 0
        var updated = 0
        for ((slug, date) in incoming) {
            val existing = next[slug]
            if (existing == null) {
                next[slug] = date
                added++
            } else if (date < existing) {
                next[slug] = date
                updated++
            }
        }
        return MergeResult(next, added, updated)
    }

    /** Same JSON object the web app keeps in localStorage. */
    fun toJson(visits: VisitedMap): String =
        JsonObject(visits.mapValues { JsonPrimitive(it.value) }).toString()

    /** Corrupt or non-object values read as an empty board — never throws. */
    fun fromJson(text: String?): VisitedMap {
        if (text.isNullOrBlank()) return emptyMap()
        return try {
            val obj = Json.parseToJsonElement(text) as? JsonObject ?: return emptyMap()
            buildMap {
                for ((slug, value) in obj) {
                    val date = (value as? JsonPrimitive)?.takeIf { it.isString }?.contentOrNull
                    if (date != null) put(slug, date)
                }
            }
        } catch (_: Exception) {
            emptyMap()
        }
    }
}
