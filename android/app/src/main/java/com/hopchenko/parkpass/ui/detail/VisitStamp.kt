package com.hopchenko.parkpass.ui.detail

import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF
import android.graphics.Typeface
import android.os.Build
import androidx.compose.foundation.Canvas
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.core.content.res.ResourcesCompat
import com.hopchenko.parkpass.R
import com.hopchenko.parkpass.core.Lang
import com.hopchenko.parkpass.data.formatStampDate
import com.hopchenko.parkpass.ui.theme.ParkPassColors

/**
 * The rubber-stamp mark for a visited park, drawn on the web version's
 * 120-unit grid (VisitStamp.tsx). Rotation, opacity and the press animation
 * are applied by the caller.
 */
@Composable
fun VisitStamp(iso: String, lang: Lang, modifier: Modifier = Modifier) {
    val context = LocalContext.current
    val visited = stringResource(R.string.detail_stampVisited)
    val date = formatStampDate(iso, lang)
    val label = stringResource(R.string.detail_stampAlt, date)
    val ink = ParkPassColors.Sage700

    val base = remember { ResourcesCompat.getFont(context, R.font.figtree) ?: Typeface.DEFAULT }
    fun weighted(weight: Int): Typeface =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) Typeface.create(base, weight, false)
        else Typeface.create(base, if (weight >= 600) Typeface.BOLD else Typeface.NORMAL)
    val bold = remember(base) { weighted(700) }
    val extraBold = remember(base) { weighted(800) }

    Canvas(modifier.semantics { contentDescription = label }) {
        val k = size.minDimension / 120f
        drawCircle(ink, radius = 56f * k, style = Stroke(width = 2.6f * k))
        drawCircle(ink, radius = 44f * k, style = Stroke(width = 1f * k))

        drawIntoCanvas { canvas ->
            val c = canvas.nativeCanvas
            fun paint(typeface: Typeface, sizeUnits: Float, spacingUnits: Float) = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                color = ink.toArgb()
                this.typeface = typeface
                textSize = sizeUnits * k
                // SVG letter-spacing is absolute; Paint wants ems.
                letterSpacing = spacingUnits / sizeUnits
            }

            // "PARKPASS" along the top arc: M 12,60 A 48,48 0 0 1 108,60.
            val arcPaint = paint(bold, 9.5f, 2.6f)
            val arc = Path().apply {
                addArc(RectF(12f * k, 12f * k, 108f * k, 108f * k), 180f, 180f)
            }
            val arcLength = (Math.PI * 48f * k).toFloat()
            val word = "PARKPASS"
            c.drawTextOnPath(word, arc, (arcLength - arcPaint.measureText(word)) / 2f, 0f, arcPaint)

            fun centred(text: String, y: Float, p: Paint) {
                c.drawText(text, 60f * k - p.measureText(text) / 2f, y * k, p)
            }
            centred(visited, 55f, paint(extraBold, 13f, 2.2f))
            centred(date, 71f, paint(bold, 10.5f, 0.8f))
            centred("★★★", 86f, paint(base, 9f, 3f))
        }
    }
}
