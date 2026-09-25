package com.hopchenko.parkpass.core

import org.junit.Assert.assertEquals
import org.junit.Test

class VisitsTest {
    @Test
    fun mergeIsAUnionWhereTheEarlierVisitWins() {
        val current = mapOf("abisko" to "2025-07-01", "sarek" to "2024-08-01")
        val incoming = mapOf("abisko" to "2024-06-01", "sarek" to "2025-01-01", "tyresta" to "2023-05-05")
        val result = Visits.merge(current, incoming)
        assertEquals(
            mapOf("abisko" to "2024-06-01", "sarek" to "2024-08-01", "tyresta" to "2023-05-05"),
            result.visits,
        )
        assertEquals(1, result.added)
        assertEquals(1, result.updated)
    }

    @Test
    fun mergingTheSameBoardChangesNothing() {
        val board = mapOf("abisko" to "2025-07-01")
        val result = Visits.merge(board, board)
        assertEquals(false, result.changed)
    }

    @Test
    fun jsonRoundTripsAndToleratesGarbage() {
        val board = mapOf("abisko" to "2025-07-01", "bla-jungfrun" to "2020-01-02")
        assertEquals(board, Visits.fromJson(Visits.toJson(board)))
        assertEquals(emptyMap<String, String>(), Visits.fromJson("{not json"))
        assertEquals(emptyMap<String, String>(), Visits.fromJson("[1,2]"))
        assertEquals(mapOf("a" to "2020-01-02"), Visits.fromJson("""{"a":"2020-01-02","b":5}"""))
    }
}
