package com.hopchenko.parkpass.ui.components

import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.graphics.vector.PathParser
import androidx.compose.ui.unit.dp
import com.hopchenko.parkpass.ui.theme.ParkPassColors

/** Lucide stroke icons, from the same path data the web app uses. */
object ParkIcons {
    private fun lucide(name: String, pathData: String, strokeWidth: Float = 2.4f): ImageVector =
        ImageVector.Builder(name, 24.dp, 24.dp, 24f, 24f).apply {
            addPath(
                pathData = PathParser().parsePathString(pathData).toNodes(),
                fill = null,
                // Tinted by Icon(tint = …); the colour here is only a mask.
                stroke = SolidColor(ParkPassColors.Ink),
                strokeLineWidth = strokeWidth,
                strokeLineCap = StrokeCap.Round,
                strokeLineJoin = StrokeJoin.Round,
            )
        }.build()

    val Parks = lucide(
        "parks",
        "M17 14l3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z M12 22v-3",
    )
    val Map = lucide(
        "map",
        "M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0l4.212 2.106Z M15 5.764v15 M9 3.236v15",
    )
    val Board = lucide("board", "M12 14a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z M15.5 12.9 17 22l-5-3-5 3 1.5-9.1")
    val You = lucide("you", "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z")
    val Check = lucide("check", "M20 6 9 17l-5-5", strokeWidth = 3f)
    val CheckBold = lucide("check-bold", "M20 6 9 17l-5-5", strokeWidth = 2.75f)
    val Back = lucide("back", "m15 18-6-6 6-6", strokeWidth = 2.75f)
}
