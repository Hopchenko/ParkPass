package com.hopchenko.parkpass.ui.detail

import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.foundation.Canvas
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.roundToInt
import kotlin.math.sin

private val COLORS = listOf(
    Color(0xFFC67139), Color(0xFF7A8A5E), Color(0xFFF6A06B),
    Color(0xFFAEBF92), Color(0xFF8C491A), Color(0xFFE1EECC),
)

/** CSS `ease-out`. */
private val EaseOut = CubicBezierEasing(0f, 0f, 0.58f, 1f)

private class Dot(i: Int) {
    val size = 6f + (i % 4) * 2f
    val round = i % 2 == 1
    val color = COLORS[i % 6]
    private val angle = i / 16.0 * PI * 2 + (i % 3) * 0.21
    private val dist = 78 + (i % 5) * 14
    val dx = (cos(angle) * dist).roundToInt().toFloat()
    val dy = (sin(angle) * dist - 24).roundToInt().toFloat()
    val duration = 0.65f + (i % 4) * 0.09f
    val delay = (i % 5) * 0.03f
}

/** 16 particles, laid out exactly as ConfettiBurst.tsx — docs/specs/park-detail.md. */
private val DOTS = List(16) { Dot(it) }

/** Total run time in seconds, longest dot included. */
const val CONFETTI_SECONDS = 1.05f

/**
 * Confetti radiating from 45% down the pin area. [elapsed] is seconds since
 * the burst started; before its delay each dot sits at the origin, as CSS
 * `animation-fill-mode: both` does.
 */
@Composable
fun Confetti(elapsed: Float, modifier: Modifier = Modifier) {
    Canvas(modifier) {
        val origin = Offset(size.width / 2f, size.height * 0.45f)
        for (d in DOTS) {
            val local = ((elapsed - d.delay) / d.duration).coerceIn(0f, 1f)
            val e = EaseOut.transform(local)
            val scale = 1f - 0.85f * e
            val alpha = 1f - e
            if (alpha <= 0f) continue
            val side = d.size.dp.toPx() * scale
            val center = origin + Offset(d.dx.dp.toPx() * e, d.dy.dp.toPx() * e)
            val topLeft = center - Offset(side / 2f, side / 2f)
            if (d.round) {
                drawCircle(d.color, radius = side / 2f, center = center, alpha = alpha)
            } else {
                drawRoundRect(
                    d.color,
                    topLeft = topLeft,
                    size = Size(side, side),
                    cornerRadius = CornerRadius(3.dp.toPx() * scale),
                    alpha = alpha,
                )
            }
        }
    }
}
