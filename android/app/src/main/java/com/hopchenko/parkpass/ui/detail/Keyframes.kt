package com.hopchenko.parkpass.ui.detail

import androidx.compose.animation.core.Easing
import androidx.compose.ui.util.lerp

/**
 * CSS-style keyframes: [stops] are (offset 0..1, value) pairs, and — as in
 * CSS — the easing applies to each segment between stops, not to the whole
 * run. Lets the web app's @keyframes (globals.css) port over number for number.
 */
internal class Keyframes(private val easing: Easing, vararg stops: Pair<Float, Float>) {
    private val stops = stops.toList()

    fun at(t: Float): Float {
        if (t <= stops.first().first) return stops.first().second
        if (t >= stops.last().first) return stops.last().second
        val i = stops.indexOfLast { it.first <= t }
        val (t0, v0) = stops[i]
        val (t1, v1) = stops[i + 1]
        return lerp(v0, v1, easing.transform((t - t0) / (t1 - t0)))
    }
}
