package com.hopchenko.parkpass.ui.components

import android.graphics.BlurMaskFilter
import androidx.compose.foundation.Canvas
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.graphics.ColorMatrix
import androidx.compose.ui.graphics.CompositingStrategy
import androidx.compose.ui.graphics.FilterQuality
import androidx.compose.ui.graphics.Paint
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.asAndroidPath
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.clipPath
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.graphics.drawscope.scale
import androidx.compose.ui.graphics.drawscope.translate
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.graphics.vector.PathParser
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.IntSize
import com.hopchenko.parkpass.LocalParkRepository
import com.hopchenko.parkpass.core.Glyph
import com.hopchenko.parkpass.core.Park
import com.hopchenko.parkpass.data.ParkRepository
import com.hopchenko.parkpass.data.rememberAssetImage
import com.hopchenko.parkpass.ui.theme.ParkPassColors
import kotlin.math.cos
import kotlin.math.roundToInt
import kotlin.math.sin

/** How a badge is shown — docs/specs/design-system.md#pin-badge. */
data class PinLook(
    /** 1 = full colour, 0 = greyscale. */
    val saturation: Float = 1f,
    val alpha: Float = 1f,
    val brightness: Float = 1f,
    val dropShadow: Boolean = false,
) {
    companion object {
        val Full = PinLook()
        val ListUnpinned = PinLook(saturation = 0f, alpha = 0.38f)
        val DetailUnpinned = PinLook(saturation = 0.15f, alpha = 0.5f)
        val BoardPinned = PinLook(dropShadow = true)
        val BoardUnpinned = PinLook(saturation = 0f, alpha = 0.32f, brightness = 1.25f)
    }
}

private const val RIM_R = 30f
private const val ENAMEL_R = 26f

/** Pointy-top hexagon centred at (32,32) on the 64-unit badge grid, scaled by [px]. */
private fun hexPath(radius: Float, px: Float): Path = Path().apply {
    for (i in 0 until 6) {
        val angle = Math.toRadians((60.0 * i) - 90.0)
        val x = (32f + radius * cos(angle).toFloat()) * px
        val y = (32f + radius * sin(angle).toFloat()) * px
        if (i == 0) moveTo(x, y) else lineTo(x, y)
    }
    close()
}

private val GLYPH_PATHS: Map<Glyph, String> = mapOf(
    Glyph.MTN to "m8 3 4 8 5-5 5 15H2L8 3z",
    Glyph.PINE to "M17 14l3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z M12 22v-3",
    Glyph.WAVE to "M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
    Glyph.LEAF to "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12",
    Glyph.SUN to "M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M12 2v2 M12 20v2 M4.93 4.93l1.41 1.41 M17.66 17.66l1.41 1.41 M2 12h2 M20 12h2 M6.34 17.66l-1.41 1.41 M19.07 4.93l-1.41 1.41",
)

private fun lookFilter(look: PinLook): ColorFilter? {
    if (look.saturation >= 1f && look.brightness == 1f) return null
    val matrix = ColorMatrix().apply { setToSaturation(look.saturation) }
    if (look.brightness != 1f) {
        val b = look.brightness
        matrix.timesAssign(ColorMatrix(floatArrayOf(b, 0f, 0f, 0f, 0f, 0f, b, 0f, 0f, 0f, 0f, 0f, b, 0f, 0f, 0f, 0f, 0f, 1f, 0f)))
    }
    return ColorFilter.colorMatrix(matrix)
}

/**
 * The enamel pin: a brushed-gold hexagonal rim around the park's artwork
 * (or a placeholder glyph). Drawn on a 64-unit grid scaled to the slot.
 */
@Composable
fun PinBadge(
    park: Park,
    modifier: Modifier = Modifier,
    look: PinLook = PinLook.Full,
    strokeWidth: Float = 2.5f,
    repository: ParkRepository = LocalParkRepository.current,
) {
    val artwork = rememberAssetImage(
        repository,
        if (park.hasArtwork) ParkRepository.artworkPath(park.slug) else null,
    ).value
    val filter = remember(look) { lookFilter(look) }
    val glyph = remember(park.glyph) { PathParser().parsePathString(GLYPH_PATHS.getValue(park.glyph)).toPath() }
    val palette = ParkPassColors.PinPalette[park.color.mod(ParkPassColors.PinPalette.size)]

    Canvas(
        modifier.graphicsLayer {
            alpha = look.alpha
            // Fade the badge as one flat image, as CSS opacity does.
            compositingStrategy = CompositingStrategy.Offscreen
        },
    ) {
        val px = size.minDimension / 64f
        val rim = hexPath(RIM_R, px)
        val enamel = hexPath(ENAMEL_R, px)

        if (look.dropShadow) {
            drawIntoCanvas { canvas ->
                val paint = Paint().asFrameworkPaint().apply {
                    isAntiAlias = true
                    color = android.graphics.Color.argb(102, 0, 0, 0)
                    maskFilter = BlurMaskFilter(3f * px * 0.66f, BlurMaskFilter.Blur.NORMAL)
                }
                canvas.nativeCanvas.save()
                canvas.nativeCanvas.translate(0f, 3f * px * 0.66f)
                canvas.nativeCanvas.drawPath(rim.asAndroidPath(), paint)
                canvas.nativeCanvas.restore()
            }
        }

        drawPath(
            rim,
            brush = Brush.linearGradient(
                0f to ParkPassColors.Gold100,
                0.28f to ParkPassColors.Gold300,
                0.55f to ParkPassColors.Gold500,
                0.80f to ParkPassColors.Gold600,
                1f to ParkPassColors.Gold800,
                start = Offset(2f * px, 2f * px),
                end = Offset(62f * px, 62f * px),
            ),
            colorFilter = filter,
        )

        if (artwork != null) {
            // Cover-fit the square artwork to the enamel hexagon's bounding box.
            val side = 2f * ENAMEL_R * px
            val left = ((32f * px) - side / 2f).roundToInt()
            val top = ((32f - ENAMEL_R) * px).roundToInt()
            clipPath(enamel) {
                drawImage(
                    artwork,
                    srcOffset = IntOffset.Zero,
                    srcSize = IntSize(artwork.width, artwork.height),
                    dstOffset = IntOffset(left, top),
                    dstSize = IntSize(side.roundToInt(), side.roundToInt()),
                    filterQuality = FilterQuality.High,
                    colorFilter = filter,
                )
            }
        } else {
            drawPath(enamel, color = palette.second, colorFilter = filter)
            translate(17.5f * px, 17.5f * px) {
                scale(1.2f * px, pivot = Offset.Zero) {
                    drawPath(
                        glyph,
                        color = palette.third,
                        style = Stroke(width = strokeWidth, cap = StrokeCap.Round, join = StrokeJoin.Round),
                        colorFilter = filter,
                    )
                }
            }
        }

        drawPath(enamel, color = ParkPassColors.Gold700, style = Stroke(width = 0.7f * px), colorFilter = filter)
    }
}

