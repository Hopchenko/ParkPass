package com.hopchenko.parkpass.data

import android.content.Context
import com.hopchenko.parkpass.core.MergeResult
import com.hopchenko.parkpass.core.VisitedMap
import com.hopchenko.parkpass.core.Visits
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.time.LocalDate

/**
 * The pin board: slug → visit date, persisted in SharedPreferences as the
 * same JSON object the web app keeps in localStorage. The prefs file is
 * covered by Auto Backup (res/xml/*_rules.xml). See docs/specs/storage.md.
 */
class VisitStore(context: Context) {
    private val prefs = context.applicationContext.getSharedPreferences(PREFS_FILE, Context.MODE_PRIVATE)

    private val state = MutableStateFlow(Visits.fromJson(prefs.getString(KEY, null)))
    val visits: StateFlow<VisitedMap> = state.asStateFlow()

    /** Pins a park with today's *local* date — not UTC, or a pin made after
     *  midnight Swedish time would be stamped yesterday. */
    fun mark(slug: String) = write(state.value + (slug to LocalDate.now().toString()))

    fun unmark(slug: String) = write(state.value - slug)

    /** Transfer-code import: a union where the earlier visit wins. */
    fun merge(incoming: VisitedMap): MergeResult {
        val result = Visits.merge(state.value, incoming)
        if (result.changed) write(result.visits)
        return result
    }

    @Synchronized
    private fun write(next: VisitedMap) {
        state.value = next
        prefs.edit().putString(KEY, Visits.toJson(next)).apply()
    }

    private companion object {
        const val PREFS_FILE = "parkpass"
        const val KEY = "parkpass-visited"
    }
}
